<template>
  <v-container class="max-w-6xl animate-fade">
    <div class="d-flex align-center ga-4 mb-8">
      <v-btn
        icon="mdi-arrow-left"
        variant="tonal"
        rounded="xl"
        @click="navigateTo('/leads')"
      ></v-btn>
      <div>
        <h1 class="text-h4 font-weight-black uppercase">Create New Lead</h1>
        <p class="text-body-2 text-muted">Complete professional and educational profile for the prospect.</p>
      </div>
      <v-spacer></v-spacer>
      <v-btn
        variant="tonal"
        color="primary"
        prepend-icon="mdi-upload"
        rounded="lg"
        class="font-weight-bold"
        @click="navigateTo('/leads/bulk-import')"
      >
        IMPORT BULK
      </v-btn>
    </div>

    <v-form @submit.prevent="handleSubmit">
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
          </v-card>

          <!-- Post Grad -->
          <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6 mb-6">
            <h2 class="text-subtitle-1 font-weight-black mb-6 uppercase text-primary d-flex align-center ga-2">
              <v-icon size="18">mdi-school-outline</v-icon>
              Post Graduation
            </h2>
            <v-row dense>
              <v-col cols="12" md="6"><v-text-field v-model="form.pg_name" label="PG DEGREE" variant="outlined" density="compact" hide-details="auto" class="mb-2"></v-text-field></v-col>
              <v-col cols="12" md="6"><v-text-field v-model="form.pg_specialization" label="SPECIALIZATION" variant="outlined" density="compact" hide-details="auto" class="mb-2"></v-text-field></v-col>
              <v-col cols="12" md="4"><v-text-field v-model="form.pg_year" label="YEAR" type="number" variant="outlined" density="compact" hide-details="auto" class="mb-2"></v-text-field></v-col>
              <v-col cols="12" md="4"><v-text-field v-model="form.pg_percentage" label="%" type="number" step="0.01" variant="outlined" density="compact" hide-details="auto" class="mb-2"></v-text-field></v-col>
              <v-col cols="12" md="4"><v-text-field v-model="form.pg_grade" label="GRADE" variant="outlined" density="compact" hide-details="auto" class="mb-2"></v-text-field></v-col>
            </v-row>
          </v-card>

          <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6">
            <h2 class="text-subtitle-1 font-weight-black mb-6 uppercase text-primary d-flex align-center ga-2">
              <v-icon size="18">mdi-bullseye-arrow</v-icon>
              Interest & Remarks
            </h2>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-select v-model="form.interested_course_id" label="INTERESTED COURSE" :items="courses" item-title="name" item-value="id" variant="outlined" density="compact" hide-details="auto" class="mb-4"></v-select>
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

      <!-- Duplicate Warning Dialog -->
      <v-dialog v-model="dupeDialog" max-width="600px" persistent>
        <v-card class="rounded-xl border-thin border-warning-darken-2 bg-surface">
          <v-card-title class="pa-6 d-flex align-center ga-3 border-b text-warning">
            <v-icon>mdi-alert-decagram</v-icon>
            <span class="font-weight-black uppercase">Conflict Detected</span>
          </v-card-title>

          <v-card-text class="pa-6">
            <p class="text-body-2 mb-6">We found <strong>{{ detectedDuplicates.length }}</strong> existing lead(s) that match this profile. Please verify before creating a new entry.</p>
            
            <div v-for="dupe in detectedDuplicates" :key="dupe.lead.id" class="border rounded-xl pa-4 mb-4 bg-white-5">
               <div class="d-flex justify-space-between align-start mb-2">
                  <div class="font-weight-black text-primary">{{ dupe.lead.name }} — {{ dupe.lead.phone }}</div>
                  <v-chip size="x-small" :color="dupe.score >= 80 ? 'error' : 'warning'" label class="font-weight-black">{{ dupe.score }}% MATCH</v-chip>
               </div>
               <div class="text-[10px] text-muted font-weight-bold uppercase mb-3">
                  Status: {{ dupe.lead.status }} | Assigned to: {{ dupe.lead.assigned_to?.name || 'Unassigned' }}
               </div>
               <div class="d-flex ga-2">
                  <v-btn size="x-small" variant="tonal" prepend-icon="mdi-eye" @click="navigateTo(`/leads/${dupe.lead.id}`)">VIEW RECORD</v-btn>
                  <v-btn size="x-small" variant="tonal" color="primary" prepend-icon="mdi-account-arrow-right" @click="navigateTo(`/leads/${dupe.lead.id}`)">USE EXISTING</v-btn>
               </div>
            </div>
            
            <v-alert type="warning" variant="tonal" border="start" class="mt-2 text-caption font-weight-medium">
               To skip this check and create anyway, click 'CREATE REGARDLESS'.
            </v-alert>
          </v-card-text>

          <v-card-actions class="pa-6 border-t bg-surface-light">
             <v-btn variant="text" class="font-weight-bold" @click="dupeDialog = false">GO BACK</v-btn>
             <v-spacer></v-spacer>
             <v-btn color="warning" class="font-weight-black px-6" rounded="lg" @click="submitAnyway">CREATE REGARDLESS</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Form Actions -->
      <div class="d-flex justify-end ga-6 mt-8 pb-10">
        <v-btn variant="outlined" rounded="lg" class="px-8 font-weight-bold" @click="navigateTo('/leads')">CANCEL</v-btn>
        <v-btn color="primary" rounded="lg" class="px-8 font-weight-bold" type="submit" :loading="loading">CREATE LEAD</v-btn>
      </div>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
const api = useApi()
const uiStore = useUiStore()
const loading = ref(false)
const courses = ref<any[]>([])

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
  
  // Status & Assignment
  interested_course_id: null,
  notes: '',
  follow_up_date: null
})

const dupeDialog = ref(false)
const detectedDuplicates = ref<any[]>([])
const forceCreate = ref(false)

onMounted(async () => {
  try {
    const res: any = await api.get('/courses?active=1')
    courses.value = res.data?.data || []
  } catch (err) {
    console.error('Failed to load courses')
  }
})

const handleSubmit = async () => {
  loading.value = true
  try {
    const payload = { ...form }
    if (forceCreate.value) {
      // @ts-ignore
      payload.force_create = true
    }
    
    await api.post('/leads', payload)
    uiStore.success('Lead created successfully!')
    navigateTo('/leads')
  } catch (err: any) {
    if (err.status === 409) {
       detectedDuplicates.value = err.data.duplicates
       dupeDialog.value = true
    } else {
       uiStore.error(err.data?.message || 'Failed to create lead')
    }
  } finally {
    loading.value = false
  }
}

const submitAnyway = () => {
   forceCreate.value = true
   dupeDialog.value = false
   handleSubmit()
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

<style scoped>
.form-input {
  width: 100%;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-primary);
  outline: none;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

section.card {
  padding: 28px;
}
</style>
