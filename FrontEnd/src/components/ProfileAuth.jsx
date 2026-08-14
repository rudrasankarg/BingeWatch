import { useState } from 'react'
import axios from 'axios'

// ─── Icons ────────────────────────────────────────────────────────────────────
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const HistoryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>
  </svg>
)
const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
  </svg>
)
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
  </svg>
)
const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/>
  </svg>
)

// ─── Profile Panel (shown when logged in) ────────────────────────────────────
function ProfilePanel({ user, onClose, onLogout }) {
  const initials = (user.fullName || user.username || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const handleLogout = async () => {
    try {
      await axios.post('/api/v1/users/logout', {}, { withCredentials: true })
    } catch (e) { /* ignore */ }
    onLogout()
    onClose()
  }

  return (
    <div className="panel-overlay" onClick={onClose} aria-modal="true" role="dialog">
      <div className="profile-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="profile-header">
          <div className="profile-big-avatar">{initials}</div>
          <div className="profile-name">{user.fullName || user.username}</div>
          <div className="profile-email">{user.email}</div>
        </div>

        {/* Actions */}
        <div className="profile-actions">
          <button id="profile-view-btn" className="profile-action-btn" aria-label="View your channel">
            <UserIcon /> Your Channel
          </button>
          <button id="profile-history-btn" className="profile-action-btn" aria-label="Watch history">
            <HistoryIcon /> Watch History
          </button>
          <button id="profile-settings-btn" className="profile-action-btn" aria-label="Settings">
            <SettingsIcon /> Settings
          </button>
          <div className="profile-divider" />
          <button
            id="logout-btn"
            className="profile-action-btn danger"
            onClick={handleLogout}
            aria-label="Log out"
          >
            <LogoutIcon /> Log Out
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Auth Modal (shown when NOT logged in) ───────────────────────────────────
function AuthModal({ onClose, onLoginSuccess }) {
  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Login state
  const [loginForm, setLoginForm] = useState({ emailOrUsername: '', password: '' })

  // Register state
  const [regForm, setRegForm] = useState({
    fullName: '', username: '', email: '', password: '',
  })

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const isEmail = loginForm.emailOrUsername.includes('@')
      const payload = {
        [isEmail ? 'email' : 'username']: loginForm.emailOrUsername,
        password: loginForm.password,
      }
      const res = await axios.post('/api/v1/users/login', payload, { withCredentials: true })
      onLoginSuccess(res.data?.data?.user || res.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const formData = new FormData()
      Object.entries(regForm).forEach(([k, v]) => formData.append(k, v))
      // Avatar is required by backend — use a placeholder blob
      const blob = new Blob([''], { type: 'image/png' })
      formData.append('avatar', blob, 'avatar.png')

      const res = await axios.post('/api/v1/users/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      })
      // Auto-login after register
      const loginRes = await axios.post('/api/v1/users/login', {
        username: regForm.username, password: regForm.password,
      }, { withCredentials: true })
      onLoginSuccess(loginRes.data?.data?.user || loginRes.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-overlay" onClick={onClose} aria-modal="true" role="dialog" aria-label="Sign in to BingeWatch">
      <div className="auth-modal" style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close"><CloseIcon /></button>

        {/* Header */}
        <div className="auth-modal-header">
          <div className="auth-modal-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </div>
          <div className="auth-modal-title">BingeWatch</div>
          <div className="auth-modal-sub">
            {tab === 'login' ? 'Welcome back — sign in to continue' : 'Create your account'}
          </div>
        </div>

        {/* Tabs */}
        <div className="auth-tabs" role="tablist">
          <button
            id="auth-tab-login"
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError('') }}
            role="tab" aria-selected={tab === 'login'}
          >
            Sign In
          </button>
          <button
            id="auth-tab-register"
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => { setTab('register'); setError('') }}
            role="tab" aria-selected={tab === 'register'}
          >
            Register
          </button>
        </div>

        {/* Login Form */}
        {tab === 'login' && (
          <form id="login-form" className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email or Username</label>
              <input
                id="login-email"
                type="text"
                className={`form-input ${error ? 'error' : ''}`}
                placeholder="you@example.com or @username"
                value={loginForm.emailOrUsername}
                onChange={(e) => setLoginForm({ ...loginForm, emailOrUsername: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                className={`form-input ${error ? 'error' : ''}`}
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
            </div>
            {error && <div className="form-error" role="alert">{error}</div>}
            <button
              id="login-submit-btn"
              type="submit"
              className={`submit-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form id="register-form" className="auth-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-fullname">Full Name</label>
              <input id="reg-fullname" type="text" className="form-input" placeholder="John Doe"
                value={regForm.fullName} onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-username">Username</label>
              <input id="reg-username" type="text" className="form-input" placeholder="johndoe"
                value={regForm.username} onChange={(e) => setRegForm({ ...regForm, username: e.target.value.toLowerCase().replace(/\s/g, '') })} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <input id="reg-email" type="email" className="form-input" placeholder="you@example.com"
                value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input id="reg-password" type="password" className="form-input" placeholder="Min 6 characters"
                value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} required minLength={6} />
            </div>
            {error && <div className="form-error" role="alert">{error}</div>}
            <button
              id="register-submit-btn"
              type="submit"
              className={`submit-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function ProfileAuth({ user, onClose, onLoginSuccess, onLogout }) {
  if (user) {
    return <ProfilePanel user={user} onClose={onClose} onLogout={onLogout} />
  }
  return <AuthModal onClose={onClose} onLoginSuccess={onLoginSuccess} />
}
