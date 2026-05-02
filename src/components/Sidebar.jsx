import { Link, useLocation } from 'react-router-dom'

const Icon = ({ name, className = "w-5 h-5" }) => {
  const icons = {
    dashboard: <path d="M3 3h7v9H3V3zm11 0h7v5h-7V3zm0 9h7v9h-7v-9zM3 16h7v5H3v-5z" />,
    master: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
    stock: <path d="M15 5v2m-6-2v2M3 10V6a2 2 0 012-2h14a2 2 0 012 2v4M3 10h18M3 10v10a2 2 0 002 2h14a2 2 0 002-2V10M7 14h10" />,
    whatsapp: <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />,
    online: <path d="M12 20v-6M6 20V10M18 20V4" />,
    sold: <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0" />,
    customers: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />,
    logout: <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
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

const Sidebar = () => {
  const location = useLocation()
  
  const menuItems = [
    { name: 'Dashboard', path: '/admin-dashboard-access-granted', icon: 'dashboard', section: 'GENERAL' },
    { name: 'RADIUS Settings', path: '/admin/radius-settings', icon: 'master', section: 'RADIUS SYSTEM' },
    { name: 'Data Pelanggan', path: '/admin/customers', icon: 'customers', section: 'PELANGGAN BULANAN' },
    { name: 'Pelanggan Aktif/Isolir', path: '/admin/customers', icon: 'customers' },
    { name: 'Master Voucher', path: '/admin/voucher-plans', icon: 'master', section: 'VOUCHER MANAGEMENT' },
    { name: 'Stock Voucher', path: '/admin/vouchers', icon: 'stock' },
    { name: 'Voucher Online', path: '/admin/vouchers-online', icon: 'online' },
    { name: 'WhatsApp Gateway', path: '/admin/whatsapp', icon: 'whatsapp' },
    { name: 'Voucher Terjual', path: '/admin/vouchers-sold', icon: 'sold' },
  ]

  return (
    <div className="w-72 bg-slate-950 h-screen flex flex-col fixed left-0 top-0 z-40 border-r border-white/5">
      <div className="p-10 flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.59 16.11a6 6 0 016.82 0M12 20h.01" />
          </svg>
        </div>
        <div>
          <h2 className="text-white font-black text-xl tracking-tighter leading-none">NDBilling</h2>
          <p className="text-[10px] text-slate-500 font-black tracking-widest mt-1.5 uppercase">Network Core</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-6 space-y-1 custom-scrollbar">
        {menuItems.map((item, index) => (
          <div key={index}>
            {item.section && (
              <div className="px-4 pt-8 pb-4 text-[10px] font-black text-slate-600 tracking-widest uppercase">
                {item.section}
              </div>
            )}
            <Link 
              to={item.path} 
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
      </div>
      
      <div className="p-8 border-t border-white/5">
        <button 
          onClick={() => {
            localStorage.removeItem('token')
            window.location.href = '/'
          }}
          className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl font-black transition-all active:scale-95 group"
        >
          <Icon name="logout" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          <span>Logout Session</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
