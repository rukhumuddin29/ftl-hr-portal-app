<template>
  <v-row class="animate-fade">
    <!-- Header -->
    <v-col cols="12" class="mb-2">
      <div class="d-flex justify-space-between align-center">
        <div>
          <h1 class="text-h4 font-weight-black">SALARY STRUCTURES</h1>
          <p class="text-body-2 text-muted">Define CTC breakup and compensation for each employee.</p>
        </div>
      </div>
    </v-col>

    <!-- Employee List with Salary Info -->
    <v-col cols="12" lg="5">
      <v-card class="rounded-xl border-thin bg-surface elevation-0">
        <v-toolbar color="transparent" class="px-4">
          <v-toolbar-title class="text-subtitle-1 font-weight-black uppercase">Employees</v-toolbar-title>
        </v-toolbar>
        <div class="px-4 pb-2">
          <v-text-field
            v-model="search"
            label="SEARCH EMPLOYEE"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            @update:model-value="debouncedFetch"
          ></v-text-field>
        </div>
        <v-list bg-color="transparent" class="px-2" density="compact">
          <v-list-item
            v-for="emp in employees"
            :key="emp.id"
            @click="selectEmployee(emp)"
            :active="selectedEmployee?.id === emp.id"
            color="primary"
            class="rounded-lg mb-1"
          >
            <template v-slot:prepend>
              <v-avatar color="primary" variant="tonal" size="36" class="rounded-lg mr-3">
                <span class="text-caption font-weight-black">{{ emp.name?.charAt(0) }}</span>
              </v-avatar>
            </template>
            <v-list-item-title class="font-weight-bold text-subtitle-2 uppercase">{{ emp.name }}</v-list-item-title>
            <v-list-item-subtitle class="text-caption text-muted">
              {{ emp.employee_id }} · {{ emp.designation || 'N/A' }}
            </v-list-item-subtitle>
            <template v-slot:append>
              <div class="text-right">
                <v-chip
                  v-if="emp.salary_structure"
                  color="success"
                  size="x-small"
                  label
                  class="font-weight-black"
                >
                  ₹{{ formatCurrency(emp.salary_structure.ctc_annual) }}
                </v-chip>
                <v-chip v-else color="warning" size="x-small" label class="font-weight-black">
                  NOT SET
                </v-chip>
              </div>
            </template>
          </v-list-item>
          <div v-if="employees.length === 0 && !loading" class="text-center py-8 opacity-50">
            <v-icon size="40" class="mb-3">mdi-account-search</v-icon>
            <p class="text-caption font-weight-bold uppercase">No employees found</p>
          </div>
        </v-list>
        <div v-if="loading" class="d-flex justify-center py-6">
          <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
        </div>
      </v-card>
    </v-col>

    <!-- Salary Structure Form -->
    <v-col cols="12" lg="7">
      <v-card v-if="selectedEmployee" class="rounded-xl border-thin bg-surface elevation-0 pa-6">
        <div class="d-flex align-center ga-3 mb-6">
          <v-avatar color="primary" size="48" class="rounded-lg">
            <span class="text-h6 font-weight-black">{{ selectedEmployee.name?.charAt(0) }}</span>
          </v-avatar>
          <div>
            <h2 class="text-subtitle-1 font-weight-black uppercase">{{ selectedEmployee.name }}</h2>
            <p class="text-caption text-muted">{{ selectedEmployee.employee_id }} · {{ selectedEmployee.designation || 'N/A' }}</p>
          </div>
        </div>

        <v-divider class="mb-6 opacity-25"></v-divider>

        <v-form @submit.prevent="saveSalaryStructure">
          <!-- CTC -->
          <div class="mb-6">
            <p class="text-[10px] font-weight-black text-primary uppercase mb-2">Annual Cost to Company</p>
            <v-text-field
              v-model.number="form.ctc_annual"
              label="CTC (ANNUAL) ₹"
              type="number"
              variant="outlined"
              density="compact"
              hide-details
              @update:model-value="autoCalculateBreakup"
            ></v-text-field>
            <p class="text-[10px] text-muted mt-1">
              Monthly Gross: <span class="font-weight-black text-primary">₹{{ formatCurrency(monthlyGross) }}</span>
              &nbsp;·&nbsp; Per Day (÷30): <span class="font-weight-black text-primary">₹{{ formatCurrency(perDaySalary) }}</span>
            </p>
          </div>

          <!-- Breakup -->
          <p class="text-[10px] font-weight-black text-primary uppercase mb-3">Monthly Salary Breakup</p>
          <v-row dense>
            <v-col cols="6">
              <v-text-field
                v-model.number="form.basic_salary"
                label="BASIC SALARY ₹"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                class="mb-3"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="form.hra"
                label="HRA ₹"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                class="mb-3"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="form.da"
                label="DA ₹"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                class="mb-3"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="form.special_allowance"
                label="SPECIAL ALLOWANCE ₹"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                class="mb-3"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="form.other_allowances"
                label="OTHER ALLOWANCES ₹"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                class="mb-3"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="form.pf_employer"
                label="PF (EMPLOYER) ₹"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                class="mb-3"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="form.esi_employer"
                label="ESI (EMPLOYER) ₹"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                class="mb-3"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="form.effective_from"
                label="EFFECTIVE FROM"
                type="date"
                variant="outlined"
                density="compact"
                hide-details
                class="mb-3"
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- Summary -->
          <v-card variant="outlined" class="pa-4 rounded-lg mt-4 mb-6 bg-primary-lighten">
            <v-row dense>
              <v-col cols="4" class="text-center">
                <p class="text-[10px] font-weight-black text-muted uppercase">Monthly Gross</p>
                <p class="text-h6 font-weight-black text-primary">₹{{ formatCurrency(monthlyGross) }}</p>
              </v-col>
              <v-col cols="4" class="text-center">
                <p class="text-[10px] font-weight-black text-muted uppercase">PF Employee (12%)</p>
                <p class="text-h6 font-weight-black text-error">₹{{ formatCurrency(pfEmployee) }}</p>
              </v-col>
              <v-col cols="4" class="text-center">
                <p class="text-[10px] font-weight-black text-muted uppercase">Net Take Home</p>
                <p class="text-h6 font-weight-black text-success">₹{{ formatCurrency(netTakeHome) }}</p>
              </v-col>
            </v-row>
          </v-card>

          <v-btn
            type="submit"
            color="primary"
            block
            size="large"
            rounded="lg"
            class="font-weight-black"
            :loading="saving"
            :disabled="!isFormValid"
          >
            SAVE SALARY STRUCTURE
          </v-btn>
        </v-form>
      </v-card>

      <!-- Empty State -->
      <v-card v-else class="rounded-xl border-thin bg-surface elevation-0 d-flex align-center justify-center" style="min-height: 400px;">
        <div class="text-center opacity-40">
          <v-icon size="64" class="mb-4">mdi-account-cash-outline</v-icon>
          <p class="text-subtitle-1 font-weight-black uppercase">Select an employee</p>
          <p class="text-caption">Choose an employee from the list to view or set their salary structure.</p>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
