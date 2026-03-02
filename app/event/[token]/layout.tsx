import { PublicLayout } from '@/components/organisms/public-layout'

export default function EventTokenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PublicLayout>{children}</PublicLayout>
}
