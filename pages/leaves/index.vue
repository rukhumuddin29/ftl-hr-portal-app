<template>
  <v-container class="animate-fade py-8">
    <v-row>
      <!-- Page Header -->
      <v-col cols="12" class="mb-6 d-flex align-center justify-space-between flex-wrap ga-4">
        <div>
          <h1 class="text-h4 font-weight-black uppercase">My Time & Attendance</h1>
          <p class="text-body-2 text-muted">Track your attendance, manage leave balances, and apply for time off.</p>
        </div>
        <v-btn 
          color="primary" 
          size="large" 
          prepend-icon="mdi-plus" 
          class="font-weight-black rounded-lg"
          @click="showApplyDialog = true"
        >
          APPLY FOR LEAVE
        </v-btn>
      </v-col>

      <!-- Balance Cards -->
      <v-col v-for="(balance, key) in balances" :key="key" cols="12" md="4">
        <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6 h-100">
          <div class="d-flex justify-space-between align-start mb-4">
            <div>
              <div class="text-overline font-weight-black text-muted">{{ balance.label }}</div>
              <div class="text-h4 font-weight-black">{{ balance.available }} <small class="text-body-2 text-muted">/ {{ balance.total }}</small></div>
              <div class="text-caption font-weight-bold text-primary">DAYS AVAILABLE</div>
            </div>
            <v-icon size="40" color="primary" class="opacity-20">{{ getIcon(key) }}</v-icon>
          </div>
          
          <v-progress-linear
            :model-value="(balance.used / balance.total) * 100"
            color="primary"
            height="8"
            rounded
            class="mb-4"
          ></v-progress-linear>
          
          <div class="d-flex justify-space-between text-caption font-weight-bold">
            <span class="text-muted">USED: {{ balance.used }}</span>
            <span class="text-muted">TOTAL: {{ balance.total }}</span>
          </div>
        </v-card>
      </v-col>

      <!-- Tabs for History -->
      <v-col cols="12" class="mt-6">
        <v-tabs v-model="activeTab" color="primary" class="border-b mb-6">
          <v-tab value="attendance" class="font-weight-black text-none">ATTENDANCE HISTORY</v-tab>
          <v-tab value="leaves" class="font-weight-black text-none">LEAVE HISTORY</v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <!-- Attendance Tab -->
          <v-window-item value="attendance">
            <v-card class="rounded-xl border-thin bg-surface elevation-0">
                <div class="pa-6 border-b d-flex justify-space-between align-center">
                    <h3 class="text-h6 font-weight-black uppercase d-flex align-center ga-2">
                        <v-icon>mdi-calendar-clock</v-icon>
                        My Attendance ({{ format(currentMonth, 'MMMM yyyy') }})
                    </h3>
                    <div class="d-flex ga-2">
                        <v-btn icon="mdi-chevron-left" variant="text" density="comfortable" @click="prevMonth"></v-btn>
                        <v-btn icon="mdi-chevron-right" variant="text" density="comfortable" @click="nextMonth" :disabled="isCurrentMonth"></v-btn>
                    </div>
                </div>

                <v-table class="bg-transparent">
                    <thead>
                        <tr class="text-overline font-weight-black text-muted">
                            <th class="text-left">DATE</th>
                            <th class="text-left">CHECK IN</th>
                            <th class="text-left">CHECK OUT</th>
                            <th class="text-center">HOURS</th>
                            <th class="text-left">STATUS</th>
                            <th class="text-right">LOCATION/IP</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="att in attendanceHistory" :key="att.id">
                            <td class="font-weight-bold">{{ format(new Date(att.date), 'dd MMM, EEE') }}</td>
                            <td class="text-subtitle-2 font-weight-black">{{ formatTime(att.check_in) }}</td>
                            <td class="text-subtitle-2 font-weight-black">{{ formatTime(att.check_out) }}</td>
                            <td class="text-center">
                                <v-chip v-if="att.working_hours" size="x-small" color="primary" variant="tonal" class="font-weight-black">
                                    {{ att.working_hours }}h
                                </v-chip>
                                <span v-else>-</span>
                            </td>
                            <td>
                                <v-chip :color="getAttendanceStatusColor(att.status)" size="x-small" label class="font-weight-black uppercase">
                                    {{ att.status.replace('_', ' ') }}
                                </v-chip>
                            </td>
                            <td class="text-right d-flex flex-column align-end py-2">
                                <span class="text-[10px] text-muted font-mono">{{ att.check_in_ip || 'N/A' }}</span>
                                <v-icon v-if="att.check_in_lat" size="14" color="primary" :title="`${att.check_in_lat}, ${att.check_in_lng}`">mdi-map-marker</v-icon>
                            </td>
                        </tr>
                        <tr v-if="!attendanceHistory.length">
                            <td colspan="6" class="text-center py-12 text-muted italic">
                                <v-icon size="48" class="mb-4 d-block mx-auto opacity-20">mdi-calendar-blank</v-icon>
                                No attendance records found for this month.
                            </td>
                        </tr>
                    </tbody>
                </v-table>
            </v-card>
          </v-window-item>

          <!-- Leave History Tab -->
          <v-window-item value="leaves">
            <v-card class="rounded-xl border-thin bg-surface elevation-0">
          <div class="pa-6 border-b">
            <h3 class="text-h6 font-weight-black uppercase d-flex align-center ga-2">
              <v-icon>mdi-history</v-icon>
              Leave History
            </h3>
          </div>

          <v-table class="bg-transparent">
            <thead>
              <tr class="text-overline font-weight-black text-muted">
                <th class="text-left">DATES</th>
                <th class="text-left">TYPE</th>
                <th class="text-center">DAYS</th>
                <th class="text-left">REASON</th>
                <th class="text-center">STATUS</th>
                <th class="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="leave in leaves" :key="leave.id">
                <td>
                  <div class="font-weight-bold">{{ formatDateRange(leave.start_date, leave.end_date) }}</div>
                  <div v-if="leave.is_half_day" class="text-[10px] text-primary font-weight-black uppercase">
                    Half Day ({{ leave.half_day_type?.replace('_', ' ') }})
                  </div>
                </td>
                <td class="text-caption font-weight-black uppercase text-secondary">
                  {{ leave.leave_type.replace('_', ' ') }}
                </td>
                <td class="text-center font-weight-black">{{ leave.total_days }}</td>
                <td class="text-body-2 text-truncate max-w-[200px]" :title="leave.reason">
                  {{ leave.reason }}
                </td>
                <td class="text-center">
                  <v-chip
                    :color="getStatusColor(leave.status)"
                    size="x-small"
                    variant="tonal"
                    label
                    class="font-weight-black uppercase"
                  >
                    {{ leave.status }}
                  </v-chip>
                </td>
                <td class="text-right">
                  <v-btn
                    v-if="leave.status === 'pending'"
                    color="error"
                    variant="text"
                    size="small"
                    class="font-weight-black"
                    @click="cancelLeave(leave.id)"
                  >CANCEL</v-btn>
                  <v-btn
                    v-else-if="leave.admin_remarks"
                    icon="mdi-information-outline"
                    variant="text"
                    size="small"
                    color="secondary"
                    @click="uiStore.info(leave.admin_remarks)"
                  ></v-btn>
                </td>
              </tr>
              <tr v-if="leaves.length === 0">
                <td colspan="6" class="text-center py-12 text-muted italic">
                   <v-icon size="48" class="mb-4 d-block mx-auto opacity-20">mdi-calendar-blank</v-icon>
                   No leave history found.
                </td>
              </tr>
            </tbody>
          </v-table>
          
          <div v-if="totalPages > 1" class="pa-4 border-t d-flex justify-center">
             <v-pagination v-model="page" :length="totalPages" density="compact" @update:model-value="fetchHistory"></v-pagination>
          </div>
        </v-card>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>

    <!-- Apply Leave Dialog -->
    <v-dialog v-model="showApplyDialog" max-width="500">
      <v-card class="rounded-xl pa-8 bg-surface">
        <h2 class="text-h5 font-weight-black uppercase mb-6 text-primary">Apply For Leave</h2>
        
        <v-form @submit.prevent="submitApplication">
          <v-select
            v-model="form.leave_type"
            :items="leaveTypeOptions"
            label="Leave Type"
            variant="outlined"
            class="mb-4"
          ></v-select>

          <v-row dense>
            <v-col cols="6">
              <v-text-field
                v-model="form.start_date"
                label="Start Date"
                type="date"
                variant="outlined"
                class="mb-4"
                @update:model-value="calculateDays"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="form.end_date"
                label="End Date"
                type="date"
                variant="outlined"
                class="mb-4"
                @update:model-value="calculateDays"
              ></v-text-field>
            </v-col>
          </v-row>

          <div v-if="canHalfDay" class="mb-4">
             <v-switch
               v-model="form.is_half_day"
               label="Is this a half day?"
               color="primary"
               hide-details
             ></v-switch>
             
             <v-btn-toggle
               v-if="form.is_half_day"
               v-model="form.half_day_type"
               mandatory
               color="primary"
               variant="tonal"
               class="mt-2 w-100"
             >
               <v-btn value="first_half" class="flex-grow-1 font-weight-bold">FIRST HALF</v-btn>
               <v-btn value="second_half" class="flex-grow-1 font-weight-bold">SECOND HALF</v-btn>
             </v-btn-toggle>
          </div>

          <v-textarea
            v-model="form.reason"
            label="Reason for Leave"
            variant="outlined"
            placeholder="Please provide a brief reason..."
            rows="3"
            class="mb-6"
          ></v-textarea>

          <div v-if="estimatedDays > 0" class="mb-6 pa-4 rounded-lg bg-primary opacity-10 border-thin d-flex justify-space-between align-center">
             <span class="font-weight-black text-primary">ESTIMATED WORKING DAYS:</span>
             <span class="text-h6 font-weight-black text-primary">{{ estimatedDays }}</span>
          </div>

          <v-btn
            type="submit"
            color="primary"
            block
            size="large"
            class="font-weight-black rounded-lg"
            :loading="submitting"
            :disabled="estimatedDays <= 0"
          >
            SUBMIT APPLICATION
          </v-btn>
          <v-btn
            block
            variant="text"
            class="mt-4 font-weight-bold"
            @click="showApplyDialog = false"
          >
            CANCEL
          </v-btn>
        </v-form>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

