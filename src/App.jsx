import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import VoucherPlans from './pages/admin/VoucherPlans'
import VoucherStock from './pages/admin/VoucherStock'
import WhatsAppSettings from './pages/admin/WhatsAppSettings'
import Checkout from './pages/Checkout'
import CustomerManagement from './pages/admin/CustomerManagement'
import BillLookup from './pages/BillLookup'
import VoucherOnline from './pages/admin/VoucherOnline'
import VoucherSold from './pages/admin/VoucherSold'
import RadiusSettings from './pages/admin/RadiusSettings'
import NetworkCenter from './pages/admin/NetworkCenter'
import CheckVoucher from './pages/CheckVoucher'
import Maintenance from './pages/Maintenance'
import PaymentSuccess from './pages/PaymentSuccess'
import GamingArea from './pages/GamingArea'
import GamingCheckout from './pages/GamingCheckout'
import GamingSuccess from './pages/GamingSuccess'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PublicLayout from './components/PublicLayout'
import { VoucherSkeleton } from './components/Skeleton'
import axios from 'axios'

// Configure Axios Defaults
const bypassToken = localStorage.getItem('maintenance_bypass');
if (bypassToken) {
  axios.defaults.headers.common['X-Maintenance-Bypass'] = bypassToken;
}

// Global Response Interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const isMaintenancePage = window.location.pathname === '/maintenance';
    if (error.response?.status === 503 && error.response?.data?.error === 'maintenance_mode') {
      if (!isMaintenancePage) {
        window.location.href = '/maintenance';
      }
    }
    return Promise.reject(error);
  }
);

import OltManagement from './pages/admin/OltManagement'

