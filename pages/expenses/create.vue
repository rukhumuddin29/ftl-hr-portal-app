<template>
  <v-container class="max-w-4xl animate-fade">
    <div class="d-flex align-center ga-4 mb-8">
      <v-btn
        icon="mdi-arrow-left"
        variant="tonal"
        rounded="xl"
        @click="navigateTo('/expenses')"
      ></v-btn>
      <div>
        <h1 class="text-h4 font-weight-bold uppercase">Record Expense</h1>
        <p class="text-body-2 text-muted">Log a new operational cost or payout for approval.</p>
      </div>
    </div>

    <v-form @submit.prevent="handleSubmit">
      <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-8 mb-6">
        <h2 class="text-h6 font-weight-bold mb-6 uppercase text-primary">Expense Details</h2>
        
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="form.title"
              label="TITLE / PURPOSE *"
              variant="outlined"
              placeholder="e.g. Electricity Bill Jan 2026"
              required
              hide-details="auto"
              class="mb-4"
            ></v-text-field>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-select
              v-model="form.expense_category_id"
              label="CATEGORY *"
              :items="categories"
              item-title="name"
              item-value="id"
              variant="outlined"
              required
              hide-details="auto"
              class="mb-4"
            ></v-select>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.amount"
              label="AMOUNT (₹) *"
              type="number"
              variant="outlined"
              required
              hide-details="auto"
              class="mb-4 font-weight-medium"
              color="error"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.expense_date"
              label="DATE OF EXPENSE"
              type="date"
              variant="outlined"
              required
              hide-details="auto"
              class="mb-4"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="form.payment_method"
              label="PAYMENT MODE"
              :items="[
                {title: 'Cash', value: 'cash'},
                {title: 'UPI / Online', value: 'upi'},
                {title: 'Bank Transfer', value: 'bank_transfer'},
                {title: 'Cheque', value: 'cheque'}
              ]"
              variant="outlined"
              hide-details="auto"
              class="mb-4"
            ></v-select>
          </v-col>

          <v-col cols="12">
            <v-textarea
              v-model="form.notes"
              label="DESCRIPTION / REMARK"
              variant="outlined"
              placeholder="Add any details about the payment..."
              rows="3"
              hide-details="auto"
            ></v-textarea>
          </v-col>
        </v-row>
      </v-card>

      <div class="d-flex justify-end ga-6 mt-8 pb-10">
        <v-btn
          variant="outlined"
          rounded="lg"
          class="px-8 font-weight-medium"
          @click="navigateTo('/expenses')"
        >
          CANCEL
        </v-btn>
        <v-btn
          color="primary"
          rounded="lg"
          class="px-8 font-weight-medium"
          type="submit"
          :loading="loading"
        >
          SUBMIT FOR APPROVAL
        </v-btn>
      </div>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
const api = useApi()
const uiStore = useUiStore()
const loading = ref(false)
const categories = ref<any[]>([])

const form = reactive({
  expense_category_id: null as number | null,
  title: '',
  amount: 0,
  expense_date: new Date().toISOString().split('T')[0],
  payment_method: 'cash',
  reference_no: '',
  notes: ''
})

onMounted(async () => {
  try {
    const res: any = await api.get('/expense-categories')
    categories.value = res.data || []
  } catch (err) {
    console.error('Failed to load categories')
  }
})

const handleSubmit = async () => {
  loading.value = true
  try {
    await api.post('/expenses', form)
    uiStore.success('Expense recorded successfully!')
    navigateTo('/expenses')
  } catch (err: any) {
    uiStore.error(err.data?.message || 'Failed to record expense')
  } finally {
    loading.value = false
  }
}

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
  border: 1px solid var(--border-color) !important;
}
</style>

<style scoped>
.form-input {
  width: 100%;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-primary);
  outline: none;
  font-size: 14px;
}
</style>
