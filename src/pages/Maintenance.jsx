import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import PublicLayout from '../components/PublicLayout'

const nb = { dark: '#0e4696', mid: '#1877f2', light: '#60a5fa' }

const Maintenance = () => {
    const [showBypass, setShowBypass] = useState(false)
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [clickCount, setClickCount] = useState(0)
    const [currentSessionId, setCurrentSessionId] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/maintenance/status`)
                setCurrentSessionId(res.data.session_id)
                if (!res.data.maintenance_mode) {
                    navigate('/')
                }
            } catch (err) {
                console.error('Status check failed')
            }
        }
        checkStatus()
    }, [navigate])

    const handleLogoClick = () => {
        setClickCount(prev => prev + 1)
        if (clickCount >= 4) {
            setShowBypass(true)
            setClickCount(0)
        }
    }

    const handleBypass = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/maintenance/bypass`, { password })
            if (res.data.success) {
                document.cookie = `maintenance_bypass=${res.data.token}; path=/; max-age=` + (24 * 60 * 60);
                localStorage.setItem('maintenance_bypass', res.data.token);
                axios.defaults.headers.common['X-Maintenance-Bypass'] = res.data.token;
                window.location.href = '/';
            }
        } catch (err) {
            alert('Akses Ditolak: Password Salah')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
            <div style={{ width: '100%', maxWidth: '36rem', margin: '0 auto', position: 'relative', zIndex: 10 }}>
                <div style={{ background: '#fff', borderRadius: '24px', border: `3px solid ${nb.dark}`, boxShadow: `10px 10px 0px ${nb.dark}`, overflow: 'hidden' }}>
                    <div style={{ background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`, padding: '2.5rem 2rem 3rem', textAlign: 'center', color: '#fff', borderBottom: `3px solid ${nb.dark}` }}>
                        <div 
                            onClick={handleLogoClick}
                            style={{ width: '72px', height: '72px', background: '#fff', borderRadius: '20px', border: `3px solid ${nb.dark}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem', color: nb.mid, boxShadow: `4px 4px 0px ${nb.dark}`, cursor: 'pointer' }}
                        >
                            <i className="fas fa-tools" />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.04em', marginBottom: '0.5rem', lineHeight: 1 }}>Sistem Dalam Pemeliharaan</h1>
                        <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.9 }}>Sedang Meningkatkan Kualitas Layanan</p>
                    </div>

                    <div style={{ padding: '2.5rem' }}>
                        <div style={{ background: '#fffbeb', borderRadius: '16px', border: `3px solid #f59e0b`, padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <div style={{ width: '48px', height: '48px', background: '#f59e0b', color: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', border: '2px solid #b45309', flexShrink: 0 }}>
                                <i className="fas fa-exclamation-triangle" />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.7rem', fontWeight: 900, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Informasi Gangguan</p>
                                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400e', lineHeight: 1.6 }}>Mohon maaf, layanan internet kami sedang dalam perbaikan untuk memberikan koneksi yang lebih stabil. Harap tunggu sementara teknisi kami bekerja.</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                            <div style={{ background: '#f8fafc', padding: '1.25rem 0.5rem', borderRadius: '16px', border: `2px solid ${nb.dark}30` }}>
                                <i className="fas fa-server" style={{ color: nb.mid, fontSize: '1.25rem', marginBottom: '0.5rem' }} />
                                <p style={{ fontSize: '0.55rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Server Core</p>
                                <p style={{ fontSize: '0.75rem', fontWeight: 900, color: nb.dark, marginTop: '0.2rem' }}>Upgrading</p>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '1.25rem 0.5rem', borderRadius: '16px', border: `2px solid ${nb.dark}30` }}>
                                <i className="fas fa-network-wired" style={{ color: '#10b981', fontSize: '1.25rem', marginBottom: '0.5rem' }} />
                                <p style={{ fontSize: '0.55rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Jaringan</p>
                                <p style={{ fontSize: '0.75rem', fontWeight: 900, color: nb.dark, marginTop: '0.2rem' }}>Optimizing</p>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '1.25rem 0.5rem', borderRadius: '16px', border: `2px solid ${nb.dark}30` }}>
                                <i className="fas fa-shield-alt" style={{ color: '#f59e0b', fontSize: '1.25rem', marginBottom: '0.5rem' }} />
                                <p style={{ fontSize: '0.55rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Keamanan</p>
                                <p style={{ fontSize: '0.75rem', fontWeight: 900, color: nb.dark, marginTop: '0.2rem' }}>Securing</p>
                            </div>
                        </div>
                    </div>
                </div>

                {showBypass && (
                    <div style={{ background: '#fff', borderRadius: '24px', border: `3px solid ${nb.dark}`, boxShadow: `6px 6px 0px ${nb.dark}`, padding: '2rem', marginTop: '2rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 900, color: nb.dark, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <i className="fas fa-lock" style={{ color: '#ef4444' }} /> Akses Administratif
                        </h3>
                        <form onSubmit={handleBypass}>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Masukkan Password Bypass"
                                style={{ width: '100%', padding: '1rem', background: '#f8fafc', border: `3px solid ${nb.dark}`, borderRadius: '12px', fontWeight: 900, fontSize: '1rem', textAlign: 'center', outline: 'none', color: nb.dark, marginBottom: '1rem', boxSizing: 'border-box' }}
                            />
                            <button type="submit" disabled={loading} style={{
                                width: '100%', padding: '1rem', background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`, color: '#fff', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.8rem', borderRadius: '12px', border: `3px solid ${nb.dark}`, boxShadow: `4px 4px 0px ${nb.dark}`, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '1rem'
                            }}>
                                {loading ? 'Memproses...' : 'Buka Kunci Akses'}
                            </button>
                            <button type="button" onClick={() => setShowBypass(false)} style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: 'none', color: '#94a3b8', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.65rem', cursor: 'pointer' }}>
                                Batal
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Maintenance
