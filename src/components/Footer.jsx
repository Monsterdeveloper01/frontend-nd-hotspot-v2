const Footer = () => {
    return (
        <footer className="bg-slate-900 py-16 text-center text-white pb-32 lg:pb-16">
            <div className="container mx-auto px-8">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6 bg-white rounded-2xl p-2">
                    <img src="/logo-wifi.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <h3 className="font-black text-2xl tracking-tighter mb-4 flex items-center justify-center">
                    <span className="text-blue-500">ND</span>
                    <span className="text-white mx-0.5">-</span>
                    <span className="text-orange-500">H</span>
                    <span className="text-emerald-500">o</span>
                    <span className="text-sky-400">t</span>
                    <span className="text-emerald-500">s</span>
                    <span className="text-sky-400">p</span>
                    <span className="text-emerald-500">o</span>
                    <span className="text-sky-400">t</span>
                </h3>
                <p className="text-slate-400 font-bold text-sm max-w-md mx-auto mb-10 leading-relaxed">
                    Penyedia layanan internet hotspot voucher tercepat, termurah, dan terpercaya di wilayah Anda.
                </p>
                <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">
                    © 2026 ND-NETWORK • POWERED BY TECH
                </div>
            </div>
        </footer>
    )
}

export default Footer
