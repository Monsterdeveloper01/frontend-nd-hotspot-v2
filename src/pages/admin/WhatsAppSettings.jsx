import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'

const socket = io(import.meta.env.VITE_WA_URL)

const WhatsAppSettings = () => {
  const [status, setStatus] = useState('checking')
  const [qr, setQr] = useState(null)
  const [logs, setLogs] = useState([])
  const [testNumber, setTestNumber] = useState('')
  const [testMessage, setTestMessage] = useState('Halo! Ini pesan tes dari sistem ND-HOTSPOT.')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    socket.on('status', (s) => setStatus(s))
    socket.on('qr', (q) => setQr(q))
    socket.on('logs', (l) => setLogs(l))
    socket.on('log', (log) => setLogs(prev => [log, ...prev].slice(0, 100)))

    // Initial fetch
    axios.get(`${import.meta.env.VITE_WA_URL}/status`).then(res => {
      setStatus(res.data.status)
      setQr(res.data.qr)
      setLogs(res.data.logs)
    }).catch(() => setStatus('offline'))

    return () => {
      socket.off('status')
      socket.off('qr')
      socket.off('logs')
      socket.off('log')
    }
  }, [])

  const handleSendTest = async (e) => {
    e.preventDefault()
    if (!testNumber) return
    setSending(true)
    try {
      await axios.post(`${import.meta.env.VITE_WA_URL}/send-message`, {
        number: '62' + testNumber,
        message: testMessage
      })
      alert('Pesan tes dikirim!')
    } catch (err) {
      alert('Gagal mengirim pesan: ' + (err.response?.data?.error || err.message))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header & Connection Status at the Top */}
      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <i className="fab fa-whatsapp text-emerald-500 text-3xl"></i>
              WHATSAPP GATEWAY
            </h1>
            <p className="text-slate-500 font-bold text-xs mt-1 uppercase tracking-widest">Manajemen Notifikasi & Otomatisasi</p>
          </div>

          <div className="flex items-center gap-4">
            <div className={`px-6 py-3 rounded-2xl flex items-center gap-3 border-2 transition-all ${
              status === 'connected' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
              status === 'disconnected' ? 'bg-rose-50 border-rose-100 text-rose-700' : 
              'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                status === 'connected' ? 'bg-emerald-500 animate-pulse' : 
                status === 'disconnected' ? 'bg-rose-500' : 'bg-slate-400'
              }`}></div>
              <span className="font-black uppercase tracking-widest text-[10px]">
                Status: {status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. QR Code Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm h-full">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
              <i className="fas fa-qrcode text-blue-500"></i> Autentikasi Perangkat
            </h3>
            
            {status === 'connected' ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <i className="fas fa-check-circle text-4xl"></i>
                </div>
                <p className="text-slate-700 font-black uppercase text-xs tracking-widest">Perangkat Terhubung</p>
                <p className="text-slate-400 text-[10px] mt-2 leading-relaxed">Sistem siap mengirimkan notifikasi voucher dan tagihan secara otomatis.</p>
              </div>
            ) : qr ? (
              <div className="text-center">
                <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200 inline-block mb-6">
                  <img src={qr} alt="WA QR Code" className="w-48 h-48 mx-auto" />
                </div>
                <p className="text-slate-600 font-bold text-xs leading-relaxed">Scan kode QR di atas menggunakan WhatsApp di ponsel Anda untuk menghubungkan.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Menunggu QR Code...</p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Activity Logs Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col overflow-hidden h-[500px]">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <i className="fas fa-stream text-indigo-500"></i> Gateway Activity Logs
              </h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[9px] font-black text-slate-500 uppercase">Realtime</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-900 font-mono text-[11px]">
              {logs.length > 0 ? logs.map((log) => (
                <div key={log.id} className="flex gap-4 group hover:bg-white/5 p-2 rounded-lg transition-colors border-l-2" style={{ 
                  borderColor: log.status === 'success' ? '#10b981' : log.status === 'error' ? '#f43f5e' : '#3b82f6' 
                }}>
                  <span className="text-slate-500 flex-shrink-0">[{log.time}]</span>
                  <span className={`flex-shrink-0 uppercase font-black tracking-widest w-16 ${
                    log.status === 'success' ? 'text-emerald-400' : log.status === 'error' ? 'text-rose-400' : 'text-blue-400'
                  }`}>
                    {log.type}
                  </span>
                  <span className="text-slate-300 break-all">{log.message}</span>
                </div>
              )) : (
                <div className="h-full flex items-center justify-center text-slate-600 italic">
                  Belum ada aktivitas yang tercatat...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Test Message Section */}
      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center gap-2">
          <i className="fas fa-paper-plane text-purple-500"></i> Uji Coba Pengiriman
        </h3>
        
        <form onSubmit={handleSendTest} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-4 space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor WhatsApp</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">62</span>
              <input 
                type="text" 
                value={testNumber}
                onChange={(e) => setTestNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="81234567890"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-10 pr-4 py-4 outline-none focus:border-blue-400 transition-all font-bold text-sm"
              />
            </div>
          </div>
          <div className="md:col-span-6 space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Isi Pesan Tes</label>
            <input 
              type="text" 
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-4 outline-none focus:border-blue-400 transition-all font-bold text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <button 
              type="submit"
              disabled={sending || status !== 'connected'}
              className="w-full py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-slate-200"
            >
              {sending ? <i className="fas fa-circle-notch fa-spin"></i> : 'Kirim Tes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default WhatsAppSettings
