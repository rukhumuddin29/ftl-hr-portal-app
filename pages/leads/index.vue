<template>
  <v-row class="animate-fade">
    <v-col cols="12" class="d-flex align-center justify-space-between mb-4">
      <div>
        <h1 class="text-h4 font-weight-black">LEAD MANAGEMENT</h1>
        <p class="text-body-2 text-muted">Track and manage your center's potential students.</p>
      </div>
      <div class="d-flex ga-3">
        <v-btn
          v-if="authStore.isAdmin"
          variant="outlined"
          color="primary"
          prepend-icon="mdi-account-arrow-right"
          height="48"
          class="font-weight-bold tracking-widest px-6"
          @click="openAssignDialog"
        >
          ASSIGN LEADS
        </v-btn>
        <v-btn
          variant="outlined"
          color="primary"
          prepend-icon="mdi-view-column-outline"
          height="48"
          class="font-weight-bold tracking-widest px-6"
          @click="navigateTo('/leads/pipeline')"
        >
          PIPELINE VIEW
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          height="48"
          class="font-weight-bold tracking-widest px-6"
          @click="navigateTo('/leads/create')"
        >
          ADD NEW LEAD
        </v-btn>
      </div>
    </v-col>

    <!-- Filters -->
    <v-col cols="12">
      <v-card class="pa-4 rounded-xl border-thin bg-surface elevation-0">
        <v-row dense align="center">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="SEARCH LEADS"
              variant="solo"
              flat
              hide-details
              density="compact"
              class="rounded-lg"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="statusFilter"
              :items="[
                { title: 'ALL STATUSES', value: 'all' },
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
              ]"
              item-title="title"
              item-value="value"
              label="STATUS"
              variant="solo"
              flat
              hide-details
              density="compact"
              class="rounded-lg text-uppercase"
            ></v-select>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto">
            <v-btn variant="text" color="primary" icon="mdi-filter-variant"></v-btn>
            <v-btn variant="text" color="primary" icon="mdi-export-variant" @click="exportLeads"></v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-col>

    <!-- Table -->
    <v-col cols="12">
      <v-card class="rounded-xl border-thin bg-surface elevation-0 overflow-hidden">
        <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>
        <v-table class="bg-transparent">
          <thead>
            <tr class="text-overline font-weight-black opacity-50">
              <th class="px-6 text-left">NAME</th>
              <th class="px-6 text-left">CONTACT</th>
              <th class="px-6 text-left">LOCATION</th>
              <th class="px-6 text-left">LEAD TYPE</th>
              <th class="px-6 text-left">STATUS</th>
              <th class="px-6 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lead in leads" :key="lead.id" class="hover-row">
              <td class="px-6 py-4">
                <div class="d-flex align-center">
                  <v-avatar color="primary" variant="tonal" size="40" class="mr-3 rounded-lg font-weight-bold">
                    {{ lead.name.charAt(0) }}
                  </v-avatar>
                  <div class="font-weight-black text-subtitle-2 text-uppercase clickable" @click="navigateTo(`/leads/${lead.id}`)">
                    {{ lead.name }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-caption font-weight-bold">{{ lead.phone }}</div>
                <div class="text-[10px] text-muted">{{ lead.email || 'NO EMAIL' }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-caption font-weight-medium uppercase">
                  {{ lead.city || lead.state ? [lead.city, lead.state].filter(Boolean).join(', ') : (lead.custom_data?.Location || lead.custom_data?.['Location / Address'] || 'N/A') }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-caption font-weight-bold uppercase text-primary">{{ lead.lead_type?.name || 'UNKNOWN' }}</div>
                <div class="text-[10px] text-muted font-weight-black uppercase opacity-50">{{ lead.source || 'DIRECT' }}</div>
              </td>
              <td class="px-6 py-4">
                 <v-chip :color="getStatusColor(lead.status)" size="x-small" label class="font-weight-black px-3">
                    {{ lead.status.toUpperCase() }}
                  </v-chip>
              </td>
              <td class="px-6 py-4 text-right">
                <v-btn
                  icon="mdi-whatsapp"
                  variant="text"
                  size="small"
                  color="green"
                  class="mr-1"
                  :href="`https://wa.me/91${lead.phone?.replace(/[^0-9]/g, '')}`"
                  target="_blank"
                ></v-btn>
                <v-btn icon="mdi-eye-outline" variant="text" size="small" color="info" class="mr-1" @click="navigateTo(`/leads/${lead.id}`)"></v-btn>
                <v-btn icon="mdi-pencil-outline" variant="text" size="small" color="primary" @click="navigateTo(`/leads/${lead.id}/edit`)"></v-btn>
              </td>
            </tr>
            <tr v-if="leads.length === 0 && !loading">
              <td colspan="5" class="text-center py-16 opacity-50">
                <v-icon size="48" class="mb-4">mdi-account-search-outline</v-icon>
                <p class="text-overline font-weight-black">No leads found matching your criteria</p>
              </td>
            </tr>
          </tbody>
        </v-table>
        
        <!-- Pagination Mockup -->
        <v-divider class="border-opacity-25"></v-divider>
        <div class="pa-4 d-flex align-center justify-space-between">
           <span class="text-caption text-muted uppercase font-weight-bold">Showing {{ leads.length }} Leads</span>
           <div class="d-flex ga-2">
              <v-btn icon="mdi-chevron-left" variant="text" size="small" disabled></v-btn>
              <v-btn icon="mdi-chevron-right" variant="text" size="small" disabled></v-btn>
           </div>
        </div>
      </v-card>
    </v-col>
  </v-row>

    <!-- Bulk Assign Dialog -->
    <v-dialog v-model="assignDialog" max-width="500" persistent>
      <v-card class="rounded-xl border-thin bg-surface elevation-24">
        <v-card-title class="pa-6 pb-2 d-flex align-center justify-space-between">
          <span class="text-h6 font-weight-black uppercase">Assign Leads to Team</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="assignDialog = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-6 pt-0">
          <div class="bg-primary rounded-lg pa-4 mb-6 d-flex align-center">
            <v-avatar color="white" class="mr-4" variant="tonal">
              <v-icon color="white">mdi-account-plus</v-icon>
            </v-avatar>
            <div class="flex-grow-1">
              <p class="text-[10px] font-weight-black opacity-70 uppercase mb-0 text-white">Dynamic Search Inventory</p>
              <p class="text-h5 font-weight-black mb-0 text-white">{{ currentFilteredCount }} Leads</p>
            </div>
            <v-chip size="x-small" label class="bg-white text-primary font-weight-black">UNASSIGNED</v-chip>
          </div>

          <v-row dense>
            <v-col cols="12" md="6">
              <v-select
                v-model="assignForm.status"
                :items="statusOptions"
                item-title="title"
                item-value="value"
                label="LEAD STATUS"
                variant="outlined"
                density="compact"
                hide-details
                class="mb-4"
                placeholder="Optional"
                clearable
              ></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="assignForm.lead_type"
                :items="[
                  { title: 'STUDENT', value: 'student' },
                  { title: 'PROFESSIONAL', value: 'professional' },
                  { title: 'OTHER', value: 'other' }
                ]"
                item-title="title"
                item-value="value"
                label="LEAD TYPE"
                variant="outlined"
                density="compact"
                hide-details
                class="mb-4"
                placeholder="Optional"
                clearable
              ></v-select>
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="assignForm.employee_id"
                :items="bdes"
                item-title="name"
                item-value="id"
                label="SELECT BDE"
                variant="outlined"
                density="compact"
                class="mb-2"
                :loading="loadingBdes"
              ></v-select>
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model.number="assignForm.count"
                type="number"
                label="HOW MANY LEADS?"
                variant="outlined"
                density="compact"
                min="1"
                :max="currentFilteredCount"
                persistent-hint
                :hint="`Max available: ${currentFilteredCount}`"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider class="border-opacity-25"></v-divider>

        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn variant="text" class="font-weight-black" @click="assignDialog = false">CANCEL</v-btn>
          <v-btn 
            color="primary" 
            variant="elevated" 
            height="44" 
            class="px-8 font-weight-bold" 
            :disabled="!assignForm.employee_id || !assignForm.count"
            :loading="assigning"
            @click="submitAssignment"
          >
            CONFIRM ASSIGNMENT
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
const api = useApi()
const uiStore = useUiStore()
const authStore = useAuthStore()
const leads = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const statusFilter = ref('all')

// Assign Leads Logic
const assignDialog = ref(false)
const assigning = ref(false)
const loadingBdes = ref(false)
const bdes = ref<any[]>([])
const currentFilteredCount = ref(0)

const assignForm = reactive({
  status: null,
  lead_type: null,
  employee_id: null,
  count: 0
})

const statusOptions = [
  { title: 'NEW', value: 'new' },
  { title: 'CONTACTED', value: 'contacted' },
  { title: 'INTERESTED', value: 'interested' },
  { title: 'THINKING', value: 'thinking' },
  { title: 'DEMO SCHEDULED', value: 'demo_scheduled' },
  { title: 'NO RESPONSE', value: 'no_response' },
  { title: 'BUSY / CALLBACK', value: 'callback' },
  { title: 'NOT INTERESTED', value: 'not_interested' }
]

const openAssignDialog = async () => {
  assignDialog.value = true
  assignForm.status = null
  assignForm.lead_type = null
  assignForm.employee_id = null
  assignForm.count = 0
  fetchFilteredCount()
  fetchBdes()
}

const fetchFilteredCount = async () => {
  try {
    const params: any = {}
    if (assignForm.status) params.status = assignForm.status
    if (assignForm.lead_type) params.lead_type = assignForm.lead_type
    
    const res: any = await api.get('/leads/unassigned-counts', { params })
    // The API now returns { status: 'success', data: { count: 5 } }
    // Or if res is the payload: { count: 5 }
    currentFilteredCount.value = res.data?.count ?? res.count ?? 0
  } catch (err) {
    console.error('Failed to fetch counts')
  }
}

// Watch for form changes to update count
watch(() => [assignForm.status, assignForm.lead_type], () => {
  fetchFilteredCount()
}, { deep: true })

const fetchBdes = async () => {
  loadingBdes.value = true
  try {
    const res: any = await api.get('/users/bdes')
    bdes.value = res.data || []
  } catch (err) {
    console.error('Failed to fetch BDEs')
  } finally {
    loadingBdes.value = false
  }
}

const submitAssignment = async () => {
  if (assignForm.count > currentFilteredCount.value) {
    uiStore.error('Not enough unassigned leads available.')
    return
  }

  assigning.value = true
  try {
    await api.post('/leads/bulk-assign', assignForm)
    uiStore.success('Leads assigned successfully!')
    assignDialog.value = false
    fetchLeads()
  } catch (err: any) {
    uiStore.error(err.data?.message || 'Assignment failed')
  } finally {
    assigning.value = false
  }
}

const fetchLeads = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (statusFilter.value !== 'all') params.status = statusFilter.value
    if (search.value) params.search = search.value

    const res: any = await api.get('/leads', { params })
    leads.value = res.data?.data || []
  } catch (err) {
    console.error('Failed to load leads')
  } finally {
    loading.value = false
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

const exportLeads = () => {
  if (leads.value.length === 0) {
    uiStore.error('Sorry, no records found to export.')
    return
  }

  // Define headers for CSV
  const headers = ['Name', 'Email', 'Phone', 'Location', 'Lead Type', 'Status', 'Source', 'Assigned To', 'Follow Up Date']
  
  // Format data
  const rows = leads.value.map(lead => [
    lead.name,
    lead.email || 'N/A',
    `="${lead.phone}"`, // Format phone as string for Excel
    lead.city || lead.state ? [lead.city, lead.state].filter(Boolean).join(', ') : (lead.custom_data?.Location || lead.custom_data?.['Location / Address'] || 'N/A'),
    lead.lead_type?.name || 'Unknown',
    lead.status.toUpperCase(),
    lead.source || 'Direct',
    lead.assigned_to?.name || 'Unassigned',
    lead.follow_up_date || 'N/A'
  ])

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n')

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

watch([statusFilter, search], () => {
  fetchLeads()
})

onMounted(() => {
  fetchLeads()
})

definePageMeta({
  middleware: 'auth'
})
</script>

<style scoped>
.page-bg {
  background: #011a1a;
}
.border-thin {
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}
.text-white-50 {
  color: rgba(255, 255, 255, 0.5) !important;
}
.clickable {
  cursor: pointer;
}
.clickable:hover {
  color: #ef6125 !important;
  text-decoration: underline;
}
.animate-fade {
  animation: fadeIn 0.6s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.hover-row:hover {
  background: rgba(255, 255, 255, 0.02) !important;
}
</style>
