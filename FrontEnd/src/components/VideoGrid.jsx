import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import VideoCard from './VideoCard.jsx'
import SkeletonCard from './SkeletonCard.jsx'

const CATEGORIES = ['All', 'Gaming', 'Music', 'Tech', 'Science', 'Sports', 'Comedy', 'News', 'Education', 'Film', 'Other']

export default function VideoGrid({ onVideoClick, refreshKey }) {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')

  const fetchVideos = useCallback(async (category) => {
    setLoading(true)
    setError(null)
    try {
      const params = category !== 'All' ? { category } : {}
      const res = await axios.get('/api/videos', { params })
      setVideos(res.data)
    } catch (err) {
      console.error('Failed to fetch videos:', err)
      setError('Failed to load videos. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVideos(activeCategory)
  }, [activeCategory, fetchVideos, refreshKey])

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat)
  }

  return (
    <section aria-label="Video feed">
      {/* Category Chips */}
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

      {/* Grid */}
      {!error && (
        <div className="video-grid" role="list">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => (
                <div key={i} role="listitem">
                  <SkeletonCard />
                </div>
              ))
            : videos.length === 0
            ? (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m10 9 5 3-5 3V9Z"/>
                </svg>
                <h3>No videos found</h3>
                <p>Try a different category</p>
              </div>
            )
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
