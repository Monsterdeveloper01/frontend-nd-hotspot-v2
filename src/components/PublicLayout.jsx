import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

const PublicLayout = ({ children }) => {
    const [showMenu, setShowMenu] = useState(false)
    const toggleMenu = () => setShowMenu(!showMenu)

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pt-16 lg:pt-0">
            <Navbar toggleMenu={toggleMenu} />

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 z-[100] transition-all duration-500 lg:hidden ${showMenu ? 'visible opacity-100' : 'invisible opacity-0'}`}>
                <div className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm`} onClick={toggleMenu}></div>
                <div className={`absolute right-0 top-0 bottom-0 w-[80%] max-w-sm bg-white shadow-2xl transition-transform duration-500 transform ${showMenu ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
                    {/* Header Mobile Menu */}
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                                <img src="/logo-wifi.png" alt="Logo" className="w-full h-full object-contain invert brightness-0" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-slate-900 text-lg tracking-tighter">ND-HOTSPOT</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">High Speed Internet</span>
                            </div>
                        </div>
                        <button onClick={toggleMenu} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <i className="fas fa-times text-xl" />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex-1 overflow-y-auto py-8 px-6 space-y-4">
                        <Link to="/" onClick={toggleMenu} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-100 transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <i className="fas fa-home text-xl" />
                            </div>
                            <span className="font-bold text-slate-700 text-lg">Beranda</span>
                        </Link>

                        <Link to="/speed-test" onClick={toggleMenu} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-amber-50 hover:border-amber-100 transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <i className="fas fa-bolt text-xl" />
                            </div>
                            <span className="font-bold text-slate-700 text-lg">Speedtest</span>
                        </Link>

                        <Link to="/check-voucher" onClick={toggleMenu} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-100 transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <i className="fas fa-search text-xl" />
                            </div>
                            <span className="font-bold text-slate-700 text-lg">Cek Voucher</span>
                        </Link>

                        <Link to="/payment" onClick={toggleMenu} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-100 transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <i className="fas fa-credit-card text-xl" />
                            </div>
                            <span className="font-bold text-slate-700 text-lg">Bayar Tagihan</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                {children}
            </div>

            <Footer />
        </div>
    )
}

export default PublicLayout