const api = useApi()
const uiStore = useUiStore()

const leaves = ref<any[]>([])
const attendanceHistory = ref<any[]>([])
const balances = ref<any>({})
const loading = ref(true)
const submitting = ref(false)
const showApplyDialog = ref(false)
const page = ref(1)
const totalPages = ref(1)
const estimatedDays = ref(0)
const activeTab = ref('attendance')

const currentMonth = ref(new Date())
const isCurrentMonth = computed(() => {
    const now = new Date()
    return currentMonth.value.getMonth() === now.getMonth() && currentMonth.value.getFullYear() === now.getFullYear()
})

const prevMonth = () => {
    currentMonth.value = new Date(currentMonth.value.setMonth(currentMonth.value.getMonth() - 1))
    fetchAttendanceHistory()
}

const nextMonth = () => {
    currentMonth.value = new Date(currentMonth.value.setMonth(currentMonth.value.getMonth() + 1))
    fetchAttendanceHistory()
}

const form = reactive({
  leave_type: 'sick_leave',
  start_date: format(new Date(), 'yyyy-MM-dd'),
  end_date: format(new Date(), 'yyyy-MM-dd'),
  is_half_day: false,
  half_day_type: 'first_half',
  reason: ''
})

const leaveTypeOptions = [
  { title: 'Sick Leave', value: 'sick_leave' },
  { title: 'Casual Leave', value: 'casual_leave' },
  { title: 'Earned Leave', value: 'earned_leave' }
]

