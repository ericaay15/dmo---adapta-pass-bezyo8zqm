import { cn } from '@/lib/utils'
import logoImg from '@/assets/adapta-pass-logo-white-5b4d9.png'

export function Logo({ className }: { className?: string }) {
  return (
    <img
      src={logoImg}
      alt="Adapta Pass"
      className={cn('h-7 sm:h-9 w-auto object-contain', className)}
    />
  )
}
