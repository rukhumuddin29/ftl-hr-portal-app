import { defineStore } from 'pinia'

type Theme = 'dark' | 'light'

export const useThemeStore = defineStore('theme', {
    state: () => ({
        theme: 'dark' as Theme,
    }),

    actions: {
        toggle() {
            this.theme = this.theme === 'dark' ? 'light' : 'dark'
            this.apply()
            localStorage.setItem('app_theme', this.theme)
        },

        apply() {
            if (import.meta.client) {
                document.documentElement.setAttribute('data-theme', this.theme)
            }
        },

        init() {
            if (import.meta.client) {
                const saved = localStorage.getItem('app_theme') as Theme | null
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
                this.theme = saved ?? (prefersDark ? 'dark' : 'light')
                this.apply()
            }
        },
    },
})
