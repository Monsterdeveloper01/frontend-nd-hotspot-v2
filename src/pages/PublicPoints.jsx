import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import PublicLayout from '../components/PublicLayout'

const API = import.meta.env.VITE_API_URL

const formatRupiah = (val) => {
    if (val === null || val === undefined) return '0'
    return Number(val).toLocaleString('id-ID')
}

export default function PublicPoints() {
    // Session state
    const [phone, setPhone] = useState('')
    const [normalizedPhone, setNormalizedPhone] = useState('')
    const [pin, setPin] = useState('')
    const [accountData, setAccountData] = useState(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    // UI View: 'enter_phone' | 'enter_pin' | 'setup_pin' | 'dashboard'
    const [view, setView] = useState('enter_phone')
    const [activeTab, setActiveTab] = useState('redeem') // 'redeem' | 'topup'

    // Loading & Error states
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    // Setup / Reset PIN states
    const [otpCode, setOtpCode] = useState('')
    const [newPin, setNewPin] = useState('')
    const [confirmPin, setConfirmPin] = useState('')
    const [otpSent, setOtpSent] = useState(false)
    const [otpCooldown, setOtpCooldown] = useState(0)

    // Voucher Plans & Top-up Packages
    const [voucherPlans, setVoucherPlans] = useState([])
    const [topupPackages, setTopupPackages] = useState([])
    const [redeemSuccess, setRedeemSuccess] = useState(null)
    const [copied, setCopied] = useState(false)

    // QRIS Modal for Top-Up
    const [qrisData, setQrisData] = useState(null)
    const [pollingInterval, setPollingInterval] = useState(null)

    // Countdown for OTP
    useEffect(() => {
        if (otpCooldown <= 0) return
        const timer = setInterval(() => setOtpCooldown((prev) => Math.max(0, prev - 1)), 1000)
        return () => clearInterval(timer)
    }, [otpCooldown])

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingInterval) clearInterval(pollingInterval)
        }
    }, [pollingInterval])

    // Fetch Voucher Plans & Packages once logged in
    useEffect(() => {
        if (!isLoggedIn) return
        fetchPlansAndPackages()
    }, [isLoggedIn])

    const fetchPlansAndPackages = async () => {
        try {
            const [plansRes, pkgRes] = await Promise.all([
                axios.get(`${API}/voucher-plans`),
                axios.get(`${API}/points/packages`),
            ])
            setVoucherPlans(plansRes.data || [])
            setTopupPackages(pkgRes.data?.packages || [])
        } catch (err) {
            console.error('Error fetching data:', err)
        }
    }

    // Normalizing phone input
    const cleanPhone = (val) => {
        let p = val.replace(/\D/g, '')
        if (p.startsWith('0')) p = '62' + p.slice(1)
        else if (p.startsWith('8')) p = '628' + p.slice(1)
        else if (!p.startsWith('62') && p.length > 0) p = '62' + p
        return p
    }

    // Step 1: Check Account Status
    const handleCheckAccount = async (e) => {
        e.preventDefault()
        setError('')
        setSuccessMsg('')
        const norm = cleanPhone(phone)
        if (norm.length < 10) {
            setError('Nomor WhatsApp minimal 10 digit angka.')
            return
        }

        setLoading(true)
        try {
            const res = await axios.post(`${API}/points/account/status`, { phone: norm })
            setNormalizedPhone(norm)
            setAccountData(res.data)

            if (!res.data.has_pin) {
                setView('setup_pin')
                setOtpSent(false)
            } else {
                setView('enter_pin')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal memeriksa status nomor WhatsApp.')
        } finally {
            setLoading(false)
        }
    }

    // Step 2: Verify PIN
    const handleVerifyPin = async (e) => {
        e.preventDefault()
        setError('')
        if (!/^[0-9]{6}$/.test(pin)) {
            setError('PIN harus terdiri dari tepat 6 angka.')
            return
        }

        setLoading(true)
        try {
            const res = await axios.post(`${API}/points/pin/verify`, {
                phone: normalizedPhone,
                pin: pin,
            })

            if (res.data.success) {
                setIsLoggedIn(true)
                setView('dashboard')
                // Refresh latest balance
                const stat = await axios.post(`${API}/points/account/status`, { phone: normalizedPhone })
                setAccountData(stat.data)
            }
        } catch (err) {
            setError(err.response?.data?.message || 'PIN salah. Silakan coba lagi.')
        } finally {
            setLoading(false)
        }
    }

    // Step 3: Request OTP for Setup/Reset PIN
    const handleSendOtp = async (action = 'setup_pin') => {
        if (otpCooldown > 0) return
        setError('')
        setSuccessMsg('')
        setLoading(true)
        try {
            const res = await axios.post(`${API}/points/otp/send`, {
                phone: normalizedPhone,
                action: action,
            })
            if (res.data.success) {
                setOtpSent(true)
                setOtpCooldown(60)
                setSuccessMsg('Kode OTP 4-digit berhasil dikirim ke WhatsApp Anda.')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengirim kode OTP.')
        } finally {
            setLoading(false)
        }
    }

    // Step 4: Submit Setup PIN
    const handleSaveNewPin = async (e) => {
        e.preventDefault()
        setError('')
        setSuccessMsg('')

        if (!otpCode || otpCode.length < 4) {
            setError('Masukkan 4-digit kode OTP dari WhatsApp.')
            return
        }
        if (!/^[0-9]{6}$/.test(newPin)) {
            setError('PIN baru harus tepat 6 angka numerik.')
            return
        }
        if (newPin !== confirmPin) {
            setError('Konfirmasi PIN tidak cocok.')
            return
        }

        setLoading(true)
        try {
            const res = await axios.post(`${API}/points/pin/setup`, {
                phone: normalizedPhone,
                otp: otpCode,
                pin: newPin,
                action: 'setup_pin',
            })

            if (res.data.success) {
                setPin(newPin)
                setIsLoggedIn(true)
                setView('dashboard')
                const stat = await axios.post(`${API}/points/account/status`, { phone: normalizedPhone })
                setAccountData(stat.data)
                setSuccessMsg('PIN keamanan berhasil disimpan!')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan PIN baru.')
        } finally {
            setLoading(false)
        }
    }

    // Action: Redeem Voucher with Points (1-Click)
    const handleRedeemVoucher = async (plan) => {
        setError('')
        setRedeemSuccess(null)
        const price = Number(plan.price)

        if ((accountData?.balance || 0) < price) {
            setError(`Saldo poin Anda (${formatRupiah(accountData?.balance)} Pts) tidak mencukupi untuk paket ini (${formatRupiah(price)} Pts).`)
            return
        }

        if (!window.confirm(`Yakin ingin menukar ${formatRupiah(price)} Poin dengan Paket "${plan.name}"?`)) {
            return
        }

        setLoading(true)
        try {
            const res = await axios.post(`${API}/points/redeem`, {
                phone: normalizedPhone,
                pin: pin,
                voucher_plan_id: plan.id,
            })

            if (res.data.success) {
                setRedeemSuccess(res.data.data)
                // Update local balance immediately
                setAccountData((prev) => ({
                    ...prev,
                    balance: res.data.data.balance_remaining,
                }))
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menukar voucher. Silakan periksa PIN Anda.')
        } finally {
            setLoading(false)
        }
    }

    // Action: Top-Up Charge (QRIS)
    const handleTopupCharge = async (pkg) => {
        setError('')
        setLoading(true)
        try {
            const res = await axios.post(`${API}/points/topup/charge`, {
                phone: normalizedPhone,
                pin: pin,
                package_id: pkg.id,
            })

            if (res.data.success) {
                setQrisData(res.data)
                startPollingPayment(res.data.transaction_id, res.data.package.total_points)
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal membuat QRIS Top-Up.')
        } finally {
            setLoading(false)
        }
    }

    // Polling for QRIS Payment
    const startPollingPayment = (txId, pointsAdded) => {
        if (pollingInterval) clearInterval(pollingInterval)

        const interval = setInterval(async () => {
            try {
                const res = await axios.get(`${API}/transactions/${txId}`)
                if (res.data?.status === 'success') {
                    clearInterval(interval)
                    setPollingInterval(null)
                    setQrisData(null)
                    setSuccessMsg(`🎉 Top-Up Berhasil! +${formatRupiah(pointsAdded)} Poin telah ditambahkan ke akun Anda.`)

                    // Refresh latest balance
                    const stat = await axios.post(`${API}/points/account/status`, { phone: normalizedPhone })
                    setAccountData(stat.data)
                } else if (res.data?.status === 'expire' || res.data?.status === 'cancel') {
                    clearInterval(interval)
                    setPollingInterval(null)
                    setQrisData(null)
                    setError('Pembayaran QRIS telah kedaluwarsa atau dibatalkan.')
                }
            } catch (err) {
                console.error('Polling payment error:', err)
            }
        }, 3000)

        setPollingInterval(interval)
    }

    const handleCopyVoucher = (code) => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleLogout = () => {
        setIsLoggedIn(false)
        setView('enter_phone')
        setPin('')
        setAccountData(null)
        setRedeemSuccess(null)
        if (pollingInterval) clearInterval(pollingInterval)
    }

    return (
        <PublicLayout>
            <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '3rem 1rem 5rem' }}>
                <div style={{ maxWidth: '38rem', margin: '0 auto' }}>

                    {/* Header Banner */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '18px',
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)',
                            marginBottom: '1rem', color: '#fff', fontSize: '1.6rem',
                        }}>
                            <i className="fas fa-coins" />
                        </div>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em', margin: 0 }}>
                            ND-<span style={{ color: '#f59e0b' }}>Points</span> Portal
                        </h1>
                        <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.82rem', marginTop: '0.35rem' }}>
                            Sistem Loyalty & Closed-Loop Credit Khusus ND-Hotspot
                        </p>
                    </div>

                    {/* Notification Alerts */}
                    {error && (
                        <div style={{
                            background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b',
                            padding: '0.85rem 1rem', borderRadius: '14px', fontSize: '0.82rem',
                            marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        }}>
                            <i className="fas fa-exclamation-triangle" />
                            <span>{error}</span>
                        </div>
                    )}

                    {successMsg && (
                        <div style={{
                            background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46',
                            padding: '0.85rem 1rem', borderRadius: '14px', fontSize: '0.82rem',
                            marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        }}>
                            <i className="fas fa-check-circle" />
                            <span>{successMsg}</span>
                        </div>
                    )}

                    {/* VIEW 1: ENTER PHONE NUMBER */}
                    {view === 'enter_phone' && (
                        <div className="card-nd-elevated" style={{ padding: '1.75rem', background: '#fff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.4rem' }}>
                                    Masuk ke Akun Koin Anda
                                </h2>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                                    Masukkan nomor WhatsApp yang terdaftar untuk memeriksa atau mengisi koin.
                                </p>
                            </div>

                            <form onSubmit={handleCheckAccount}>
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                                        Nomor WhatsApp
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '0 0.85rem' }}>
                                        <i className="fab fa-whatsapp" style={{ color: '#00a884', fontSize: '1.2rem', marginRight: '0.6rem' }} />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="Contoh: 08123456789"
                                            required
                                            style={{ width: '100%', padding: '0.85rem 0', background: 'transparent', border: 'none', outline: 'none', fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%', padding: '0.9rem',
                                        background: 'linear-gradient(135deg, #00a884, #00c298)',
                                        color: '#fff', fontWeight: 800, fontSize: '0.9rem',
                                        borderRadius: '9999px', border: 'none', cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(0, 168, 132, 0.3)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    }}
                                >
                                    {loading ? <i className="fas fa-spinner fa-spin" /> : <><span>Lanjut</span> <i className="fas fa-arrow-right" /></>}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* VIEW 2: ENTER PIN */}
                    {view === 'enter_pin' && (
                        <div className="card-nd-elevated" style={{ padding: '1.75rem', background: '#fff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '16px', background: '#ecfdf5',
                                    color: '#00a884', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.3rem', marginBottom: '0.75rem',
                                }}>
                                    <i className="fas fa-shield-alt" />
                                </div>
                                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.3rem' }}>
                                    Masukkan 6-Digit PIN
                                </h2>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                                    Nomor: <strong style={{ color: '#1e293b' }}>+{normalizedPhone}</strong>
                                </p>
                            </div>

                            <form onSubmit={handleVerifyPin}>
                                <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                                    <input
                                        type="password"
                                        maxLength={6}
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                        placeholder="• • • • • •"
                                        autoFocus
                                        required
                                        style={{
                                            letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.75rem',
                                            fontWeight: 900, width: '100%', padding: '0.75rem 0',
                                            border: '2px solid #e2e8f0', borderRadius: '16px', outline: 'none',
                                            color: '#1e293b', background: '#f8fafc',
                                        }}
                                    />
                                    <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                                        <button
                                            type="button"
                                            onClick={() => setView('enter_phone')}
                                            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 600 }}
                                        >
                                            <i className="fas fa-arrow-left" /> Ganti Nomor
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setView('setup_pin'); setOtpSent(false); }}
                                            style={{ background: 'none', border: 'none', color: '#00a884', cursor: 'pointer', fontWeight: 700 }}
                                        >
                                            Lupa PIN? Reset via WA
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || pin.length !== 6}
                                    style={{
                                        width: '100%', padding: '0.9rem',
                                        background: pin.length === 6 ? 'linear-gradient(135deg, #00a884, #00c298)' : '#e2e8f0',
                                        color: pin.length === 6 ? '#fff' : '#94a3b8',
                                        fontWeight: 800, fontSize: '0.9rem',
                                        borderRadius: '9999px', border: 'none', cursor: pin.length === 6 ? 'pointer' : 'not-allowed',
                                        boxShadow: pin.length === 6 ? '0 4px 15px rgba(0, 168, 132, 0.3)' : 'none',
                                    }}
                                >
                                    {loading ? <i className="fas fa-spinner fa-spin" /> : 'Buka Akun ND-Points'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* VIEW 3: SETUP / RESET PIN VIA WHATSAPP OTP */}
                    {view === 'setup_pin' && (
                        <div className="card-nd-elevated" style={{ padding: '1.75rem', background: '#fff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '16px', background: '#fef3c7',
                                    color: '#d97706', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.3rem', marginBottom: '0.75rem',
                                }}>
                                    <i className="fas fa-key" />
                                </div>
                                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.3rem' }}>
                                    {accountData?.has_pin ? 'Atur Ulang PIN Keamanan' : 'Buat PIN Keamanan Baru'}
                                </h2>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                                    Untuk nomor <strong style={{ color: '#1e293b' }}>+{normalizedPhone}</strong>
                                </p>
                            </div>

                            {!otpSent ? (
                                <div>
                                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
                                        <p style={{ margin: 0 }}>
                                            Kami akan mengirimkan <strong>kode verifikasi 4-digit</strong> ke WhatsApp Anda untuk memastikan kepemilikan nomor ini sebelum membuat PIN.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleSendOtp('setup_pin')}
                                        disabled={loading || otpCooldown > 0}
                                        style={{
                                            width: '100%', padding: '0.9rem',
                                            background: 'linear-gradient(135deg, #00a884, #00c298)',
                                            color: '#fff', fontWeight: 800, fontSize: '0.9rem',
                                            borderRadius: '9999px', border: 'none', cursor: 'pointer',
                                            boxShadow: '0 4px 15px rgba(0, 168, 132, 0.3)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        }}
                                    >
                                        <i className="fab fa-whatsapp" style={{ fontSize: '1.1rem' }} />
                                        <span>{otpCooldown > 0 ? `Tunggu ${otpCooldown} detik` : 'Kirim Kode OTP via WhatsApp'}</span>
                                    </button>

                                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                        <button
                                            type="button"
                                            onClick={() => setView('enter_phone')}
                                            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                                        >
                                            <i className="fas fa-arrow-left" /> Kembali
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSaveNewPin}>
                                    {/* OTP Input */}
                                    <div style={{ marginBottom: '1.25rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                                            Kode OTP (4-Digit dari WhatsApp)
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={4}
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                            placeholder="1234"
                                            required
                                            style={{
                                                letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.3rem',
                                                fontWeight: 800, width: '100%', padding: '0.75rem',
                                                border: '1px solid #e2e8f0', borderRadius: '14px', outline: 'none',
                                                background: '#f8fafc', color: '#1e293b',
                                            }}
                                        />
                                        <div style={{ marginTop: '0.4rem', textAlign: 'right' }}>
                                            <button
                                                type="button"
                                                onClick={() => handleSendOtp('setup_pin')}
                                                disabled={otpCooldown > 0}
                                                style={{ background: 'none', border: 'none', color: otpCooldown > 0 ? '#94a3b8' : '#00a884', fontSize: '0.72rem', cursor: otpCooldown > 0 ? 'default' : 'pointer', fontWeight: 700 }}
                                            >
                                                {otpCooldown > 0 ? `Kirim ulang (${otpCooldown}s)` : 'Kirim Ulang OTP'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* 6-Digit PIN */}
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                                            Buat 6-Digit PIN Baru
                                        </label>
                                        <input
                                            type="password"
                                            maxLength={6}
                                            value={newPin}
                                            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                                            placeholder="• • • • • •"
                                            required
                                            style={{
                                                letterSpacing: '0.4em', textAlign: 'center', fontSize: '1.3rem',
                                                fontWeight: 800, width: '100%', padding: '0.75rem',
                                                border: '1px solid #e2e8f0', borderRadius: '14px', outline: 'none',
                                                background: '#f8fafc', color: '#1e293b',
                                            }}
                                        />
                                    </div>

                                    {/* Confirm PIN */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                                            Konfirmasi 6-Digit PIN
                                        </label>
                                        <input
                                            type="password"
                                            maxLength={6}
                                            value={confirmPin}
                                            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                                            placeholder="• • • • • •"
                                            required
                                            style={{
                                                letterSpacing: '0.4em', textAlign: 'center', fontSize: '1.3rem',
                                                fontWeight: 800, width: '100%', padding: '0.75rem',
                                                border: '1px solid #e2e8f0', borderRadius: '14px', outline: 'none',
                                                background: '#f8fafc', color: '#1e293b',
                                            }}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={{
                                            width: '100%', padding: '0.9rem',
                                            background: 'linear-gradient(135deg, #00a884, #00c298)',
                                            color: '#fff', fontWeight: 800, fontSize: '0.9rem',
                                            borderRadius: '9999px', border: 'none', cursor: 'pointer',
                                            boxShadow: '0 4px 15px rgba(0, 168, 132, 0.3)',
                                        }}
                                    >
                                        {loading ? <i className="fas fa-spinner fa-spin" /> : 'Simpan PIN & Lanjut'}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* VIEW 4: AUTHENTICATED DASHBOARD */}
                    {view === 'dashboard' && (
                        <div>
                            {/* Balance Card */}
                            <div style={{
                                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                                borderRadius: '24px', padding: '1.75rem', color: '#fff',
                                boxShadow: '0 12px 30px rgba(15, 23, 42, 0.15)',
                                marginBottom: '1.5rem', position: 'relative', overflow: 'hidden',
                            }}>
                                <div style={{ position: 'absolute', right: '-15px', top: '-15px', opacity: 0.1, fontSize: '7rem', color: '#f59e0b', pointerEvents: 'none' }}>
                                    <i className="fas fa-coins" />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Akun Terverifikasi</span>
                                        <i className="fas fa-check-circle" style={{ color: '#00a884', fontSize: '0.85rem' }} />
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#cbd5e1', padding: '0.35rem 0.75rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        <i className="fas fa-sign-out-alt" /> Keluar
                                    </button>
                                </div>

                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 0.25rem', letterSpacing: '0.02em' }}>
                                    +{normalizedPhone}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#f59e0b', letterSpacing: '-0.02em' }}>
                                        {formatRupiah(accountData?.balance || 0)}
                                    </span>
                                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#cbd5e1' }}>ND-Points</span>
                                </div>

                                <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
                                    <span>Total Diperoleh: <strong>{formatRupiah(accountData?.lifetime_earned || 0)} Pts</strong></span>
                                    <span style={{ color: '#34d399' }}><i className="fas fa-shield-alt" /> PIN Aktif</span>
                                </div>
                            </div>

                            {/* VOUCHER REDEEM SUCCESS MODAL / CARD */}
                            {redeemSuccess && (
                                <div style={{
                                    background: '#ecfdf5', border: '2px solid #10b981', borderRadius: '24px',
                                    padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center',
                                    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.15)',
                                }}>
                                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                                        <i className="fas fa-check" />
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#065f46', margin: '0 0 0.25rem' }}>
                                        Voucher Berhasil Ditukar!
                                    </h3>
                                    <p style={{ fontSize: '0.8rem', color: '#047857', margin: '0 0 1rem' }}>
                                        {redeemSuccess.plan_name} • Terpotong {formatRupiah(redeemSuccess.points_spent)} Pts
                                    </p>

                                    {/* Voucher Code Box */}
                                    <div style={{
                                        background: '#fff', border: '2px dashed #059669', borderRadius: '16px',
                                        padding: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', gap: '0.75rem',
                                    }}>
                                        <span style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '0.15em', color: '#1e293b' }}>
                                            {redeemSuccess.voucher_code}
                                        </span>
                                        <button
                                            onClick={() => handleCopyVoucher(redeemSuccess.voucher_code)}
                                            style={{
                                                background: copied ? '#059669' : '#f1f5f9', color: copied ? '#fff' : '#475569',
                                                border: 'none', padding: '0.45rem 0.85rem', borderRadius: '10px',
                                                fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                                            }}
                                        >
                                            {copied ? 'Tersalin!' : 'Salin'}
                                        </button>
                                    </div>

                                    {/* 1-Click Auto Login Button */}
                                    <a
                                        href={redeemSuccess.login_url}
                                        style={{
                                            display: 'block', width: '100%', padding: '0.85rem',
                                            background: 'linear-gradient(135deg, #00a884, #00c298)',
                                            color: '#fff', fontWeight: 800, fontSize: '0.9rem',
                                            borderRadius: '9999px', textDecoration: 'none',
                                            boxShadow: '0 4px 15px rgba(0, 168, 132, 0.3)',
                                            marginBottom: '0.75rem',
                                        }}
                                    >
                                        <i className="fas fa-sign-in-alt" /> Login Otomatis ke ND-Hotspot
                                    </a>

                                    <p style={{ fontSize: '0.72rem', color: '#065f46', margin: 0, lineHeight: 1.5 }}>
                                        💡 <em>Jika auto-login gagal, gunakan cara manual (salin kode di atas lalu login di ndnet.login) atau <a href="https://wa.me/6285129391531" target="_blank" rel="noreferrer" style={{ color: '#065f46', fontWeight: 700 }}>Kontak Admin</a></em>
                                    </p>
                                </div>
                            )}

                            {/* TABS: TUKAR VOCHER / TOP-UP */}
                            <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '9999px', padding: '4px', marginBottom: '1.25rem' }}>
                                <button
                                    onClick={() => setActiveTab('redeem')}
                                    style={{
                                        flex: 1, padding: '0.7rem', borderRadius: '9999px', border: 'none',
                                        background: activeTab === 'redeem' ? '#fff' : 'transparent',
                                        color: activeTab === 'redeem' ? '#1e293b' : '#64748b',
                                        fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer',
                                        boxShadow: activeTab === 'redeem' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    ⚡ Tukar Voucher
                                </button>
                                <button
                                    onClick={() => setActiveTab('topup')}
                                    style={{
                                        flex: 1, padding: '0.7rem', borderRadius: '9999px', border: 'none',
                                        background: activeTab === 'topup' ? '#fff' : 'transparent',
                                        color: activeTab === 'topup' ? '#1e293b' : '#64748b',
                                        fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer',
                                        boxShadow: activeTab === 'topup' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    💎 Top-Up Koin (QRIS)
                                </button>
                            </div>

                            {/* TAB 1: TUKAR VOUCHER (KESAMPING / GRID) */}
                            {activeTab === 'redeem' && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.85rem' }}>
                                    {voucherPlans.length === 0 ? (
                                        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem', padding: '2rem 0', gridColumn: '1 / -1' }}>
                                            Memuat daftar paket voucher...
                                        </p>
                                    ) : (
                                        voucherPlans.map((p) => {
                                            const price = Number(p.price)
                                            const canRedeem = (accountData?.balance || 0) >= price
                                            return (
                                                <div
                                                    key={p.id}
                                                    style={{
                                                        background: '#fff', borderRadius: '20px', padding: '1.25rem 1rem',
                                                        border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                                                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                                                        textAlign: 'center', position: 'relative',
                                                    }}
                                                >
                                                    <div>
                                                        <div style={{
                                                            width: '36px', height: '36px', borderRadius: '12px',
                                                            background: canRedeem ? '#ecfdf5' : '#f1f5f9',
                                                            color: canRedeem ? '#00a884' : '#94a3b8',
                                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '1rem', marginBottom: '0.5rem',
                                                        }}>
                                                            <i className="fas fa-wifi" />
                                                        </div>
                                                        <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>
                                                            {p.name}
                                                        </h4>
                                                        <p style={{ margin: '0 0 0.75rem', fontSize: '0.72rem', color: '#64748b', display: 'flex', justifyContent: 'center', gap: '0.6rem' }}>
                                                            <span><i className="far fa-clock" /> {p.duration}</span>
                                                            <span><i className="fas fa-tachometer-alt" /> {p.speed_limit || 'Up to 5M'}</span>
                                                        </p>
                                                    </div>

                                                    <div style={{ borderTop: '1px solid #f8fafc', paddingTop: '0.75rem' }}>
                                                        <p style={{ margin: '0 0 0.5rem', fontWeight: 900, fontSize: '1.15rem', color: '#f59e0b' }}>
                                                            {formatRupiah(price)} <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Pts</span>
                                                        </p>
                                                        <button
                                                            onClick={() => handleRedeemVoucher(p)}
                                                            disabled={!canRedeem || loading}
                                                            style={{
                                                                width: '100%', padding: '0.6rem 0.5rem', borderRadius: '9999px', border: 'none',
                                                                background: canRedeem ? 'linear-gradient(135deg, #00a884, #00c298)' : '#e2e8f0',
                                                                color: canRedeem ? '#fff' : '#94a3b8',
                                                                fontSize: '0.78rem', fontWeight: 800,
                                                                cursor: canRedeem ? 'pointer' : 'not-allowed',
                                                                boxShadow: canRedeem ? '0 2px 10px rgba(0, 168, 132, 0.25)' : 'none',
                                                            }}
                                                        >
                                                            {canRedeem ? '⚡ Tukar 1-Klik' : 'Koin Kurang'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            )}

                            {/* TAB 2: TOP-UP KOIN (KESAMPING / GRID) */}
                            {activeTab === 'topup' && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.85rem' }}>
                                    {topupPackages.map((pkg) => (
                                        <div
                                            key={pkg.id}
                                            style={{
                                                background: '#fff', borderRadius: '20px', padding: '1.4rem 1rem 1.1rem',
                                                border: pkg.is_popular ? '2px solid #f59e0b' : '1px solid #f1f5f9',
                                                boxShadow: pkg.is_popular ? '0 8px 25px rgba(245, 158, 11, 0.12)' : '0 4px 15px rgba(0,0,0,0.03)',
                                                position: 'relative', display: 'flex', flexDirection: 'column',
                                                justifyContent: 'space-between', textAlign: 'center',
                                            }}
                                        >
                                            {pkg.badge && (
                                                <div style={{
                                                    position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)',
                                                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                                    color: '#fff', fontSize: '0.65rem', fontWeight: 800,
                                                    padding: '0.2rem 0.75rem', borderRadius: '9999px',
                                                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.35)', whiteSpace: 'nowrap',
                                                }}>
                                                    {pkg.badge}
                                                </div>
                                            )}

                                            <div>
                                                <div style={{
                                                    width: '36px', height: '36px', borderRadius: '12px',
                                                    background: '#fef3c7', color: '#d97706',
                                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '1rem', marginBottom: '0.5rem',
                                                }}>
                                                    <i className="fas fa-coins" />
                                                </div>
                                                <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>
                                                    {pkg.name}
                                                </h4>
                                                <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
                                                    Dapat <strong style={{ color: '#f59e0b' }}>{formatRupiah(pkg.total_points)}</strong> Pts
                                                </p>
                                            </div>

                                            <div style={{ borderTop: '1px solid #f8fafc', paddingTop: '0.75rem' }}>
                                                <p style={{ margin: '0 0 0.5rem', fontWeight: 900, fontSize: '1.15rem', color: '#1e293b' }}>
                                                    Rp {formatRupiah(pkg.price)}
                                                </p>
                                                <button
                                                    onClick={() => handleTopupCharge(pkg)}
                                                    disabled={loading}
                                                    style={{
                                                        width: '100%', padding: '0.6rem 0.5rem', borderRadius: '9999px', border: 'none',
                                                        background: 'linear-gradient(135deg, #00a884, #00c298)',
                                                        color: '#fff', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer',
                                                        boxShadow: '0 2px 10px rgba(0, 168, 132, 0.25)',
                                                    }}
                                                >
                                                    Beli via QRIS
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* QRIS MODAL */}
                    {qrisData && (
                        <div style={{
                            position: 'fixed', inset: 0, zIndex: 100,
                            background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
                        }}>
                            <div className="card-nd-elevated" style={{
                                width: '100%', maxWidth: '24rem', background: '#fff',
                                borderRadius: '24px', padding: '1.75rem', textAlign: 'center',
                            }}>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1e293b', margin: '0 0 0.25rem' }}>
                                    Scan QRIS untuk Bayar
                                </h3>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1rem' }}>
                                    Total: <strong>Rp {formatRupiah(qrisData.amount)}</strong> (+{formatRupiah(qrisData.package?.total_points)} Pts)
                                </p>

                                <div style={{
                                    background: '#fff', padding: '0.75rem', borderRadius: '18px',
                                    border: '1px solid #e2e8f0', display: 'inline-block', marginBottom: '1rem',
                                }}>
                                    <img
                                        src={qrisData.payment_url || qrisData.qris_url}
                                        alt="QRIS Top-Up"
                                        style={{ width: '14rem', height: '14rem', borderRadius: '12px', objectFit: 'contain' }}
                                        onError={(e) => {
                                            e.target.onerror = null
                                            const qrStr = qrisData.qr_string || qrisData.payment_url || qrisData.qris_url
                                            e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(qrStr)
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#00a884', fontWeight: 700, marginBottom: '1.25rem' }}>
                                    <i className="fas fa-spinner fa-spin" />
                                    <span>Menunggu pembayaran otomatis...</span>
                                </div>

                                <button
                                    onClick={() => {
                                        if (pollingInterval) clearInterval(pollingInterval)
                                        setPollingInterval(null)
                                        setQrisData(null)
                                    }}
                                    style={{
                                        width: '100%', padding: '0.85rem', background: '#f1f5f9',
                                        color: '#64748b', fontWeight: 700, borderRadius: '9999px',
                                        border: 'none', cursor: 'pointer', fontSize: '0.82rem',
                                    }}
                                >
                                    Tutup / Batalkan
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Legal & Non-Refundable Notice Footer */}
                    <div style={{
                        marginTop: '2.5rem', textAlign: 'center',
                        borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem',
                    }}>
                        <p style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                            🔒 <strong>Ketentuan ND-Points:</strong> ND-Points adalah sistem token loyalitas tertutup (<em>closed-loop credit</em>) khusus untuk ekosistem ND-Hotspot. Poin tidak memiliki nilai tunai di luar sistem, tidak dapat di-refund/diuangkan kembali, dan tidak dapat ditransfer ke rekening bank.
                        </p>
                    </div>

                </div>
            </div>
        </PublicLayout>
    )
}

