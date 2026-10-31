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
    const [agreeTerms, setAgreeTerms] = useState(false)

    // Auto-Debit states
    const [autoDebit, setAutoDebit] = useState({
        enabled: false,
        plan_id: null,
        plan: null,
        trigger_type: 'on_expiry',
        day: 1,
        last_run_at: null,
        fail_count: 0
    })
    const [showAutoDebitModal, setShowAutoDebitModal] = useState(false)
    const [autoDebitPlanId, setAutoDebitPlanId] = useState('')
    const [autoDebitTriggerType, setAutoDebitTriggerType] = useState('on_expiry') // 'on_expiry' | 'monthly_date'
    const [autoDebitDay, setAutoDebitDay] = useState(1)
    const [autoDebitPin, setAutoDebitPin] = useState('')
    const [autoDebitLoading, setAutoDebitLoading] = useState(false)

    // Voucher Plans & Top-up Packages
    const [voucherPlans, setVoucherPlans] = useState([])
    const [topupPackages, setTopupPackages] = useState([])
    const [redeemSuccess, setRedeemSuccess] = useState(null)
    const [copied, setCopied] = useState(false)

    // QRIS Modal for Top-Up
    const [qrisData, setQrisData] = useState(null)
    const [pollingInterval, setPollingInterval] = useState(null)
    const [showInfoModal, setShowInfoModal] = useState(false)

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
        fetchAutoDebitStatus()
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

    const fetchAutoDebitStatus = async () => {
        try {
            const res = await axios.post(`${API}/points/autodebit/status`, { phone: normalizedPhone })
            if (res.data?.success) {
                setAutoDebit({
                    enabled: !!res.data.auto_debit_enabled,
                    plan_id: res.data.auto_debit_plan_id,
                    plan: res.data.auto_debit_plan,
                    trigger_type: res.data.auto_debit_trigger_type || 'on_expiry',
                    day: res.data.auto_debit_day || 1,
                    last_run_at: res.data.last_run_at,
                    fail_count: res.data.fail_count || 0
                })
                if (res.data.auto_debit_plan_id) {
                    setAutoDebitPlanId(res.data.auto_debit_plan_id)
                }
                if (res.data.auto_debit_trigger_type) {
                    setAutoDebitTriggerType(res.data.auto_debit_trigger_type)
                }
                if (res.data.auto_debit_day) {
                    setAutoDebitDay(res.data.auto_debit_day)
                }
            }
        } catch (err) {
            console.error('Failed to fetch auto debit status:', err)
        }
    }

    const handleToggleAutoDebit = async (enable) => {
        if (enable && !autoDebitPlanId) {
            setError('Harap pilih paket voucher untuk perpanjangan otomatis.')
            return
        }
        if (enable && autoDebitTriggerType === 'monthly_date' && (!autoDebitDay || autoDebitDay < 1 || autoDebitDay > 31)) {
            setError('Harap tentukan tanggal pembelian bulanan yang valid (1 - 31).')
            return
        }
        const verifyPin = autoDebitPin || pin
        if (!verifyPin || verifyPin.length !== 6) {
            setError('Harap masukkan 6-digit PIN keamanan Anda.')
            return
        }

        setAutoDebitLoading(true)
        setError('')
        setSuccessMsg('')
        try {
            const res = await axios.post(`${API}/points/autodebit/toggle`, {
                phone: normalizedPhone,
                pin: verifyPin,
                enabled: enable,
                voucher_plan_id: enable ? autoDebitPlanId : null,
                trigger_type: enable ? autoDebitTriggerType : 'on_expiry',
                day: (enable && autoDebitTriggerType === 'monthly_date') ? Number(autoDebitDay) : null,
            })

            if (res.data?.success) {
                setSuccessMsg(res.data.message)
                setAutoDebit({
                    enabled: !!res.data.auto_debit_enabled,
                    plan_id: res.data.auto_debit_plan?.id || null,
                    plan: res.data.auto_debit_plan,
                    trigger_type: res.data.auto_debit_trigger_type || 'on_expiry',
                    day: res.data.auto_debit_day || 1,
                    last_run_at: autoDebit.last_run_at,
                    fail_count: 0
                })
                setShowAutoDebitModal(false)
                setAutoDebitPin('')

                // OPSI A: Jika voucher pertama langsung diterbitkan saat aktivasi
                if (res.data.initial_voucher) {
                    setRedeemSuccess(res.data.initial_voucher)
                    try {
                        const stat = await axios.post(`${API}/points/account/status`, { phone: normalizedPhone })
                        setAccountData(stat.data)
                    } catch (e) {
                        // Silently handle
                    }
                }
            } else {
                setError(res.data?.message || 'Gagal mengubah pengaturan ND Auto-Voucher.')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengubah ND Auto-Voucher. Pastikan PIN benar.')
        } finally {
            setAutoDebitLoading(false)
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

        if (!agreeTerms) {
            setError('Harap beri tanda centang untuk menyetujui Syarat & Ketentuan ND-Points.')
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

                                    {/* Mandatory Terms & Conditions Checkbox */}
                                    <div style={{
                                        marginBottom: '1.25rem', textAlign: 'left',
                                        background: '#f8fafc', padding: '0.85rem 1rem',
                                        borderRadius: '16px', border: '1px solid #e2e8f0',
                                    }}>
                                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer', fontSize: '0.78rem', color: '#475569', lineHeight: 1.5 }}>
                                            <input
                                                type="checkbox"
                                                checked={agreeTerms}
                                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                                required
                                                style={{ width: '18px', height: '18px', accentColor: '#00a884', marginTop: '2px', cursor: 'pointer', flexShrink: 0 }}
                                            />
                                            <span>
                                                Saya telah membaca dan menyetujui{' '}
                                                <button
                                                    type="button"
                                                    onClick={() => setShowInfoModal(true)}
                                                    style={{ background: 'none', border: 'none', color: '#00a884', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: '0.78rem' }}
                                                >
                                                    Syarat & Ketentuan ND-Points
                                                </button>
                                                {' '}(Termasuk ketentuan saldo tertutup & <em>non-refundable</em> / tidak dapat diuangkan kembali).
                                            </span>
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !agreeTerms}
                                        style={{
                                            width: '100%', padding: '0.9rem',
                                            background: agreeTerms ? 'linear-gradient(135deg, #00a884, #00c298)' : '#e2e8f0',
                                            color: agreeTerms ? '#fff' : '#94a3b8',
                                            fontWeight: 800, fontSize: '0.9rem',
                                            borderRadius: '9999px', border: 'none',
                                            cursor: agreeTerms ? 'pointer' : 'not-allowed',
                                            boxShadow: agreeTerms ? '0 4px 15px rgba(0, 168, 132, 0.3)' : 'none',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {loading ? <i className="fas fa-spinner fa-spin" /> : 'Aktivasi PIN & Buka Akun'}
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

                            {/* ND AUTO-VOUCHER CARD BANNER */}
                            <div style={{
                                background: autoDebit.enabled ? 'linear-gradient(135deg, #064e3b, #047857)' : '#ffffff',
                                color: autoDebit.enabled ? '#fff' : '#1e293b',
                                border: autoDebit.enabled ? '1px solid #059669' : '1px solid #e2e8f0',
                                borderRadius: '20px', padding: '1.1rem 1.25rem', marginBottom: '1.25rem',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '12px',
                                        background: autoDebit.enabled ? 'rgba(255,255,255,0.2)' : '#ecfdf5',
                                        color: autoDebit.enabled ? '#fff' : '#00a884',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.15rem'
                                    }}>
                                        <i className="fas fa-bolt" />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800 }}>
                                                ND Auto-Voucher
                                            </h4>
                                            <span style={{
                                                fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '9999px',
                                                background: autoDebit.enabled ? '#10b981' : '#f1f5f9',
                                                color: autoDebit.enabled ? '#fff' : '#64748b'
                                            }}>
                                                {autoDebit.enabled ? 'AKTIF' : 'NONAKTIF'}
                                            </span>
                                        </div>
                                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.74rem', color: autoDebit.enabled ? '#a7f3d0' : '#64748b' }}>
                                            {autoDebit.enabled
                                                ? `Voucher ${autoDebit.plan?.name || ''} otomatis terbit (${autoDebit.trigger_type === 'monthly_date' ? `Setiap tanggal ${autoDebit.day}` : 'Setelah voucher sebelumnya habis'}).`
                                                : 'Internet tanpa putus, voucher otomatis diterbitkan pakai koin ND-Points.'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setError('')
                                        setAutoDebitPin('')
                                        if (!autoDebitPlanId && voucherPlans.length > 0) {
                                            setAutoDebitPlanId(voucherPlans[0].id)
                                        }
                                        setShowAutoDebitModal(true)
                                    }}
                                    style={{
                                        padding: '0.55rem 1rem', borderRadius: '9999px',
                                        background: autoDebit.enabled ? '#fff' : 'linear-gradient(135deg, #00a884, #00c298)',
                                        color: autoDebit.enabled ? '#065f46' : '#fff',
                                        fontWeight: 800, fontSize: '0.78rem', border: 'none', cursor: 'pointer',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <i className="fas fa-cog" /> {autoDebit.enabled ? 'Atur ND Auto-Voucher' : 'Aktifkan ND Auto-Voucher'}
                                </button>
                            </div>

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
                        <p style={{ fontSize: '0.73rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                            🔒 <strong>Ketentuan ND-Points:</strong> ND-Points adalah sistem token loyalitas tertutup (<em>closed-loop credit</em>) khusus untuk ekosistem ND-Hotspot. Poin tidak memiliki nilai tunai di luar sistem, tidak dapat di-refund/diuangkan kembali, dan tidak dapat ditransfer ke rekening bank.{' '}
                            <button
                                onClick={() => setShowInfoModal(true)}
                                style={{
                                    background: 'none', border: 'none', color: '#00a884',
                                    fontWeight: 800, textDecoration: 'underline', cursor: 'pointer',
                                    padding: 0, fontSize: '0.73rem', display: 'inline',
                                }}
                            >
                                Baca Selengkapnya
                            </button>
                        </p>
                    </div>

                    {/* MODAL ND AUTO-VOUCHER SETTINGS */}
                    {showAutoDebitModal && (
                        <div style={{
                            position: 'fixed', inset: 0, zIndex: 115,
                            background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
                        }}>
                            <div className="card-nd-elevated" style={{
                                width: '100%', maxWidth: '26rem', background: '#fff',
                                borderRadius: '24px', padding: '1.75rem', textAlign: 'left',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', color: '#00a884', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className="fas fa-bolt" />
                                        </div>
                                        <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>
                                            Pengaturan ND Auto-Voucher
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setShowAutoDebitModal(false)}
                                        style={{ background: '#f1f5f9', border: 'none', color: '#64748b', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <i className="fas fa-times" />
                                    </button>
                                </div>

                                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 1rem', lineHeight: 1.5 }}>
                                    Sistem <strong>ND Auto-Voucher</strong> akan otomatis menerbitkan voucher hotspot baru menggunakan saldo ND-Points Anda saat voucher habis atau di tanggal pilihan Anda.
                                </p>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                                        Pilih Paket Voucher
                                    </label>
                                    <select
                                        value={autoDebitPlanId}
                                        onChange={(e) => setAutoDebitPlanId(e.target.value)}
                                        style={{
                                            width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1',
                                            fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', background: '#f8fafc', outline: 'none'
                                        }}
                                    >
                                        {voucherPlans.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} - Rp {formatRupiah(p.price)} ({p.duration})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* OPSI JADWAL PEMBELIAN ND AUTO-VOUCHER */}
                                <div style={{ marginBottom: '1.1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                        Waktu & Jadwal Pembelian
                                    </label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {/* Pilihan 1: Setelah Voucher Habis */}
                                        <div
                                            onClick={() => setAutoDebitTriggerType('on_expiry')}
                                            style={{
                                                padding: '0.75rem 0.85rem', borderRadius: '14px', cursor: 'pointer',
                                                border: autoDebitTriggerType === 'on_expiry' ? '2px solid #00a884' : '1px solid #e2e8f0',
                                                background: autoDebitTriggerType === 'on_expiry' ? '#ecfdf5' : '#f8fafc',
                                                display: 'flex', alignItems: 'center', gap: '0.75rem'
                                            }}
                                        >
                                            <div style={{
                                                width: '18px', height: '18px', borderRadius: '50%',
                                                border: autoDebitTriggerType === 'on_expiry' ? '5px solid #00a884' : '2px solid #cbd5e1',
                                                background: '#fff', flexShrink: 0
                                            }} />
                                            <div>
                                                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b' }}>
                                                    ⚡ Setelah Voucher Sebelumnya Habis
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem', lineHeight: 1.4 }}>
                                                    Sistem otomatis menerbitkan voucher baru begitu voucher aktif Anda kedaluwarsa.
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pilihan 2: Setiap Tanggal Tertentu */}
                                        <div
                                            onClick={() => setAutoDebitTriggerType('monthly_date')}
                                            style={{
                                                padding: '0.75rem 0.85rem', borderRadius: '14px', cursor: 'pointer',
                                                border: autoDebitTriggerType === 'monthly_date' ? '2px solid #00a884' : '1px solid #e2e8f0',
                                                background: autoDebitTriggerType === 'monthly_date' ? '#ecfdf5' : '#f8fafc',
                                                display: 'flex', alignItems: 'center', gap: '0.75rem'
                                            }}
                                        >
                                            <div style={{
                                                width: '18px', height: '18px', borderRadius: '50%',
                                                border: autoDebitTriggerType === 'monthly_date' ? '5px solid #00a884' : '2px solid #cbd5e1',
                                                background: '#fff', flexShrink: 0
                                            }} />
                                            <div>
                                                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b' }}>
                                                    📅 Tanggal Tertentu Setiap Bulan
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem', lineHeight: 1.4 }}>
                                                    Voucher diterbitkan sekali sebulan pada tanggal yang Anda tentukan.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* INPUT PILIH TANGGAL JIKA MONTHLY_DATE */}
                                {autoDebitTriggerType === 'monthly_date' && (
                                    <div style={{ marginBottom: '1.1rem', background: '#f0fdf4', padding: '0.75rem 0.85rem', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                                        <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 800, color: '#166534', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                                            Pilih Tanggal Pembelian Bulanan
                                        </label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            <select
                                                value={autoDebitDay}
                                                onChange={(e) => setAutoDebitDay(Number(e.target.value))}
                                                style={{
                                                    flex: 1, padding: '0.65rem 0.75rem', borderRadius: '10px',
                                                    border: '1px solid #86efac', fontSize: '0.82rem', fontWeight: 800,
                                                    color: '#14532d', background: '#fff', outline: 'none'
                                                }}
                                            >
                                                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                                                    <option key={d} value={d}>
                                                        Setiap Tanggal {d}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <span style={{ fontSize: '0.68rem', color: '#15803d', marginTop: '0.3rem', display: 'block' }}>
                                            💡 Voucher akan otomatis dibeli setiap tanggal {autoDebitDay} setiap bulan.
                                        </span>
                                    </div>
                                )}

                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                                        PIN Keamanan (6 Digit)
                                    </label>
                                    <input
                                        type="password"
                                        maxLength={6}
                                        value={autoDebitPin}
                                        onChange={(e) => setAutoDebitPin(e.target.value.replace(/\D/g, ''))}
                                        placeholder="• • • • • •"
                                        style={{
                                            letterSpacing: '0.4em', textAlign: 'center', fontSize: '1.2rem',
                                            fontWeight: 800, width: '100%', padding: '0.7rem',
                                            border: '1px solid #cbd5e1', borderRadius: '12px', outline: 'none',
                                            background: '#f8fafc', color: '#1e293b'
                                        }}
                                    />
                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem', display: 'block' }}>
                                        Konfirmasi PIN diperlukan untuk otorisasi keamanan ND Auto-Voucher.
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: '0.6rem' }}>
                                    {autoDebit.enabled && (
                                        <button
                                            type="button"
                                            onClick={() => handleToggleAutoDebit(false)}
                                            disabled={autoDebitLoading}
                                            style={{
                                                flex: 1, padding: '0.8rem', borderRadius: '9999px',
                                                background: '#fee2e2', color: '#b91c1c', fontWeight: 800, fontSize: '0.8rem',
                                                border: 'none', cursor: 'pointer'
                                            }}
                                        >
                                            {autoDebitLoading ? 'Memproses...' : 'Nonaktifkan'}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleToggleAutoDebit(true)}
                                        disabled={autoDebitLoading}
                                        style={{
                                            flex: 1, padding: '0.8rem', borderRadius: '9999px',
                                            background: 'linear-gradient(135deg, #00a884, #00c298)',
                                            color: '#fff', fontWeight: 800, fontSize: '0.8rem',
                                            border: 'none', cursor: 'pointer',
                                            boxShadow: '0 4px 15px rgba(0, 168, 132, 0.3)'
                                        }}
                                    >
                                        {autoDebitLoading ? 'Menyimpan...' : (autoDebit.enabled ? 'Simpan Pengaturan' : 'Aktifkan ND Auto-Voucher')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {showInfoModal && (
                        <div style={{
                            position: 'fixed', inset: 0, zIndex: 110,
                            background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
                        }}>
                            <div className="card-nd-elevated" style={{
                                width: '100%', maxWidth: '28rem', background: '#fff',
                                borderRadius: '24px', padding: '1.75rem', maxHeight: '90vh',
                                overflowY: 'auto', textAlign: 'left',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                                            <i className="fas fa-coins" />
                                        </div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>
                                            Panduan & Ketentuan Poin
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setShowInfoModal(false)}
                                        style={{ background: '#f1f5f9', border: 'none', color: '#64748b', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <i className="fas fa-times" />
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.6 }}>
                                    <div style={{ background: '#f8fafc', padding: '0.9rem 1rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                        <h4 style={{ margin: '0 0 0.3rem', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <i className="fas fa-info-circle" style={{ color: '#00a884' }} /> Apa Itu ND-Points?
                                        </h4>
                                        <p style={{ margin: 0 }}>
                                            ND-Points adalah sistem saldo loyalty tertutup (<em>closed-loop credit</em>) khusus untuk pelanggan setia ND-Hotspot. Koin ini berfungsi sebagai saldo praktis untuk menukar paket internet kapan saja tanpa perlu bolak-balik scan QRIS di m-banking.
                                        </p>
                                    </div>

                                    <div>
                                        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <i className="fas fa-star" style={{ color: '#f59e0b' }} /> Keuntungan Utama:
                                        </h4>
                                        <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            <li><strong>⚡ 1-Detik Beli Voucher:</strong> Pilih paket, klik tukar, langsung keluar kode voucher dan otomatis terhubung ke internet.</li>
                                            <li><strong>🎁 Bonus Ekstra Saat Isi Ulang:</strong> Tersedia paket isi ulang dengan bonus koin gratis (contoh: isi Rp 50.000 dapat 55.000 Poin).</li>
                                            <li><strong>🔒 Aman Terlindungi PIN:</strong> Saldo koin Anda terkunci dengan 6-digit PIN rahasia dan verifikasi WhatsApp OTP.</li>
                                        </ul>
                                    </div>

                                    <div style={{ background: '#fffbeb', padding: '0.9rem 1rem', borderRadius: '16px', border: '1px solid #fef3c7', color: '#92400e' }}>
                                        <h4 style={{ margin: '0 0 0.3rem', fontSize: '0.85rem', fontWeight: 800, color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <i className="fas fa-shield-alt" /> Ketentuan Penting (Harap Dibaca):
                                        </h4>
                                        <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem' }}>
                                            <li><strong>Non-Refundable:</strong> ND-Points bukan mata uang rupiah dan <u>tidak dapat diuangkan kembali (non-refundable)</u> atau ditarik ke rekening bank manapun.</li>
                                            <li><strong>Khusus Layanan ND-Hotspot:</strong> Poin hanya dapat digunakan untuk ditukarkan dengan paket voucher internet di portal ND-Hotspot.</li>
                                            <li><strong>Jaga Kerahasiaan PIN:</strong> Jangan pernah membagikan 6-digit PIN atau kode OTP Anda kepada siapapun.</li>
                                        </ul>
                                    </div>
                                </div>

                                <div style={{ marginTop: '1.5rem' }}>
                                    <button
                                        onClick={() => setShowInfoModal(false)}
                                        style={{
                                            width: '100%', padding: '0.85rem',
                                            background: 'linear-gradient(135deg, #00a884, #00c298)',
                                            color: '#fff', fontWeight: 800, fontSize: '0.88rem',
                                            borderRadius: '9999px', border: 'none', cursor: 'pointer',
                                            boxShadow: '0 4px 15px rgba(0, 168, 132, 0.3)',
                                        }}
                                    >
                                        Saya Mengerti
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </PublicLayout>
    )
}

