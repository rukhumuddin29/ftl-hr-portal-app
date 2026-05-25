<template>
  <v-container class="animate-fade py-8">
    <v-row>
      <!-- Page Header -->
      <v-col cols="12" class="mb-6">
        <h1 class="text-h4 font-weight-bold uppercase">Workday Setup</h1>
        <p class="text-body-2 text-muted">Configure organization-wide weekends and official holidays.</p>
      </v-col>

      <!-- Weekend & Attendance Configuration -->
      <v-col cols="12" md="5">
        <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-8 mb-6">
          <h3 class="text-h6 font-weight-bold mb-6 uppercase text-primary d-flex align-center ga-2">
            <v-icon>mdi-calendar-week-outline</v-icon>
            Weekend Configuration
          </h3>
          <p class="text-body-2 text-muted mb-6">Select the days of the week that are considered non-working days (weekends).</p>
          
          <div class="d-flex flex-wrap ga-3 justify-center mb-8">
            <v-btn
              v-for="(day, index) in weekDays"
              :key="index"
              :color="selectedWeekends.includes(index) ? 'primary' : 'surface'"
              variant="flat"
              class="rounded-lg font-weight-medium"
              size="large"
              width="60"
              @click="toggleWeekend(index)"
              :elevation="selectedWeekends.includes(index) ? 4 : 0"
              :class="{ 'border-thin': !selectedWeekends.includes(index) }"
            >
              {{ day.charAt(0) }}
            </v-btn>
          </div>
        </v-card>

        <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-8">
          <h3 class="text-h6 font-weight-bold mb-6 uppercase text-primary d-flex align-center ga-2">
            <v-icon>mdi-clock-outline</v-icon>
            Attendance Rules
          </h3>
          
          <v-row dense>
             <v-col cols="6">
                <v-text-field v-model="settings.office_start_time" label="OFFICE START" type="time" variant="outlined" density="compact"></v-text-field>
             </v-col>
             <v-col cols="6">
                <v-text-field v-model="settings.office_end_time" label="OFFICE END" type="time" variant="outlined" density="compact"></v-text-field>
             </v-col>
             <v-col cols="12">
                <v-text-field v-model.number="settings.grace_period_minutes" label="GRACE PERIOD (MINUTES)" type="number" variant="outlined" density="compact" hint="Late marking starts after this" persistent-hint></v-text-field>
             </v-col>
             <v-col cols="12" class="mt-4">
                <v-text-field v-model.number="settings.half_day_threshold_hours" label="HALF-DAY THRESHOLD (HOURS)" type="number" step="0.5" variant="outlined" density="compact" hint="Working less than this counts as Half Day" persistent-hint></v-text-field>
             </v-col>
          </v-row>

          <v-btn
            color="primary"
            block
            size="large"
            class="font-weight-medium rounded-lg mt-6"
            :loading="savingSettings"
            @click="saveGeneralSettings"
          >
            SAVE WORKDAY SETTINGS
          </v-btn>
        </v-card>
      </v-col>

      <!-- Holiday Management -->
      <v-col cols="12" md="7">
        <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-8 mb-6">
          <div class="d-flex align-center justify-space-between mb-6">
            <h3 class="text-h6 font-weight-bold uppercase text-primary d-flex align-center ga-2">
              <v-icon>mdi-calendar-star-outline</v-icon>
              Official Holidays
            </h3>
            <v-btn
              color="primary"
              variant="tonal"
              size="small"
              prepend-icon="mdi-plus"
              class="font-weight-medium rounded-lg"
              @click="showAddDialog = true"
            >
              ADD HOLIDAY
            </v-btn>
          </div>

          <v-table class="bg-transparent">
            <thead>
              <tr class="text-overline font-weight-bold text-muted">
                <th class="text-left px-0">HOLIDAY NAME</th>
                <th class="text-left">DATE</th>
                <th class="text-center">RECURRING</th>
                <th class="text-right pr-0">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="holiday in holidays" :key="holiday.id" class="border-b">
                <td class="font-weight-medium uppercase px-0">{{ holiday.name }}</td>
                <td class="text-body-2">{{ formatDate(holiday.holiday_date) }}</td>
                <td class="text-center">
                  <v-chip
                    v-if="holiday.is_recurring"
                    color="success"
                    size="x-small"
                    variant="tonal"
                    label
                    class="font-weight-medium"
                  >YES</v-chip>
                  <span v-else class="text-muted">No</span>
                </td>
                <td class="text-right pr-0">
                  <v-btn
                    icon="mdi-delete-outline"
                    variant="text"
                    color="error"
                    size="small"
                    @click="deleteHoliday(holiday.id)"
                  ></v-btn>
                </td>
              </tr>
              <tr v-if="holidays.length === 0">
                <td colspan="4" class="text-center py-8 text-muted italic">No holidays configured yet.</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add Holiday Dialog -->
    <v-dialog v-model="showAddDialog" max-width="450">
      <v-card class="rounded-xl pa-6 bg-surface">
        <v-card-title class="text-h6 font-weight-bold uppercase mb-4">Add Official Holiday</v-card-title>
        <v-card-text class="pa-0">
          <v-text-field
            v-model="newHoliday.name"
            label="Holiday Name"
            variant="outlined"
            placeholder="e.g. Independence Day"
            class="mb-4"
          ></v-text-field>
          
          <v-text-field
            v-model="newHoliday.holiday_date"
            label="Holiday Date"
            type="date"
            variant="outlined"
            class="mb-4"
          ></v-text-field>

          <v-switch
            v-model="newHoliday.is_recurring"
            label="Recurring every year"
            color="primary"
            hide-details
            class="mb-4"
          ></v-switch>
        </v-card-text>
        <v-card-actions class="ga-4 px-0 pb-0 mt-4">
          <v-btn block variant="text" class="font-weight-medium" @click="showAddDialog = false">CANCEL</v-btn>
          <v-btn block color="primary" size="large" class="font-weight-medium rounded-lg" @click="addHoliday" :loading="addingHoliday">SAVE HOLIDAY</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Leave Policy Configuration -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-8">
          <h3 class="text-h6 font-weight-bold mb-6 uppercase text-primary d-flex align-center ga-2">
            <v-icon>mdi-clipboard-list-outline</v-icon>
            Leave Policy Configuration
          </h3>
          <p class="text-body-2 text-muted mb-8">Define annual quotas and rules for various leave types.</p>

          <v-row>
            <v-col v-for="(policy, key) in leavePolicies" :key="key" cols="12" md="4">
              <v-card variant="outlined" class="rounded-xl pa-6 bg-card">
                 <div class="text-subtitle-1 font-weight-bold uppercase mb-4 text-primary">{{ policy.label }}</div>
                 
                 <v-text-field
                   v-model.number="policy.annual_quota"
                   label="Annual Quota (Days)"
                   type="number"
                   variant="outlined"
                   density="compact"
                   class="mb-4"
                   hide-details
                 ></v-text-field>

                 <v-switch
                   v-model="policy.allow_half_day"
                   label="Allow Half Day"
                   color="primary"
                   density="compact"
                   hide-details
                   class="mb-2"
                 ></v-switch>

                 <div v-if="key === 'earned_leave'">
                    <v-switch
                      v-model="policy.carry_forward"
                      label="Carry Forward"
                      color="primary"
                      density="compact"
                      hide-details
                      class="mb-2"
                    ></v-switch>
                    <v-text-field
                      v-if="policy.carry_forward"
                      v-model.number="policy.carry_forward_max"
                      label="Max Carry Forward"
                      type="number"
                      variant="outlined"
                      density="compact"
                      hide-details
                    ></v-text-field>
                 </div>
              </v-card>
            </v-col>
          </v-row>

          <v-btn
            color="primary"
            size="large"
            class="font-weight-medium rounded-lg mt-8"
            :loading="savingPolicy"
            @click="saveLeavePolicy"
          >
            SAVE LEAVE POLICY
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

