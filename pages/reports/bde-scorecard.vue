<template>
  <v-container fluid class="animate-fade py-8 px-lg-12 px-6 bg-surface">
    <!-- Header -->
    <v-row align="center" class="mb-10">
      <v-col cols="12" lg="6">
        <h1 class="text-h4 font-weight-black d-flex align-center ga-4 mb-2">
          <v-icon color="primary" size="48">mdi-trophy-outline</v-icon>
          BDE PERFORMANCE SCORECARD
        </h1>
        <p class="text-subtitle-1 text-muted uppercase tracking-widest font-weight-bold opacity-70">
           Evaluate team effectiveness and drive high-performance sales cultures
        </p>
      </v-col>
      <v-col cols="12" lg="6" class="d-flex justify-lg-end align-center ga-4 flex-wrap">
         <v-btn-toggle
            v-model="period"
            mandatory
            color="primary"
            variant="tonal"
            rounded="xl"
            density="comfortable"
            @update:model-value="fetchLeaderboard"
         >
            <v-btn value="this_month" class="px-6 font-weight-black uppercase text-caption">THIS MONTH</v-btn>
            <v-btn value="last_month" class="px-6 font-weight-black uppercase text-caption">LAST MONTH</v-btn>
            <v-btn value="this_quarter" class="px-6 font-weight-black uppercase text-caption">QUARTER</v-btn>
            <v-btn value="this_year" class="px-6 font-weight-black uppercase text-caption">YEAR</v-btn>
         </v-btn-toggle>
         <v-btn icon="mdi-refresh" variant="text" :loading="loading" @click="fetchLeaderboard"></v-btn>
      </v-col>
    </v-row>

    <!-- Leaderboard -->
    <v-card class="rounded-xl border-thin elevation-0 mb-10 overflow-hidden bg-surface">
      <div class="pa-8 border-b d-flex justify-space-between align-center bg-card">
         <h2 class="text-h5 font-weight-black uppercase d-flex align-center ga-2">
            <v-icon size="24" color="secondary">mdi-format-list-numbered</v-icon>
            Rankings & Core KPIs
         </h2>
      </div>

      <v-data-table
        :headers="scorecardHeaders"
        :items="leaderboard"
        class="bg-transparent"
        hide-default-footer
        show-expand
        v-model:expanded="expanded"
        hover
        @click:row="(e: any, row: { item: any }) => toggleExpand(row.item)"
      >
        <template v-slot:item.rank="{ item }">
           <div class="d-flex align-center ga-2">
              <span v-if="item.rank === 1" class="text-h5">🥇</span>
              <span v-else-if="item.rank === 2" class="text-h5">🥈</span>
              <span v-else-if="item.rank === 3" class="text-h5">🥉</span>
              <span v-else class="font-weight-black text-muted ml-1">#{{ item.rank }}</span>
           </div>
        </template>

        <template v-slot:item.name="{ item }">
           <div class="d-flex align-center ga-3 py-4">
              <v-avatar size="40" :color="item.rank <= 3 ? 'primary' : 'surface-light'" border>
                 <v-img v-if="item.avatar" :src="item.avatar"></v-img>
                 <span v-else class="font-weight-black">{{ item.name.charAt(0) }}</span>
              </v-avatar>
              <div class="font-weight-black text-subtitle-1 uppercase">{{ item.name }}</div>
           </div>
        </template>

        <template v-slot:item.composite_score="{ item }">
           <v-chip
             :color="getScoreColor(item.composite_score)"
             variant="flat"
             class="font-weight-black px-6"
             label
             rounded="lg"
           >
             {{ item.composite_score }} / 100
           </v-chip>
        </template>

        <template v-slot:item.conversion_rate="{ item }">
           <span class="font-weight-black text-primary">{{ item.conversion_rate }}%</span>
        </template>

        <template v-slot:item.revenue="{ item }">
           <span class="font-weight-black text-success">{{ formatCurrency(item.revenue) }}</span>
        </template>

        <!-- Expanded Individual Scorecard -->
        <template v-slot:expanded-row="{ columns, item }">
           <td :colspan="columns.length" class="pa-0">
             <div class="bg-surface-variant/5 pa-10 animate-slide">
                <v-row>
                   <!-- Metric Cards -->
                   <v-col v-for="metric in getDetailMetrics(item)" :key="metric.label" cols="12" sm="6" md="3">
                      <v-card variant="outlined" class="rounded-xl pa-5 bg-card border-dashed">
                         <div class="text-overline font-weight-black text-muted mb-2 tracking-widest">{{ metric.label }}</div>
                         <div class="text-h4 font-weight-black mb-1">{{ metric.value }}</div>
                         <div class="text-caption font-weight-bold opacity-60">{{ metric.subtitle }}</div>
                      </v-card>
                   </v-col>

                   <!-- Trend & Pipeline -->
                   <v-col cols="12" md="8" class="mt-6">
                      <v-card variant="outlined" class="rounded-xl bg-card border-none pa-8 h-100 shadow-sm">
                         <h3 class="text-subtitle-1 font-weight-black uppercase mb-8 ml-2 text-primary d-flex align-center ga-2">
                           <v-icon size="20">mdi-chart-line</v-icon>
                           Performance Trajectory (6 MONTHS)
                         </h3>
                         <v-sparkline
                           :model-value="trendData[item.id]?.revenue || [0,0,0,0,0,0]"
                           color="primary"
                           height="100"
                           padding="10"
                           stroke-linecap="round"
                           smooth
                           line-width="3"
                           auto-draw
                         ></v-sparkline>
                         <div class="mt-8 d-flex justify-space-between px-4 text-caption font-weight-black opacity-30">
                            <span v-for="m in trendData[item.id]?.labels" :key="m">{{ m }}</span>
                         </div>
                      </v-card>
                   </v-col>

                   <v-col cols="12" md="4" class="mt-6">
                      <v-card variant="outlined" class="rounded-xl bg-card border-none pa-8 h-100 shadow-sm">
                         <h3 class="text-subtitle-1 font-weight-black uppercase mb-8 text-primary d-flex align-center ga-2">
                            <v-icon size="20">mdi-filter-variant</v-icon>
                            Pipeline Health
                         </h3>
                         <div v-for="(count, status) in pipelineData[item.id]" :key="status" class="mb-5">
                            <div class="d-flex justify-space-between mb-2">
                               <span class="text-caption font-weight-black uppercase opacity-60 leading-none">{{ String(status).replace('_', ' ') }}</span>
                               <span class="text-caption font-weight-black leading-none">{{ count }}</span>
                            </div>
                            <v-progress-linear
                              :model-value="getPipelinePercent(item.id, count)"
                              color="secondary"
                              height="6"
                              rounded
                              class="opacity-60"
                            ></v-progress-linear>
                         </div>
                      </v-card>
                   </v-col>
                </v-row>
             </div>
           </td>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const api = useApi()
