import { Link } from 'react-router-dom'

const Footer = () => {
    const nb = { dark: '#0e4696', mid: '#1877f2', light: '#60a5fa' }

    return (
        <footer style={{ background: '#ffffff', borderTop: `3px solid ${nb.dark}`, padding: '3rem 1.5rem' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                {/* Top Section */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', marginBottom: '2.5rem' }}>
                    {/* Brand */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '52px', height: '52px',
                            background: `linear-gradient(135deg, ${nb.mid}, ${nb.light})`,
                            borderRadius: '14px',
                            border: `3px solid ${nb.dark}`,
                            boxShadow: `4px 4px 0px ${nb.dark}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '1.5rem',
                        }}>
                            <i className="fas fa-wifi" />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 900, fontSize: '1.25rem', color: nb.dark, margin: 0, letterSpacing: '-0.03em' }}>ND-HOTSPOT</h3>
                            <p style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700, margin: '0.25rem 0 0', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Internet Cepat & Stabil</p>
                        </div>
                    </div>

                    {/* Feature badges + WhatsApp */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.6rem',
                            padding: '0.6rem 1rem', background: '#ffffff',
                            border: `2px solid ${nb.dark}`, borderRadius: '10px',
                            boxShadow: `3px 3px 0px ${nb.dark}`,
                        }}>
                            <i className="fas fa-shield-alt" style={{ color: '#10b981' }} />
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: nb.dark, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Aman & Terpercaya</span>
                        </div>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.6rem',
                            padding: '0.6rem 1rem', background: '#ffffff',
                            border: `2px solid ${nb.dark}`, borderRadius: '10px',
                            boxShadow: `3px 3px 0px ${nb.dark}`,
                        }}>
                            <i className="fas fa-bolt" style={{ color: '#f59e0b' }} />
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: nb.dark, textTransform: 'uppercase', letterSpacing: '0.1em' }}>High Speed</span>
                        </div>
                        {/* WhatsApp Support - inline SVG */}
                        <a href="https://wa.me/6285129391531" target="_blank" rel="noreferrer" style={{
                            display: 'flex', alignItems: 'center', gap: '0.6rem',
                            padding: '0.6rem 1rem', background: '#ffffff',
                            border: `2px solid ${nb.dark}`, borderRadius: '10px',
                            boxShadow: `3px 3px 0px ${nb.dark}`,
                            textDecoration: 'none', cursor: 'pointer',
                        }}
                        onMouseDown={(e) => { e.currentTarget.style.transform = 'translate(2px, 2px)'; e.currentTarget.style.boxShadow = `1px 1px 0px ${nb.dark}` }}
                        onMouseUp={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = `3px 3px 0px ${nb.dark}` }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = `3px 3px 0px ${nb.dark}` }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.6rem', fontWeight: 800, color: nb.dark, textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1 }}>Support 24/7</span>
                                <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#25D366', letterSpacing: '0.05em', marginTop: '2px' }}>+62 851-2939-1531</span>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Divider */}
                <div style={{ height: '3px', background: nb.dark, marginBottom: '2rem' }} />

                {/* Bottom Section */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        {[
                            { to: '/', label: 'Beranda' },
                            { to: '/check-voucher', label: 'Cek Voucher' },
                            { to: '/payment', label: 'Bayar Tagihan' },
                        ].map((item) => (
                            <Link key={item.to} to={item.to} style={{
                                padding: '0.5rem 1rem', borderRadius: '8px',
                                border: `2px solid ${nb.dark}`, background: '#ffffff',
                                color: nb.dark, fontWeight: 800, fontSize: '0.65rem',
                                textTransform: 'uppercase', letterSpacing: '0.12em',
                                textDecoration: 'none', boxShadow: `2px 2px 0px ${nb.dark}`,
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = nb.dark; e.currentTarget.style.color = '#fff' }}
                            onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = nb.dark }}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1rem' }}>
                        © 2026 ND-NETWORK • POWERED BY <span style={{ color: nb.dark, fontWeight: 500 }}>CODEBYFAREL SOFTWARE</span>
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        <Link to="/privacy" style={{ color: '#94a3b8', textDecoration: 'none' }}>Kebijakan Privasi</Link>
                        <span>•</span>
                        <Link to="/terms" style={{ color: '#94a3b8', textDecoration: 'none' }}>Syarat & Ketentuan</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
