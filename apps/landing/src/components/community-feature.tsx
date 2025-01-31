interface CommunityFeatureProps {
  title: string
  className?: string
}

export function CommunityFeature({ title, className = "" }: CommunityFeatureProps) {
  return (
    <div className={`bg-gray-900/20 backdrop-blur-sm border border-gray-800 rounded-lg p-4 ${className}`}>
      <p className="text-sm text-gray-300 uppercase tracking-wider">{title}</p>
    </div>
  )
}

