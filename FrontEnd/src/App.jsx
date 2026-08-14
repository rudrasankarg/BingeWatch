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

  // Pre-fetch all videos for related panel
  useEffect(() => {
    axios.get('/api/videos')
      .then(res => setAllVideos(res.data))
      .catch(() => {})
  }, [])

  const handleVideoClick = useCallback((video) => {
    setSelectedVideo(video)
    setPage('watch')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

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
    if (id === 'home') handleLogoClick()
  }, [handleLogoClick])

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
          {page === 'home' && (
            <VideoGrid onVideoClick={handleVideoClick} refreshKey={refreshKey} />
          )}
          {page === 'watch' && selectedVideo && (
            <VideoPlayer
              video={selectedVideo}
              onVideoClick={handleVideoClick}
              relatedVideos={allVideos}
              user={user}
              onRequireAuth={() => setShowProfileAuth(true)}
            />
          )}
          {page === 'search' && (
            <SearchResults query={searchQuery} onVideoClick={handleVideoClick} />
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
