import { defineStore } from 'pinia'

interface Notification {
    id: number
    type: string
    title: string
    message: string
    icon: string
    color: string
    link: string | null
    read_at: string | null
    created_at: string
}

export const useNotificationStore = defineStore('notifications', {
    state: () => ({
        notifications: [] as Notification[],
        unreadCount: 0,
        loading: false,
        pollingInterval: null as any,
    }),

    actions: {
        async fetchNotifications() {
            const api = useApi()
            this.loading = true
            try {
                const res: any = await api.get('/notifications')
                this.notifications = res.data.notifications
                this.unreadCount = res.data.unread_count
            } catch (err) {
                console.error('Failed to fetch notifications', err)
            } finally {
                this.loading = false
            }
        },

        async pollUnreadCount() {
            const api = useApi()
            const authStore = useAuthStore()
            
            if (!authStore.isLoggedIn) return

            try {
                const res: any = await api.get('/notifications/unread-count')
                this.unreadCount = res.data.unread_count
            } catch (err) {
                // Ignore polling errors
            }
        },

        async markAsRead(id: number) {
            const api = useApi()
            try {
                await api.post(`/notifications/${id}/read`)
                const notif = this.notifications.find(n => n.id === id)
                if (notif) notif.read_at = new Date().toISOString()
                this.unreadCount = Math.max(0, this.unreadCount - 1)
            } catch (err) {
                console.error('Failed to mark notification as read', err)
            }
        },

        async markAllAsRead() {
            const api = useApi()
            try {
                await api.post('/notifications/read-all')
                this.notifications.forEach(n => n.read_at = new Date().toISOString())
                this.unreadCount = 0
            } catch (err) {
                console.error('Failed to mark all as read', err)
            }
        },

        startPolling() {
            this.stopPolling()
            this.pollUnreadCount()
            this.pollingInterval = setInterval(() => {
                this.pollUnreadCount()
            }, 30000) // Every 30 seconds
        },

        stopPolling() {
            if (this.pollingInterval) {
                clearInterval(this.pollingInterval)
                this.pollingInterval = null
            }
        }
    }
})
