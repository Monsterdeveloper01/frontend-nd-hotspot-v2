import { Link } from 'react-router-dom'
import PublicLayout from '../components/PublicLayout'

const SpeedTest = () => {
    return (
        <PublicLayout>
            <div className="flex-1 bg-[#0a0a0c] relative overflow-hidden flex flex-col items-center justify-center py-32 px-6">
                {/* Futuristic Background Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none animate-pulse"></div>
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                
                <div className="max-w-3xl w-full text-center relative z-10">
                    {/* Icon Header */}
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[32px] flex items-center justify-center mx-auto mb-12 shadow-2xl shadow-blue-500/30 transform hover:scale-110 transition-transform duration-500">
                        <i className="fas fa-bolt text-white text-4xl animate-pulse"></i>
                    </div>

                    <div className="space-y-6 mb-16">
                        <span className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">
                            Future Update • V3.0
                        </span>
                        
                        <h1 className="text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-tight">
                            Speedtest <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">Coming Soon</span>
                        </h1>
                        
                        <p className="text-slate-500 text-lg font-bold max-w-xl mx-auto leading-relaxed">
                            Kami sedang mengkalibrasi mesin uji kecepatan tercanggih untuk memastikan Anda mendapatkan hasil pengukuran yang paling akurat langsung dari jaringan inti kami.
                        </p>
                    </div>

                    {/* Progress Indicator Mockup */}
                    <div className="max-w-md mx-auto mb-16 p-8 bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-xl">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calibration Progress</span>
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">72% Completed</span>
                        </div>
                        <div className="h-3 bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full w-[72%] shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mt-8">
                            <div className="text-center">
                                <div className="text-white font-black text-xl mb-1">64</div>
                                <div className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Nodes Ready</div>
                            </div>
                            <div className="text-center border-x border-white/10">
                                <div className="text-white font-black text-xl mb-1">99.9</div>
                                <div className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Uptime Target</div>
                            </div>
                            <div className="text-center">
                                <div className="text-white font-black text-xl mb-1">10G</div>
                                <div className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Core Speed</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link 
                            to="/"
                            className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-xl"
                        >
                            Back to Home
                        </Link>
                        <button 
                            className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all cursor-default"
                        >
                            Stay Tuned
                        </button>
                    </div>
                </div>

                {/* Footer Decor */}
                <div className="mt-32 text-center">
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.6em]">
                        ND-NETWORK INFRASTRUCTURE LABS
                    </p>
                </div>
            </div>
        </PublicLayout>
    )
}

export default SpeedTest
