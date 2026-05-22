<template>
  <v-main class="login-bg" :style="{ backgroundImage: `url(/images/login-${themeStore.theme}.webp)` }">
    <v-container fluid class="fill-height">
      <v-row align="center" justify="center" class="fill-height">
        <v-col cols="12" sm="8" md="6" lg="4" class="d-flex flex-column align-center">
          
          <!-- Logo -->
          <div class="mb-8 animate-fade-in text-center">
            <img
              :src="`/images/logo/${themeStore.theme === 'dark' ? 'ftl-white-logo.webp' : 'ftl_logo_dark.webp'}`"
              alt="FLT Employee Portal"
              style="height: 120px; width: auto; object-fit: contain;"
            />
          </div>

          <!-- Login Card -->
          <v-card class="w-100 rounded-xl pa-8 pa-md-10 animate-slide-up" :class="themeStore.theme === 'dark' ? 'bg-surface-variant dark-card' : 'bg-white'" elevation="10" style="max-width: 480px; backdrop-filter: blur(10px); background-color: rgba(var(--v-theme-surface), 0.95) !important;">
            <div class="text-center mb-8">
              <h2 class="text-h5 font-weight-bold mb-2">Welcome Back!</h2>
              <p class="text-body-2 opacity-70">Please sign in to continue to your dashboard.</p>
            </div>

            <v-form @submit.prevent="handleLogin" ref="loginForm">
              <v-text-field
                v-model="form.email"
                label="Username"
                placeholder="admin@elements.com"
                persistent-placeholder
                prepend-inner-icon="mdi-account-outline"
                variant="outlined"
                bg-color="transparent"
                class="mb-4 custom-input"
                hide-details
                required
              ></v-text-field>

              <v-text-field
                v-model="form.password"
                label="Password"
                placeholder="••••••••"
                persistent-placeholder
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                bg-color="transparent"
                class="mb-4 custom-input"
                hide-details
                required
              ></v-text-field>

              <div class="d-flex justify-space-between align-center mb-6">
                <v-checkbox
                  v-model="form.remember"
                  label="Remember me"
                  hide-details
                  density="compact"
                  color="primary"
                  class="font-weight-medium text-body-2 remember-checkbox"
                ></v-checkbox>
                <NuxtLink to="/forgot-password" class="text-caption font-weight-bold text-decoration-none" :class="themeStore.theme === 'dark' ? 'text-orange-darken-2' : 'text-primary'">
                  Forgot Password?
                </NuxtLink>
              </div>

              <v-alert
                v-if="error"
                type="error"
                variant="tonal"
                density="compact"
                class="mb-6 font-weight-bold text-caption"
              >
                {{ error }}
              </v-alert>

              <v-btn
                type="submit"
                block
                height="48"
                :color="themeStore.theme === 'dark' ? 'orange-darken-2' : 'primary'"
                class="text-white font-weight-bold rounded-lg elevation-2"
                :loading="loading"
              >
                SIGN IN
              </v-btn>
            </v-form>
          </v-card>

          <!-- Footer -->
          <div class="mt-8 text-caption text-center opacity-70" :class="themeStore.theme === 'dark' ? 'text-white' : 'text-primary'">
            © 2024 - {{ new Date().getFullYear() }} FLT Solutions. All rights reserved.
          </div>
          
        </v-col>
      </v-row>
    </v-container>

    <!-- Floating Theme Indicator (Optional) -->
    <div class="fixed-bottom-left pa-4">
      <v-btn
        :icon="themeStore.theme === 'dark' ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'"
        variant="tonal"
        size="small"
        :color="themeStore.theme === 'dark' ? 'white' : 'primary'"
        @click="themeStore.toggle()"
        class="theme-toggle-btn opacity-50"
      ></v-btn>
    </div>
  </v-main>
</template>

<script setup lang="ts">
const api = useApi()
const authStore = useAuthStore()
const themeStore = useThemeStore()

definePageMeta({
  layout: false
})

const form = reactive({
  email: '',
  password: '',
  remember: false
})

const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const res: any = await api.post('/login', form)
    authStore.setUser(res.data.user, res.data.token)
    navigateTo('/')
  } catch (err: any) {
    error.value = err.data?.message || err.response?.data?.message || 'Access Denied'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-bg {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: background-image 0.4s ease;
  min-height: 100vh;
}

.custom-input :deep(.v-field__prepend-inner) {
  padding-inline-start: 12px !important;
  padding-inline-end: 12px !important;
  align-items: center !important;
  opacity: 0.6;
}

.custom-input :deep(.v-field__append-inner) {
  padding-inline-end: 12px !important;
  align-items: center !important;
  opacity: 0.6;
}

/* Override Browser Autofill Styles */
.custom-input :deep(input:-webkit-autofill),
.custom-input :deep(input:-webkit-autofill:hover), 
.custom-input :deep(input:-webkit-autofill:focus), 
.custom-input :deep(input:-webkit-autofill:active) {
  transition: background-color 5000s ease-in-out 0s;
  -webkit-text-fill-color: currentColor !important;
}

/* Dark Mode Forced Colors */
.dark-card h2,
.dark-card p,
.dark-card .remember-checkbox,
.dark-card .remember-checkbox :deep(.v-label) {
  color: white !important;
}

.dark-card .custom-input :deep(label),
.dark-card .custom-input :deep(input),
.dark-card .custom-input :deep(.v-field__prepend-inner i),
.dark-card .custom-input :deep(.v-field__append-inner i) {
  color: white !important;
  opacity: 1 !important;
}

.dark-card .custom-input :deep(.v-field__outline) {
  --v-field-border-opacity: 0.4 !important;
  color: white !important;
}

.fixed-bottom-left {
  position: fixed;
  bottom: 0;
  left: 0;
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.8s ease forwards;
}

.animate-slide-up {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
