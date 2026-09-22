import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'
import PublicLayout from '../components/PublicLayout'

const nb = { dark: '#0e4696', mid: '#1877f2', light: '#60a5fa' }
const API = import.meta.env.VITE_API_URL
const WA_SOCKET_URL = import.meta.env.VITE_WA_URL || 'http://localhost:5000'

const formatRupiah = (val) => {
    if (val === null || val === undefined) return 'Rp 0'
    return 'Rp ' + Number(val).toLocaleString('id-ID')
}

export default function PublicLoyalty() {
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [result, setResult] = useState(null)
    const [cooldown, setCooldown] = useState(0)
    const [liveFlash, setLiveFlash] = useState(false)
    const [wsConnected, setWsConnected] = useState(false)

    const activePhoneRef = useRef('')
    const inputRef = useRef(null)

    // Cooldown timer countdown (anti-spam UI)
    useEffect(() => {
        if (cooldown <= 0) return
        const timer = setInterval(() => {
            setCooldown((prev) => Math.max(0, prev - 1))
        }, 1000)
        return () => clearInterval(timer)
    }, [cooldown])

    // Realtime WebSocket listener
    useEffect(() => {
        let socket = null
        try {
            socket = io(WA_SOCKET_URL, {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 2000,
            })

            socket.on('connect', () => setWsConnected(true))
            socket.on('disconnect', () => setWsConnected(false))

            socket.on('analytics_updated', (data) => {
                // If the user is currently viewing this exact phone's progress, update instantly
                if (activePhoneRef.current && data?.phone && data.phone === activePhoneRef.current) {
                    fetchProgress(activePhoneRef.current, true)
                    setLiveFlash(true)
                    setTimeout(() => setLiveFlash(false), 4000)
                }
            })
        } catch (err) {
            console.warn('Realtime connection error:', err)
        }

        return () => {
            if (socket) socket.disconnect()
        }
    }, [])

    const fetchProgress = async (phoneToCheck, silent = false) => {
        if (!silent) {
            setLoading(true)
            setError('')
        }

        try {
            const res = await axios.post(`${API}/loyalty/progress`, { phone: phoneToCheck })
            setResult(res.data)
            if (res.data?.phone) {
                activePhoneRef.current = res.data.phone
            }
        } catch (err) {
            if (err.response?.status === 429) {
                const waitSec = err.response?.data?.retry_after || 30
                setCooldown(waitSec)
                setError(err.response?.data?.message || `Terlalu banyak permintaan. Silakan tunggu ${waitSec} detik.`)
            } else {
                setError(err.response?.data?.message || 'Gagal memeriksa data progress. Silakan coba beberapa saat lagi.')
            }
        } finally {
            if (!silent) setLoading(false)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!phone.trim() || cooldown > 0 || loading) return

        // Short 2s anti-spam button lock
        setCooldown(2)
        fetchProgress(phone.trim(), false)
    }

    const handleReset = () => {
        setPhone('')
        setResult(null)
        setError('')
        activePhoneRef.current = ''
        setTimeout(() => inputRef.current?.focus(), 50)
    }

    return (
        <PublicLayout>
            <div style={{ minHeight: '100vh', background: '#ffffff', padding: '2.5rem 1rem 4rem' }}>
                <div style={{ maxWidth: '32rem', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: '72px', height: '72px',
                            background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`,
                            borderRadius: '22px', border: `3px solid ${nb.dark}`,
                            boxShadow: `5px 5px 0px ${nb.dark}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.25rem', color: '#fff', fontSize: '2rem',
                        }}>
                            <i className="fas fa-chart-line" />
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: nb.dark, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>
                            Loyalty <span style={{ color: nb.light }}>Progress</span>
                        </h1>
                        <p style={{ color: '#64748b', fontWeight: 700, fontSize: '0.85rem', marginTop: '0.5rem' }}>
                            Pantau akumulasi pembelian voucher hotspot Anda bulan ini
                        </p>
                    </div>

                    {/* Live Flash Notice */}
                    {liveFlash && (
                        <div style={{
                            background: '#ecfdf5', border: '3px solid #059669',
                            boxShadow: '4px 4px 0px #059669', borderRadius: '16px',
                            padding: '0.85rem 1.25rem', marginBottom: '1.5rem',
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            color: '#065f46', fontWeight: 800, fontSize: '0.85rem',
                            animation: 'bounce 1s infinite'
                        }}>
                            <i className="fas fa-bolt text-lg text-emerald-600" />
                            <span>⚡ Pembelian voucher baru terdeteksi! Data terupdate secara realtime.</span>
                        </div>
                    )}

                    {/* Form Card */}
                    <div style={{
                        background: '#ffffff', borderRadius: '20px',
                        border: `3px solid ${nb.dark}`,
                        boxShadow: `6px 6px 0px ${nb.dark}`,
                        padding: '1.75rem', marginBottom: '2rem',
                    }}>
                        <form onSubmit={handleSubmit}>
                            <label style={{ display: 'block', fontWeight: 900, color: nb.dark, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                Nomor WhatsApp / HP
                            </label>
                            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                                <input
                                    ref={inputRef}
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Contoh: 08123456789"
                                    disabled={loading || cooldown > 0}
                                    style={{
                                        width: '100%', padding: '0.85rem 1.25rem 0.85rem 2.85rem',
                                        borderRadius: '14px', border: `3px solid ${nb.dark}`,
                                        fontSize: '1rem', fontWeight: 800, color: nb.dark,
                                        outline: 'none', background: '#f8fafc',
                                        boxShadow: 'inset 2px 2px 0px rgba(0,0,0,0.05)',
                                    }}
                                />
                                <i className="fas fa-phone-alt" style={{
                                    position: 'absolute', left: '1rem', top: '50%',
                                    transform: 'translateY(-50%)', color: nb.mid, fontSize: '1.1rem',
                                }} />
                            </div>

                            {error && (
                                <div style={{
                                    padding: '0.85rem 1rem', borderRadius: '12px',
                                    background: '#fef2f2', border: '2px solid #ef4444',
                                    color: '#b91c1c', fontSize: '0.85rem', fontWeight: 700,
                                    marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}>
                                    <i className="fas fa-exclamation-circle" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    type="submit"
                                    disabled={loading || cooldown > 0 || !phone.trim()}
                                    style={{
                                        flex: 1, padding: '0.9rem 1.5rem',
                                        borderRadius: '14px', border: `3px solid ${nb.dark}`,
                                        background: (cooldown > 0 || loading) ? '#cbd5e1' : `linear-gradient(135deg, ${nb.mid}, ${nb.dark})`,
                                        color: '#ffffff', fontWeight: 900, fontSize: '0.95rem',
                                        cursor: (cooldown > 0 || loading) ? 'not-allowed' : 'pointer',
                                        boxShadow: (cooldown > 0 || loading) ? 'none' : `4px 4px 0px ${nb.dark}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        textTransform: 'uppercase', letterSpacing: '0.02em',
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <i className="fas fa-circle-notch fa-spin" />
                                            <span>Memeriksa...</span>
                                        </>
                                    ) : cooldown > 0 ? (
                                        <>
                                            <i className="fas fa-hourglass-half" />
                                            <span>Tunggu {cooldown}s</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-search" />
                                            <span>Cek Progress</span>
                                        </>
                                    )}
                                </button>

                                {result && (
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        style={{
                                            padding: '0.9rem 1.25rem',
                                            borderRadius: '14px', border: `3px solid ${nb.dark}`,
                                            background: '#ffffff', color: nb.dark,
                                            fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
                                            boxShadow: `3px 3px 0px ${nb.dark}`,
                                        }}
                                        title="Reset Pencarian"
                                    >
                                        <i className="fas fa-redo" />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Result Container */}
                    {result && (
                        <div>
                            {/* State 1: No active event */}
                            {result.has_active_event === false ? (
                                <div style={{
                                    background: '#ffffff', borderRadius: '20px',
                                    border: `3px solid ${nb.dark}`, boxShadow: `6px 6px 0px ${nb.dark}`,
                                    padding: '2rem 1.5rem', textAlign: 'center',
                                }}>
                                    <div style={{
                                        width: '56px', height: '56px', background: '#f1f5f9',
                                        borderRadius: '50%', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', margin: '0 auto 1rem',
                                        color: '#64748b', fontSize: '1.5rem',
                                    }}>
                                        <i className="fas fa-pause-circle" />
                                    </div>
                                    <h3 style={{ fontWeight: 900, color: nb.dark, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                                        Tidak Ada Event Aktif
                                    </h3>
                                    <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                                        Saat ini program loyalty ND-HOTSPOT sedang tidak aktif.
                                    </p>
                                </div>
                            ) : !result.found ? (
                                /* State 2: Empty State (no voucher purchases this month) */
                                <div style={{
                                    background: '#ffffff', borderRadius: '20px',
                                    border: `3px solid ${nb.dark}`, boxShadow: `6px 6px 0px ${nb.dark}`,
                                    padding: '2.25rem 1.5rem', textAlign: 'center',
                                }}>
                                    <div style={{
                                        width: '64px', height: '64px', background: '#fef3c7',
                                        border: '3px solid #d97706', borderRadius: '18px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 1.25rem', color: '#d97706', fontSize: '1.75rem',
                                        boxShadow: '3px 3px 0px #d97706',
                                    }}>
                                        <i className="fas fa-ticket-alt" />
                                    </div>
                                    <h3 style={{ fontWeight: 900, color: nb.dark, fontSize: '1.15rem', marginBottom: '0.5rem' }}>
                                        Belum Ada Pembelian Voucher
                                    </h3>
                                    <div style={{
                                        display: 'inline-block', padding: '0.35rem 0.85rem',
                                        borderRadius: '999px', background: '#f1f5f9',
                                        border: `2px solid ${nb.dark}`, fontWeight: 800,
                                        fontSize: '0.8rem', color: nb.dark, marginBottom: '1rem',
                                    }}>
                                        Periode: {result.period_formatted || result.period_key}
                                    </div>
                                    <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.6, marginBottom: '1.5rem' }}>
                                        Nomor <strong style={{ color: nb.dark }}>{result.phone}</strong> belum memiliki transaksi pembelian voucher hotspot yang berhasil pada periode bulan ini.
                                    </p>
                                    <div style={{
                                        background: '#f8fafc', borderRadius: '14px',
                                        border: '2px dashed #94a3b8', padding: '1rem',
                                        fontSize: '0.8rem', color: '#475569', fontWeight: 600,
                                    }}>
                                        💡 Setiap transaksi voucher hotspot yang Anda beli akan langsung tercatat secara otomatis di halaman ini.
                                    </div>
                                </div>
                            ) : (
                                /* State 3: Actual Progress Display */
                                <div style={{
                                    background: '#ffffff', borderRadius: '22px',
                                    border: `3px solid ${nb.dark}`, boxShadow: `7px 7px 0px ${nb.dark}`,
                                    overflow: 'hidden',
                                }}>
                                    {/* Card Header */}
                                    <div style={{
                                        background: result.is_target_achieved ? '#ecfdf5' : '#eff6ff',
                                        borderBottom: `3px solid ${nb.dark}`, padding: '1.5rem',
                                        display: 'flex', flexDirection: 'column', gap: '0.75rem',
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            <span style={{
                                                fontSize: '0.75rem', fontWeight: 900,
                                                color: nb.dark, textTransform: 'uppercase',
                                                background: '#ffffff', padding: '0.3rem 0.75rem',
                                                borderRadius: '8px', border: `2px solid ${nb.dark}`,
                                                boxShadow: '2px 2px 0px rgba(0,0,0,0.1)',
                                            }}>
                                                {result.event_name}
                                            </span>
                                            <span style={{
                                                fontSize: '0.75rem', fontWeight: 800,
                                                color: '#475569', background: '#ffffff',
                                                padding: '0.3rem 0.75rem', borderRadius: '8px',
                                                border: `2px solid ${nb.dark}`,
                                            }}>
                                                <i className="far fa-calendar-alt mr-1" />
                                                {result.period_formatted}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.25rem' }}>
                                            <div>
                                                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
                                                    Nomor Pelanggan
                                                </span>
                                                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: nb.dark, letterSpacing: '-0.02em' }}>
                                                    {result.phone}
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            {result.is_target_achieved ? (
                                                <span style={{
                                                    background: '#10b981', color: '#ffffff',
                                                    padding: '0.45rem 1rem', borderRadius: '999px',
                                                    border: `2px solid ${nb.dark}`, fontWeight: 900,
                                                    fontSize: '0.85rem', boxShadow: `2px 2px 0px ${nb.dark}`,
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                                }}>
                                                    <i className="fas fa-check-circle" />
                                                    ✓ Target tercapai
                                                </span>
                                            ) : (
                                                <span style={{
                                                    background: '#fef3c7', color: '#b45309',
                                                    padding: '0.45rem 1rem', borderRadius: '999px',
                                                    border: `2px solid #d97706`, fontWeight: 900,
                                                    fontSize: '0.85rem', boxShadow: '2px 2px 0px #d97706',
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                                }}>
                                                    <i className="fas fa-clock" />
                                                    Belum mencapai target
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress Bar Section */}
                                    <div style={{ padding: '1.75rem 1.5rem', borderBottom: `3px solid ${nb.dark}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 900, color: nb.dark, textTransform: 'uppercase' }}>
                                                Progress Pembelian
                                            </span>
                                            <span style={{
                                                fontSize: '1.5rem', fontWeight: 900,
                                                color: result.is_target_achieved ? '#059669' : nb.mid,
                                            }}>
                                                {result.progress_percentage}%
                                            </span>
                                        </div>

                                        {/* Neo-brutalist Progress Track */}
                                        <div style={{
                                            width: '100%', height: '24px', background: '#f1f5f9',
                                            borderRadius: '999px', border: `3px solid ${nb.dark}`,
                                            overflow: 'hidden', padding: '2px', position: 'relative',
                                        }}>
                                            <div style={{
                                                width: `${Math.min(100, result.progress_percentage)}%`,
                                                height: '100%',
                                                background: result.is_target_achieved
                                                    ? 'linear-gradient(90deg, #10b981, #059669)'
                                                    : `linear-gradient(90deg, ${nb.light}, ${nb.mid})`,
                                                borderRadius: '999px',
                                                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                                            }} />
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>
                                            <span>Tercapai: {formatRupiah(result.total_purchase)}</span>
                                            <span>Target: {formatRupiah(result.target_amount)}</span>
                                        </div>
                                    </div>

                                    {/* Metrics Grid */}
                                    <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                        <div style={{
                                            background: '#f8fafc', padding: '1rem',
                                            borderRadius: '14px', border: `2px solid ${nb.dark}`,
                                            boxShadow: '3px 3px 0px rgba(14,70,150,0.15)',
                                        }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>
                                                Total Pembelian
                                            </span>
                                            <span style={{ fontSize: '1.15rem', fontWeight: 900, color: nb.dark }}>
                                                {formatRupiah(result.total_purchase)}
                                            </span>
                                        </div>

                                        <div style={{
                                            background: '#f8fafc', padding: '1rem',
                                            borderRadius: '14px', border: `2px solid ${nb.dark}`,
                                            boxShadow: '3px 3px 0px rgba(14,70,150,0.15)',
                                        }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>
                                                Jumlah Transaksi
                                            </span>
                                            <span style={{ fontSize: '1.15rem', fontWeight: 900, color: nb.dark }}>
                                                {result.transaction_count}x Transaksi
                                            </span>
                                        </div>

                                        <div style={{
                                            background: '#f8fafc', padding: '1rem',
                                            borderRadius: '14px', border: `2px solid ${nb.dark}`,
                                            boxShadow: '3px 3px 0px rgba(14,70,150,0.15)',
                                        }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>
                                                Target Pembelian
                                            </span>
                                            <span style={{ fontSize: '1.15rem', fontWeight: 900, color: nb.dark }}>
                                                {formatRupiah(result.target_amount)}
                                            </span>
                                        </div>

                                        <div style={{
                                            background: result.is_target_achieved ? '#ecfdf5' : '#fef2f2', padding: '1rem',
                                            borderRadius: '14px', border: `2px solid ${result.is_target_achieved ? '#059669' : '#dc2626'}`,
                                            boxShadow: `3px 3px 0px ${result.is_target_achieved ? 'rgba(5,150,105,0.2)' : 'rgba(220,38,38,0.2)'}`,
                                        }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: result.is_target_achieved ? '#047857' : '#b91c1c', textTransform: 'uppercase', display: 'block' }}>
                                                {result.is_target_achieved ? 'Kelebihan' : 'Kurang'}
                                            </span>
                                            <span style={{ fontSize: '1.15rem', fontWeight: 900, color: result.is_target_achieved ? '#047857' : '#b91c1c' }}>
                                                {result.is_target_achieved
                                                    ? `+ ${formatRupiah(result.total_purchase - result.target_amount)}`
                                                    : formatRupiah(result.remaining_amount)
                                                }
                                            </span>
                                        </div>
                                    </div>

                                    {/* Realtime Footer Status */}
                                    <div style={{
                                        background: '#f8fafc', borderTop: '2px solid #e2e8f0',
                                        padding: '0.85rem 1.5rem', display: 'flex',
                                        alignItems: 'center', justifyContent: 'space-between',
                                        fontSize: '0.75rem', fontWeight: 700, color: '#64748b',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{
                                                width: '8px', height: '8px', borderRadius: '50%',
                                                background: wsConnected ? '#10b981' : '#f59e0b',
                                                boxShadow: wsConnected ? '0 0 6px #10b981' : 'none',
                                            }} />
                                            <span>{wsConnected ? 'Live Realtime Terhubung' : 'Terhubung Standar'}</span>
                                        </div>
                                        <span>Update Otomatis</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bottom Security Note */}
                    <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, marginTop: '2.5rem' }}>
                        🔒 Sistem pembacaan progress resmi ND-HOTSPOT. Data diperbarui otomatis setiap kali pembayaran voucher berhasil.
                    </p>
                </div>
            </div>
        </PublicLayout>
    )
}
