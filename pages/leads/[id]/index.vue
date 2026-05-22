<template>
  <v-container class="animate-fade">
    <div v-if="loading" class="d-flex flex-column align-center justify-center py-16">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="mt-4 text-muted">Loading lead profile...</p>
    </div>

    <div v-else-if="!lead" class="py-16 text-center">
      <v-icon size="64" color="error" class="mb-4">mdi-account-off</v-icon>
      <h1 class="text-h5 font-weight-black uppercase">Lead Not Found</h1>
      <v-btn color="primary" variant="text" class="mt-4 font-weight-bold" @click="navigateTo('/leads')">BACK TO LEADS</v-btn>
    </div>

    <div v-else>
      <!-- Header Area -->
      <v-row align="center" class="mb-6">
        <v-col cols="12" md="8" class="d-flex align-center ga-4">
          <v-btn
            icon="mdi-arrow-left"
            variant="tonal"
            rounded="xl"
            size="small"
            @click="navigateTo('/leads')"
          ></v-btn>
          <div>
            <h1 class="text-h4 font-weight-black uppercase d-flex align-center ga-2">
              {{ lead.name }}
              <v-chip :color="getStatusColor(lead.status)" size="x-small" label class="font-weight-black">
                {{ lead.status.toUpperCase() }}
              </v-chip>
            </h1>
            <p class="text-caption text-muted uppercase tracking-widest font-weight-bold">
              ID: #{{ lead.id }} • ADDED {{ timeAgo(lead.created_at).toUpperCase() }}
            </p>
          </div>
        </v-col>
        <v-col cols="12" md="4" class="d-flex justify-md-end ga-3">
          <v-btn
            v-if="lead.status !== 'converted'"
            color="primary"
            prepend-icon="mdi-school-outline"
            rounded="lg"
            class="font-weight-bold"
            @click="navigateTo(`/enrollments/create?lead_id=${lead.id}`)"
          >
            ENROLL STUDENT
          </v-btn>
          <v-btn
            v-if="authStore.isAdmin"
            variant="outlined"
            prepend-icon="mdi-pencil-outline"
            rounded="lg"
            class="font-weight-bold"
            @click="navigateTo(`/leads/${lead.id}/edit`)"
          >
            EDIT PROFILE
          </v-btn>
        </v-col>
      </v-row>

      <v-row>
        <!-- Left Column: Info Cards -->
        <v-col cols="12" md="4">
          <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6 mb-6">
            <h2 class="text-overline font-weight-black mb-4 text-primary tracking-widest">CONTACT INFORMATION</h2>
            <v-list bg-color="transparent" density="compact" class="pa-0">
              <v-list-item class="px-0 py-2">
                <template v-slot:prepend>
                  <v-avatar color="primary" variant="tonal" size="32" class="mr-3 rounded-lg">
                    <v-icon size="16">mdi-phone</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="text-subtitle-2 font-weight-bold">{{ lead.phone }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption">PHONE NUMBER</v-list-item-subtitle>
              </v-list-item>

              <v-list-item class="px-0 py-2">
                <template v-slot:prepend>
                  <v-avatar color="success" variant="tonal" size="32" class="mr-3 rounded-lg">
                    <v-icon size="16">mdi-email-outline</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="text-subtitle-2 font-weight-bold">{{ lead.email || 'N/A' }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption">EMAIL ADDRESS</v-list-item-subtitle>
              </v-list-item>

              <v-list-item class="px-0 py-2">
                <template v-slot:prepend>
                  <v-avatar color="green" variant="tonal" size="32" class="mr-3 rounded-lg">
                    <v-icon size="16">mdi-whatsapp</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="text-subtitle-2 font-weight-bold">WhatsApp</v-list-item-title>
                <v-list-item-subtitle class="text-caption">CLICK TO MESSAGE</v-list-item-subtitle>
                <template v-slot:append>
                  <v-btn
                    icon="mdi-whatsapp"
                    color="green"
                    variant="tonal"
                    size="small"
                    rounded="lg"
                    @click="openWhatsAppDialog"
                  ></v-btn>
                </template>
              </v-list-item>

              <v-list-item class="px-0 py-2">
                <template v-slot:prepend>
                  <v-avatar color="warning" variant="tonal" size="32" class="mr-3 rounded-lg">
                    <v-icon size="16">mdi-map-marker-outline</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="text-subtitle-2 font-weight-bold text-wrap">{{ lead.address || 'No address provided' }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption">STREET ADDRESS</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>

          <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6">
            <h2 class="text-overline font-weight-black mb-4 text-primary tracking-widest">QUALIFICATION & INTEREST</h2>
            <div class="d-flex justify-space-between mb-4 border-b border-opacity-25 pb-2">
              <span class="text-caption text-muted font-weight-bold uppercase">Type</span>
              <span class="text-caption font-weight-black uppercase text-primary">{{ lead.lead_type }}</span>
            </div>
            <div class="d-flex justify-space-between mb-4 border-b border-opacity-25 pb-2">
              <span class="text-caption text-muted font-weight-bold uppercase">Qualification</span>
              <span class="text-caption font-weight-black uppercase">{{ lead.qualification || 'N/A' }}</span>
            </div>
            <div class="d-flex justify-space-between mb-4 border-b border-opacity-25 pb-2">
              <span class="text-caption text-muted font-weight-bold uppercase">Experience</span>
              <span class="text-caption font-weight-black uppercase">{{ lead.experience_years ? `${lead.experience_years} Years` : 'Fresh' }}</span>
            </div>
          </v-card>

          <!-- Documents Card -->
          <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6 mt-6">
            <div class="d-flex align-center justify-space-between mb-4">
              <h2 class="text-overline font-weight-black text-primary tracking-widest mb-0">DOCUMENTS</h2>
              <v-btn
                icon="mdi-plus"
                variant="tonal"
                color="primary"
                size="x-small"
                rounded="lg"
                @click="docDialog = true"
              ></v-btn>
            </div>
            
            <div v-if="!leadDocuments.length" class="text-center py-6 opacity-50 border-dashed rounded-xl border-thin">
               <v-icon size="32" class="mb-2">mdi-file-outline</v-icon>
               <p class="text-[10px] font-weight-black uppercase">No documents uploaded</p>
            </div>

            <v-list v-else bg-color="transparent" density="compact" class="pa-0 ga-2 d-flex flex-column">
              <v-list-item v-for="doc in leadDocuments" :key="doc.id" class="px-3 py-2 rounded-lg bg-white-5 border-thin">
                 <template v-slot:prepend>
                   <v-avatar :color="getDocCategoryColor(doc.category)" variant="tonal" size="32" class="mr-3 rounded-lg">
                     <v-icon size="16">{{ getDocIcon(doc.category) }}</v-icon>
                   </v-avatar>
                 </template>
                 <v-list-item-title class="text-[11px] font-weight-black uppercase truncate">{{ doc.name }}</v-list-item-title>
                 <v-list-item-subtitle class="text-[9px] uppercase font-weight-bold opacity-50">{{ doc.category.replace('_', ' ') }}</v-list-item-subtitle>
                 <template v-slot:append>
                    <v-btn icon="mdi-download" variant="text" size="x-small" @click="downloadDocument(doc)"></v-btn>
                    <v-btn icon="mdi-delete-outline" variant="text" size="x-small" color="error" @click="deleteDocument(doc)"></v-btn>
                 </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <!-- Right Column: Timeline & Interactions -->
        <v-col cols="12" md="8">
          <!-- Interaction Form -->
          <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6 mb-6">
            <h2 class="text-subtitle-1 font-weight-black mb-4 uppercase d-flex align-center ga-2">
              <v-icon color="primary">mdi-phone-plus-outline</v-icon>
              Log New Interaction
            </h2>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-select
                  v-model="callForm.call_outcome"
                  :items="[
                    { title: 'SELECT OUTCOME', value: null, disabled: true },
                    { title: 'INTERESTED', value: 'interested' },
                    { title: 'THINKING', value: 'thinking' },
                    { title: 'DEMO SCHEDULED', value: 'demo_scheduled' },
                    { title: 'NO RESPONSE', value: 'no_response' },
                    { title: 'BUSY / CALLBACK', value: 'callback' },
                    { title: 'NOT INTERESTED', value: 'not_interested' },
                  ]"
                  item-title="title"
                  item-value="value"
                  label="OUTCOME"
                  variant="outlined"
                  density="compact"
                  class="mb-2"
                  placeholder="SELECT OUTCOME"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="callForm.next_follow_up"
                  type="date"
                  label="FOLLOW UP"
                  variant="outlined"
                  density="compact"
                  class="mb-2"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="callForm.notes"
                  label="INTERACTION NOTES"
                  variant="outlined"
                  density="compact"
                  rows="2"
                  hide-details
                ></v-textarea>
              </v-col>
            </v-row>
            <div class="d-flex justify-end mt-4">
              <v-btn
                color="primary"
                rounded="lg"
                class="font-weight-bold px-8"
                :loading="submittingLog"
                @click="submitCallLog"
              >
                SAVE LOG
              </v-btn>
            </div>
          </v-card>

          <!-- Activity History -->
          <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6 mb-6">
            <h2 class="text-subtitle-1 font-weight-black mb-6 uppercase d-flex align-center ga-2">
              <v-icon color="primary">mdi-history</v-icon>
              Activity History
            </h2>
            
            <div v-if="!lead.call_logs?.length" class="text-center py-12 opacity-50">
              <v-icon size="48" class="mb-4">mdi-timer-sand-empty</v-icon>
              <p class="text-overline font-weight-black">No recorded interactions yet</p>
            </div>

            <div v-else class="timeline-container">
              <div v-for="log in lead.call_logs" :key="log.id" class="timeline-item pb-8 pl-8 relative">
                <div class="timeline-dot" :class="log.channel === 'whatsapp' ? 'bg-green' : ''"></div>
                <div class="d-flex justify-space-between align-center mb-1">
                  <div class="d-flex align-center ga-2">
                    <v-icon size="14" :color="log.channel === 'whatsapp' ? 'green' : 'primary'">
                      {{ log.channel === 'whatsapp' ? 'mdi-whatsapp' : 'mdi-phone' }}
                    </v-icon>
                    <h4 class="text-subtitle-2 font-weight-black uppercase" :class="log.channel === 'whatsapp' ? 'text-green' : 'text-primary'">
                      {{ log.call_outcome }}
                    </h4>
                  </div>
                  <span class="text-[10px] text-muted font-weight-black uppercase">{{ formatDate(log.created_at) }}</span>
                </div>
                <v-card variant="tonal" class="pa-3 rounded-lg mb-2">
                  <p class="text-body-2">{{ log.notes || 'No detailed notes provided.' }}</p>
                </v-card>
                <div class="d-flex align-center ga-2 text-[10px] text-muted font-weight-bold uppercase">
                  <v-icon size="12">mdi-account-circle</v-icon>
                  Logged by {{ log.called_by_user?.name || 'System' }}
                </div>
              </div>
            </div>
          </v-card>

          <!-- Audit Trail -->
          <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6 mt-6">
            <h2 class="text-subtitle-1 font-weight-black mb-6 uppercase d-flex align-center ga-2">
              <v-icon color="primary">mdi-shield-check-outline</v-icon>
              Audit Trail (All Changes)
            </h2>
            
            <div v-if="loadingAudit" class="text-center py-8">
               <v-progress-circular indeterminate size="24" color="primary"></v-progress-circular>
            </div>

            <div v-else-if="!auditLogs.length" class="text-center py-12 opacity-50">
              <v-icon size="48" class="mb-4 text-primary">mdi-history</v-icon>
              <p class="text-[10px] font-weight-black uppercase">No structural changes recorded</p>
            </div>

            <div v-else class="timeline-container">
               <div v-for="log in auditLogs" :key="log.id" class="timeline-item pb-6 pl-8 relative">
                 <div class="timeline-dot shadow-primary-10"></div>
                 <div class="d-flex justify-space-between align-center mb-1">
                   <div class="d-flex align-center ga-2">
                     <v-icon size="14" :color="getActionConfig(log.action).color">{{ getActionConfig(log.action).icon }}</v-icon>
                     <h4 class="text-[11px] font-weight-black uppercase">{{ getActionConfig(log.action).label }}</h4>
                   </div>
                   <span class="text-[9px] text-muted font-weight-black opacity-50">{{ formatDate(log.created_at) }}</span>
                 </div>
                 
                 <div v-if="log.old_values || log.new_values" class="text-[10px] bg-white-5 pa-2 rounded-lg border-thin font-medium mt-1">
                    <div v-if="log.old_values" class="d-flex ga-2 align-center">
                       <span class="opacity-50">FROM:</span>
                       <span class="text-error">{{ formatAuditValue(log.old_values) }}</span>
                    </div>
                    <div class="d-flex ga-2 align-center">
                       <span class="opacity-50">TO:</span>
                       <span class="text-success">{{ formatAuditValue(log.new_values) }}</span>
                    </div>
                 </div>

                 <div class="text-[9px] text-muted font-weight-bold uppercase mt-1 opacity-50">
                   By {{ log.user?.name || 'System' }}
                 </div>
               </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- WhatsApp Template Selector Dialog -->
    <v-dialog v-model="waDialog" max-width="560">
      <v-card v-if="lead" class="rounded-xl border-thin bg-surface overflow-hidden">
        <div class="pa-6 border-b d-flex align-center ga-3">
          <v-avatar color="green" size="40" class="rounded-lg">
            <v-icon color="white">mdi-whatsapp</v-icon>
          </v-avatar>
          <div>
            <h3 class="text-subtitle-1 font-weight-black uppercase">Send WhatsApp</h3>
            <p class="text-caption opacity-50 font-weight-bold">to {{ lead.name }} ({{ lead.phone }})</p>
          </div>
        </div>

        <div class="pa-6">
          <v-select
            v-model="selectedTemplate"
            :items="waTemplates"
            item-title="name"
            item-value="id"
            label="MESSAGE TEMPLATE"
            variant="outlined"
            density="compact"
            class="mb-4"
          ></v-select>

          <v-textarea
            v-model="waMessage"
            label="MESSAGE PREVIEW"
            variant="outlined"
            density="compact"
            rows="5"
            hint="You can edit this message before sending"
            persistent-hint
          ></v-textarea>
        </div>

        <v-card-actions class="pa-6 pt-0 d-flex ga-3">
          <v-btn variant="text" class="font-weight-bold" @click="waDialog = false">CANCEL</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="green"
            prepend-icon="mdi-whatsapp"
            class="font-weight-bold px-8"
            rounded="lg"
            @click="sendWhatsApp"
          >SEND MESSAGE</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Document Upload Dialog -->
    <v-dialog v-model="docDialog" max-width="460">
      <v-card class="rounded-xl border-thin bg-surface overflow-hidden">
        <div class="pa-6 border-b d-flex align-center ga-3">
          <v-avatar color="primary" size="40" class="rounded-lg">
            <v-icon color="white">mdi-file-upload</v-icon>
          </v-avatar>
          <div>
            <h3 class="text-subtitle-1 font-weight-black uppercase">Upload Document</h3>
            <p class="text-caption opacity-50 font-weight-bold">Maximum file size: 5MB</p>
          </div>
        </div>

        <div class="pa-6">
          <v-row dense>
            <v-col cols="12">
               <v-text-field
                 v-model="docForm.name"
                 label="DOCUMENT NAME"
                 variant="outlined"
                 density="compact"
                 hint="e.g. Aadhar Card, Resume 2024"
                 persistent-hint
                 class="mb-4"
               ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="docForm.category"
                :items="docCategories"
                item-title="title"
                item-value="value"
                label="CATEGORY"
                variant="outlined"
                density="compact"
                class="mb-4"
              ></v-select>
            </v-col>
            <v-col cols="12">
               <v-file-input
                 v-model="docForm.file"
                 label="SELECT FILE"
                 variant="outlined"
                 density="compact"
                 prepend-icon=""
                 prepend-inner-icon="mdi-paperclip"
                 accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                 show-size
               ></v-file-input>
            </v-col>
          </v-row>
        </div>

        <v-card-actions class="pa-6 pt-0 d-flex ga-3">
          <v-btn variant="text" class="font-weight-bold" @click="closeDocDialog">CANCEL</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="elevated"
            class="font-weight-bold px-8"
            rounded="lg"
            :loading="uploadingDoc"
            @click="handleUpload"
          >UPLOAD NOW</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
const route = useRoute()
const api = useApi()
const uiStore = useUiStore()
const authStore = useAuthStore()

const lead = ref<any>(null)
const loading = ref(true)
const submittingLog = ref(false)

const auditLogs = ref<any[]>([])
const loadingAudit = ref(false)

const callForm = reactive({
  call_outcome: null as string | null,
  notes: '',
  next_follow_up: ''
})

// WhatsApp Logic
const waDialog = ref(false)
const selectedTemplate = ref('greeting')
const waMessage = ref('')

const waTemplates = computed(() => [
  { id: 'greeting', name: '👋 Initial Greeting' },
  { id: 'followup', name: '🔄 Follow-Up Reminder' },
  { id: 'demo', name: '🎓 Demo Invitation' },
  { id: 'details', name: '📚 Course Details' },
  { id: 'checkin', name: '💬 Quick Check-In' },
  { id: 'custom', name: '✏️ Custom Message' },
])

const getTemplateBody = (id: string) => {
  const name = lead.value?.name || 'there'
  const course = lead.value?.interested_course?.name || 'our courses'
  const bde = authStore.user?.name || 'Team'

  switch (id) {
    case 'greeting':
      return `Hi ${name}! 👋 I'm ${bde} from Elements HR. I noticed your interest in ${course}. Would you like to know more about the program?`
    case 'followup':
      return `Hi ${name}, hope you're doing well! Just following up on our previous conversation about ${course}. Do you have any questions I can help with?`
    case 'demo':
      return `Hi ${name}! 🎓 We'd love to invite you for a free demo session of our ${course} program. Would you be available this week? Let me know your preferred date and time.`
    case 'details':
      return `Hi ${name}, here are the details for ${course}:\n\n📚 Program designed for career growth\n💰 Affordable fee structure\n📅 Next batch starting soon!\n\nShall I reserve a seat for you?`
    case 'checkin':
      return `Hi ${name}, quick check-in! 😊 Have you had a chance to think about the ${course} program? Happy to answer any questions.`
    case 'custom':
      return ''
    default:
      return ''
  }
}

watch(selectedTemplate, (val) => {
  waMessage.value = getTemplateBody(val)
})

const openWhatsAppDialog = () => {
  waMessage.value = getTemplateBody(selectedTemplate.value)
  waDialog.value = true
}

const sendWhatsApp = async () => {
  const phone = lead.value.phone?.replace(/[^0-9]/g, '')
  if (!phone) {
    uiStore.error('No valid phone number for this lead')
    return
  }

  const fullPhone = phone.length === 10 ? `91${phone}` : phone
  const waUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(waMessage.value)}`
  window.open(waUrl, '_blank')

  try {
    await api.post(`/leads/${lead.value.id}/call-logs`, {
      call_outcome: 'whatsapp_sent',
      channel: 'whatsapp',
      notes: `WhatsApp message sent:\n"${waMessage.value.substring(0, 200)}..."`,
      status: lead.value.status
    })
    uiStore.success('WhatsApp opened & interaction logged!')
    await fetchLead()
  } catch (err) {
    uiStore.warning('WhatsApp opened but failed to log interaction')
  }

  waDialog.value = false
}

// Document Management Logic
const docDialog = ref(false)
const uploadingDoc = ref(false)
const leadDocuments = ref<any[]>([])
const docForm = reactive({
  name: '',
  category: 'id_proof',
  file: null as File | null
})

const docCategories = [
  { title: 'ID PROOF', value: 'id_proof' },
  { title: 'CERTIFICATE', value: 'certificate' },
  { title: 'PHOTO', value: 'photo' },
  { title: 'RESUME', value: 'resume' },
  { title: 'OTHER', value: 'other' }
]

const getDocIcon = (cat: string) => {
  switch (cat) {
    case 'id_proof': return 'mdi-card-account-details-outline'
    case 'certificate': return 'mdi-certificate-outline'
    case 'photo': return 'mdi-camera-outline'
    case 'resume': return 'mdi-file-account-outline'
    default: return 'mdi-file-outline'
  }
}

const getDocCategoryColor = (cat: string) => {
  switch (cat) {
    case 'id_proof': return 'primary'
    case 'certificate': return 'amber'
    case 'photo': return 'purple'
    case 'resume': return 'success'
    default: return 'grey'
  }
}

const fetchDocuments = async () => {
    try {
        const res: any = await api.get(`/leads/${route.params.id}/documents`)
        leadDocuments.value = res.data || []
    } catch {}
}

const closeDocDialog = () => {
    docDialog.value = false
    docForm.name = ''
    docForm.category = 'id_proof'
    docForm.file = null
}

const handleUpload = async () => {
    let finalFile = docForm.file
    // Handle Vuetify array-like file input behavior
    if (Array.isArray(finalFile) && finalFile.length > 0) {
        finalFile = finalFile[0]
    }

    if (!finalFile || !docForm.name) {
        uiStore.error('Please provide a name and select a file')
        return
    }

    uploadingDoc.value = true
    try {
        const formData = new FormData()
        formData.append('file', finalFile as Blob)
        formData.append('name', docForm.name)
        formData.append('category', docForm.category)

        await api.post(`/leads/${route.params.id}/documents`, formData)
        
        uiStore.success('Document uploaded successfully')
        closeDocDialog()
        fetchDocuments()
    } catch (err: any) {
        uiStore.error(err.data?.message || 'Failed to upload document')
    } finally {
        uploadingDoc.value = false
    }
}

const downloadDocument = async (doc: any) => {
    try {
        const res = await api.get(`/documents/${doc.id}/download`, { responseType: 'blob' })
        const url = window.URL.createObjectURL(new Blob([res as any]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${doc.name}.${doc.file_type}`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    } catch (err) {
        uiStore.error('Failed to download document')
    }
}

