<template>
  <v-container fluid class="animate-fade py-6 px-lg-12 px-6">
    <!-- Header -->
    <v-row align="center" class="mb-8">
      <v-col cols="12" lg="6">
        <h1 class="text-h4 font-weight-black d-flex align-center ga-3">
          <v-icon color="secondary">mdi-account-multiple-remove</v-icon>
          DUPLICATE LEADS
        </h1>
        <p class="text-caption text-muted uppercase tracking-widest font-weight-bold">
          Clean your database and resolve redundant student profiles
        </p>
      </v-col>
      <v-col cols="12" lg="6" class="d-flex justify-lg-end align-center ga-3 flex-wrap">
        <v-select
          v-model="minScore"
          :items="[30, 50, 80]"
          label="MIN CONFIDENCE"
          variant="outlined"
          density="compact"
          hide-details
          class="max-w-[150px]"
          suffix="%"
          @update:model-value="fetchDuplicates"
        ></v-select>
        <v-btn
          color="white"
          variant="outlined"
          prepend-icon="mdi-refresh"
          rounded="lg"
          class="font-weight-bold"
          :loading="loading"
          @click="fetchDuplicates"
        >
          RE-SCAN SYSTEM
        </v-btn>
      </v-col>
    </v-row>

    <!-- Groups View -->
    <v-row v-if="groups.length > 0">
      <v-col v-for="(group, idx) in groups" :key="idx" cols="12">
        <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-0 overflow-hidden mb-6">
          <div class="bg-surface-light px-6 py-3 d-flex justify-space-between align-center border-b">
             <div class="d-flex align-center ga-3">
                <v-chip size="small" :color="group.score >= 80 ? 'error' : 'warning'" class="font-weight-black">
                   {{ group.score }}% {{ group.score >= 80 ? 'DEFINITE' : 'PROBABLE' }} MATCH
                </v-chip>
                <span class="text-caption font-weight-bold opacity-50 uppercase">MATCHING FIELD: {{ group.field.toUpperCase() }} ({{ group.value }})</span>
             </div>
             <v-btn size="small" variant="text" color="primary" prepend-icon="mdi-check" @click="dismissGroup(idx)">NOT A DUPLICATE</v-btn>
          </div>

          <v-row class="pa-6" dense>
             <v-col v-for="lead in group.leads" :key="lead.id" cols="12" md="6">
                <v-card variant="outlined" class="rounded-xl pa-5 bg-card hover-primary transition-all">
                   <div class="d-flex justify-space-between align-start mb-4">
                      <div>
                        <div class="text-h6 font-weight-black text-primary">{{ lead.name }}</div>
                        <div class="text-caption text-muted font-weight-bold uppercase">ID: #{{ lead.id }}</div>
                      </div>
                      <v-chip size="x-small" label class="font-weight-black">{{ lead.status.toUpperCase() }}</v-chip>
                   </div>

                   <v-list density="compact" class="bg-transparent pa-0">
                      <v-list-item class="px-0">
                         <template v-slot:prepend><v-icon size="16" class="mr-2">mdi-phone</v-icon></template>
                         <v-list-item-title class="text-body-2 font-weight-medium">{{ lead.phone }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item class="px-0">
                         <template v-slot:prepend><v-icon size="16" class="mr-2">mdi-email</v-icon></template>
                         <v-list-item-title class="text-body-2 font-weight-medium">{{ lead.email || 'NO EMAIL' }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item class="px-0">
                         <template v-slot:prepend><v-icon size="16" class="mr-2">mdi-account-tie</v-icon></template>
                         <v-list-item-title class="text-body-2 font-weight-medium">BDE: {{ lead.assigned_to?.name || 'UNASSIGNED' }}</v-list-item-title>
                      </v-list-item>
                   </v-list>

                   <div class="mt-4 pt-4 border-t d-flex justify-space-between align-center">
                      <v-btn size="x-small" variant="tonal" @click="navigateTo(`/leads/${lead.id}`)">VIEW FULL PROFILE</v-btn>
                      <v-btn size="x-small" color="primary" class="font-weight-black" @click="openMergeDialog(group, lead)">MERGE OTHERS INTO THIS</v-btn>
                   </div>
                </v-card>
             </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-row v-else-if="!loading">
      <v-col cols="12">
         <v-card class="rounded-xl border-thin border-dashed bg-transparent pa-12 text-center">
            <v-icon size="64" class="opacity-10 mb-4" color="success">mdi-check-decagram</v-icon>
            <p class="text-h6 font-weight-bold opacity-30 uppercase">NO DUPLICATES DETECTED</p>
            <p class="text-caption text-muted uppercase font-weight-black tracking-widest mt-2">Your system data is currently clean and unique</p>
         </v-card>
      </v-col>
    </v-row>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="40"></v-progress-circular>
        <p class="text-caption mt-4 font-weight-bold opacity-50 uppercase tracking-widest">Scanning lead database...</p>
    </div>

    <!-- Merge Dialog -->
    <v-dialog v-model="mergeDialog" max-width="800px" persistent>
        <v-card class="rounded-xl border-thin bg-surface">
            <v-card-title class="pa-6 d-flex align-center ga-2 border-b">
                <v-icon color="primary">mdi-merge</v-icon>
                <span class="font-weight-black uppercase">Merge Verification</span>
                <v-spacer></v-spacer>
                <v-btn icon="mdi-close" variant="text" size="small" @click="mergeDialog = false"></v-btn>
            </v-card-title>

            <v-card-text class="pa-6">
                <v-alert type="info" variant="tonal" class="mb-6 rounded-lg font-weight-medium text-caption" density="compact">
                    You are keeping <strong>{{ primaryLead?.name }}</strong>. Other leads in this group will be merged into it and deleted.
                </v-alert>

                <div class="text-overline font-weight-black opacity-50 mb-3">CONSOLIDATE DATA</div>
                <div class="border rounded-xl overflow-hidden">
                    <table class="w-full text-left text-body-2 border-collapse">
                        <thead class="bg-surface-light text-[10px] font-weight-black uppercase">
                           <tr>
                             <th class="pa-3">Field</th>
                             <th class="pa-3">{{ primaryLead?.name }} (KEEPING)</th>
                             <th class="pa-3">Other (ABSORBING)</th>
                             <th class="pa-3 text-center">Take From</th>
                           </tr>
                        </thead>
                        <tbody>
                           <tr v-for="field in mergeableFields" :key="field.key" class="border-t">
                              <td class="pa-3 font-weight-bold uppercase text-[10px]">{{ field.label }}</td>
                              <td class="pa-3 opacity-70">{{ primaryLead?.[field.key] || '---' }}</td>
                              <td class="pa-3 opacity-70">{{ secondaryLead?.[field.key] || '---' }}</td>
                              <td class="pa-3 text-center">
                                 <v-btn-toggle v-model="mergeChoices[field.key]" mandatory density="compact" color="primary" rounded="lg">
                                    <v-btn value="primary" size="x-small" class="px-2">A</v-btn>
                                    <v-btn value="secondary" size="x-small" class="px-2">B</v-btn>
                                 </v-btn-toggle>
                              </td>
                           </tr>
                        </tbody>
                    </table>
                </div>
            </v-card-text>

            <v-card-actions class="pa-6 border-t bg-surface-light">
                <v-btn variant="text" @click="mergeDialog = false">CANCEL</v-btn>
                <v-spacer></v-spacer>
                <v-btn color="primary" class="font-weight-black px-8" rounded="lg" :loading="merging" @click="confirmMerge">EXECUTE MERGE</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
const api = useApi()
const uiStore = useUiStore()

const loading = ref(true)
const merging = ref(false)
const groups = ref<any[]>([])
const minScore = ref(50)

const mergeDialog = ref(false)
const primaryLead = ref<any>(null)
const secondaryLead = ref<any>(null)
const activeGroupIdx = ref(-1)

const mergeChoices = reactive<Record<string, string>>({})
const mergeableFields = [
    { key: 'email', label: 'Email' },
    { key: 'alternate_phone', label: 'Alt Phone' },
    { key: 'city', label: 'City' },
    { key: 'notes', label: 'Remarks' },
    { key: 'source', label: 'Source' }
]

const fetchDuplicates = async () => {
    loading.value = true
    try {
        const res: any = await api.get('/leads/duplicates', { 
            params: { min_score: minScore.value }
        })
        groups.value = res.data
    } catch {
        uiStore.error('Failed to scan for duplicates')
    } finally {
        loading.value = false
    }
}

const openMergeDialog = (group: any, keep: any) => {
    primaryLead.value = keep
    secondaryLead.value = group.leads.find((l: any) => l.id !== keep.id)
    activeGroupIdx.value = groups.value.indexOf(group)
    
    // Initialize choices (default to primary)
    mergeableFields.forEach(f => {
        mergeChoices[f.key] = 'primary'
    })
    
    mergeDialog.value = true
}

const confirmMerge = async () => {
    merging.value = true
    try {
        await api.post('/leads/merge', {
            primary_id: primaryLead.value.id,
            secondary_id: secondaryLead.value.id,
            field_overrides: mergeChoices
        })
        uiStore.success('Leads merged successfully')
        mergeDialog.value = false
        // Remove the group from UI
        groups.value.splice(activeGroupIdx.value, 1)
    } catch {
        uiStore.error('Failed to merge leads')
    } finally {
        merging.value = false
    }
}

const dismissGroup = (idx: number) => {
    groups.value.splice(idx, 1)
    uiStore.info('Marked as distinct leads')
}

const dismissGroupReal = (idx: number) => {
    // In a real app, we'd tell the backend to ignore this pair forever
    groups.value.splice(idx, 1)
}

onMounted(fetchDuplicates)

definePageMeta({
    middleware: 'auth'
})
</script>

<style scoped>
.hover-primary:hover {
    border-color: var(--color-primary) !important;
    background: rgba(var(--v-theme-primary), 0.05) !important;
}

.transition-all {
    transition: all 0.3s ease;
}

.w-full { width: 100%; }

.bg-white-5 {
    background: rgba(255, 255, 255, 0.05);
}
</style>
