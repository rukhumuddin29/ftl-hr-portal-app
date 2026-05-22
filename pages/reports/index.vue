<template>
  <v-container fluid class="animate-fade py-6 px-6">
    <!-- Header Area -->
    <v-row align="center" class="mb-6">
      <v-col cols="12" lg="6">
        <h1 class="text-h4 font-weight-black d-flex align-center ga-3">
          <v-icon color="primary">mdi-chart-box-outline</v-icon>
          FINANCIAL REPORTS
        </h1>
        <p class="text-caption text-muted uppercase tracking-widest font-weight-bold">
          Consolidated Profit & Loss, Revenue Trends and Breakdowns
        </p>
      </v-col>
      <v-col cols="12" lg="6" class="d-flex justify-lg-end align-center ga-3 flex-wrap">
        <!-- Year Selector -->
        <div style="width: 150px">
          <v-select
            v-model="selectedYear"
            :items="yearOptions"
            label="FISCAL YEAR"
            variant="outlined"
            density="compact"
            hide-details
            class="custom-report-select"
            @update:model-value="fetchAllData"
          ></v-select>
        </div>

        <v-btn
          color="white"
          variant="outlined"
          prepend-icon="mdi-export"
          rounded="lg"
          class="font-weight-bold px-6"
          :loading="exporting"
          @click="exportReport"
        >
          EXPORT CSV
        </v-btn>
      </v-col>
    </v-row>

    <!-- KPI Summary Cards -->
    <v-row class="mb-6">
      <v-col v-for="card in kpiCards" :key="card.title" cols="12" sm="6" lg="3">
        <v-card class="kpi-card rounded-xl border-thin elevation-0 pa-6 overflow-hidden position-relative">
          <div class="d-flex justify-space-between align-center mb-4">
            <v-avatar :color="card.color" variant="tonal" class="rounded-lg">
              <v-icon size="24">{{ card.icon }}</v-icon>
            </v-avatar>
            <span class="text-[10px] font-weight-black opacity-30 text-uppercase tracking-widest">{{ card.title }}</span>
          </div>
          <div class="text-h4 font-weight-black mb-1 tabular-nums">₹{{ formatNumber(card.value) }}</div>
          <div class="d-flex align-center ga-1">
             <span :class="`text-caption font-weight-bold text-${card.color}`">{{ card.subtitle }}</span>
             <span class="text-[10px] text-muted opacity-50 uppercase font-weight-bold">THIS YEAR</span>
          </div>
          
          <!-- Background Decoration -->
          <v-icon class="card-bg-icon">{{ card.icon }}</v-icon>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Visualizations -->
    <v-row class="mb-6">
      <!-- Revenue Trend Line Chart -->
      <v-col cols="12">
        <v-card class="rounded-xl border-thin elevation-0 pa-6 bg-surface">
          <div class="d-flex justify-space-between align-center mb-6">
            <div>
              <h2 class="text-h6 font-weight-bold">12-Month Financial Trend</h2>
              <p class="text-[10px] text-muted uppercase font-weight-black tracking-widest">Revenue vs Expenses vs Payroll</p>
            </div>
            <div class="d-flex ga-4">
                <div class="d-flex align-center ga-1">
                    <div class="marker bg-success"></div>
                    <span class="text-caption font-weight-bold">REVENUE</span>
                </div>
                <div class="d-flex align-center ga-1">
                    <div class="marker bg-error"></div>
                    <span class="text-caption font-weight-bold">EXPENSES</span>
                </div>
                <div class="d-flex align-center ga-1">
                    <div class="marker bg-warning"></div>
                    <span class="text-caption font-weight-bold">PAYROLL</span>
                </div>
            </div>
          </div>
          
          <client-only>
            <apexchart
              type="area"
              height="380"
              :options="trendChartOptions"
              :series="trendSeries"
            ></apexchart>
          </client-only>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mb-6">
      <!-- Revenue by BDE -->
      <v-col cols="12">
        <v-card class="rounded-xl border-thin elevation-0 pa-6 bg-surface h-100">
           <h2 class="text-h6 font-weight-bold mb-1">BDE Performance</h2>
           <p class="text-[10px] text-muted uppercase font-weight-black tracking-widest mb-6">Revenue contributions per agent</p>
           
           <client-only>
                <apexchart
                  type="bar"
                  height="300"
                  :options="bdeChartOptions"
                  :series="bdeSeries"
                ></apexchart>
              </client-only>
        </v-card>
      </v-col>
    </v-row>

    <!-- Monthly P&L Table -->
    <v-row>
      <v-col cols="12">
        <v-card class="rounded-xl border-thin elevation-0 overflow-hidden bg-surface">
           <div class="pa-6 border-b border-opacity-25 d-flex justify-space-between align-center">
             <div>
                <h2 class="text-h6 font-weight-bold">Detailed P&L Statement</h2>
                <p class="text-[10px] text-muted uppercase font-weight-black tracking-widest">Month-by-month financial breakdown</p>
             </div>
           </div>
           
           <v-table hover class="custom-report-table">
             <thead>
               <tr>
                 <th class="text-left font-weight-black">MONTH</th>
                 <th class="text-right font-weight-black">REVENUE</th>
                 <th class="text-right font-weight-black">EXPENSES</th>
                 <th class="text-right font-weight-black">PAYROLL</th>
                 <th class="text-right font-weight-black">NET PROFIT</th>
                 <th class="text-center font-weight-black">STATUS</th>
               </tr>
             </thead>
             <tbody>
               <tr v-for="month in summaryData.monthly_breakdown" :key="month.month">
                 <td class="font-weight-bold">{{ month.month_label }}</td>
                 <td class="text-right tabular-nums font-weight-medium">₹{{ formatNumber(month.revenue) }}</td>
                 <td class="text-right tabular-nums text-error-lighten-1">₹{{ formatNumber(month.expenses) }}</td>
                 <td class="text-right tabular-nums text-warning-lighten-1">₹{{ formatNumber(month.payroll) }}</td>
                 <td class="text-right tabular-nums font-weight-black" :class="month.net_profit >= 0 ? 'text-success' : 'text-error'">
                   {{ month.net_profit < 0 ? '-' : '' }}₹{{ formatNumber(Math.abs(month.net_profit)) }}
                 </td>
                 <td class="text-center">
                   <v-chip
                     size="x-small"
                     :color="month.net_profit >= 0 ? 'success' : 'error'"
                     variant="tonal"
                     label
                     class="font-weight-black"
                   >
                     {{ month.net_profit >= 0 ? 'PROFIT' : 'LOSS' }}
                   </v-chip>
                 </td>
               </tr>
             </tbody>
             <tfoot class="bg-black-thin">
               <tr>
                 <td class="font-weight-black text-primary uppercase">Total</td>
                 <td class="text-right font-weight-black tabular-nums">₹{{ formatNumber(summaryData.summary.total_revenue) }}</td>
                 <td class="text-right font-weight-black tabular-nums">₹{{ formatNumber(summaryData.summary.total_expenses) }}</td>
                 <td class="text-right font-weight-black tabular-nums">₹{{ formatNumber(summaryData.summary.total_payroll) }}</td>
                 <td class="text-right font-weight-black tabular-nums" :class="summaryData.summary.net_profit >= 0 ? 'text-success' : 'text-error'">
                   ₹{{ formatNumber(summaryData.summary.net_profit) }}
                 </td>
                 <td class="text-center">
                    <v-chip variant="flat" :color="summaryData.summary.net_profit >= 0 ? 'success' : 'error'" size="x-small" class="font-weight-black">
                        {{ summaryData.summary.profit_margin }}% MARGIN
                    </v-chip>
                 </td>
               </tr>
             </tfoot>
           </v-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const api = useApi()
