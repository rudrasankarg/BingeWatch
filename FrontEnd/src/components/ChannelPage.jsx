import { useState } from 'react'
import VideoGrid from './VideoGrid.jsx'
import EditChannelModal from './EditChannelModal.jsx'

export default function ChannelPage({ user, onVideoClick, refreshKey, onSaveSuccess }) {
  const [showEdit, setShowEdit] = useState(false)
  const initials = (user.fullName || user.username || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="channel-page fade-in" style={{ padding: '0 0 40px 0' }}>
      {/* Banner Section */}
      <div style={{ position: 'relative', width: '100%', height: '180px', background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)', overflow: 'hidden' }}>
        {user.coverImage ? (
          <img src={user.coverImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Channel Banner" />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.2)', fontSize: '14px', letterSpacing: '2px', fontWeight: '600' }}>
            BINGEWATCH CREATOR
          </div>
        )}
      </div>

      {/* Profile Details Container */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', marginTop: '-32px', marginBottom: '30px' }}>
          
          {/* Left: Avatar + Details */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            {/* Avatar circle */}
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: user.avatarColor || '#6366f1', border: '4px solid var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px', fontWeight: '800', color: '#fff', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              {user.avatar ? (
                <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Channel Avatar" />
              ) : (
                initials
              )}
            </div>
            
            {/* Title & Metadata */}
            <div style={{ paddingBottom: '8px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 4px 0', lineHeight: 1.1 }}>{user.fullName || user.username}</h1>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>@{user.username}</div>
            </div>
          </div>

          {/* Right: Customize Button */}
          <div style={{ paddingBottom: '8px', alignSelf: 'flex-end' }}>
            <button 
              onClick={() => setShowEdit(true)}
              className="subscribe-btn"
              style={{ padding: '10px 24px', fontSize: '13px', borderRadius: '20px', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', color: 'var(--text-main)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              Customize Channel
            </button>
          </div>
        </div>

        <hr style={{ border: 'none', height: '1px', background: 'rgba(255,255,255,0.08)', margin: '0 0 24px 0' }} />

        {/* Videos Grid tab */}
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '16px' }}>Uploaded Videos</h2>
        
        <VideoGrid 
          onVideoClick={onVideoClick} 
          refreshKey={refreshKey} 
          filterType="library" 
          user={user} 
        />
      </div>

      {showEdit && (
        <EditChannelModal 
          user={user} 
          onClose={() => setShowEdit(false)} 
          onSaveSuccess={onSaveSuccess} 
        />
      )}
    </div>
  )
}
