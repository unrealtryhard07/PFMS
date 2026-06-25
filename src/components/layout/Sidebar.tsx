'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CreditCard, Target, PieChart, Settings, LogOut } from 'lucide-react'
import { logoutAction } from '@/lib/actions/auth'
import { clsx } from 'clsx'

const NAV = [
  { href: '/',             label: 'Dashboard',    Icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', Icon: CreditCard },
  { href: '/budgets',      label: 'Budgets',      Icon: PieChart },
  { href: '/goals',        label: 'Goals',        Icon: Target },
  { href: '/settings',     label: 'Settings',     Icon: Settings },
]

export function Sidebar() {
  const path = usePathname()
  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-surface border-r border-border fixed inset-y-0 left-0 z-40">
      <div className="p-6 border-b border-border">
        <span className="text-xl font-bold tracking-tight">Finance</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(({ href, label, Icon }) => {
          const active = href === '/' ? path === '/' : path.startsWith(href)
          return (
            <Link key={href} href={href} className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              active ? 'bg-accent/10 text-accent' : 'text-text-muted hover:text-text-primary hover:bg-white/5'
            )}>
              <Icon size={18} />{label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <form action={logoutAction}>
          <button type="submit" className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-text-muted hover:text-danger hover:bg-danger/10 transition-colors">
            <LogOut size={18} />Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
