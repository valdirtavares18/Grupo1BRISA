import { PublicLayout } from '@/components/organisms/public-layout'

export default function SlugLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PublicLayout>{children}</PublicLayout>
}
