<template>
  <v-container class="max-w-6xl animate-fade">
    <div class="d-flex align-center ga-4 mb-8">
      <v-btn
        icon="mdi-arrow-left"
        variant="tonal"
        rounded="xl"
        size="small"
        @click="navigateTo(`/leads/${route.params.id}`)"
      ></v-btn>
      <div>
        <h1 class="text-h4 font-weight-black uppercase">Edit Lead Profile</h1>
        <p class="text-body-2 text-muted">Update professional and educational profile for {{ form.name || 'Loading...' }}.</p>
      </div>
      <v-spacer></v-spacer>
      <div v-if="!loadingLead" class="d-flex ga-3">
        <v-btn 
          variant="outlined" 
          rounded="lg" 
          class="px-8 font-weight-bold" 
          @click="navigateTo(`/leads/${route.params.id}`)"
        >
          CANCEL
        </v-btn>
        <v-btn 
          color="primary" 
          rounded="lg" 
          class="px-8 font-weight-bold" 
          :loading="saving"
          @click="handleSubmit"
        >
          UPDATE LEAD
        </v-btn>
      </div>
    </div>

    <v-form v-if="!loadingLead" @submit.prevent="handleSubmit">
      <v-row>
        <!-- LEFT COLUMN: Personal & Address -->
        <v-col cols="12" md="6">
          <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6 mb-6">
            <h2 class="text-subtitle-1 font-weight-black mb-6 uppercase text-primary d-flex align-center ga-2">
              <v-icon size="18">mdi-account-circle-outline</v-icon>
              Basic Information
            </h2>
            <v-row dense>
              <v-col cols="12">
                <v-text-field v-model="form.name" label="FULL NAME *" variant="outlined" density="compact" hide-details="auto" class="mb-4" required></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.phone" label="PHONE *" variant="outlined" density="compact" hide-details="auto" class="mb-4" required></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.alternate_phone" label="ALT PHONE" variant="outlined" density="compact" hide-details="auto" class="mb-4"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="form.email" label="EMAIL ADDRESS" type="email" variant="outlined" density="compact" hide-details="auto" class="mb-4"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="form.lead_type" label="LEAD TYPE *" :items="['student', 'professional', 'other']" variant="outlined" density="compact" hide-details="auto" class="mb-4" required></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.referred_by" label="REFERRED BY" variant="outlined" density="compact" hide-details="auto" class="mb-4"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select v-model="form.status" label="STATUS *" :items="['new', 'contacted', 'interested', 'converted', 'lost']" variant="outlined" density="compact" hide-details="auto" class="mb-4" required></v-select>
              </v-col>
            </v-row>
          </v-card>

          <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6 mb-6">
            <h2 class="text-subtitle-1 font-weight-black mb-6 uppercase text-primary d-flex align-center ga-2">
              <v-icon size="18">mdi-map-marker-outline</v-icon>
              Address Details
            </h2>
            <v-row dense>
              <v-col cols="12">
                <v-textarea v-model="form.address" label="STREET ADDRESS" variant="outlined" density="compact" rows="2" hide-details="auto" class="mb-4"></v-textarea>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="form.city" label="CITY" variant="outlined" density="compact" hide-details="auto" class="mb-4"></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="form.state" label="STATE" variant="outlined" density="compact" hide-details="auto" class="mb-4"></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="form.pincode" label="PINCODE" variant="outlined" density="compact" hide-details="auto" class="mb-4"></v-text-field>
              </v-col>
            </v-row>
          </v-card>

          <v-card v-if="form.lead_type !== 'student'" class="rounded-xl border-thin bg-surface elevation-0 pa-6">
            <h2 class="text-subtitle-1 font-weight-black mb-6 uppercase text-primary d-flex align-center ga-2">
              <v-icon size="18">mdi-briefcase-outline</v-icon>
              Professional Background
            </h2>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.current_company" label="CURRENT COMPANY" variant="outlined" density="compact" hide-details="auto" class="mb-4"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.current_designation" label="DESIGNATION" variant="outlined" density="compact" hide-details="auto" class="mb-4"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.experience_years" label="EXPERIENCE (YEARS)" type="number" variant="outlined" density="compact" hide-details="auto" class="mb-4"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="form.current_skills" label="KEY SKILLS" variant="outlined" density="compact" rows="2" hide-details="auto" placeholder="e.g. Java, Python, Sales..."></v-textarea>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <!-- RIGHT COLUMN: Education -->
        <v-col cols="12" md="6">
          <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6 mb-6">
            <h2 class="text-subtitle-1 font-weight-black mb-6 uppercase text-primary d-flex align-center ga-2">
              <v-icon size="18">mdi-school-outline</v-icon>
              Education History
            </h2>
            
            <!-- 10th Standard -->
            <div class="mb-4">
              <div class="text-[10px] font-weight-black text-muted mb-2 uppercase border-b pb-1">10th Standard / School</div>
              <v-row dense>
                <v-col cols="12" md="6"><v-text-field v-model="form.school_name" label="SCHOOL NAME" variant="outlined" density="compact" hide-details="auto" class="mb-2"></v-text-field></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="form.tenth_board" label="BOARD" variant="outlined" density="compact" hide-details="auto" class="mb-2"></v-text-field></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="form.tenth_year" label="YEAR" type="number" variant="outlined" density="compact" hide-details="auto" class="mb-2"></v-text-field></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="form.tenth_percentage" label="%" type="number" step="0.01" variant="outlined" density="compact" hide-details="auto" class="mb-2"></v-text-field></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="form.tenth_grade" label="GRADE" variant="outlined" density="compact" hide-details="auto" class="mb-2"></v-text-field></v-col>
              </v-row>
            </div>

            <!-- Inter/12th -->
            <div class="mb-4">
              <div class="text-[10px] font-weight-black text-muted mb-2 uppercase border-b pb-1">Inter / 12th Standard</div>
              <v-row dense>
                <v-col cols="12" md="6"><v-text-field v-model="form.inter_college" label="COLLEGE NAME" variant="outlined" density="compact" hide-details="auto" class="mb-2"></v-text-field></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="form.inter_stream" label="STREAM" variant="outlined" density="compact" hide-details="auto" class="mb-2"></v-text-field></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="form.inter_year" label="YEAR" type="number" variant="outlined" density="compact" hide-details="auto" class="mb-2"></v-text-field></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="form.inter_percentage" label="%" type="number" step="0.01" variant="outlined" density="compact" hide-details="auto" class="mb-2"></v-text-field></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="form.inter_grade" label="GRADE" variant="outlined" density="compact" hide-details="auto" class="mb-2"></v-text-field></v-col>
              </v-row>
            </div>

            <!-- Degree -->
            <div class="mb-4">
              <div class="text-[10px] font-weight-black text-muted mb-2 uppercase border-b pb-1">Undergraduate Degree</div>
              <v-row dense>
                <v-col cols="12" md="6"><v-text-field v-model="form.degree_name" label="DEGREE" variant="outlined" density="compact" hide-details="auto" class="mb-2" placeholder="e.g. B.Tech"></v-text-field></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="form.degree_specialization" label="SPECIALIZATION" variant="outlined" density="compact" hide-details="auto" class="mb-2"></v-text-field></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="form.degree_college" label="COLLEGE" variant="outlined" density="compact" hide-details="auto" class="mb-2"></v-text-field></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="form.degree_university" label="UNIVERSITY" variant="outlined" density="compact" hide-details="auto" class="mb-2"></v-text-field></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="form.degree_year" label="YEAR" type="number" variant="outlined" density="compact" hide-details="auto" class="mb-2"></v-text-field></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="form.degree_percentage" label="%" type="number" step="0.01" variant="outlined" density="compact" hide-details="auto" class="mb-2"></v-text-field></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="form.degree_grade" label="GRADE" variant="outlined" density="compact" hide-details="auto" class="mb-2"></v-text-field></v-col>
              </v-row>
            </div>

            <!-- Post Grad -->
            <div>
              <div class="text-[10px] font-weight-black text-muted mb-2 uppercase border-b pb-1">Post Graduation</div>
              <v-row dense>
                <v-col cols="12" md="6"><v-text-field v-model="form.pg_name" label="PG DEGREE" variant="outlined" density="compact" hide-details="auto" class="mb-2"></v-text-field></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="form.pg_specialization" label="SPECIALIZATION" variant="outlined" density="compact" hide-details="auto" class="mb-2"></v-text-field></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="form.pg_year" label="YEAR" type="number" variant="outlined" density="compact" hide-details="auto" class="mb-2"></v-text-field></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="form.pg_percentage" label="%" type="number" step="0.01" variant="outlined" density="compact" hide-details="auto" class="mb-2"></v-text-field></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="form.pg_grade" label="GRADE" variant="outlined" density="compact" hide-details="auto" class="mb-2"></v-text-field></v-col>
              </v-row>
            </div>
          </v-card>

          <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6">
            <h2 class="text-subtitle-1 font-weight-black mb-6 uppercase text-primary d-flex align-center ga-2">
              <v-icon size="18">mdi-bullseye-arrow</v-icon>
              Interest & Remarks
            </h2>
            <v-row dense>
              <v-col cols="12" md="6">
                <!-- Course removed -->
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.source" label="LEAD SOURCE" variant="outlined" density="compact" hide-details="auto" class="mb-4" placeholder="e.g. Facebook"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.follow_up_date" label="FOLLOW UP DATE" type="date" variant="outlined" density="compact" hide-details="auto" class="mb-4"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="form.notes" label="INTERNAL REMARKS" variant="outlined" density="compact" rows="2" hide-details="auto" placeholder="Any additional comments..."></v-textarea>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-form>

    <v-row v-if="loadingLead" class="py-16">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-4 text-muted">Loading lead evaluation data...</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const route = useRoute()
