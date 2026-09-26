import { useState, useEffect, useRef } from 'react'
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
    sync: <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
    sun: <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />,
    moon: <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />,
    bell: <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
    user: <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    fullscreen: <path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />,
    chevronDown: <path d="M19 9l-7 7-7-7" />,
    clock: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    trend: <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
    points: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
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
  const [time, setTime] = useState(new Date())
  
  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')

  // Complaints state
  const [complaints, setComplaints] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showComplaints, setShowComplaints] = useState(false)
  const complaintRef = useRef(null)

  const location = useLocation()
  const navigate = useNavigate()
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      if (document.exitFullscreen) document.exitFullscreen()
    }
  }

  useEffect(() => {
    const clockTimer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(clockTimer)
  }, [])
  
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

  // Fetch complaints for bell icon
  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/complaints?limit=5`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      })
      if (res.ok) {
        const data = await res.json()
        setComplaints(data.complaints || [])
        setUnreadCount(data.unread_count || 0)
      }
    } catch (err) {
      // Silently fail
    }
  }

  useEffect(() => {
    fetchComplaints()
    const interval = setInterval(fetchComplaints, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close complaint dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (complaintRef.current && !complaintRef.current.contains(e.target)) {
        setShowComplaints(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markComplaintRead = async (id) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`${import.meta.env.VITE_API_URL}/admin/complaints/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      })
      fetchComplaints()
    } catch (err) {
      // Silently fail
    }
  }

  const formatTimeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60) return 'Baru saja'
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`
    return `${Math.floor(diff / 86400)} hari lalu`
  }

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
    { name: 'Event Analytics', path: '/admin/event-analytics', icon: 'trend', section: 'EVENT SYSTEM' },
    { name: 'ND-Point Analytics', path: '/admin/points', icon: 'points', section: 'POINT SYSTEM' },
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

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-admin-card border-r border-admin-border z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-admin-border bg-admin-card">
            <div className="flex items-center gap-2 w-full">
              <img src="/Logo.png" alt="Logo" className="w-8 h-8 object-contain hidden" />
              <div className="flex items-center gap-2 text-admin-text">
                <i className="fas fa-wifi text-[#f59e0b] text-xl" />
                <span className="font-bold text-lg tracking-tight">ND-Hotspot</span>
              </div>
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
        {/* Header */}
        <header className="sticky top-0 bg-admin-card border-b border-admin-border z-30 h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-admin-muted hover:text-admin-text transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Icon name="menu" className="w-5 h-5" />
            </button>
            
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 text-admin-text text-sm font-semibold uppercase">
                <Icon name="user" className="w-4 h-4" /> ADMINISTRATOR
              </div>
              <div className="flex items-center gap-1.5 text-admin-muted text-xs uppercase font-medium">
                <Icon name="clock" className="w-3.5 h-3.5" />
                WAKTU SERVER : {time.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })} {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative" ref={complaintRef}>
              <button 
                onClick={() => setShowComplaints(!showComplaints)}
                className="p-2 text-admin-muted hover:text-admin-text transition-colors hidden sm:block relative"
              >
                <Icon name="bell" className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Complaint Dropdown */}
              {showComplaints && (
                <div className="absolute right-0 top-12 w-[380px] bg-admin-card border border-admin-border rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                  <div className="px-4 py-3 border-b border-admin-border bg-admin-base/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-admin-text uppercase tracking-widest">Laporan Pelanggan</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-500 text-[9px] font-black rounded-full">{unreadCount} baru</span>
                      )}
                    </div>
                    <button onClick={() => setShowComplaints(false)} className="text-admin-muted hover:text-admin-text">
                      <Icon name="close" className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
                    {complaints.length > 0 ? complaints.map((c) => (
                      <div 
                        key={c.id} 
                        className={`px-4 py-3 border-b border-admin-border/50 hover:bg-admin-base/30 transition-colors ${
                          c.status === 'new' ? 'bg-rose-500/5' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            {c.status === 'new' && (
                              <span className="w-2 h-2 bg-rose-500 rounded-full flex-shrink-0 animate-pulse"></span>
                            )}
                            <span className="text-xs font-bold text-admin-text truncate">
                              {c.phone_number}
                            </span>
                          </div>
                          <span className="text-[9px] text-admin-muted flex-shrink-0 font-medium">
                            {formatTimeAgo(c.created_at)}
                          </span>
                        </div>
                        <p className="text-[11px] text-admin-muted leading-relaxed mb-2 line-clamp-2">
                          {c.ai_summary || c.raw_message}
                        </p>
                        <div className="flex items-center gap-2">
                          <a 
                            href={`https://wa.me/${c.phone_number}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[9px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-wider flex items-center gap-1"
                          >
                            <Icon name="whatsapp" className="w-3 h-3" /> Balas WA
                          </a>
                          {c.status === 'new' && (
                            <button 
                              onClick={() => markComplaintRead(c.id)}
                              className="text-[9px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-wider"
                            >
                              ✓ Tandai Dibaca
                            </button>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="px-4 py-8 text-center">
                        <div className="text-admin-muted text-2xl mb-2">🎉</div>
                        <p className="text-[11px] text-admin-muted font-medium">Tidak ada laporan terbaru.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <button onClick={toggleTheme} className="p-2 text-admin-muted hover:text-admin-text transition-colors">
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="w-4 h-4" />
            </button>
            <button onClick={toggleFullscreen} className="p-2 text-admin-muted hover:text-admin-text transition-colors hidden sm:block">
              <Icon name="fullscreen" className="w-4 h-4" />
            </button>
            <Link to="/admin/whatsapp" className="p-2 text-admin-muted hover:text-admin-text transition-colors hidden sm:block">
              <Icon name="whatsapp" className="w-4 h-4" />
            </Link>
            
            <div className="h-4 w-px bg-admin-border hidden md:block mx-1"></div>
            
            <div className="flex items-center gap-2 cursor-pointer p-2 hover:bg-admin-base/50 rounded-md transition-colors text-admin-muted hover:text-admin-text">
              <Icon name="user" className="w-4 h-4" />
              <span className="text-sm font-medium">Account</span>
              <Icon name="chevronDown" className="w-3 h-3" />
            </div>
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