const uiStore = useUiStore()

const loading = ref(true)
const period = ref('this_month')
const leaderboard = ref<any[]>([])
const expanded = ref<any[]>([])
const trendData = reactive<any>({})
const pipelineData = reactive<any>({})
const fullDetails = reactive<any>({})

const scorecardHeaders = ref<any[]>([
    { title: 'RANKING', key: 'rank', sortable: false, width: '100px' },
    { title: 'BDE PROFESSIONAL', key: 'name', width: '250px' },
    { title: 'COMPOSITE SCORE', key: 'composite_score', align: 'center' },
    { title: 'CONV RATE', key: 'conversion_rate', align: 'center' },
    { title: 'TOTAL REVENUE', key: 'revenue', align: 'right' },
    { title: 'CALLS MADE', key: 'total_calls', align: 'right' },
])

const fetchLeaderboard = async () => {
    loading.value = true
    try {
        const res: any = await api.get('/bde-scorecard/leaderboard', { params: { period: period.value } })
        leaderboard.value = res.data
    } catch {
        uiStore.error('Failed to load performance rankings')
    } finally {
        loading.value = false
    }
}

const toggleExpand = async (item: any) => {
    const isExpanded = expanded.value.includes(item.id)
    if (isExpanded) {
        expanded.value = expanded.value.filter(id => id !== item.id)
    } else {
        expanded.value = [item.id]
        if (!fullDetails[item.id]) {
            fetchDetail(item.id)
        }
    }
}

const fetchDetail = async (userId: number) => {
    try {
        const [scoreRes, trendRes]: any = await Promise.all([
            api.get(`/bde-scorecard/${userId}`, { params: { period: period.value } }),
            api.get(`/bde-scorecard/${userId}/trend`)
        ])
        
        fullDetails[userId] = scoreRes.data || {}
        pipelineData[userId] = scoreRes.data?.pipeline || {}
        
        if (Array.isArray(trendRes.data)) {
            trendData[userId] = {
                labels: trendRes.data.map((t: any) => t.label),
                revenue: trendRes.data.map((t: any) => t.revenue)
            }
        } else {
            trendData[userId] = { labels: [], revenue: [0,0,0,0,0,0] }
        }
    } catch {
        uiStore.error('Failed to load detailed analytics')
    }
}

const getDetailMetrics = (item: any) => {
    const d = fullDetails[item.id]?.metrics
    if (!d) return []
    return [
       { label: 'Avg Deal Size', value: formatCurrency(d.avg_deal_size), subtitle: 'Per enrollment' },
       { label: 'Avg Conv Time', value: `${d.avg_days_to_convert} Days`, subtitle: 'Assignment → Conversion' },
       { label: 'Call Duration', value: `${d.avg_call_duration}m`, subtitle: 'Average per talktime' },
       { label: 'Consistency', value: `${d.compliance}%`, subtitle: 'Follow-up discipline' }
    ]
}

const getPipelinePercent = (userId: number, count: number) => {
    const pipeline = pipelineData[userId]
    if (!pipeline) return 0
    const total = Object.values(pipeline).reduce((a: any, b: any) => (a as number) + (b as number), 0) as number
    return total > 0 ? (count / total) * 100 : 0
}

const getScoreColor = (score: number) => {
    if (score >= 80) return 'success'
    if (score >= 50) return 'warning'
    return 'error'
}

const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt)
}

onMounted(fetchLeaderboard)

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
.animate-slide {
  animation: slideIn 0.3s ease-out;
}
@keyframes slideIn {
  from { opacity: 0; transform: scaleY(0.95); transform-origin: top; }
  to { opacity: 1; transform: scaleY(1); }
}

.border-thin {
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}
.border-dashed {
  border: 1px dashed rgba(255, 255, 255, 0.1) !important;
}
.border-b {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}
.border-none {
  border: none !important;
}

:deep(.v-data-table__expanded-row) {
  background: transparent !important;
}

.shadow-sm {
    box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important;
}
</style>
