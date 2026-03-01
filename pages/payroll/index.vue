<template>
  <v-row class="animate-fade">
    <!-- Header -->
    <v-col cols="12" class="mb-2">
      <div class="d-flex justify-space-between align-center flex-wrap ga-3">
        <div>
          <h1 class="text-h4 font-weight-black">PAYROLL</h1>
          <p class="text-body-2 text-muted">Generate, approve and pay salaries for employees.</p>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-calculator"
          class="font-weight-black px-6"
          height="46"
          @click="generateDialog = true"
        >
          GENERATE PAYROLL
        </v-btn>
      </div>
    </v-col>

    <!-- Summary Cards -->
    <v-col cols="12" sm="6" lg="3" v-for="card in summaryCards" :key="card.label">
      <v-card class="pa-4 rounded-xl border-thin bg-surface elevation-0 hover-lift">
        <div class="d-flex align-center">
          <v-avatar :color="card.color" size="48" class="rounded-lg mr-4 elevation-4">
            <v-icon color="white">{{ card.icon }}</v-icon>
          </v-avatar>
          <div>
            <p class="text-overline font-weight-black text-muted mb-0 opacity-50">{{ card.label }}</p>
            <p class="text-h5 font-weight-black" :class="`text-${card.color}`">{{ card.value }}</p>
          </div>
        </div>
      </v-card>
    </v-col>

    <!-- Filters -->
    <v-col cols="12">
      <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-4">
        <v-row dense>
          <v-col cols="12" sm="3">
            <v-text-field
              v-model="filters.month"
              label="MONTH"
              type="month"
              variant="outlined"
              density="compact"
              hide-details
              @update:model-value="fetchAll"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="3">
            <v-select
              v-model="filters.status"
              label="STATUS"
              :items="statusOptions"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="fetchPayrolls"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" class="d-flex ga-2 justify-end">
            <v-btn
              color="success"
              variant="tonal"
              class="font-weight-black"
              prepend-icon="mdi-check-all"
              :disabled="!selectedIds.length"
              @click="bulkApprove"
            >
              APPROVE ({{ selectedIds.length }})
            </v-btn>
            <v-btn
              color="primary"
              variant="tonal"
              class="font-weight-black"
              prepend-icon="mdi-cash-multiple"
              :disabled="!selectedApprovedIds.length"
              @click="bulkPay"
            >
              PAY ({{ selectedApprovedIds.length }})
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-col>

    <!-- Payroll Table -->
    <v-col cols="12">
      <v-card class="rounded-xl border-thin bg-surface elevation-0">
        <v-data-table-server
          v-model="selected"
          :headers="headers"
          :items="payrolls"
          :items-length="totalItems"
          :loading="loadingPayrolls"
          :items-per-page="20"
          show-select
          item-value="id"
          class="bg-transparent"
          @update:options="onTableUpdate"
        >
          <template #item.user="{ item }">
            <div class="py-2">
              <div class="font-weight-black text-subtitle-2 uppercase">{{ item.user?.name }}</div>
              <div class="text-[10px] text-muted">{{ item.user?.employee_id }}</div>
            </div>
          </template>

          <template #item.month="{ item }">
            <span class="font-weight-bold text-caption">{{ formatMonth(item.month) }}</span>
          </template>

          <template #item.total_earnings="{ item }">
            <span class="font-weight-black text-primary">₹{{ formatCurrency(item.total_earnings) }}</span>
          </template>

          <template #item.total_deductions="{ item }">
            <span class="font-weight-bold text-error text-caption">-₹{{ formatCurrency(item.total_deductions) }}</span>
          </template>

          <template #item.net_salary="{ item }">
            <span class="font-weight-black text-success">₹{{ formatCurrency(item.net_salary) }}</span>
          </template>

          <template #item.effective_working_days="{ item }">
            <span class="text-caption font-weight-bold">{{ item.effective_working_days }} / 30</span>
          </template>

          <template #item.status="{ item }">
            <v-chip
              :color="statusColor(item.status)"
              size="x-small"
              label
              class="font-weight-black px-3"
            >
              {{ item.status?.toUpperCase() }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex ga-1">
              <v-btn icon="mdi-eye" variant="text" size="x-small" @click="viewPayslip(item)"></v-btn>
              <v-btn
                v-if="item.status === 'draft'"
                icon="mdi-check"
                variant="text"
                size="x-small"
                color="success"
                @click="approveOne(item)"
              ></v-btn>
              <v-btn
                v-if="item.status === 'approved'"
                icon="mdi-cash"
                variant="text"
                size="x-small"
                color="primary"
                @click="payOne(item)"
              ></v-btn>
            </div>
          </template>
        </v-data-table-server>
      </v-card>
    </v-col>

    <!-- Generate Dialog -->
    <v-dialog v-model="generateDialog" max-width="480" persistent>
      <v-card class="rounded-xl pa-6">
        <h3 class="text-h6 font-weight-black mb-4">GENERATE PAYROLL</h3>
        <p class="text-body-2 text-muted mb-4">
          This will calculate salaries for all active employees with salary structures for the selected month.
        </p>
        <v-text-field
          v-model="generateMonth"
          label="PAYROLL MONTH"
          type="month"
          variant="outlined"
          density="compact"
          hide-details
          class="mb-6"
        ></v-text-field>
        <div class="d-flex ga-2">
          <v-btn
            color="primary"
            class="font-weight-black flex-grow-1"
            :loading="generating"
            @click="generatePayroll"
          >
            GENERATE
          </v-btn>
          <v-btn
            variant="text"
            class="font-weight-bold"
            @click="generateDialog = false"
          >
            CANCEL
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Payslip Dialog -->
    <v-dialog v-model="payslipDialog" max-width="700" scrollable>
      <v-card v-if="viewingPayroll" class="rounded-xl">
        <v-toolbar color="transparent" class="px-6">
          <v-toolbar-title class="font-weight-black">PAYSLIP — {{ viewingPayroll.month }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="payslipDialog = false"></v-btn>
        </v-toolbar>
        <v-card-text class="pa-6">
          <!-- Employee info -->
          <div class="d-flex align-center ga-3 mb-6">
            <v-avatar color="primary" size="48" class="rounded-lg">
              <span class="text-h6 font-weight-black">{{ viewingPayroll.user?.name?.charAt(0) }}</span>
            </v-avatar>
            <div>
              <h3 class="text-subtitle-1 font-weight-black uppercase">{{ viewingPayroll.user?.name }}</h3>
              <p class="text-caption text-muted">{{ viewingPayroll.user?.employee_id }} · {{ viewingPayroll.user?.designation }}</p>
            </div>
            <v-spacer></v-spacer>
            <v-chip :color="statusColor(viewingPayroll.status)" label class="font-weight-black">
              {{ viewingPayroll.status?.toUpperCase() }}
            </v-chip>
          </div>

          <v-divider class="mb-4 opacity-25"></v-divider>

          <!-- Attendance Summary -->
          <p class="text-[10px] font-weight-black text-primary uppercase mb-2">Attendance Summary</p>
          <v-row dense class="mb-4">
            <v-col cols="4" sm="2" v-for="item in attendanceItems" :key="item.label">
              <div class="text-center pa-2 rounded-lg" style="background: rgba(255,255,255,0.03);">
                <p class="text-h6 font-weight-black" :class="item.colorClass">{{ item.value }}</p>
                <p class="text-[10px] font-weight-black text-muted uppercase">{{ item.label }}</p>
              </div>
            </v-col>
          </v-row>

          <!-- Earnings -->
          <p class="text-[10px] font-weight-black text-success uppercase mb-2">Earnings</p>
          <v-table density="compact" class="bg-transparent mb-4">
            <tbody>
              <tr v-for="item in earningsItems" :key="item.label">
                <td class="text-caption font-weight-bold">{{ item.label }}</td>
                <td class="text-right font-weight-black text-caption">₹{{ formatCurrency(item.value) }}</td>
              </tr>
              <tr class="font-weight-black" style="border-top: 2px solid rgba(255,255,255,0.1);">
                <td>TOTAL EARNINGS</td>
                <td class="text-right text-success">₹{{ formatCurrency(viewingPayroll.total_earnings) }}</td>
              </tr>
            </tbody>
          </v-table>

          <!-- Deductions -->
          <p class="text-[10px] font-weight-black text-error uppercase mb-2">Deductions</p>
          <v-table density="compact" class="bg-transparent mb-4">
            <tbody>
              <tr v-for="item in deductionItems" :key="item.label">
                <td class="text-caption font-weight-bold">{{ item.label }}</td>
                <td class="text-right font-weight-black text-caption">₹{{ formatCurrency(item.value) }}</td>
              </tr>
              <tr class="font-weight-black" style="border-top: 2px solid rgba(255,255,255,0.1);">
                <td>TOTAL DEDUCTIONS</td>
                <td class="text-right text-error">₹{{ formatCurrency(viewingPayroll.total_deductions) }}</td>
              </tr>
            </tbody>
          </v-table>

          <!-- Net -->
          <v-card variant="outlined" class="pa-4 rounded-lg text-center" style="background: rgba(var(--v-theme-primary), 0.05);">
            <p class="text-[10px] font-weight-black text-muted uppercase">Net Salary (Take Home)</p>
            <p class="text-h4 font-weight-black text-primary">₹{{ formatCurrency(viewingPayroll.net_salary) }}</p>
          </v-card>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup lang="ts">
const api = useApi()
const uiStore = useUiStore()

const loadingPayrolls = ref(false)
const generating = ref(false)
const generateDialog = ref(false)
const payslipDialog = ref(false)
const generateMonth = ref(new Date().toISOString().slice(0, 7))
const viewingPayroll = ref<any>(null)
const selected = ref<number[]>([])

const payrolls = ref<any[]>([])
const totalItems = ref(0)
const summary = ref<any>({})

const filters = reactive({
  month: new Date().toISOString().slice(0, 7),
  status: null as string | null,
})

const statusOptions = [
  { title: 'Draft', value: 'draft' },
  { title: 'Approved', value: 'approved' },
  { title: 'Paid', value: 'paid' },
]

const headers = [
  { title: 'Employee', key: 'user', sortable: false },
  { title: 'Month', key: 'month', sortable: false },
  { title: 'Days', key: 'effective_working_days', sortable: false },
  { title: 'Earnings', key: 'total_earnings', sortable: false, align: 'end' as const },
  { title: 'Deductions', key: 'total_deductions', sortable: false, align: 'end' as const },
  { title: 'Net Salary', key: 'net_salary', sortable: false, align: 'end' as const },
  { title: 'Status', key: 'status', sortable: false },
  { title: '', key: 'actions', sortable: false },
]

// Computed
const selectedIds = computed(() => {
  return payrolls.value
    .filter((p: any) => selected.value.includes(p.id) && p.status === 'draft')
    .map((p: any) => p.id)
})

const selectedApprovedIds = computed(() => {
  return payrolls.value
    .filter((p: any) => selected.value.includes(p.id) && p.status === 'approved')
    .map((p: any) => p.id)
})

const summaryCards = computed(() => [
  { label: 'EMPLOYEES', value: summary.value.total_employees || 0, icon: 'mdi-account-group', color: 'indigo' },
  { label: 'TOTAL NET', value: `₹${formatCurrency(summary.value.total_net || 0)}`, icon: 'mdi-cash-multiple', color: 'success' },
  { label: 'DRAFT', value: summary.value.draft || 0, icon: 'mdi-file-edit-outline', color: 'warning' },
  { label: 'PAID', value: summary.value.paid || 0, icon: 'mdi-check-circle', color: 'primary' },
])

const attendanceItems = computed(() => {
  if (!viewingPayroll.value) return []
  const p = viewingPayroll.value
  return [
    { label: 'Present', value: p.days_present, colorClass: 'text-success' },
    { label: 'Absent', value: p.days_absent, colorClass: 'text-error' },
    { label: 'Half Day', value: p.days_half, colorClass: 'text-warning' },
    { label: 'Leave', value: p.paid_leaves, colorClass: 'text-info' },
    { label: 'Holiday', value: p.holidays, colorClass: '' },
    { label: 'Effective', value: p.effective_working_days, colorClass: 'text-primary' },
  ]
})

const earningsItems = computed(() => {
  if (!viewingPayroll.value) return []
  const p = viewingPayroll.value
  return [
    { label: 'Basic Salary', value: p.basic_earned },
    { label: 'HRA', value: p.hra_earned },
    { label: 'DA', value: p.da_earned },
    { label: 'Special Allowance', value: p.special_earned },
    { label: 'Other Allowances', value: p.other_earned },
  ]
})

const deductionItems = computed(() => {
  if (!viewingPayroll.value) return []
  const p = viewingPayroll.value
  return [
    { label: 'Employee PF (12%)', value: p.pf_employee },
    { label: 'Employee ESI', value: p.esi_employee },
    { label: 'TDS', value: p.tds },
    { label: 'Other Deductions', value: p.other_deductions },
  ]
})

const formatCurrency = (val: number) => {
  if (!val && val !== 0) return '0'
  return new Intl.NumberFormat('en-IN').format(Math.round(Number(val) * 100) / 100)
}

const formatMonth = (month: string) => {
  if (!month) return ''
  const [y, m] = month.split('-')
  const d = new Date(Number(y), Number(m) - 1)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()
}

const statusColor = (status: string) => {
  switch (status) {
    case 'draft': return 'warning'
    case 'approved': return 'success'
    case 'paid': return 'primary'
    default: return 'grey'
  }
}

const fetchAll = () => {
  fetchPayrolls()
  fetchSummary()
}

const onTableUpdate = (options: any) => {
  fetchPayrolls()
}

const fetchPayrolls = async () => {
  loadingPayrolls.value = true
  try {
    const res: any = await api.get('/payroll', {
      params: {
        month: filters.month,
        status: filters.status || undefined,
        per_page: 20,
      }
    })
    const data = res.data
    payrolls.value = data?.data || []
    totalItems.value = data?.total || 0
  } catch (err) {
    uiStore.error('Failed to load payrolls')
  } finally {
    loadingPayrolls.value = false
  }
}

const fetchSummary = async () => {
  try {
    const res: any = await api.get('/payroll/summary', {
      params: { month: filters.month }
    })
    summary.value = res.data || {}
  } catch {}
}

const generatePayroll = async () => {
  generating.value = true
  try {
    const res: any = await api.post('/payroll/generate', { month: generateMonth.value })
    const data = res.data || {}
    const genCount = data.generated?.length || 0
    const skipCount = data.skipped?.length || 0
    const errCount = data.errors?.length || 0
    uiStore.success(`${genCount} payrolls generated, ${skipCount} skipped, ${errCount} errors`)
    generateDialog.value = false
    filters.month = generateMonth.value
    fetchAll()
  } catch (err: any) {
    uiStore.error(err.data?.message || 'Failed to generate payroll')
  } finally {
    generating.value = false
  }
}

const viewPayslip = (item: any) => {
  viewingPayroll.value = item
  payslipDialog.value = true
}

const approveOne = async (item: any) => {
  try {
    await api.post(`/payroll/${item.id}/approve`)
    uiStore.success('Payroll approved')
    fetchAll()
  } catch (err: any) {
    uiStore.error(err.data?.message || 'Failed to approve')
  }
}

const payOne = async (item: any) => {
  try {
    await api.post(`/payroll/${item.id}/pay`)
    uiStore.success('Payroll marked as paid')
    fetchAll()
  } catch (err: any) {
    uiStore.error(err.data?.message || 'Failed to mark as paid')
  }
}

const bulkApprove = async () => {
  try {
    await api.post('/payroll/bulk-approve', { ids: selectedIds.value })
    uiStore.success(`${selectedIds.value.length} payrolls approved`)
    selected.value = []
    fetchAll()
  } catch (err: any) {
    uiStore.error(err.data?.message || 'Bulk approve failed')
  }
}

const bulkPay = async () => {
  try {
    await api.post('/payroll/bulk-pay', { ids: selectedApprovedIds.value })
    uiStore.success(`${selectedApprovedIds.value.length} payrolls paid`)
    selected.value = []
    fetchAll()
  } catch (err: any) {
    uiStore.error(err.data?.message || 'Bulk pay failed')
  }
}

onMounted(() => {
  fetchAll()
})

definePageMeta({
  middleware: 'auth',
  permission: 'payroll.view'
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
.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5) !important;
}
</style>
