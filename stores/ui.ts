import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
    state: () => ({
        snackbar: {
            show: false,
            text: '',
            color: 'info', // success, error, info, warning
            timeout: 3000
        }
    }),
    actions: {
        showToast(text: string, color: 'success' | 'error' | 'info' | 'warning' = 'info', timeout = 3000) {
            this.snackbar.text = text
            this.snackbar.color = color
            this.snackbar.timeout = timeout
            this.snackbar.show = true
        },
        success(text: string) {
            this.showToast(text, 'success')
        },
        error(text: string) {
            this.showToast(text, 'error')
        },
        info(text: string) {
            this.showToast(text, 'info')
        }
    }
})
