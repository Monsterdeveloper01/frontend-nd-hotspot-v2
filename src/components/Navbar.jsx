import { Link } from 'react-router-dom'

const Navbar = ({ toggleMenu }) => {
    return (
        <>
            {/* Mobile Header Bar - Biru */}
            <div className="lg:hidden fixed left-0 right-0 bg-blue-600 border-b-4 border-blue-400 z-50 shadow-lg top-0">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg p-1">
                            <img src="/logo-wifi.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-white text-base tracking-wide flex items-center">
                                <span>ND</span>
                                <span className="mx-0.5">-</span>
                                <span className="text-orange-300">H</span>
                                <span className="text-emerald-300">o</span>
                                <span className="text-sky-200">t</span>
                                <span className="text-emerald-300">s</span>
                                <span className="text-sky-200">p</span>
                                <span className="text-emerald-300">o</span>
                                <span className="text-sky-200">t</span>
                            </span>
                            <span className="text-[11px] text-blue-100 font-medium">Voucher Internet</span>
                        </div>
                    </div>
                    <button onClick={toggleMenu} className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white active:scale-90 transition-transform">
                        <i className="fas fa-bars text-xl" />
                    </button>
                </div>
            </div>

            {/* Desktop Header */}
            <header className="hidden lg:block sticky top-0 z-40 w-full bg-white/90 border-b border-slate-200 backdrop-blur-md">
                <div className="container mx-auto px-8 py-6 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center">
                            <img src="/logo-wifi.png" alt="ND-HOTSPOT Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tighter leading-none flex items-center">
                                <span className="text-blue-600">ND</span>
                                <span className="text-slate-900 mx-0.5">-</span>
                                <span className="text-orange-500">H</span>
                                <span className="text-emerald-500">o</span>
                                <span className="text-sky-400">t</span>
                                <span className="text-emerald-500">s</span>
                                <span className="text-sky-400">p</span>
                                <span className="text-emerald-500">o</span>
                                <span className="text-sky-400">t</span>
                            </h1>
                            <p className="text-[10px] text-slate-400 font-black tracking-widest mt-1 uppercase">High Speed Internet Provider</p>
                        </div>
                    </Link>
                    
                    <nav className="flex items-center gap-8">
                        <Link to="/" className="text-sm font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Home</Link>
                        <Link to="/speed-test" className="text-sm font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Speedtest</Link>
                        <Link to="/payment" className="text-sm font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Bayar Tagihan</Link>
                        <Link to="/check-voucher" className="text-sm font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Cek Voucher</Link>
                    </nav>
                </div>
            </header>
        </>
    )
}

export default Navbar
