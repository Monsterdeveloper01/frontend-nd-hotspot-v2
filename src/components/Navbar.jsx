import { Link } from 'react-router-dom'

const Navbar = ({ toggleMenu }) => {
    const nb = { dark: '#0e4696', mid: '#1877f2', light: '#60a5fa' }

    return (
        <>
            {/* Mobile Header Bar - Neo Brutalism */}
            <div className="lg:hidden fixed left-0 right-0 z-50 top-0" style={{
                background: '#ffffff',
                borderBottom: `3px solid ${nb.dark}`,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                        <div style={{
                            width: '42px', height: '42px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`,
                            borderRadius: '12px',
                            border: `3px solid ${nb.dark}`,
                            boxShadow: `3px 3px 0px ${nb.dark}`,
                            padding: '6px',
                        }}>
                            <img src="/logo-wifi.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                        </div>
                        <span style={{ fontWeight: 900, fontSize: '1.1rem', color: nb.dark, letterSpacing: '-0.03em' }}>
                            ND-HOTSPOT
                        </span>
                    </Link>
                    <button onClick={toggleMenu} style={{
                        width: '42px', height: '42px', borderRadius: '12px',
                        background: '#ffffff',
                        border: `3px solid ${nb.dark}`,
                        boxShadow: `3px 3px 0px ${nb.dark}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: nb.dark, cursor: 'pointer', fontSize: '1.1rem',
                    }}
                    onMouseDown={(e) => { e.currentTarget.style.transform = 'translate(2px, 2px)'; e.currentTarget.style.boxShadow = `1px 1px 0px ${nb.dark}` }}
                    onMouseUp={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = `3px 3px 0px ${nb.dark}` }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = `3px 3px 0px ${nb.dark}` }}
                    >
                        <i className="fas fa-bars" />
                    </button>
                </div>
            </div>

            {/* Desktop Header - Neo Brutalism */}
            <header className="hidden lg:block sticky top-0 z-40 w-full" style={{
                background: '#ffffff',
                borderBottom: `3px solid ${nb.dark}`,
            }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
                        <div style={{
                            width: '48px', height: '48px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`,
                            borderRadius: '14px',
                            border: `3px solid ${nb.dark}`,
                            boxShadow: `4px 4px 0px ${nb.dark}`,
                            padding: '8px',
                        }}>
                            <img src="/logo-wifi.png" alt="ND-HOTSPOT Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: nb.dark, letterSpacing: '-0.04em', margin: 0 }}>
                            ND-HOTSPOT
                        </h1>
                    </Link>
                    
                    <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {[
                            { to: '/', label: 'Home', icon: 'home', type: 'fas' },
                            { to: '/payment', label: 'Bayar Tagihan', icon: 'credit-card', type: 'fas' },
                            { to: '/check-voucher', label: 'Cek Voucher', icon: 'search', type: 'fas' },
                        ].map((item) => (
                            <Link key={item.to} to={item.to} style={{
                                padding: '0.6rem 1.25rem',
                                borderRadius: '10px',
                                border: `2px solid ${nb.dark}`,
                                background: '#ffffff',
                                color: nb.dark,
                                fontWeight: 800,
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                textDecoration: 'none',
                                boxShadow: `3px 3px 0px ${nb.dark}`,
                                transition: 'all 0.15s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = `linear-gradient(135deg, ${nb.mid}, ${nb.light})`; e.currentTarget.style.color = '#fff' }}
                            onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = nb.dark }}
                            onMouseDown={(e) => { e.currentTarget.style.transform = 'translate(2px, 2px)'; e.currentTarget.style.boxShadow = `1px 1px 0px ${nb.dark}` }}
                            onMouseUp={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = `3px 3px 0px ${nb.dark}` }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = `3px 3px 0px ${nb.dark}`; e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = nb.dark }}
                            >
                                <i className={`${item.type} fa-${item.icon}`} style={{ fontSize: '0.7rem', color: item.color || 'inherit' }} />
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </header>
        </>
    )
}

export default Navbar
