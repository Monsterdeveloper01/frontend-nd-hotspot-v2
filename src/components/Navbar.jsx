import { Link } from 'react-router-dom'

const Navbar = ({ toggleMenu }) => {
    return (
        <>
            {/* Mobile Header Bar */}
            <div className="lg:hidden fixed left-0 right-0 z-50 top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                        <div style={{
                            width: '40px', height: '40px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'linear-gradient(135deg, #00a884, #00c298)',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0, 168, 132, 0.3)',
                            padding: '6px',
                        }}>
                            <img src="/logo-wifi.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                        </div>
                        <span style={{ fontWeight: 900, fontSize: '1.15rem', color: '#1e293b', letterSpacing: '-0.02em' }}>
                            ND-<span style={{ color: '#00a884' }}>HOTSPOT</span>
                        </span>
                    </Link>
                    <button 
                        onClick={toggleMenu} 
                        style={{
                            width: '40px', height: '40px', borderRadius: '12px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#1e293b', cursor: 'pointer', fontSize: '1.1rem',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <i className="fas fa-bars" />
                    </button>
                </div>
            </div>

            {/* Desktop Header */}
            <header className="hidden lg:block sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.85rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none' }}>
                        <div style={{
                            width: '44px', height: '44px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'linear-gradient(135deg, #00a884, #00c298)',
                            borderRadius: '14px',
                            boxShadow: '0 4px 14px rgba(0, 168, 132, 0.3)',
                            padding: '7px',
                        }}>
                            <img src="/logo-wifi.png" alt="ND-HOTSPOT Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                        </div>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.03em', margin: 0 }}>
                            ND-<span style={{ color: '#00a884' }}>HOTSPOT</span>
                        </h1>
                    </Link>
                    
                    <nav style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {[
                            { to: '/', label: 'Home', icon: 'home' },
                            { to: '/payment', label: 'Bayar Tagihan', icon: 'credit-card' },
                            { to: '/check-voucher', label: 'Cek Voucher', icon: 'search' },
                        ].map((item) => (
                            <Link 
                                key={item.to} 
                                to={item.to} 
                                style={{
                                    padding: '0.6rem 1.25rem',
                                    borderRadius: '9999px',
                                    background: '#f8fafc',
                                    color: '#475569',
                                    fontWeight: 700,
                                    fontSize: '0.82rem',
                                    textDecoration: 'none',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                                    border: '1px solid #e2e8f0',
                                    transition: 'all 0.2s ease',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = '#00a884'
                                    e.currentTarget.style.color = '#ffffff'
                                    e.currentTarget.style.borderColor = '#00a884'
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 168, 132, 0.3)'
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = '#f8fafc'
                                    e.currentTarget.style.color = '#475569'
                                    e.currentTarget.style.borderColor = '#e2e8f0'
                                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)'
                                }}
                            >
                                <i className={`fas fa-${item.icon}`} style={{ fontSize: '0.75rem' }} />
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
