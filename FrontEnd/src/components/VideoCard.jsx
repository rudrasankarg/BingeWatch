// ─── Thumbnail SVG ────────────────────────────────────────────────────────────
function Thumbnail({ gradients }) {
  const colors = gradients?.length ? gradients : ['#1a1a2e', '#16213e']
  const id = `g${colors[0].replace('#', '')}`
  return (
    <svg className="thumbnail-gradient" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          {colors.map((c, i) => (
            <stop key={i} offset={`${(i / Math.max(colors.length - 1, 1)) * 100}%`} stopColor={c} />
          ))}
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill={`url(#${id})`} />
      <circle cx="260" cy="40" r="70" fill="rgba(255,255,255,0.04)" />
      <circle cx="60" cy="150" r="45" fill="rgba(255,255,255,0.04)" />
      <circle cx="160" cy="90" r="22" fill="rgba(255,255,255,0.06)" />
    </svg>
  )
}

function formatViews(n) {
  if (!n) return '0 views'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K views`
  return `${n} views`
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(mins / 60)
  const days = Math.floor(hrs / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)
  if (years > 0) return `${years}y ago`
  if (months > 0) return `${months}mo ago`
  if (days > 0) return `${days}d ago`
  if (hrs > 0) return `${hrs}h ago`
  return 'Just now'
}

export default function VideoCard({ video, onClick }) {
  const initials = (video.channel || 'BW').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const isLive = video.duration === 'LIVE'

  return (
    <article
      className="video-card fade-in-up"
      onClick={() => onClick(video)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(video)}
      aria-label={`Watch ${video.title} by ${video.channel}`}
    >
      {/* Thumbnail */}
      <div className="video-thumbnail">
        <Thumbnail gradients={video.thumbnailGradient} />
        <div className="thumbnail-overlay">
          <div className="play-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#080c14">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
        <span className={`duration-badge ${isLive ? 'live-badge' : ''}`}>
          {video.duration}
        </span>
      </div>

      {/* Info */}
      <div className="video-card-body">
        <div className="channel-row">
          <div
            className="channel-avatar"
            style={{ background: video.channelAvatarColor || '#6366f1' }}
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="video-meta">
            <h3 className="video-title">{video.title}</h3>
            <div className="video-channel" onClick={(e) => e.stopPropagation()}>
              {video.channel}
            </div>
            <div className="video-stats">
              {formatViews(video.views)}{video.uploadedAt ? ` • ${timeAgo(video.uploadedAt)}` : ''}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export { Thumbnail, formatViews, timeAgo }
