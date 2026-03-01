<template>
  <v-container class="animate-fade">
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-weight-black uppercase">Placement Board</h1>
        <p class="text-caption text-muted uppercase tracking-widest font-weight-bold">
          Track student readiness and hiring pipeline success
        </p>
      </div>
    </div>

    <!-- Status Tabs -->
    <v-tabs v-model="activeTab" color="primary" class="mb-6 mb-md-8 border-b" density="compact" align-tabs="start">
      <v-tab value="ready" class="font-weight-black">READY FOR HIRED ({{ stats.ready }})</v-tab>
      <v-tab value="completed" class="font-weight-black">COURSE COMPLETED ({{ stats.completed }})</v-tab>
      <v-tab value="training" class="font-weight-black">IN TRAINING ({{ stats.training }})</v-tab>
      <v-tab value="placed" class="font-weight-black text-success">SUCCESSFULLY PLACED ({{ stats.placed }})</v-tab>
    </v-tabs>

    <v-row class="mb-4" dense>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="SEARCH STUDENT / BATCH"
          variant="outlined"
          density="compact"
          hide-details
          rounded="lg"
        ></v-text-field>
      </v-col>
    </v-row>

    <!-- Main Board -->
    <v-card class="rounded-xl border-thin bg-surface elevation-0">
      <v-data-table
        :headers="headers"
        :items="filteredEnrollments"
        :loading="loading"
        :search="search"
        hover
        class="bg-transparent"
      >
        <template v-slot:item.student="{ item }">
          <div class="d-flex align-center ga-3 my-2">
            <v-avatar color="primary" variant="tonal" rounded="lg" size="36">
              <v-icon size="18">mdi-account-school</v-icon>
            </v-avatar>
            <div>
              <div class="text-subtitle-2 font-weight-black uppercase">{{ item.lead?.name }}</div>
              <div class="text-[9px] text-muted font-weight-bold uppercase">{{ item.enrollment_number }}</div>
            </div>
          </div>
        </template>

        <template v-slot:item.course="{ item }">
           <div class="text-caption font-weight-black uppercase text-primary">{{ item.course?.name }}</div>
           <div class="text-[10px] opacity-50 font-weight-bold uppercase">STARTED {{ formatDateShort(item.start_date) }}</div>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="x-small" label class="font-weight-black uppercase">
            {{ item.status.replace('_', ' ') }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex ga-2">
            <!-- Mock Action -->
            <v-btn
              v-if="item.status !== 'placed'"
              variant="tonal"
              color="amber"
              prepend-icon="mdi-school-outline"
              size="x-small"
              rounded="lg"
              class="font-weight-bold px-3"
              @click="openMockDialog(item)"
            >MOCK</v-btn>

            <!-- Interview Action -->
            <v-btn
              v-if="item.status === 'mock_ready' || item.status === 'completed'"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-office-building-outline"
              size="x-small"
              rounded="lg"
              class="font-weight-bold px-3"
              @click="openInterviewDialog(item)"
            >INTERVIEW</v-btn>

            <!-- Placed Action -->
            <v-btn
              v-if="item.status !== 'placed'"
              variant="elevated"
              color="success"
              prepend-icon="mdi-briefcase-check"
              size="x-small"
              rounded="lg"
              class="font-weight-black px-3"
              @click="openPlacementDialog(item)"
            >HIRE</v-btn>
            
            <v-btn
              v-else
              variant="tonal"
              color="success"
              icon="mdi-eye"
              size="x-small"
              rounded="lg"
              @click="viewPlacementDetails(item)"
            ></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Mock Interview Dialog -->
    <v-dialog v-model="mockDialog" max-width="450">
      <v-card v-if="selectedStudent" class="rounded-xl border-thin bg-surface overflow-hidden">
        <div class="pa-6 border-b d-flex align-center ga-3 bg-amber-lighten-4 text-amber-darken-4">
          <v-avatar color="amber-darken-4" size="40" class="rounded-lg">
            <v-icon color="white">mdi-school</v-icon>
          </v-avatar>
          <div>
            <h3 class="text-subtitle-1 font-weight-black uppercase">Score Mock Interview</h3>
            <p class="text-caption opacity-80 font-weight-bold">{{ selectedStudent.lead?.name }}</p>
          </div>
        </div>
        <div class="pa-6">
           <v-row dense>
             <v-col cols="12" md="6">
                <v-text-field v-model="mockForm.scheduled_at" type="datetime-local" label="SESSION TIME" variant="outlined" density="compact"></v-text-field>
             </v-col>
             <v-col cols="12" md="6">
                <v-select v-model="mockForm.status" :items="['scheduled', 'completed', 'cancelled']" label="STATUS" variant="outlined" density="compact"></v-select>
             </v-col>
             <v-col cols="6">
                <v-slider v-model="mockForm.technical_score" min="0" max="10" step="1" thumb-label label="TECHNICAL (0-10)"></v-slider>
             </v-col>
             <v-col cols="6">
                <v-slider v-model="mockForm.behavioral_score" min="0" max="10" step="1" thumb-label label="SOFT SKILLS (0-10)"></v-slider>
             </v-col>
             <v-col cols="12">
                <v-textarea v-model="mockForm.notes" label="FEEDBACK NOTES" variant="outlined" density="compact" rows="3"></v-textarea>
             </v-col>
           </v-row>
        </div>
        <v-card-actions class="pa-6 pt-0">
          <v-btn variant="text" @click="mockDialog = false">CLOSE</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="amber-darken-4" variant="elevated" rounded="lg" class="font-weight-black px-6" :loading="saving" @click="saveMock">SAVE SCORES</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Student Interview Dialog -->
    <v-dialog v-model="interviewDialog" max-width="450">
       <v-card v-if="selectedStudent" class="rounded-xl border-thin bg-surface overflow-hidden">
        <div class="pa-6 border-b d-flex align-center ga-3 bg-primary text-white">
          <v-avatar color="white" size="40" class="rounded-lg">
            <v-icon color="primary">mdi-office-building</v-icon>
          </v-avatar>
          <div>
            <h3 class="text-subtitle-1 font-weight-black uppercase">Log Corporate Interview</h3>
            <p class="text-caption opacity-80 font-weight-bold">{{ selectedStudent.lead?.name }}</p>
          </div>
        </div>
        <div class="pa-6">
           <v-row dense>
             <v-col cols="12">
                 <v-autocomplete
                   v-model="interviewForm.company_id"
                   :items="companies"
                   item-title="name"
                   item-value="id"
                   label="HIRE PARTNER"
                   variant="outlined"
                   density="compact"
                 ></v-autocomplete>
             </v-col>
             <v-col cols="12">
                <v-text-field v-model="interviewForm.job_title" label="JOB DESIGNATION" variant="outlined" density="compact" placeholder="Software Engineer Trainee"></v-text-field>
             </v-col>
             <v-col cols="12" md="6">
                <v-text-field v-model="interviewForm.interview_date" type="date" label="INTERVIEW DATE" variant="outlined" density="compact"></v-text-field>
             </v-col>
             <v-col cols="12" md="6">
                <v-select
                   v-model="interviewForm.status"
                   :items="[
                     { title: 'SHORTLISTED', value: 'shortlisted' },
                     { title: 'ROUND 1', value: 'round_1' },
                     { title: 'ROUND 2', value: 'round_2' },
                     { title: 'SELECTED', value: 'selected' },
                     { title: 'REJECTED', value: 'rejected' }
                   ]"
                   item-title="title"
                   item-value="value"
                   label="ROUND STATUS"
                   variant="outlined"
                   density="compact"
                 ></v-select>
             </v-col>
             <v-col cols="12">
                <v-textarea v-model="interviewForm.notes" label="INTERVIEW NOTES" variant="outlined" density="compact" rows="2"></v-textarea>
             </v-col>
           </v-row>
        </div>
        <v-card-actions class="pa-6 pt-0">
          <v-btn variant="text" @click="interviewDialog = false">CLOSE</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="elevated" rounded="lg" class="font-weight-black px-6" :loading="saving" @click="saveInterview">LOG INTERVIEW</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Placement Success Dialog -->
    <v-dialog v-model="placementDialog" max-width="500">
       <v-card v-if="selectedStudent" class="rounded-xl border-thin bg-surface overflow-hidden">
        <div class="pa-6 border-b d-flex align-center ga-3 bg-success text-white">
          <v-avatar color="white" size="40" class="rounded-lg">
            <v-icon color="success">mdi-trophy-variant</v-icon>
          </v-avatar>
          <div>
            <h3 class="text-subtitle-1 font-weight-black uppercase">Finalize Placement</h3>
            <p class="text-caption opacity-80 font-weight-bold">CONGRATULATIONS TO {{ selectedStudent.lead?.name }}! 🎉</p>
          </div>
        </div>
        <div class="pa-6">
           <v-row dense>
             <v-col cols="12">
                 <v-autocomplete
                   v-model="placementForm.company_id"
                   :items="companies"
                   item-title="name"
                   item-value="id"
                   label="HIRED AT (COMPANY)"
                   variant="outlined"
                   density="compact"
                 ></v-autocomplete>
             </v-col>
             <v-col cols="12">
                <v-text-field v-model="placementForm.designation" label="FINAL DESIGNATION" variant="outlined" density="compact" placeholder="Full Stack Developer"></v-text-field>
             </v-col>
             <v-col cols="12" md="6">
                <v-text-field v-model="placementForm.ctc_annual" label="ANNUAL PACKAGE (CTC)" variant="outlined" density="compact" prefix="₹" type="number"></v-text-field>
             </v-col>
             <v-col cols="12" md="6">
                <v-text-field v-model="placementForm.join_date" type="date" label="JOINING DATE" variant="outlined" density="compact"></v-text-field>
             </v-col>
             <v-col cols="12" md="6">
                <v-file-input v-model="placementForm.offer_letter" label="OFFER LETTER (PDF)" variant="outlined" density="compact" prepend-icon="" prepend-inner-icon="mdi-paperclip" accept="application/pdf" show-size></v-file-input>
             </v-col>
             <v-col cols="12" md="6">
                <v-file-input v-model="placementForm.photo" label="CANDIDATE PHOTO" variant="outlined" density="compact" prepend-icon="" prepend-inner-icon="mdi-camera" accept="image/*" show-size></v-file-input>
             </v-col>
           </v-row>
        </div>
        <v-card-actions class="pa-6 pt-0">
          <v-btn variant="text" @click="placementDialog = false">CLOSE</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="success" variant="elevated" rounded="lg" class="font-weight-black px-8 shadow-success-20" :loading="saving" @click="savePlacement">FINALIZE HIRED</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
