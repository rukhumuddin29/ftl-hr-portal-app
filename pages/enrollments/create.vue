<template>
  <v-container class="max-w-4xl animate-fade">
    <div class="d-flex align-center ga-4 mb-8">
      <v-btn
        icon="mdi-arrow-left"
        variant="tonal"
        rounded="xl"
        @click="navigateTo('/leads')"
      ></v-btn>
      <div>
        <h1 class="text-h4 font-weight-black uppercase">New Enrollment</h1>
        <p class="text-body-2 text-muted">Convert a lead into an official student enrollment.</p>
      </div>
    </div>

    <div v-if="!lead && !loadingLead" class="pa-12 text-center bg-surface rounded-xl border-thin">
       <v-icon size="64" color="info" class="mb-4">mdi-account-question-outline</v-icon>
       <h2 class="text-h5 font-weight-bold">No Lead Selected</h2>
       <p class="text-muted mb-6">Please select a lead from the leads management page to enroll them.</p>
       <v-btn color="primary" @click="navigateTo('/leads')">GO TO LEADS</v-btn>
    </div>

    <v-form v-else-if="lead" @submit.prevent="handleSubmit">
      <!-- Lead Summary -->
      <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-8 mb-8 border-indigo">
        <div class="d-flex justify-space-between align-center">
          <div>
            <h3 class="text-h6 font-weight-black text-indigo-400">Prospect: {{ lead.name }}</h3>
            <p class="text-body-2 text-muted font-weight-bold uppercase">{{ lead.email || 'No email' }} • {{ lead.phone }}</p>
          </div>
          <div class="text-right">
             <span class="text-[10px] text-muted font-weight-black uppercase">Lead Status</span>
             <p class="text-subtitle-1 font-weight-black text-uppercase text-primary">{{ lead.status }}</p>
          </div>
        </div>
      </v-card>

      <!-- Document Verification Checklist -->
      <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-8 mb-8">
        <h2 class="text-subtitle-1 font-weight-black mb-4 uppercase text-primary d-flex align-center ga-2">
          <v-icon>mdi-file-check-outline</v-icon>
          Document Verification Checklist
        </h2>
        <div class="d-flex flex-wrap ga-4">
          <v-chip
            v-for="cat in checkCategories"
            :key="cat.value"
            :color="hasDoc(cat.value) ? 'success' : 'grey-lighten-2'"
            variant="tonal"
            class="font-weight-black"
          >
            <v-icon start size="16">
              {{ hasDoc(cat.value) ? 'mdi-check-circle' : 'mdi-alert-circle-outline' }}
            </v-icon>
            {{ cat.title }}
          </v-chip>
        </div>
        <p class="text-caption text-muted mt-3 font-weight-bold">
          Note: These documents are collected via the Lead Profile. Enrollment is not blocked if files are missing.
        </p>
      </v-card>

      <!-- Enrollment Details -->
      <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-8 mb-8">
        <h2 class="text-h6 font-weight-black mb-6 uppercase text-primary d-flex align-center ga-2">
          <v-icon>mdi-school-outline</v-icon>
          Course Selection
        </h2>
        
        <v-row>
          <v-col cols="12">
            <v-select
              v-model="form.course_id"
              label="SELECT COURSE *"
              :items="courses"
              item-title="name"
              item-value="id"
              variant="outlined"
              @update:model-value="onCourseSelect"
              required
              hide-details="auto"
              class="mb-4"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props" :subtitle="'₹' + item.raw.offer_price"></v-list-item>
              </template>
            </v-select>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-text-field
              :model-value="selectedCourse?.offer_price || 0"
              label="COURSE PRICE (STANDARD)"
              variant="outlined"
              readonly
              hide-details="auto"
              class="mb-4 opacity-70"
              prefix="₹"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.agreed_price"
              label="AGREED PRICE (₹) *"
              type="number"
              variant="outlined"
              required
              hide-details="auto"
              class="mb-4 font-weight-black text-h6"
              color="success"
              prefix="₹"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.start_date"
              label="START DATE"
              type="date"
              variant="outlined"
              hide-details="auto"
              class="mb-4"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.discount_reason"
              label="DISCOUNT REASON (IF ANY)"
              variant="outlined"
              placeholder="e.g. Bulk discount, referral"
              hide-details="auto"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card>

      <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-8 mb-8">
         <h2 class="text-h6 font-weight-black mb-4 uppercase text-primary d-flex align-center ga-2">
           <v-icon>mdi-comment-text-outline</v-icon>
           Internal Notes
         </h2>
         <v-textarea
           v-model="form.notes"
           variant="outlined"
           placeholder="Add any internal enrollment notes here..."
           hide-details="auto"
           rows="3"
         ></v-textarea>
      </v-card>

      <div class="d-flex justify-end ga-6 mt-8 pb-10">
        <v-btn
          variant="outlined"
          rounded="lg"
          class="px-8 font-weight-bold"
          @click="navigateTo(`/leads/${lead.id}`)"
        >
          CANCEL
        </v-btn>
        <v-btn
          color="primary"
          rounded="lg"
          class="px-8 font-weight-bold"
          type="submit"
          :loading="loading"
        >
          CONFIRM ENROLLMENT
        </v-btn>
      </div>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
