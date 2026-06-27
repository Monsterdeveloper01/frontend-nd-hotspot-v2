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
    close: <path d="M6 18L18 6M6 6l12 12" />,
    sync: <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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
    { name: 'Manajemen OLT', path: '/admin/olt-management', icon: 'master', section: 'INFRASTRUCTURE' },
    { name: 'Network Monitoring', path: '/admin/network-center', icon: 'network' },
    { name: 'WhatsApp Gateway', path: '/admin/whatsapp', icon: 'whatsapp', section: 'MESSAGING' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/portal-secret-nd-admin')
  }

  return (
    <div className="flex admin-theme">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar - Enterprise Minimalist Style */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-admin-card border-r border-admin-border z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-admin-border">
            <div className="flex items-center justify-center w-full">
              <img src="/Logo.png" alt="ND-Billing Logo" className="h-10 object-contain" />
            </div>
            <button className="lg:hidden p-1.5 text-admin-muted hover:text-admin-text transition-colors" onClick={() => setIsSidebarOpen(false)}>
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Section */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 custom-scrollbar">
            {menuItems.map((item, index) => (
              <div key={index}>
                {item.section && (
                  <div className="px-3 pt-5 pb-2 text-[10px] font-semibold text-admin-muted tracking-wider uppercase">
                    {item.section}
                  </div>
                )}
                <Link 
                  to={item.path} 
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors text-sm
                    ${location.pathname === item.path 
                      ? 'bg-admin-base text-admin-text shadow-sm border border-admin-border' 
                      : 'text-admin-muted hover:text-admin-text hover:bg-admin-base/50'}`}
                >
                  <Icon name={item.icon} className={`w-4 h-4 ${location.pathname === item.path ? 'text-admin-accent' : 'text-admin-muted'}`} />
                  <span>{item.name}</span>
                </Link>
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-admin-border">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-admin-muted hover:text-admin-text hover:bg-admin-base/50 rounded-md font-medium transition-colors text-sm"
            >
              <Icon name="logout" className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Header - Minimalist */}
        <header className="sticky top-0 bg-admin-card/90 backdrop-blur-md border-b border-admin-border z-30 h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-admin-muted hover:text-admin-text transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Icon name="menu" className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-admin-text tracking-tight">{title}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <span className="text-xs text-admin-muted">Router</span>
              {routerConnected === null ? (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-admin-base/50 border border-admin-border">
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-medium text-admin-muted uppercase tracking-wide">Checking</span>
                </div>
              ) : routerConnected ? (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-admin-success/10 border border-admin-success/20">
                  <div className="w-1.5 h-1.5 bg-admin-success rounded-full"></div>
                  <span className="text-[10px] font-medium text-admin-success uppercase tracking-wide">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-medium text-red-500 uppercase tracking-wide">Offline</span>
                </div>
              )}
            </div>
            <div className="h-4 w-px bg-admin-border hidden md:block"></div>
            <button 
              onClick={checkRouterStatus}
              disabled={isSyncing}
              className="text-admin-muted hover:text-admin-text transition-colors disabled:opacity-50"
              title="Sync Router Status"
            >
              <Icon name="sync" className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-6 flex-1 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
