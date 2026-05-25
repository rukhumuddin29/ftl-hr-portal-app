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
        <p class="text-body-2 text-muted">Update profile details for {{ form.name || 'Loading...' }}.</p>
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
              <v-col cols="12" md="6">
                <v-text-field v-model="form.referred_by" label="REFERRED BY" variant="outlined" density="compact" hide-details="auto" class="mb-4"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="form.status" label="STATUS *" :items="['new', 'contacted', 'interested', 'thinking', 'demo_scheduled', 'no_response', 'callback', 'converted', 'lost', 'not_interested']" variant="outlined" density="compact" hide-details="auto" class="mb-4" required></v-select>
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
  status: 'new',
  notes: '',
  follow_up_date: '',
  custom_data: {} as Record<string, any>
})

const selectedLeadType = computed(() => {
  return leadTypes.value.find(t => t.id === form.lead_type_id)
})

let isInitialLoad = true

watch(() => form.lead_type_id, (newVal, oldVal) => {
  // Only reset custom data if it's a real user change, not the initial load
  if (!isInitialLoad && oldVal !== null) {
    form.custom_data = {}
  }
})

onMounted(async () => {
  try {
    const typesRes = await api.get('/leads/lead-types')
    leadTypes.value = typesRes.data
    
    const leadRes: any = await api.get(`/leads/${route.params.id}`)
    
    // Fill form
    if (leadRes.data) {
      const data = leadRes.data
      Object.keys(form).forEach(key => {
        if (data[key] !== undefined && key !== 'custom_data') {
          (form as any)[key] = data[key]
        }
      })
      
      if (data.custom_data) {
        form.custom_data = { ...data.custom_data }
      }
      
      // Special case for dates
      if (data.follow_up_date) {
        form.follow_up_date = data.follow_up_date.split('T')[0]
      }
    }
  } catch (err) {
    uiStore.error('Failed to load data')
  } finally {
    loadingLead.value = false
    // Next tick allow watch to know initial load is done
    setTimeout(() => { isInitialLoad = false }, 100)
  }
})

const handleSubmit = async () => {
  if (!form.name || !form.phone || !form.lead_type_id) {
    uiStore.error('Name, Phone and Category are required.')
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