const deleteDocument = async (doc: any) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    try {
        await api.delete(`/documents/${doc.id}`)
        uiStore.success('Document deleted')
        fetchDocuments()
    } catch (err) {
        uiStore.error('Failed to delete document')
    }
}

const actionConfig: Record<string, any> = {
  'lead.created':             { icon: 'mdi-plus-circle',        color: 'success',  label: 'created' },
  'lead.updated':             { icon: 'mdi-pencil',             color: 'info',     label: 'updated' },
  'lead.status_changed':      { icon: 'mdi-swap-horizontal',    color: 'primary',  label: 'stage changed' },
  'lead.assigned':            { icon: 'mdi-account-arrow-right',color: 'indigo',   label: 'assigned' },
  'lead.call_logged':         { icon: 'mdi-phone',              color: 'cyan',     label: 'interaction' },
  'lead.follow_up_snoozed':   { icon: 'mdi-clock-outline',      color: 'amber',    label: 'rescheduled' },
  'lead.follow_up_completed': { icon: 'mdi-check-circle',       color: 'success',  label: 'closed task' },
  'enrollment.created':       { icon: 'mdi-school',             color: 'success',  label: 'enrolled' },
}

const getActionConfig = (action: string) => actionConfig[action] || { icon: 'mdi-information', color: 'grey', label: action }

