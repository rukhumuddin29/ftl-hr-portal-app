<template>
  <v-container fluid class="animate-fade py-6 px-6">
    <!-- Header Area -->
    <v-row align="center" class="mb-6">
      <v-col cols="12" lg="4">
        <h1 class="text-h4 font-weight-black d-flex align-center ga-3">
          <v-icon color="primary">mdi-view-column-outline</v-icon>
          LEAD PIPELINE
        </h1>
        <p class="text-caption text-muted uppercase tracking-widest font-weight-bold">
          Visualize and manage your conversion funnel
        </p>
      </v-col>
      <v-col cols="12" lg="8" class="d-flex justify-lg-end align-center ga-3 flex-wrap">
        <!-- BDE Filter for Admins -->
        <div v-if="authStore.isAdmin" style="width: 200px">
          <v-select
            v-model="filters.assigned_to"
            :items="bdes"
            item-title="name"
            item-value="id"
            label="FILTER BY BDE"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            placeholder="ALL USERS"
            class="custom-pipeline-select"
            @update:model-value="fetchPipeline"
          ></v-select>
        </div>

        <!-- Date Range -->
        <div class="d-flex align-center ga-2 bg-black-thin px-3 py-1 rounded-lg border-thin">
          <v-text-field
            v-model="filters.date_from"
            type="date"
            variant="plain"
            density="compact"
            hide-details
            class="text-caption font-weight-bold"
            @change="fetchPipeline"
          ></v-text-field>
          <span class="text-muted opacity-50">TO</span>
          <v-text-field
            v-model="filters.date_to"
            type="date"
            variant="plain"
            density="compact"
            hide-details
            class="text-caption font-weight-bold"
            @change="fetchPipeline"
          ></v-text-field>
        </div>

        <v-btn
          variant="outlined"
          prepend-icon="mdi-format-list-bulleted"
          rounded="lg"
          class="font-weight-bold"
          @click="navigateTo('/leads')"
        >
          LIST VIEW
        </v-btn>
      </v-col>
    </v-row>

    <!-- Kanban Board -->
    <div v-if="loading" class="d-flex flex-column align-center justify-center py-16">
      <v-progress-circular indeterminate color="primary" size="64" width="6"></v-progress-circular>
      <p class="mt-4 text-muted uppercase font-weight-black tracking-widest">Constructing Pipeline...</p>
    </div>

    <div v-else class="pipeline-board-container">
      <div class="pipeline-row">
        <div v-for="(col, key) in columns" :key="key" class="pipeline-column">
          <!-- Column Header -->
          <div class="column-header mb-4" :style="{ borderLeftColor: getColorValue(col.color) }">
            <div class="d-flex align-center ga-2 flex-grow-1">
              <v-icon :color="col.color" size="18">{{ col.icon }}</v-icon>
              <span class="font-weight-black text-caption tracking-widest uppercase">{{ col.label }}</span>
            </div>
            <v-chip size="x-small" :color="col.color" variant="tonal" class="font-weight-black">
              {{ col.count }}
            </v-chip>
          </div>

          <!-- Draggable Zone -->
          <draggable
            :list="col.leads"
            :group="'pipeline'"
            item-key="id"
            class="drop-zone"
            ghost-class="ghost-card"
            drag-class="dragging-card"
            animation="250"
            @change="(evt: any) => handleMove(evt, key)"
          >
            <template #item="{ element }">
              <v-card class="lead-card mb-4 pa-4 rounded-xl border-thin elevation-0" @click="navigateTo(`/leads/${element.id}`)">
                <div class="d-flex justify-space-between align-start mb-2">
                  <h3 class="text-subtitle-2 font-weight-black text-uppercase link-under">{{ element.name }}</h3>
                  <v-avatar size="24" :color="col.color" variant="tonal" class="rounded-lg">
                    <v-icon size="14">{{ col.icon }}</v-icon>
                  </v-avatar>
                </div>
                
                <p class="text-caption text-muted mb-3 font-weight-medium">
                  {{ element.phone }}
                </p>

                <div class="d-flex align-center ga-2 mb-4">
                  <v-icon size="12" color="primary">mdi-school-outline</v-icon>
                  <span class="text-[10px] font-weight-black uppercase text-white-70 truncate">
                    {{ element.interested_course?.name || 'GENERIC INTEREST' }}
                  </span>
                </div>

                <v-divider class="mb-3 border-opacity-25"></v-divider>

                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center ga-1">
                    <v-avatar size="18" :image="element.assigned_to?.avatar_url || ''" color="grey-lighten-2">
                       <v-icon v-if="!element.assigned_to?.avatar_url" size="10">mdi-account</v-icon>
                    </v-avatar>
                    <span class="text-[9px] font-weight-bold text-muted uppercase">
                      {{ element.assigned_to?.name || 'UNASSIGNED' }}
                    </span>
                  </div>
                  <span class="text-[9px] font-weight-medium opacity-50">{{ timeAgo(element.updated_at) }}</span>
                </div>
              </v-card>
            </template>

            <!-- Empty Placeholder -->
            <template #footer>
                <div v-if="col.leads.length === 0" class="empty-column-placeholder d-flex align-center justify-center">
                    <span class="text-[10px] font-weight-black opacity-20 uppercase tracking-widest">Drop Leads Here</span>
                </div>
            </template>
          </draggable>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'

