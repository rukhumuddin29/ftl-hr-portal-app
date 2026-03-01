<template>
  <v-card class="rounded-xl border-thin bg-surface elevation-0 overflow-hidden attendance-widget position-relative">
    <div class="pa-5 d-flex align-center justify-space-between border-b bg-black-thin">
      <div class="d-flex align-center ga-3">
        <v-avatar color="primary" variant="tonal" rounded="lg" size="40">
          <v-icon color="primary">mdi-clock-check-outline</v-icon>
        </v-avatar>
        <div>
          <h3 class="text-subtitle-1 font-weight-black uppercase tracking-widest">Attendance</h3>
          <p class="text-[10px] text-muted font-weight-bold uppercase">{{ todayDate }}</p>
        </div>
      </div>
      <div class="text-right">
        <div class="text-h6 font-weight-black tabular-nums">{{ currentTime }}</div>
      </div>
    </div>

    <div class="pa-6">
      <!-- Loading State -->
      <div v-if="loading" class="d-flex justify-center py-4">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>

      <!-- Checked Out State -->
      <div v-else-if="attendance && attendance.check_out" class="text-center py-2 animate-fade">
        <v-icon color="success" size="48" class="mb-2">mdi-check-decagram</v-icon>
        <h4 class="text-h6 font-weight-black uppercase">Clocked Out</h4>
        <p class="text-caption text-muted font-weight-bold mb-4">Great work! You've completed your day.</p>
        
        <v-row dense class="bg-black-thin rounded-lg pa-3 mt-2">
            <v-col cols="4">
                <div class="text-[9px] text-muted font-weight-black uppercase">IN</div>
                <div class="text-subtitle-2 font-weight-black">{{ formatTime(attendance.check_in) }}</div>
            </v-col>
            <v-col cols="4" class="border-x border-opacity-25">
                <div class="text-[9px] text-muted font-weight-black uppercase">OUT</div>
                <div class="text-subtitle-2 font-weight-black">{{ formatTime(attendance.check_out) }}</div>
            </v-col>
            <v-col cols="4">
                <div class="text-[9px] text-muted font-weight-black uppercase">TOTAL</div>
                <div class="text-subtitle-2 font-weight-black text-primary">{{ attendance.working_hours }}h</div>
            </v-col>
        </v-row>
      </div>

      <!-- Checked In State -->
      <div v-else-if="attendance && attendance.check_in" class="text-center py-2 animate-fade">
        <div class="pulse-container mb-4">
            <div class="pulse-ring bg-primary"></div>
            <v-avatar color="primary" size="64" class="elevation-4">
                <v-icon color="white" size="32">mdi-run</v-icon>
            </v-avatar>
        </div>
        <h4 class="text-h6 font-weight-black uppercase">At Work</h4>
        <p class="text-caption text-muted font-weight-bold mb-4">Started at {{ formatTime(attendance.check_in) }}</p>
        
        <v-btn
          color="error"
          variant="elevated"
          block
          height="52"
          rounded="xl"
          class="font-weight-black tracking-widest"
          prepend-icon="mdi-logout-variant"
          :loading="processing"
          @click="handleCheckOut"
        >
          CHECK OUT
        </v-btn>
      </div>

      <!-- Initial State (Not Checked In) -->
      <div v-else class="text-center py-2 animate-fade">
        <v-avatar color="grey-darken-3" variant="tonal" size="64" class="mb-4">
            <v-icon size="32">mdi-login-variant</v-icon>
        </v-avatar>
        <h4 class="text-h6 font-weight-black uppercase">Not Clocked In</h4>
        <p class="text-caption text-muted font-weight-bold mb-4">Ready to start your day?</p>
        
        <v-btn
          color="primary"
          block
          height="52"
          rounded="xl"
          class="font-weight-black tracking-widest shadow-primary-20"
          prepend-icon="mdi-login-variant"
          :loading="processing"
          @click="handleCheckIn"
        >
          CHECK IN
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

const api = useApi()
const uiStore = useUiStore()

const loading = ref(true)
const processing = ref(false)
const attendance = ref<any>(null)
const currentTime = ref('')
const todayDate = format(new Date(), 'EEEE, MMMM do')

const updateTime = () => {
    currentTime.value = format(new Date(), 'hh:mm:ss a')
}

let timer: any = null

const fetchStatus = async () => {
    loading.value = true
    try {
        const res: any = await api.get('/attendance/my-today')
        attendance.value = res.data
    } catch (err) {
        console.error('Failed to fetch attendance status')
    } finally {
        loading.value = false
    }
}

const getCoords = (): Promise<{lat: number, lng: number} | null> => {
    return new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null)
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({lat: pos.coords.latitude, lng: pos.coords.longitude}),
            () => resolve(null),
            { timeout: 5000 }
        )
    })
}

const handleCheckIn = async () => {
    processing.value = true
    const coords = await getCoords()
    try {
        const res: any = await api.post('/attendance/check-in', coords || {})
        attendance.value = res.data
        uiStore.success(res.message || 'Successfully checked in! Have a great day.')
    } catch (err: any) {
        uiStore.error(err.data?.message || 'Check-in failed')
    } finally {
        processing.value = false
    }
}

const handleCheckOut = async () => {
    processing.value = true
    const coords = await getCoords()
    try {
        const res: any = await api.post('/attendance/check-out', coords || {})
        attendance.value = res.data
        uiStore.success(res.message || 'Successfully checked out. Total hours: ' + (res.data?.working_hours || ''))
    } catch (err: any) {
        uiStore.error(err.data?.message || 'Check-out failed')
    } finally {
        processing.value = false
    }
}

const formatTime = (t: string | undefined | null) => {
    if (!t) return '--:--'
    // Laravel time is HH:MM:SS
    const parts = t.split(':')
    const date = new Date()
    date.setHours(parseInt(String(parts[0] ?? '0')), parseInt(String(parts[1] ?? '0')))
    return format(date, 'hh:mm a')
}

onMounted(() => {
    fetchStatus()
    updateTime()
    timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
    if (timer) clearInterval(timer)
})
</script>

<style scoped>
.attendance-widget {
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
}
.bg-black-thin {
    background: rgba(0, 0, 0, 0.2);
}
.shadow-primary-20 {
    box-shadow: 0 8px 16px 0 rgba(var(--v-theme-primary), 0.2) !important;
}

.pulse-container {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.pulse-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    animation: ripple 2s infinite;
    opacity: 0.5;
}

@keyframes ripple {
    0% {
        transform: scale(1);
        opacity: 0.5;
    }
    100% {
        transform: scale(2);
        opacity: 0;
    }
}

.animate-fade {
    animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
}

.border-x {
    border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.tabular-nums {
    font-variant-numeric: tabular-nums;
}
</style>
