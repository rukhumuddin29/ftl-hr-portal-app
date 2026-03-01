<template>
  <v-container class="max-w-4xl animate-fade">
    <div class="d-flex align-center ga-4 mb-8">
      <v-btn
        icon="mdi-arrow-left"
        variant="tonal"
        rounded="xl"
        @click="navigateTo('/courses')"
      ></v-btn>
      <div>
        <h1 class="text-h4 font-weight-black uppercase">Add New Course</h1>
        <p class="text-body-2 text-muted">Define a new training program and its commercial terms.</p>
      </div>
    </div>

    <v-form @submit.prevent="handleSubmit">
      <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-8 mb-8">
        <h2 class="text-h6 font-weight-black mb-6 uppercase text-primary d-flex align-center ga-2">
          <v-icon>mdi-certificate-outline</v-icon>
          Course Identity
        </h2>
        
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="form.name"
              label="COURSE NAME *"
              variant="outlined"
              placeholder="e.g. Master in Full Stack Development"
              required
              hide-details="auto"
              class="mb-4"
            ></v-text-field>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.code"
              label="COURSE CODE *"
              variant="outlined"
              placeholder="e.g. FSD-001"
              required
              hide-details="auto"
              class="mb-4"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="form.category"
              label="CATEGORY"
              :items="[
                {title: 'Information Technology', value: 'IT'},
                {title: 'Digital Marketing', value: 'Marketing'},
                {title: 'Finance & Accounts', value: 'Finance'},
                {title: 'Other', value: 'Other'}
              ]"
              variant="outlined"
              hide-details="auto"
              class="mb-4"
            ></v-select>
          </v-col>

          <v-col cols="12">
            <v-textarea
              v-model="form.description"
              label="DESCRIPTION"
              variant="outlined"
              placeholder="Briefly describe the course content..."
              rows="3"
              hide-details="auto"
            ></v-textarea>
          </v-col>
        </v-row>
      </v-card>

      <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-8 mb-8">
        <h2 class="text-h6 font-weight-black mb-6 uppercase text-primary d-flex align-center ga-2">
          <v-icon>mdi-currency-inr</v-icon>
          Pricing & Duration
        </h2>
        
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.original_price"
              label="ORIGINAL PRICE (₹) *"
              type="number"
              variant="outlined"
              required
              hide-details="auto"
              class="mb-4"
            ></v-text-field>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.offer_price"
              label="OFFER PRICE (₹) *"
              type="number"
              variant="outlined"
              required
              hide-details="auto"
              class="mb-4 font-weight-black"
              color="success"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.duration_weeks"
              label="DURATION (WEEKS)"
              type="number"
              variant="outlined"
              hide-details="auto"
              class="mb-4"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="form.mode"
              label="MODE"
              :items="[
                {title: 'Online', value: 'online'},
                {title: 'Offline', value: 'offline'},
                {title: 'Hybrid', value: 'hybrid'}
              ]"
              variant="outlined"
              hide-details="auto"
            ></v-select>
          </v-col>
        </v-row>
      </v-card>

      <div class="d-flex justify-end ga-6 mt-8 pb-10">
        <v-btn
          variant="outlined"
          rounded="lg"
          class="px-8 font-weight-bold"
          @click="navigateTo('/courses')"
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
          CREATE COURSE
        </v-btn>
      </div>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
const api = useApi()
const uiStore = useUiStore()
const loading = ref(false)

const form = reactive({
  name: '',
  code: '',
  description: '',
  category: 'IT',
  original_price: 0,
  offer_price: 0,
  duration_weeks: 12,
  mode: 'offline',
  status: 'active'
})

const handleSubmit = async () => {
  loading.value = true
  try {
    await api.post('/courses', form)
    uiStore.success('Course created successfully!')
    navigateTo('/courses')
  } catch (err: any) {
    uiStore.error(err.data?.message || 'Failed to create course')
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
