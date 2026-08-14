import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import Navbar from './components/Navbar.jsx'
import Sidebar from './components/Sidebar.jsx'
import VideoGrid from './components/VideoGrid.jsx'
import VideoPlayer from './components/VideoPlayer.jsx'
import SearchResults from './components/SearchResults.jsx'
import ProfileAuth from './components/ProfileAuth.jsx'
import UploadModal from './components/UploadModal.jsx'

export default function App() {
  // ─── Theme ──────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('bw-theme') || 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('bw-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  // ─── Auth ───────────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null)
  const [showProfileAuth, setShowProfileAuth] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Try to restore session on mount
  useEffect(() => {
    axios.get('/api/v1/users/current-user', { withCredentials: true })
      .then(res => setUser(res.data?.data || null))
      .catch(() => setUser(null))
  }, [])

  // ─── Navigation ─────────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [page, setPage] = useState('home')
  const [activeSidebarItem, setActiveSidebarItem] = useState('home')
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [allVideos, setAllVideos] = useState([])

  const handleVideoClick = useCallback((video) => {
    setSelectedVideo(video)
    setPage('watch')
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // Save to localStorage history
    try {
      const historyIds = JSON.parse(localStorage.getItem('bw_history') || '[]')
      const videoId = video._id || video.id
      const filtered = historyIds.filter(id => id !== videoId)
      filtered.push(videoId)
      localStorage.setItem('bw_history', JSON.stringify(filtered))
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Pre-fetch all videos for related panel
  useEffect(() => {
    axios.get('/api/videos')
      .then(res => {
        setAllVideos(res.data)
        
        // Parse ?video=xxx query param to load shared video
        const params = new URLSearchParams(window.location.search)
        const videoId = params.get('video')
        if (videoId) {
          const video = res.data.find(v => (v._id || v.id) === videoId)
          if (video) {
            handleVideoClick(video)
          }
        }
      })
      .catch(() => {})
  }, [handleVideoClick])

  const handleSearch = useCallback((query) => {
    setSearchQuery(query)
    setPage('search')
    setActiveSidebarItem('')
  }, [])

  const handleLogoClick = useCallback(() => {
    setPage('home')
    setActiveSidebarItem('home')
    setSearchQuery('')
    setSelectedVideo(null)
  }, [])

  const handleSidebarNav = useCallback((id) => {
    setActiveSidebarItem(id)
    setPage(id)
    setSelectedVideo(null)
    setSearchQuery('')
  }, [])

  return (
    <div className="app-layout">
      <Navbar
        onSearch={handleSearch}
        onLogoClick={handleLogoClick}
        onToggleSidebar={() => setSidebarOpen(s => !s)}
        theme={theme}
        onToggleTheme={toggleTheme}
        user={user}
        onAvatarClick={() => setShowProfileAuth(true)}
        onUploadClick={() => {
          if (!user) {
            setShowProfileAuth(true)
          } else {
            setShowUploadModal(true)
          }
        }}
      />

      <div className="app-body">
        <Sidebar
          isOpen={sidebarOpen}
          activePage={activeSidebarItem}
          onNavigate={handleSidebarNav}
        />

        <main
          id="main-content"
          className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}
          role="main"
        >
          {(page === 'home' || page === 'trending' || page === 'subscriptions' || page === 'library' || page === 'history' || page === 'liked') && (
            <VideoGrid onVideoClick={handleVideoClick} refreshKey={refreshKey} filterType={page} user={user} />
          )}
          {page === 'watch' && selectedVideo && (
            <VideoPlayer
              video={selectedVideo}
              onVideoClick={handleVideoClick}
              relatedVideos={allVideos}
              user={user}
              onRequireAuth={() => setShowProfileAuth(true)}
              onDeleteVideo={(deletedId) => {
                setAllVideos(prev => prev.filter(v => (v._id || v.id) !== deletedId))
                handleLogoClick()
              }}
            />
          )}
          {page === 'search' && (
            <SearchResults query={searchQuery} onVideoClick={handleVideoClick} />
          )}
          {page === 'settings' && (
            <div className="settings-panel fade-in" style={{ maxWidth: '640px', margin: '40px auto', padding: '30px', background: 'var(--bg-surface)', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: 'var(--text-main)' }}>Account & Settings</h2>
              
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: user.avatarColor || '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', color: '#fff' }}>
                      {(user.fullName || user.username || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-main)' }}>{user.fullName || user.username}</div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>@{user.username}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Email Address</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-main)' }}>{user.email}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Account Status</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#10b981' }}>✓ Verified</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                  <p style={{ marginBottom: '16px' }}>Please log in to view and manage your account settings.</p>
                  <button 
                    className="subscribe-btn" 
                    onClick={() => setShowProfileAuth(true)}
                    style={{ padding: '10px 24px', fontSize: '14px', cursor: 'pointer' }}
                  >
                    Log In / Register
                  </button>
                </div>
              )}

              <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>Preferences</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-main)' }}>Theme Preference</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Switch between Dark Mode and Light Mode</div>
                  </div>
                  <button 
                    onClick={toggleTheme}
                    style={{ padding: '8px 16px', background: 'var(--bg-input)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
                  >
                    {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Profile / Auth Panel */}
      {showProfileAuth && (
        <ProfileAuth
          user={user}
          onClose={() => setShowProfileAuth(false)}
          onLoginSuccess={(userData) => setUser(userData)}
          onLogout={() => setUser(null)}
        />
      )}

      {/* Video Upload Modal */}
      {showUploadModal && (
        <UploadModal
          user={user}
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={(newVideo) => {
            setAllVideos(prev => [newVideo, ...prev])
            setRefreshKey(prev => prev + 1)
            handleLogoClick()
          }}
        />
      )}
    </div>
  )
}
