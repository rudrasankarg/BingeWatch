import { useState } from 'react'
import axios from 'axios'

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/>
  </svg>
)

export default function EditChannelModal({ user, onClose, onSaveSuccess }) {
  const [fullName, setFullName] = useState(user.fullName || '')
  const [avatarFile, setAvatarFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const initials = (user.fullName || user.username || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // 1. Update Display Name
      if (fullName !== user.fullName) {
        await axios.patch('/api/v1/users/update-account', {
          fullName: fullName,
          email: user.email
        }, { withCredentials: true })
      }

      // 2. Update Avatar
      if (avatarFile) {
        const formData = new FormData()
        formData.append('avatar', avatarFile)
        await axios.patch('/api/v1/users/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        })
      }

      // 3. Update Cover Banner
      if (coverFile) {
        const formData = new FormData()
        formData.append('coverImage', coverFile)
        await axios.patch('/api/v1/users/cover-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        })
      }

      // 4. Fetch updated user details
      const userRes = await axios.get('/api/v1/users/current-user', { withCredentials: true })
      if (userRes.data?.data) {
        onSaveSuccess(userRes.data.data)
      }
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to update channel details')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-overlay" onClick={onClose} aria-modal="true" role="dialog" aria-label="Edit Channel">
      <div className="auth-modal" style={{ position: 'relative', maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close" style={{ position: 'absolute', right: '16px', top: '16px', border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <CloseIcon />
        </button>

        <div className="auth-modal-header" style={{ paddingBottom: '10px' }}>
          <div className="auth-modal-title">Customize Channel</div>
          <div className="auth-modal-sub">Update display name, avatar, and banner banner</div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} style={{ paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Banner Selector */}
          <div className="form-group">
            <label className="form-label">Channel Cover Banner</label>
            <div style={{ position: 'relative', height: '110px', background: '#1e293b', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
              {coverFile ? (
                <img src={URL.createObjectURL(coverFile)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="New banner preview" />
              ) : user.coverImage ? (
                <img src={user.coverImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Current banner" />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', fontSize: '12px' }}>No Banner Uploaded</div>
              )}
              <label htmlFor="modal-cover-input" style={{ position: 'absolute', right: '8px', bottom: '8px', background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', color: '#fff', cursor: 'pointer', fontWeight: '500' }}>
                Change Banner
              </label>
              <input id="modal-cover-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setCoverFile(e.target.files[0])} />
            </div>
          </div>

          {/* Avatar Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', background: user.avatarColor || '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-surface)' }}>
              {avatarFile ? (
                <img src={URL.createObjectURL(avatarFile)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="New avatar preview" />
              ) : user.avatar ? (
                <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Current avatar" />
              ) : (
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>{initials}</span>
              )}
              <label htmlFor="modal-avatar-input" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </label>
              <input id="modal-avatar-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setAvatarFile(e.target.files[0])} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>Channel Avatar</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Hover & click to upload file</div>
            </div>
          </div>

          {/* Full Name Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="modal-edit-name">Display Name</label>
            <input
              id="modal-edit-name"
              type="text"
              className="form-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          {error && <div className="form-error" role="alert">{error}</div>}

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button type="button" className="submit-btn" style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }} onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