const canHalfDay = computed(() => {
    return balances.value[form.leave_type]?.allow_half_day || false
})

const fetchBalances = async () => {
    try {
        const res: any = await api.get('/leaves/my-balance')
        balances.value = res.data
    } catch (err) {
        uiStore.error('Failed to load leave balances')
    }
}

const fetchAttendanceHistory = async () => {
    try {
        const monthStr = format(currentMonth.value, 'yyyy-MM')
        const res: any = await api.get('/attendance/my-history', { params: { month: monthStr } })
        attendanceHistory.value = res.data
    } catch (err) {
        uiStore.error('Failed to load attendance history')
    }
}

const fetchHistory = async () => {
    loading.value = true
    try {
        const res: any = await api.get('/leaves/my-leaves', { params: { page: page.value } })
        leaves.value = res.data.data
        totalPages.value = res.data.last_page
    } catch (err) {
        uiStore.error('Failed to load leave history')
    } finally {
        loading.value = false
    }
}

const calculateDays = () => {
    if (!form.start_date || !form.end_date) {
        estimatedDays.value = 0
        return
    }
    
    // Simplistic frontend calc for now, backend will re-validate
    const start = new Date(form.start_date)
    const end = new Date(form.end_date)
    
    if (form.is_half_day) {
        estimatedDays.value = 0.5
        return
    }

    if (start > end) {
        estimatedDays.value = 0
        return
    }

    // Rough calc excluding manifest weekends
    let days = 0
    let current = new Date(start)
    while (current <= end) {
        const day = current.getDay()
        if (day !== 0) days++ // Assuming Sunday is weekend for now
        current.setDate(current.getDate() + 1)
    }
    estimatedDays.value = days
}

