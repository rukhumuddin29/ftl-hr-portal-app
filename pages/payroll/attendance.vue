<template>
  <v-row class="animate-fade">
    <!-- Header -->
    <v-col cols="12" class="mb-2">
      <div class="d-flex justify-space-between align-center flex-wrap ga-3">
        <div>
          <h1 class="text-h4 font-weight-black">ATTENDANCE</h1>
          <p class="text-body-2 text-muted">Mark and manage daily attendance for all employees.</p>
        </div>
        <div class="d-flex ga-2">
          <v-btn
            color="primary"
            variant="tonal"
            prepend-icon="mdi-calendar-weekend"
            class="font-weight-black"
            :loading="markingSundays"
            @click="autoMarkSundays"
          >
            AUTO MARK NON-WORKING DAYS
          </v-btn>
        </div>
      </div>
    </v-col>

    <!-- Month Selector -->
    <v-col cols="12">
      <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-4 mb-2">
        <div class="d-flex align-center ga-4 flex-wrap">
          <v-btn icon="mdi-chevron-left" variant="text" size="small" @click="changeMonth(-1)"></v-btn>
          <h2 class="text-h6 font-weight-black uppercase">{{ monthLabel }}</h2>
          <v-btn icon="mdi-chevron-right" variant="text" size="small" @click="changeMonth(1)"></v-btn>
          <v-spacer></v-spacer>
          <div class="d-flex ga-3 flex-wrap">
            <v-chip color="success" size="small" label class="font-weight-bold"><v-icon start size="14">mdi-check-circle</v-icon> P = Present</v-chip>
            <v-chip color="error" size="small" label class="font-weight-bold"><v-icon start size="14">mdi-close-circle</v-icon> A = Absent</v-chip>
            <v-chip color="warning" size="small" label class="font-weight-bold"><v-icon start size="14">mdi-circle-half-full</v-icon> H = Half Day</v-chip>
            <v-chip color="info" size="small" label class="font-weight-bold"><v-icon start size="14">mdi-calendar-check</v-icon> L = Leave</v-chip>
            <v-chip color="pink" size="small" label class="font-weight-bold"><v-icon start size="14">mdi-star</v-icon> HD = Holiday</v-chip>
            <v-chip size="small" label class="font-weight-bold opacity-60"><v-icon start size="14">mdi-weather-sunny</v-icon> W = Weekend</v-chip>
          </div>
        </div>
      </v-card>
    </v-col>

    <!-- Attendance Grid -->
    <v-col cols="12">
      <v-card class="rounded-xl border-thin bg-surface elevation-0 overflow-x-auto">
        <div v-if="loading" class="d-flex justify-center py-12">
          <v-progress-circular indeterminate color="primary" size="48" width="5"></v-progress-circular>
        </div>
        <div v-else class="attendance-grid">
          <table class="attendance-table">
            <thead>
              <tr>
                <th class="sticky-col employee-col">EMPLOYEE</th>
                <th
                  v-for="day in gridData?.employees?.[0]?.days || []"
                  :key="day.date"
                  class="day-col"
                  :class="{ 'weekend-col': day.is_weekend, 'holiday-col': !!day.holiday }"
                  :title="day.holiday"
                >
                  <div class="text-[10px] font-weight-black opacity-60">{{ day.day }}</div>
                  <div class="text-caption font-weight-black">{{ day.day_num }}</div>
                </th>
                <th class="summary-col">P</th>
                <th class="summary-col">A</th>
                <th class="summary-col">H</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="emp in gridData?.employees || []" :key="emp.user_id">
                <td class="sticky-col employee-col">
                  <div class="d-flex align-center ga-2">
                    <v-avatar color="primary" variant="tonal" size="28" class="rounded">
                      <span class="text-[10px] font-weight-black">{{ emp.name?.charAt(0) }}</span>
                    </v-avatar>
                    <div>
                      <div class="text-caption font-weight-black uppercase text-truncate" style="max-width: 120px;">{{ emp.name }}</div>
                      <div class="text-[10px] text-muted">{{ emp.employee_id }}</div>
                    </div>
                  </div>
                </td>
                <td
                  v-for="day in emp.days"
                  :key="day.date"
                  class="day-cell"
                  :class="cellClass(day)"
                  @click="cycleStatus(emp, day)"
                  :title="day.holiday || (day.is_weekend ? 'Weekend' : '')"
                >
                  <span class="text-[10px] font-weight-black">{{ statusLabel(day.status) }}</span>
                </td>
                <td class="summary-col text-center">
                  <span class="font-weight-black text-success text-caption">{{ emp.summary?.present || 0 }}</span>
                </td>
                <td class="summary-col text-center">
                  <span class="font-weight-black text-error text-caption">{{ emp.summary?.absent || 0 }}</span>
                </td>
                <td class="summary-col text-center">
                  <span class="font-weight-black text-warning text-caption">{{ emp.summary?.halfDay || 0 }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
const api = useApi()
const uiStore = useUiStore()

const loading = ref(false)
const markingSundays = ref(false)
const currentMonth = ref(new Date().toISOString().slice(0, 7)) // YYYY-MM
const gridData = ref<any>(null)

const monthLabel = computed(() => {
  const [y, m] = currentMonth.value.split('-')
  const date = new Date(Number(y), Number(m) - 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()
})

const changeMonth = (delta: number) => {
  const parts = currentMonth.value.split('-').map(Number)
  const y = parts[0] || 2026
  const m = parts[1] || 1
  const d = new Date(y, m - 1 + delta)
  currentMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  fetchAttendance()
}

const isDaySunday = (dayNum: number) => {
  const parts = currentMonth.value.split('-').map(Number)
  const y = parts[0] || 2026
  const m = parts[1] || 1
  return new Date(y, m - 1, dayNum).getDay() === 0
}

const getDayName = (dayNum: number) => {
  const parts = currentMonth.value.split('-').map(Number)
  const y = parts[0] || 2026
  const m = parts[1] || 1
  return new Date(y, m - 1, dayNum).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase().charAt(0)
}

const statusLabel = (status: string | null) => {
  switch (status) {
    case 'present': return 'P'
    case 'absent': return 'A'
    case 'half_day': return 'H'
    case 'leave': return 'L'
    case 'holiday': return 'HD'
    case 'weekend': return 'W'
    default: return '·'
  }
}

const cellClass = (day: any) => {
  const classes: string[] = ['clickable']
  if (day.is_weekend) classes.push('weekend-col')
  if (day.holiday) classes.push('holiday-col')
  
  switch (day.status) {
    case 'present': classes.push('cell-present'); break
    case 'absent': classes.push('cell-absent'); break
    case 'half_day': classes.push('cell-half'); break
    case 'leave': classes.push('cell-leave'); break
    case 'holiday': classes.push('cell-holiday'); break
    case 'weekend': classes.push('cell-weekend'); break
  }
  return classes.join(' ')
}

const statusCycle = [null, 'present', 'absent', 'half_day', 'leave', 'holiday', 'weekend'] as const

const cycleStatus = async (emp: any, day: any) => {
  const currentIdx = statusCycle.indexOf(day.status)
  const nextIdx = (currentIdx + 1) % statusCycle.length
  const newStatus = statusCycle[nextIdx]

  if (!newStatus) {
    // Reset to unmarked — we still need to cycle, skip null
    day.status = null
    return
  }

  day.status = newStatus

  try {
    await api.post('/attendance/mark', {
      user_id: emp.user_id,
      date: day.date,
      status: newStatus,
    })
    // Update summary counts locally
    recalcSummary(emp)
  } catch (err) {
    uiStore.error('Failed to mark attendance')
  }
}

const recalcSummary = (emp: any) => {
  emp.summary = {
    present: emp.days.filter((d: any) => d.status === 'present').length,
    absent: emp.days.filter((d: any) => d.status === 'absent').length,
    halfDay: emp.days.filter((d: any) => d.status === 'half_day').length,
    leave: emp.days.filter((d: any) => d.status === 'leave').length,
    holiday: emp.days.filter((d: any) => d.status === 'holiday').length,
    weekend: emp.days.filter((d: any) => d.status === 'weekend').length,
  }
}

const fetchAttendance = async () => {
  loading.value = true
  try {
    const res: any = await api.get('/attendance', {
      params: { month: currentMonth.value }
    })
    gridData.value = res.data || res
  } catch (err) {
    uiStore.error('Failed to load attendance data')
  } finally {
    loading.value = false
  }
}

const autoMarkSundays = async () => {
  markingSundays.value = true
  try {
    await api.post('/attendance/mark-sundays', { month: currentMonth.value })
    uiStore.success('Sundays marked as weekends!')
    await fetchAttendance()
  } catch (err) {
    uiStore.error('Failed to mark Sundays')
  } finally {
    markingSundays.value = false
  }
}

onMounted(() => {
  fetchAttendance()
})

definePageMeta({
  middleware: 'auth',
  permission: 'attendance.view'
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
.text-muted {
  opacity: 0.6;
}

.attendance-grid {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.attendance-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  white-space: nowrap;
}

.attendance-table th,
.attendance-table td {
  padding: 6px 4px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 11px;
}

.attendance-table th {
  background: rgba(255, 255, 255, 0.02);
  position: sticky;
  top: 0;
  z-index: 2;
}

.employee-col {
  min-width: 180px;
  max-width: 200px;
  text-align: left !important;
  padding-left: 16px !important;
  padding-right: 8px !important;
  background: rgb(var(--v-theme-surface)) !important;
  z-index: 3 !important;
}

.sticky-col {
  position: sticky;
  left: 0;
}

.day-col {
  min-width: 36px;
  max-width: 40px;
}

.day-cell {
  min-width: 36px;
  max-width: 40px;
  cursor: pointer;
  transition: all 0.15s ease;
  border-radius: 4px;
}

.day-cell:hover {
  transform: scale(1.15);
  box-shadow: 0 0 8px rgba(var(--v-theme-primary), 0.3);
}

.clickable {
  cursor: pointer;
}

.cell-present {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
}
.cell-absent {
  background: rgba(244, 67, 54, 0.2);
  color: #F44336;
}
.cell-half {
  background: rgba(255, 152, 0, 0.2);
  color: #FF9800;
}
.cell-leave {
  background: rgba(33, 150, 243, 0.2);
  color: #2196F3;
}
.cell-holiday {
  background: rgba(233, 30, 99, 0.2);
  color: #E91E63;
}
.cell-weekend {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.3);
}
 
.weekend-col {
  background: rgba(255, 255, 255, 0.03) !important;
}

.holiday-col {
  background: rgba(var(--v-theme-primary), 0.05) !important;
}

.summary-col {
  min-width: 32px;
  border-left: 2px solid rgba(255, 255, 255, 0.08);
}
</style>
