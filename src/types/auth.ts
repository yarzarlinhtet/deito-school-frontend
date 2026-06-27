export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  role: string
  permissions: string[]
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  tokens: AuthTokens
}

export interface RefreshResponse {
  tokens: AuthTokens
}
