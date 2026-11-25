import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { QRCodeSVG } from 'qrcode.react'

const QuickReorderModal = ({ isOpen, onClose, plans = [] }) => {
    // Read previous purchase info from localStorage
    const [savedPurchase, setSavedPurchase] = useState(() => {
        try {
            const raw = localStorage.getItem('nd_last_purchase')
            return raw ? JSON.parse(raw) : null
        } catch {
            return null
        }
    })

    const [selectedPlan, setSelectedPlan] = useState(null)
    const [phone, setPhone] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [isChangingPlan, setIsChangingPlan] = useState(false)

    // Modal view states: 'confirm' | 'payment' | 'success'
    const [viewState, setViewState] = useState('confirm')
    const [paymentResult, setPaymentResult] = useState(null)
    const [voucherData, setVoucherData] = useState(null)
    const [copied, setCopied] = useState(false)
    const pollingRef = useRef(null)

    // Initialize plan and phone on open or when savedPurchase changes
    useEffect(() => {
        if (!isOpen) return

        let stored = null
        try {
            const raw = localStorage.getItem('nd_last_purchase')
            if (raw) stored = JSON.parse(raw)
        } catch (e) {
            console.error('Failed to parse nd_last_purchase:', e)
        }

        if (stored) {
            setSavedPurchase(stored)
            setPhone(stored.phone || '')
            // Find current active plan from plans list matching stored plan id
            const matchedPlan = plans.find(p => p.id === stored.plan?.id) || stored.plan
            setSelectedPlan(matchedPlan || plans[0] || null)
        } else {
            // Default to first available plan and last known phone if any
            const lastPhone = localStorage.getItem('nd_last_phone') || ''
            setPhone(lastPhone)
            setSelectedPlan(plans[0] || null)
        }

        // Reset flow state
        setViewState('confirm')
        setPaymentResult(null)
        setVoucherData(null)
        setError('')
        setLoading(false)
        setIsChangingPlan(false)
    }, [isOpen, plans])

    // Cleanup polling on unmount or close
    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current)
        }
    }, [])

    const formatRupiah = (number) => new Intl.NumberFormat('id-ID').format(number || 0)

    const formatDuration = (d) => {
        if (!d) return '-'
        if (d.endsWith('h')) return d.replace('h', ' Jam')
        if (d.endsWith('d')) return d.replace('d', ' Hari')
        if (d.endsWith('m')) return d.replace('m', ' Bulan')
        return d
    }

    const validatePhone = (number) => /^[0-9]{8,14}$/.test(number)

    const handleStartCheckout = async (e) => {
        e.preventDefault()
        setError('')

        if (!selectedPlan) {
            setError('Silakan pilih paket voucher terlebih dahulu.')
            return
        }

        const cleanPhone = phone.trim()
        if (!validatePhone(cleanPhone)) {
            setError('Nomor WhatsApp harus 8 - 14 digit angka (tanpa 0 atau 62).')
            return
        }

        setLoading(true)
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/checkout`, {
                voucher_plan_id: selectedPlan.id,
                phone: '62' + cleanPhone
            })

            if (response.data.success && response.data.transaction) {
                const trx = response.data.transaction
                setPaymentResult(trx)
                setViewState('payment')

                // Save to localStorage as last purchase intent
                const purchaseData = {
                    phone: cleanPhone,
                    plan: selectedPlan,
                    timestamp: Date.now()
                }
                localStorage.setItem('nd_last_purchase', JSON.stringify(purchaseData))
                localStorage.setItem('nd_last_phone', cleanPhone)
                setSavedPurchase(purchaseData)

                // Start live polling
                startPolling(trx.id, trx.external_id)
            } else {
                setError(response.data.message || 'Gagal memproses pembayaran.')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menghubungi server pembayaran.')
        } finally {
            setLoading(false)
        }
    }

    const startPolling = (transactionId, externalId) => {
        if (pollingRef.current) clearInterval(pollingRef.current)

        pollingRef.current = setInterval(async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/transactions/${transactionId}`)
                const data = res.data

                if (data.status === 'success') {
                    if (pollingRef.current) clearInterval(pollingRef.current)

                    // Fetch voucher details for the popup
                    try {
                        const vRes = await axios.get(`${import.meta.env.VITE_API_URL}/voucher/details?order_id=${externalId}`)
                        setVoucherData(vRes.data)
                    } catch (vErr) {
                        console.error('Error fetching voucher details:', vErr)
                        // Fallback minimum voucher data
                        setVoucherData({ voucher_code: 'SUKSES' })
                    }

                    setViewState('success')
                } else if (data.status === 'expire' || data.status === 'cancel') {
                    if (pollingRef.current) clearInterval(pollingRef.current)
                    setError('Pembayaran kadaluarsa atau dibatalkan.')
                    setViewState('confirm')
                }
            } catch (err) {
                console.error('Polling error:', err)
            }
        }, 3000)
    }

    const openQrisInBrowser = (url) => {
        const targetUrl = url || paymentResult?.payment_url || window.location.href
        if (!targetUrl) return
        const isAndroid = /android/i.test(navigator.userAgent)
        if (isAndroid && targetUrl.startsWith('http')) {
            const noProtocol = targetUrl.replace(/^https?:\/\//, '')
            window.location.href = `intent://${noProtocol}#Intent;scheme=https;action=android.intent.action.VIEW;end;`
        } else {
            window.open(targetUrl, '_blank')
        }
    }

    const handleClose = () => {
        if (pollingRef.current) clearInterval(pollingRef.current)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem', background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)'
        }}>
            <div style={{
                width: '100%', maxWidth: '24rem', background: '#ffffff',
                borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.25)',
                overflow: 'hidden', position: 'relative', border: '1px solid #e2e8f0',
                animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>

                {/* Close Button Top Right */}
                <button
                    type="button"
                    onClick={handleClose}
                    style={{
                        position: 'absolute', top: '1rem', right: '1rem', zIndex: 20,
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: '#f1f5f9', border: 'none', color: '#64748b',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', fontSize: '0.85rem'
                    }}
                >
                    <i className="fas fa-times" />
                </button>

                {/* ========================================================= */}
                {/* STATE 1: KONFIRMASI PEMBELIAN CEPAT / BELI LAGI           */}
                {/* ========================================================= */}
                {viewState === 'confirm' && (
                    <div>
                        {/* Header */}
                        <div style={{ background: '#f8fafc', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '12px',
                                    background: '#ecfdf5', color: '#00a884',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.1rem'
                                }}>
                                    <i className="fas fa-bolt" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>
                                        {savedPurchase ? 'Beli Lagi Voucher' : 'Beli Cepat Voucher'}
                                    </h3>
                                    <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '2px 0 0', fontWeight: 600 }}>
                                        {savedPurchase ? 'Menggunakan data pembelian terakhir Anda' : 'Pesan langsung tanpa pindah halaman'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Body Form */}
                        <form onSubmit={handleStartCheckout} style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
                            {error && (
                                <div style={{
                                    marginBottom: '1rem', padding: '0.75rem 1rem',
                                    background: '#fef2f2', border: '1px solid #fecaca',
                                    borderRadius: '14px', color: '#b91c1c', fontSize: '0.78rem',
                                    fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}>
                                    <i className="fas fa-exclamation-circle" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Plan Card Display */}
                            {selectedPlan ? (
                                <div style={{
                                    background: '#f8fafc', borderRadius: '16px',
                                    padding: '1rem', border: '1px solid #e2e8f0',
                                    marginBottom: '1rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#00a884', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    Paket Terpilih
                                                </span>
                                                {savedPurchase?.plan?.id === selectedPlan.id && (
                                                    <span style={{
                                                        background: '#dcfce7', color: '#15803d',
                                                        fontSize: '0.6rem', fontWeight: 800,
                                                        padding: '1px 6px', borderRadius: '9999px'
                                                    }}>
                                                        Terakhir Dibeli
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ fontSize: '0.98rem', fontWeight: 900, color: '#1e293b', margin: '3px 0 2px' }}>
                                                {selectedPlan.name}
                                            </p>
                                            <p style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, margin: 0 }}>
                                                Masa aktif: <b>{formatDuration(selectedPlan.duration)}</b>
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '1.25rem', fontWeight: 900, color: '#00a884', margin: 0 }}>
                                                Rp {formatRupiah(selectedPlan.price)}
                                            </p>
                                            {plans.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsChangingPlan(!isChangingPlan)}
                                                    style={{
                                                        background: 'none', border: 'none',
                                                        color: '#00a884', fontSize: '0.7rem',
                                                        fontWeight: 700, cursor: 'pointer',
                                                        padding: 0, marginTop: '2px', textDecoration: 'underline'
                                                    }}
                                                >
                                                    {isChangingPlan ? 'Selesai' : 'Ganti Paket'}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Optional Dropdown to Change Plan */}
                                    {isChangingPlan && (
                                        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #cbd5e1' }}>
                                            <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '0.4rem' }}>
                                                PILIH PAKET LAIN:
                                            </p>
                                            <div style={{ display: 'grid', gap: '0.4rem', maxHeight: '140px', overflowY: 'auto' }}>
                                                {plans.map(p => (
                                                    <div
                                                        key={p.id}
                                                        onClick={() => { setSelectedPlan(p); setIsChangingPlan(false) }}
                                                        style={{
                                                            padding: '0.5rem 0.75rem', borderRadius: '10px',
                                                            background: selectedPlan.id === p.id ? '#ecfdf5' : '#ffffff',
                                                            border: selectedPlan.id === p.id ? '1.5px solid #00a884' : '1px solid #e2e8f0',
                                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                            cursor: 'pointer', fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        <span style={{ fontWeight: 800, color: '#1e293b' }}>{p.name}</span>
                                                        <span style={{ fontWeight: 900, color: '#00a884' }}>Rp {formatRupiah(p.price)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '14px', textAlign: 'center', marginBottom: '1rem' }}>
                                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Memuat paket voucher...</p>
                                </div>
                            )}

                            {/* WhatsApp Phone Number Input */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    fontSize: '0.72rem', fontWeight: 800, color: '#475569',
                                    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem'
                                }}>
                                    <span>Nomor WhatsApp Tujuan</span>
                                    <span style={{ color: '#00a884', fontWeight: 700, textTransform: 'none' }}>(Bisa Diganti)</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{
                                        position: 'absolute', left: '1rem', top: '50%',
                                        transform: 'translateY(-50%)', color: '#64748b',
                                        fontWeight: 800, fontSize: '0.95rem'
                                    }}>
                                        +62
                                    </div>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => {
                                            let val = e.target.value.replace(/\D/g, '')
                                            if (val.startsWith('0')) val = val.substring(1)
                                            if (val.startsWith('62')) val = val.substring(2)
                                            setPhone(val)
                                        }}
                                        required
                                        placeholder="8123456789"
                                        inputMode="numeric"
                                        style={{
                                            width: '100%', paddingLeft: '3.5rem', paddingRight: '1rem',
                                            paddingTop: '0.75rem', paddingBottom: '0.75rem',
                                            background: '#f8fafc', border: '1.5px solid #cbd5e1',
                                            borderRadius: '14px', fontWeight: 800, fontSize: '1rem',
                                            outline: 'none', color: '#1e293b', boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '0.4rem 0 0', fontWeight: 600 }}>
                                    Kode voucher akan otomatis dikirimkan ke WhatsApp nomor ini.
                                </p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || !selectedPlan}
                                className="btn-nd-pill"
                                style={{
                                    width: '100%', padding: '0.85rem',
                                    fontSize: '0.9rem', fontWeight: 800,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: '0.5rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.7 : 1, boxShadow: '0 4px 14px rgba(0, 168, 132, 0.35)'
                                }}
                            >
                                {loading ? (
                                    <>
                                        <div style={{
                                            width: '16px', height: '16px', border: '2px solid #ffffff',
                                            borderTopColor: 'transparent', borderRadius: '50%'
                                        }} className="animate-spin" />
                                        <span>Menyiapkan QRIS...</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-qrcode" />
                                        <span>Bayar Rp {selectedPlan ? formatRupiah(selectedPlan.price) : '0'} via QRIS</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* ========================================================= */}
                {/* STATE 2: POPUP PEMBAYARAN QRIS (LIVE DI DALAM MODAL)      */}
                {/* ========================================================= */}
                {viewState === 'payment' && paymentResult && (
                    <div style={{ padding: '1.75rem 1.5rem', textAlign: 'center' }}>
                        <div style={{
                            width: '44px', height: '44px', background: '#ecfdf5',
                            borderRadius: '14px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', margin: '0 auto 0.75rem',
                            color: '#00a884', fontSize: '1.25rem'
                        }}>
                            <i className="fas fa-qrcode" />
                        </div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1e293b', margin: '0 0 0.25rem' }}>
                            Scan QRIS Pembayaran
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, margin: '0 0 1rem' }}>
                            Scan via DANA, GoPay, OVO, ShopeePay, atau Mobile Banking
                        </p>

                        {/* Local Client-Side SVG QRIS Rendering (Anti-Gagal) */}
                        <div style={{
                            background: '#ffffff', padding: '0.75rem',
                            borderRadius: '18px', border: '1px solid #e2e8f0',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
                            display: 'inline-block', marginBottom: '1rem'
                        }}>
                            {paymentResult.qr_string ? (
                                <QRCodeSVG
                                    value={paymentResult.qr_string}
                                    size={200}
                                    level="M"
                                    includeMargin={true}
                                    style={{ borderRadius: '10px', background: '#fff' }}
                                />
                            ) : (
                                <img
                                    src={paymentResult.payment_url}
                                    style={{ width: '200px', height: '200px', borderRadius: '10px' }}
                                    alt="QRIS"
                                />
                            )}
                            <div style={{
                                marginTop: '0.35rem', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                gap: '0.35rem', fontSize: '0.68rem',
                                fontWeight: 800, color: '#00a884'
                            }}>
                                <i className="fas fa-check-circle" />
                                <span>QRIS Siap di-Scan</span>
                            </div>
                        </div>

                        {/* Amount & Order ID Box */}
                        <div style={{
                            background: '#f8fafc', borderRadius: '14px',
                            padding: '0.75rem 1rem', border: '1px solid #e2e8f0',
                            marginBottom: '1rem', display: 'flex',
                            justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div style={{ textAlign: 'left' }}>
                                <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, margin: 0 }}>
                                    Total Tagihan
                                </p>
                                <p style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 700, margin: '2px 0 0' }}>
                                    {paymentResult.external_id}
                                </p>
                            </div>
                            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#00a884' }}>
                                Rp {formatRupiah(selectedPlan?.price)}
                            </span>
                        </div>

                        {/* Polling Indicator */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            color: '#00a884', fontSize: '0.72rem', fontWeight: 700,
                            background: '#ecfdf5', padding: '0.4rem 1rem',
                            borderRadius: '9999px', marginBottom: '0.85rem'
                        }} className="animate-pulse">
                            <i className="fas fa-sync fa-spin" /> Menunggu pembayaran otomatis...
                        </div>

                        {/* Direct App / Browser Link Button */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                            <button
                                type="button"
                                onClick={() => openQrisInBrowser(paymentResult?.payment_url)}
                                style={{
                                    width: '100%', padding: '0.55rem', background: '#f59e0b',
                                    color: '#fff', borderRadius: '9999px', border: 'none',
                                    fontWeight: 800, fontSize: '0.72rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem'
                                }}
                            >
                                <i className="fas fa-external-link-alt" />
                                <span>Buka QRIS di Browser / E-Wallet</span>
                            </button>
                        </div>

                        {/* Cancel Button */}
                        <button
                            type="button"
                            onClick={() => {
                                if (pollingRef.current) clearInterval(pollingRef.current)
                                setViewState('confirm')
                            }}
                            style={{
                                background: 'none', border: 'none',
                                color: '#94a3b8', fontSize: '0.72rem',
                                fontWeight: 700, cursor: 'pointer'
                            }}
                        >
                            Batalkan Transaksi
                        </button>
                    </div>
                )}

                {/* ========================================================= */}
                {/* STATE 3: SUKSES (KODE VOUCHER, COPY, & QUICK LOGIN ONLY)   */}
                {/* ========================================================= */}
                {viewState === 'success' && (
                    <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
                        {/* Green Badge */}
                        <div style={{
                            width: '48px', height: '48px', background: '#00a884',
                            borderRadius: '50%', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', margin: '0 auto 0.85rem',
                            fontSize: '1.4rem', color: '#ffffff',
                            boxShadow: '0 4px 14px rgba(0, 168, 132, 0.4)'
                        }}>
                            <i className="fas fa-check" />
                        </div>

                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e293b', margin: '0 0 0.25rem' }}>
                            Pembayaran Berhasil!
                        </h3>
                        <p style={{ color: '#00a884', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 1.25rem' }}>
                            Akses Internet Siap Digunakan
                        </p>

                        {/* Dashed Voucher Box */}
                        <div style={{
                            background: '#f8fafc', borderRadius: '18px',
                            border: '2px dashed #00a884', padding: '1.25rem 1rem',
                            textAlign: 'center', marginBottom: '1.25rem'
                        }}>
                            <p style={{
                                color: '#64748b', fontSize: '0.68rem', fontWeight: 800,
                                textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 0.35rem'
                            }}>
                                Kode Voucher
                            </p>
                            <h2 style={{
                                fontSize: '2.25rem', fontWeight: 900, color: '#1e293b',
                                letterSpacing: '0.12em', fontFamily: 'monospace',
                                margin: 0, lineHeight: 1.1
                            }}>
                                {voucherData?.voucher_code || '-'}
                            </h2>

                            {/* Tombol Copy */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (voucherData?.voucher_code) {
                                        navigator.clipboard.writeText(voucherData.voucher_code)
                                        setCopied(true)
                                        setTimeout(() => setCopied(false), 2500)
                                    }
                                }}
                                style={{
                                    marginTop: '0.75rem', padding: '0.35rem 0.85rem',
                                    borderRadius: '9999px',
                                    background: copied ? '#ecfdf5' : '#ffffff',
                                    border: copied ? '1px solid #00a884' : '1px solid #cbd5e1',
                                    color: copied ? '#00a884' : '#64748b',
                                    fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
                                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)', transition: 'all 0.2s ease'
                                }}
                            >
                                <i className={copied ? "fas fa-check" : "far fa-copy"} />
                                <span>{copied ? 'Kode Tersalin!' : 'Salin Kode Voucher'}</span>
                            </button>
                        </div>

                        {/* Tombol Quick Login Hotspot */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                            <a
                                href={`http://ndnet.login/login?username=${encodeURIComponent(voucherData?.voucher_code || '')}&password=&dst=${encodeURIComponent(window.location.origin + '/?login=success')}`}
                                className="btn-nd-pill"
                                style={{
                                    width: '100%', padding: '0.85rem',
                                    fontSize: '0.9rem', fontWeight: 800,
                                    textDecoration: 'none', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    gap: '0.5rem', boxShadow: '0 4px 14px rgba(0, 168, 132, 0.35)',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <i className="fas fa-bolt" />
                                <span>Login Hotspot Sekarang</span>
                            </a>

                            <button
                                type="button"
                                onClick={handleClose}
                                style={{
                                    width: '100%', padding: '0.75rem',
                                    background: '#f1f5f9', color: '#64748b',
                                    fontWeight: 700, borderRadius: '9999px',
                                    border: 'none', cursor: 'pointer', fontSize: '0.8rem'
                                }}
                            >
                                Selesai / Tutup
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default QuickReorderModal
