<template>
  <v-row class="animate-fade">
    <v-col cols="12" class="d-flex align-center justify-space-between mb-4">
      <div>
        <h1 class="text-h4 font-weight-black">REVENUE HISTORY</h1>
        <p class="text-body-2 text-muted">Detailed log of all incoming student payments.</p>
      </div>
      <v-btn
        color="success"
        prepend-icon="mdi-cash-plus"
        height="48"
        class="font-weight-bold tracking-widest px-6"
        @click="navigateTo('/payments/create')"
      >
        RECORD PAYMENT
      </v-btn>
    </v-col>

    <v-col cols="12">
      <v-card class="rounded-xl border-thin bg-surface elevation-0 overflow-hidden">
        <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>
        <v-table class="bg-transparent">
          <thead>
            <tr class="text-overline font-weight-black opacity-50">
              <th class="px-6 text-left">RECEIPT / DATE</th>
              <th class="px-6 text-left">STUDENT & ENROLLMENT</th>
              <th class="px-6 text-left">MODE</th>
              <th class="px-6 text-right">AMOUNT</th>
              <th class="px-6 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pay in payments" :key="pay.id" class="hover-row">
              <td class="px-6 py-4">
                <div class="text-[10px] font-mono text-primary font-bold">{{ pay.receipt_number }}</div>
                <div class="text-caption font-weight-bold">{{ formatDate(pay.payment_date) }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="font-weight-black text-subtitle-2 text-uppercase" @click="navigateTo(`/enrollments/${pay.enrollment_id}`)">
                  {{ pay.enrollment?.lead?.name }}
                </div>
                <div class="text-[10px] text-muted uppercase font-weight-black opacity-50">{{ pay.enrollment?.enrollment_number }}</div>
              </td>
              <td class="px-6 py-4">
                 <v-chip :color="getModeColor(pay.payment_mode)" size="x-small" label class="font-weight-black px-3">
                    {{ pay.payment_mode.toUpperCase() }}
                  </v-chip>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="text-h6 font-weight-black">₹{{ Math.round(pay.amount) }}</div>
                <div class="text-[10px] text-muted uppercase font-weight-black opacity-50">{{ pay.payment_type || 'PARTIAL' }}</div>
              </td>
              <td class="px-6 py-4 text-right">
                <v-btn icon="mdi-printer-outline" variant="text" size="small" color="primary" class="mr-1"></v-btn>
                <v-btn icon="mdi-information-outline" variant="text" size="small" color="primary"></v-btn>
              </td>
            </tr>
            <tr v-if="payments.length === 0 && !loading">
              <td colspan="5" class="text-center py-16 opacity-50">
                <v-icon size="48" class="mb-4">mdi-cash-remove</v-icon>
                <p class="text-overline font-weight-black">No payment records found</p>
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
const payments = ref<any[]>([])
const loading = ref(true)

const fetchPayments = async () => {
  loading.value = true
  try {
    const res: any = await api.get('/payments')
    payments.value = res.data?.data || []
  } catch (err) {
    console.error('Failed to load payments')
  } finally {
    loading.value = false
  }
}

const getModeColor = (mode: string) => {
  switch (mode) {
    case 'upi': return 'emerald'
    case 'cash': return 'blue'
    case 'bank_transfer': return 'purple'
    default: return 'grey'
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(() => {
  fetchPayments()
})

definePageMeta({
  middleware: 'auth',
  permission: 'payments.view'
})
</script>

<style scoped>
.border-thin {
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}
.text-white-50 {
  color: rgba(255, 255, 255, 0.5) !important;
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
