import { Link } from 'react-router-dom'

const FaIcon = ({ name, className = "" }) => <i className={`fas fa-${name} ${className}`}></i>

const Footer = () => {
    return (
        <footer className="bg-white border-t border-slate-100 py-12 lg:py-16">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                {/* Top Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-12">
                    {/* Brand */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-200">
                            <FaIcon name="wifi" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-800 text-lg leading-none uppercase tracking-tighter">ND-HOTSPOT</h3>
                            <p className="text-slate-400 text-xs font-bold mt-1">Internet Cepat & Stabil</p>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap items-center gap-6 lg:gap-12">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center text-sm">
                                <FaIcon name="shield-alt" />
                            </div>
                            <span className="text-slate-600 text-sm font-bold uppercase tracking-tight">Aman & Terpercaya</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center text-sm">
                                <FaIcon name="bolt" />
                            </div>
                            <span className="text-slate-600 text-sm font-bold uppercase tracking-tight">High Speed</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center text-sm">
                                <FaIcon name="headset" />
                            </div>
                            <span className="text-slate-600 text-sm font-bold uppercase tracking-tight">Support 24/7</span>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-slate-100 w-full mb-12"></div>

                {/* Bottom Section */}
                <div className="text-center space-y-8">
                    {/* Navigation Links */}
                    <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
                        <Link to="/" className="text-slate-500 hover:text-blue-600 text-sm font-black uppercase tracking-widest transition-colors">Beranda</Link>
                        <Link to="/check-voucher" className="text-slate-500 hover:text-blue-600 text-sm font-black uppercase tracking-widest transition-colors">Cek Voucher</Link>
                        <Link to="/bayar-tagihan" className="text-slate-500 hover:text-blue-600 text-sm font-black uppercase tracking-widest transition-colors">Bayar Tagihan</Link>
                    </div>

                    {/* Copyright & Legal */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                            © 2026 ND-NETWORK • POWERED BY <a href="https://pointku.my.id" target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors">POINTKU SOFTWARE SOLUTION</a>
                        </p>
                        <div className="flex justify-center items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <Link to="/privacy" className="text-blue-500 hover:underline">Kebijakan Privasi</Link>
                            <span className="text-slate-200">•</span>
                            <Link to="/terms" className="text-blue-500 hover:underline">Syarat & Ketentuan</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
