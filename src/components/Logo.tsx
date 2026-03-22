import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <div
      className={cn(
        'font-semibold tracking-[0.15em] flex items-center justify-center gap-3.5 select-none',
        className,
      )}
    >
      <span className="text-white">
        ADAPT<span className="font-sans">Δ</span>
      </span>
      <span className="bg-gradient-to-r from-[#4bb7a5] via-[#957588] to-[#f45961] bg-clip-text text-transparent">
        PASS
      </span>
    </div>
  )
}
