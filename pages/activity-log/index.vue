<template>
  <v-container fluid class="animate-fade py-6 px-lg-12 px-6">
    <!-- Header -->
    <v-row align="center" class="mb-6">
      <v-col cols="12" lg="6">
        <h1 class="text-h4 font-weight-black d-flex align-center ga-3">
          <v-icon color="primary">mdi-history</v-icon>
          ACTIVITY LOG
        </h1>
        <p class="text-caption text-muted uppercase tracking-widest font-weight-bold">
          Complete Audit Trail of All System Actions
        </p>
      </v-col>
      <v-col cols="12" lg="6" class="d-flex justify-lg-end align-center ga-3 flex-wrap">
        <v-btn
          color="white"
          variant="outlined"
          prepend-icon="mdi-refresh"
          rounded="lg"
          class="font-weight-bold"
          :loading="loading"
          @click="fetchLogs(1)"
        >
          REFRESH
        </v-btn>
      </v-col>
    </v-row>

    <!-- Filters Section -->
    <v-card class="rounded-xl border-thin elevation-0 pa-6 bg-surface mb-6">
      <v-row dense align="center">
        <v-col cols="12" md="3">
          <v-text-field
            v-model="filters.search"
            prepend-inner-icon="mdi-magnify"
            label="SEARCH ACTION OR VALUES"
            variant="outlined"
            density="compact"
            hide-details
            class="custom-field"
            @update:model-value="debouncedFetch"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="2">
          <v-select
            v-model="filters.user_id"
            :items="users"
            item-title="name"
            item-value="id"
            label="USER"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            class="custom-field"
            @update:model-value="fetchLogs(1)"
          ></v-select>
        </v-col>
        <v-col cols="12" md="2">
          <v-select
            v-model="filters.action_group"
            :items="actionGroups"
            label="ACTION TYPE"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            class="custom-field"
            @update:model-value="fetchLogs(1)"
          ></v-select>
        </v-col>
        <v-col cols="12" md="2">
          <v-text-field
            v-model="filters.date_from"
            type="date"
            label="FROM"
            variant="outlined"
            density="compact"
            hide-details
            class="custom-field"
            @update:model-value="fetchLogs(1)"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="2">
          <v-text-field
            v-model="filters.date_to"
            type="date"
            label="TO"
            variant="outlined"
            density="compact"
            hide-details
            class="custom-field"
            @update:model-value="fetchLogs(1)"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-card>

    <!-- Timeline View -->
    <v-row v-if="logs.length > 0">
      <v-col cols="12">
        <v-card class="rounded-xl border-thin elevation-0 pa-0 bg-transparent overflow-visible">
          <v-timeline side="end" align="start" truncate-line="both" density="comfortable" class="custom-timeline">
            <v-timeline-item
              v-for="log in logs"
              :key="log.id"
              :dot-color="getActionConfig(log.action).color"
              :icon="getActionConfig(log.action).icon"
              size="small"
              width="100%"
            >
              <template v-slot:opposite>
                <div class="text-[11px] font-weight-black opacity-40 text-uppercase tracking-widest pr-8 text-right leading-relaxed flex flex-col ga-1" style="min-width: 100px;">
                  <span class="text-primary opacity-100 whitespace-nowrap">{{ formatTime(log.created_at) }}</span>
                  <span class="opacity-100 whitespace-nowrap">{{ formatDate(log.created_at) }}</span>
                </div>
              </template>

              <v-card class="log-entry-card rounded-xl border-thin bg-surface elevation-0 pa-4 mb-4">
                 <div class="d-flex justify-space-between align-start mb-2">
                    <div class="d-flex align-center ga-2">
                       <span class="font-weight-black text-primary text-subtitle-2">{{ log.user?.name || 'SYSTEM' }}</span>
                       <span class="text-caption text-muted font-weight-medium">
                         {{ getActionConfig(log.action).label }}
                       </span>
                       <v-chip v-if="log.model_type" size="x-small" label color="white-50" variant="tonal" class="font-weight-black text-[9px]">
                         {{ log.model_type }} #{{ log.model_id }}
                       </v-chip>
                    </div>
                    <div class="text-[10px] text-muted opacity-30 font-weight-bold">
                       IP: {{ log.ip_address }}
                    </div>
                 </div>

                 <!-- Changes visualization -->
                 <div v-if="log.old_values || log.new_values" class="mt-3">
                    <div class="change-grid rounded-lg overflow-hidden border">
                       <div v-if="log.old_values" class="change-side bg-error-darken-4 pa-3">
                          <div class="text-[9px] font-weight-black uppercase opacity-50 mb-1">Old Values</div>
                          <pre class="text-[11px] font-mono highlight-json text-white">{{ JSON.stringify(log.old_values, null, 2) }}</pre>
                       </div>
                       <div class="change-side bg-success-darken-4 pa-3">
                          <div class="text-[9px] font-weight-black uppercase opacity-50 mb-1">New Values / Data</div>
                          <pre class="text-[11px] font-mono highlight-json text-white">{{ JSON.stringify(log.new_values, null, 2) }}</pre>
                       </div>
                    </div>
                 </div>
                 
                 <div v-if="log.model_type === 'Lead' && log.model_id" class="mt-3">
                    <v-btn 
                      size="x-small" 
                      variant="tonal" 
                      color="primary" 
                      prepend-icon="mdi-account-eye"
                      class="font-weight-black"
                      @click="navigateTo(`/leads/${log.model_id}`)"
                    >
                      VIEW LEAD BROWSER
                    </v-btn>
                 </div>
              </v-card>
            </v-timeline-item>
          </v-timeline>

          <!-- Pagination -->
          <div class="d-flex justify-center mt-6">
            <v-pagination
              v-model="pagination.page"
              :length="pagination.lastPage"
              :total-visible="7"
              rounded="lg"
              size="small"
              @update:model-value="fetchLogs"
            ></v-pagination>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-row v-else-if="!loading">
      <v-col cols="12">
         <v-card class="rounded-xl border-thin border-dashed bg-transparent pa-12 text-center">
            <v-icon size="64" class="opacity-10 mb-4">mdi-history-off</v-icon>
            <p class="text-h6 font-weight-bold opacity-30">NO ACTIVITY LOGS FOUND</p>
            <p class="text-caption text-muted uppercase font-weight-black tracking-widest mt-2">Adjust your filters to see more actions</p>
         </v-card>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="40"></v-progress-circular>
        <p class="text-caption mt-4 font-weight-bold opacity-50 uppercase tracking-widest">Compiling Audit Trail...</p>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

