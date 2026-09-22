import { useState } from 'react'

const Footer = () => {
    const [showLog, setShowLog] = useState(false)

    const updates = [
        {
            version: 'ND-2.9',
            date: '22 Sep 2026',
            changes: [
                'Perbaikan stabilitas sistem notifikasi WhatsApp',
                'Optimasi kecepatan pengiriman pesan otomatis',
                'Peningkatan keamanan sistem pembayaran',
                'Perbaikan format tampilan informasi voucher',
            ]
        }
    ]

    return (
        <footer style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '3rem 1.5rem 5rem' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
                        © 2026 ND-NETWORK • POWERED BY <span style={{ color: '#00a884', fontWeight: 700 }}>CODEBYFAREL SOFTWARE</span>
                    </p>

                    <p 
                        onClick={() => setShowLog(!showLog)}
                        style={{ 
                            fontSize: '0.65rem', fontWeight: 800, color: '#00a884', 
                            textTransform: 'uppercase', letterSpacing: '0.1em', 
                            marginBottom: '1rem', cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: '0.35rem'
                        }}
                    >
                        <i className={`fas fa-chevron-${showLog ? 'up' : 'down'}`} style={{ fontSize: '0.55rem' }} />
                        Sistem v2.9 — Lihat Pembaruan
                    </p>

                    {showLog && (
                        <div style={{ 
                            textAlign: 'left', maxWidth: '480px', margin: '0 auto 1.5rem',
                            background: '#f8fafc', borderRadius: '16px',
                            border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                            padding: '1.25rem', fontSize: '0.78rem'
                        }}>
                            {updates.map((u, i) => (
                                <div key={u.version} style={{ marginBottom: i < updates.length - 1 ? '1rem' : 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                        <span style={{ 
                                            background: '#00a884', color: '#fff',
                                            fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.6rem',
                                            borderRadius: '9999px', textTransform: 'uppercase'
                                        }}>{u.version}</span>
                                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>{u.date}</span>
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#475569', lineHeight: 1.8 }}>
                                        {u.changes.map((c, j) => (
                                            <li key={j}>{c}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </footer>
    )
}

export default Footer
