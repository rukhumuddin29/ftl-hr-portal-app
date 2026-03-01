<template>
  <v-container class="animate-fade">
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-weight-black uppercase">Hiring Companies</h1>
        <p class="text-caption text-muted uppercase tracking-widest font-weight-bold">
          Manage your recruitment partners and corporate networks
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        rounded="lg"
        class="font-weight-bold"
        @click="openModal()"
      >
        ADD PARTNER
      </v-btn>
    </div>

    <!-- Stats Row -->
    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6 d-flex align-center ga-4">
          <v-avatar color="primary" variant="tonal" rounded="lg" size="48">
            <v-icon>mdi-office-building-outline</v-icon>
          </v-avatar>
          <div>
            <div class="text-h5 font-weight-black">{{ companies.length }}</div>
            <div class="text-caption text-muted font-weight-bold">TOTAL PARTNERS</div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main List -->
    <v-card class="rounded-xl border-thin bg-surface elevation-0">
      <v-data-table
        :headers="headers"
        :items="companies"
        :loading="loading"
        hover
        class="bg-transparent"
      >
        <template v-slot:item.name="{ item }">
          <div class="font-weight-black text-primary uppercase">{{ item.name }}</div>
          <div class="text-[10px] text-muted font-weight-bold uppercase">{{ item.industry || 'General' }}</div>
        </template>

        <template v-slot:item.contact="{ item }">
           <div class="text-subtitle-2 font-weight-bold">{{ item.contact_person || 'N/A' }}</div>
           <div class="text-caption opacity-50">{{ item.email }}</div>
        </template>

        <template v-slot:item.location="{ item }">
           <div class="text-caption font-weight-bold uppercase">{{ item.location || 'N/A' }}</div>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex ga-2">
            <v-btn
              icon="mdi-pencil-outline"
              variant="tonal"
              size="x-small"
              rounded="lg"
              @click="openModal(item)"
            ></v-btn>
            <v-btn
              icon="mdi-delete-outline"
              variant="tonal"
              color="error"
              size="x-small"
              rounded="lg"
              @click="deleteItem(item)"
            ></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card class="rounded-xl border-thin bg-surface overflow-hidden">
        <div class="pa-6 border-b d-flex align-center ga-3 bg-primary text-white">
          <v-avatar color="white" size="40" class="rounded-lg">
            <v-icon color="primary">mdi-office-building-plus</v-icon>
          </v-avatar>
          <div>
            <h3 class="text-subtitle-1 font-weight-black uppercase">{{ editedItem.id ? 'Edit Partner' : 'Add New Partner' }}</h3>
            <p class="text-caption opacity-80 font-weight-bold">Fill in the corporate details</p>
          </div>
        </div>

        <div class="pa-6">
          <v-row dense>
            <v-col cols="12">
              <v-text-field v-model="editedItem.name" label="COMPANY NAME" variant="outlined" density="compact" class="mb-2"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="editedItem.industry" label="INDUSTRY" variant="outlined" density="compact" class="mb-2"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="editedItem.location" label="CITY / LOCATION" variant="outlined" density="compact" class="mb-2"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="editedItem.contact_person" label="CONTACT PERSON" variant="outlined" density="compact" class="mb-2"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="editedItem.phone" label="PHONE" variant="outlined" density="compact" class="mb-2"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="editedItem.email" label="EMAIL" variant="outlined" density="compact" class="mb-2"></v-text-field>
            </v-col>
          </v-row>
        </div>

        <v-card-actions class="pa-6 pt-0">
          <v-btn variant="text" class="font-weight-bold" @click="dialog = false">CANCEL</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="elevated"
            class="font-weight-bold px-8 shadow-primary-20"
            rounded="lg"
            :loading="saving"
            @click="save"
          >SAVE DETAILS</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
const api = useApi()
const uiStore = useUiStore()

const companies = ref([])
const loading = ref(false)
const dialog = ref(false)
const saving = ref(false)

const headers = [
  { title: 'COMPANY / INDUSTRY', key: 'name', align: 'start' },
  { title: 'CONTACT PERSON', key: 'contact' },
  { title: 'LOCATION', key: 'location' },
  { title: 'ACTIONS', key: 'actions', sortable: false, align: 'end' }
]

const editedItem = reactive({
  id: null,
  name: '',
  industry: '',
  location: '',
  contact_person: '',
  phone: '',
  email: ''
})

const fetchCompanies = async () => {
  loading.value = true
  try {
    const res: any = await api.get('/hiring-companies')
    companies.value = res.data
  } catch {
    uiStore.error('Failed to load companies')
  } finally {
    loading.value = false
  }
}

const openModal = (item: any = null) => {
  if (item) {
    Object.assign(editedItem, item)
  } else {
    Object.assign(editedItem, {
      id: null,
      name: '',
      industry: '',
      location: '',
      contact_person: '',
      phone: '',
      email: ''
    })
  }
  dialog.value = true
}

const save = async () => {
    if (!editedItem.name) {
        uiStore.error('Company name is required')
        return
    }

    saving.value = true
    try {
        if (editedItem.id) {
            await api.put(`/hiring-companies/${editedItem.id}`, editedItem)
            uiStore.success('Company updated successfully')
        } else {
            await api.post('/hiring-companies', editedItem)
            uiStore.success('New company partner added')
        }
        dialog.value = false
        fetchCompanies()
    } catch (err: any) {
        uiStore.error(err.data?.message || 'Failed to save company')
    } finally {
        saving.value = false
    }
}

const deleteItem = async (item: any) => {
    if (!confirm(`Are you sure you want to delete ${item.name}?`)) return
    try {
        await api.delete(`/hiring-companies/${item.id}`)
        uiStore.success('Company removed')
        fetchCompanies()
    } catch {
        uiStore.error('Delete failed')
    }
}

onMounted(fetchCompanies)

definePageMeta({
  middleware: 'auth'
})
</script>

<style scoped>
.shadow-primary-20 {
    box-shadow: 0 4px 14px 0 rgba(var(--v-theme-primary), 0.39) !important;
}
</style>