const api = useApi()
const uiStore = useUiStore()
const loadingLead = ref(true)
const saving = ref(false)

const form = reactive({
  name: '',
  email: '',
  phone: '',
  alternate_phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  lead_type: 'student',
  source: '',
  referred_by: '',
  status: 'new',
  
  // Education
  school_name: '',
  tenth_year: null,
  tenth_board: '',
  tenth_percentage: null,
  tenth_grade: '',
  
  inter_college: '',
  inter_year: null,
  inter_board: '',
  inter_stream: '',
  inter_percentage: null,
  inter_grade: '',
  
  degree_college: '',
  degree_year: null,
  degree_name: '',
  degree_specialization: '',
  degree_university: '',
  degree_percentage: null,
  degree_grade: '',
  
  pg_college: '',
  pg_year: null,
  pg_name: '',
  pg_specialization: '',
  pg_university: '',
  pg_percentage: null,
  pg_grade: '',
  
  // Professional
  current_company: '',
  current_designation: '',
  experience_years: null,
  current_skills: '',
  
  // Interest
  notes: '',
  follow_up_date: ''
})

onMounted(async () => {
  try {
    const leadRes: any = await api.get(`/leads/${route.params.id}`)
    
    // Fill form
    if (leadRes.data) {
      const data = leadRes.data
      Object.keys(form).forEach(key => {
        if (data[key] !== undefined) {
          (form as any)[key] = data[key]
        }
      })
      // Special case for dates
      if (data.follow_up_date) {
        form.follow_up_date = data.follow_up_date.split('T')[0]
      }
    }
  } catch (err) {
    uiStore.error('Failed to load data')
    // navigateTo('/leads')
  } finally {
    loadingLead.value = false
  }
})

const handleSubmit = async () => {
  if (!form.name || !form.phone) {
    uiStore.error('Name and Phone are required.')
    return
  }
  
  saving.value = true
  try {
    await api.put(`/leads/${route.params.id}`, form)
    uiStore.success('Lead updated successfully!')
    navigateTo(`/leads/${route.params.id}`)
  } catch (err: any) {
    uiStore.error(err.data?.message || 'Failed to update lead')
  } finally {
    saving.value = false
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
  border: 1px solid var(--border-color) !important;
}
</style>
