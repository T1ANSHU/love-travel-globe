import { siteConfig } from '../../config/siteConfig'

export function AuthorCredit({ className = '' }: { className?: string }) {
  return (
    <p
      className={`text-center text-xs font-semibold text-pink-500 ${className}`}
      style={{ textShadow: '0 0 8px rgba(236,72,153,0.35)' }}
    >
      {siteConfig.authorDisplay}
    </p>
  )
}
