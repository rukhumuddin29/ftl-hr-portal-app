<template>
  <v-row class="animate-fade">
    <v-col cols="12" class="d-flex align-center justify-space-between mb-4">
      <div>
        <h1 class="text-h4 font-weight-bold">EXPENSES & VENDORS</h1>
        <p class="text-body-2 text-muted">Track operational costs and payroll payouts.</p>
      </div>
      <v-btn
        color="rose-darken-1"
        prepend-icon="mdi-receipt-plus-outline"
        height="48"
        class="font-weight-medium tracking-widest px-6"
        @click="navigateTo('/expenses/create')"
      >
        LOG EXPENSE
      </v-btn>
    </v-col>

    <v-col cols="12">
      <v-card class="rounded-xl border-thin bg-surface elevation-0 overflow-hidden">
        <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>
        <v-table class="bg-transparent">
          <thead>
            <tr class="text-overline font-weight-bold opacity-50">
              <th class="px-6 text-left">REFERENCE / DATE</th>
              <th class="px-6 text-left">TITLE & CATEGORY</th>
              <th class="px-6 text-left">STATUS</th>
              <th class="px-6 text-right">AMOUNT</th>
              <th class="px-6 text-right">CONTROLS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ex in expenses" :key="ex.id" class="hover-row">
              <td class="px-6 py-4">
                <div class="text-[10px] font-mono text-primary font-bold">{{ ex.expense_number }}</div>
                <div class="text-caption font-weight-medium">{{ formatDate(ex.expense_date) }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="font-weight-medium text-subtitle-2 text-uppercase">
                  {{ ex.title }}
                </div>
                <div class="text-[10px] text-muted uppercase font-weight-medium opacity-50">{{ ex.category?.name }}</div>
              </td>
              <td class="px-6 py-4">
                 <v-chip :color="getStatusColor(ex.status)" size="x-small" label class="font-weight-medium px-3">
                    {{ ex.status.toUpperCase() }}
                  </v-chip>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="text-h6 font-weight-bold text-rose-400">₹{{ Math.round(ex.amount) }}</div>
                <div class="text-[10px] text-muted uppercase font-weight-medium opacity-50">{{ ex.payment_mode }}</div>
              </td>
              <td class="px-6 py-4 text-right">
                <v-btn 
                  v-if="ex.status === 'pending' && authStore.hasPermission('expenses.approve')"
                  icon="mdi-check" 
                  variant="tonal" 
                  size="small" 
                  color="success" 
                  class="mr-1"
                  @click="approve(ex.id)"
                ></v-btn>
                <v-btn icon="mdi-file-eye-outline" variant="text" size="small" color="primary"></v-btn>
              </td>
            </tr>
            <tr v-if="expenses.length === 0 && !loading">
              <td colspan="5" class="text-center py-16 opacity-50">
                <v-icon size="48" class="mb-4">mdi-receipt-text-minus-outline</v-icon>
                <p class="text-overline font-weight-bold">No expenses logged yet</p>
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
const authStore = useAuthStore()
const expenses = ref<any[]>([])
const loading = ref(true)

const fetchExpenses = async () => {
  loading.value = true
  try {
    const res: any = await api.get('/expenses')
    expenses.value = res.data?.data || []
  } catch (err) {
    console.error('Failed to load expenses')
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'success'
    case 'rejected': return 'error'
    case 'pending': return 'warning'
    default: return 'grey'
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const approve = async (id: number) => {
  try {
    await api.post(`/expenses/${id}/approve`)
    fetchExpenses()
  } catch (err) {}
}

onMounted(() => {
  fetchExpenses()
})

definePageMeta({
  middleware: 'auth'
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
