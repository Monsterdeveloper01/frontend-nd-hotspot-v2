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
    window.open('https://wa.me/6281234567890?text=Halo%20ND-HOTSPOT%20,%20saya%20ingin%20bertanya%20tentang%20voucher%20internet', '_blank');
  };

  const getColorClasses = (index) => {
    const colors = [
      { border: 'border-blue-400', text: 'text-blue-700', iconBg: 'bg-blue-100', btn: 'btn-3d-blue', topLine: 'bg-blue-500' },
      { border: 'border-purple-400', text: 'text-purple-700', iconBg: 'bg-purple-100', btn: 'btn-3d-purple', topLine: 'bg-purple-500' },
      { border: 'border-emerald-400', text: 'text-emerald-700', iconBg: 'bg-emerald-100', btn: 'btn-3d-green', topLine: 'bg-emerald-500' },
    ];
    return colors[index % 3];
  };

  return (
    <PublicLayout>

      {/* Hero Section */}
      <section className="relative pt-20 lg:pt-28 pb-16 overflow-hidden">
        {/* Background Image with Effects */}
        <div className="absolute inset-0 z-0">
          <img
            src="/logo-wifi-section.png"
            alt="Background"
            className="w-full h-full object-cover opacity-20 blur-[2px] scale-100"
          />
          <div className="absolute inset-0 bg-white/20"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 text-center lg:text-left relative z-10">
          <div className="lg:flex items-center justify-between">
            <div className="lg:max-w-2xl">
              <div className="hidden lg:inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-100 rounded-full mb-6 shadow-sm">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Network Status: Optimized</span>
              </div>
              <h2 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight animate-fadeIn">
                Pilih Paket <span className="text-blue-600 underline decoration-blue-100 underline-offset-8">Voucher</span> Internet.
              </h2>
              <p className="text-lg text-slate-500 font-bold max-w-xl mb-10 leading-relaxed animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                Nikmati koneksi internet tercepat dan paling stabil. Tanpa ribet, langsung aktif, dan kuota unlimited!
              </p>
            </div>

            {/* Quick Actions Mobile */}
            <div className="grid grid-cols-2 gap-3 lg:hidden mt-8">
              <Link to="/payment" className="btn-3d-blue py-3 text-xs"><i className="fas fa-credit-card mr-2"></i> Bayar Tagihan</Link>
              <Link to="/check-voucher" className="bg-white border-2 border-slate-200 text-slate-700 py-3 rounded-xl font-bold text-xs flex items-center justify-center shadow-sm hover:border-blue-400 hover:text-blue-600 transition-all duration-200 active:scale-95">
                <i className="fas fa-search mr-2"></i> Cek Voucher
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section id="packages" className="py-12 bg-white flex-1">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 mb-4 shadow-inner">
              <FaIcon name="wifi" className="text-2xl text-blue-600 animate-pulse-soft" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Pilih Paket Voucher</h2>
            <p className="text-slate-500 font-bold mt-2">Koneksi cepat untuk aktivitas online Anda</p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => <div key={i} className="w-full max-w-[340px]"><VoucherSkeleton /></div>)
            ) : (
              plans.map((plan, index) => {
                const c = getColorClasses(index);
                return (
                  <div key={plan.id} className={`w-full max-w-[340px] rounded-2xl overflow-hidden border-2 ${c.border} shadow-lg shadow-slate-200/50 flex flex-col bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative group`}>
                    {index === 2 && (
                      <div className="absolute -top-0 -right-0 bg-emerald-500 text-white text-[10px] font-black px-4 py-2 rounded-bl-2xl shadow-md z-10 flex items-center gap-1">
                        <i className="fas fa-fire text-[9px]"></i> BEST SELLER
                      </div>
                    )}

                    <div className={`h-2 ${c.topLine}`}></div>

                    <div className="p-6 flex-1">
                      <div className="flex items-center justify-between mb-6">
                        <div className="text-left">
                          <h3 className={`font-black text-2xl ${c.text} leading-none tracking-tighter uppercase`}>{plan.name}</h3>
                          <p className="text-slate-400 text-[10px] mt-2 font-black uppercase flex items-center gap-1 tracking-widest">
                            <FaIcon name="clock" className="text-[10px]" /> Aktif {plan.duration.endsWith('h') ? plan.duration.replace('h', ' Jam') : plan.duration.endsWith('d') ? plan.duration.replace('d', ' Hari') : plan.duration.replace('m', ' Bulan')} UNLIMITED
                          </p>
                        </div>
                        <div className={`w-12 h-12 ${c.iconBg} ${c.text} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
                          <FaIcon name="wifi" className="text-xl" />
                        </div>
                      </div>

                      <div className={`border-t-2 ${c.border} border-opacity-10 my-6`}></div>

                      <div className="mb-6 grid grid-cols-2 gap-4">
                        <div className={`p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col`}>
                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                              <i className="fas fa-arrow-up text-[7px]"></i> Upload
                           </span>
                           <span className={`text-xs font-black ${c.text}`}>{plan.upload_limit} Mbps</span>
                        </div>
                        <div className={`p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col`}>
                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                              <i className="fas fa-arrow-down text-[7px]"></i> Download
                           </span>
                           <span className={`text-xs font-black ${c.text}`}>{plan.download_limit} Mbps</span>
                        </div>
                      </div>

                      <div className="mb-8 text-left">
                        <div className={`text-3xl font-black ${c.text} tracking-tight`}>Rp {plan.price.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-widest">Unlimited Access</div>
                      </div>

                      <button
                        onClick={() => navigate('/checkout', { state: { plan } })}
                        className={`w-full ${c.btn} flex items-center justify-center group/btn`}
                      >
                        <i className="fas fa-shopping-cart mr-2 group-hover/btn:translate-x-[-2px] transition-transform"></i> Beli Sekarang
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </section>

      {/* New Dedicated Gaming Area Section */}
      {!loading && (
        <section className="py-20 bg-white relative overflow-hidden">
          {/* Decorative Background Elements for White BG */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-50 rounded-full blur-[120px] -mr-64 -mt-64 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] -ml-64 -mb-64 opacity-60"></div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-8 md:p-16 shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col lg:flex-row items-center gap-12 group transition-all duration-700 relative">
              
              {/* Rocket Element (Updated for White BG) */}
              <div className="absolute -top-12 -right-12 w-32 h-32 hidden lg:block pointer-events-none group-hover:translate-x-[-20px] group-hover:translate-y-[20px] transition-transform duration-1000">
                <div className="relative w-full h-full animate-float">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                  <i className="fas fa-rocket text-6xl text-purple-600 drop-shadow-[0_10px_20px_rgba(147,51,234,0.3)] -rotate-45"></i>
                </div>
              </div>

              <div className="lg:w-1/2 text-center lg:text-left">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-full mb-6 border border-blue-100">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                  <span className="text-blue-600 text-xs font-black uppercase tracking-[0.3em]">Low Latency Active</span>
                </div>
                
                <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-none tracking-tighter uppercase italic mb-8">
                  GAMING<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">AREA ACCESS</span>
                </h2>

                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
                  <div className="bg-slate-50 border border-slate-100 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                    <i className="fas fa-bolt text-amber-500 text-xl"></i>
                    <span className="text-slate-700 font-bold text-sm">Turbo Speed</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                    <i className="fas fa-shield-alt text-emerald-500 text-xl"></i>
                    <span className="text-slate-700 font-bold text-sm">Anti Lag</span>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2 flex flex-col items-center lg:items-end">
                {/* Pro Badge */}
                <div className="mb-8 transform -rotate-2">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-xs font-black px-6 py-2.5 rounded-full shadow-lg shadow-blue-500/30 flex items-center gap-3 animate-bounce-slow">
                    <i className="fas fa-crown text-amber-300"></i>
                    <span>PRO PLAYERS CHOICE</span>
                  </div>
                </div>

                {/* System Message Bubble (Light Mode Refined) */}
                <div className="relative p-6 md:p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 mb-10 shadow-inner max-w-md group-hover:bg-white transition-colors duration-500">
                  <div className="absolute -top-4 left-8 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-md">System Message</div>
                  <p className="text-base md:text-xl text-slate-700 font-bold leading-relaxed italic">
                    "Butuh kecepatan lebih untuk push rank? Masuk ke area gaming kami sekarang."
                  </p>
                  <div className="flex justify-end mt-4 opacity-40">
                    <span className="text-xs text-slate-500 font-mono italic font-bold">16:47 • Delivered • Live</span>
                  </div>
                </div>

                <Link to="/gaming-area" className="w-full max-w-sm py-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-[1.5rem] font-black uppercase text-sm tracking-[0.3em] flex items-center justify-center gap-4 hover:shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:-translate-y-1 transition-all relative overflow-hidden group/btn shadow-xl">
                   <span className="relative z-10 flex items-center gap-3">
                    BUKA AREA GAMING <i className="fas fa-chevron-right animate-pulse"></i>
                  </span>
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover/btn:animate-shine"></div>
                </Link>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* Cara Beli Section */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-12">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Cara Beli Voucher</h2>
            <p className="text-slate-500 font-bold mt-1">3 langkah mudah mendapatkan voucher internet</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center bg-white p-8 rounded-3xl border-2 border-purple-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-2xl flex items-center justify-center mb-6 font-black text-2xl shadow-lg shadow-purple-500/30 rotate-3">1</div>
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4">
                <FaIcon name="mouse-pointer" className="text-xl" />
              </div>
              <h4 className="font-black text-purple-700 text-lg mb-2">Pilih Paket</h4>
              <p className="text-sm text-slate-500 font-bold leading-relaxed">Tentukan durasi internet sesuai kebutuhan aktivitas online Anda.</p>
            </div>

            <div className="flex flex-col items-center bg-white p-8 rounded-3xl border-2 border-blue-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-blue-500 text-white rounded-2xl flex items-center justify-center mb-6 font-black text-2xl shadow-lg shadow-blue-500/30 -rotate-3">2</div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <FaIcon name="qrcode" className="text-xl" />
              </div>
              <h4 className="font-black text-blue-700 text-lg mb-2">Scan QRIS</h4>
              <p className="text-sm text-slate-500 font-bold leading-relaxed">Bayar instan via Dana, OVO, Gopay, atau aplikasi M-Banking Anda.</p>
            </div>

            <div className="flex flex-col items-center bg-white p-8 rounded-3xl border-2 border-emerald-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mb-6 font-black text-2xl shadow-lg shadow-emerald-500/30 rotate-3">3</div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <FaIcon name="ticket-alt" className="text-xl" />
              </div>
              <h4 className="font-black text-emerald-700 text-lg mb-2">Voucher Aktif</h4>
              <p className="text-sm text-slate-500 font-bold leading-relaxed">Kode voucher langsung aktif dan dikirimkan otomatis ke WhatsApp Anda.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] bottom-0">
        <div className="grid grid-cols-4 py-3">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-purple-600 flex flex-col items-center group">
            <FaIcon name="home" className="text-xl mb-1 group-active:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Home</span>
          </button>
          <button onClick={() => document.getElementById('packages').scrollIntoView({ behavior: 'smooth' })} className="text-blue-500 flex flex-col items-center group">
            <FaIcon name="wifi" className="text-xl mb-1 group-active:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Paket</span>
          </button>
          <button onClick={handleWhatsAppClick} className="text-emerald-500 flex flex-col items-center group">
            <svg className="w-6 h-6 mb-1 group-active:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-tighter">WA</span>
          </button>
          <Link to="/check-status" className="text-slate-500 flex flex-col items-center group">
            <FaIcon name="search" className="text-xl mb-1 group-active:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Cek</span>
          </Link>
        </div>
      </div>
    </PublicLayout>
  )
}

export default App