// Private Route Component
const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token')
  return isAuthenticated ? children : <Navigate to="/portal-secret-nd-admin" />
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/gaming-area" element={<GamingArea />} />
        <Route path="/gaming-checkout" element={<GamingCheckout />} />
        <Route path="/gaming-success" element={<GamingSuccess />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/check-voucher" element={<CheckVoucher />} />
        <Route path="/payment" element={<BillLookup />} />
        <Route path="/bill-lookup" element={<BillLookup />} />

        {/* HIDDEN ADMIN LOGIN */}
        <Route path="/portal-secret-nd-admin" element={<AdminLogin />} />

        {/* PROTECTED ADMIN ROUTES */}
        <Route element={<PrivateRoute><AdminLayoutWrapper /></PrivateRoute>}>
          <Route path="/admin-dashboard-access-granted" element={<AdminDashboard />} />
          <Route path="/admin/vouchers" element={<VoucherStock />} />
          <Route path="/admin/vouchers-online" element={<VoucherOnline />} />
          <Route path="/admin/vouchers-sold" element={<VoucherSold />} />
          <Route path="/admin/network-center" element={<NetworkCenter />} />
          <Route path="/admin/olt-management" element={<OltManagement />} />
          <Route path="/admin/radius-settings" element={<RadiusSettings />} />
          <Route path="/admin/voucher-plans" element={<VoucherPlans />} />
          <Route path="/admin/whatsapp" element={<WhatsAppSettings />} />
          <Route path="/admin/customers" element={<CustomerManagement />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

// Wrapper to provide AdminLayout to sub-routes
import AdminLayout from './components/AdminLayout'
import { Outlet } from 'react-router-dom'
const AdminLayoutWrapper = () => {
  // We can extract title/subtitle from location if needed, 
  // but for now let's keep it simple or use a context.
  return (
    <AdminLayout title="Admin System" subtitle="Management & Monitoring Core">
      <Outlet />
    </AdminLayout>
  )
}

// Icon Helper Component (Font Awesome style)
export const FaIcon = ({ name, className = "" }) => (
  <i className={`fas fa-${name} ${className}`}></i>
)

function Home() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const navigate = useNavigate()

  const toggleMenu = () => setShowMenu(!showMenu);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/voucher-plans?is_gaming=false`)
        setPlans(res.data || [])
      } catch (err) {
        console.error('Failed to fetch plans')
      } finally {
        setLoading(false)
      }
    }

    const logVisit = async () => {
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/log-visit`, { page: 'home' })
      } catch (err) {
        // Silently fail
      }
    }

    fetchPlans()
    logVisit()
  }, [])

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/6285129391531?text=Halo%20ND-HOTSPOT%20,%20saya%20ingin%20bertanya%20tentang%20voucher%20internet', '_blank');
  };

  return (
    <PublicLayout>

      {/* Hero Section - Neo Brutalism */}
      <section className="lg:hidden" style={{ position: 'relative', paddingTop: '2rem', paddingBottom: '2rem', overflow: 'hidden', background: '#ffffff' }}>
        {/* Background Image with Effects */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img src="/logo-wifi-section.png" alt="Background" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.08 }} />
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem', textAlign: 'center', position: 'relative', zIndex: 10 }} className="lg:text-left">
          <div className="lg:flex items-center justify-between">


            {/* Quick Actions Mobile */}
            <div className="grid grid-cols-2 gap-3 lg:hidden" style={{ marginTop: '2rem' }}>
              <Link to="/payment" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                padding: '0.85rem', borderRadius: '12px',
                background: 'linear-gradient(135deg, #0e4696, #1877f2)',
                color: '#fff', fontWeight: 800, fontSize: '0.75rem',
                border: '3px solid #0e4696', boxShadow: '4px 4px 0px #0e4696',
                textDecoration: 'none', textTransform: 'uppercase',
              }}>
                <i className="fas fa-credit-card" /> Bayar Tagihan
              </Link>
              <Link to="/check-voucher" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                padding: '0.85rem', borderRadius: '12px',
                background: '#ffffff',
                color: '#0e4696', fontWeight: 800, fontSize: '0.75rem',
                border: '3px solid #0e4696', boxShadow: '4px 4px 0px #0e4696',
                textDecoration: 'none', textTransform: 'uppercase',
              }}>
                <i className="fas fa-search" /> Cek Voucher
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Grid - Neo Brutalism, single dark blue */}
      <section id="packages" style={{ padding: '3rem 0', background: '#ffffff', flex: 1 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #0e4696, #1877f2)',
              border: '3px solid #0e4696', boxShadow: '3px 3px 0px #0e4696',
              marginBottom: '0.5rem', color: '#fff', fontSize: '1.25rem',
            }}>
              <FaIcon name="wifi" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0e4696', letterSpacing: '-0.03em', marginBottom: 0 }}>Pilih Paket Voucher</h2>
            <p style={{ color: '#64748b', fontWeight: 700, marginTop: '0.25rem', fontSize: '0.8rem' }}>Koneksi cepat untuk aktivitas online Anda</p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => <div key={i} className="w-full max-w-[340px]"><VoucherSkeleton /></div>)
            ) : (
              plans.map((plan, index) => (
                <div key={plan.id} className="w-full max-w-[340px]" style={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '3px solid #0e4696',
                  boxShadow: '6px 6px 0px #0e4696',
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#ffffff',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translate(-3px, -3px)'; e.currentTarget.style.boxShadow = '9px 9px 0px #0e4696' }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = '6px 6px 0px #0e4696' }}
                >
                  {index === 2 && (
                    <div style={{
                      position: 'absolute', top: 0, right: 0,
                      background: '#0e4696', color: '#fff',
                      fontSize: '0.6rem', fontWeight: 900,
                      padding: '0.4rem 0.8rem',
                      borderBottomLeftRadius: '12px',
                      zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.3rem',
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                    }}>
                      <i className="fas fa-fire" style={{ color: '#fbbf24' }} /> BEST SELLER
                    </div>
                  )}

                  {/* Top gradient bar */}
                  <div style={{ height: '6px', background: 'linear-gradient(90deg, #1877f2, #60a5fa)' }} />

                  <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                      <div style={{ textAlign: 'left' }}>
                        <h3 style={{ fontWeight: 900, fontSize: '1.5rem', color: '#0e4696', lineHeight: 1, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>{plan.name}</h3>
                        <p style={{ color: '#64748b', fontSize: '0.6rem', marginTop: '0.5rem', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem', letterSpacing: '0.1em' }}>
                          <i className="fas fa-clock" style={{ fontSize: '0.55rem' }} /> Aktif {plan.duration.endsWith('h') ? plan.duration.replace('h', ' Jam') : plan.duration.endsWith('d') ? plan.duration.replace('d', ' Hari') : plan.duration.replace('m', ' Bulan')} UNLIMITED
                        </p>
                      </div>
                      <div style={{
                        width: '48px', height: '48px',
                        background: 'linear-gradient(135deg, #0e4696, #1877f2)',
                        borderRadius: '14px',
                        border: '2px solid #0e4696',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '1.2rem', flexShrink: 0,
                      }}>
                        <FaIcon name="wifi" />
                      </div>
                    </div>

                    <div style={{ height: '3px', background: '#0e4696', margin: '0 0 1.5rem', opacity: 0.15 }} />

                    <div style={{ marginBottom: '1.75rem', textAlign: 'left' }}>
                      <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0e4696', letterSpacing: '-0.03em' }}>Rp {plan.price.toLocaleString()}</div>
                      <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginTop: '0.25rem', letterSpacing: '0.15em' }}>Unlimited Access</div>
                    </div>

                    <button
                      onClick={() => navigate('/checkout', { state: { plan } })}
                      style={{
                        width: '100%',
                        padding: '0.9rem',
                        background: 'linear-gradient(135deg, #0e4696, #1877f2)',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        borderRadius: '12px',
                        border: '3px solid #0e4696',
                        boxShadow: '4px 4px 0px #0e4696',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      }}
                      onMouseDown={(e) => { e.currentTarget.style.transform = 'translate(3px, 3px)'; e.currentTarget.style.boxShadow = '1px 1px 0px #0e4696' }}
                      onMouseUp={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = '4px 4px 0px #0e4696' }}
                    >
                      <i className="fas fa-shopping-cart" /> Beli Sekarang
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* High-Speed Zone Section (was Gaming Area) - Neo Brutalism */}
      {!loading && (
        <section style={{ padding: '5rem 0', background: '#ffffff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem', position: 'relative', zIndex: 10 }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '24px',
              border: '3px solid #0e4696',
              boxShadow: '8px 8px 0px #0e4696',
              padding: '3rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2rem',
            }} className="lg:flex-row lg:p-16">

              <div className="lg:w-1/2 text-center lg:text-left">
                <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, color: '#0e4696', lineHeight: 0.95, letterSpacing: '-0.04em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                  ZONA<br/>
                  <span style={{ color: '#60a5fa' }}>KECEPATAN</span>
                </h2>

                <p style={{ color: '#64748b', fontWeight: 700, fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '500px' }}>
                  Streaming YouTube tanpa buffering, push rank tanpa lag, dan live streaming tanpa gangguan. Bandwidth prioritas untuk semua aktivitas online Anda.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }} className="lg:justify-start">
                  {[
                    { icon: 'play-circle', label: 'YouTube', color: '#ef4444' },
                    { icon: 'gamepad', label: 'Gaming', color: '#8b5cf6' },
                    { icon: 'video', label: 'Live Stream', color: '#60a5fa' },
                    { icon: 'bolt', label: 'Turbo Speed', color: '#f59e0b' },
                  ].map((tag) => (
                    <div key={tag.label} style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.6rem 1rem',
                      background: '#ffffff',
                      border: '2px solid #0e4696',
                      borderRadius: '10px',
                      boxShadow: '3px 3px 0px #0e4696',
                    }}>
                      <i className={`fas fa-${tag.icon}`} style={{ color: tag.color }} />
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0e4696', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{tag.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:w-1/2 flex flex-col items-center lg:items-end">
                <Link to="/gaming-area" style={{
                  width: '100%', maxWidth: '380px',
                  padding: '1.25rem',
                  background: 'linear-gradient(135deg, #1877f2, #60a5fa)',
                  color: '#fff',
                  borderRadius: '16px',
                  border: '3px solid #0e4696',
                  boxShadow: '6px 6px 0px #0e4696',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  fontSize: '0.85rem',
                  letterSpacing: '0.15em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'translate(4px, 4px)'; e.currentTarget.style.boxShadow = '2px 2px 0px #0e4696' }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = '6px 6px 0px #0e4696' }}
                >
                  BUKA ZONA KECEPATAN <i className="fas fa-chevron-right" />
                </Link>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* Cara Beli Section - Neo Brutalism */}
      <section style={{ padding: '4rem 0', background: '#f8fafc', borderTop: '3px solid #0e4696' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0e4696', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Cara Beli Voucher</h2>
            <p style={{ color: '#64748b', fontWeight: 700, marginTop: '0.25rem' }}>3 langkah mudah mendapatkan voucher internet</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: '1', icon: 'mouse-pointer', title: 'Pilih Paket', desc: 'Tentukan durasi internet sesuai kebutuhan aktivitas online Anda.', color: '#60a5fa' },
              { num: '2', icon: 'qrcode', title: 'Scan QRIS', desc: 'Bayar instan via Dana, OVO, Gopay, atau aplikasi M-Banking Anda.', color: '#0e4696' },
              { num: '3', icon: 'ticket-alt', title: 'Voucher Aktif', desc: 'Kode voucher langsung aktif dan dikirimkan otomatis ke WhatsApp Anda.', color: '#1877f2' },
            ].map((step) => (
              <div key={step.num} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                background: '#ffffff',
                padding: '2rem',
                borderRadius: '18px',
                border: '3px solid #0e4696',
                boxShadow: '5px 5px 0px #0e4696',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translate(-3px, -3px)'; e.currentTarget.style.boxShadow = '8px 8px 0px #0e4696' }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = '5px 5px 0px #0e4696' }}
              >
                <div style={{
                  width: '56px', height: '56px',
                  background: step.color, color: '#fff',
                  borderRadius: '14px',
                  border: '3px solid #0e4696',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1rem', fontWeight: 900, fontSize: '1.5rem',
                }}>{step.num}</div>
                <div style={{
                  width: '44px', height: '44px',
                  background: '#f1f5f9',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '0.75rem', color: step.color, fontSize: '1.2rem',
                }}>
                  <FaIcon name={step.icon} />
                </div>
                <h4 style={{ fontWeight: 900, color: '#0e4696', fontSize: '1.05rem', marginBottom: '0.5rem' }}>{step.title}</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Bottom Nav - Neo Brutalism */}
      <div className="lg:hidden fixed left-0 right-0 z-50 bottom-0" style={{
        background: '#ffffff',
        borderTop: '3px solid #0e4696',
      }}>
        <div className="grid grid-cols-4" style={{ padding: '0.6rem 0' }}>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#0e4696' }}>
            <FaIcon name="home" className="text-xl" style={{ marginBottom: '2px' }} />
            <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase' }}>Home</span>
          </button>
          <button onClick={() => document.getElementById('packages').scrollIntoView({ behavior: 'smooth' })} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#60a5fa' }}>
            <FaIcon name="wifi" className="text-xl" style={{ marginBottom: '2px' }} />
            <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase' }}>Paket</span>
          </button>
          <button onClick={handleWhatsAppClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#25D366' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ marginBottom: '2px' }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase' }}>WA</span>
          </button>
          <Link to="/check-voucher" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: '#64748b' }}>
            <FaIcon name="search" className="text-xl" style={{ marginBottom: '2px' }} />
            <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase' }}>Cek</span>
          </Link>
        </div>
      </div>
    </PublicLayout>
  )
}

export default App