const api = useApi()
const uiStore = useUiStore()

const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const selectedWeekends = ref<number[]>([0]) // Default Sunday
const holidays = ref<any[]>([])
const loading = ref(true)
const savingSettings = ref(false)
const savingPolicy = ref(false)
const addingHoliday = ref(false)
const showAddDialog = ref(false)

const leavePolicies = reactive<any>({
  sick_leave: { label: 'Sick Leave', annual_quota: 12, allow_half_day: true },
  casual_leave: { label: 'Casual Leave', annual_quota: 12, allow_half_day: true },
  earned_leave: { label: 'Earned Leave', annual_quota: 15, allow_half_day: false, carry_forward: true, carry_forward_max: 15 }
})

const newHoliday = reactive({
  name: '',
  holiday_date: '',
  is_recurring: false
})

const settings = reactive({
    weekends: [0] as number[],
    office_start_time: '09:00',
    office_end_time: '18:00',
    grace_period_minutes: 15,
    half_day_threshold_hours: 4.5
})

const fetchData = async () => {
  try {
    const res: any = await api.get('/workday-setup')
    if (res.data.settings.weekends) {
      settings.weekends = res.data.settings.weekends
      selectedWeekends.value = res.data.settings.weekends
    }
    if (res.data.settings.office_start_time) settings.office_start_time = res.data.settings.office_start_time
    if (res.data.settings.office_end_time) settings.office_end_time = res.data.settings.office_end_time
    if (res.data.settings.grace_period_minutes) settings.grace_period_minutes = parseInt(res.data.settings.grace_period_minutes)
    if (res.data.settings.half_day_threshold_hours) settings.half_day_threshold_hours = parseFloat(res.data.settings.half_day_threshold_hours)
    
    if (res.data.settings.leave_policy) {
      Object.assign(leavePolicies, res.data.settings.leave_policy)
    }
    holidays.value = res.data.holidays
  } catch (err) {
    uiStore.error('Failed to load workday settings')
  } finally {
    loading.value = false
  }
}

