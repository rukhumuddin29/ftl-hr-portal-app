<template>
  <v-container class="animate-fade py-8">
    <v-row>
      <!-- Page Header -->
      <v-col cols="12" class="mb-6">
        <h1 class="text-h4 font-weight-bold uppercase">My Profile</h1>
        <p class="text-body-2 text-muted">Manage your personal information and account security.</p>
      </v-col>

      <!-- Left Column: User Summary & Read-only Info -->
      <v-col cols="12" md="4">
        <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-8 mb-6 text-center">
          <div class="position-relative d-inline-block mb-6">
            <v-avatar size="140" :color="!displayAvatarUrl ? 'primary' : ''" class="rounded-circle elevation-10 border-4 border-white bg-surface">
              <v-img v-if="displayAvatarUrl" :src="displayAvatarUrl" alt="Avatar" cover>
                <template v-slot:placeholder>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
                  </div>
                </template>
              </v-img>
              <span v-else class="text-h2 font-weight-bold text-white">{{ authStore.user?.name?.charAt(0) }}</span>
            </v-avatar>
            <v-btn
              icon="mdi-pencil"
              color="primary"
              size="small"
              class="avatar-edit-btn"
              elevation="6"
              @click="triggerFileInput"
              :loading="uploadingAvatar"
            ></v-btn>
            <input
              ref="fileInputRef"
              type="file"
              class="d-none"
              accept="image/*"
              @change="onFileSelected"
            />
          </div>
          <h2 class="text-h5 font-weight-bold uppercase mb-1">{{ authStore.user?.name }}</h2>
          <p class="text-overline font-weight-bold text-primary tracking-widest mb-4">
             {{ authStore.user?.roles?.[0]?.display_name || 'MEMBER' }}
          </p>
          <v-chip
            :color="authStore.user?.status === 'active' ? 'success' : 'error'"
            size="small"
            label
            class="font-weight-medium px-4"
          >
            {{ authStore.user?.status?.toUpperCase() }}
          </v-chip>
        </v-card>

        <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6">
          <h3 class="text-overline font-weight-bold text-primary mb-6 tracking-widest d-flex align-center">
            <v-icon class="mr-2" size="small">mdi-office-building-outline</v-icon>
            ORGANIZATION DETAILS
          </h3>
          
          <div class="mb-4">
            <p class="text-[10px] text-muted font-weight-medium uppercase mb-1">Email Address</p>
            <p class="text-subtitle-2 font-weight-medium">{{ authStore.user?.email }}</p>
          </div>

          <div class="mb-4">
            <p class="text-[10px] text-muted font-weight-medium uppercase mb-1">Employee ID</p>
            <p class="text-subtitle-2 font-mono font-weight-medium">{{ authStore.user?.employee_id || 'N/A' }}</p>
          </div>

          <div class="mb-4">
            <p class="text-[10px] text-muted font-weight-medium uppercase mb-1">Department</p>
            <p class="text-subtitle-2 font-weight-medium text-uppercase">{{ authStore.user?.department || 'General' }}</p>
          </div>

          <div class="mb-4">
            <p class="text-[10px] text-muted font-weight-medium uppercase mb-1">Designation</p>
            <p class="text-subtitle-2 font-weight-medium text-uppercase">{{ authStore.user?.designation || 'Staff' }}</p>
          </div>

          <div v-if="authStore.isAdmin">
             <v-divider class="my-4 border-opacity-25"></v-divider>
             <p class="text-[10px] text-muted font-weight-medium uppercase mb-1">Monthly Salary</p>
             <p class="text-subtitle-1 font-weight-bold text-success">₹{{ authStore.user?.salary || 0 }}</p>
          </div>
        </v-card>
      </v-col>

      <!-- Right Column: Editable Details -->
      <v-col cols="12" md="8">
        <v-form @submit.prevent="handleUpdate">
          <!-- General Information -->
          <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-8 mb-6">
            <h3 class="text-h6 font-weight-bold mb-6 uppercase text-primary d-flex align-center ga-2">
              <v-icon>mdi-account-edit-outline</v-icon>
              General Information
            </h3>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.name"
                  label="FULL NAME"
                  variant="outlined"
                  required
                  hide-details="auto"
                  class="mb-4"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.phone"
                  label="PHONE NUMBER"
                  variant="outlined"
                  hide-details="auto"
                  class="mb-4"
                  placeholder="+91 XXXXX XXXXX"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card>

          <!-- Address Details -->
          <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-8 mb-6">
            <h3 class="text-h6 font-weight-bold mb-6 uppercase text-primary d-flex align-center ga-2">
              <v-icon>mdi-map-marker-outline</v-icon>
              Address Details
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
                  v-model="form.pincode"
                  label="PINCODE"
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
                  v-model="form.country"
                  label="COUNTRY"
                  variant="outlined"
                  hide-details="auto"
                  class="mb-4"
                  readonly
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card>

          <!-- Contact Details -->
          <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-8 mb-6">
            <h3 class="text-h6 font-weight-bold mb-6 uppercase text-primary d-flex align-center ga-2">
              <v-icon>mdi-phone-outline</v-icon>
              Contact Details
            </h3>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.alternate_number"
                  label="ALTERNATE NUMBER"
                  variant="outlined"
                  hide-details="auto"
                  class="mb-4"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.emergency_contact_number"
                  label="EMERGENCY CONTACT"
                  variant="outlined"
                  hide-details="auto"
                  class="mb-4"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card>

          <!-- Bank Details -->
          <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-8 mb-6">
            <div class="d-flex align-center justify-space-between mb-6">
              <h3 class="text-h6 font-weight-bold uppercase text-primary d-flex align-center ga-2">
                <v-icon>mdi-bank-outline</v-icon>
                Bank Details
              </h3>
              <v-chip v-if="isBankDetailsSet" color="warning" size="x-small" label class="font-weight-medium">READ ONLY</v-chip>
            </div>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.account_holder_name"
                  label="ACCOUNT HOLDER NAME"
                  variant="outlined"
                  hide-details="auto"
                  class="mb-4"
                  :readonly="isBankDetailsSet"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.bank_name"
                  label="BANK NAME"
                  variant="outlined"
                  hide-details="auto"
                  class="mb-4"
                  :readonly="isBankDetailsSet"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.account_number"
                  label="ACCOUNT NUMBER"
                  variant="outlined"
                  hide-details="auto"
                  class="mb-4"
                  :readonly="isBankDetailsSet"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.ifsc_code"
                  label="IFSC CODE"
                  variant="outlined"
                  hide-details="auto"
                  class="mb-4"
                  :readonly="isBankDetailsSet"
                ></v-text-field>
              </v-col>
            </v-row>
            <p v-if="isBankDetailsSet" class="text-caption text-muted mt-2">Note: Bank details cannot be modified once saved. Please contact HR for any corrections.</p>
          </v-card>

          <div class="d-flex justify-end ga-4">
            <v-btn
              variant="text"
              class="font-weight-medium px-8"
              @click="resetForm"
              :disabled="loading"
            >
              RESET
            </v-btn>
            <v-btn
              color="primary"
              size="large"
              class="font-weight-medium px-12 rounded-lg"
              type="submit"
              :loading="loading"
            >
              SAVE CHANGES
            </v-btn>
          </div>
        </v-form>
      </v-col>
    </v-row>

    <!-- Avatar Upload Confirmation Dialog -->
    <v-dialog v-model="showAvatarDialog" max-width="450">
      <v-card class="rounded-xl pa-6 text-center">
        <v-card-title class="text-h6 font-weight-bold uppercase mb-2">Confirm New Avatar</v-card-title>
        <v-card-text>
          <div class="d-flex justify-center mb-6">
            <v-avatar size="180" class="elevation-10 border-4 border-primary">
              <v-img :src="previewUrl" cover></v-img>
            </v-avatar>
          </div>
          <p class="text-body-2 text-muted">Are you sure you want to update your profile picture with this image?</p>
        </v-card-text>
        <v-card-actions class="ga-4 px-0 pb-0 mt-4">
          <v-btn block variant="text" class="font-weight-medium" @click="cancelUpload" :disabled="uploadingAvatar">CANCEL</v-btn>
          <v-btn block color="primary" size="large" class="font-weight-medium rounded-lg" @click="confirmUpload" :loading="uploadingAvatar">UPLOAD NOW</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const api = useApi()
