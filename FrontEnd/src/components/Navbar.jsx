import { useState } from 'react'

// ─── Icons ────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
)
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
  </svg>
)
const HamburgerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>
  </svg>
)
const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
)
const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
  </svg>
)
const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </svg>
)
const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
  </svg>
)

export default function Navbar({ onSearch, onLogoClick, onToggleSidebar, theme, onToggleTheme, user, onAvatarClick }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) onSearch(query.trim())
  }

  const initials = user
    ? (user.fullName || user.username || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'BW'

  return (
    <header className="navbar" role="banner">
      {/* Left */}
      <div className="navbar-left">
        <button id="sidebar-toggle-btn" className="hamburger-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <HamburgerIcon />
        </button>
        <div className="logo" onClick={onLogoClick} role="link" tabIndex={0} aria-label="BingeWatch home"
          onKeyDown={(e) => e.key === 'Enter' && onLogoClick()}>
          <div className="logo-mark"><PlayIcon /></div>
          <span className="logo-text">Binge<span>Watch</span></span>
        </div>
      </div>

      {/* Center Search */}
      <nav className="navbar-center" aria-label="Search">
        <form id="search-form" className="search-form" onSubmit={handleSubmit} role="search">
          <input
            id="main-search-input"
            type="search"
            className="search-input"
            placeholder="Search videos, channels..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search BingeWatch"
          />
          <button id="search-submit-btn" type="submit" className="search-btn" aria-label="Search">
            <SearchIcon />
          </button>
        </form>
      </nav>

      {/* Right */}
      <div className="navbar-right">
        <button id="upload-btn" className="icon-btn" aria-label="Upload video" title="Upload">
          <UploadIcon />
        </button>
        <button id="notifications-btn" className="icon-btn" aria-label="Notifications">
          <BellIcon />
        </button>
        {/* Theme Toggle */}
        <button
          id="theme-toggle-btn"
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
        {/* Avatar */}
        <div
          id="user-avatar-btn"
          className={`avatar-btn ${user ? 'has-user' : ''}`}
          role="button"
          tabIndex={0}
          onClick={onAvatarClick}
          onKeyDown={(e) => e.key === 'Enter' && onAvatarClick()}
          aria-label={user ? `${user.fullName || user.username}'s profile` : 'Sign in'}
          title={user ? 'Your profile' : 'Sign in'}
        >
          {initials}
        </div>
      </div>
    </header>
  )
}
