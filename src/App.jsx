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
import EventAnalytics from './pages/admin/EventAnalytics'
import CheckVoucher from './pages/CheckVoucher'
import PublicLoyalty from './pages/PublicLoyalty'
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
    const isAdminRoute = window.location.pathname.startsWith('/admin') || window.location.pathname === '/portal-secret-nd-admin';
    if (error.response?.status === 503 && error.response?.data?.error === 'maintenance_mode') {
      if (!isMaintenancePage && !isAdminRoute) {
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

// Public Maintenance Guard
const PublicMaintenanceGuard = () => {
  const [loading, setLoading] = useState(true)
  const [inMaintenance, setInMaintenance] = useState(false)

  useEffect(() => {
    let isMounted = true

    const checkMaintenance = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/maintenance/status`)
        if (!isMounted) return

        if (res.data.maintenance_mode) {
          const bypassToken = localStorage.getItem('maintenance_bypass')
          if (bypassToken && res.data.session_id && bypassToken === res.data.session_id) {
            axios.defaults.headers.common['X-Maintenance-Bypass'] = bypassToken
            setInMaintenance(false)
          } else {
            localStorage.removeItem('maintenance_bypass')
            delete axios.defaults.headers.common['X-Maintenance-Bypass']
            setInMaintenance(true)
          }
        } else {
          setInMaintenance(false)
        }
      } catch (err) {
        if (err.response?.status === 503 && err.response?.data?.error === 'maintenance_mode') {
          if (isMounted) setInMaintenance(true)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    checkMaintenance()
    return () => { isMounted = false }
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #0e4696', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
      </div>
    )
  }

  if (inMaintenance) {
    return <Navigate to="/maintenance" replace />
  }

  return <Outlet />
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Protected by Public Maintenance Guard */}
        <Route element={<PublicMaintenanceGuard />}>
          <Route path="/" element={<Home />} />
          <Route path="/gaming-area" element={<GamingArea />} />
          <Route path="/gaming-checkout" element={<GamingCheckout />} />
          <Route path="/gaming-success" element={<GamingSuccess />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/check-voucher" element={<CheckVoucher />} />
          <Route path="/loyalty" element={<PublicLoyalty />} />
          <Route path="/payment" element={<BillLookup />} />
          <Route path="/bill-lookup" element={<BillLookup />} />
        </Route>

        {/* Maintenance Page */}
        <Route path="/maintenance" element={<Maintenance />} />

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
          <Route path="/admin/event-analytics" element={<EventAnalytics />} />
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
  const [activeEvent, setActiveEvent] = useState(null)
  const [showTermsModal, setShowTermsModal] = useState(false)
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

    const fetchActiveEvent = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/loyalty/active-event`)
        if (res.data?.has_active_event) {
          setActiveEvent(res.data.event)
        }
      } catch (err) {
        // Silently fail
      }
    }

    fetchPlans()
    logVisit()
    fetchActiveEvent()
  }, [])

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/6285129391531?text=/menu', '_blank');
  };

  return (
    <PublicLayout>

      {/* Quick Action Buttons on Mobile */}
      <section className="lg:hidden" style={{ position: 'relative', paddingTop: '1.25rem', paddingBottom: '0.25rem', overflow: 'hidden', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.25rem', textAlign: 'center', position: 'relative', zIndex: 10 }}>

          {/* Quick Action Pill Buttons (3-Column Layout with Loyalty Button) */}
          <div className="grid grid-cols-3 gap-2" style={{ maxWidth: '420px', margin: '0 auto' }}>
            <Link to="/payment" className="btn-nd-pill" style={{ fontSize: '0.74rem', padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' }}>
              <i className="fas fa-credit-card" /> Bayar Tagihan
            </Link>
            <Link to="/check-voucher" className="btn-nd-pill" style={{
              fontSize: '0.74rem', padding: '0.75rem 0.5rem',
              background: '#ffffff', color: '#00a884',
              border: '1px solid #00a884',
              boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
              whiteSpace: 'nowrap'
            }}>
              <i className="fas fa-search" /> Cek Voucher
            </Link>
            <Link to="/loyalty" className="btn-nd-pill" style={{
              fontSize: '0.74rem', padding: '0.75rem 0.5rem',
              background: 'linear-gradient(135deg, #00a884, #008f6f)',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(0,168,132,0.25)',
              whiteSpace: 'nowrap'
            }}>
              <i className="fas fa-gift" /> Loyalty
            </Link>
          </div>
        </div>
      </section>

      {/* Stunning Promotional Loyalty Event Banner */}
      <section style={{ padding: '1.25rem 1rem 0', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <div 
          className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-xl transition-all"
          style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #065f46 45%, #0f172a 100%)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
          }}
        >
          {/* Decorative glowing gradient blur */}
          <div 
            className="absolute -right-16 -top-16 w-64 h-64 rounded-full pointer-events-none opacity-25 blur-3xl"
            style={{ background: '#34d399' }}
          />
          <div 
            className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full pointer-events-none opacity-20 blur-3xl"
            style={{ background: '#10b981' }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              {/* Event Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-3 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>🔥 BONUS SPESIAL • AUTO CUAN TIAP BULAN</span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white mb-2 leading-tight">
                Makin Sering Internetan, Dapet <span className="text-emerald-400 underline decoration-emerald-400/50 underline-offset-4">Voucher Gratis!</span>
              </h2>

              {/* Description */}
              <p className="text-slate-200 text-xs sm:text-sm font-medium leading-relaxed mb-4">
                {activeEvent ? (
                  <>Cukup beli voucher seperti biasa sampai totalnya tembus <strong className="text-emerald-300 font-bold">{activeEvent.target_amount_formatted}</strong> dalam sebulan. Begitu target tercapai, voucher bonus <strong className="text-emerald-300 font-bold">langsung dikirim ke WhatsApp</strong> kamu — tanpa diundi & tanpa ribet klaim!</>
                ) : (
                  <>Kumpulin total jajan voucher kamu setiap bulannya. Begitu tembus target, voucher gratis <strong className="text-emerald-300 font-bold">langsung meluncur ke nomor WhatsApp</strong> kamu tanpa undian & tanpa repot!</>
                )}
              </p>

              {/* Feature Chips */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-emerald-200 font-semibold">
                <span className="flex items-center gap-1.5 bg-emerald-950/70 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  <i className="fas fa-bolt text-emerald-400" /> Langsung Masuk WA
                </span>
                <span className="flex items-center gap-1.5 bg-emerald-950/70 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  <i className="fas fa-clock text-emerald-400" /> Masa Aktif 5 Hari
                </span>
                <span className="flex items-center gap-1.5 bg-emerald-950/70 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  <i className="fas fa-gift text-emerald-400" /> 100% Tanpa Diundi
                </span>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-white px-2.5 py-1 rounded-lg border border-emerald-400/40 transition-colors cursor-pointer font-bold underline decoration-emerald-400/60 underline-offset-2"
                >
                  <i className="fas fa-file-contract text-emerald-400" /> *S&K Berlaku
                </button>
              </div>
            </div>

            {/* Action Card Button */}
            <div className="flex-shrink-0 flex flex-col items-start lg:items-end gap-2">
              <Link
                to="/loyalty"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm tracking-tight transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-400/25"
                style={{ textDecoration: 'none' }}
              >
                <i className="fas fa-gift text-base" />
                <span>Cek Progres & Bonus Kamu</span>
                <i className="fas fa-arrow-right text-xs ml-1" />
              </Link>
              <div className="flex flex-col items-start lg:items-end gap-0.5">
                <span className="text-[11px] text-slate-300 font-medium opacity-85">
                  Tinggal masukkan nomor HP untuk cek jajanmu
                </span>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-[11px] text-emerald-300 hover:text-white underline cursor-pointer font-medium transition-colors"
                >
                  * Baca Syarat & Ketentuan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Syarat & Ketentuan */}
        {showTermsModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowTermsModal(false)}
          >
            <div 
              className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-800 to-teal-700 px-6 py-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300 text-lg shadow-inner">
                    <i className="fas fa-file-contract" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg leading-tight">Syarat & Ketentuan Berlaku</h3>
                    <p className="text-emerald-100 text-xs font-medium">Program Reward Loyalty Pelanggan</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <i className="fas fa-times text-sm" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
                  <i className="fas fa-info-circle text-emerald-600 text-base mt-0.5" />
                  <p className="text-emerald-950 text-xs font-semibold leading-normal">
                    Program loyalty ini berlaku untuk seluruh pelanggan setia hotspot tanpa perlu daftar dan tanpa diundi. Cukup beli voucher seperti biasa!
                  </p>
                </div>

                <div className="space-y-3 font-medium">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center flex-shrink-0 text-xs">1</span>
                    <p>
                      <strong className="text-slate-900 font-bold">Periode Bulanan:</strong> Total jajan dihitung kumulatif selama 1 bulan kalender (tanggal 1 s/d hari terakhir bulan tersebut). Progres direset otomatis setiap tanggal 1 awal bulan baru.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center flex-shrink-0 text-xs">2</span>
                    <p>
                      <strong className="text-slate-900 font-bold">Nomor WhatsApp Harus Sama:</strong> Selalu gunakan nomor WhatsApp yang sama saat checkout voucher agar akumulasi belanja kamu otomatis tercatat rapi ke akunmu.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center flex-shrink-0 text-xs">3</span>
                    <p>
                      <strong className="text-slate-900 font-bold">Target Belanja:</strong> Reward otomatis diberikan begitu akumulasi pembelian sukses kamu mencapai target <strong>{activeEvent ? activeEvent.target_amount_formatted : 'Rp 100.000'}</strong> dalam bulan yang sama.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center flex-shrink-0 text-xs">4</span>
                    <p>
                      <strong className="text-slate-900 font-bold">Langsung Masuk WA:</strong> Voucher bonus dikirimkan seketika melalui pesan WhatsApp resmi kami begitu target tembus. Gak perlu repot klik klaim!
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center flex-shrink-0 text-xs">5</span>
                    <p>
                      <strong className="text-slate-900 font-bold">Masa Aktif Reward:</strong> Voucher reward gratis memiliki masa aktif 5 hari sejak diterbitkan ke WhatsApp Anda.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center flex-shrink-0 text-xs">6</span>
                    <p>
                      <strong className="text-slate-900 font-bold">Batas Reward:</strong> Reward diberikan maksimal 1 kali per nomor WhatsApp dalam satu periode bulan kalender.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center flex-shrink-0 text-xs">7</span>
                    <p>
                      <strong className="text-slate-900 font-bold">Bantuan Admin:</strong> Jika akumulasi belanjamu sudah tembus target namun voucher bonus belum masuk ke WhatsApp, kamu dapat menghubungi Admin via WA dengan melampirkan screenshot halaman Cek Loyalty.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
                >
                  Saya Mengerti & Siap Cuan
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Packages Grid */}
      <section id="packages" style={{ padding: '3rem 0', background: '#f8fafc', flex: 1 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '52px', height: '52px', borderRadius: '16px',
              background: '#ecfdf5', color: '#00a884',
              boxShadow: '0 4px 14px rgba(0, 168, 132, 0.15)',
              marginBottom: '0.75rem', fontSize: '1.35rem',
            }}>
              <FaIcon name="ticket-alt" />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>
              Pilih Paket Voucher
            </h2>
            <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>
              Pilihan durasi fleksibel dengan koneksi prioritas tanpa batas kuota
            </p>
          </div>

          {/* Elevated Voucher Cards Grid */}
          <div className="flex flex-wrap justify-center gap-6">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => <div key={i} className="w-full max-w-[340px]"><VoucherSkeleton /></div>)
            ) : (
              plans.map((plan, index) => {
                const durationLabel = plan.duration.endsWith('h') 
                  ? plan.duration.replace('h', ' Jam') 
                  : plan.duration.endsWith('d') 
                  ? plan.duration.replace('d', ' Hari') 
                  : plan.duration.replace('m', ' Bulan')

                return (
                  <div 
                    key={plan.id} 
                    className="card-nd-elevated w-full max-w-[340px]" 
                    style={{
                      borderRadius: '22px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    {index === 2 && (
                      <div style={{
                        position: 'absolute', top: 0, right: 0,
                        background: '#00a884', color: '#fff',
                        fontSize: '0.65rem', fontWeight: 900,
                        padding: '0.35rem 0.85rem',
                        borderBottomLeftRadius: '14px',
                        zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.3rem',
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        boxShadow: '0 2px 8px rgba(0, 168, 132, 0.3)'
                      }}>
                        <i className="fas fa-fire" style={{ color: '#fef08a' }} /> BEST SELLER
                      </div>
                    )}

                    <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Top Row: Duration & Price matching reference layout (NO Tarif label) */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <div>
                          <div style={{
                            display: 'inline-block',
                            background: '#ecfdf5', color: '#00a884',
                            fontSize: '0.75rem', fontWeight: 800,
                            padding: '0.25rem 0.65rem', borderRadius: '8px',
                            marginBottom: '0.5rem', textTransform: 'uppercase'
                          }}>
                            {durationLabel}
                          </div>
                          <h3 style={{ fontWeight: 900, fontSize: '1.35rem', color: '#1e293b', letterSpacing: '-0.02em', margin: 0 }}>
                            {plan.name}
                          </h3>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#00a884', letterSpacing: '-0.02em' }}>
                            Rp {plan.price.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      <div style={{ height: '1px', background: '#f1f5f9', margin: '0 0 1.25rem' }} />

                      <div style={{ marginBottom: '1.5rem', flex: 1 }}>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                            <i className="fas fa-check-circle" style={{ color: '#00a884', fontSize: '0.9rem' }} />
                            <span>Unlimited Kuota 100%</span>
                          </li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                            <i className="fas fa-check-circle" style={{ color: '#00a884', fontSize: '0.9rem' }} />
                            <span>Masa aktif {durationLabel}</span>
                          </li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                            <i className="fas fa-check-circle" style={{ color: '#00a884', fontSize: '0.9rem' }} />
                            <span>Koneksi prioritas kecepatan tinggi</span>
                          </li>
                        </ul>
                      </div>

                      {/* Pill Button matching uploaded reference */}
                      <button
                        onClick={() => navigate('/checkout', { state: { plan } })}
                        className="btn-nd-pill"
                        style={{ width: '100%', padding: '0.9rem 1.5rem', fontSize: '0.88rem' }}
                      >
                        <i className="fas fa-shopping-cart" /> Beli Sekarang
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </section>

      {/* High-Speed Zone Section */}
      {!loading && (
        <section style={{ padding: '4rem 0', background: '#f8fafc', position: 'relative', overflow: 'hidden' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem', position: 'relative', zIndex: 10 }}>
            <div 
              className="card-nd-elevated"
              style={{
                borderRadius: '24px',
                padding: '3rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2rem',
                border: '1px solid rgba(0,0,0,0.04)'
              }} 
            >
              <div className="text-center max-w-2xl">
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.35rem 0.9rem', borderRadius: '9999px',
                  background: '#ecfdf5', color: '#00a884',
                  fontSize: '0.75rem', fontWeight: 800, marginBottom: '1rem',
                }}>
                  <i className="fas fa-bolt" /> PRIORITAS JARINGAN
                </div>

                <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#1e293b', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
                  Zona Internet <span style={{ color: '#00a884' }}>Super Cepat</span>
                </h2>

                <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.75rem' }}>
                  Streaming video tanpa buffering, push rank tanpa lag, dan video call tanpa gangguan dengan bandwidth optimal.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                  {[
                    { icon: 'play-circle', label: 'YouTube 4K', color: '#ef4444' },
                    { icon: 'gamepad', label: 'Low Latency Gaming', color: '#8b5cf6' },
                    { icon: 'video', label: 'Live Streaming', color: '#0284c7' },
                    { icon: 'bolt', label: 'Turbo Speed', color: '#00a884' },
                  ].map((tag) => (
                    <div key={tag.label} style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.55rem 1rem',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '9999px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                    }}>
                      <i className={`fas fa-${tag.icon}`} style={{ color: tag.color }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>{tag.label}</span>
                    </div>
                  ))}
                </div>

                <Link to="/gaming-area" className="btn-nd-pill" style={{ padding: '0.9rem 2.2rem', fontSize: '0.9rem' }}>
                  Buka Zona Kecepatan <i className="fas fa-chevron-right text-xs" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Cara Beli Section */}
      <section style={{ padding: '4rem 0', background: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>Cara Pembelian Voucher</h2>
            <p style={{ color: '#64748b', fontWeight: 600, marginTop: '0.35rem', fontSize: '0.85rem' }}>3 langkah mudah mendapatkan akses internet instan</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: '1', icon: 'mouse-pointer', title: 'Pilih Paket', desc: 'Tentukan durasi internet sesuai kebutuhan online Anda.' },
              { num: '2', icon: 'qrcode', title: 'Bayar via QRIS', desc: 'Scan QRIS via Dana, OVO, GoPay, ShopeePay, atau M-Banking.' },
              { num: '3', icon: 'ticket-alt', title: 'Voucher Otomatis', desc: 'Kode voucher langsung aktif dan dikirimkan ke WhatsApp Anda.' },
            ].map((step) => (
              <div 
                key={step.num} 
                className="card-nd-elevated"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '2.25rem 1.75rem',
                  borderRadius: '22px',
                  border: '1px solid rgba(0,0,0,0.04)',
                }}
              >
                <div style={{
                  width: '52px', height: '52px',
                  background: '#ecfdf5', color: '#00a884',
                  borderRadius: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1rem', fontWeight: 900, fontSize: '1.25rem',
                  boxShadow: '0 4px 10px rgba(0, 168, 132, 0.15)'
                }}>{step.num}</div>

                <h4 style={{ fontWeight: 900, color: '#1e293b', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{step.title}</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed left-0 right-0 z-50 bottom-0 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-lg">
        <div className="grid grid-cols-4" style={{ padding: '0.65rem 0' }}>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#00a884' }}>
            <FaIcon name="home" className="text-xl" style={{ marginBottom: '2px' }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>Home</span>
          </button>
          <button onClick={() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <FaIcon name="wifi" className="text-xl" style={{ marginBottom: '2px' }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>Paket</span>
          </button>
          <button onClick={handleWhatsAppClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#25D366' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ marginBottom: '2px' }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>WA</span>
          </button>
          <Link to="/check-voucher" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: '#64748b' }}>
            <FaIcon name="search" className="text-xl" style={{ marginBottom: '2px' }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>Cek</span>
          </Link>
        </div>
      </div>
    </PublicLayout>
  )
}

export default App
