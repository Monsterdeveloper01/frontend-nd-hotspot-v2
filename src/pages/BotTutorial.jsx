import { Link } from 'react-router-dom'
import PublicLayout from '../components/PublicLayout'

const nb = { dark: '#0e4696', mid: '#1877f2', light: '#60a5fa' }

const BotTutorial = () => {
    const waNumber = '6285129391531' // The admin number from backend
    
    const handleWhatsAppClick = () => {
        window.open(`https://wa.me/${waNumber}?text=Halo%20ND-HOTSPOT`, '_blank');
    };

    return (
        <PublicLayout>
            <div style={{
                maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem',
                minHeight: 'calc(100vh - 80px)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '64px', height: '64px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #25D366, #128C7E)',
                        border: '3px solid #128C7E', boxShadow: '4px 4px 0px #128C7E',
                        marginBottom: '1rem', color: '#fff', fontSize: '2rem',
                    }}>
                        <i className="fab fa-whatsapp" />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: nb.dark, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                        Panduan Pintar Bot WhatsApp ND-Hotspot
                    </h1>
                    <p style={{ color: '#64748b', fontWeight: 700, marginTop: '0.75rem' }}>
                        Layanan otomatis 24 Jam siap membantu Anda tanpa perlu antre!
                    </p>
                </div>

                <div style={{
                    background: '#ffffff', borderRadius: '24px',
                    border: `3px solid ${nb.dark}`, boxShadow: `6px 6px 0px ${nb.dark}`,
                    padding: '2rem', marginBottom: '2rem'
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: nb.dark, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <i className="fas fa-robot text-2xl" /> Apa itu Bot ND-Hotspot?
                    </h2>
                    <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: '1rem', fontSize: '0.95rem' }}>
                        <strong>Bot ND-Hotspot</strong> adalah asisten pintar kami di WhatsApp yang menggunakan kecerdasan buatan (AI). Dia bisa membantu Anda membeli voucher internet, mengecek status langganan, hingga menerima keluhan terkait jaringan, <strong>kapan saja (24 Jam)</strong>.
                    </p>
                    <p style={{ color: '#475569', lineHeight: 1.6, fontSize: '0.95rem' }}>
                        Anda seperti sedang mengobrol dengan admin asli, tapi responnya instan dan sangat cepat!
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* FITUR 1 */}
                    <div style={{
                        background: '#f8fafc', borderRadius: '20px',
                        border: `2px solid ${nb.dark}`, boxShadow: `4px 4px 0px ${nb.dark}`,
                        padding: '1.5rem', display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: '#3b82f6', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.25rem', border: '2px solid #1e3a8a'
                            }}>
                                <i className="fas fa-ticket-alt" />
                            </div>
                            <h3 style={{ fontWeight: 800, color: nb.dark, fontSize: '1.1rem', margin: 0 }}>Beli Voucher</h3>
                        </div>
                        <ul style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, paddingLeft: '1.25rem', listStyleType: 'disc', margin: 0 }}>
                            <li>Kirim pesan <strong>"Menu"</strong> atau <strong>"Halo"</strong> ke nomor WhatsApp kami.</li>
                            <li>Pilih menu nomor <strong>1</strong> (Beli Voucher).</li>
                            <li>Pilih paket internet yang Anda inginkan (misal: 2 Jam, 1 Hari, dll).</li>
                            <li>Bot akan mengirimkan gambar <strong>QRIS</strong>.</li>
                            <li>Lakukan pembayaran lewat m-Banking / DANA / OVO. Voucher akan dikirim ke WA Anda secara otomatis detik itu juga!</li>
                        </ul>
                    </div>

                    {/* FITUR 2 */}
                    <div style={{
                        background: '#f8fafc', borderRadius: '20px',
                        border: `2px solid ${nb.dark}`, boxShadow: `4px 4px 0px ${nb.dark}`,
                        padding: '1.5rem', display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: '#10b981', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.25rem', border: '2px solid #064e3b'
                            }}>
                                <i className="fas fa-search" />
                            </div>
                            <h3 style={{ fontWeight: 800, color: nb.dark, fontSize: '1.1rem', margin: 0 }}>Cek Status</h3>
                        </div>
                        <ul style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, paddingLeft: '1.25rem', listStyleType: 'disc', margin: 0 }}>
                            <li>Sama seperti membeli, kirim <strong>"Menu"</strong> terlebih dahulu.</li>
                            <li>Pilih menu nomor <strong>2</strong> (Cek Status Voucher).</li>
                            <li>Ketikkan <strong>kode voucher</strong> Anda.</li>
                            <li>Bot akan memberi tahu Anda sisa kuota, status pemakaian, dan kapan batas waktu voucher tersebut akan habis.</li>
                        </ul>
                    </div>
                    
                    {/* FITUR 3 */}
                    <div style={{
                        background: '#fff1f2', borderRadius: '20px',
                        border: `2px solid #be123c`, boxShadow: `4px 4px 0px #be123c`,
                        padding: '1.5rem', display: 'flex', flexDirection: 'column',
                        gridColumn: '1 / -1'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: '#f43f5e', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.25rem', border: '2px solid #881337'
                            }}>
                                <i className="fas fa-exclamation-triangle" />
                            </div>
                            <h3 style={{ fontWeight: 800, color: '#9f1239', fontSize: '1.1rem', margin: 0 }}>Melaporkan Gangguan / Komplain</h3>
                        </div>
                        <p style={{ color: '#4c1d95', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                            Internet mati atau lelet? Jangan panik, cukup kirimkan keluhan Anda <strong>tanpa harus masuk ke menu</strong>.
                        </p>
                        <ul style={{ color: '#4c1d95', fontSize: '0.9rem', lineHeight: 1.6, paddingLeft: '1.25rem', listStyleType: 'disc', margin: 0 }}>
                            <li>Langsung ketikkan keluhan Anda ke Bot, contoh: <em>"Min, kok wifi di RT 7 mati putus-putus ya?"</em>.</li>
                            <li><strong>Sistem AI (Kecerdasan Buatan)</strong> kami akan langsung menganalisis pesan Anda bahwa itu adalah gangguan.</li>
                            <li>Laporan Anda akan otomatis diteruskan secara kilat ke Layar Monitor Tim Teknisi kami tanpa Anda harus menunggu jawaban dari bot.</li>
                        </ul>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={handleWhatsAppClick} style={{
                        padding: '1rem 2.5rem', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #25D366, #128C7E)',
                        color: '#fff', fontWeight: 900, fontSize: '1.1rem',
                        border: '3px solid #128C7E', boxShadow: '5px 5px 0px #128C7E',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem',
                        transition: 'transform 0.1s ease'
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <i className="fab fa-whatsapp" style={{ fontSize: '1.4rem' }} /> HUBUNGI BOT SEKARANG
                    </button>
                    
                    <Link to="/" style={{
                        color: '#64748b', fontWeight: 700, fontSize: '0.9rem',
                        textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        marginTop: '1rem'
                    }}>
                        <i className="fas fa-arrow-left" /> Kembali ke Halaman Utama
                    </Link>
                </div>
            </div>
        </PublicLayout>
    )
}

export default BotTutorial
