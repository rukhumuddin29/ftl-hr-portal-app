<template>
  <v-container class="animate-fade py-8">
    <v-row>
      <!-- Page Header -->
      <v-col cols="12" class="mb-6">
        <h1 class="text-h4 font-weight-bold uppercase">Company Information</h1>
        <p class="text-body-2 text-muted">Manage your organization's core details and branding.</p>
      </v-col>

      <v-col cols="12">
        <v-form @submit.prevent="saveCompanyInfo">
          <v-row>
            <!-- Left Column: Branding -->
            <v-col cols="12" md="4">
              <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-8 mb-6 text-center">
                <h3 class="text-overline font-weight-bold text-primary mb-6 tracking-widest">COMPANY LOGO</h3>
                
                <div class="position-relative d-inline-block mb-6">
                  <v-avatar size="180" class="rounded-xl elevation-10 border-4 border-surface bg-secondary overflow-hidden">
                    <v-img v-if="logoPreview || displayLogoUrl" :src="(logoPreview || displayLogoUrl)!" cover>
                      <template v-slot:placeholder>
                        <div class="d-flex align-center justify-center fill-height">
                          <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
                        </div>
                      </template>
                    </v-img>
                    <v-icon v-else size="64" color="white">mdi-office-building</v-icon>
                  </v-avatar>
                  <v-btn
                    icon="mdi-camera"
                    color="primary"
                    size="small"
                    class="logo-edit-btn"
                    elevation="6"
                    @click="triggerLogoInput"
                  ></v-btn>
                  <input
                    ref="logoInputRef"
                    type="file"
                    class="d-none"
                    accept="image/*"
                    @change="onLogoSelected"
                  />
                </div>
                <p class="text-caption text-muted">Recommended: Square PNG/SVG with transparent background (Max 2MB)</p>
              </v-card>

              <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-8">
                <h3 class="text-overline font-weight-bold text-primary mb-6 tracking-widest">SOCIAL PROFILES</h3>
                
                <v-text-field
                  v-model="form.facebook"
                  label="FACEBOOK"
                  variant="outlined"
                  hide-details="auto"
                  class="mb-4"
                  prepend-inner-icon="mdi-facebook"
                  placeholder="https://facebook.com/your-page"
                ></v-text-field>

                <v-text-field
                  v-model="form.instagram"
                  label="INSTAGRAM"
                  variant="outlined"
                  hide-details="auto"
                  class="mb-4"
                  prepend-inner-icon="mdi-instagram"
                  placeholder="https://instagram.com/your-handle"
                ></v-text-field>

                <v-text-field
                  v-model="form.youtube"
                  label="YOUTUBE"
                  variant="outlined"
                  hide-details="auto"
                  class="mb-4"
                  prepend-inner-icon="mdi-youtube"
                  placeholder="https://youtube.com/c/your-channel"
                ></v-text-field>

                <v-text-field
                  v-model="form.linkedin"
                  label="LINKEDIN"
                  variant="outlined"
                  hide-details="auto"
                  class="mb-0"
                  prepend-inner-icon="mdi-linkedin"
                  placeholder="https://linkedin.com/company/your-company"
                ></v-text-field>
              </v-card>
            </v-col>

            <!-- Right Column: Business Details -->
            <v-col cols="12" md="8">
              <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-8 mb-6">
                <h3 class="text-h6 font-weight-bold mb-6 uppercase text-primary d-flex align-center ga-2">
                  <v-icon>mdi-information-outline</v-icon>
                  Basic Information
                </h3>
                
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model="form.name"
                      label="COMPANY NAME"
                      variant="outlined"
                      required
                      hide-details="auto"
                      class="mb-4"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="form.phone"
                      label="CONTACT PHONE"
                      variant="outlined"
                      hide-details="auto"
                      class="mb-4"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="form.email"
                      label="SUPPORT EMAIL"
                      variant="outlined"
                      hide-details="auto"
                      class="mb-4"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="form.website"
                      label="WEBSITE"
                      variant="outlined"
                      hide-details="auto"
                      class="mb-4"
                      placeholder="https://example.com"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-card>

              <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-8 mb-6">
                <h3 class="text-h6 font-weight-bold mb-6 uppercase text-primary d-flex align-center ga-2">
                  <v-icon>mdi-map-marker-outline</v-icon>
                  Registered Address
                </h3>
                
                <v-row>
                  <v-col cols="12">
                    <v-textarea
                      v-model="form.address"
                      label="STREET ADDRESS"
                      variant="outlined"
                      rows="2"
                      hide-details="auto"
                      class="mb-4"
                    ></v-textarea>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="form.city"
                      label="CITY"
                      variant="outlined"
                      hide-details="auto"
                      class="mb-4"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="form.state"
                      label="STATE"
                      variant="outlined"
                      hide-details="auto"
                      class="mb-4"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="form.pincode"
                      label="PINCODE"
                      variant="outlined"
                      hide-details="auto"
                      class="mb-4"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="form.country"
                      label="COUNTRY"
                      variant="outlined"
                      hide-details="auto"
                      class="mb-4"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-card>

              <div class="d-flex justify-end ga-4">
                <v-btn
                  variant="text"
                  class="font-weight-medium px-8"
                  @click="resetForm"
                  :disabled="saving"
                >
                  DISCARD CHANGES
                </v-btn>
                <v-btn
                  color="primary"
                  size="large"
                  class="font-weight-medium px-12 rounded-lg"
                  type="submit"
                  :loading="saving"
                >
                  SAVE INFORMATION
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const api = useApi()
const uiStore = useUiStore()
const config = useRuntimeConfig()

