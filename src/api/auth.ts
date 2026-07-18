import { apiClient, API_PREFIX } from './client'
import type { User } from '@/types'

export const authApi = {
  /** Full URL that kicks off the OAuth login redirect for a provider. */
  oauthLoginUrl: (provider: string): string =>
    `${API_PREFIX}/oauth/login/${provider}`,

  me: async (token?: string): Promise<User> => {
    const { data } = await apiClient.get<User>(
        '/users/me',
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
    )
    return data
  },

    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout')
    },

}
