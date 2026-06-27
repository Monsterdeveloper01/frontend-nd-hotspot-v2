import { useState, useEffect } from 'react'
import axios from 'axios'

const Icon = ({ name, className = "w-5 h-5" }) => {
    const icons = {
        server: <path d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />,
        plus: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />,
        edit: <path d="M11 5H6a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
        delete: <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
        check: <path d="M5 13l4 4L19 7" />,
        close: <path d="M6 18L18 6M6 6l12 12" />,
        info: <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
        eye: <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
        'eye-off': <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    };

    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {icons[name]}
        </svg>
    );
};

const OltManagement = () => {
    const [olts, setOlts] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        ip_address: '',
        username: '',
        password: '',
        snmp_community: 'public',
        type: 'vsol'
    })
    const [submitting, setSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // Modal State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: 'confirm', // 'confirm', 'success', 'error', 'warning'
        title: '',
        message: '',
        onConfirm: null
    })

    const showModal = (type, title, message, onConfirm = null) => {
        setModalConfig({ isOpen: true, type, title, message, onConfirm })
    }

    const closeModal = () => {
        setModalConfig({ ...modalConfig, isOpen: false })
    }

    const fetchOlts = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/olt`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setOlts(response.data)
        } catch (err) {
            console.error('Failed to fetch OLTs')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOlts()
    }, [])

    const handleEdit = (olt) => {
        setEditingId(olt.id)
        setFormData({
            name: olt.name,
            ip_address: olt.ip_address,
            username: olt.username,
            password: olt.password,
            snmp_community: olt.snmp_community || 'public',
            type: olt.type || 'vsol'
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setFormData({ name: '', ip_address: '', username: '', password: '', snmp_community: 'public', type: 'vsol' })
    }

    const handleDelete = (id) => {
        showModal('warning', 'Konfirmasi Hapus', 'Yakin hapus data OLT ini secara permanen? Semua data ONU/Modem yang terhubung akan ikut terhapus.', async () => {
            try {
                const token = localStorage.getItem('token')
                await axios.delete(`${import.meta.env.VITE_API_URL}/network/olts/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                fetchOlts()
                showModal('success', 'Terhapus', 'OLT berhasil dihapus')
            } catch (err) {
                showModal('error', 'Gagal', 'Gagal menghapus OLT')
            }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const token = localStorage.getItem('token')
            const url = editingId 
                ? `${import.meta.env.VITE_API_URL}/network/olts/${editingId}`
                : `${import.meta.env.VITE_API_URL}/network/olts`
            
            const method = editingId ? 'put' : 'post'
            
            await axios[method](url, formData, {
                headers: { Authorization: `Bearer ${token}` }
            })
            
            const isEdit = editingId
            handleCancelEdit()
            fetchOlts()
            showModal('success', isEdit ? 'Data Terupdate' : 'Berhasil', isEdit ? 'Perubahan OLT berhasil disimpan' : 'OLT baru berhasil ditambahkan')
        } catch (err) {
            showModal('error', 'Terjadi Kesalahan', 'Gagal menyimpan OLT. Pastikan form sudah diisi dengan benar.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <div>
                <h1 className="text-2xl font-black text-admin-text tracking-tight uppercase leading-none">Manajemen OLT</h1>
                <p className="text-admin-muted font-bold text-[10px] uppercase tracking-widest mt-2">Kelola konfigurasi perangkat OLT GPON/EPON di jaringan Anda</p>
            </div>

            {/* Form Card */}
            <div className="bg-admin-card rounded-2xl shadow-sm border border-admin-border overflow-hidden">
                <div className="px-10 py-8 border-b border-admin-border bg-admin-base/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${editingId ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-admin-accent text-white shadow-blue-200'}`}>
                            <Icon name={editingId ? "edit" : "server"} className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-admin-text leading-tight uppercase tracking-tight">
                                {editingId ? 'Edit Data OLT' : 'Tambah OLT Baru'}
                            </h2>
                            <p className="text-[10px] font-black text-admin-muted uppercase tracking-widest mt-1">Konfigurasi alamat IP dan autentikasi perangkat</p>
                        </div>
                    </div>
                    {editingId && (
                        <button onClick={handleCancelEdit} className="text-[10px] font-black text-admin-muted hover:text-rose-500 uppercase tracking-widest transition-colors">Batal Edit</button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Group 1 */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-admin-muted uppercase tracking-widest border-b border-admin-border pb-3 flex items-center gap-2">
                                <Icon name="server" className="w-3 h-3" /> Identitas OLT
                            </h3>
                            <div>
                                <label className="block text-[10px] font-black text-admin-muted uppercase tracking-widest mb-2 ml-1">Nama / Lokasi OLT</label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-5 py-4 bg-admin-base border border-admin-border rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300" 
                                    placeholder="Contoh: OLT Pusat"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-admin-muted uppercase tracking-widest mb-2 ml-1">Merek / Tipe OLT</label>
                                <select 
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                    className="w-full px-5 py-4 bg-admin-base border border-admin-border rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase text-sm"
                                    required
                                >
                                    <option value="vsol">GLOBAL V-SOL GPON/EPON</option>
                                </select>
                            </div>
                        </div>

                        {/* Group 2 */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-admin-muted uppercase tracking-widest border-b border-admin-border pb-3 flex items-center gap-2">
                                <Icon name="info" className="w-3 h-3" /> Konfigurasi Jaringan
                            </h3>
                            <div>
                                <label className="block text-[10px] font-black text-admin-muted uppercase tracking-widest mb-2 ml-1">IP Address OLT</label>
                                <input 
                                    type="text" 
                                    value={formData.ip_address}
                                    onChange={(e) => setFormData({...formData, ip_address: e.target.value})}
                                    className="w-full px-5 py-4 bg-admin-base border border-admin-border rounded-2xl font-bold font-mono text-sm tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                    placeholder="192.168.1.1"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-admin-muted uppercase tracking-widest mb-2 ml-1">SNMP Community</label>
                                <select 
                                    value={formData.snmp_community}
                                    onChange={(e) => setFormData({...formData, snmp_community: e.target.value})}
                                    className="w-full px-5 py-4 bg-admin-base border border-admin-border rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase text-sm"
                                    required
                                >
                                    <option value="public">PUBLIC (Read-Only - Disarankan)</option>
                                    <option value="private">PRIVATE (Read-Write)</option>
                                </select>
                            </div>
                        </div>

                        {/* Group 3: Auth & Button */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-admin-muted uppercase tracking-widest border-b border-admin-border pb-3 flex items-center gap-2">
                                <Icon name="check" className="w-3 h-3" /> Autentikasi Telnet
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-admin-muted uppercase tracking-widest mb-2 ml-1">Username</label>
                                    <input 
                                        type="text" 
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        className="w-full px-5 py-4 bg-admin-base border border-admin-border rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                        placeholder="admin"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-admin-muted uppercase tracking-widest mb-2 ml-1">Password</label>
                                    <div className="relative">
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            className="w-full px-5 py-4 bg-admin-base border border-admin-border rounded-2xl font-bold font-mono tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-12" 
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-admin-muted hover:text-admin-text transition-colors"
                                        >
                                            <Icon name={showPassword ? "eye-off" : "eye"} className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-2">
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 ${submitting ? 'bg-admin-base text-admin-muted' : editingId ? 'bg-amber-500 text-white shadow-lg shadow-amber-200 hover:bg-amber-600' : 'bg-admin-accent text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95'}`}
                                >
                                    <Icon name="check" className="w-4 h-4" />
                                    {submitting ? 'Processing...' : editingId ? 'Simpan Perubahan' : 'Tambahkan OLT'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* List Card */}
            <div className="bg-admin-card rounded-2xl shadow-sm border border-admin-border overflow-hidden">
                <div className="p-8 bg-admin-base/50 border-b border-admin-border flex justify-between items-center">
                    <h3 className="text-sm font-black text-admin-text uppercase tracking-[0.2em]">Daftar OLT Terdaftar</h3>
                    <div className="text-[10px] font-black text-admin-muted uppercase tracking-[0.2em] bg-admin-card px-5 py-3 rounded-xl border border-admin-border shadow-inner">
                        Total: {olts.length} Perangkat
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="bg-admin-base border-b border-admin-border">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-admin-muted">Nama OLT</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-admin-muted">Informasi Jaringan</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-admin-muted text-center">Data Tersinkron</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-admin-muted text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center text-admin-muted font-bold italic">Loading records...</td>
                                </tr>
                            ) : olts.length > 0 ? olts.map((olt) => (
                                <tr key={olt.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
                                                <Icon name="server" className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="font-black text-admin-text text-lg leading-none uppercase tracking-tight">{olt.name}</div>
                                                <div className="flex items-center gap-2 mt-1.5 text-admin-muted font-bold text-[10px] uppercase tracking-widest">
                                                    Merek: <span className="text-blue-500">{olt.type}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="font-black font-mono text-admin-text text-sm tracking-widest">{olt.ip_address}</div>
                                        <div className="text-[10px] font-black uppercase mt-1 tracking-widest text-admin-muted">
                                            SNMP: <span className="text-admin-text">{olt.snmp_community}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                                            {olt.nodes_count || 0} ONU Terhubung
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleEdit(olt)}
                                                className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-admin-text transition-all shadow-sm"
                                                title="Edit"
                                            >
                                                <Icon name="edit" className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(olt.id)}
                                                className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-500 hover:text-admin-text transition-all shadow-sm"
                                                title="Hapus"
                                            >
                                                <Icon name="delete" className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-24 text-center text-admin-muted font-bold italic">Belum ada perangkat OLT terdaftar.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Global Modal */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-admin-card rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-admin-border">
                        <div className={`p-8 text-center ${
                            modalConfig.type === 'error' ? 'bg-gradient-to-b from-rose-50/50 to-white' : 
                            modalConfig.type === 'warning' ? 'bg-gradient-to-b from-amber-50/50 to-white' : 
                            modalConfig.type === 'success' ? 'bg-gradient-to-b from-emerald-50/50 to-white' : 'bg-gradient-to-b from-blue-50/50 to-white'
                        }`}>
                            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-xl ${
                                modalConfig.type === 'error' ? 'bg-rose-500 text-admin-text shadow-rose-200' : 
                                modalConfig.type === 'warning' ? 'bg-amber-500 text-white shadow-amber-200' : 
                                modalConfig.type === 'success' ? 'bg-emerald-500 text-admin-text shadow-emerald-200' : 'bg-admin-accent text-white shadow-blue-200'
                            }`}>
                                <Icon name={
                                    modalConfig.type === 'error' ? 'close' : 
                                    modalConfig.type === 'warning' ? 'info' : 
                                    modalConfig.type === 'success' ? 'check' : 'info'
                                } className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-admin-text tracking-tight leading-none mb-3">{modalConfig.title}</h3>
                            <p className="text-sm font-bold text-admin-muted leading-relaxed px-4">{modalConfig.message}</p>
                        </div>
                        <div className="p-6 bg-admin-card flex gap-3">
                            {(modalConfig.type === 'confirm' || modalConfig.type === 'warning') ? (
                                <>
                                    <button 
                                        onClick={closeModal}
                                        className="flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-admin-muted bg-admin-base hover:bg-slate-200 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        onClick={() => {
                                            closeModal();
                                            if (modalConfig.onConfirm) modalConfig.onConfirm();
                                        }}
                                        className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-admin-text shadow-lg transition-all hover:scale-[0.98] ${
                                            modalConfig.type === 'warning' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                                        }`}
                                    >
                                        Ya, Lanjutkan
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={closeModal}
                                    className="w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-admin-text shadow-lg transition-all hover:scale-[0.98] bg-slate-800 hover:bg-slate-900 shadow-slate-200"
                                >
                                    Tutup Pesan
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OltManagement