const submitApplication = async () => {
    if (!form.reason) {
        uiStore.error('Please provide a reason')
        return
    }

    submitting.value = true
    try {
        await api.post('/leaves/apply', form)
        uiStore.success('Leave application submitted successfully')
        showApplyDialog.value = false
        // Reset form
        form.reason = ''
        fetchHistory()
        fetchBalances()
    } catch (err: any) {
        uiStore.error(err.response?.data?.message || 'Failed to submit application')
    } finally {
        submitting.value = false
    }
}

const cancelLeave = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this leave request?')) return
    
    try {
        await api.post(`/leaves/${id}/cancel`)
        uiStore.success('Leave request cancelled')
        fetchHistory()
        fetchBalances()
    } catch (err) {
        uiStore.error('Failed to cancel leave request')
    }
}

const getIcon = (type: string) => {
    switch (type) {
        case 'sick_leave': return 'mdi-hospital-box-outline'
        case 'casual_leave': return 'mdi-beach'
        case 'earned_leave': return 'mdi-briefcase-check-outline'
        default: return 'mdi-calendar'
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

const formatTime = (t: string) => {
    if (!t) return '-'
    const [h, m] = t.split(':')
    const d = new Date()
    d.setHours(parseInt(h), parseInt(m))
    return format(d, 'hh:mm a')
}

const getAttendanceStatusColor = (status: string) => {
    switch (status) {
        case 'present': return 'success'
        case 'half_day': return 'warning'
        case 'absent': return 'error'
        case 'holiday': return 'info'
        case 'weekend': return 'secondary'
        default: return 'muted'
    }
}

const formatDateRange = (start: string, end: string) => {
    const s = format(new Date(start), 'dd MMM')
    const e = format(new Date(end), 'dd MMM yyyy')
    return s === format(new Date(end), 'dd MMM') ? e : `${s} — ${e}`
}

onMounted(() => {
    fetchBalances()
    fetchHistory()
    fetchAttendanceHistory()
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
.border-b {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}
.border-t {
  border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
}
</style>