const uiStore = useUiStore()

const loading = ref(true)
const exporting = ref(false)
const selectedYear = ref(new Date().getFullYear())
const yearOptions = computed(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 5 }, (_, i) => currentYear - i)
})

const summaryData = ref<any>({
    summary: {},
    monthly_breakdown: []
})
const bdeData = ref<any[]>([])

const kpiCards = computed(() => [
    { title: 'Total Revenue', value: summaryData.value.summary.total_revenue || 0, icon: 'mdi-cash-multiple', color: 'success', subtitle: `${summaryData.value.summary.total_enrollments || 0} Enrollments` },
    { title: 'Total Expenses', value: summaryData.value.summary.total_expenses || 0, icon: 'mdi-trending-down', color: 'error', subtitle: 'Approved Assets' },
    { title: 'Total Payroll', value: summaryData.value.summary.total_payroll || 0, icon: 'mdi-account-group', color: 'warning', subtitle: 'Paid Salaries' },
    { title: 'Net Profit', value: summaryData.value.summary.net_profit || 0, icon: 'mdi-chart-line', color: (summaryData.value.summary.net_profit || 0) >= 0 ? 'primary' : 'error', subtitle: `${summaryData.value.summary.profit_margin || 0}% Margin` },
])

// Charts Configurations
const trendSeries = computed(() => [
    { name: 'Revenue', data: summaryData.value.monthly_breakdown.map((m: any) => m.revenue) },
    { name: 'Expenses', data: summaryData.value.monthly_breakdown.map((m: any) => m.expenses) },
    { name: 'Payroll', data: summaryData.value.monthly_breakdown.map((m: any) => m.payroll) }
])

