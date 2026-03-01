<template>
  <v-row class="animate-fade">
    <!-- Header Section -->
    <v-col cols="12" class="mb-4">
      <div class="d-flex justify-space-between align-center">
        <div>
          <h1 class="text-h4 font-weight-black">EMAIL HISTORY</h1>
          <p class="text-body-2 text-muted">Track and monitor all bulk email campaigns.</p>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-email-plus-outline"
          to="/bulk-emails"
          class="font-weight-black"
        >
          COMPOSE NEW
        </v-btn>
      </div>
    </v-col>

    <!-- Filters Section -->
    <v-col cols="12">
      <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6 mb-6">
        <v-row dense align="center">
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.status"
              label="CAMPAIGN STATUS"
              :items="statusOptions"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              prepend-inner-icon="mdi-filter-variant"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.sent_by"
              label="SENT BY (BDE)"
              :items="bdeOptions"
              item-title="name"
              item-value="id"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              prepend-inner-icon="mdi-account-outline"
            ></v-select>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field
              v-model="filters.start_date"
              label="START DATE"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="mdi-calendar-range"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field
              v-model="filters.end_date"
              label="END DATE"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="mdi-calendar-range"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-btn
              block
              color="primary"
              variant="tonal"
              prepend-icon="mdi-refresh"
              @click="fetchHistory(1)"
              class="font-weight-bold"
            >
              REFRESH
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-col>

    <!-- History Table -->
    <v-col cols="12">
      <v-card class="rounded-xl border-thin bg-surface elevation-0 overflow-hidden">
        <v-data-table-server
          v-model:items-per-page="itemsPerPage"
          :headers="headers"
          :items="historyItems"
          :items-length="totalItems"
          :loading="loading"
          @update:options="handleTableUpdate"
          class="bg-transparent"
        >
          <!-- Custom Status Render -->
          <template v-slot:item.status="{ item }">
            <v-chip
              :color="statusColor(item.status)"
              size="x-small"
              label
              class="font-weight-black px-3"
            >
              {{ item.status.toUpperCase() }}
            </v-chip>
          </template>

          <!-- Custom Subject/Body Preview -->
          <template v-slot:item.subject="{ item }">
            <div class="font-weight-bold text-truncate max-w-xs">{{ item.subject }}</div>
            <div class="text-[10px] text-muted text-truncate max-w-xs">{{ stripHtml(item.body) }}</div>
          </template>

          <!-- Custom Recipients Render -->
          <template v-slot:item.recipients="{ item }">
             <div class="d-flex flex-column">
                <span class="text-subtitle-2 font-weight-black">{{ item.recipients_count || 0 }}</span>
                <span class="text-[10px] text-muted uppercase">{{ item.type === 'leads' ? (item.target_status || 'ALL') : 'RANDOM' }}</span>
             </div>
          </template>

          <!-- Custom Date Render -->
          <template v-slot:item.created_at="{ item }">
            <div class="text-caption font-weight-bold">
              {{ formatDate(item.created_at) }}
            </div>
            <div class="text-[10px] text-muted">
              {{ formatTime(item.created_at) }}
            </div>
          </template>

          <!-- Custom Sender Render -->
          <template v-slot:item.sender="{ item }">
             <div class="d-flex align-center ga-2">
                <v-avatar color="primary" size="24" class="text-[10px] font-bold">
                  {{ item.sender?.name?.charAt(0) }}
                </v-avatar>
                <span class="text-caption font-weight-bold uppercase">{{ item.sender?.name || 'SYSTEM' }}</span>
             </div>
          </template>

          <!-- Actions -->
          <template v-slot:item.actions="{ item }">
            <v-btn
              icon="mdi-eye-outline"
              variant="text"
              size="small"
              color="primary"
              @click="viewDetails(item)"
            ></v-btn>
          </template>
        </v-data-table-server>
      </v-card>
    </v-col>

    <!-- Details Dialog -->
    <v-dialog v-model="showDetails" max-width="700">
      <v-card v-if="selectedCampaign" class="rounded-xl pa-4 bg-surface">
        <v-card-title class="text-h6 font-weight-black d-flex justify-space-between align-center">
          CAMPAIGN DETAILS
          <v-chip :color="statusColor(selectedCampaign.status)" label size="small" class="font-weight-black">
            {{ selectedCampaign.status.toUpperCase() }}
          </v-chip>
        </v-card-title>
        <v-divider class="my-2"></v-divider>
        <v-card-text>
          <div class="mb-4">
            <div class="text-[10px] font-weight-black text-primary uppercase mb-1">Subject</div>
            <div class="text-subtitle-1 font-weight-bold">{{ selectedCampaign.subject }}</div>
          </div>
          
          <div class="mb-4">
            <div class="text-[10px] font-weight-black text-primary uppercase mb-1">Message Body</div>
            <v-card variant="outlined" class="pa-4 bg-primary-lighten-5 rounded-lg border-thin min-h-[100px] max-h-[300px] overflow-auto">
               <div v-html="selectedCampaign.body"></div>
            </v-card>
          </div>

          <v-row>
            <v-col cols="6">
              <div class="text-[10px] font-weight-black text-primary uppercase mb-1">Target Group</div>
              <div class="text-caption font-weight-bold uppercase">
                {{ selectedCampaign.type === 'random' ? 'Manual Input' : selectedCampaign.target_status || 'All Leads' }}
              </div>
              <div v-if="selectedCampaign.type === 'random' && selectedCampaign.recipient" class="text-[10px] text-muted font-bold mt-1">
                {{ selectedCampaign.recipient }}
              </div>
            </v-col>
            <v-col cols="6">
               <div class="text-[10px] font-weight-black text-primary uppercase mb-1">Recipient Count</div>
               <div class="text-caption font-weight-bold">{{ selectedCampaign.recipients_count || 0 }} Emails Scheduled</div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="px-6 pb-6">
          <v-spacer></v-spacer>
          <v-btn color="primary" block rounded="lg" class="font-weight-bold" @click="showDetails = false">CLOSE</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

