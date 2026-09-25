import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

const PublicLayout = ({ children }) => {
    const [showMenu, setShowMenu] = useState(false)
    const toggleMenu = () => setShowMenu(!showMenu)

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }} className="pt-16 lg:pt-0">
            <Navbar toggleMenu={toggleMenu} />

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 z-[100] transition-all duration-300 lg:hidden ${showMenu ? 'visible opacity-100' : 'invisible opacity-0'}`}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }} onClick={toggleMenu} />
                <div className={`absolute right-0 top-0 bottom-0 w-[82%] max-w-sm transition-transform duration-300 transform ${showMenu ? 'translate-x-0' : 'translate-x-full'} flex flex-col bg-white shadow-2xl`}
                >
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                width: '38px', height: '38px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'linear-gradient(135deg, #00a884, #00c298)',
                                borderRadius: '12px',
                                boxShadow: '0 4px 10px rgba(0, 168, 132, 0.3)',
                                padding: '6px',
                            }}>
                                <img src="/logo-wifi.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                            </div>
                            <span style={{ fontWeight: 900, color: '#1e293b', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>ND-<span style={{ color: '#00a884' }}>HOTSPOT</span></span>
                        </div>
                        <button onClick={toggleMenu} style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#64748b', cursor: 'pointer', fontSize: '1rem',
                        }}>
                            <i className="fas fa-times" />
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {[
                            { to: '/', icon: 'home', label: 'Beranda' },
                            { to: '/loyalty', icon: 'gift', label: 'Event Loyalty & Reward', highlight: true },
                            { to: '/check-voucher', icon: 'search', label: 'Cek Voucher' },
                            { to: '/payment', icon: 'credit-card', label: 'Bayar Tagihan' },
                        ].map((item) => (
                            <Link key={item.to} to={item.to} onClick={toggleMenu} style={{
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                padding: '0.9rem 1.15rem', borderRadius: '16px',
                                background: item.highlight ? 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)' : '#ffffff',
                                border: item.highlight ? '1px solid #a7f3d0' : '1px solid #f1f5f9',
                                boxShadow: item.highlight ? '0 4px 14px rgba(0, 168, 132, 0.12)' : '0 4px 14px rgba(0,0,0,0.03)',
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                                position: 'relative',
                            }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '12px',
                                    background: item.highlight ? '#00a884' : '#ecfdf5',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: item.highlight ? '#ffffff' : '#00a884', fontSize: '1rem',
                                }}>
                                    <i className={`fas fa-${item.icon}`} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>{item.label}</span>
                                    {item.highlight && (
                                        <span style={{ fontSize: '0.68rem', color: '#00a884', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Klaim Otomatis • Cek Reward
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {children}
            </div>

            <Footer />
        </div>
    )
}

export default PublicLayout
