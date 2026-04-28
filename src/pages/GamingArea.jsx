import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const FaIcon = ({ name, className = "" }) => (
  <i className={`fas fa-${name} ${className}`}></i>
)

const GamingArea = () => {
    const [plans, setPlans] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/voucher-plans?is_gaming=true`)
                setPlans(response.data)
            } catch (err) {
                console.error('Failed to fetch gaming plans')
            } finally {
                setLoading(false)
            }
        }
        fetchPlans()
    }, [])

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white selection:bg-purple-500 selection:text-white overflow-x-hidden">
            {/* Animated Grid Background */}
            <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
                 style={{ backgroundImage: 'linear-gradient(#1e1e26 1px, transparent 1px), linear-gradient(90deg, #1e1e26 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            {/* Glowing Orbs */}
            <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full z-0"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full z-0"></div>

            <div className="relative z-10">
                {/* Navbar */}
                <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-all">
                            <FaIcon name="arrow-left" className="text-sm" />
                        </div>
                        <span className="font-black uppercase tracking-widest text-[10px]">Exit Zone</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="font-black uppercase tracking-widest text-[10px] text-emerald-500">Servers Online</span>
                    </div>
                </nav>

                {/* Hero */}
                <header className="max-w-7xl mx-auto px-8 pt-10 pb-20 text-center lg:text-left">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-purple-600/10 border border-purple-500/20 rounded-full mb-8">
                        <FaIcon name="bolt" className="text-purple-500 text-xs animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Latensi Sangat Rendah Aktif</span>
                    </div>
                    <h1 className="text-6xl lg:text-8xl font-black italic uppercase tracking-tighter mb-6">
                        Gaming <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-400">Area</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-lg max-w-2xl leading-relaxed">
                        Tingkatkan potensi gaming Anda dengan prioritas bandwidth tertinggi. Tanpa lag, jalur khusus, dan kuota tak terbatas untuk pengalaman bermain game yang maksimal.
                    </p>
                </header>

                {/* Plans Grid */}
                <section className="max-w-7xl mx-auto px-8 pb-32">
                    <div className="flex flex-wrap justify-center gap-10">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="w-full max-w-[380px] h-96 bg-white/5 border border-white/10 rounded-[40px] animate-pulse"></div>
                            ))
                        ) : plans.length > 0 ? plans.map((plan) => (
                            <div key={plan.id} className="w-full max-w-[380px] group relative bg-[#121217] border border-white/5 rounded-[40px] p-10 hover:border-purple-500/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden shadow-2xl">
                                {/* Card Glow */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-3xl group-hover:bg-purple-600/30 transition-all"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-10">
                                        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all duration-500 group-hover:rotate-6">
                                            <FaIcon name="gamepad" className="text-2xl" />
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Level Akses</span>
                                            <span className="text-purple-400 font-black uppercase tracking-tighter italic">Tier 1 Pro</span>
                                        </div>
                                    </div>

                                    <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-2 group-hover:text-purple-400 transition-colors">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-8">
                                        <span className="text-4xl font-black italic tracking-tighter">Rp {Number(plan.price).toLocaleString()}</span>
                                        <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest">/ {plan.duration.endsWith('h') ? plan.duration.replace('h', ' Jam') : plan.duration.endsWith('d') ? plan.duration.replace('d', ' Hari') : plan.duration.replace('m', ' Bulan')} UNLIMITED</span>
                                    </div>

                                    <div className="space-y-4 mb-10">
                                        <div className="flex justify-between items-center bg-white/5 px-6 py-4 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-3 text-slate-400 font-black uppercase text-[10px] tracking-widest">
                                                <FaIcon name="microchip" className="text-purple-500" />
                                                Prioritas
                                            </div>
                                            <span className="font-black text-xs uppercase tracking-tighter">Sangat Tinggi</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-white/5 px-6 py-4 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-3 text-slate-400 font-black uppercase text-[10px] tracking-widest">
                                                <FaIcon name="tachometer-alt" className="text-blue-400" />
                                                Kecepatan
                                            </div>
                                            <span className="font-black text-xs uppercase tracking-tighter">{plan.download_limit} Mbps</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => navigate('/gaming-checkout', { state: { plan } })}
                                        className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-purple-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-white/5"
                                    >
                                        Beli Sekarang
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-[40px]">
                                <FaIcon name="ghost" className="text-4xl text-slate-700 mb-4" />
                                <p className="text-slate-500 font-black uppercase tracking-widest">No Gaming Tiers Currently Deployed</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Footer Info */}
                <footer className="max-w-7xl mx-auto px-8 pb-20 flex flex-col lg:flex-row justify-between items-center gap-10 border-t border-white/5 pt-20">
                    <div className="flex items-center gap-8 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/1/1a/Valorant_logo.svg" alt="Valorant" className="h-6" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/21/Mobile_Legends_Logo.png" alt="MLBB" className="h-8" />
                        <img src="https://upload.wikimedia.org/wikipedia/id/thumb/0/03/Free_Fire_Logo.png/640px-Free_Fire_Logo.png" alt="FreeFire" className="h-10" />
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">© 2026 ND-Hotspot Core</p>
                        <p className="text-xs font-black italic uppercase text-purple-500 mt-1">Gaming Area Optimized v2.0</p>
                    </div>
                </footer>
            </div>
        </div>
    )
}

export default GamingArea
