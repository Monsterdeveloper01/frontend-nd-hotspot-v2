import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

const nb = { dark: '#0e4696', mid: '#1877f2', light: '#60a5fa' }

const PublicLayout = ({ children }) => {
    const [showMenu, setShowMenu] = useState(false)
    const toggleMenu = () => setShowMenu(!showMenu)

    return (
        <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', flexDirection: 'column' }} className="pt-16 lg:pt-0">
            <Navbar toggleMenu={toggleMenu} />

            {/* Mobile Menu Overlay - Neo Brutalism */}
            <div className={`fixed inset-0 z-[100] transition-all duration-300 lg:hidden ${showMenu ? 'visible opacity-100' : 'invisible opacity-0'}`}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(30,58,138,0.5)' }} onClick={toggleMenu} />
                <div className={`absolute right-0 top-0 bottom-0 w-[80%] max-w-sm transition-transform duration-300 transform ${showMenu ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}
                    style={{ background: '#ffffff', borderLeft: `3px solid ${nb.dark}` }}
                >
                    <div style={{ padding: '1.5rem', borderBottom: `3px solid ${nb.dark}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                width: '40px', height: '40px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`,
                                borderRadius: '10px',
                                border: `2px solid ${nb.dark}`,
                                boxShadow: `3px 3px 0px ${nb.dark}`,
                            }}>
                                <img src="/logo-wifi.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                            </div>
                            <span style={{ fontWeight: 900, color: nb.dark, fontSize: '1.1rem', letterSpacing: '-0.03em' }}>ND-HOTSPOT</span>
                        </div>
                        <button onClick={toggleMenu} style={{
                            width: '40px', height: '40px', borderRadius: '10px',
                            background: '#ffffff',
                            border: `2px solid ${nb.dark}`,
                            boxShadow: `2px 2px 0px ${nb.dark}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: nb.dark, cursor: 'pointer', fontSize: '1rem',
                        }}>
                            <i className="fas fa-times" />
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {[
                            { to: '/', icon: 'home', label: 'Beranda' },
                            { to: '/check-voucher', icon: 'search', label: 'Cek Voucher' },
                            { to: '/payment', icon: 'credit-card', label: 'Bayar Tagihan' },
                        ].map((item) => (
                            <Link key={item.to} to={item.to} onClick={toggleMenu} style={{
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                padding: '1rem 1.25rem', borderRadius: '14px',
                                border: `3px solid ${nb.dark}`, background: '#ffffff',
                                boxShadow: `4px 4px 0px ${nb.dark}`,
                                textDecoration: 'none',
                            }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '12px',
                                    background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontSize: '1.1rem',
                                }}>
                                    <i className={`fas fa-${item.icon}`} />
                                </div>
                                <span style={{ fontWeight: 800, color: nb.dark, fontSize: '1.05rem' }}>{item.label}</span>
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