const saveLeavePolicy = async () => {
    savingPolicy.value = true
    try {
        await api.post('/workday-setup/leave-policy', leavePolicies)
        uiStore.success('Leave policy updated successfully')
    } catch {
        uiStore.error('Failed to update leave policy')
    } finally {
        savingPolicy.value = false
    }
}

const toggleWeekend = (index: number) => {
  if (selectedWeekends.value.includes(index)) {
    selectedWeekends.value = selectedWeekends.value.filter(i => i !== index)
  } else {
    selectedWeekends.value.push(index)
  }
  settings.weekends = selectedWeekends.value
}

const saveGeneralSettings = async () => {
  savingSettings.value = true
  try {
    await api.post('/workday-setup/settings', settings)
    uiStore.success('Workday settings updated')
  } catch (err) {
    uiStore.error('Failed to update settings')
  } finally {
    savingSettings.value = false
  }
}

const addHoliday = async () => {
  if (!newHoliday.name || !newHoliday.holiday_date) {
    uiStore.error('Please fill all fields')
    return
  }

  addingHoliday.value = true
  try {
    const res: any = await api.post('/workday-setup/holidays', newHoliday)
    holidays.value.push(res.data)
    holidays.value.sort((a, b) => new Date(a.holiday_date).getTime() - new Date(b.holiday_date).getTime())
    showAddDialog.value = false
    // Reset form
    newHoliday.name = ''
    newHoliday.holiday_date = ''
    newHoliday.is_recurring = false
    uiStore.success('Holiday added successfully')
  } catch (err) {
    uiStore.error('Failed to add holiday')
  } finally {
    addingHoliday.value = false
  }
}

const deleteHoliday = async (id: number) => {
  if (!confirm('Are you sure you want to delete this holiday?')) return

  try {
    await api.delete(`/workday-setup/holidays/${id}`)
    holidays.value = holidays.value.filter(h => h.id !== id)
    uiStore.success('Holiday deleted')
  } catch (err) {
    uiStore.error('Failed to delete holiday')
  }
}

const formatDate = (date: string) => {
  return format(new Date(date), 'dd MMM yyyy')
}

onMounted(() => {
  fetchData()
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
</style>
