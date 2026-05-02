import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const Icon = ({ name, className = "w-5 h-5" }) => {
  const icons = {
    dashboard: <path d="M3 3h7v9H3V3zm11 0h7v5h-7V3zm0 9h7v9h-7v-9zM3 16h7v5H3v-5z" />,
    master: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
    stock: <path d="M15 5v2m-6-2v2M3 10V6a2 2 0 012-2h14a2 2 0 012 2v4M3 10h18M3 10v10a2 2 0 002 2h14a2 2 0 002-2V10M7 14h10" />,
    whatsapp: <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />,
    online: <path d="M12 20v-6M6 20V10M18 20V4" />,
    sold: <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0" />,
    customers: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />,
    network: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
    logout: <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    close: <path d="M6 18L18 6M6 6l12 12" />
  };

  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {icons[name]}
    </svg>
  );
};

const AdminLayout = ({ children, title, subtitle }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [routerConnected, setRouterConnected] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  
  const checkRouterStatus = async () => {
    setIsSyncing(true)
    try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${import.meta.env.VITE_API_URL}/router-status`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        })
        
        if (response.status === 401) {
            handleLogout()
            return
        }

        const data = await response.json()
        setRouterConnected(data.connected)
    } catch (err) {
        setRouterConnected(false)
    } finally {
        setIsSyncing(false)
    }
  }

  useEffect(() => {
    checkRouterStatus()
    const interval = setInterval(checkRouterStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const menuItems = [
    { name: 'Dashboard', path: '/admin-dashboard-access-granted', icon: 'dashboard', section: 'GENERAL' },
    { name: 'RADIUS Settings', path: '/admin/radius-settings', icon: 'master', section: 'RADIUS SYSTEM' },
    { name: 'Data Pelanggan', path: '/admin/customers', icon: 'customers', section: 'PELANGGAN BULANAN' },
    { name: 'Master Voucher', path: '/admin/voucher-plans', icon: 'master', section: 'VOUCHER MANAGEMENT' },
    { name: 'Stock Voucher', path: '/admin/vouchers', icon: 'stock' },
    { name: 'User Online', path: '/admin/vouchers-online', icon: 'online' },
    { name: 'Voucher Terjual', path: '/admin/vouchers-sold', icon: 'sold' },
    { name: 'Network Monitoring', path: '/admin/network-center', icon: 'network', section: 'INFRASTRUCTURE' },
    { name: 'WhatsApp Gateway', path: '/admin/whatsapp', icon: 'whatsapp', section: 'MESSAGING' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/portal-secret-nd-admin')
  }

  return (
    <div className="flex bg-slate-50 min-h-screen">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-slate-950 border-r border-white/5 z-50 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 text-white">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.59 16.11a6 6 0 016.82 0M12 20h.01" />
                </svg>
              </div>
              <div>
                <h2 className="text-white font-black text-lg tracking-tighter leading-none uppercase">ND-Billing</h2>
                <p className="text-[9px] text-slate-500 font-black tracking-widest mt-1 uppercase">Radius Core</p>
              </div>
            </div>
            <button className="lg:hidden text-slate-400" onClick={() => setIsSidebarOpen(false)}>
              <Icon name="close" />
            </button>
          </div>

          {/* Menu Section */}
          <nav className="flex-1 overflow-y-auto px-6 py-4 space-y-1 custom-scrollbar">
            {menuItems.map((item, index) => (
              <div key={index}>
                {item.section && (
                  <div className="px-4 pt-8 pb-3 text-[9px] font-black text-slate-600 tracking-widest uppercase">
                    {item.section}
                  </div>
                )}
                <Link 
                  to={item.path} 
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl font-bold transition-all group
                    ${location.pathname === item.path 
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                      : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                  <Icon name={item.icon} className={`w-5 h-5 transition-transform group-hover:scale-110 ${location.pathname === item.path ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} />
                  <span className="text-sm tracking-tight">{item.name}</span>
                </Link>
              </div>
            ))}
          </nav>

          <div className="p-8 border-t border-white/5">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl font-black transition-all active:scale-95 group text-xs uppercase tracking-widest"
            >
              <Icon name="logout" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-30 px-6 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                className="lg:hidden p-2 bg-slate-100 rounded-xl text-slate-600"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Icon name="menu" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">{title}</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{subtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">MikroTik Connectivity</span>
                <div className="flex items-center gap-2">
                    {routerConnected === null ? (
                        <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-slate-300 rounded-full animate-pulse"></div>
                            <span className="text-[9px] font-black text-slate-400 uppercase">Checking...</span>
                        </span>
                    ) : routerConnected ? (
                        <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50"></div>
                            <span className="text-[9px] font-black text-emerald-600 uppercase">Router Online</span>
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                            <span className="text-[9px] font-black text-rose-600 uppercase">Router Offline</span>
                        </span>
                    )}
                </div>
              </div>
              <button 
                onClick={checkRouterStatus}
                disabled={isSyncing}
                className="p-3 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl border border-slate-200 transition-all active:scale-90"
              >
                <i className={`fas fa-sync-alt ${isSyncing ? 'animate-spin' : ''}`}></i>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 lg:p-12 flex-1 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