const api = useApi()
const uiStore = useUiStore()

const loading = ref(true)
const logs = ref<any[]>([])
const users = ref<any[]>([])
const filters = reactive({
    search: '',
    user_id: null,
    action_group: null,
    date_from: '',
    date_to: ''
})

const pagination = reactive({
    page: 1,
    lastPage: 1
})

const actionGroups = [
    { title: 'Leads', value: 'lead' },
    { title: 'Payments/Financial', value: 'payment|enrollment' },
    { title: 'Expenses', value: 'expense' },
    { title: 'Payroll', value: 'payroll' },
    { title: 'Auth', value: 'auth' }
]

const actionConfig: Record<string, any> = {
  // Lead Actions
  'lead.created':             { icon: 'mdi-plus-circle',        color: 'success',  label: 'created a new lead' },
  'lead.updated':             { icon: 'mdi-pencil',             color: 'info',     label: 'updated lead details' },
  'lead.status_changed':      { icon: 'mdi-swap-horizontal',    color: 'primary',  label: 'changed lead status' },
  'lead.assigned':            { icon: 'mdi-account-arrow-right',color: 'indigo',   label: 'assigned a lead' },
  'lead.bulk_assigned':       { icon: 'mdi-account-multiple-plus', color: 'indigo', label: 'bulk assigned leads' },
  'lead.call_logged':         { icon: 'mdi-phone',              color: 'cyan',     label: 'logged an interaction' },
  'lead.follow_up_snoozed':   { icon: 'mdi-clock-outline',      color: 'amber',    label: 'snoozed a follow-up' },
  'lead.follow_up_completed': { icon: 'mdi-check-circle',       color: 'success',  label: 'completed a follow-up' },
  'lead.bulk_imported':       { icon: 'mdi-upload',             color: 'blue',     label: 'imported leads in bulk' },
  
  // Financial Actions
  'enrollment.created':  { icon: 'mdi-school',          color: 'success',  label: 'created an enrollment' },
  'enrollment.updated':  { icon: 'mdi-pencil-box-multiple', color: 'info', label: 'updated an enrollment' },
  'payment.recorded':    { icon: 'mdi-cash-plus',       color: 'success',  label: 'recorded a payment' },
  'expense.created':     { icon: 'mdi-receipt',         color: 'warning',  label: 'submitted an expense' },
  'expense.approved':    { icon: 'mdi-check-decagram',  color: 'success',  label: 'approved an expense' },
  'expense.rejected':    { icon: 'mdi-close-circle',    color: 'error',    label: 'rejected an expense' },
  
  // Payroll Actions
  'payroll.generated': { icon: 'mdi-calculator',  color: 'info',    label: 'generated payroll' },
  'payroll.approved':  { icon: 'mdi-thumb-up',    color: 'success', label: 'approved payroll' },
  'payroll.paid':      { icon: 'mdi-cash-check',  color: 'primary', label: 'marked payroll as paid' },
  
  // Auth Actions
  'auth.login':  { icon: 'mdi-login',  color: 'blue',    label: 'logged in' },
  'auth.logout': { icon: 'mdi-logout', color: 'grey',    label: 'logged out' },
}

