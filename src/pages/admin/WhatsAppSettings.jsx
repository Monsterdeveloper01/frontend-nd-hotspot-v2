import { useState, useEffect } from 'react'


const WhatsAppSettings = () => {
  const [qr, setQr] = useState(null)
  const [status, setStatus] = useState('disconnected')
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)

  const WA_URL = import.meta.env.VITE_WA_URL || 'http://localhost:5000'

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 15000)
    return () => clearInterval(interval)
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${WA_URL}/status`)
      const data = await response.json()
      setStatus(data.status)
      setQr(data.qr)
      setLogs(data.logs.reverse())
    } catch (err) {
      console.error('Failed to fetch WA status')
    }
  }

  const handleRefresh = () => {
      setLoading(true)
      fetchStatus().finally(() => setLoading(false))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
        <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
                <h3 className="text-sm font-black text-slate-900 mb-8 tracking-widest uppercase">Connection Status</h3>
                
                <div className="flex items-center gap-4 mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className={`w-3 h-3 rounded-full ${status === 'connected' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-rose-500 shadow-lg shadow-rose-500/20'}`}></div>
                    <span className="font-black text-slate-700 uppercase tracking-[0.2em] text-xs">{status}</span>
                </div>

                {status !== 'connected' && qr && (
                    <div className="text-center p-8 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 italic">Scan Authorization Key</p>
                        <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100 mb-6">
                            <img src={qr} alt="WA QR Code" className="w-full h-auto rounded-xl" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tight">Open WhatsApp on your device and scan to establish secure link.</p>
                    </div>
                )}

                {status === 'connected' && (
                    <div className="text-center p-12 bg-emerald-50 rounded-[32px] border border-emerald-100 flex flex-col items-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-xl border-4 border-emerald-500 mb-8">
                            <i className="fas fa-check text-emerald-500"></i>
                        </div>
                        <h4 className="text-emerald-700 font-black text-lg mb-2 uppercase tracking-tighter italic leading-none">Gateway Active</h4>
                        <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest mb-10">Link Established</p>
                        
                        <button className="w-full py-4 bg-white text-rose-500 border border-rose-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-sm">
                            Disconnect Session
                        </button>
                    </div>
                )}

                <button 
                    onClick={handleRefresh}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-5 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm mt-6"
                >
                    <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`}></i>
                    Manual Sync
                </button>
            </div>
        </div>

        <div className="lg:col-span-3">
            <div className="bg-slate-950 rounded-[32px] shadow-2xl border border-white/5 flex flex-col h-full min-h-[600px] overflow-hidden">
                <div className="px-10 py-6 bg-black/40 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gateway Activity Logs</h3>
                    </div>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Streaming: Real-time</span>
                </div>
                <div className="flex-1 overflow-y-auto p-10 font-mono text-[11px] space-y-4 custom-scrollbar bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950 to-slate-950">
                    {logs.length > 0 ? logs.map((log, i) => (
                        <div key={i} className="flex gap-6 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] group hover:bg-white/[0.04] transition-all">
                            <span className="text-slate-600 font-bold shrink-0">[{log.time}]</span>
                            <span className="text-slate-300 tracking-tight leading-relaxed">{log.message}</span>
                        </div>
                    )) : (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-slate-700 italic uppercase tracking-[0.4em] font-black text-sm">System Listening for incoming signals...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  )
}

export default WhatsAppSettings
