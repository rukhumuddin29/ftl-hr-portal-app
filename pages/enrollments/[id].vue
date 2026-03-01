<template>
  <v-container class="animate-fade">
    <div v-if="loading" class="d-flex flex-column align-center justify-center py-16">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="mt-4 text-muted">Loading enrollment details...</p>
    </div>

    <div v-else-if="!enrollment" class="py-16 text-center">
      <v-icon size="64" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
      <h1 class="text-h5 font-weight-black uppercase">Enrollment Not Found</h1>
      <v-btn color="primary" variant="text" class="mt-4 font-weight-bold" @click="navigateTo('/enrollments')">BACK TO ENROLLMENTS</v-btn>
    </div>

    <div v-else>
      <!-- Header -->
      <v-row align="center" class="mb-8">
        <v-col cols="12" md="8" class="d-flex align-center ga-4">
          <v-btn
            icon="mdi-arrow-left"
            variant="tonal"
            rounded="xl"
            size="small"
            @click="navigateTo('/enrollments')"
          ></v-btn>
          <div>
            <h1 class="text-h4 font-weight-black uppercase d-flex align-center ga-3">
              {{ enrollment.lead?.name }}
              <v-chip :color="getStatusColor(enrollment.status)" size="x-small" label class="font-weight-black">
                {{ enrollment.status.toUpperCase() }}
              </v-chip>
            </h1>
            <p class="text-caption text-muted uppercase tracking-widest font-weight-bold">
              ENROLLMENT #{{ enrollment.enrollment_number }} • REGISTERED {{ formatDate(enrollment.created_at).toUpperCase() }}
            </p>
          </div>
        </v-col>
        <v-col cols="12" md="4" class="d-flex justify-md-end ga-3">
          <v-btn
            v-if="getRemaining() > 0"
            color="primary"
            prepend-icon="mdi-cash-plus"
            rounded="lg"
            class="font-weight-bold"
            @click="navigateTo(`/payments/create?enrollment_id=${enrollment.id}`)"
          >
            COLLECT PAYMENT
          </v-btn>
          <v-btn
            variant="outlined"
            rounded="lg"
            class="font-weight-bold"
            color="error"
          >
            DROP OUT
          </v-btn>
        </v-col>
      </v-row>

      <v-row>
        <!-- Left Column -->
        <v-col cols="12" md="4">
          <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6 mb-6">
            <h2 class="text-overline font-weight-black mb-4 text-primary tracking-widest">COURSE INFO</h2>
            <div class="mb-4">
              <p class="text-[10px] text-muted font-weight-black uppercase mb-1">Enrolled In</p>
              <p class="text-subtitle-1 font-weight-black text-primary">{{ enrollment.course?.name }}</p>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span class="text-caption text-muted font-weight-bold uppercase">Course Code</span>
              <span class="text-caption font-weight-black font-mono">{{ enrollment.course?.code }}</span>
            </div>
            <div class="d-flex justify-space-between">
              <span class="text-caption text-muted font-weight-bold uppercase">Start Date</span>
              <span class="text-caption font-weight-black">{{ enrollment.start_date || 'TBD' }}</span>
            </div>
          </v-card>

          <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6">
            <h2 class="text-overline font-weight-black mb-4 text-primary tracking-widest">FINANCIAL STATUS</h2>
            <div class="d-flex justify-space-between mb-4">
              <span class="text-body-2 text-muted font-weight-bold uppercase">Agreed Price</span>
              <span class="text-body-2 font-weight-black">₹{{ enrollment.agreed_price }}</span>
            </div>
            <div class="d-flex justify-space-between mb-4">
              <span class="text-body-2 text-muted font-weight-bold uppercase">Paid Amount</span>
              <span class="text-body-2 font-weight-black text-success">₹{{ getPaidAmount() }}</span>
            </div>
            <v-divider class="my-4 border-opacity-25"></v-divider>
            <div class="d-flex justify-space-between">
              <span class="text-subtitle-1 font-weight-bold uppercase">Balance</span>
              <span class="text-subtitle-1 font-weight-black text-error">₹{{ getRemaining() }}</span>
            </div>
            
            <div class="mt-6">
              <v-progress-linear
                :model-value="getPaidPercent()"
                color="success"
                height="8"
                rounded="pill"
                class="mb-2"
              ></v-progress-linear>
              <p class="text-[10px] text-center text-muted font-weight-black uppercase">{{ getPaidPercent() }}% OF TOTAL PAID</p>
            </div>
          </v-card>
        </v-col>

        <!-- Right Column -->
        <v-col cols="12" md="8">
          <v-card class="rounded-xl border-thin bg-surface elevation-0 overflow-hidden">
            <div class="pa-4 border-b d-flex justify-space-between align-center bg-surface-variant-opacity-10">
              <h3 class="text-overline font-weight-black text-primary mb-0 tracking-widest">PAYMENT HISTORY</h3>
              <v-chip size="x-small" color="primary" class="font-weight-black">{{ enrollment.payments?.length || 0 }} RECEIPTS</v-chip>
            </div>

            <div v-if="!enrollment.payments?.length" class="py-16 text-center opacity-50">
              <v-icon size="48" class="mb-4">mdi-cash-off</v-icon>
              <p class="text-overline font-weight-black">No payments received yet</p>
            </div>

            <v-table v-else class="bg-transparent">
              <thead>
                <tr class="text-overline font-weight-black opacity-50">
                  <th class="px-6">RECEIPT</th>
                  <th class="px-6">AMOUNT</th>
                  <th class="px-6">METHOD</th>
                  <th class="px-6">DATE</th>
                  <th class="px-6 text-right"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="pay in enrollment.payments" :key="pay.id">
                  <td class="px-6 py-4 font-mono text-caption">{{ pay.receipt_number }}</td>
                  <td class="px-6 py-4 font-weight-black text-success">₹{{ pay.amount }}</td>
                  <td class="px-6 py-4 text-caption uppercase">{{ pay.payment_mode }}</td>
                  <td class="px-6 py-4 text-caption text-muted">{{ formatDateShort(pay.payment_date) }}</td>
                  <td class="px-6 py-4 text-right">
                    <v-btn icon="mdi-printer" size="x-small" variant="text" color="muted"></v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
const route = useRoute()
const api = useApi()

const enrollment = ref<any>(null)
const loading = ref(true)

const fetchEnrollment = async () => {
  loading.value = true
  try {
    const res: any = await api.get(`/enrollments/${route.params.id}`)
    enrollment.value = res.data
  } catch (err) {
    console.error('Failed to load enrollment')
  } finally {
    loading.value = false
  }
}

const getPaidAmount = () => {
  if (!enrollment.value?.payments) return 0
  return enrollment.value.payments.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0)
}

const getRemaining = () => {
  if (!enrollment.value) return 0
  return parseFloat(enrollment.value.agreed_price) - getPaidAmount()
}

const getPaidPercent = () => {
  if (!enrollment.value || parseFloat(enrollment.value.agreed_price) === 0) return 0
  return Math.round((getPaidAmount() / parseFloat(enrollment.value.agreed_price)) * 100)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'success'
    case 'completed': return 'primary'
    case 'dropped': return 'error'
    default: return 'grey'
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}

const formatDateShort = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

onMounted(() => {
  fetchEnrollment()
})

definePageMeta({
  middleware: 'auth',
  permission: 'enrollments.view'
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
</style>