const api = useApi()
const uiStore = useUiStore()

const enrollments = ref([])
const companies = ref([])
const loading = ref(false)
const search = ref('')
const activeTab = ref('ready')

const stats = computed(() => {
  const list = Array.isArray(enrollments.value) ? enrollments.value : []
  return {
    training: list.filter(e => e.status === 'enrolled').length,
    completed: list.filter(e => e.status === 'completed').length,
    ready: list.filter(e => e.status === 'mock_ready').length,
    placed: list.filter(e => e.status === 'placed').length,
  }
})

const headers = [
  { title: 'STUDENT', key: 'student', align: 'start' },
  { title: 'COURSE', key: 'course' },
  { title: 'CURRENT STATUS', key: 'status' },
  { title: 'ACTIONS', key: 'actions', sortable: false, align: 'end' }
]

const filteredEnrollments = computed(() => {
  const list = Array.isArray(enrollments.value) ? enrollments.value : []
  if (activeTab.value === 'ready') return list.filter(e => e.status === 'mock_ready')
  if (activeTab.value === 'completed') return list.filter(e => e.status === 'completed')
  if (activeTab.value === 'training') return list.filter(e => e.status === 'enrolled')
  if (activeTab.value === 'placed') return list.filter(e => e.status === 'placed')
  return list
})

