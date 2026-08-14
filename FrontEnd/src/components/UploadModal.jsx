import { useState } from 'react'
import axios from 'axios'

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

export default function UploadModal({ user, onClose, onUploadSuccess }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Gaming')
  const [videoFile, setVideoFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = ['Gaming', 'Music', 'Tech', 'Science', 'Sports', 'Comedy', 'News', 'Education', 'Film', 'Other']

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (!videoFile) {
      setError('Please select a video file')
      return
    }
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('description', description.trim())
      formData.append('category', category)
      formData.append('channel', user.fullName || user.username)
      formData.append('channelHandle', `@${user.username}`)
      formData.append('channelAvatarColor', user.avatarColor || '#6366f1')
      formData.append('owner', user.username || user.email)
      formData.append('videoFile', videoFile)

      const res = await axios.post('/api/videos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (res.data) {
        onUploadSuccess(res.data)
        onClose()
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload video')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-overlay" onClick={onClose} aria-modal="true" role="dialog" aria-label="Upload Video">
      <div className="auth-modal" style={{ position: 'relative', maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close" style={{ position: 'absolute', right: '16px', top: '16px', border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <CloseIcon />
        </button>

        {/* Header */}
        <div className="auth-modal-header" style={{ paddingBottom: '10px' }}>
          <div className="auth-modal-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </div>
          <div className="auth-modal-title">Share a Video</div>
          <div className="auth-modal-sub">Upload a new video to BingeWatch</div>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} style={{ paddingTop: '10px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="upload-title">Video Title</label>
            <input
              id="upload-title"
              type="text"
              className={`form-input ${error && !title ? 'error' : ''}`}
              placeholder="e.g. My First Gaming Montage"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="upload-file">Select Video File</label>
            <input
              id="upload-file"
              type="file"
              accept="video/*"
              className="form-input"
              onChange={(e) => setVideoFile(e.target.files[0])}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="upload-category">Category</label>
            <select
              id="upload-category"
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ background: 'var(--bg-input)', cursor: 'pointer' }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} style={{ background: 'var(--bg-surface)' }}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="upload-desc">Description</label>
            <textarea
              id="upload-desc"
              className="form-input"
              placeholder="Tell viewers about your video"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'none', fontFamily: 'inherit' }}
            />
          </div>

          {error && <div className="form-error" role="alert">{error}</div>}

          <button
            id="upload-submit-btn"
            type="submit"
            className={`submit-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
            style={{ marginTop: '10px' }}
          >
            {loading ? 'Publishing...' : 'Publish Video'}
          </button>
        </form>
      </div>
    </div>
  )
}
