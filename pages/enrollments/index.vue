<template>
  <v-row class="animate-fade">
    <v-col cols="12" class="d-flex align-center justify-space-between mb-4">
      <div>
        <h1 class="text-h4 font-weight-black">ENROLLMENTS</h1>
        <p class="text-body-2 text-muted">Manage active student admissions and financial status.</p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-account-plus"
        height="48"
        class="font-weight-bold tracking-widest px-6"
        @click="navigateTo('/enrollments/create')"
      >
        ADMIT STUDENT
      </v-btn>
    </v-col>

    <!-- Stats Row for Enrollments -->
    <v-col cols="12" sm="6" md="3">
      <v-card class="pa-4 rounded-xl border-thin bg-surface elevation-0">
        <p class="text-overline font-weight-black text-muted mb-1 opacity-50">ACTIVE STUDENTS</p>
        <p class="text-h5 font-weight-black text-primary">{{ enrollments.length }}</p>
      </v-card>
    </v-col>

    <!-- Enrollment Table -->
    <v-col cols="12">
      <v-card class="rounded-xl border-thin bg-surface elevation-0 overflow-hidden">
        <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>
        <v-table class="bg-transparent">
          <thead>
            <tr class="text-overline font-weight-black opacity-50">
              <th class="px-6 text-left">STUDENT / ENROLL ID</th>
              <th class="px-6 text-left">COURSE & BATCH</th>
              <th class="px-6 text-left">FINANCIAL STATUS</th>
              <th class="px-6 text-left">STATUS</th>
              <th class="px-6 text-right">CONTROLS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="en in enrollments" :key="en.id" class="hover-row">
              <td class="px-6 py-4">
                <div class="font-weight-black text-subtitle-2 text-uppercase clickable" @click="navigateTo(`/enrollments/${en.id}`)">
                  {{ en.lead?.name || 'STUDENT' }}
                </div>
                <div class="text-[10px] font-mono text-primary font-bold">{{ en.enrollment_number }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-caption font-weight-bold uppercase">{{ en.course?.name }}</div>
                <div class="text-[10px] text-muted uppercase font-weight-black opacity-50">JOINED: {{ formatDate(en.start_date) }}</div>
              </td>
              <td class="px-6 py-4" style="min-width: 180px">
                <div class="d-flex justify-space-between text-[10px] font-weight-black mb-1">
                   <span class="text-success">PAID: ₹{{ en.total_paid || 0 }}</span>
                   <span class="text-muted">DUE: ₹{{ en.agreed_price - (en.total_paid || 0) }}</span>
                </div>
                <v-progress-linear
                  :model-value="(en.total_paid / en.agreed_price) * 100"
                  color="success"
                  height="6"
                  rounded
                  bg-color="grey"
                  bg-opacity="0.2"
                ></v-progress-linear>
              </td>
              <td class="px-6 py-4">
                 <v-chip :color="getStatusColor(en.status)" size="x-small" label class="font-weight-black px-3">
                    {{ en.status.toUpperCase() }}
                  </v-chip>
              </td>
              <td class="px-6 py-4 text-right">
                <v-btn icon="mdi-currency-inr" variant="tonal" size="small" color="success" class="mr-1" @click="navigateTo(`/payments/create?enrollment_id=${en.id}`)"></v-btn>
                <v-btn icon="mdi-eye-outline" variant="text" size="small" color="primary" @click="navigateTo(`/enrollments/${en.id}`)"></v-btn>
              </td>
            </tr>
            <tr v-if="enrollments.length === 0 && !loading">
              <td colspan="5" class="text-center py-16 opacity-50">
                <v-icon size="48" class="mb-4">mdi-clipboard-text-outline</v-icon>
                <p class="text-overline font-weight-black">No active enrollments found</p>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
const api = useApi()
const enrollments = ref<any[]>([])
const loading = ref(true)

const fetchEnrollments = async () => {
  loading.value = true
  try {
    const res: any = await api.get('/enrollments')
    enrollments.value = res.data?.data || []
  } catch (err) {
    console.error('Failed to load enrollments')
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'success'
    case 'completed': return 'primary'
    case 'on_hold': return 'warning'
    case 'dropped': return 'error'
    default: return 'grey'
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(() => {
  fetchEnrollments()
})

definePageMeta({
  middleware: 'auth',
  permission: 'enrollments.view'
})
</script>

<style scoped>
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