const api = useApi()
const uiStore = useUiStore()

const loading = ref(false)
const saving = ref(false)
const search = ref('')
const employees = ref<any[]>([])
const selectedEmployee = ref<any>(null)

const form = reactive({
  ctc_annual: 0,
  basic_salary: 0,
  hra: 0,
  da: 0,
  special_allowance: 0,
  pf_employer: 0,
  esi_employer: 0,
  other_allowances: 0,
  effective_from: new Date().toISOString().split('T')[0]
})

// Computed
const monthlyGross = computed(() => {
  return form.basic_salary + form.hra + form.da + form.special_allowance + form.other_allowances
})

const perDaySalary = computed(() => {
  return Math.round((monthlyGross.value / 30) * 100) / 100
})

const pfEmployee = computed(() => {
  return Math.min(Math.round(form.basic_salary * 0.12 * 100) / 100, 1800)
})

const netTakeHome = computed(() => {
  const esi = monthlyGross.value <= 21000 ? Math.round(monthlyGross.value * 0.0075 * 100) / 100 : 0
  return Math.round((monthlyGross.value - pfEmployee.value - esi) * 100) / 100
})

const isFormValid = computed(() => {
  return form.ctc_annual > 0 && form.basic_salary > 0 && form.effective_from
})

const formatCurrency = (val: number) => {
  if (!val) return '0'
  return new Intl.NumberFormat('en-IN').format(Math.round(val * 100) / 100)
}