const logoInputRef = ref<HTMLInputElement | null>(null)
const loading = ref(true)
const saving = ref(false)
const logoPreview = ref<string | null>(null)
const selectedLogoFile = ref<File | null>(null)

const form = reactive({
  name: '',
  phone: '',
  email: '',
  website: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  country: 'IN',
  facebook: '',
  instagram: '',
  youtube: '',
  linkedin: '',
})

const originalData = ref<any>(null)

const displayLogoUrl = computed(() => {
  if (!originalData.value?.logo) return null
  const base = config.public.apiBase.split('/api')[0]
  return `${base}/storage/${originalData.value.logo}`
})

const fetchCompanyInfo = async () => {
  try {
    const res: any = await api.get('/company')
    const data = res.data
    originalData.value = data
    Object.assign(form, {
      name: data.name || '',
      phone: data.phone || '',
      email: data.email || '',
      website: data.website || '',
      address: data.address || '',
      city: data.city || '',
      state: data.state || '',
      pincode: data.pincode || '',
      country: data.country || 'IN',
      facebook: data.facebook || '',
      instagram: data.instagram || '',
      youtube: data.youtube || '',
      linkedin: data.linkedin || '',
    })
  } catch (err) {
    uiStore.error('Failed to load company information')
  } finally {
    loading.value = false
  }
}

const triggerLogoInput = () => {
  logoInputRef.value?.click()
}

const onLogoSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  selectedLogoFile.value = file
  logoPreview.value = URL.createObjectURL(file)
}

const saveCompanyInfo = async () => {
  saving.value = true
  const formData = new FormData()
  
  // Append all form fields
  Object.keys(form).forEach(key => {
    formData.append(key, (form as any)[key])
  })

  if (selectedLogoFile.value) {
    formData.append('logo', selectedLogoFile.value)
  }

  try {
    const res: any = await api.post('/company', formData)
    uiStore.success('Company info updated successfully')
    originalData.value = res.data
    logoPreview.value = null
    selectedLogoFile.value = null
  } catch (err: any) {
    uiStore.error(err.data?.message || 'Failed to update company information')
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  if (originalData.value) {
    Object.assign(form, originalData.value)
    logoPreview.value = null
    selectedLogoFile.value = null
  }
}

onMounted(() => {
  fetchCompanyInfo()
})

definePageMeta({
  middleware: 'auth'
})
</script>

<style scoped>
.animate-fade {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.border-thin {
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}
.border-4 {
  border-width: 4px !important;
}
.logo-edit-btn {
  position: absolute;
  bottom: 5px;
  right: 5px;
  border: 4px solid var(--v-theme-surface) !important;
}
</style>