const fetchEnrollments = async () => {
    loading.value = true
    try {
        const res: any = await api.get('/enrollments')
        enrollments.value = res.data
    } catch {
        uiStore.error('Failed to load students')
    } finally {
        loading.value = false
    }
}

const fetchCompanies = async () => {
    const res: any = await api.get('/hiring-companies')
    companies.value = res.data
}

// Dialogs & Forms
const mockDialog = ref(false)
const interviewDialog = ref(false)
const placementDialog = ref(false)
const selectedStudent = ref(null)
const saving = ref(false)

const mockForm = reactive({
    scheduled_at: '',
    status: 'completed',
    technical_score: 5,
    behavioral_score: 5,
    notes: ''
})

const interviewForm = reactive({
    company_id: null,
    job_title: '',
    interview_date: '',
    status: 'shortlisted',
    notes: ''
})

const placementForm = reactive({
    company_id: null,
    ctc_annual: '',
    join_date: '',
    designation: '',
    offer_letter: null,
    photo: null
})

const openMockDialog = (item) => {
    selectedStudent.value = item
    mockDialog.value = true
}

const openInterviewDialog = (item) => {
    selectedStudent.value = item
    interviewDialog.value = true
}

const openPlacementDialog = (item) => {
    selectedStudent.value = item
    placementDialog.value = true
}

