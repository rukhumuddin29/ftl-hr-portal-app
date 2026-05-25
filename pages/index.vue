<template>
  <v-row class="dashboard animate-fade">
    <v-col cols="12" v-if="loading" class="d-flex flex-column align-center justify-center py-16">
      <v-progress-circular indeterminate color="primary" size="64" width="6"></v-progress-circular>
      <p class="text-body-2 text-white-50 mt-4">Crunching center data...</p>
    </v-col>

    <template v-else>
      <v-col cols="12" class="d-flex align-center justify-space-between mb-4">
        <div>
          <h1 class="text-h4 font-weight-bold">Welcome back, {{ authStore.user?.name || 'User' }}</h1>
          <p v-if="['admin', 'super_admin', 'bde'].includes(data.user_role)" class="text-body-2 text-muted">Here's a snapshot of your center's performance.</p>
        </div>
        <v-btn
          v-if="['admin', 'super_admin', 'bde'].includes(data.user_role)"
          color="primary"
          prepend-icon="mdi-plus"
          height="48"
          class="font-weight-medium tracking-widest px-6"
          @click="navigateTo('/leads/create')"
        >
          NEW LEAD
        </v-btn>
      </v-col>

      <!-- Minimal Dashboard for Other Roles -->
      <template v-if="!['admin', 'super_admin', 'bde'].includes(data.user_role)">
        <v-col cols="12" lg="4" md="6">
          <DashboardAttendanceWidget class="mb-6" />
        </v-col>
      </template>

      <!-- Full Dashboard for Admin / Super Admin / BDE -->
      <template v-else>

      <!-- Stats Grid -->
      <v-col v-for="stat in statCards" :key="stat.label" cols="12" sm="6" lg="3">
        <v-card class="pa-4 rounded-xl border-thin bg-surface elevation-0 hover-lift">
          <div class="d-flex align-center">
            <v-avatar :color="stat.color" size="48" class="rounded-lg mr-4 elevation-4">
              <v-icon color="white">{{ stat.icon }}</v-icon>
            </v-avatar>
            <div>
              <p class="text-overline font-weight-bold text-muted mb-0 opacity-50">{{ stat.label }}</p>
              <p class="text-h5 font-weight-bold text-primary">{{ stat.value }}</p>
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- Attendance & Today's Tasks & Graphical Presentation -->
      <v-col cols="12">
        <v-row>
          <!-- Left Column: Attendance & Tasks -->
          <v-col cols="12" lg="4">
            <!-- Attendance Widget -->
            <DashboardAttendanceWidget v-if="data.user_role !== 'super_admin'" class="mb-6" />

            <!-- Follow-up Tasks -->
            <v-card class="rounded-xl border-thin bg-surface elevation-0 overflow-hidden d-flex flex-column" style="height: 520px">
              <v-toolbar color="transparent" class="px-4 py-2">
                <v-avatar color="primary" variant="tonal" size="32" class="mr-3">
                  <v-icon color="primary" size="18">mdi-calendar-check</v-icon>
                </v-avatar>
                <v-toolbar-title class="text-subtitle-1 font-weight-bold uppercase tracking-widest">Today's Tasks</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-chip v-if="followUps.counts?.overdue > 0" color="error" size="x-small" class="font-weight-medium animate-pulse">
                  {{ followUps.counts.overdue }} OVERDUE
                </v-chip>
              </v-toolbar>
              
              <v-divider class="border-opacity-25"></v-divider>

              <v-tabs v-model="activeTaskTab" color="primary" grow density="compact" class="px-2">
                <v-tab value="today" class="text-[10px] font-weight-bold">TODAY ({{ followUps.counts?.today || 0 }})</v-tab>
                <v-tab value="overdue" class="text-[10px] font-weight-bold">OVERDUE ({{ followUps.counts?.overdue || 0 }})</v-tab>
              </v-tabs>

              <v-window v-model="activeTaskTab" class="flex-grow-1 overflow-y-auto">
                <v-window-item value="today" class="pa-4">
                  <div v-if="!followUps.today?.length" class="text-center py-12 opacity-50">
                    <v-icon size="40" class="mb-2">mdi-check-circle-outline</v-icon>
                    <p class="text-caption font-weight-medium uppercase">All caught up for today!</p>
                  </div>
                  <v-list v-else bg-color="transparent" class="pa-0">
                    <v-card v-for="lead in followUps.today" :key="lead.id" variant="tonal" class="mb-3 border-thin rounded-lg pa-3 hover-lift dashboard-task-card">
                      <div class="d-flex justify-space-between align-start mb-1">
                        <span class="text-subtitle-2 font-weight-medium text-uppercase link-hover" @click="navigateTo(`/leads/${lead.id}`)">{{ lead.name }}</span>
                        <v-chip :color="getStatusColor(lead.status)" size="x-small" label class="text-[9px] font-weight-medium">{{ lead.status.toUpperCase() }}</v-chip>
                      </div>
                      <div class="d-flex align-center justify-space-between mt-3">
                        <div class="d-flex ga-1">
                          <v-btn icon="mdi-phone" size="x-small" color="success" variant="tonal" @click="navigateTo(`/leads/${lead.id}`)"></v-btn>
                          <v-btn icon="mdi-clock-outline" size="x-small" color="warning" variant="tonal" @click="snoozeFollowUp(lead.id)"></v-btn>
                          <v-btn icon="mdi-check" size="x-small" color="primary" variant="tonal" @click="completeFollowUp(lead.id)"></v-btn>
                        </div>
                        <span class="text-[10px] font-weight-medium text-muted uppercase">Today</span>
                      </div>
                    </v-card>
                  </v-list>
                </v-window-item>

                <v-window-item value="overdue" class="pa-4">
                  <div v-if="!followUps.overdue?.length" class="text-center py-12 opacity-50">
                    <v-icon size="40" class="mb-2">mdi-shield-check-outline</v-icon>
                    <p class="text-caption font-weight-medium uppercase">No overdue tasks.</p>
                  </div>
                  <v-list v-else bg-color="transparent" class="pa-0">
                    <v-card v-for="lead in followUps.overdue" :key="lead.id" variant="tonal" color="error" class="mb-3 border-thin rounded-lg pa-3 hover-lift border-error opacity-100">
                      <div class="d-flex justify-space-between align-start mb-1">
                        <span class="text-subtitle-2 font-weight-medium text-uppercase link-hover" @click="navigateTo(`/leads/${lead.id}`)">{{ lead.name }}</span>
                        <v-chip color="error" size="x-small" label class="text-[9px] font-weight-medium">OVERDUE</v-chip>
                      </div>
                      <div class="d-flex align-center justify-space-between mt-3">
                        <div class="d-flex ga-1">
                          <v-btn icon="mdi-phone" size="x-small" color="error" variant="flat" @click="navigateTo(`/leads/${lead.id}`)"></v-btn>
                          <v-btn icon="mdi-clock-outline" size="x-small" color="error" variant="tonal" @click="snoozeFollowUp(lead.id)"></v-btn>
                          <v-btn icon="mdi-check" size="x-small" color="error" variant="tonal" @click="completeFollowUp(lead.id)"></v-btn>
                        </div>
                        <span class="text-[10px] font-weight-medium text-error uppercase">{{ format(new Date(lead.follow_up_date), 'MMM dd') }}</span>
                      </div>
                    </v-card>
                  </v-list>
                </v-window-item>
              </v-window>
            </v-card>
          </v-col>

          <!-- Lead Distribution Chart (Right Side) -->
          <v-col cols="12" lg="8">
            <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6 overflow-hidden position-relative h-100">
              <div class="d-flex align-center justify-space-between mb-8 flex-wrap ga-4">
                <div class="d-flex align-center ga-3">
                  <v-avatar color="primary" variant="tonal" size="40" class="rounded-lg">
                    <v-icon color="primary" size="20">mdi-chart-bar</v-icon>
                  </v-avatar>
                  <div>
                    <h2 class="text-h6 font-weight-bold">Lead Distribution</h2>
                    <div class="d-flex align-center ga-1">
                      <p class="text-[10px] text-muted uppercase font-weight-medium tracking-widest">{{ currentMonthName }} {{ currentYear }}</p>
                      <v-btn variant="text" color="primary" size="x-small" class="font-weight-medium ml-2" @click="navigateTo('/leads/pipeline')">VIEW PIPELINE</v-btn>
                      <v-chip v-if="selectedBde && bdes.length" size="x-small" color="primary" variant="tonal" label class="text-[9px] font-weight-medium ml-2">
                        FILTERED BY: {{ bdes.find(b => b.id === selectedBde)?.name?.toUpperCase() }}
                      </v-chip>
                    </div>
                  </div>
                </div>
                
                <div class="d-flex align-center ga-4 flex-wrap">
                  <!-- BDE Filter for Admins -->
                  <div v-if="['admin', 'super_admin'].includes(data.user_role)" style="min-width: 200px">
                    <v-select
                      v-model="selectedBde"
                      :items="bdes"
                      item-title="name"
                      item-value="id"
                      label="FILTER BY USER"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="text-caption font-weight-medium custom-select"
                      clearable
                      @update:model-value="handleFilterChange"
                    >
                      <template v-slot:prepend-inner>
                        <v-icon size="small" color="primary" class="mr-2">mdi-account-filter</v-icon>
                      </template>
                    </v-select>
                  </div>

                  <!-- Month Navigation -->
                  <div class="d-flex align-center ga-2 bg-black-thin pa-1 rounded-pill">
                    <v-btn icon="mdi-chevron-left" variant="text" density="comfortable" size="small" class="rounded-circle" @click="prevMonth"></v-btn>
                    <span class="text-caption font-weight-medium mx-2 text-primary uppercase" style="min-width: 100px; text-align: center;">{{ currentMonthName }}</span>
                    <v-btn icon="mdi-chevron-right" variant="text" density="comfortable" size="small" class="rounded-circle" @click="nextMonth" :disabled="isCurrentMonth"></v-btn>
                  </div>
                </div>
              </div>
          
          <div style="min-height: 300px;" class="chart-container">
            <ClientOnly>
              <apexchart
                v-if="!leadStatsLoading"
                type="bar"
                height="300"
                :options="chartOptions"
                :series="chartSeries"
              ></apexchart>
              <div v-else class="d-flex align-center justify-center" style="height: 300px">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </div>
            </ClientOnly>
          </div>

          <!-- Interested Leads List -->
          <v-divider class="border-opacity-10 mt-2"></v-divider>
          <div class="px-2 pt-4 pb-2">
            <div class="d-flex align-center justify-space-between mb-3">
              <div class="d-flex align-center ga-2">
                <v-icon color="success" size="18">mdi-heart-pulse</v-icon>
                <span class="text-subtitle-2 font-weight-medium uppercase tracking-widest">Hot Leads</span>
                <v-chip v-if="interestedLeads.length" color="success" size="x-small" variant="tonal" class="font-weight-medium">
                  {{ interestedLeads.length }}
                </v-chip>
              </div>
              <v-btn variant="text" color="primary" size="x-small" class="font-weight-medium" @click="navigateTo('/leads?status=interested')">VIEW ALL</v-btn>
            </div>

            <div v-if="interestedLeadsLoading" class="d-flex justify-center py-6">
              <v-progress-circular indeterminate color="success" size="28"></v-progress-circular>
            </div>

            <div v-else-if="!interestedLeads.length" class="text-center py-6 opacity-40">
              <v-icon size="32" class="mb-2">mdi-heart-off-outline</v-icon>
              <p class="text-caption font-weight-medium uppercase">No interested leads yet</p>
            </div>

            <div v-else class="interested-leads-list" style="max-height: 360px; overflow-y: auto;">
              <v-card
                v-for="lead in interestedLeads"
                :key="lead.id"
                variant="tonal"
                class="mb-2 rounded-lg pa-3 hover-lift dashboard-task-card cursor-pointer"
                @click="navigateTo(`/leads/${lead.id}`)"
              >
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center ga-3" style="min-width: 0;">
                    <v-avatar :color="getInterestedStatusColor(lead.status)" variant="tonal" size="36" class="rounded-lg flex-shrink-0">
                      <v-icon size="18" :color="getInterestedStatusColor(lead.status)">{{ getInterestedStatusIcon(lead.status) }}</v-icon>
                    </v-avatar>
                    <div style="min-width: 0;">
                      <div class="text-subtitle-2 font-weight-medium text-uppercase text-truncate">{{ lead.name }}</div>
                      <div class="d-flex align-center ga-2 flex-wrap">
                        <span v-if="lead.interested_course" class="text-[10px] text-muted font-weight-medium">{{ lead.interested_course.name }}</span>
                        <span v-if="['admin', 'super_admin'].includes(data.user_role) && lead.assigned_to" class="text-[10px] font-weight-medium" style="color: rgb(var(--v-theme-primary))">
                          <v-icon size="10" class="mr-1">mdi-account</v-icon>{{ lead.assigned_to.name }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="d-flex align-center ga-2 flex-shrink-0">
                    <v-chip :color="getInterestedStatusColor(lead.status)" size="x-small" label class="text-[9px] font-weight-medium px-2">
                      {{ lead.status === 'demo_scheduled' ? 'DEMO' : lead.status.toUpperCase() }}
                    </v-chip>
                    <v-icon size="14" class="opacity-30">mdi-chevron-right</v-icon>
                  </div>
                </div>
              </v-card>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-col>

      <v-col cols="12">
        <v-card class="rounded-xl border-thin bg-surface elevation-0 overflow-hidden">
          <v-toolbar color="transparent" class="px-4">
            <v-toolbar-title class="text-h6 font-weight-bold">Recent Leads</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn variant="text" color="primary" class="font-weight-medium text-caption" @click="navigateTo('/leads')">VIEW ALL</v-btn>
          </v-toolbar>
          
          <v-table class="bg-transparent">
            <thead>
              <tr class="text-overline font-weight-bold opacity-50">
                <th class="px-6 text-left">NAME</th>
                <th class="px-6 text-left">SOURCE</th>
                <th class="px-6 text-left">STATUS</th>
                <th class="px-6 text-right">ADDED</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="lead in data.recent_leads" :key="lead.id">
                <td class="px-6 py-4">
                  <div class="font-weight-medium text-subtitle-2 text-uppercase link-hover" @click="navigateTo(`/leads/${lead.id}`)">
                    {{ lead.name }}
                  </div>
                  <div class="text-caption text-muted">{{ lead.phone }}</div>
                </td>
                <td class="px-6 py-4 text-caption font-weight-medium text-muted">{{ lead.source || 'Direct' }}</td>
                <td class="px-6 py-4">
                  <v-chip :color="getStatusColor(lead.status)" size="x-small" label class="font-weight-medium px-3">
                    {{ lead.status.toUpperCase() }}
                  </v-chip>
                </td>
                <td class="px-6 py-4 text-right text-caption text-muted">{{ timeAgo(lead.created_at) }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>


      </template>
    </template>
  </v-row>
</template>

<script setup lang="ts">
import { format, subMonths, addMonths, isSameMonth } from 'date-fns'

const api = useApi()
const authStore = useAuthStore()
const loading = ref(true)
const data = ref<any>({})

// Filter states
const currentDate = ref(new Date())
const leadStats = ref<any[]>([])
const leadStatsLoading = ref(false)
const bdes = ref<any[]>([])
const selectedBde = ref<number | null>(null)

const followUps = ref<any>({ overdue: [], today: [], upcoming: [], counts: { overdue: 0, today: 0, upcoming: 0 } })
const followUpsLoading = ref(false)
const activeTaskTab = ref('today')

const interestedLeads = ref<any[]>([])
const interestedLeadsLoading = ref(false)

const currentMonthName = computed(() => format(currentDate.value, 'MMMM'))
const currentYear = computed(() => currentDate.value.getFullYear())
const isCurrentMonth = computed(() => isSameMonth(currentDate.value, new Date()))

const fetchFollowUps = async () => {
  followUpsLoading.value = true
  try {
    const res: any = await api.get('/dashboard/follow-ups', {
      params: { user_id: selectedBde.value }
    })
    followUps.value = res.data
  } catch (err) {
    console.error('Follow-ups load failed', err)
  } finally {
    followUpsLoading.value = false
  }
}

const snoozeFollowUp = async (leadId: number) => {
  try {
    await api.patch(`/leads/${leadId}/snooze`, { days: 1 })
    fetchFollowUps()
  } catch (err) {
    console.error('Snooze failed', err)
  }
}

const completeFollowUp = async (leadId: number) => {
  try {
    await api.patch(`/leads/${leadId}/complete`)
    fetchFollowUps()
  } catch (err) {
    console.error('Complete failed', err)
  }
}

const fetchLeadStats = async () => {
  leadStatsLoading.value = true
  try {
    const month = currentDate.value.getMonth() + 1
    const year = currentDate.value.getFullYear()
    const res: any = await api.get('/dashboard/lead-stats', {
      params: { 
        month, 
        year,
        user_id: selectedBde.value
      }
    })
    // Extract data if nested in 'data' key
    leadStats.value = res.data || []
  } catch (err) {
    console.error('Lead stats load failed', err)
  } finally {
    leadStatsLoading.value = false
  }
}

const fetchBdes = async () => {
  try {
    const res: any = await api.get('/users/bdes')
    console.log('BDEs response:', res)
    bdes.value = res.data || []
  } catch (err) {
    console.error('BDEs load failed', err)
  }
}

const prevMonth = () => {
  currentDate.value = subMonths(currentDate.value, 1)
  fetchLeadStats()
}

const nextMonth = () => {
  currentDate.value = addMonths(currentDate.value, 1)
  fetchLeadStats()
}

const themeStore = useThemeStore()
const isDark = computed(() => themeStore.theme === 'dark')

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'Inter, sans-serif',
    foreColor: isDark.value ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.7)',
    background: 'transparent'
  },
  plotOptions: {
    bar: {
      borderRadius: 6,
      distributed: true,
      columnWidth: '50%',
    }
  },
  dataLabels: {
    enabled: true,
    style: {
      fontSize: '10px',
      fontWeight: '900',
    },
    dropShadow: { enabled: false }
  },
  colors: [
    '#3b82f6', // new - blue
    '#6366f1', // contacted - indigo
    '#22c55e', // interested - success
    '#eab308', // thinking - warning
    '#f59e0b', // demo_scheduled - orange
    '#6b7280', // no_response - gray
    '#8b5cf6', // callback - purple
    '#ef4444', // converted - primary
    '#ef4444', // lost - error
    '#9ca3af', // not_interested - light gray
  ],
  xaxis: {
    categories: leadStats.value.map(s => s.status.replace('_', ' ').toUpperCase()),
    labels: {
      style: {
        fontSize: '10px',
        fontWeight: 600,
        colors: isDark.value ? undefined : '#000000'
      }
    },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: {
      style: {
        fontSize: '10px',
        fontWeight: 600,
        colors: isDark.value ? undefined : ['#000000']
      }
    }
  },
  grid: {
    borderColor: isDark.value ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } }
  },
  legend: { show: false },
  tooltip: {
    theme: isDark.value ? 'dark' : 'light',
    y: {
      formatter: (val: number) => `${val} Leads`
    }
  }
}))

const chartSeries = computed(() => [
  {
    name: 'Leads',
    data: leadStats.value.map(s => s.count)
  }
])

const fetchDashboard = async () => {
  loading.value = true
  try {
    const res: any = await api.get('/dashboard')
    data.value = res.data
    if (['admin', 'super_admin'].includes(data.value.user_role)) {
      fetchBdes()
    }
  } catch (err) {
    console.error('Dashboard load failed')
  } finally {
    loading.value = false
  }
}

const statCards = computed(() => {
  const isAdmin = ['admin', 'super_admin'].includes(data.value.user_role)
  const isBde = data.value.user_role === 'bde'
  const stats = data.value.stats || {}
  const followUpCount = (followUps.value.counts?.today || 0) + (followUps.value.counts?.overdue || 0)
  const isOverdue = (followUps.value.counts?.overdue || 0) > 0

  if (isBde) {
    return [
      { label: 'TOTAL LEADS', value: stats.total_leads || 0, icon: 'mdi-account-group', color: 'indigo' },
      { 
        label: "TODAY'S FOLLOW-UPS", 
        value: followUpCount, 
        icon: 'mdi-phone-clock', 
        color: isOverdue ? 'error' : 'success' 
      },
      { label: 'INTERESTED', value: stats.interested_leads || 0, icon: 'mdi-heart-outline', color: 'pink' },
      { label: 'DEMO SCHEDULED', value: stats.demo_scheduled || 0, icon: 'mdi-calendar-check', color: 'blue' },
    ]
  }

  return [
    { label: 'TOTAL LEADS', value: stats.total_leads || 0, icon: 'mdi-account-group', color: 'indigo' },
    { label: 'NEW LEADS TODAY', value: stats.new_leads_today || 0, icon: 'mdi-star-outline', color: 'blue' },
    { label: 'MONTH EXPENSES', value: `₹${((stats.expenses_this_month || 0) / 1000).toFixed(1)}k`, icon: 'mdi-receipt-text-outline', color: 'error' },
    { 
      label: "PENDING FOLLOW-UPS", 
      value: followUpCount, 
      icon: 'mdi-calendar-alert', 
      color: isOverdue ? 'error' : 'warning' 
    },
  ]
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new': return 'blue'
    case 'contacted': return 'indigo'
    case 'interested': return 'success'
    case 'converted': return 'primary'
    default: return 'grey'
  }
}

