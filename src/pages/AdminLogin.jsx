import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AdminLogin = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [verifyingSession, setVerifyingSession] = useState(true)
  const [error, setError] = useState('')
  const [remainingAttempts, setRemainingAttempts] = useState(null)
  const [lockoutSeconds, setLockoutSeconds] = useState(0)
  const navigate = useNavigate()

  // 1. Initial Mount: Check theme & Auto-verify existing token session
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'dark'
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Pre-fill remembered username
    const savedUser = localStorage.getItem('admin_remember_user')
    if (savedUser) {
      setUsername(savedUser)
    }

    // Auto-login if token already present
    const existingToken = localStorage.getItem('token')
    if (!existingToken) {
      setVerifyingSession(false)
      return
    }

    const verifyActiveSession = async () => {
      try {
        const apiUrl = `${import.meta.env.VITE_API_URL}/user`
        const res = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${existingToken}`,
            'Accept': 'application/json'
          }
        })

        if (res.ok) {
          // Token is completely valid! Instantly jump into dashboard
          navigate('/admin-dashboard-access-granted', { replace: true })
          return
        } else {
          // Token expired or invalid
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      } catch (err) {
        // Network/offline fallback - allow manual sign in
      } finally {
        setVerifyingSession(false)
      }
    }

    verifyActiveSession()
  }, [navigate])

  // 2. Lockout Countdown Timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return

    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setError('')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [lockoutSeconds])

  // 3. Handle Form Submission
  const handleLogin = async (e) => {
    e.preventDefault()
    if (lockoutSeconds > 0) return

    setLoading(true)
    setError('')

    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}/login`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          username: username.trim(), 
          password, 
          remember_me: rememberMe 
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Store session token & details
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))

        // Handle remember username preference
        if (rememberMe) {
          localStorage.setItem('admin_remember_user', username.trim())
        } else {
          localStorage.removeItem('admin_remember_user')
        }

        navigate('/admin-dashboard-access-granted', { replace: true })
      } else if (response.status === 429) {
        // Rate limited / Brute-force locked
        const retryAfter = data.retry_after || 60
        setLockoutSeconds(retryAfter)
        setError(data.message || `Terlalu banyak percobaan. Akses dikunci sementara selama ${retryAfter} detik.`)
      } else {
        // Credential error with remaining attempts
        if (typeof data.remaining_attempts !== 'undefined') {
          setRemainingAttempts(data.remaining_attempts)
        }
        setError(data.message || 'Kredensial yang dimasukkan tidak cocok.')
      }
    } catch (err) {
      setError('Koneksi ke backend gagal. Pastikan jaringan atau server backend aktif.')
    } finally {
      setLoading(false)
    }
  }

  // Loading screen while verifying active session
  if (verifyingSession) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center p-6 text-slate-200">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
          <svg className="w-7 h-7 text-amber-500 absolute" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p className="text-sm font-semibold tracking-wide text-slate-400 animate-pulse">
          Memverifikasi Sesi Akses...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-6 relative font-sans text-slate-100">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-amber-500/10 to-indigo-600/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-amber-600/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10">
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
          <p className="text-slate-400 text-sm mt-1">ND-Hotspot Management & Security Core</p>
        </div>

        {/* Card */}
        <div className="bg-[#121826]/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-7 sm:p-8 shadow-2xl shadow-black/50">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Error / Lockout Alert */}
            {error && (
              <div className={`p-3.5 rounded-xl text-sm flex items-start gap-3 border ${
                lockoutSeconds > 0 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="font-semibold">{error}</p>
                  {remainingAttempts !== null && remainingAttempts > 0 && lockoutSeconds === 0 && (
                    <p className="text-xs mt-1 text-slate-300">
                      Tersisa {remainingAttempts}x percobaan sebelum akun dikunci sementara.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  disabled={loading || lockoutSeconds > 0}
                  className="w-full bg-[#1b2234] border border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 px-4 py-2.5 rounded-xl text-white outline-none transition-all placeholder:text-slate-500 text-sm disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Password Input with Visibility Toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading || lockoutSeconds > 0}
                  className="w-full bg-[#1b2234] border border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 pl-4 pr-11 py-2.5 rounded-xl text-white outline-none transition-all placeholder:text-slate-500 text-sm disabled:opacity-50"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-[#1b2234] text-amber-500 focus:ring-amber-500/20 focus:ring-offset-0 transition-colors cursor-pointer accent-amber-500"
                />
                <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
                  Ingat Saya (Sesi Tetap Aktif 30 Hari)
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || lockoutSeconds > 0}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg mt-2 ${
                lockoutSeconds > 0
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/20 active:scale-[0.98]'
              } disabled:opacity-60`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Mengautentikasi...</span>
                </>
              ) : lockoutSeconds > 0 ? (
                <span>Terkunci ({lockoutSeconds}s)</span>
              ) : (
                <span>Masuk ke Dashboard</span>
              )}
            </button>
          </form>
        </div>

        {/* Security Footer Badge */}
        <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Dilindungi Rate Limiter & Anti-Brute Force Protection</span>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin