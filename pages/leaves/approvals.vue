<template>
  <v-container class="animate-fade py-8">
    <v-row>
      <!-- Page Header -->
      <v-col cols="12" class="mb-6">
        <div class="d-flex align-center justify-space-between flex-wrap ga-4">
          <div>
            <h1 class="text-h4 font-weight-bold uppercase">Leave Approvals</h1>
            <p class="text-body-2 text-muted">Review and manage employee leave requests.</p>
          </div>
          <div class="d-flex ga-4">
             <v-chip color="warning" class="font-weight-medium" variant="tonal" label>
               {{ pendingLeaves.length }} PENDING
             </v-chip>
             <v-btn icon="mdi-refresh" variant="text" @click="fetchPending" :loading="loading"></v-btn>
          </div>
        </div>
      </v-col>

      <!-- Pending Requests -->
      <v-col cols="12" md="8">
        <h3 class="text-subtitle-1 font-weight-bold uppercase mb-4 text-primary d-flex align-center ga-2">
          <v-icon size="18">mdi-clock-outline</v-icon>
          Pending Requests
        </h3>
        
        <v-row v-if="pendingLeaves.length > 0">
           <v-col v-for="leave in pendingLeaves" :key="leave.id" cols="12">
             <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6 hover-card">
                <div class="d-flex align-center justify-space-between flex-wrap ga-4 mb-4">
                   <div class="d-flex align-center ga-3">
                      <v-avatar color="primary" variant="tonal" size="48" class="rounded-lg">
                         {{ leave.user?.name.charAt(0) }}
                      </v-avatar>
                      <div>
                         <div class="font-weight-bold text-h6 uppercase">{{ leave.user?.name }}</div>
                         <div class="text-caption font-weight-medium text-muted uppercase">
                            {{ leave.user?.designation || 'EMPLOYEE' }} • {{ leave.user?.department || 'DEPT' }}
                         </div>
                      </div>
                   </div>
                   <div class="text-right">
                      <v-chip color="secondary" variant="flat" size="small" class="font-weight-medium uppercase px-4">
                         {{ leave.leave_type.replace('_', ' ') }}
                      </v-chip>
                      <div class="mt-2 font-weight-medium text-primary">{{ leave.total_days }} DAYS</div>
                   </div>
                </div>

                <v-divider class="mb-4 opacity-5"></v-divider>

                <div class="d-flex ga-8 mb-6 flex-wrap">
                   <div>
                      <div class="text-overline font-weight-bold text-muted">DATES</div>
                      <div class="font-weight-medium">{{ formatDateRange(leave.start_date, leave.end_date) }}</div>
                      <div v-if="leave.is_half_day" class="text-caption text-primary font-weight-medium uppercase">HALF DAY</div>
                   </div>
                   <div class="flex-grow-1">
                      <div class="text-overline font-weight-bold text-muted">REASON</div>
                      <div class="text-body-2 italic text-muted">"{{ leave.reason }}"</div>
                   </div>
                </div>

                <div class="d-flex justify-space-between align-center flex-wrap ga-4">
                   <div class="d-flex ga-2">
                      <v-btn
                        color="success"
                        prepend-icon="mdi-check-bold"
                        class="font-weight-medium rounded-lg"
                        @click="openDecisionDialog(leave, 'approve')"
                      >APPROVE</v-btn>
                      <v-btn
                        color="error"
                        variant="tonal"
                        prepend-icon="mdi-close-thick"
                        class="font-weight-medium rounded-lg"
                        @click="openDecisionDialog(leave, 'reject')"
                      >REJECT</v-btn>
                   </div>
                   <v-btn
                     variant="text"
                     size="small"
                     color="secondary"
                     prepend-icon="mdi-account-details-outline"
                     class="font-weight-medium"
                     :to="`/leads?user_id=${leave.user_id}`"
                   >VIEW PROFILE</v-btn>
                </div>
             </v-card>
           </v-col>
        </v-row>
        
        <v-card v-else class="rounded-xl border-dashed bg-transparent pa-12 text-center opacity-40">
           <v-icon size="64" class="mb-4">mdi-check-circle-outline</v-icon>
           <h3 class="text-h6 font-weight-bold uppercase">Zero Pending Requests</h3>
           <p>All time-off applications have been processed.</p>
        </v-card>
      </v-col>

      <!-- History / Filters -->
      <v-col cols="12" md="4">
        <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6">
           <h3 class="text-subtitle-1 font-weight-bold uppercase mb-6 text-primary d-flex align-center ga-2">
             <v-icon size="18">mdi-filter-variant</v-icon>
             All Decisions
           </h3>
           
           <v-text-field
             v-model="search"
             placeholder="Search employee..."
             prepend-inner-icon="mdi-magnify"
             variant="outlined"
             density="compact"
             class="mb-4"
             hide-details
             @update:model-value="fetchHistory"
           ></v-text-field>

           <v-list class="bg-transparent pa-0">
              <v-list-item v-for="h in history" :key="h.id" class="px-0 py-3 border-b">
                 <v-list-item-title class="font-weight-bold uppercase text-subtitle-2">
                   {{ h.user?.name }}
                 </v-list-item-title>
                 <v-list-item-subtitle class="text-caption">
                    {{ formatDateRange(h.start_date, h.end_date) }} • {{ h.total_days }}d
                 </v-list-item-subtitle>
                 <template v-slot:append>
                    <v-chip
                      :color="getStatusColor(h.status)"
                      size="x-small"
                      variant="tonal"
                      label
                      class="font-weight-medium"
                    >{{ h.status }}</v-chip>
                 </template>
              </v-list-item>
           </v-list>
           
           <v-btn block variant="text" color="primary" class="mt-4 font-weight-medium" to="/leaves/all">VIEW ALL HISTORY</v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Decision Dialog -->
    <v-dialog v-model="decisionDialog" max-width="450">
       <v-card class="rounded-xl pa-8 bg-surface">
          <h2 class="text-h5 font-weight-bold uppercase mb-2" :class="decisionType === 'approve' ? 'text-success' : 'text-error'">
            {{ decisionType === 'approve' ? 'Approve' : 'Reject' }} Leave
          </h2>
          <p class="text-body-2 text-muted mb-6">Processing request for <strong>{{ selectedLeave?.user?.name }}</strong>.</p>
          
          <v-textarea
            v-model="remarks"
            label="Admin Remarks (Internal)"
            variant="outlined"
            placeholder="Reason for your decision..."
            rows="3"
            class="mb-6"
          ></v-textarea>

          <v-btn
            :color="decisionType === 'approve' ? 'success' : 'error'"
            block
            size="large"
            class="font-weight-medium rounded-lg"
            :loading="processing"
            @click="submitDecision"
          >
            CONFIRM {{ decisionType.toUpperCase() }}
          </v-btn>
          <v-btn
            block
            variant="text"
            class="mt-4 font-weight-medium"
            @click="decisionDialog = false"
          >CANCEL</v-btn>
       </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

