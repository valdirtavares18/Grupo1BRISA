import { UserRole, ConsentDataType } from '@prisma/client'

export { UserRole, ConsentDataType }

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  organizationId?: string
}

export interface OrganizationTheme {
  id: string
  primaryColor: string
  logoUrl?: string
  backgroundStyle?: string
}