const saveMock = async () => {
    saving.value = true
    try {
        await api.post(`/placements/${selectedStudent.value.id}/mock`, mockForm)
        uiStore.success('Mock evaluation saved')
        mockDialog.value = false
        fetchEnrollments()
    } catch (err: any) {
        uiStore.error('Failed to save scores')
    } finally {
        saving.value = false
    }
}

const saveInterview = async () => {
    if (!interviewForm.company_id) return uiStore.error('Please select a company')
    saving.value = true
    try {
        await api.post(`/placements/${selectedStudent.value.id}/interview`, interviewForm)
        uiStore.success('Interview entry added')
        interviewDialog.value = false
        fetchEnrollments()
    } catch (err: any) {
        uiStore.error('Failed to save record')
    } finally {
        saving.value = false
    }
}

const savePlacement = async () => {
    if (!placementForm.company_id) return uiStore.error('Select hiring company')
    saving.value = true
    try {
        const formData = new FormData()
        Object.entries(placementForm).forEach(([key, value]) => {
            if (value !== null) {
                if (key === 'offer_letter' && Array.isArray(value)) formData.append(key, value[0])
                else if (key === 'photo' && Array.isArray(value)) formData.append(key, value[0])
                else formData.append(key, value as any)
            }
        })

        await api.post(`/placements/${selectedStudent.value.id}/success`, formData)
        uiStore.success('Success! Student marked as Hired.')
        placementDialog.value = false
        fetchEnrollments()
    } catch (err: any) {
        uiStore.error('Placement update failed')
    } finally {
        saving.value = false
    }
}

const formatDateShort = (d) => {
    if (!d) return 'N/A'
    return new Date(d).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

const getStatusColor = (s) => {
    switch (s) {
        case 'enrolled': return 'blue'
        case 'completed': return 'amber'
        case 'mock_ready': return 'purple'
        case 'placed': return 'success'
        default: return 'grey'
    }
}

onMounted(() => {
    fetchEnrollments()
    fetchCompanies()
})

definePageMeta({ middleware: 'auth' })
</script>

<style scoped>
.shadow-success-20 {
    box-shadow: 0 4px 14px 0 rgba(var(--v-theme-success), 0.39) !important;
}
</style>
