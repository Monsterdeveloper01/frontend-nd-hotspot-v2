import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AdminLogin = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}/login`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate('/admin-dashboard-access-granted')
      } else {
        setError(data.message || 'Authentication failed. Please verify your credentials.')
      }
    } catch (err) {
      setError('System unreachable. Verify network connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-admin-base flex items-center justify-center p-6 relative font-sans text-admin-text">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-admin-base rounded-xl flex items-center justify-center mx-auto mb-5 border border-admin-border text-admin-text">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-admin-text tracking-tight">Admin Portal</h1>
          <p className="text-admin-muted text-sm mt-1">ND-Hotspot Management System</p>
        </div>

        <div className="bg-admin-card border border-admin-border rounded-xl p-8 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm flex items-start gap-3">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-admin-muted">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-admin-card border border-admin-border focus:border-admin-accent focus:ring-1 focus:ring-admin-accent px-4 py-2.5 rounded-lg text-admin-text outline-none transition-all placeholder:text-admin-muted text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-admin-muted">Password</label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-admin-card border border-admin-border focus:border-admin-accent focus:ring-1 focus:ring-admin-accent px-4 py-2.5 rounded-lg text-admin-text outline-none transition-all placeholder:text-admin-muted text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-admin-accent hover:bg-admin-accent/90 text-admin-text rounded-lg font-medium text-sm transition-colors disabled:opacity-70 mt-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-admin-text" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-admin-muted">Secure Access Only</p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