const api = useApi()
const uiStore = useUiStore()

const loading = ref(false)
const historyItems = ref<any[]>([])
const totalItems = ref(0)
const itemsPerPage = ref(20)
const currentPage = ref(1)

const bdeOptions = ref<any[]>([])
const showDetails = ref(false)
const selectedCampaign = ref<any>(null)

const filters = reactive({
  status: null,
  sent_by: null,
  start_date: '',
  end_date: ''
})

const statusOptions = [
  { title: 'PENDING', value: 'pending' },
  { title: 'SENT', value: 'sent' },
  { title: 'FAILED', value: 'failed' }
]

const headers = [
  { title: 'SENDER', key: 'sender', align: 'start', sortable: false },
  { title: 'SUBJECT & PREVIEW', key: 'subject', align: 'start', sortable: false },
  { title: 'RECIPIENTS', key: 'recipients', align: 'center', sortable: false },
  { title: 'STATUS', key: 'status', align: 'center', sortable: false },
  { title: 'DATE & TIME', key: 'created_at', align: 'center', sortable: true },
  { title: 'ACTIONS', key: 'actions', align: 'end', sortable: false }
] as const

const fetchHistory = async (page = 1) => {
  loading.value = true
  try {
    const res: any = await api.get('/bulk-emails', {
      params: {
        page,
        per_page: itemsPerPage.value,
        status: filters.status,
        sent_by: filters.sent_by,
        start_date: filters.start_date,
        end_date: filters.end_date
      }
    })
    
    // Support for both raw response and data wrapped response
    const data = res.data?.data || res.data || []
    const total = res.data?.total || res.total || 0
    
    historyItems.value = data
    totalItems.value = total
    currentPage.value = page
  } catch (err) {
    uiStore.error('Failed to fetch email history')
  } finally {
    loading.value = false
  }
}

const fetchBdes = async () => {
    try {
        const res: any = await api.get('/users/bdes')
        // res.data is expected to be array of users
        bdeOptions.value = res.data || []
    } catch (err) {}
}

const handleTableUpdate = ({ page, itemsPerPage }: any) => {
    fetchHistory(page)
}

const statusColor = (status: string) => {
  switch (status) {
    case 'sent': return 'success'
    case 'pending': return 'warning'
    case 'failed': return 'error'
    default: return 'grey'
  }
}

const stripHtml = (html: string) => {
  return html?.replace(/<[^>]*>?/gm, '') || ''
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  return format(new Date(dateStr), 'MMM dd, yyyy')
}

const formatTime = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  return format(new Date(dateStr), 'hh:mm a')
}

const viewDetails = (campaign: any) => {
  selectedCampaign.value = campaign
  showDetails.value = true
}

onMounted(() => {
  fetchBdes()
  // Data table server triggers initial fetch
})

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
.text-muted {
  opacity: 0.6;
}
.max-w-xs {
  max-width: 250px;
}
.bg-primary-lighten-5 {
  background: rgba(var(--v-theme-primary), 0.03);
}
.hover-row:hover {
  background: rgba(var(--v-theme-primary), 0.02) !important;
}
</style>
