import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const FaIcon = ({ name, className = "" }) => <i className={`fas fa-${name} ${className}`}></i>

const Maintenance = () => {
    const [showBypass, setShowBypass] = useState(false)
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [clickCount, setClickCount] = useState(0)
    const [currentSessionId, setCurrentSessionId] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        // Fetch current session ID to see if existing bypass is still valid
        const checkStatus = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/maintenance/status`)
                setCurrentSessionId(res.data.session_id)
                
                // If maintenance is OFF, redirect home
                if (!res.data.maintenance_mode) {
                    navigate('/')
                }
            } catch (err) {
                console.error('Status check failed')
            }
        }
        checkStatus()
    }, [navigate])

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
                document.cookie = `maintenance_bypass=${res.data.token}; path=/; max-age=` + (24 * 60 * 60);
                localStorage.setItem('maintenance_bypass', res.data.token);
                
                // Set axios default for current session
                axios.defaults.headers.common['X-Maintenance-Bypass'] = res.data.token;
                
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
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Ultra Premium Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50/50 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-50/50 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2563eb 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
            
            <div className="max-w-4xl w-full relative z-10">
                {/* Hero Card */}
                <div className="bg-white/70 backdrop-blur-2xl border border-slate-100 rounded-[50px] p-8 lg:p-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>
                    
                    {/* Floating Tools Icon */}
                    <div 
                        onClick={handleLogoClick}
                        className="w-28 h-28 bg-white border border-slate-100 rounded-[40px] flex items-center justify-center mx-auto mb-12 shadow-xl shadow-blue-100 group cursor-pointer active:scale-90 transition-all hover:rotate-3"
                    >
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[30px] flex items-center justify-center shadow-lg">
                            <FaIcon name="tools" className="text-white text-4xl animate-pulse" />
                        </div>
                    </div>

                    <div className="max-w-2xl mx-auto space-y-8">
                        <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-blue-50 border border-blue-100 rounded-full">
                            <span className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
                            <span className="text-[10px] font-black text-blue-700 uppercase tracking-[0.3em]">System Under Optimization</span>
                        </div>
                        
                        <h1 className="text-5xl lg:text-7xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-4">
                            Kami Sedang <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">Meningkatkan Layanan</span>
                        </h1>

                        <div className="space-y-6">
                            <p className="text-slate-500 font-bold text-xl leading-relaxed">
                                Mohon maaf, website ini mungkin akan tidak tersedia beberapa waktu.
                            </p>
                            
                            <div className="relative p-8 bg-amber-50/50 border border-amber-100 rounded-[35px] overflow-hidden group/alert hover:bg-amber-50 transition-colors">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400"></div>
                                <div className="flex flex-col md:flex-row items-center gap-6 text-left">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-amber-500 text-2xl flex-shrink-0 group-hover/alert:scale-110 transition-transform">
                                        <FaIcon name="broadcast-tower" />
                                    </div>
                                    <p className="text-amber-900 text-sm font-black uppercase leading-relaxed tracking-wide">
                                        Gangguan sinyal ngeleg atau hilang sinyal mungkin terjadi di wilayah kamu. <span className="text-amber-600 underline decoration-amber-200 underline-offset-4">Tolong tunggu teknisi kami meningkatkan kualitas layanan kami.</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Visual Progress Mockup */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center">
                                <FaIcon name="microchip" className="text-blue-500 mb-3 text-lg" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hardware</span>
                                <span className="text-xs font-black text-slate-700 uppercase">Upgraded</span>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center">
                                <FaIcon name="server" className="text-indigo-500 mb-3 text-lg" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Core Server</span>
                                <span className="text-xs font-black text-slate-700 uppercase">Stabilizing</span>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center">
                                <FaIcon name="shield-check" className="text-emerald-500 mb-3 text-lg" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Security</span>
                                <span className="text-xs font-black text-slate-700 uppercase">Verified</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bypass Panel */}
                {showBypass && (
                    <div className="mt-12 p-10 bg-white border border-slate-200 rounded-[40px] max-w-md mx-auto shadow-2xl animate-bounce-in relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <h3 className="text-slate-400 font-black uppercase tracking-widest text-xs mb-8 flex items-center justify-center gap-3 relative z-10">
                            <FaIcon name="lock" className="text-blue-600" /> Administrative Access
                        </h3>
                        <form onSubmit={handleBypass} className="space-y-5 relative z-10">
                            <div className="relative group">
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter Bypass Password"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-slate-900 font-mono text-center outline-none focus:border-blue-500 transition-all text-xl placeholder:text-slate-300 shadow-inner"
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all active:scale-95 disabled:opacity-50 shadow-xl"
                            >
                                {loading ? 'Authenticating...' : 'Authorize Session'}
                            </button>
                            <button 
                                type="button"
                                onClick={() => setShowBypass(false)}
                                className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 hover:text-slate-600 transition-colors"
                            >
                                Back to Status
                            </button>
                        </form>
                    </div>
                )}

                {/* Network Branding Footer */}
                <div className="mt-16 text-center">
                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.8em]">
                        ND-NETWORK CORE SYSTEM • HIGH AVAILABILITY
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Maintenance
