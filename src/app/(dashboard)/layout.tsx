import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <main className="md:ml-60 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8">{children}</div>
      </main>
      <BottomNav />
    </div>
  )
}
