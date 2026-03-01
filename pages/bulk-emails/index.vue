<template>
  <v-container class="max-w-4xl animate-fade">
    <div class="mb-8">
      <h1 class="text-h4 font-weight-black uppercase">Send Bulk Emails</h1>
      <p class="text-body-2 text-muted">Broadcast messages to your lead database or external contacts.</p>
    </div>

    <!-- Toggle Section -->
    <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6 mb-6">
      <div class="d-flex align-center justify-space-between mb-4">
        <h2 class="text-subtitle-1 font-weight-black uppercase d-flex align-center ga-2">
          <v-icon color="primary">mdi-account-arrow-right</v-icon>
          Target Audience
        </h2>
        <v-btn-toggle
          v-model="form.type"
          color="primary"
          mandatory
          variant="tonal"
          density="comfortable"
          class="rounded-lg"
        >
          <v-btn value="leads" class="px-6 font-weight-bold">LEADS</v-btn>
          <v-btn value="random" class="px-6 font-weight-bold">RANDOM</v-btn>
        </v-btn-toggle>
      </div>

      <v-divider class="mb-6 opacity-25"></v-divider>

      <v-row v-if="form.type === 'leads'" align="center" dense>
        <v-col cols="12" md="6">
          <v-select
            v-model="form.target_status"
            :items="statusOptions"
            item-title="title"
            item-value="value"
            label="SELECT LEAD STATUS"
            variant="outlined"
            density="compact"
            hide-details
            placeholder="Select Status"
            @update:modelValue="fetchTargetCount"
          ></v-select>
        </v-col>
        <v-col cols="12" md="6">
          <div class="bg-primary-lighten-5 rounded-lg pa-3 d-flex align-center ga-3">
            <v-avatar color="primary" size="32" variant="tonal">
              <v-icon size="20">mdi-account-group</v-icon>
            </v-avatar>
            <div>
              <p class="text-[10px] font-weight-black opacity-70 uppercase mb-0">Total Recipients</p>
              <p class="text-h6 font-weight-black mb-0">{{ targetCount }} Leads</p>
            </div>
          </div>
        </v-col>
      </v-row>

      <v-row v-else align="center" dense>
        <v-col cols="12">
          <p class="text-caption text-muted font-weight-bold uppercase mb-2">Manual Recipients</p>
          <v-text-field
            v-model="form.random_email"
            label="ENTER EMAIL ADDRESS"
            variant="outlined"
            density="compact"
            placeholder="example@email.com"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-card>

    <!-- Email Composer -->
    <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-8">
      <h2 class="text-subtitle-1 font-weight-black mb-6 uppercase d-flex align-center ga-2">
        <v-icon color="primary">mdi-email-edit-outline</v-icon>
        Email Composer
      </h2>

      <v-form @submit.prevent="handleSend">
        <v-row dense>
          <v-col cols="12">
            <v-text-field
              :model-value="toPlaceholder"
              label="TO MAIL"
              variant="outlined"
              density="compact"
              disabled
              class="mb-4"
              bg-color="grey-darken-4"
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="form.subject"
              label="SUBJECT"
              variant="outlined"
              density="compact"
              required
              class="mb-4"
              placeholder="Enter email subject"
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <div class="mb-1 d-flex justify-space-between align-center">
              <span class="text-caption text-muted font-weight-black uppercase">Email Body</span>
              <span class="text-[10px] text-muted opacity-50">WYSIWYG EDITOR</span>
            </div>
            <CommonRichTextEditor
              v-model="form.body"
              class="mb-8"
            />
          </v-col>

          <!-- Signature Preview -->
          <v-col cols="12">
            <div class="mb-4 d-flex align-center ga-2">
              <v-icon color="primary" size="small">mdi-signature</v-icon>
              <span class="text-caption text-muted font-weight-black uppercase tracking-wider">Professional Signature Preview</span>
            </div>
            <v-card variant="tonal" class="rounded-xl border-dashed pa-6 bg-surface-variant overflow-hidden">
               <div class="signature-content">
                  <div class="text-subtitle-1 font-weight-black text-uppercase">{{ authStore.user?.name }}</div>
                  <div class="text-caption font-weight-bold mb-4 opacity-80 uppercase tracking-widest">
                    {{ authStore.user?.designation }} <span v-if="authStore.user?.department"> — {{ authStore.user?.department }}</span>
                  </div>

                  <div v-if="companyInfo" class="mt-4 pt-4 border-t-thin border-opacity-10">
                    <v-img 
                      v-if="companyInfo.logo" 
                      :src="getLogoUrl(companyInfo.logo)" 
                      max-height="32" 
                      class="mb-3" 
                      style="max-width: 120px"
                      contain
                      position="left center"
                    ></v-img>
                    
                    <div class="text-subtitle-2 font-weight-black mb-1 uppercase">{{ companyInfo.name }}</div>
                    
                    <div class="text-[11px] text-muted font-weight-bold uppercase mb-1">
                      {{ companyInfo.address }}<br>
                      {{ companyInfo.pincode }} {{ companyInfo.city }} {{ companyInfo.state }} {{ companyInfo.country }}
                    </div>

                    <div class="text-[11px] font-weight-bold text-primary mb-2">
                       Email: <span class="text-lowercase">{{ authStore.user?.email }}</span>
                    </div>

                    <div v-if="companyInfo.website" class="text-[11px] font-weight-bold text-primary mb-2">
                       <span class="text-lowercase">{{ companyInfo.website }}</span>
                    </div>

                    <div class="d-flex ga-4 mt-3">
                       <span v-if="companyInfo.facebook" class="text-[10px] font-weight-black text-primary border-b border-primary cursor-pointer pb-1">FACEBOOK</span>
                       <span v-if="companyInfo.instagram" class="text-[10px] font-weight-black text-primary border-b border-primary cursor-pointer pb-1">INSTAGRAM</span>
                       <span v-if="companyInfo.youtube" class="text-[10px] font-weight-black text-primary border-b border-primary cursor-pointer pb-1">YOUTUBE</span>
                       <span v-if="companyInfo.linkedin" class="text-[10px] font-weight-black text-primary border-b border-primary cursor-pointer pb-1">LINKEDIN</span>
                    </div>
                  </div>
               </div>
               
               <div class="position-absolute top-0 right-0 ma-4 opacity-10">
                 <v-icon size="64">mdi-check-decagram</v-icon>
               </div>
            </v-card>
            <p class="text-[10px] text-muted text-center mt-3 uppercase tracking-tighter">The signature will be appended to your email automatically.</p>
          </v-col>
        </v-row>

        <div class="d-flex justify-end pt-4">
          <v-btn
            color="primary"
            size="large"
            rounded="lg"
            class="px-12 font-weight-black"
            prepend-icon="mdi-send-outline"
            :loading="sending"
            :disabled="!isFormValid"
            type="submit"
          >
            SEND BULK EMAIL
          </v-btn>
        </div>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const api = useApi()
