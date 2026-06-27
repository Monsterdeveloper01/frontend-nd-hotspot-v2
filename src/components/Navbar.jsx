import { Link } from 'react-router-dom'

const Navbar = ({ toggleMenu }) => {
    return (
        <>
            {/* Mobile Header Bar - Premium Glassmorphism */}
            <div className="lg:hidden fixed left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 z-50 shadow-sm top-0 transition-all">
                <div className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 rounded-xl p-1.5 shadow-sm">
                            <img src="/logo-wifi.png" alt="Logo" className="w-full h-full object-contain drop-shadow-sm" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-slate-800 text-base tracking-tight flex items-center">
                                <span className="text-blue-600">ND</span>
                                <span className="mx-0.5 text-slate-300">-</span>
                                <span>Hotspot</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">High Speed Internet</span>
                        </div>
                    </div>
                    <button onClick={toggleMenu} className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-600 active:scale-95 transition-all">
                        <i className="fas fa-bars text-lg" />
                    </button>
                </div>
            </div>

            {/* Desktop Header - Enterprise Minimalist */}
            <header className="hidden lg:block sticky top-0 z-40 w-full bg-white/70 border-b border-slate-200/50 backdrop-blur-xl transition-all duration-300">
                <div className="container mx-auto px-8 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-4 group">
                        <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 rounded-2xl shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-0.5 p-2">
                            <img src="/logo-wifi.png" alt="ND-HOTSPOT Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tighter leading-none flex items-center">
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ND</span>
                                <span className="text-slate-300 mx-1">-</span>
                                <span className="text-slate-800 tracking-tight">HOTSPOT</span>
                            </h1>
                            <p className="text-[9px] text-slate-400 font-black tracking-[0.3em] mt-1.5 uppercase">Premium Internet Provider</p>
                        </div>
                    </Link>
                    
                    <nav className="flex items-center gap-10">
                        <Link to="/" className="relative text-[13px] font-black text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-[0.15em] group">
                            Home
                            <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
                        </Link>
                        <Link to="/payment" className="relative text-[13px] font-black text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-[0.15em] group">
                            Bayar Tagihan
                            <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
                        </Link>
                        <Link to="/check-voucher" className="relative text-[13px] font-black text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-[0.15em] group">
                            Cek Voucher
                            <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
                        </Link>
                    </nav>
                </div>
            </header>
        </>
    )
}

export default Navbar
