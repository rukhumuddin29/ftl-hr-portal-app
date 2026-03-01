<template>
  <v-container class="animate-fade">
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-weight-black uppercase">Success Gallery</h1>
        <p class="text-caption text-muted uppercase tracking-widest font-weight-bold">
          Celebrating our students' career milestones
        </p>
      </div>
      <v-btn
        variant="outlined"
        prepend-icon="mdi-arrow-left"
        rounded="lg"
        class="font-weight-bold"
        @click="navigateTo('/placements')"
      >
        BACK TO BOARD
      </v-btn>
    </div>

    <!-- Analytics KPIs -->
    <v-row v-if="report" class="mb-10">
      <v-col cols="12" md="4">
        <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6 border-l-4 border-primary">
          <div class="d-flex align-center ga-4">
            <v-avatar color="primary" variant="tonal" rounded="lg" size="56">
                <v-icon size="32">mdi-account-group</v-icon>
            </v-avatar>
            <div>
                <div class="text-h4 font-weight-black">{{ report.total_placed }}</div>
                <div class="text-caption text-muted font-weight-bold">TOTAL PLACEMENTS</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6 border-l-4 border-success">
          <div class="d-flex align-center ga-4">
            <v-avatar color="success" variant="tonal" rounded="lg" size="56">
                <v-icon size="32">mdi-currency-inr</v-icon>
            </v-avatar>
            <div>
                <div class="text-h4 font-weight-black">{{ formatPriceShort(report.avg_ctc) }}</div>
                <div class="text-caption text-muted font-weight-bold">AVERAGE ANNUAL CTC</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6 border-l-4 border-deep-purple">
          <div class="d-flex align-center ga-4">
            <v-avatar color="deep-purple" variant="tonal" rounded="lg" size="56">
                <v-icon size="32">mdi-chart-line</v-icon>
            </v-avatar>
            <div>
                <div class="text-h4 font-weight-black">{{ report.top_companies?.length || 0 }}</div>
                <div class="text-caption text-muted font-weight-bold">HIRING PARTNERS</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Success Board Gallery -->
    <h2 class="text-h5 font-weight-black uppercase mb-6 d-flex align-center ga-2 border-b pb-4">
       <v-icon color="primary">mdi-star-face</v-icon>
       Hall of Fame
    </h2>

    <div v-if="loading" class="d-flex justify-center py-16">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <v-row v-else-if="report && report.recent_placements.length">
       <v-col v-for="p in report.recent_placements" :key="p.id" cols="12" sm="6" md="4" lg="3">
          <v-card class="rounded-xl border-thin bg-surface elevation-0 overflow-hidden success-card">
             <div class="photo-container relative">
                <v-img
                  :src="p.photo_url || '/placeholder-avatar.png'"
                  height="260"
                  cover
                  class="bg-grey-lighten-4"
                >
                   <template v-slot:placeholder>
                      <div class="d-flex align-center justify-center fill-height bg-grey-lighten-4 opacity-25">
                         <v-icon size="64">mdi-account</v-icon>
                      </div>
                   </template>
                </v-img>
                <div class="company-overlay pa-3">
                   <v-chip color="white" label density="comfortable" class="font-weight-black text-primary uppercase">
                      {{ p.company?.name }}
                   </v-chip>
                </div>
             </div>
             
             <div class="pa-5 text-center">
                <h3 class="text-h6 font-weight-black uppercase mb-1 truncate">{{ p.enrollment?.lead?.name }}</h3>
                <p class="text-[11px] font-weight-bold text-success uppercase mb-3">{{ p.designation }}</p>
                <v-divider class="mb-3 opacity-25"></v-divider>
                <div class="d-flex justify-space-between align-center">
                   <div class="text-[10px] text-muted font-weight-black uppercase">PACKAGE</div>
                   <div class="text-subtitle-2 font-weight-black">₹{{ formatPrice(p.ctc_annual) }}</div>
                </div>
             </div>
          </v-card>
       </v-col>
    </v-row>

    <div v-else class="text-center py-16 opacity-50">
        <v-icon size="84" class="mb-4">mdi-image-off-outline</v-icon>
        <p class="text-h6 font-weight-black uppercase">No success stories recorded yet</p>
        <v-btn color="primary" variant="tonal" class="mt-4 font-weight-bold" @click="navigateTo('/placements')">GO TO BOARD</v-btn>
    </div>

    <!-- Top Hiring Partners -->
    <v-row v-if="report && report.top_companies?.length" class="mt-12">
       <v-col cols="12">
          <h2 class="text-h5 font-weight-black uppercase mb-6 d-flex align-center ga-2 border-b pb-4">
            <v-icon color="secondary">mdi-trophy-outline</v-icon>
            Top Hiring Partners
          </h2>
          <v-row dense>
             <v-col v-for="(c, idx) in report.top_companies" :key="c.id" cols="12" sm="6" md="4">
                <v-card class="pa-4 rounded-xl border-thin bg-surface elevation-0 d-flex align-center ga-4">
                   <v-avatar color="primary" variant="text" class="text-h5 font-weight-black">{{ idx + 1 }}</v-avatar>
                   <div>
                      <div class="text-subtitle-1 font-weight-black uppercase">{{ c.name }}</div>
                      <div class="text-caption text-muted font-weight-bold uppercase">{{ c.placements_count }} PLACEMENTS TOTAL</div>
                   </div>
                </v-card>
             </v-col>
          </v-row>
       </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const api = useApi()
const uiStore = useUiStore()

const report = ref(null)
const loading = ref(true)

const fetchReport = async () => {
    loading.value = true
    try {
        const res: any = await api.get('/placements/report')
        report.value = res.data
    } catch {
        uiStore.error('Failed to load placement records')
    } finally {
        loading.value = false
    }
}

const formatPrice = (p) => {
    return (p / 1).toLocaleString('en-IN')
}

const formatPriceShort = (p) => {
    if (p >= 100000) return (p / 100000).toFixed(1) + ' LPA'
    return p.toLocaleString('en-IN')
}

onMounted(fetchReport)

definePageMeta({
  middleware: 'auth'
})
</script>

<style scoped>
.success-card {
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.success-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
    border-color: rgba(var(--v-theme-primary), 0.3) !important;
}
.photo-container {
    overflow: hidden;
}
.company-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 100%);
    display: flex;
    justify-content: center;
}
.border-l-4 {
    border-left-width: 4px !important;
}
</style>
