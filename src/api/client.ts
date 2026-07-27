import axios from 'axios'
import {useAuthStore} from '@/store/authStore'
import {authApi} from '@/api/auth'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
export const API_PREFIX = `${BASE_URL}/api/v1`

export const apiClient = axios.create({
    baseURL: `${BASE_URL}/api/v1`,
    headers: {'Content-Type': 'application/json'},
    withCredentials: true
})

apiClient.interceptors.request.use((config) => {
    const {getState} = useAuthStore
    const {token} = getState()

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config

        if (original.url?.includes('/auth/refresh')) {
            useAuthStore.getState().logout()
            return Promise.reject(error)
        }

        if (error.response?.status === 401 && !original._retry) {
            original._retry = true
            try {
                const {data: {access_token}} = await apiClient.post(
                    `/auth/refresh`,
                    {},
                    {withCredentials: true},
                )
                const {setAuth} = useAuthStore.getState()
                const user = await authApi.me(access_token)
                setAuth(user, access_token)

                original.headers.Authorization = `Bearer ${access_token}`
                return apiClient(original)
            } catch {
                useAuthStore.getState().logout()
                window.location.href = '/login'
            }
        }

        return Promise.reject(error)
    },
)