const trendChartOptions: any = {
    chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false }, foreColor: 'rgba(255,255,255,0.4)', sparkline: { enabled: false } },
    colors: ['#22c55e', '#ef4444', '#f59e0b'],
    stroke: { curve: 'smooth', width: 3 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05, stops: [0, 90, 100] } },
    dataLabels: { enabled: false },
    grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
    yaxis: { labels: { formatter: (val: number) => '₹' + (val / 1000).toFixed(0) + 'K' } },
    tooltip: { theme: 'dark', y: { formatter: (val: number) => '₹' + val.toLocaleString() } }
}

const bdeSeries = computed(() => [{ name: 'Revenue', data: bdeData.value.map(b => parseFloat(b.revenue)) }])
const bdeChartOptions: any = computed(() => ({
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, borderRadius: 8, barHeight: '60%' } },
    colors: ['#ef6125'],
    dataLabels: { enabled: true, formatter: (val: any) => '₹' + (val / 1000).toFixed(0) + 'k', style: { fontSize: '10px', fontWeight: 'bold' } },
    xaxis: { categories: bdeData.value.map(b => b.bde_name), labels: { style: { colors: 'rgba(255,255,255,0.5)' } }, axisBorder: { show: false } },
    yaxis: { labels: { style: { colors: 'rgba(255,255,255,0.8)', fontWeight: 'bold' } } },
    grid: { show: false },
    tooltip: { theme: 'dark' }
}))

const fetchAllData = async () => {
    loading.value = true
    try {
        const [summaryRes, bdeRes]: any = await Promise.all([
            api.get('/reports/financial-summary', { params: { year: selectedYear.value } }),
            api.get('/reports/revenue-by-bde', { params: { year: selectedYear.value } })
        ])
        summaryData.value = summaryRes.data
        bdeData.value = bdeRes.data
    } catch (err) {
        uiStore.error('Failed to fetch reports')
    } finally {
        loading.value = false
    }
}

const exportReport = async () => {
    exporting.value = true
    try {
        const res: any = await api.get('/reports/export', { 
            params: { year: selectedYear.value },
            responseType: 'blob' 
        })
        const url = window.URL.createObjectURL(new Blob([res]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `financial_report_${selectedYear.value}.csv`)
        document.body.appendChild(link)
        link.click()
        uiStore.success('Report exported successfully')
    } catch (err) {
        uiStore.error('Failed to export report')
    } finally {
        exporting.value = false
    }
}

const formatNumber = (num: number) => {
    if (!num) return '0'
    return new Intl.NumberFormat('en-IN').format(num)
}

onMounted(fetchAllData)

definePageMeta({
    middleware: 'auth'
})
</script>

<style scoped>
.kpi-card {
    background: rgba(255, 255, 255, 0.03) !important;
    transition: transform 0.3s ease;
}
.kpi-card:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.05) !important;
}
.card-bg-icon {
    position: absolute;
    right: -10px;
    bottom: -10px;
    font-size: 80px !important;
    opacity: 0.03;
    transform: rotate(-15deg);
}

.marker {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.bg-black-thin {
    background: rgba(0, 0, 0, 0.1) !important;
}

.border-thin {
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.custom-report-table :deep(th) {
    background: rgba(255, 255, 255, 0.02) !important;
    height: 50px !important;
    font-size: 11px !important;
    color: rgba(255, 255, 255, 0.5) !important;
    letter-spacing: 1px !important;
}

.custom-report-table :deep(td) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.03) !important;
    font-size: 13px !important;
}

.custom-report-select :deep(.v-field) {
    border-radius: 12px !important;
}

.animate-fade {
    animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
}

.text-error-lighten-1 {
    color: #ff8a80 !important;
}
.text-warning-lighten-1 {
    color: #ffd180 !important;
}
</style>