const formatAuditValue = (val: any) => {
   if (!val) return 'None'
   if (typeof val === 'object') return Object.entries(val).map(([k, v]) => `${k}: ${v}`).join(', ')
   return val
}

const fetchAuditLogs = async () => {
    loadingAudit.value = true
    try {
        const res: any = await api.get(`/activity-logs/model/Lead/${route.params.id}`)
        auditLogs.value = res.data.data
    } catch {} finally {
        loadingAudit.value = false
    }
}

const fetchLead = async () => {
  loading.value = true
  try {
    const res: any = await api.get(`/leads/${route.params.id}`)
    lead.value = res.data
  } catch (err) {
    uiStore.error('Failed to load lead details')
  } finally {
    loading.value = false
  }
}

const submitCallLog = async () => {
  if (!callForm.call_outcome) {
    uiStore.error('Please select an interaction outcome.')
    return
  }
  if (!callForm.notes) {
    uiStore.error('Please enter some notes.')
    return
  }
  
  submittingLog.value = true
  try {
    // We send status along with call_outcome to update the lead's current status
    const payload = {
      ...callForm,
      status: callForm.call_outcome
    }
    const res: any = await api.post(`/leads/${route.params.id}/call-logs`, payload)
    uiStore.success(res.message || 'Call log added')
    callForm.notes = ''
    callForm.next_follow_up = ''
    await fetchLead()
  } catch (err: any) {
    uiStore.error(err.data?.message || 'Failed to log call')
  } finally {
    submittingLog.value = false
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new': return 'blue'
    case 'contacted': return 'indigo'
    case 'interested': return 'success'
    case 'thinking': return 'amber'
    case 'no_response': return 'grey'
    case 'demo_scheduled': return 'blue-lighten-1'
    case 'callback': return 'cyan'
    case 'converted': return 'primary'
    case 'lost': return 'error'
    case 'not_interested': return 'deep-orange'
    default: return 'grey'
  }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const timeAgo = (dateStr: string) => {
  const date: any = new Date(dateStr)
  const now: any = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}M ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}H ago`
  return `${Math.floor(diffInSeconds / 86400)}D ago`
}

onMounted(() => {
  fetchLead()
  fetchAuditLogs()
  fetchDocuments()
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
.timeline-item::before {
  content: '';
  position: absolute;
  left: 3px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(var(--v-theme-primary), 0.1);
}
.timeline-dot {
  position: absolute;
  left: -2px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
  z-index: 1;
  box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.1);
}
.timeline-item:last-child::before {
  display: none;
}
</style>
