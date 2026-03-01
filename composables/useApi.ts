export const useApi = () => {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()

    const request = async (url: string, options: any = {}) => {
        const baseURL = config.public.apiBase
        const token = authStore.token

        const headers: any = {
            'Accept': 'application/json',
            ...options.headers
        }

        // Only set Content-Type to application/json if it's not FormData
        if (!(options.body instanceof FormData) && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json'
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        try {
            const response = await $fetch(url, {
                baseURL,
                ...options,
                headers
            })
            return response
        } catch (error: any) {
            if (error.status === 401) {
                authStore.logout()
            }
            throw error
        }
    }

    return {
        get: (url: string, options?: any) => request(url, { ...options, method: 'GET' }),
        post: (url: string, body?: any, options?: any) => request(url, { ...options, method: 'POST', body }),
        put: (url: string, body?: any, options?: any) => request(url, { ...options, method: 'PUT', body }),
        patch: (url: string, body?: any, options?: any) => request(url, { ...options, method: 'PATCH', body }),
        delete: (url: string, options?: any) => request(url, { ...options, method: 'DELETE' }),
    }
}
