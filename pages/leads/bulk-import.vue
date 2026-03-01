<template>
  <v-container class="max-w-6xl animate-fade">
    <div class="d-flex align-center ga-4 mb-8">
      <v-btn
        icon="mdi-arrow-left"
        variant="tonal"
        rounded="xl"
        @click="navigateTo('/leads/create')"
      ></v-btn>
      <div>
        <h1 class="text-h4 font-weight-black uppercase">Bulk Import Leads</h1>
        <p class="text-body-2 text-muted">Upload a CSV file to import multiple leads at once.</p>
      </div>
    </div>

    <!-- Upload Controls -->
    <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-12 mb-8 text-center">
      <div class="d-flex justify-center ga-6 mb-8">
        <v-btn
          variant="outlined"
          color="primary"
          prepend-icon="mdi-download"
          rounded="lg"
          size="large"
          class="font-weight-bold px-8"
          @click="downloadSample"
        >
          EXPORT SAMPLE
        </v-btn>
        
        <v-btn
          color="primary"
          prepend-icon="mdi-file-upload-outline"
          rounded="lg"
          size="large"
          class="font-weight-bold px-8"
          @click="fileInput?.click()"
        >
          IMPORT LEADS
        </v-btn>
        <input
          type="file"
          ref="fileInput"
          accept=".csv"
          class="d-none"
          @change="handleFileUpload"
        />
      </div>
      
      <p class="text-caption text-muted uppercase font-weight-black tracking-widest">
        Support .csv files only • Max 10,000 records per upload
      </p>
    </v-card>

    <!-- Preview Table -->
    <v-card v-if="previewData.length > 0" class="rounded-xl border-thin bg-surface elevation-0 overflow-hidden mb-8">
      <div class="pa-6 border-b d-flex align-center justify-space-between bg-primary-lighten-5">
        <h2 class="text-h6 font-weight-black uppercase text-primary d-flex align-center ga-2">
          <v-icon>mdi-table-eye</v-icon>
          Preview Data ({{ previewData.length }} Records)
        </h2>
        <v-btn
          color="primary"
          rounded="lg"
          class="px-8 font-weight-bold"
          :loading="importing"
          @click="confirmImport"
        >
          CONFIRM UPLOAD
        </v-btn>
      </div>

      <v-table density="compact">
        <thead>
          <tr class="text-overline font-weight-black opacity-50">
            <th class="px-4">NAME</th>
            <th class="px-4">PHONE</th>
            <th class="px-4">EMAIL</th>
            <th class="px-4">LEAD TYPE</th>
            <th class="px-4">SOURCE</th>
            <th class="px-4">CITY</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in paginatedData" :key="i">
            <td class="px-4 font-weight-bold">{{ row.name }}</td>
            <td class="px-4">{{ row.phone }}</td>
            <td class="px-4 text-muted">{{ row.email || '-' }}</td>
            <td class="px-4"><v-chip size="x-small" label>{{ row.lead_type }}</v-chip></td>
            <td class="px-4 text-caption">{{ row.source || '-' }}</td>
            <td class="px-4 text-caption">{{ row.city || '-' }}</td>
          </tr>
        </tbody>
      </v-table>

      <div class="pa-4 d-flex align-center justify-space-between border-t">
        <span class="text-caption text-muted">Page {{ page }} of {{ Math.ceil(previewData.length / perPage) }}</span>
        <div class="d-flex ga-2">
          <v-btn
            icon="mdi-chevron-left"
            variant="text"
            size="small"
            :disabled="page === 1"
            @click="page--"
          ></v-btn>
          <v-btn
            icon="mdi-chevron-right"
            variant="text"
            size="small"
            :disabled="page >= Math.ceil(previewData.length / perPage)"
            @click="page++"
          ></v-btn>
        </div>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const api = useApi()
const uiStore = useUiStore()
const fileInput = ref<HTMLInputElement | null>(null)
const previewData = ref<any[]>([])
const importing = ref(false)
const page = ref(1)
const perPage = 20

const paginatedData = computed(() => {
  const start = (page.value - 1) * perPage
  return previewData.value.slice(start, start + perPage)
})

const downloadSample = () => {
  const headers = [
    'name', 'email', 'phone', 'alternate_phone', 'address', 'city', 'state', 'pincode',
    'lead_type', 'source', 'referred_by', 'status', 'school_name', 'tenth_year', 'tenth_board',
    'tenth_percentage', 'tenth_grade', 'inter_college', 'inter_year', 'inter_board',
    'inter_stream', 'inter_percentage', 'inter_grade', 'degree_college', 'degree_year',
    'degree_name', 'degree_specialization', 'degree_university', 'degree_percentage',
    'degree_grade', 'pg_college', 'pg_year', 'pg_name', 'pg_specialization',
    'pg_university', 'pg_percentage', 'pg_grade', 'current_company',
    'current_designation', 'experience_years', 'current_skills', 'notes', 'follow_up_date'
  ]
  
  const sampleData = [
    'John Doe', 'john@example.com', '9876543210', '', '123 Street', 'Mumbai', 'Maharashtra', '400001',
    'student', 'facebook', '', 'new', 'Modern School', '2018', 'CBSE', '85.5', 'A', 'Junior College', '2020',
    'State Board', 'Science', '80.0', 'B', 'Engineering College', '2024', 'B.Tech', 'CS', 'Mumbai University',
    '75.0', 'A', '', '', '', '', '', '', '', '', '', '0', '', 'Very interested', '2026-03-01'
  ]

  const csvContent = [
    headers.join(','),
    sampleData.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', 'leads_import_sample.csv')
  link.click()
}

const handleFileUpload = (event: any) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e: any) => {
    const text = e.target.result
    const lines = text.split(/\r?\n/).filter((l: string) => l.trim() !== '')
    if (lines.length < 2) {
      uiStore.error('CSV file is empty or missing headers')
      return
    }

    const headers = lines[0].split(',').map((h: string) => h.trim().replace(/"/g, '').toLowerCase())
    
    // Validate required headers
    if (!headers.includes('name') || !headers.includes('phone')) {
      uiStore.error('CSV must include at least "name" and "phone" columns')
      return
    }

    previewData.value = lines.slice(1).map((line: string) => {
      // Improved CSV split that handles quotes and commas
      const values = line.match(/(".*?"|[^",]+|(?<=,|^)(?=,|$))/g) || []
      const obj: any = {}
      headers.forEach((header: string, i: number) => {
        let val = values[i] || ''
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1)
        }
        obj[header] = val.replace(/""/g, '"').trim()
      })
      return obj
    })
    
    page.value = 1
    uiStore.success(`${previewData.value.length} records loaded for preview`)
  }
  reader.readAsText(file)
}

const confirmImport = async () => {
  if (previewData.value.length === 0) return
  
  importing.value = true
  try {
    const res: any = await api.post('/leads/bulk-import', { leads: previewData.value })
    uiStore.success(res.message || 'Import completed successfully!')
    navigateTo('/leads')
  } catch (err: any) {
    uiStore.error(err.data?.message || 'Failed to import leads')
  } finally {
    importing.value = false
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