const api = useApi()
const uiStore = useUiStore()

const pendingLeaves = ref<any[]>([])
const history = ref<any[]>([])
const loading = ref(true)
const processing = ref(false)
const decisionDialog = ref(false)
const search = ref('')
const selectedLeave = ref<any>(null)
const decisionType = ref<'approve' | 'reject'>('approve')
const remarks = ref('')

const fetchPending = async () => {
    loading.value = true
    try {
        const res: any = await api.get('/leaves/pending')
        pendingLeaves.value = res.data
    } catch (err) {
        uiStore.error('Failed to load pending requests')
    } finally {
        loading.value = false
    }
}

const fetchHistory = async () => {
    try {
        const res: any = await api.get('/leaves/all', { params: { per_page: 10, search: search.value } })
        history.value = res.data.data
    } catch (err) {
        uiStore.error('Failed to load history')
    }
}

const openDecisionDialog = (leave: any, type: 'approve' | 'reject') => {
    selectedLeave.value = leave
    decisionType.value = type
    remarks.value = ''
    decisionDialog.value = true
}

const submitDecision = async () => {
    processing.value = true
    try {
        const endpoint = `/leaves/${selectedLeave.value.id}/${decisionType.value}`
        await api.post(endpoint, { remarks: remarks.value })
        uiStore.success(`Leave request ${decisionType.value}d successfully`)
        decisionDialog.value = false
        fetchPending()
        fetchHistory()
    } catch (err: any) {
        uiStore.error(err.response?.data?.message || 'Failed to process decision')
    } finally {
        processing.value = false
    }
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return 'warning'
        case 'approved': return 'success'
        case 'rejected': return 'error'
        case 'cancelled': return 'secondary'
        default: return 'muted'
    }
}

const formatDateRange = (start: string, end: string) => {
    const s = format(new Date(start), 'dd MMM')
    const e = format(new Date(end), 'dd MMM yyyy')
    return s === format(new Date(end), 'dd MMM') ? e : `${s} — ${e}`
}

onMounted(() => {
    fetchPending()
    fetchHistory()
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
.border-dashed {
  border: 2px dashed rgba(255, 255, 255, 0.1) !important;
}
.hover-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
  transform: translateY(-2px);
  transition: all 0.3s ease;
}
.border-b {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}
</style>
