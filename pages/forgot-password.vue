<template>
  <v-main class="login-bg">
    <v-container fluid class="fill-height">
      <v-row align="center" justify="center" no-gutters class="fill-height">
        
        <!-- Left Side: Brand -->
        <v-col cols="12" md="6" class="d-flex justify-center justify-md-end pr-md-16 py-10 left-pane">
          <div class="brand-container animate-left">
            <div class="d-flex align-center">
              <v-sheet
                width="64"
                height="64"
                color="primary"
                class="logo-sheet rounded-xl mr-4 d-flex align-center justify-center font-weight-bold text-h3 text-white"
                elevation="10"
              >
                E
              </v-sheet>
              <h1 class="text-h3 font-weight-bold text-uppercase tracking-tighter" :class="themeStore.theme === 'dark' ? 'text-white' : 'text-secondary'">
                Elements HR
              </h1>
            </div>
          </div>
        </v-col>

        <!-- Right Side: Action Form -->
        <v-col cols="12" md="6" class="d-flex justify-center justify-md-start pl-md-16 py-10">
          <div class="form-container animate-right w-100" style="max-width: 400px">
            <div class="mb-10 text-center text-md-left">
              <h2 class="text-h2 font-weight-light mb-2 tracking-widest" :class="themeStore.theme === 'dark' ? 'text-white' : 'text-primary'">Recover</h2>
              <p class="text-overline font-weight-bold tracking-widest" :class="themeStore.theme === 'dark' ? 'text-white-50' : 'text-muted'">
                Enter your email to receive reset link.
              </p>
            </div>

            <div v-if="success" class="text-center text-md-left animate-fade">
              <v-icon size="64" color="success" class="mb-4">mdi-email-check-outline</v-icon>
              <h3 class="text-h5 font-weight-bold mb-2">Check Your Email</h3>
              <p class="text-body-2 text-muted mb-8">{{ message }}</p>
              <v-btn to="/login" variant="text" color="primary" class="font-weight-medium tracking-widest px-0">BACK TO LOGIN</v-btn>
            </div>

            <v-form v-else @submit.prevent="handleRequestLink" ref="form">
              <v-text-field
                v-model="email"
                label="EMAIL ADDRESS"
                placeholder="admin@elements.com"
                type="email"
                variant="solo"
                :bg-color="themeStore.theme === 'dark' ? 'white' : 'surface'"
                class="sleek-field mb-4"
                hide-details
                required
              ></v-text-field>

              <v-alert
                v-if="error"
                type="error"
                variant="tonal"
                density="compact"
                class="mb-4 text-uppercase font-weight-medium"
                style="font-size: 10px; letter-spacing: 1px"
              >
                {{ error }}
              </v-alert>

              <v-btn
                type="submit"
                block
                height="52"
                color="primary"
                class="text-white font-weight-medium tracking-widest rounded-lg elevation-4 mt-6"
                :loading="loading"
              >
                SEND RESET LINK
              </v-btn>

              <div class="mt-8 text-center text-md-left">
                <v-btn
                  to="/login"
                  variant="text"
                  :color="themeStore.theme === 'dark' ? 'white' : 'primary'"
                  class="text-caption font-weight-medium tracking-widest opacity-50 px-0"
                  density="compact"
                >
                  REMEMBERED YOUR PASSWORD? LOGIN
                </v-btn>
              </div>
            </v-form>
          </div>
        </v-col>

      </v-row>
    </v-container>

    <div class="fixed-bottom-left pa-8">
      <v-btn
        :icon="themeStore.theme === 'dark' ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'"
        variant="tonal"
        :color="themeStore.theme === 'dark' ? 'white' : 'primary'"
        @click="themeStore.toggle()"
        class="theme-toggle-btn"
      ></v-btn>
    </div>
  </v-main>
</template>

<script setup lang="ts">
const api = useApi()
const themeStore = useThemeStore()

definePageMeta({
  layout: false
})

const email = ref('')
const loading = ref(false)
const success = ref(false)
const message = ref('')
const error = ref('')

const handleRequestLink = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const res: any = await api.post('/password/email', { email: email.value })
    success.value = true
    message.value = res.message || 'We have emailed your password reset link!'
  } catch (err: any) {
    error.value = err.data?.message || 'Email not found'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Inherit styles from login.vue logic */
.login-bg {
  background: var(--bg-base) !important;
  transition: background 0.4s ease;
}

.sleek-field :deep(.v-field) {
  border-radius: 8px !important;
  box-shadow: none !important;
}

.sleek-field :deep(input) {
  font-weight: 600 !important;
  color: #011a1a !important;
  letter-spacing: 0.5px;
}

.sleek-field :deep(.v-label) {
  font-weight: 800;
  letter-spacing: 1px;
  font-size: 11px;
  opacity: 0.7;
}

.fixed-bottom-left {
  position: fixed;
  bottom: 0;
  left: 0;
}

.animate-left {
  animation: slideLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-right {
  animation: slideRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideLeft {
  from { opacity: 0; transform: translateX(-40px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideRight {
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
}

.animate-fade {
  animation: fadeIn 0.5s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.white-50 {
  color: rgba(255, 255, 255, 0.5) !important;
}
</style>