let debounceTimer: any = null
const debouncedFetch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchEmployees(), 300)
}

const fetchEmployees = async () => {
  loading.value = true
  try {
    const res: any = await api.get('/salary-structures', {
      params: { search: search.value }
    })
    const data = res.data?.data || res.data || []
    employees.value = Array.isArray(data) ? data : []
  } catch (err) {
    uiStore.error('Failed to load employees')
  } finally {
    loading.value = false
  }
}

const selectEmployee = (emp: any) => {
  selectedEmployee.value = emp
  if (emp.salary_structure) {
    form.ctc_annual = Number(emp.salary_structure.ctc_annual) || 0
    form.basic_salary = Number(emp.salary_structure.basic_salary) || 0
    form.hra = Number(emp.salary_structure.hra) || 0
    form.da = Number(emp.salary_structure.da) || 0
    form.special_allowance = Number(emp.salary_structure.special_allowance) || 0
    form.pf_employer = Number(emp.salary_structure.pf_employer) || 0
    form.esi_employer = Number(emp.salary_structure.esi_employer) || 0
    form.other_allowances = Number(emp.salary_structure.other_allowances) || 0
    form.effective_from = emp.salary_structure.effective_from?.split('T')[0] || new Date().toISOString().split('T')[0]
  } else {
    resetForm()
  }
}

const autoCalculateBreakup = () => {
  if (form.ctc_annual <= 0) return
  const monthly = form.ctc_annual / 12

  // Standard Indian breakup: Basic 40%, HRA 20%, DA 10%, Special 20%, PF Employer 10%
  form.basic_salary = Math.round(monthly * 0.40)
  form.hra = Math.round(monthly * 0.20)
  form.da = Math.round(monthly * 0.10)
  form.special_allowance = Math.round(monthly * 0.20)
  form.pf_employer = Math.round(form.basic_salary * 0.12)
  form.esi_employer = 0
  form.other_allowances = Math.round(monthly - form.basic_salary - form.hra - form.da - form.special_allowance)
}

const resetForm = () => {
  form.ctc_annual = 0
  form.basic_salary = 0
  form.hra = 0
  form.da = 0
  form.special_allowance = 0
  form.pf_employer = 0
  form.esi_employer = 0
  form.other_allowances = 0
  form.effective_from = new Date().toISOString().split('T')[0]
}

const saveSalaryStructure = async () => {
  if (!selectedEmployee.value) return
  saving.value = true
  try {
    await api.post('/salary-structures', {
      user_id: selectedEmployee.value.id,
      ...form
    })
    uiStore.success('Salary structure saved successfully!')
    await fetchEmployees()
    // Re-select employee to refresh data
    const updated = employees.value.find((e: any) => e.id === selectedEmployee.value.id)
    if (updated) selectEmployee(updated)
  } catch (err: any) {
    uiStore.error(err.data?.message || 'Failed to save salary structure')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchEmployees()
})

definePageMeta({
  middleware: 'auth',
  permission: 'payroll.manage'
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
.bg-primary-lighten {
  background: rgba(var(--v-theme-primary), 0.04);
}
</style>
