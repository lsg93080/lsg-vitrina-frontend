export type UserRole = 'player' | 'developer' | 'admin'

export interface AuthServiceUser {
  id: string
  email?: string
  roles: UserRole[]
  uid?: string
  displayName?: string
  photoURL?: string
}

// Response from Auth Service /auth/login and /auth/register (snake_case fields from the backend DTO).
export interface AuthServiceResponse {
  access_token: string
  isNewUser: boolean
  user: AuthServiceUser
}