const route = useRoute()
const api = useApi()
const uiStore = useUiStore()

const lead = ref<any>(null)
const courses = ref<any[]>([])
const loading = ref(false)
const loadingLead = ref(false)

const form = reactive({
  lead_id: null as number | null,
  course_id: null as number | null,
  agreed_price: 0,
  start_date: new Date().toISOString().split('T')[0],
  discount_reason: '',
  notes: ''
})

// Document Checklist Logic
const leadDocuments = ref<any[]>([])
const checkCategories = [
  { title: 'RESUME', value: 'resume' },
  { title: 'ID PROOF', value: 'id_proof' },
  { title: 'PHOTO', value: 'photo' },
  { title: 'CERTIFICATES', value: 'certificate' }
]

const hasDoc = (category: string) => {
  return leadDocuments.value.some(d => d.category === category)
}

const fetchLeadDocuments = async (id: number) => {
  try {
    const res: any = await api.get(`/leads/${id}/documents`)
    leadDocuments.value = res.data || []
  } catch {}
}

const selectedCourse = computed(() => {
  return courses.value.find(c => c.id === form.course_id)
})

const onCourseSelect = () => {
  if (selectedCourse.value) {
    form.agreed_price = selectedCourse.value.offer_price
  }
}

onMounted(async () => {
  const leadId = route.query.lead_id
  if (leadId) {
    loadingLead.value = true
    form.lead_id = parseInt(leadId as string)
    try {
      const lRes: any = await api.get(`/leads/${leadId}`)
      lead.value = lRes.data
      if (lead.value.interested_course_id) {
         form.course_id = lead.value.interested_course_id
      }
    } catch (err) {
      uiStore.error('Lead not found')
    } finally {
      loadingLead.value = false
    }
    fetchLeadDocuments(parseInt(leadId as string))
  }

  try {
    const cRes: any = await api.get('/courses?active=1')
    courses.value = cRes.data?.data || []
    if (form.course_id) onCourseSelect()
  } catch (err) {
    console.error('Failed to load courses')
  }
})

const handleSubmit = async () => {
  loading.value = true
  try {
    await api.post('/enrollments', form)
    uiStore.success('Student enrolled successfully!')
    navigateTo('/enrollments')
  } catch (err: any) {
    uiStore.error(err.data?.message || 'Failed to enroll student')
  } finally {
    loading.value = false
  }
}

definePageMeta({
  middleware: 'auth',
  permission: 'enrollments.create'
})
</script>

<style scoped>
.border-thin {
  border: 1px solid var(--border-color) !important;
}
.border-indigo {
  border-left: 4px solid var(--color-primary) !important;
}
.text-indigo-400 {
  color: var(--color-primary-light) !important;
}
.animate-fade {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
