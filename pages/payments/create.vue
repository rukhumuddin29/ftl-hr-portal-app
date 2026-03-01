<template>
  <v-container class="max-w-4xl animate-fade">
    <div class="d-flex align-center ga-4 mb-8">
      <v-btn
        icon="mdi-arrow-left"
        variant="tonal"
        rounded="xl"
        @click="navigateTo('/enrollments')"
      ></v-btn>
      <div>
        <h1 class="text-h4 font-weight-black uppercase">Record Payment</h1>
        <p class="text-body-2 text-muted">Issue a receipt and update a student's payment balance.</p>
      </div>
    </div>

    <div v-if="!enrollment && !loadingPage" class="pa-12 text-center bg-surface rounded-xl border-thin">
       <v-icon size="64" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
       <h2 class="text-h5 font-weight-bold">No Enrollment Found</h2>
       <p class="text-muted">Please select a student enrollment to record a payment.</p>
    </div>

    <v-form v-else-if="enrollment" @submit.prevent="handleSubmit">
      <!-- Enrollment Summary -->
      <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-8 mb-8 border-emerald">
         <div class="d-flex justify-space-between align-start">
           <div>
             <h3 class="text-h6 font-weight-black text-emerald-400">Student: {{ enrollment.lead?.name }}</h3>
             <p class="text-caption text-muted uppercase font-weight-bold">{{ enrollment.course?.name }}</p>
             <p class="text-[10px] text-primary font-mono mt-1 font-weight-black">#{{ enrollment.enrollment_number }}</p>
           </div>
           <div class="text-right">
             <span class="text-[10px] uppercase font-weight-black text-muted">Total Agreed</span>
             <p class="text-h4 font-weight-black">₹{{ enrollment.agreed_price }}</p>
           </div>
         </div>
         
         <v-divider class="my-6 opacity-10"></v-divider>

         <v-row>
           <v-col cols="6">
             <span class="text-[10px] uppercase font-weight-black text-muted">Paid Amount</span>
             <p class="text-h6 font-weight-black text-emerald-400">₹{{ getPaidAmount() }}</p>
           </v-col>
           <v-col cols="6" class="text-right">
             <span class="text-[10px] uppercase font-weight-black text-muted">Remaining Balance</span>
             <p class="text-h6 font-weight-bold text-error">₹{{ getRemaining() }}</p>
           </v-col>
         </v-row>
      </v-card>

      <!-- Payment details -->
      <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-8 mb-8">
        <h2 class="text-h6 font-weight-black mb-6 uppercase text-primary">Transaction Details</h2>
        
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.amount"
              label="AMOUNT TO PAY (₹) *"
              type="number"
              variant="outlined"
              required
              hide-details="auto"
              class="mb-4 font-weight-black text-h6"
              color="primary"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="form.payment_mode"
              label="PAYMENT MODE *"
              :items="[
                {title: 'Cash', value: 'cash'},
                {title: 'Bank Transfer / NEFT', value: 'bank_transfer'},
                {title: 'UPI / GPay / PhonePe', value: 'upi'},
                {title: 'Credit/Debit Card', value: 'card'},
                {title: 'Cheque', value: 'cheque'}
              ]"
              variant="outlined"
              required
              hide-details="auto"
              class="mb-4"
            ></v-select>
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="form.payment_type"
              label="PAYMENT TYPE *"
              :items="[
                {title: 'Down Payment / Initial', value: 'down_payment'},
                {title: 'Installment', value: 'installment'},
                {title: 'Full Course Payment', value: 'full_payment'},
                {title: 'Other Fees', value: 'other'}
              ]"
              variant="outlined"
              required
              hide-details="auto"
              class="mb-4"
            ></v-select>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.transaction_reference"
              label="TRANSACTION ID / REFERENCE"
              variant="outlined"
              placeholder="e.g. UPI Ref # or Bank Ref"
              hide-details="auto"
              class="mb-4"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.payment_date"
              label="PAYMENT DATE"
              type="date"
              variant="outlined"
              required
              hide-details="auto"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card>

      <div class="d-flex justify-end ga-6 mt-8 pb-10">
        <v-btn
          variant="outlined"
          rounded="lg"
          class="px-8 font-weight-bold"
          @click="navigateTo(`/enrollments/${enrollment.id}`)"
        >
          CANCEL
        </v-btn>
        <v-btn
          color="primary"
          rounded="lg"
          class="px-8 font-weight-bold"
          type="submit"
          :loading="loading"
        >
          COLLECT PAYMENT
        </v-btn>
      </div>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
const route = useRoute()
const api = useApi()
const uiStore = useUiStore()

const enrollment = ref<any>(null)
const loading = ref(false)
const loadingPage = ref(false)

const form = reactive({
  enrollment_id: null as number | null,
  amount: 0,
  payment_mode: 'upi',
  payment_type: 'installment',
  transaction_reference: '',
  payment_date: new Date().toISOString().split('T')[0],
  notes: ''
})

const getPaidAmount = () => {
  if (!enrollment.value?.payments) return 0
  return enrollment.value.payments.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0)
}

const getRemaining = () => {
  if (!enrollment.value) return 0
  return parseFloat(enrollment.value.agreed_price) - getPaidAmount()
}

onMounted(async () => {
  const encId = route.query.enrollment_id
  if (encId) {
    loadingPage.value = true
    form.enrollment_id = parseInt(encId as string)
    try {
      const res: any = await api.get(`/enrollments/${encId}`)
      enrollment.value = res.data
      form.amount = getRemaining()
    } catch (err) {
      uiStore.error('Enrollment not found')
    } finally {
      loadingPage.value = false
    }
  }
})

const handleSubmit = async () => {
  if (form.amount <= 0) {
    uiStore.error('Amount must be greater than 0')
    return
  }
  
  loading.value = true
  try {
    await api.post('/payments', form)
    uiStore.success('Payment recorded successfully!')
    navigateTo('/payments')
  } catch (err: any) {
    uiStore.error(err.data?.message || 'Failed to record payment')
  } finally {
    loading.value = false
  }
}

definePageMeta({
  middleware: 'auth',
  permission: 'payments.create'
})
</script>

<style scoped>
.border-thin {
  border: 1px solid var(--border-color) !important;
}
.border-emerald {
  border-left: 4px solid var(--color-success) !important;
}
.text-emerald-400 {
  color: var(--color-success) !important;
}
.animate-fade {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
