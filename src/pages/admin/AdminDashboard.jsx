
import { StatSkeleton } from '../../components/Skeleton'
import { useState, useEffect } from 'react'

const Icon = ({ name, className = "w-6 h-6" }) => {
  const icons = {
    revenue: <path d="M12 1v22m5-18H8.5a4.5 4.5 0 000 9h7a4.5 4.5 0 010 9H7" />,
    users: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8z" />,
    voucher: <path d="M15 5v2m-6-2v2M3 10V6a2 2 0 012-2h14a2 2 0 012 2v4M3 10h18M3 10v10a2 2 0 002 2h14a2 2 0 002-2V10M7 14h10" />,
    trend: <path d="M23 6l-9.5 9.5-5-5L1 18" />
  };

  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {icons[name]}
    </svg>
  );
};

const AdminDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {loading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              {/* Card 1: Revenue */}
              <div className="bg-white p-8 rounded-[35px] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon name="revenue" />
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-[10px] font-black text-emerald-600 rounded-lg uppercase tracking-wider">Stable</span>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Revenue This Month</p>
                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter italic">Rp 10.501.481</h2>
                <div className="flex items-center gap-2 text-xs font-black text-blue-600">
                  <span className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">↗ 12.5% from last month</span>
                </div>
              </div>

              {/* Card 2: Customers */}
              <div className="bg-white p-8 rounded-[35px] border border-slate-200 shadow-sm hover:shadow-xl hover:border-purple-100 transition-all group">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 bg-purple-600/10 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon name="users" />
                  </div>
                  <span className="px-3 py-1 bg-purple-100 text-[10px] font-black text-purple-600 rounded-lg uppercase tracking-wider">Active</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Users</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">1,284</h3>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">New</p>
                    <h3 className="text-3xl font-black text-emerald-500 tracking-tighter">+12</h3>
                  </div>
                </div>
              </div>

              {/* Card 3: Vouchers */}
              <div className="bg-white p-8 rounded-[35px] border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all group">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 bg-emerald-600/10 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon name="voucher" />
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-[10px] font-black text-slate-500 rounded-lg uppercase tracking-wider">Stock</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sold Today</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">42</h3>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Remaining</p>
                    <h3 className="text-3xl font-black text-blue-600 tracking-tighter">842</h3>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Trend Section */}
        <div className="bg-white p-10 rounded-[35px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Network Traffic</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Real-time data visualization across access points</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Download</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-slate-200 rounded-full"></span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload</span>
              </div>
            </div>
          </div>
          <div className="w-full h-80 flex items-end justify-between gap-2 lg:gap-3">
            {[40, 70, 45, 30, 55, 80, 40, 60, 90, 75, 40, 50, 85, 30, 60, 40, 70, 50, 90, 60].map((h, i) => (
              <div 
                key={i} 
                className="flex-1 relative group" 
                style={{ height: `${h}%` }}
              >
                <div className="absolute inset-0 bg-blue-600 rounded-t-xl opacity-80 group-hover:opacity-100 group-hover:bg-blue-500 transition-all cursor-pointer"></div>
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-3 py-2 rounded-xl hidden group-hover:block whitespace-nowrap shadow-xl z-10">
                  {h} Mbps
                </div>
              </div>
            ))}
          </div>
        </div>
    </>
  )
}

export default AdminDashboard
