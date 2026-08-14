import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import VideoCard from './VideoCard.jsx'
import SkeletonCard from './SkeletonCard.jsx'

const CATEGORIES = ['All', 'Gaming', 'Music', 'Tech', 'Science', 'Sports', 'Comedy', 'News', 'Education', 'Film', 'Other']

export default function VideoGrid({ onVideoClick, refreshKey, filterType = 'home', user }) {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')

  const fetchVideos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get('/api/videos')
      let list = res.data

      // Apply filter based on filterType
      if (filterType === 'trending') {
        // Sort by views descending
        list = [...list].sort((a, b) => (b.views || 0) - (a.views || 0))
      } else if (filterType === 'subscriptions') {
        // Curated selection from categories or verified creators
        list = list.filter(v => v.category === 'Tech' || v.category === 'Gaming' || v.likes > 0)
      } else if (filterType === 'library') {
        // Filter videos uploaded by current user
        if (user) {
          list = list.filter(v => v.owner === user.username || v.owner === user.email)
        } else {
          list = []
        }
      } else if (filterType === 'history') {
        // Fetch from local watch history
        const historyIds = JSON.parse(localStorage.getItem('bw_history') || '[]')
        list = [...historyIds].reverse()
          .map(id => list.find(v => (v._id || v.id) === id))
          .filter(Boolean)
      } else if (filterType === 'liked') {
        // Fetch from local liked videos list
        const likedIds = JSON.parse(localStorage.getItem('bw_liked') || '[]')
        list = list.filter(v => likedIds.includes(v._id || v.id))
      } else {
        // Default: home category filter
        if (activeCategory !== 'All') {
          list = list.filter(v => v.category === activeCategory)
        }
      }

      setVideos(list)
    } catch (err) {
      console.error('Failed to fetch videos:', err)
      setError('Failed to load videos. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }, [activeCategory, filterType, user])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos, refreshKey])

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat)
  }

  return (
    <section aria-label="Video feed">
      {/* Category Chips - only show on Home */}
      {filterType === 'home' && (
        <div className="chips-row" role="tablist" aria-label="Video categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`category-${cat.toLowerCase()}`}
              className={`chip ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
              role="tab"
              aria-selected={activeCategory === cat}
              aria-label={`Filter by ${cat}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="empty-state" role="alert">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
          <h3>Connection Error</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && videos.length === 0 && (
        <div className="empty-state" style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '16px', opacity: 0.7 }}>
            <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '8px' }}>
            {filterType === 'library' ? 'No Uploaded Videos' : 
             filterType === 'history' ? 'No Watch History' : 
             filterType === 'liked' ? 'No Liked Videos' : 
             'No videos found'}
          </h3>
          <p style={{ fontSize: '14px' }}>
            {filterType === 'library' ? 'Videos you upload will show up here.' : 
             filterType === 'history' ? 'Videos you watch will be saved in your history.' : 
             filterType === 'liked' ? 'Videos you like will appear here.' : 
             'Try checking other categories or upload a video.'}
          </p>
        </div>
      )}

      {/* Grid */}
      {!error && videos.length > 0 && (
        <div className="video-grid" role="list">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => (
                <div key={i} role="listitem">
                  <SkeletonCard />
                </div>
              ))
            : videos.map((video) => (
                <div key={video._id || video.id} role="listitem">
                  <VideoCard video={video} onClick={onVideoClick} />
                </div>
              ))
          }
        </div>
      )}
    </section>
  )
}
