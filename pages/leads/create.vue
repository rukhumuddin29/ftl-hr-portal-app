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
        <p class="text-body-2 text-muted">Complete the profile for the prospect based on their category.</p>
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
                <v-select 
                  v-model="form.lead_type_id" 
                  label="LEAD CATEGORY *" 
                  :items="leadTypes" 
                  item-title="name" 
                  item-value="id"
                  variant="outlined" 
                  density="compact" 
                  hide-details="auto" 
                  class="mb-4" 
                  required
                ></v-select>
              </v-col>
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
              <v-col cols="12">
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
        </v-col>

        <!-- RIGHT COLUMN: Dynamic Fields & Interest -->
        <v-col cols="12" md="6">
          <v-card v-if="selectedLeadType" class="rounded-xl border-thin bg-surface elevation-0 pa-6 mb-6">
            <h2 class="text-subtitle-1 font-weight-black mb-6 uppercase text-primary d-flex align-center ga-2">
              <v-icon size="18">mdi-form-select</v-icon>
              {{ selectedLeadType.name }} Details
            </h2>
            
            <div v-if="!selectedLeadType.form_schema || !selectedLeadType.form_schema.length" class="text-muted text-caption">
              No specific fields configured for this lead type.
            </div>

            <v-row v-else dense>
              <v-col cols="12" v-for="(field, index) in selectedLeadType.form_schema" :key="index">
                <template v-if="field.type === 'text'">
                  <v-text-field v-model="form.custom_data[field.name]" :label="field.label + (field.required ? ' *' : '')" variant="outlined" density="compact" hide-details="auto" class="mb-4" :required="field.required"></v-text-field>
                </template>
                <template v-else-if="field.type === 'number'">
                  <v-text-field v-model="form.custom_data[field.name]" :label="field.label + (field.required ? ' *' : '')" type="number" variant="outlined" density="compact" hide-details="auto" class="mb-4" :required="field.required"></v-text-field>
                </template>
                <template v-else-if="field.type === 'date'">
                  <v-text-field v-model="form.custom_data[field.name]" :label="field.label + (field.required ? ' *' : '')" type="date" variant="outlined" density="compact" hide-details="auto" class="mb-4" :required="field.required"></v-text-field>
                </template>
                <template v-else-if="field.type === 'textarea'">
                  <v-textarea v-model="form.custom_data[field.name]" :label="field.label + (field.required ? ' *' : '')" variant="outlined" density="compact" rows="3" hide-details="auto" class="mb-4" :required="field.required"></v-textarea>
                </template>
                <template v-else-if="field.type === 'select'">
                  <v-select v-model="form.custom_data[field.name]" :label="field.label + (field.required ? ' *' : '')" :items="field.options" variant="outlined" density="compact" hide-details="auto" class="mb-4" :required="field.required"></v-select>
                </template>
              </v-col>
            </v-row>
          </v-card>

          <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6">
            <h2 class="text-subtitle-1 font-weight-black mb-6 uppercase text-primary d-flex align-center ga-2">
              <v-icon size="18">mdi-bullseye-arrow</v-icon>
              Interest & Remarks
            </h2>
            <v-row dense>
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

const leadTypes = ref<any[]>([])

const form = reactive({
  name: '',
  email: '',
  phone: '',
  alternate_phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  lead_type_id: null,
  source: '',
  referred_by: '',
  notes: '',
  follow_up_date: null,
  custom_data: {} as Record<string, any>
})

const selectedLeadType = computed(() => {
  return leadTypes.value.find(t => t.id === form.lead_type_id)
})

watch(() => form.lead_type_id, () => {
  // Reset custom data when lead type changes
  form.custom_data = {}
})

const dupeDialog = ref(false)
const detectedDuplicates = ref<any[]>([])
const forceCreate = ref(false)

onMounted(async () => {
  try {
    const res = await api.get('/leads/lead-types')
    leadTypes.value = res.data
    if (leadTypes.value.length > 0) {
      form.lead_type_id = leadTypes.value[0].id
    }
  } catch (err) {
    console.error('Failed to fetch lead types')
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
