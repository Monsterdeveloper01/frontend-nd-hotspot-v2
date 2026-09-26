import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PointAnalytics() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('customers'); // customers | plans | rules | reconcile
  const [analytics, setAnalytics] = useState(null);
  const [searchPhone, setSearchPhone] = useState('');
  
  // Accounts table
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [revealedPhones, setRevealedPhones] = useState({});

  // Ledger Modal
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerData, setLedgerData] = useState([]);
  const [showLedgerModal, setShowLedgerModal] = useState(false);

  // Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustPhone, setAdjustPhone] = useState('');
  const [adjustType, setAdjustType] = useState('add'); // add | deduct
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);

  // Rules Tab
  const [rules, setRules] = useState([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [ruleForm, setRuleForm] = useState({
    name: '',
    description: '',
    type: 'purchase',
    calculation_type: 'per_unit',
    value: 10,
    unit_amount: 1000,
    min_purchase_amount: 1000,
    priority: 1,
    is_active: true,
  });

  // Reconcile Tab
  const [reconcileResult, setReconcileResult] = useState(null);
  const [reconcileScanning, setReconcileScanning] = useState(false);
  const [reconcileExecuting, setReconcileExecuting] = useState(false);

  // Feedback Notification
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    };
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/points/analytics`, getAuthHeaders());
      if (res.data?.status === 'success') {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch point analytics:', err);
    }
  };

  const fetchAccounts = async (search = '') => {
    setAccountsLoading(true);
    try {
      const url = `${import.meta.env.VITE_API_URL}/admin/points/accounts?search=${encodeURIComponent(search)}`;
      const res = await axios.get(url, getAuthHeaders());
      if (res.data?.status === 'success') {
        setAccounts(res.data.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch point accounts:', err);
    } finally {
      setAccountsLoading(false);
    }
  };

  const fetchRules = async () => {
    setRulesLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/points/rules`, getAuthHeaders());
      if (res.data?.status === 'success') {
        setRules(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch point rules:', err);
    } finally {
      setRulesLoading(false);
    }
  };

  const initData = async () => {
    setLoading(true);
    await Promise.all([fetchAnalytics(), fetchAccounts(), fetchRules()]);
    setLoading(false);
  };

  useEffect(() => {
    initData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchAnalytics(), fetchAccounts(searchPhone), fetchRules()]);
    setRefreshing(false);
    showAlert('Data analitik poin berhasil diperbarui.');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAccounts(searchPhone);
  };

  const togglePhoneReveal = (id) => {
    setRevealedPhones((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const openLedgerModal = async (account) => {
    setSelectedAccount(account);
    setShowLedgerModal(true);
    setLedgerLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/points/accounts/${account.id}`, getAuthHeaders());
      if (res.data?.status === 'success') {
        setLedgerData(res.data.transactions || []);
      }
    } catch (err) {
      showAlert('Gagal mengambil riwayat transaksi poin customer.', 'error');
    } finally {
      setLedgerLoading(false);
    }
  };

  const openAdjustModal = (phone = '') => {
    setAdjustPhone(phone);
    setAdjustType('add');
    setAdjustAmount('');
    setAdjustReason('');
    setShowAdjustModal(true);
  };

  const submitAdjustment = async (e) => {
    e.preventDefault();
    if (!adjustPhone || !adjustAmount || !adjustReason) {
      showAlert('Mohon lengkapi seluruh field penyesuaian.', 'error');
      return;
    }

    const pointsNum = parseInt(adjustAmount, 10);
    if (isNaN(pointsNum) || pointsNum <= 0) {
      showAlert('Jumlah poin harus berupa angka positif.', 'error');
      return;
    }

    const finalPoints = adjustType === 'add' ? pointsNum : -pointsNum;

    setAdjustSubmitting(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/points/adjust`,
        {
          phone: adjustPhone,
          points: finalPoints,
          description: `[Manual Admin] ${adjustReason}`,
        },
        getAuthHeaders()
      );

      if (res.data?.status === 'success') {
        showAlert(`Berhasil menyesuaikan poin untuk ${adjustPhone}: ${finalPoints > 0 ? '+' : ''}${finalPoints} poin.`);
        setShowAdjustModal(false);
        fetchAnalytics();
        fetchAccounts(searchPhone);
        if (selectedAccount && selectedAccount.phone === adjustPhone) {
          openLedgerModal(selectedAccount);
        }
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Gagal menyimpan penyesuaian poin.', 'error');
    } finally {
      setAdjustSubmitting(false);
    }
  };

  // Rule Handlers
  const openNewRuleModal = () => {
    setEditingRule(null);
    setRuleForm({
      name: '',
      description: '',
      type: 'purchase',
      calculation_type: 'per_unit',
      value: 10,
      unit_amount: 1000,
      min_purchase_amount: 1000,
      priority: rules.length + 1,
      is_active: true,
    });
    setShowRuleModal(true);
  };

  const openEditRuleModal = (rule) => {
    setEditingRule(rule);
    setRuleForm({
      name: rule.name,
      description: rule.description || '',
      type: rule.type,
      calculation_type: rule.calculation_type,
      value: rule.value,
      unit_amount: rule.unit_amount || 1000,
      min_purchase_amount: rule.min_purchase_amount || 0,
      priority: rule.priority,
      is_active: Boolean(rule.is_active),
    });
    setShowRuleModal(true);
  };

  const handleToggleRuleStatus = async (rule) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/points/rules/${rule.id}`,
        { is_active: !rule.is_active },
        getAuthHeaders()
      );
      if (res.data?.status === 'success') {
        showAlert(`Status rule "${rule.name}" berhasil diubah.`);
        fetchRules();
      }
    } catch (err) {
      showAlert('Gagal mengubah status rule.', 'error');
    }
  };

  const submitRuleForm = async (e) => {
    e.preventDefault();
    try {
      if (editingRule) {
        await axios.put(`${import.meta.env.VITE_API_URL}/admin/points/rules/${editingRule.id}`, ruleForm, getAuthHeaders());
        showAlert(`Rule "${ruleForm.name}" berhasil diperbarui.`);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/admin/points/rules`, ruleForm, getAuthHeaders());
        showAlert(`Rule baru "${ruleForm.name}" berhasil ditambahkan.`);
      }
      setShowRuleModal(false);
      fetchRules();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Gagal menyimpan aturan poin.', 'error');
    }
  };

  // Reconcile Handlers
  const handleScanReconcile = async () => {
    setReconcileScanning(true);
    setReconcileResult(null);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/admin/points/reconcile`, { dry_run: true }, getAuthHeaders());
      if (res.data?.status === 'success') {
        setReconcileResult(res.data.data);
      }
    } catch (err) {
      showAlert('Gagal memindai transaksi untuk rekonsiliasi.', 'error');
    } finally {
      setReconcileScanning(false);
    }
  };

  const handleExecuteReconcile = async () => {
    if (!window.confirm('Jalankan rekonsiliasi poin? Sistem akan memproses seluruh transaksi valid yang belum mendapatkan poin secara idempoten dan aman.')) {
      return;
    }
    setReconcileExecuting(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/admin/points/reconcile`, { dry_run: false }, getAuthHeaders());
      if (res.data?.status === 'success') {
        showAlert(`Rekonsiliasi selesai! ${res.data.data.processed_count} transaksi berhasil dikreditkan poin.`);
        setReconcileResult(res.data.data);
        fetchAnalytics();
        fetchAccounts(searchPhone);
      }
    } catch (err) {
      showAlert('Terjadi kesalahan saat mengeksekusi rekonsiliasi.', 'error');
    } finally {
      setReconcileExecuting(false);
    }
  };

  const handleToggleSystem = async () => {
    const currentState = analytics?.summary?.system_enabled ?? true;
    const newState = !currentState;
    if (!window.confirm(`Yakin ingin ${newState ? 'MENGAKTIFKAN' : 'MENONAKTIFKAN SEMENTARA'} mesin pencatat ND-Point?`)) {
      return;
    }
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/admin/points/toggle-system`, { enabled: newState }, getAuthHeaders());
      if (res.data?.status === 'success') {
        showAlert(res.data.message);
        fetchAnalytics();
      }
    } catch (err) {
      showAlert('Gagal mengubah status master sistem poin.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-admin-muted">Memuat ND-Point Engine & Analytics...</span>
      </div>
    );
  }

  const summary = analytics?.summary || {};
  const distribution = analytics?.distribution || [];
  const periodic = analytics?.periodic || {};
  const planAnalytics = analytics?.plan_analytics || [];

  return (
    <div className="space-y-6">
      {/* Alert Notification */}
      {alert && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium shadow-md transition-all ${
            alert.type === 'error'
              ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
              : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            <i className={`fas ${alert.type === 'error' ? 'fa-exclamation-triangle' : 'fa-check-circle'}`} />
            <span>{alert.message}</span>
          </div>
          <button onClick={() => setAlert(null)} className="text-admin-muted hover:text-white">
            <i className="fas fa-times" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 p-6 border border-emerald-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                🔒 INTERNAL SILENT TRACKING PHASE
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-slate-800 text-slate-300 border border-slate-700">
                DATA COLLECTION: ~1 BULAN
              </span>
              <button
                onClick={handleToggleSystem}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide cursor-pointer transition-colors ${
                  summary.system_enabled
                    ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                }`}
                title="Klik untuk ubah status aktif engine"
              >
                <i className={`fas fa-power-off mr-1.5 ${summary.system_enabled ? 'text-slate-950' : 'text-rose-400'}`} />
                ENGINE: {summary.system_enabled ? 'AKTIF' : 'NONAKTIF'}
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <i className="fas fa-coins text-emerald-400" />
              ND-Point Analytics & Engine
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Sistem pencatatan poin berjalan secara <strong>senyap (silent)</strong> dari pembelian voucher riil. Pelanggan belum mengetahui dan belum ada UI publik yang menampilkan poin sampai evaluasi data selesai.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => openAdjustModal()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <i className="fas fa-sliders-h text-emerald-400" />
              <span>Penyesuaian Manual</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <i className={`fas fa-sync-alt ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-admin-card p-4 rounded-xl border border-admin-border shadow-sm">
          <div className="flex items-center justify-between text-admin-muted text-xs font-medium mb-1.5">
            <span>Akun Pelanggan</span>
            <i className="fas fa-users text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {summary.total_accounts?.toLocaleString() || 0}
          </div>
          <span className="text-[10px] text-admin-muted">Unique nomor HP</span>
        </div>

        <div className="bg-admin-card p-4 rounded-xl border border-admin-border shadow-sm">
          <div className="flex items-center justify-between text-admin-muted text-xs font-medium mb-1.5">
            <span>Total Poin Masuk</span>
            <i className="fas fa-arrow-down-long text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">
            {summary.total_points_generated?.toLocaleString() || 0}
          </div>
          <span className="text-[10px] text-admin-muted">Lifetime earned</span>
        </div>

        <div className="bg-admin-card p-4 rounded-xl border border-admin-border shadow-sm">
          <div className="flex items-center justify-between text-admin-muted text-xs font-medium mb-1.5">
            <span>Total Poin Dipakai</span>
            <i className="fas fa-arrow-up-long text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-300">
            {summary.total_points_spent?.toLocaleString() || 0}
          </div>
          <span className="text-[10px] text-admin-muted">Fase silent (0)</span>
        </div>

        <div className="bg-admin-card p-4 rounded-xl border border-admin-border shadow-sm">
          <div className="flex items-center justify-between text-admin-muted text-xs font-medium mb-1.5">
            <span>Saldo Beredar</span>
            <i className="fas fa-wallet text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-cyan-300">
            {summary.current_total_balance?.toLocaleString() || 0}
          </div>
          <span className="text-[10px] text-admin-muted">Total poin aktif</span>
        </div>

        <div className="bg-admin-card p-4 rounded-xl border border-admin-border shadow-sm">
          <div className="flex items-center justify-between text-admin-muted text-xs font-medium mb-1.5">
            <span>Rata-Rata / Median</span>
            <i className="fas fa-chart-pie text-purple-400" />
          </div>
          <div className="text-lg sm:text-xl font-black text-white">
            {summary.avg_points_per_customer || 0} <span className="text-xs text-admin-muted font-normal">/ {summary.median_points_per_customer || 0}</span>
          </div>
          <span className="text-[10px] text-admin-muted">Poin per user</span>
        </div>

        <div className="bg-admin-card p-4 rounded-xl border border-admin-border shadow-sm">
          <div className="flex items-center justify-between text-admin-muted text-xs font-medium mb-1.5">
            <span>Saldo Tertinggi</span>
            <i className="fas fa-crown text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300">
            {summary.highest_balance?.toLocaleString() || 0}
          </div>
          <span className="text-[10px] text-admin-muted">Top balance user</span>
        </div>
      </div>

      {/* Periodic Stats & Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Periodic Earn Summary */}
        <div className="bg-admin-card p-5 rounded-2xl border border-admin-border space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-admin-border pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <i className="fas fa-history text-emerald-400" />
              Akumulasi Perolehan Poin
            </h3>
            <span className="text-[10px] text-admin-muted font-medium">Real-time</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-admin-base/70 p-3 rounded-xl border border-admin-border">
              <span className="text-[11px] text-admin-muted block">Hari Ini</span>
              <span className="text-base font-bold text-emerald-300">{periodic.today_earned?.toLocaleString() || 0}</span>
            </div>
            <div className="bg-admin-base/70 p-3 rounded-xl border border-admin-border">
              <span className="text-[11px] text-admin-muted block">7 Hari</span>
              <span className="text-base font-bold text-emerald-300">{periodic.week_earned?.toLocaleString() || 0}</span>
            </div>
            <div className="bg-admin-base/70 p-3 rounded-xl border border-admin-border">
              <span className="text-[11px] text-admin-muted block">Bulan Ini</span>
              <span className="text-base font-bold text-emerald-300">{periodic.month_earned?.toLocaleString() || 0}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-admin-muted flex items-center justify-between">
            <span>Pelanggan Pernah Dapat Poin:</span>
            <strong className="text-white font-bold">{periodic.active_earners_count || 0} orang</strong>
          </div>
        </div>

        {/* Point Distribution Bars */}
        <div className="lg:col-span-2 bg-admin-card p-5 rounded-2xl border border-admin-border space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-admin-border pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <i className="fas fa-chart-bar text-cyan-400" />
              Distribusi Saldo Poin Pelanggan
            </h3>
            <span className="text-[10px] text-admin-muted font-medium">Segmentasi Akun</span>
          </div>

          <div className="space-y-2.5">
            {distribution.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{item.range}</span>
                  <span className="text-slate-400">
                    <strong className="text-white">{item.count} akun</strong> ({item.pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 to-teal-400"
                    style={{ width: `${Math.min(item.pct, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-admin-border pb-3">
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'customers'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-admin-card text-admin-muted hover:text-white border border-admin-border'
          }`}
        >
          <i className="fas fa-users" />
          <span>Daftar Akun & Buku Poin</span>
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'plans'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-admin-card text-admin-muted hover:text-white border border-admin-border'
          }`}
        >
          <i className="fas fa-ticket-alt" />
          <span>Analisis Paket Voucher</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'rules'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-admin-card text-admin-muted hover:text-white border border-admin-border'
          }`}
        >
          <i className="fas fa-cogs" />
          <span>Aturan Poin ({rules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reconcile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'reconcile'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-admin-card text-admin-muted hover:text-white border border-admin-border'
          }`}
        >
          <i className="fas fa-sync-alt" />
          <span>Alat Rekonsiliasi</span>
        </button>
      </div>

      {/* TAB 1: Customers & Point Ledgers */}
      {activeTab === 'customers' && (
        <div className="bg-admin-card rounded-2xl border border-admin-border overflow-hidden shadow-sm space-y-4 p-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
              <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-muted text-xs" />
              <input
                type="text"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                placeholder="Cari nomor WhatsApp customer..."
                className="w-full pl-9 pr-20 py-2 bg-admin-base border border-admin-border rounded-xl text-xs text-white placeholder-admin-muted focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
              >
                Cari
              </button>
            </form>

            <span className="text-xs text-admin-muted">
              Menampilkan <strong>{accounts.length}</strong> akun customer
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-admin-border text-admin-muted font-bold uppercase tracking-wider text-[10px] bg-admin-base/50">
                  <th className="p-3">Customer</th>
                  <th className="p-3 text-right">Saldo Poin</th>
                  <th className="p-3 text-right">Lifetime Masuk</th>
                  <th className="p-3 text-right">Lifetime Dipakai</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border/50">
                {accountsLoading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-admin-muted">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Memuat akun poin...
                    </td>
                  </tr>
                ) : accounts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-admin-muted">
                      Belum ada akun poin yang terdaftar. Poin akan otomatis tercatat begitu ada transaksi voucher sukses.
                    </td>
                  </tr>
                ) : (
                  accounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-admin-base/40 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                            <i className="fas fa-user" />
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{revealedPhones[acc.id] ? acc.phone : acc.masked_phone}</span>
                              <button
                                type="button"
                                onClick={() => togglePhoneReveal(acc.id)}
                                className="text-admin-muted hover:text-white transition-colors cursor-pointer text-[10px]"
                                title={revealedPhones[acc.id] ? 'Sembunyikan' : 'Tampilkan nomor utuh'}
                              >
                                <i className={`fas ${revealedPhones[acc.id] ? 'fa-eye-slash' : 'fa-eye'}`} />
                              </button>
                            </div>
                            <span className="text-[10px] text-admin-muted">ID #{acc.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right font-black text-emerald-400 text-sm">
                        {acc.balance?.toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-slate-300 font-semibold">
                        {acc.lifetime_earned?.toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-slate-400 font-medium">
                        {acc.lifetime_spent?.toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {acc.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openLedgerModal(acc)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[11px] transition-colors cursor-pointer"
                            title="Buka buku besar transaksi poin customer"
                          >
                            <i className="fas fa-book-open mr-1" />
                            Buku Besar
                          </button>
                          <button
                            type="button"
                            onClick={() => openAdjustModal(acc.phone)}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors cursor-pointer"
                            title="Sesuaikan poin manual"
                          >
                            <i className="fas fa-plus-minus" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Voucher Plan Breakdown */}
      {activeTab === 'plans' && (
        <div className="bg-admin-card rounded-2xl border border-admin-border p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <i className="fas fa-ticket-alt text-emerald-400" />
              Kontribusi Poin Berdasarkan Paket Voucher
            </h3>
            <p className="text-admin-muted text-xs mt-0.5">
              Analisis perolehan poin per varian paket voucher untuk menilai kelayakan rasio reward di masa depan.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-admin-border text-admin-muted font-bold uppercase tracking-wider text-[10px] bg-admin-base/50">
                  <th className="p-3">Nama Paket</th>
                  <th className="p-3 text-right">Total Transaksi</th>
                  <th className="p-3 text-right">Total Omset</th>
                  <th className="p-3 text-right">Total Poin Dihasilkan</th>
                  <th className="p-3 text-right">Rata-Rata Poin / Transaksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border/50">
                {planAnalytics.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-admin-muted">
                      Belum ada data transaksi voucher yang tercatat.
                    </td>
                  </tr>
                ) : (
                  planAnalytics.map((plan) => (
                    <tr key={plan.plan_id} className="hover:bg-admin-base/40 transition-colors">
                      <td className="p-3 font-bold text-white">
                        <i className="fas fa-wifi text-emerald-400 mr-2" />
                        {plan.plan_name}
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-300">
                        {plan.total_sales?.toLocaleString()} trx
                      </td>
                      <td className="p-3 text-right font-semibold text-emerald-300">
                        Rp {plan.total_revenue?.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-right font-black text-cyan-300">
                        {plan.points_generated?.toLocaleString()} pts
                      </td>
                      <td className="p-3 text-right text-admin-muted font-medium">
                        {plan.total_sales > 0 ? Math.round(plan.points_generated / plan.total_sales) : 0} pts/trx
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Point Rules */}
      {activeTab === 'rules' && (
        <div className="bg-admin-card rounded-2xl border border-admin-border p-5 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <i className="fas fa-cogs text-emerald-400" />
                Daftar Aturan Perhitungan Poin (Configurable Point Rules)
              </h3>
              <p className="text-admin-muted text-xs mt-0.5">
                Nilai dan rasio poin bersifat dinamis dari database tanpa hardcode kode program.
              </p>
            </div>
            <button
              onClick={openNewRuleModal}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <i className="fas fa-plus" />
              <span>Tambah Rule Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-admin-border text-admin-muted font-bold uppercase tracking-wider text-[10px] bg-admin-base/50">
                  <th className="p-3">Nama Aturan</th>
                  <th className="p-3">Tipe & Metode</th>
                  <th className="p-3 text-center">Nilai Poin</th>
                  <th className="p-3 text-center">Syarat Min Belanja</th>
                  <th className="p-3 text-center">Prioritas</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border/50">
                {rulesLoading ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-admin-muted">
                      Memuat aturan poin...
                    </td>
                  </tr>
                ) : rules.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-admin-muted">
                      Belum ada aturan poin aktif. Tambahkan aturan baru agar mesin dapat menghitung poin.
                    </td>
                  </tr>
                ) : (
                  rules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-admin-base/40 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-white">{rule.name}</div>
                        <div className="text-[11px] text-admin-muted max-w-sm">{rule.description || '-'}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 mr-1.5 uppercase">
                          {rule.type}
                        </span>
                        <span className="text-slate-300 font-medium">
                          {rule.calculation_type === 'per_unit' && `Kelipatan Rp ${Number(rule.unit_amount || 1000).toLocaleString('id-ID')}`}
                          {rule.calculation_type === 'fixed_bonus' && 'Bonus Flat'}
                          {rule.calculation_type === 'percentage' && 'Persentase Nilai'}
                          {rule.calculation_type === 'multiplier' && 'Pengali (Multiplier)'}
                        </span>
                      </td>
                      <td className="p-3 text-center font-black text-emerald-400 text-sm">
                        {rule.value} {rule.calculation_type === 'multiplier' ? 'x' : 'pts'}
                      </td>
                      <td className="p-3 text-center text-slate-300 font-semibold">
                        {rule.min_purchase_amount ? `Rp ${Number(rule.min_purchase_amount).toLocaleString('id-ID')}` : 'Tanpa Min.'}
                      </td>
                      <td className="p-3 text-center text-slate-400 font-bold">
                        #{rule.priority}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleRuleStatus(rule)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                            rule.is_active
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                          }`}
                        >
                          {rule.is_active ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => openEditRuleModal(rule)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer mr-1"
                        >
                          <i className="fas fa-edit" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Reconciliation Tool */}
      {activeTab === 'reconcile' && (
        <div className="bg-admin-card rounded-2xl border border-admin-border p-5 space-y-5 shadow-sm">
          <div className="max-w-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <i className="fas fa-shield-alt text-emerald-400" />
              Alat Audit & Rekonsiliasi Transaksi Riil
            </h3>
            <p className="text-admin-muted text-xs mt-1 leading-relaxed">
              Jika terjadi keterlambatan atau gangguan webhook pada saat transaksi sukses berlangsung, fitur ini memungkinkan admin memindai seluruh transaksi riil yang valid dan mengkreditkan poin yang tertinggal.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <i className="fas fa-check-circle text-emerald-400" />
              Prinsip Keamanan Rekonsiliasi:
            </div>
            <ul className="list-disc list-inside space-y-1 text-admin-muted text-[11px]">
              <li><strong>100% Idempoten:</strong> Transaksi yang sudah pernah menerima poin tidak akan pernah digandakan (dilindungi database unique constraint).</li>
              <li><strong>Hanya Data Riil:</strong> Hanya memproses transaksi berstatus `success` dengan format `ND-%`. Tidak membuat transaksi palsu.</li>
              <li><strong>Aman & Tidak Merusak:</strong> Tidak mengubah struktur atau data transaksi riil.</li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleScanReconcile}
              disabled={reconcileScanning || reconcileExecuting}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer border border-slate-700 shadow-sm"
            >
              <i className={`fas fa-search ${reconcileScanning ? 'animate-spin' : ''}`} />
              <span>{reconcileScanning ? 'Memindai Database...' : 'Pindai Transaksi Tertinggal (Dry Run)'}</span>
            </button>

            {reconcileResult && reconcileResult.missing_count > 0 && (
              <button
                type="button"
                onClick={handleExecuteReconcile}
                disabled={reconcileExecuting}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <i className={`fas fa-play ${reconcileExecuting ? 'animate-spin' : ''}`} />
                <span>{reconcileExecuting ? 'Memproses Poin...' : `Kreditkan ${reconcileResult.missing_count} Transaksi Sekarang`}</span>
              </button>
            )}
          </div>

          {/* Scan Results Card */}
          {reconcileResult && (
            <div className="p-5 rounded-xl bg-admin-base/80 border border-admin-border space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <i className="fas fa-clipboard-list text-cyan-400" />
                Hasil Pemindaian Transaksi
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-admin-muted text-[10px] block">Total Dipindai</span>
                  <strong className="text-white text-base">{reconcileResult.total_scanned} trx</strong>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-admin-muted text-[10px] block">Sudah Dapat Poin</span>
                  <strong className="text-emerald-400 text-base">{reconcileResult.already_credited} trx</strong>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-admin-muted text-[10px] block">Tertinggal (Belum Ada)</span>
                  <strong className="text-amber-400 text-base">{reconcileResult.missing_count} trx</strong>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-admin-muted text-[10px] block">Estimasi Poin</span>
                  <strong className="text-cyan-400 text-base">{reconcileResult.total_points_to_award?.toLocaleString()} pts</strong>
                </div>
              </div>

              {reconcileResult.missing_count === 0 && (
                <div className="text-xs text-emerald-400 font-semibold flex items-center gap-2 pt-1">
                  <i className="fas fa-check-circle" />
                  Seluruh transaksi riil yang valid sudah tercatat lengkap di buku besar poin!
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Customer Ledger History */}
      {showLedgerModal && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-admin-card rounded-2xl max-w-3xl w-full border border-admin-border flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-admin-border bg-admin-base/50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">Buku Besar Poin (Ledger)</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    {selectedAccount.phone}
                  </span>
                </div>
                <p className="text-admin-muted text-xs mt-0.5">
                  Saldo Saat Ini: <strong className="text-emerald-400 font-bold">{selectedAccount.balance?.toLocaleString()} Poin</strong>
                </p>
              </div>
              <button
                onClick={() => setShowLedgerModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="fas fa-times text-xs" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {ledgerLoading ? (
                <div className="p-8 text-center text-admin-muted">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Memuat buku besar customer...
                </div>
              ) : ledgerData.length === 0 ? (
                <div className="p-8 text-center text-admin-muted text-xs">
                  Belum ada pergerakan poin pada akun ini.
                </div>
              ) : (
                <div className="space-y-2">
                  {ledgerData.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-admin-base/60 border border-admin-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              item.type === 'earn'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : item.type === 'adjustment'
                                ? 'bg-purple-500/20 text-purple-300'
                                : item.type === 'spend'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {item.type}
                          </span>
                          <span className="font-bold text-white">{item.description}</span>
                        </div>
                        <div className="text-[11px] text-admin-muted mt-1 flex flex-wrap items-center gap-3">
                          <span>
                            <i className="fas fa-clock mr-1" />
                            {new Date(item.created_at).toLocaleString('id-ID')}
                          </span>
                          {item.metadata?.external_id && (
                            <span>
                              <i className="fas fa-receipt mr-1" />
                              Ref: {item.metadata.external_id}
                            </span>
                          )}
                          <span>
                            Saldo: {item.balance_before} &rarr;{' '}
                            <strong className="text-white">{item.balance_after}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span
                          className={`text-base font-black ${
                            item.points >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {item.points >= 0 ? `+${item.points}` : item.points} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-admin-border bg-admin-base/40 flex justify-end">
              <button
                type="button"
                onClick={() => setShowLedgerModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Manual Adjustment */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-admin-card rounded-2xl max-w-md w-full border border-admin-border shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-admin-border bg-admin-base/50 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <i className="fas fa-sliders-h text-emerald-400" />
                Penyesuaian Poin Manual (Admin)
              </h3>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="fas fa-times text-xs" />
              </button>
            </div>

            <form onSubmit={submitAdjustment} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-admin-muted font-bold mb-1">Nomor WhatsApp Customer</label>
                <input
                  type="text"
                  value={adjustPhone}
                  onChange={(e) => setAdjustPhone(e.target.value)}
                  placeholder="Contoh: 08123456789 atau 628123456789"
                  className="w-full p-2.5 bg-admin-base border border-admin-border rounded-xl text-white placeholder-admin-muted focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('add')}
                  className={`py-2 rounded-xl font-bold transition-colors cursor-pointer border ${
                    adjustType === 'add'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <i className="fas fa-plus mr-1" /> Tambah Poin (+)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('deduct')}
                  className={`py-2 rounded-xl font-bold transition-colors cursor-pointer border ${
                    adjustType === 'deduct'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <i className="fas fa-minus mr-1" /> Potong Poin (-)
                </button>
              </div>

              <div>
                <label className="block text-admin-muted font-bold mb-1">Jumlah Poin</label>
                <input
                  type="number"
                  min="1"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="Contoh: 50"
                  className="w-full p-2.5 bg-admin-base border border-admin-border rounded-xl text-white placeholder-admin-muted focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-admin-muted font-bold mb-1">Alasan / Catatan Penyesuaian</label>
                <textarea
                  rows="2"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Contoh: Kompensasi gangguan jaringan atau penyesuaian promo"
                  className="w-full p-2.5 bg-admin-base border border-admin-border rounded-xl text-white placeholder-admin-muted focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={adjustSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold cursor-pointer"
                >
                  {adjustSubmitting ? 'Menyimpan...' : 'Simpan Penyesuaian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Rule Form (Add / Edit) */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-admin-card rounded-2xl max-w-lg w-full border border-admin-border shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-admin-border bg-admin-base/50 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <i className="fas fa-cog text-emerald-400" />
                {editingRule ? 'Edit Aturan Poin' : 'Tambah Aturan Poin Baru'}
              </h3>
              <button
                onClick={() => setShowRuleModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="fas fa-times text-xs" />
              </button>
            </div>

            <form onSubmit={submitRuleForm} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-admin-muted font-bold mb-1">Nama Aturan</label>
                <input
                  type="text"
                  value={ruleForm.name}
                  onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                  placeholder="Contoh: Pembelian Reguler (Rp 1.000 = 10 Poin)"
                  className="w-full p-2.5 bg-admin-base border border-admin-border rounded-xl text-white placeholder-admin-muted focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-admin-muted font-bold mb-1">Deskripsi Singkat</label>
                <input
                  type="text"
                  value={ruleForm.description}
                  onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                  placeholder="Penjelasan aturan untuk internal admin"
                  className="w-full p-2.5 bg-admin-base border border-admin-border rounded-xl text-white placeholder-admin-muted focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-admin-muted font-bold mb-1">Metode Kalkulasi</label>
                  <select
                    value={ruleForm.calculation_type}
                    onChange={(e) => setRuleForm({ ...ruleForm, calculation_type: e.target.value })}
                    className="w-full p-2.5 bg-admin-base border border-admin-border rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="per_unit">Kelipatan Nominal (per Unit)</option>
                    <option value="fixed_bonus">Bonus Flat</option>
                    <option value="percentage">Persentase (%)</option>
                    <option value="multiplier">Pengali (Multiplier)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-admin-muted font-bold mb-1">Nilai Poin (Value)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={ruleForm.value}
                    onChange={(e) => setRuleForm({ ...ruleForm, value: parseFloat(e.target.value) })}
                    className="w-full p-2.5 bg-admin-base border border-admin-border rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {ruleForm.calculation_type === 'per_unit' && (
                <div>
                  <label className="block text-admin-muted font-bold mb-1">Setiap Kelipatan Belanja (Rp)</label>
                  <input
                    type="number"
                    min="1"
                    value={ruleForm.unit_amount}
                    onChange={(e) => setRuleForm({ ...ruleForm, unit_amount: parseFloat(e.target.value) })}
                    placeholder="Contoh: 1000"
                    className="w-full p-2.5 bg-admin-base border border-admin-border rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <span className="text-[10px] text-admin-muted">
                    Contoh: Belanja Rp 5.000 dengan kelipatan Rp 1.000 bernilai {ruleForm.value} pts &rarr; 5 x {ruleForm.value} = {5 * ruleForm.value} poin.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-admin-muted font-bold mb-1">Minimal Pembelian (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={ruleForm.min_purchase_amount}
                    onChange={(e) => setRuleForm({ ...ruleForm, min_purchase_amount: parseFloat(e.target.value) })}
                    className="w-full p-2.5 bg-admin-base border border-admin-border rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-admin-muted font-bold mb-1">Prioritas Urutan</label>
                  <input
                    type="number"
                    min="1"
                    value={ruleForm.priority}
                    onChange={(e) => setRuleForm({ ...ruleForm, priority: parseInt(e.target.value, 10) })}
                    className="w-full p-2.5 bg-admin-base border border-admin-border rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ruleActiveCheck"
                  checked={ruleForm.is_active}
                  onChange={(e) => setRuleForm({ ...ruleForm, is_active: e.target.checked })}
                  className="rounded text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="ruleActiveCheck" className="text-white font-semibold cursor-pointer">
                  Aturan Aktif (Diterapkan saat transaksi sukses)
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold cursor-pointer"
                >
                  Simpan Aturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