const uiStore = useUiStore()
const config = useRuntimeConfig()

// Use a ref for the file input to avoid template context issues
const fileInputRef = ref<HTMLInputElement | null>(null)

const loading = ref(false)
const uploadingAvatar = ref(false)
const showAvatarDialog = ref(false)
const previewUrl = ref<string>('')
const selectedFile = ref<File | null>(null)

// Computed for the current avatar to show in the main layout
const displayAvatarUrl = computed(() => {
  if (!authStore.user?.avatar) return null
  if (authStore.user.avatar.startsWith('http')) return authStore.user.avatar
  
  const base = config.public.apiBase.split('/api')[0]
  // Encode the path to handle special characters (like # or spaces)
  const encodedPath = authStore.user.avatar.split('/').map(segment => encodeURIComponent(segment)).join('/')
  return `${base}/storage/${encodedPath}`
})

const isBankDetailsSet = computed(() => {
  return !!authStore.user?.employee_detail?.account_number
})

const form = reactive({
  name: authStore.user?.name || '',
  phone: authStore.user?.phone || '',
  // Employee Details
  address: authStore.user?.employee_detail?.address || '',
  city: authStore.user?.employee_detail?.city || '',
  pincode: authStore.user?.employee_detail?.pincode || '',
  state: authStore.user?.employee_detail?.state || '',
  country: authStore.user?.employee_detail?.country || 'INDIA',
  alternate_number: authStore.user?.employee_detail?.alternate_number || '',
  emergency_contact_number: authStore.user?.employee_detail?.emergency_contact_number || '',
  account_holder_name: authStore.user?.employee_detail?.account_holder_name || '',
  bank_name: authStore.user?.employee_detail?.bank_name || '',
  account_number: authStore.user?.employee_detail?.account_number || '',
  ifsc_code: authStore.user?.employee_detail?.ifsc_code || '',
})

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  showAvatarDialog.value = true
}

