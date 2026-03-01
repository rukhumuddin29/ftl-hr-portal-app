<template>
  <v-row class="animate-fade">
    <v-col cols="12" class="d-flex align-center justify-space-between mb-4">
      <div>
        <h1 class="text-h4 font-weight-black">COURSE CATALOG</h1>
        <p class="text-body-2 text-muted">Manage your center's programs and pricing.</p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        height="48"
        class="font-weight-bold tracking-widest px-6"
        @click="navigateTo('/courses/create')"
      >
        CREATE COURSE
      </v-btn>
    </v-col>

    <!-- Course Cards -->
    <v-col v-for="course in courses" :key="course.id" cols="12" md="6" lg="4">
      <v-card class="rounded-xl border-thin bg-surface elevation-0 h-100 d-flex flex-column hover-lift">
        <v-card-item class="pb-2">
          <div class="d-flex justify-space-between align-center mb-2">
            <v-chip size="x-small" label class="font-weight-black" color="indigo">{{ course.category.toUpperCase() }}</v-chip>
            <v-chip size="x-small" label class="font-weight-black" :color="course.status === 'active' ? 'success' : 'grey'">{{ course.status.toUpperCase() }}</v-chip>
          </div>
          <v-card-title class="text-h6 font-weight-black text-uppercase tracking-tight">{{ course.name }}</v-card-title>
          <v-card-subtitle class="text-caption text-primary font-weight-bold">CODE: {{ course.code }}</v-card-subtitle>
        </v-card-item>

        <v-card-text class="flex-grow-1">
          <p class="text-body-2 text-muted mb-6 line-clamp-2">{{ course.description }}</p>
          
          <div class="d-flex align-center ga-6 mb-4">
            <div>
              <p class="text-[10px] font-weight-black text-muted uppercase opacity-50 mb-1">Duration</p>
              <div class="d-flex align-center ga-1">
                <v-icon size="14" color="grey">mdi-clock-outline</v-icon>
                <span class="text-subtitle-2 font-weight-bold">{{ course.duration_weeks }} Weeks</span>
              </div>
            </div>
            <div>
              <p class="text-[10px] font-weight-black text-muted uppercase opacity-50 mb-1">Mode</p>
              <div class="d-flex align-center ga-1">
                <v-icon size="14" color="grey">mdi-laptop</v-icon>
                <span class="text-subtitle-2 font-weight-bold text-uppercase">{{ course.mode }}</span>
              </div>
            </div>
          </div>
        </v-card-text>

        <v-divider class="mx-4 border-opacity-25"></v-divider>

         <v-card-actions class="pa-4 d-flex justify-space-between align-center">
           <div>
              <p class="text-[10px] font-weight-black text-muted uppercase opacity-50 mb-0">Starting from</p>
              <div class="d-flex align-center ga-2">
                 <span class="text-h6 font-weight-black text-success">₹{{ Math.round(course.offer_price) }}</span>
                 <span class="text-caption text-muted text-decoration-line-through">₹{{ Math.round(course.original_price) }}</span>
              </div>
           </div>
           <v-btn icon="mdi-pencil-outline" variant="tonal" size="small" color="primary" @click="navigateTo(`/courses/${course.id}/edit`)"></v-btn>
        </v-card-actions>
      </v-card>
    </v-col>

    <v-col v-if="courses.length === 0 && !loading" cols="12" class="text-center py-16 opacity-50">
      <v-icon size="64" class="mb-4">mdi-book-open-variant</v-icon>
      <p class="text-overline font-weight-black">No courses in the catalog yet</p>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
const api = useApi()
const courses = ref<any[]>([])
const loading = ref(true)

const fetchCourses = async () => {
  loading.value = true
  try {
    const res: any = await api.get('/courses')
    courses.value = res.data?.data || []
  } catch (err) {
    console.error('Failed to load courses')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCourses()
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
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.animate-fade {
  animation: fadeIn 0.6s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.hover-lift {
  transition: transform 0.3s ease, border-color 0.3s ease !important;
}
.hover-lift:hover {
  transform: translateY(-4px);
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
}
</style>
