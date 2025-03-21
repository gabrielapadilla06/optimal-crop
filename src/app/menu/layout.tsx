import { SiteFooter } from '@/components/footer'
import { SiteHeader } from '@/components/header'

interface MainLayoutProps {
   children: React.ReactNode
}

export default async function MainLayout({
   children,
}: MainLayoutProps) {
   return (
      <div className="min-h-screen flex flex-col">
         <SiteHeader />
         <main className="mx-auto flex-1 overflow-hidden">{children}</main>
         <SiteFooter />
      </div>
   )
}