const cancelUpload = () => {
  showAvatarDialog.value = false
  selectedFile.value = null
  previewUrl.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const confirmUpload = async () => {
  if (!selectedFile.value) return

  const formData = new FormData()
  formData.append('avatar', selectedFile.value)

  uploadingAvatar.value = true
  try {
    const res: any = await api.post('/profile/avatar', formData)
    authStore.setUser(res.data.user)
    uiStore.success('Avatar updated successfully!')
    cancelUpload()
  } catch (err: any) {
    uiStore.error(err.data?.message || 'Failed to upload avatar')
  } finally {
    uploadingAvatar.value = false
  }
}

const resetForm = () => {
  form.name = authStore.user?.name || ''
  form.phone = authStore.user?.phone || ''
  form.address = authStore.user?.employee_detail?.address || ''
  form.city = authStore.user?.employee_detail?.city || ''
  form.pincode = authStore.user?.employee_detail?.pincode || ''
  form.state = authStore.user?.employee_detail?.state || ''
  form.country = authStore.user?.employee_detail?.country || 'INDIA'
  form.alternate_number = authStore.user?.employee_detail?.alternate_number || ''
  form.emergency_contact_number = authStore.user?.employee_detail?.emergency_contact_number || ''
  form.account_holder_name = authStore.user?.employee_detail?.account_holder_name || ''
  form.bank_name = authStore.user?.employee_detail?.bank_name || ''
  form.account_number = authStore.user?.employee_detail?.account_number || ''
  form.ifsc_code = authStore.user?.employee_detail?.ifsc_code || ''
}

const handleUpdate = async () => {
  loading.value = true
  try {
    const res: any = await api.put('/profile', form)
    authStore.setUser(res.data)
    uiStore.success('Profile updated successfully!')
  } catch (err: any) {
    uiStore.error(err.data?.message || 'Failed to update profile')
  } finally {
    loading.value = false
  }
}

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
.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 5px;
  border: 2px solid var(--v-theme-surface) !important;
}
</style>

