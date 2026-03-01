export default defineNuxtRouteMiddleware(async (to, from) => {
    // Skip auth checks during SSR — localStorage doesn't exist on server
    if (import.meta.server) return

    const authStore = useAuthStore()

    // On reload, Pinia state is empty but token may be in localStorage
    if (!authStore.isLoggedIn) {
        const token = localStorage.getItem('auth_token')
        if (token) {
            authStore.token = token
            try {
                await authStore.fetchUser()
            } catch {
                // Token is invalid/expired — clear and redirect to login
                authStore.logout()
                return
            }
        }
    }

    // If not logged in and not going to login, redirect to login
    if (!authStore.isLoggedIn && to.path !== '/login') {
        return navigateTo('/login')
    }

    // If already logged in and going to login, redirect to dashboard
    if (authStore.isLoggedIn && to.path === '/login') {
        return navigateTo('/')
    }

    // Permission Check
    const requiredPermission = to.meta.permission as string
    if (requiredPermission && !authStore.isAdmin && !authStore.hasPermission(requiredPermission)) {
        return navigateTo('/')
    }
})