const authStore = useAuthStore()
const uiStore = useUiStore()
const config = useRuntimeConfig()

const sending = ref(false)
const targetCount = ref(0)
const companyInfo = ref<any>(null)

const form = reactive({
  type: 'leads',
  target_status: 'all',
  subject: '',
  body: '',
  random_email: ''
})

const statusOptions = [
  { title: 'ALL LEADS', value: 'all' },
  { title: 'NEW', value: 'new' },
  { title: 'CONTACTED', value: 'contacted' },
  { title: 'INTERESTED', value: 'interested' },
  { title: 'THINKING', value: 'thinking' },
  { title: 'DEMO SCHEDULED', value: 'demo_scheduled' },
  { title: 'NO RESPONSE', value: 'no_response' },
  { title: 'BUSY / CALLBACK', value: 'callback' },
  { title: 'CONVERTED', value: 'converted' },
  { title: 'LOST', value: 'lost' },
  { title: 'NOT INTERESTED', value: 'not_interested' }
]

const toPlaceholder = computed(() => {
  if (form.type === 'leads') {
    const status = statusOptions.find(o => o.value === form.target_status)?.title || 'Selected'
    return `Will be sent to all ${status} leads`
  }
  return form.random_email || 'Random Recipient'
})

const isFormValid = computed(() => {
  if (form.type === 'leads') {
    return form.subject && form.body && targetCount.value > 0
  }
  return form.subject && form.body && form.random_email
})

const fetchTargetCount = async () => {
  try {
    const res: any = await api.get('/bulk-emails/counts', {
      params: { status: form.target_status }
    })
    targetCount.value = res.data?.count ?? res.count ?? 0
  } catch (err) {
    console.error('Failed to fetch count')
  }
}

const handleSend = async () => {
  sending.value = true
  try {
    await api.post('/bulk-emails/send', {
      type: form.type,
      target_status: form.type === 'leads' ? form.target_status : null,
      subject: form.subject,
      body: form.body,
      recipient: form.type === 'random' ? form.random_email : null
    })
    uiStore.success('Bulk email sequence initiated successfully!')
    // Reset form
    form.subject = ''
    form.body = ''
    form.random_email = ''
  } catch (err: any) {
    uiStore.error(err.data?.message || 'Failed to send bulk email')
  } finally {
    sending.value = false
  }
}

const fetchCompanyInfo = async () => {
  try {
    const res: any = await api.get('/company')
    companyInfo.value = res.data
  } catch (err) {}
}

const getLogoUrl = (path: string) => {
  if (!path) return ''
  const base = config.public.apiBase.split('/api')[0]
  return `${base}/storage/${path}`
}

onMounted(() => {
  fetchTargetCount()
  fetchCompanyInfo()
})

definePageMeta({
  middleware: 'auth'
})
</script>

<style scoped>
.max-w-4xl {
  max-width: 900px;
  margin: 0 auto;
}
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
.bg-primary-lighten-5 {
  background: rgba(var(--v-theme-primary), 0.05);
}
.border-dashed {
  border: 1px dashed rgba(var(--v-theme-primary), 0.3) !important;
}
.border-t-thin {
  border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
}
</style>
