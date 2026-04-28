import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const FaIcon = ({ name, className = "" }) => <i className={`fas fa-${name} ${className}`}></i>

const Maintenance = () => {
    const [showBypass, setShowBypass] = useState(false)
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [clickCount, setClickCount] = useState(0)
    const navigate = useNavigate()

    const handleLogoClick = () => {
        setClickCount(prev => prev + 1)
        if (clickCount >= 4) { // Click 5 times to reveal bypass
            setShowBypass(true)
            setClickCount(0)
        }
    }

    const handleBypass = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/maintenance/bypass`, { password })
            if (res.data.success) {
                // Set cookie for 24 hours
                document.cookie = "maintenance_bypass=karambia1686; path=/; max-age=" + (24 * 60 * 60);
                localStorage.setItem('maintenance_bypass', res.data.token);
                
                // Direct redirect to home
                window.location.href = '/';
            }
        } catch (err) {
            alert('Akses Ditolak: Password Salah')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-600/20 blur-[80px] rounded-full animate-pulse pointer-events-none"></div>

            <div className="max-w-2xl w-full text-center relative z-10">
                {/* Animated Icon */}
                <div 
                    onClick={handleLogoClick}
                    className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[32px] flex items-center justify-center mx-auto mb-12 shadow-2xl shadow-blue-500/20 group cursor-default active:scale-95 transition-all"
                >
                    <FaIcon name="tools" className="text-white text-4xl animate-bounce" />
                </div>

                <h1 className="text-4xl lg:text-6xl font-black text-white uppercase tracking-tighter mb-6 leading-tight">
                    Sistem Sedang <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Ditingkatkan</span>
                </h1>

                <p className="text-slate-400 font-bold text-lg mb-12 leading-relaxed">
                    Mohon maaf atas ketidaknyamanannya. Kami sedang melakukan pemeliharaan rutin dan peningkatan performa jaringan untuk memberikan pengalaman terbaik bagi Anda.
                </p>

                {/* Progress Indicator */}
                <div className="max-w-xs mx-auto mb-16">
                    <div className="flex justify-between items-center mb-4 text-[10px] font-black uppercase tracking-widest text-blue-400">
                        <span>Maintenance Progress</span>
                        <span>85%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse" style={{ width: '85%' }}></div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                    <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                        <FaIcon name="clock" className="text-blue-400 text-sm" />
                        <span className="text-slate-300 text-xs font-black uppercase tracking-widest">Est: 30 Menit</span>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                        <FaIcon name="wifi" className="text-emerald-400 text-sm" />
                        <span className="text-slate-300 text-xs font-black uppercase tracking-widest">Core Status: Stable</span>
                    </div>
                </div>

                {/* Bypass Section (Hidden by default) */}
                {showBypass && (
                    <div className="mt-20 p-8 bg-white/5 border border-white/10 rounded-[32px] max-w-sm mx-auto transition-all duration-500 transform scale-100 opacity-100">
                        <h3 className="text-white font-black uppercase tracking-widest text-xs mb-6 flex items-center justify-center gap-2">
                            <FaIcon name="shield-alt" className="text-indigo-500" /> Administrative Bypass
                        </h3>
                        <form onSubmit={handleBypass} className="space-y-4">
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter Bypass Password"
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white font-mono text-center outline-none focus:border-indigo-500 transition-all"
                            />
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase text-xs tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Authenticating...' : 'Open Access'}
                            </button>
                            <button 
                                type="button"
                                onClick={() => setShowBypass(false)}
                                className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 hover:text-white"
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="absolute bottom-12 left-0 right-0 text-center">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">
                    ND-NETWORK INFRASTRUCTURE CORE • V2.0
                </p>
            </div>
        </div>
    )
}

export default Maintenance