const api = useApi()
const authStore = useAuthStore()
const uiStore = useUiStore()

const loading = ref(true)
const columns = ref<any>({})
const bdes = ref<any[]>([])
const filters = reactive({
  assigned_to: null as number | null,
  interested_course_id: null as number | null,
  date_from: '',
  date_to: ''
})

const fetchPipeline = async () => {
  loading.value = true
  try {
    const res: any = await api.get('/leads/pipeline', { params: filters })
    columns.value = res.data
  } catch (err) {
    uiStore.error('Failed to load lead pipeline')
  } finally {
    loading.value = false
  }
}

const fetchBdes = async () => {
  try {
    const res: any = await api.get('/users/bdes')
    bdes.value = res.data || []
  } catch (err) {
    console.error('BDE fetch failed')
  }
}

const handleMove = async (evt: any, targetColumnKey: string) => {
  if (evt.added) {
    const leadId = evt.added.element.id
    const targetStatus = targetColumnKey // This works because our column keys match primary status targets

    try {
      // Optimistic count update (handled by vuedraggable list sync, but we might need to manually update col counts if they aren't computed)
      // Actually vuedraggable updates the lists reactively. We just need to trigger the API.
      await api.patch(`/leads/${leadId}/status`, { status: targetStatus })
      
      // Update counts locally after success for perfect consistency
      // In a real app we'd just re-fetch or use a client-side state manager
      // For now, let's just refresh counts to be safe
      Object.keys(columns.value).forEach(key => {
        columns.value[key].count = columns.value[key].leads.length
      })

      if (targetStatus === 'converted') {
        uiStore.success('🎉 Goal! Lead successfully converted!')
      }
    } catch (err) {
      uiStore.error('Failed to update lead status. Returning to original position.')
      fetchPipeline() // Rollback by re-fetching
    }
  }
}

const getColorValue = (colorToken: string) => {
  const colors: any = {
    blue: '#3b82f6',
    indigo: '#6366f1',
    success: '#22c55e',
    amber: '#f59e0b',
    primary: '#ef6125',
    error: '#ef4444'
  }
  return colors[colorToken] || '#94a3b8'
}

const timeAgo = (dateStr: string) => {
  const date: any = new Date(dateStr)
  const now: any = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

onMounted(() => {
  fetchPipeline()
  if (authStore.isAdmin) fetchBdes()
})

definePageMeta({
  middleware: 'auth'
})
</script>

<style scoped>
.pipeline-board-container {
  overflow-x: auto;
  padding-bottom: 24px;
}

.pipeline-row {
  display: flex;
  gap: 20px;
  min-height: calc(100vh - 250px);
}

.pipeline-column {
  min-width: 300px;
  max-width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.column-header {
  border-left: 4px solid;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  display: flex;
  align-items: center;
}

.drop-zone {
  flex: 1;
  min-height: 400px;
  padding: 4px;
  border-radius: 16px;
  transition: all 0.3s ease;
  border: 2px dashed transparent;
}

.drop-zone:hover {
  background: rgba(255, 255, 255, 0.01);
  border-color: rgba(255, 255, 255, 0.05);
}

.lead-card {
  cursor: grab;
  background: rgba(255, 255, 255, 0.02) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

.lead-card:hover {
  background: rgba(255, 255, 255, 0.04) !important;
  transform: translateY(-4px);
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
}

.lead-card:active {
  cursor: grabbing;
}

.ghost-card {
  opacity: 0.3;
  background: rgba(var(--v-theme-primary), 0.1) !important;
  border: 2px dashed rgb(var(--v-theme-primary)) !important;
}

.dragging-card {
  opacity: 0.9;
  transform: rotate(2deg);
}

.empty-column-placeholder {
  height: 100px;
  border: 2px dashed rgba(255, 255, 255, 0.05);
  border-radius: 16px;
}

.bg-black-thin {
  background: rgba(0, 0, 0, 0.2);
}

.border-thin {
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.text-white-70 {
  color: rgba(255, 255, 255, 0.7) !important;
}

.link-under:hover {
  text-decoration: underline;
  color: rgb(var(--v-theme-primary));
}

.custom-pipeline-select :deep(.v-field) {
  border-radius: 12px !important;
  background: rgba(0, 0, 0, 0.2) !important;
}

.custom-pipeline-select :deep(.v-field__input) {
  font-weight: 800 !important;
  font-size: 11px !important;
  letter-spacing: 0.5px !important;
}

/* Custom Scrollbar */
.pipeline-board-container::-webkit-scrollbar {
  height: 8px;
}
.pipeline-board-container::-webkit-scrollbar-track {
  background: transparent;
}
.pipeline-board-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.pipeline-board-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.animate-fade {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
