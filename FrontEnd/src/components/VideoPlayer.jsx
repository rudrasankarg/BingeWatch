import { useState, useEffect, useRef } from 'react'
import { Thumbnail, formatViews, timeAgo } from './VideoCard.jsx'

// ─── Icons ───────────────────────────────────────────────────────────────────
const PlayIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
)

const PauseIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
  </svg>
)

const ThumbUpIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
  </svg>
)

const ThumbDownIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/>
  </svg>
)

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/>
  </svg>
)

const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
)

const VolIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
  </svg>
)

const FullscreenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
  </svg>
)

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
  </svg>
)

// ─── Component ────────────────────────────────────────────────────────────────
import axios from 'axios'

export default function VideoPlayer({ video, onVideoClick, relatedVideos, user, onRequireAuth, onDeleteVideo }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(video.likes || 0)
  const [subscribed, setSubscribed] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [videoDuration, setVideoDuration] = useState(0)
  const [videoCurrentTime, setVideoCurrentTime] = useState(0)

  const intervalRef = useRef(null)
  const videoRef = useRef(null)

  // Handle play/pause progress
  useEffect(() => {
    if (video.videoUrl && videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => setIsPlaying(false))
      } else {
        videoRef.current.pause()
      }
      return
    }

    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) { clearInterval(intervalRef.current); setIsPlaying(false); return 100 }
          return p + 0.1
        })
      }, 300)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isPlaying, video.videoUrl])

  // Reset when video changes
  useEffect(() => {
    setIsPlaying(false)
    setProgress(0)
    setLiked(false)
    setLikeCount(video.likes || 0)
    setSubscribed(false)
    setDescExpanded(false)
    setPlaybackRate(1)
    setVideoCurrentTime(0)
    setVideoDuration(0)
    if (videoRef.current) {
      videoRef.current.playbackRate = 1
      videoRef.current.load()
    }
  }, [video._id || video.id])

  const handleLike = () => {
    if (!user) {
      onRequireAuth()
      return
    }
    setLiked((l) => !l)
    setLikeCount((c) => liked ? c - 1 : c + 1)
  }

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = ((e.clientX - rect.left) / rect.width) * 100
    setProgress(Math.min(100, Math.max(0, pct)))

    if (video.videoUrl && videoRef.current && videoDuration > 0) {
      videoRef.current.currentTime = (pct / 100) * videoDuration
    }
  }

  const skipBackward = () => {
    if (video.videoUrl && videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5)
    } else {
      setProgress(p => Math.max(0, p - 5))
    }
  }

  const skipForward = () => {
    if (video.videoUrl && videoRef.current) {
      videoRef.current.currentTime = Math.min(videoDuration, videoRef.current.currentTime + 5)
    } else {
      setProgress(p => Math.min(100, p + 5))
    }
  }

  const handleSpeedChange = () => {
    const rates = [1, 1.25, 1.5, 2]
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length
    const nextRate = rates[nextIndex]
    setPlaybackRate(nextRate)
    if (videoRef.current) {
      videoRef.current.playbackRate = nextRate
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime
      const dur = videoRef.current.duration || 0
      setVideoCurrentTime(cur)
      setProgress(dur > 0 ? (cur / dur) * 100 : 0)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration)
    }
  }

  const handleDeleteVideo = async () => {
    if (!window.confirm("Are you sure you want to delete this video?")) return
    try {
      await axios.delete(`/api/videos/${video._id || video.id}`)
      alert("Video deleted successfully!")
      if (onDeleteVideo) {
        onDeleteVideo(video._id || video.id)
      }
    } catch (err) {
      alert("Failed to delete video.")
    }
  }

  const formatTime = (timeInSecs) => {
    const m = Math.floor(timeInSecs / 60)
    const s = Math.floor(timeInSecs % 60)
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const timeDisplay = video.videoUrl
    ? `${formatTime(videoCurrentTime)} / ${formatTime(videoDuration)}`
    : `${Math.floor(progress * 0.8)}:${String(Math.floor((progress * 0.8 % 1) * 60)).padStart(2, '0')} / ${video.duration === 'LIVE' ? '🔴 LIVE' : video.duration}`

  const initials = (video.channel || 'BW').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const formatLikes = (n) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
    return String(n)
  }

  const currentTime = `${Math.floor(progress * 0.8)}:${String(Math.floor((progress * 0.8 % 1) * 60)).padStart(2, '0')}`

  return (
    <div className="watch-page fade-in">
      {/* Left: Player + Details */}
      <div className="video-player-container">
        {/* Player */}
        <div className="video-player-wrap" id="video-player" style={{ position: 'relative', overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {video.videoUrl ? (
            <video
              ref={videoRef}
              src={video.videoUrl}
              className="video-element"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onClick={() => setIsPlaying(!isPlaying)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
            />
          ) : (
            <Thumbnail gradients={video.thumbnailGradient} />
          )}
          
          <div className="player-controls-overlay">
            {/* Center play button */}
            <button
              id="player-play-pause-btn"
              className="player-center-btn"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>

            {/* Bottom controls */}
            <div className="player-bottom">
              {/* Progress bar */}
              <div
                id="player-progress-bar"
                className="progress-bar-track"
                onClick={handleProgressClick}
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Video progress"
              >
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {/* Controls row */}
              <div className="player-controls-row">
                <div className="player-controls-left">
                  <button
                    id="player-play-btn-mini"
                    className="ctrl-btn"
                    onClick={() => setIsPlaying(!isPlaying)}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying
                      ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                      : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    }
                  </button>
                  <button
                    className="ctrl-btn"
                    onClick={skipBackward}
                    title="Rewind 5s"
                    style={{ fontSize: '11px', fontWeight: 'bold' }}
                  >
                    -5s
                  </button>
                  <button
                    className="ctrl-btn"
                    onClick={skipForward}
                    title="Forward 5s"
                    style={{ fontSize: '11px', fontWeight: 'bold' }}
                  >
                    +5s
                  </button>
                  <button id="player-volume-btn" className="ctrl-btn" aria-label="Volume">
                    <VolIcon />
                  </button>
                  <span className="time-display">{timeDisplay}</span>
                </div>
                <div className="player-controls-left" style={{ gap: '8px' }}>
                  <button
                    className="ctrl-btn"
                    onClick={handleSpeedChange}
                    title="Playback speed"
                    style={{ fontSize: '11px', fontWeight: 'bold', padding: '2px 6px', background: 'rgba(255,255,255,0.15)', borderRadius: '4px' }}
                  >
                    {playbackRate}x
                  </button>
                  <button id="player-settings-btn" className="ctrl-btn" aria-label="Settings">
                    <SettingsIcon />
                  </button>
                  <button id="player-fullscreen-btn" className="ctrl-btn" aria-label="Fullscreen">
                    <FullscreenIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Details */}
        <div className="video-details">
          <h1 className="video-detail-title">{video.title}</h1>

          <div className="video-detail-meta">
            {/* Channel Info + Subscribe */}
            <div className="channel-info-row">
              <div
                className="channel-detail-avatar"
                style={{ background: video.channelAvatarColor || '#6366f1' }}
                aria-hidden="true"
              >
                {initials}
              </div>
              <div>
                <div className="channel-detail-name">{video.channel}</div>
                <div className="channel-subs">{video.channelHandle}</div>
              </div>
              <button
                id="subscribe-btn"
                className={`subscribe-btn ${subscribed ? 'subscribed' : ''}`}
                onClick={() => {
                  if (!user) {
                    onRequireAuth()
                    return
                  }
                  setSubscribed(!subscribed)
                }}
                aria-pressed={subscribed}
              >
                {subscribed ? '✓ Subscribed' : 'Subscribe'}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="action-bar">
              {/* Like/Dislike pill */}
              <div className="action-pill">
                <button
                  id="like-btn"
                  className={`action-btn ${liked ? 'liked' : ''}`}
                  onClick={handleLike}
                  aria-pressed={liked}
                  aria-label={`Like this video. ${formatLikes(likeCount)} likes`}
                >
                  <ThumbUpIcon filled={liked} />
                  {formatLikes(likeCount)}
                </button>
                <div className="action-divider" />
                <button
                  id="dislike-btn"
                  className="action-btn"
                  onClick={() => {
                    if (!user) {
                      onRequireAuth()
                      return
                    }
                  }}
                  aria-label="Dislike this video"
                >
                  <ThumbDownIcon />
                </button>
              </div>

              <button id="share-btn" className="action-btn-solo" aria-label="Share this video">
                <ShareIcon /> Share
              </button>
              <button
                id="save-btn"
                className="action-btn-solo"
                onClick={() => {
                  if (!user) {
                    onRequireAuth()
                    return
                  }
                }}
                aria-label="Save to playlist"
              >
                <SaveIcon /> Save
              </button>
              {user && (user.username === video.owner || user.email === video.owner) && (
                <button
                  id="delete-btn"
                  className="action-btn-solo"
                  onClick={handleDeleteVideo}
                  style={{ color: 'var(--danger)', background: 'rgba(255,77,109,0.1)' }}
                  aria-label="Delete this video"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <div
            id="video-description"
            className="description-panel"
            onClick={() => setDescExpanded(!descExpanded)}
            role="button"
            tabIndex={0}
            aria-expanded={descExpanded}
          >
            <div className="desc-stats">
              {formatViews(video.views)} • {timeAgo(video.uploadedAt)}
            </div>
            <p className="desc-text" style={{ WebkitLineClamp: descExpanded ? 'unset' : 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {video.description || 'No description provided.'}
            </p>
            <div className="desc-toggle">
              {descExpanded ? '▲ Show less' : '▼ Show more'}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Related Videos */}
      <aside className="related-panel" aria-label="Related videos">
        <h2 className="related-title">Up Next</h2>
        {relatedVideos.filter(v => (v._id || v.id) !== (video._id || video.id)).slice(0, 10).map((rv) => {
          const rvInitials = (rv.channel || 'BW').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
          return (
            <div
              key={rv._id || rv.id}
              className="related-card"
              onClick={() => onVideoClick(rv)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onVideoClick(rv)}
              aria-label={`Watch ${rv.title}`}
            >
              <div className="related-thumb">
                <Thumbnail gradients={rv.thumbnailGradient} />
                <span className={`duration-badge ${rv.duration === 'LIVE' ? 'live-badge' : ''}`}>
                  {rv.duration}
                </span>
              </div>
              <div className="related-info">
                <div className="related-title-text">{rv.title}</div>
                <div className="related-channel">{rv.channel}</div>
                <div className="related-views">{formatViews(rv.views)}</div>
              </div>
            </div>
          )
        })}
      </aside>
    </div>
  )
}
