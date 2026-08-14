import { useState, useEffect } from 'react'
import axios from 'axios'
import { Thumbnail, formatViews, timeAgo } from './VideoCard.jsx'
import SkeletonCard from './SkeletonCard.jsx'

export default function SearchResults({ query, onVideoClick }) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('relevance')

  useEffect(() => {
    if (!query) return
    const fetchResults = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axios.get('/api/search', { params: { q: query } })
        setResults(res.data)
      } catch (err) {
        console.error('Search failed:', err)
        setError('Search failed. Make sure the backend is running.')
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [query])

  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'views') return (b.views || 0) - (a.views || 0)
    if (sortBy === 'date') return new Date(b.uploadedAt) - new Date(a.uploadedAt)
    return 0 // relevance — keep API order
  })

  return (
    <section className="fade-in" aria-label="Search results">
      {/* Header */}
      <div className="search-header">
        {!loading && (
          <h2>
            {results.length > 0
              ? <>{results.length} results for <span>&ldquo;{query}&rdquo;</span></>
              : <>No results for <span>&ldquo;{query}&rdquo;</span></>
            }
          </h2>
        )}

        {/* Sort row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginRight: '4px' }}>Sort by:</span>
          {[
            { id: 'relevance', label: 'Relevance' },
            { id: 'views', label: 'Most Viewed' },
            { id: 'date', label: 'Upload Date' },
          ].map((s) => (
            <button
              key={s.id}
              id={`sort-${s.id}`}
              className={`chip ${sortBy === s.id ? 'active' : ''}`}
              onClick={() => setSortBy(s.id)}
              aria-pressed={sortBy === s.id}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="empty-state" role="alert">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
          </svg>
          <h3>Search error</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Skeleton */}
      {loading && !error && (
        <div className="video-grid">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Results */}
      {!loading && !error && sortedResults.length === 0 && (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <h3>No videos found</h3>
          <p>Try different keywords or check your spelling</p>
        </div>
      )}

      {!loading && !error && sortedResults.map((video) => {
        const initials = (video.channel || 'BW').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        return (
          <div
            key={video._id || video.id}
            className="search-result-card"
            onClick={() => onVideoClick(video)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onVideoClick(video)}
            aria-label={`Watch ${video.title}`}
          >
            <div className="search-result-thumb">
              <Thumbnail gradients={video.thumbnailGradient} />
              <span className={`duration-badge ${video.duration === 'LIVE' ? 'live-badge' : ''}`}>
                {video.duration}
              </span>
            </div>
            <div className="search-result-info">
              <h3 className="search-result-title">{video.title}</h3>
              <div className="search-result-stats">
                {formatViews(video.views)}{video.uploadedAt ? ` • ${timeAgo(video.uploadedAt)}` : ''}
              </div>
              <div className="search-result-channel">
                <div
                  style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: video.channelAvatarColor || '#6366f1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: 700, color: 'white', flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  {initials}
                </div>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{video.channel}</span>
              </div>
              <p className="search-result-desc">{video.description}</p>
            </div>
          </div>
        )
      })}
    </section>
  )
}