const timeAgo = (dateStr: string) => {
  const date: any = new Date(dateStr)
  const now: any = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}M`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}H`
  return `${Math.floor(diffInSeconds / 86400)}D`
}

const fetchInterestedLeads = async () => {
  interestedLeadsLoading.value = true
  try {
    const res: any = await api.get('/dashboard/interested-leads', {
      params: { user_id: selectedBde.value }
    })
    interestedLeads.value = res.data || []
  } catch (err) {
    console.error('Interested leads load failed', err)
  } finally {
    interestedLeadsLoading.value = false
  }
}

const getInterestedStatusColor = (status: string) => {
  switch (status) {
    case 'interested': return 'success'
    case 'thinking': return 'warning'
    case 'demo_scheduled': return 'amber'
    default: return 'success'
  }
}

const getInterestedStatusIcon = (status: string) => {
  switch (status) {
    case 'interested': return 'mdi-heart'
    case 'thinking': return 'mdi-head-lightbulb'
    case 'demo_scheduled': return 'mdi-calendar-star'
    default: return 'mdi-heart'
  }
}

onMounted(() => {
  fetchDashboard()
  fetchLeadStats()
  fetchFollowUps()
  fetchInterestedLeads()
})

// Update fetchBdes call to clear data
const handleFilterChange = () => {
  fetchLeadStats()
  fetchFollowUps()
  fetchInterestedLeads()
}

definePageMeta({
  middleware: 'auth'
})
</script>

<style scoped>
.v-card :deep(.hover-lift) {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5) !important;
}

.v-table :deep(tr:hover) {
  background: rgba(var(--v-theme-surface-variant), 0.1) !important;
}

.animate-fade {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}
.animate-pulse {
  animation: pulse 2s infinite ease-in-out;
}

.dashboard-task-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}
.dashboard-task-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
}

.border-error {
  border: 1px solid rgba(var(--v-theme-error), 0.3) !important;
  background: rgba(var(--v-theme-error), 0.05) !important;
}

.text-white-50 {
  color: rgba(255, 255, 255, 0.5) !important;
}

.border-thin {
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.bg-black-thin {
  background: rgba(0, 0, 0, 0.2);
}

.link-hover {
  cursor: pointer;
}
.link-hover:hover {
  color: rgb(var(--v-theme-primary));
  text-decoration: underline;
}

.cursor-pointer {
  cursor: pointer;
}

.custom-select :deep(.v-field) {
  border-radius: 12px !important;
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.custom-select :deep(.v-field__input) {
  font-weight: 800 !important;
  font-size: 11px !important;
  letter-spacing: 0.5px !important;
}

/* Custom Scrollbar for Tasks */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
