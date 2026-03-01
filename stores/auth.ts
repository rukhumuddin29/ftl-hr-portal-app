import { defineStore } from 'pinia'

interface EmployeeDetail {
    address?: string
    city?: string
    pincode?: string
    state?: string
    country?: string
    alternate_number?: string
    emergency_contact_number?: string
    account_holder_name?: string
    bank_name?: string
    account_number?: string
    ifsc_code?: string
}

interface User {
    id: number
    name: string
    email: string
    phone?: string
    employee_id?: string
    department?: string
    designation?: string
    salary?: number
    avatar?: string
    status: string
    roles: any[]
    permissions: string[]
    employee_detail?: EmployeeDetail
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as User | null,
        token: null as string | null,
        permissions: [] as string[]
    }),

    getters: {
        isLoggedIn: (state) => !!state.token,
        hasPermission: (state) => (permission: string) => state.permissions.includes(permission),
        isAdmin: (state) => {
            if (!state.user?.roles) return false
            return state.user.roles.some((r: any) => {
                const roleName = typeof r === 'string' ? r : (r?.name || '')
                return ['admin', 'super_admin'].includes(roleName)
            })
        },
        isSuperAdmin: (state) => {
            if (!state.user?.roles) return false
            return state.user.roles.some((r: any) => {
                const roleName = typeof r === 'string' ? r : (r?.name || '')
                return roleName === 'super_admin'
            })
        },
    },

    actions: {
        setUser(user: User, token?: string) {
            this.user = user
            this.permissions = user.permissions || []
            if (token) {
                this.token = token
                localStorage.setItem('auth_token', token)
            }
        },

        logout() {
            this.user = null
            this.token = null
            this.permissions = []
            localStorage.removeItem('auth_token')
            return navigateTo('/login')
        },

        async fetchUser() {
            const api = useApi()
            try {
                const res: any = await api.get('/me')
                // The API returns { data: { user: ..., permissions: ... } }
                // res itself is the JSON body { success: true, data: { ... } }
                const userData = res.data?.user || res.data
                const permissions = res.data?.permissions || userData?.permissions || []

                this.user = userData
                this.permissions = permissions
            } catch (error) {
                this.logout()
            }
        },

        async init() {
            const token = localStorage.getItem('auth_token')
            if (token) {
                this.token = token
                await this.fetchUser()
            }
        }
    }
})

