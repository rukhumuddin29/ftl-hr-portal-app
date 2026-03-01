<template>
  <v-main class="login-bg">
    <v-container fluid class="fill-height">
      <v-row align="center" justify="center" no-gutters class="fill-height">
        
        <!-- Left Side: Brand -->
        <v-col cols="12" md="6" class="d-flex justify-center justify-md-end pr-md-16 py-10 left-pane">
          <div class="brand-container animate-left">
            <div class="d-flex align-center justify-center">
              <template v-if="companyStore.logoUrl">
                <img
                  :src="companyStore.logoUrl"
                  :alt="companyStore.companyName"
                  class="logo-img"
                  style="height: 120px; width: auto; max-width: 600px; object-fit: contain;"
                />
              </template>
              <v-sheet
                v-else
                width="120"
                height="120"
                color="primary"
                class="logo-sheet rounded-xl d-flex align-center justify-center font-weight-black text-white"
                style="font-size: 56px;"
                elevation="10"
              >
                {{ companyStore.companyName.charAt(0) }}
              </v-sheet>
            </div>
          </div>
        </v-col>

        <!-- Right Side: Login Form -->
        <v-col cols="12" md="6" class="d-flex justify-center justify-md-start pl-md-16 py-10">
          <div class="form-container animate-right w-100" style="max-width: 400px">
            <div class="mb-10 text-center text-md-left">
              <h2 class="text-h2 font-weight-light mb-2 tracking-widest" :class="themeStore.theme === 'dark' ? 'text-white' : 'text-primary'">Welcome</h2>
              <p class="text-overline font-weight-black tracking-widest" :class="themeStore.theme === 'dark' ? 'text-white-50' : 'text-muted'">
                Please login to admin dashboard.
              </p>
            </div>

            <v-form @submit.prevent="handleLogin" ref="loginForm">
              <v-text-field
                v-model="form.email"
                label="USERNAME"
                placeholder="admin@elements.com"
                variant="solo"
                :bg-color="themeStore.theme === 'dark' ? 'white' : 'surface'"
                class="sleek-field mb-4"
                hide-details
                required
              ></v-text-field>

              <v-text-field
                v-model="form.password"
                label="PASSWORD"
                placeholder="••••••••"
                type="password"
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
                class="mb-4 text-uppercase font-weight-black"
                style="font-size: 10px; letter-spacing: 1px"
              >
                {{ error }}
              </v-alert>

              <v-btn
                type="submit"
                block
                height="52"
                color="primary"
                class="text-white font-weight-black tracking-widest rounded-lg elevation-4 mt-6"
                :loading="loading"
              >
                LOGIN
              </v-btn>
            </v-form>

            <div class="mt-8 text-center text-md-left">
              <v-btn
                to="/forgot-password"
                variant="text"
                :color="themeStore.theme === 'dark' ? 'white' : 'primary'"
                class="text-caption font-weight-black tracking-widest opacity-50 px-0"
                density="compact"
              >
                FORGOTTEN YOUR PASSWORD?
              </v-btn>
            </div>
          </div>
        </v-col>

      </v-row>
    </v-container>

    <!-- Floating Theme Indicator (Optional) -->
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
const authStore = useAuthStore()
const themeStore = useThemeStore()
const companyStore = useCompanyStore()

definePageMeta({
  layout: false
})

onMounted(() => {
  companyStore.fetchCompany()
})

const form = reactive({
  email: '',
  password: ''
})

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
    error.value = err.data?.message || 'Access Denied'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
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

/* Animations */
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

.white-50 {
  color: rgba(255, 255, 255, 0.5) !important;
}
</style>
