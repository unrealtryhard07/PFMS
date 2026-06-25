'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CreditCard, Target, Settings } from 'lucide-react'
import { clsx } from 'clsx'

const NAV = [
  { href: '/',             label: 'Home',     Icon: LayoutDashboard },
  { href: '/transactions', label: 'Spend',    Icon: CreditCard },
  { href: '/goals',        label: 'Goals',    Icon: Target },
  { href: '/settings',     label: 'Settings', Icon: Settings },
]

export function BottomNav() {
  const path = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-border">
      <div className="flex">
        {NAV.map(({ href, label, Icon }) => {
          const active = href === '/' ? path === '/' : path.startsWith(href)
          return (
            <Link key={href} href={href} className={clsx(
              'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
              active ? 'text-accent' : 'text-text-muted'
            )}>
              <Icon size={20} />{label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
