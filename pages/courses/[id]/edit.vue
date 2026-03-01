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
        <h1 class="text-h4 font-weight-black uppercase">Edit Course</h1>
        <p class="text-body-2 text-muted">Update course details and pricing for {{ form.name }}.</p>
      </div>
    </div>

    <v-form @submit.prevent="handleSubmit">
      <v-row v-if="loading" class="py-16">
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col cols="12">
          <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-8">
            <v-row>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="form.name"
                  label="COURSE NAME"
                  placeholder="e.g. Master in Web Development"
                  variant="outlined"
                  density="compact"
                  class="mb-4"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.code"
                  label="COURSE CODE"
                  placeholder="e.g. WEB-101"
                  variant="outlined"
                  density="compact"
                  class="mb-4"
                  required
                ></v-text-field>
              </v-col>
              
              <v-col cols="12">
                <v-textarea
                  v-model="form.description"
                  label="COURSE DESCRIPTION"
                  variant="outlined"
                  density="compact"
                  rows="3"
                  class="mb-4"
                  required
                ></v-textarea>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="form.category"
                  label="CATEGORY"
                  :items="['Software Development', 'Data Science', 'Graphic Design', 'Cyber Security', 'Digital Marketing']"
                  variant="outlined"
                  density="compact"
                  class="mb-4"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.mode"
                  label="TRAINING MODE"
                  :items="['online', 'offline', 'hybrid']"
                  variant="outlined"
                  density="compact"
                  class="mb-4 text-capitalize"
                  required
                ></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.original_price"
                  label="REGULAR PRICE (₹)"
                  type="number"
                  variant="outlined"
                  density="compact"
                  class="mb-4"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.offer_price"
                  label="OFFER PRICE (₹)"
                  type="number"
                  variant="outlined"
                  density="compact"
                  class="mb-4"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.duration_weeks"
                  label="DURATION (WEEKS)"
                  type="number"
                  variant="outlined"
                  density="compact"
                  class="mb-4"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="form.status"
                  label="STATUS"
                  :items="['active', 'inactive']"
                  variant="outlined"
                  density="compact"
                  class="mb-4 text-capitalize"
                  required
                ></v-select>
              </v-col>
            </v-row>

            <div class="d-flex justify-end ga-4 mt-8">
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
                :loading="saving"
              >
                UPDATE COURSE
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
const route = useRoute()
const api = useApi()
const uiStore = useUiStore()
const loading = ref(true)
const saving = ref(false)

const form = reactive({
  name: '',
  code: '',
  description: '',
  category: 'Software Development',
  mode: 'offline',
  original_price: 0,
  offer_price: 0,
  duration_weeks: 12,
  status: 'active'
})

onMounted(async () => {
  try {
    const res: any = await api.get(`/courses/${route.params.id}`)
    if (res.data) {
      Object.assign(form, res.data)
    }
  } catch (err) {
    uiStore.error('Failed to load course details')
    navigateTo('/courses')
  } finally {
    loading.value = false
  }
})

const handleSubmit = async () => {
  saving.value = true
  try {
    await api.put(`/courses/${route.params.id}`, form)
    uiStore.success('Course updated successfully!')
    navigateTo('/courses')
  } catch (err: any) {
    uiStore.error(err.data?.message || 'Failed to update course')
  } finally {
    saving.value = false
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
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}
</style>
