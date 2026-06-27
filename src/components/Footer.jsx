import { Link } from 'react-router-dom'

const FaIcon = ({ name, className = "" }) => <i className={`fas fa-${name} ${className}`}></i>

const Footer = () => {
    return (
        <footer className="bg-gradient-to-b from-white to-slate-50/50 border-t border-slate-200/60 py-12 lg:py-16">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                {/* Top Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-12">
                    {/* Brand */}
                    <div className="flex items-center gap-4 group cursor-default">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl shadow-blue-500/20 group-hover:shadow-blue-500/40 group-hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <FaIcon name="wifi" />
                        </div>
                        <div>
                            <h3 className="font-black bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent text-xl leading-none uppercase tracking-tight">ND-HOTSPOT</h3>
                            <p className="text-slate-400 text-xs font-bold mt-1.5 uppercase tracking-widest">Internet Cepat & Stabil</p>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100 hover:-translate-y-0.5 transition-all cursor-default group">
                            <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-sm group-hover:scale-110 transition-transform">
                                <FaIcon name="shield-alt" />
                            </div>
                            <span className="text-slate-600 text-xs font-black uppercase tracking-wider">Aman & Terpercaya</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-100 hover:-translate-y-0.5 transition-all cursor-default group">
                            <div className="w-8 h-8 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center text-sm group-hover:scale-110 transition-transform">
                                <FaIcon name="bolt" />
                            </div>
                            <span className="text-slate-600 text-xs font-black uppercase tracking-wider">High Speed</span>
                        </div>
                        <a href="https://wa.me/628129588587" target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 hover:-translate-y-0.5 transition-all cursor-pointer group">
                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-sm group-hover:scale-110 transition-transform">
                                <FaIcon name="whatsapp" className="fab" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-600 text-[10px] font-black uppercase tracking-wider leading-none">Support 24/7</span>
                                <span className="text-blue-600 text-[11px] font-black tracking-widest mt-1">+62 812-9588-587</span>
                            </div>
                        </a>
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent w-full mb-12"></div>

                {/* Bottom Section */}
                <div className="text-center space-y-8">
                    {/* Navigation Links */}
                    <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4">
                        <Link to="/" className="relative text-slate-400 hover:text-blue-600 text-xs font-black uppercase tracking-[0.2em] transition-colors group">
                            Beranda
                            <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
                        </Link>
                        <Link to="/check-voucher" className="relative text-slate-400 hover:text-blue-600 text-xs font-black uppercase tracking-[0.2em] transition-colors group">
                            Cek Voucher
                            <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
                        </Link>
                        <Link to="/payment" className="relative text-slate-400 hover:text-blue-600 text-xs font-black uppercase tracking-[0.2em] transition-colors group">
                            Bayar Tagihan
                            <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
                        </Link>
                    </div>

                    {/* Copyright & Legal */}
                    <div className="space-y-5">
                        <p className="text-[10px] font-black text-slate-400/80 uppercase tracking-[0.3em]">
                            © 2026 ND-NETWORK • POWERED BY <a href="https://pointku.my.id" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">POINTKU SOFTWARE SOLUTION</a>
                        </p>
                        <div className="flex justify-center items-center gap-4 text-[10px] font-black text-slate-400/80 uppercase tracking-widest">
                            <Link to="/privacy" className="hover:text-blue-600 transition-colors">Kebijakan Privasi</Link>
                            <span className="text-slate-300">•</span>
                            <Link to="/terms" className="hover:text-blue-600 transition-colors">Syarat & Ketentuan</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
