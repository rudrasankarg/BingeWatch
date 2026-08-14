export default function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-thumbnail" />
      <div className="skeleton-body">
        <div className="skeleton skeleton-avatar" />
        <div className="skeleton-lines">
          <div className="skeleton skeleton-line w-90" />
          <div className="skeleton skeleton-line w-60" />
          <div className="skeleton skeleton-line w-40" />
        </div>
      </div>
    </div>
  )
}
