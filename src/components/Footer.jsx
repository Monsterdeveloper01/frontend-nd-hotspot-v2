import { Link } from 'react-router-dom'

const Footer = () => {
    const nb = { dark: '#0e4696', mid: '#1877f2', light: '#60a5fa' }

    return (
        <footer style={{ background: '#ffffff', borderTop: `3px solid ${nb.dark}`, padding: '3rem 1.5rem' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center' }}>

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
