import { defineStore } from 'pinia'

interface CompanyInfo {
    name: string
    logo_url: string | null
}

export const useCompanyStore = defineStore('company', {
    state: () => ({
        company: null as CompanyInfo | null,
        loaded: false,
    }),

    getters: {
        companyName: (state) => state.company?.name || 'Elements HR',
        logoUrl: (state) => state.company?.logo_url || null,
    },

    actions: {
        async fetchCompany() {
            if (this.loaded) return
            try {
                const api = useApi()
                const res: any = await api.get('/company/public')
                this.company = res.data
                this.loaded = true
            } catch (err) {
                console.error('Failed to fetch company info', err)
            }
        },

        reset() {
            this.company = null
            this.loaded = false
        }
    }
})