const getActionConfig = (action: string) => {
    return actionConfig[action] || { icon: 'mdi-information-outline', color: 'grey', label: action }
}

const fetchLogs = async (page = 1) => {
    loading.value = true
    try {
        const res: any = await api.get('/activity-logs', {
            params: {
                ...filters,
                action: filters.action_group || undefined,
                page
            }
        })
        logs.value = res.data.data
        pagination.page = res.data.current_page
        pagination.lastPage = res.data.last_page
    } catch (err) {
        uiStore.error('Failed to load activity logs')
    } finally {
        loading.value = false
    }
}

const fetchUsers = async () => {
   try {
     const res: any = await api.get('/users/bdes')
     users.value = res.data
   } catch {}
}

let timeoutId: any = null
const debouncedFetch = () => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fetchLogs(1), 500)
}

const formatDate = (date: string) => format(new Date(date), 'dd MMM yyyy')
const formatTime = (date: string) => format(new Date(date), 'hh:mm aa')

onMounted(() => {
    fetchLogs()
    fetchUsers()
})

definePageMeta({
    middleware: 'auth'
})
</script>

<style scoped>
.custom-field :deep(.v-field) {
    border-radius: 12px !important;
}

.log-entry-card {
    transition: transform 0.2s ease, border-color 0.2s ease;
}
.log-entry-card:hover {
    transform: translateX(5px);
    border-color: rgba(var(--v-theme-primary), 0.3) !important;
}

.change-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    border-color: rgba(255, 255, 255, 0.05) !important;
}

.change-side {
    max-height: 250px;
    overflow-y: auto;
}

.highlight-json {
    white-space: pre-wrap;
    word-break: break-all;
    line-height: 1.4;
}

.custom-timeline :deep(.v-timeline-divider__inner) {
    box-shadow: 0 0 10px rgba(var(--v-theme-primary), 0.2);
}

.custom-timeline {
    padding: 10px;
}

.animate-fade {
    animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Scrollbar styling for change side */
.change-side::-webkit-scrollbar {
  width: 4px;
}
.change-side::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.tracking-widest {
  letter-spacing: 0.1em;
}
</style>
