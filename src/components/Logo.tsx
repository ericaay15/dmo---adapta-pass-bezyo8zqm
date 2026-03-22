import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <div
      className={cn(
        'font-black tracking-widest flex items-center justify-center gap-2 select-none',
        className,
      )}
    >
      <span className="text-white">
        ADAPT<span className="font-sans">Δ</span>
      </span>
      <span className="bg-gradient-to-r from-[#f472b6] to-[#fb7185] bg-clip-text text-transparent">
        PASS
      </span>
    </div>
  )
}
