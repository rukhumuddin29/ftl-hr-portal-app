<template>
  <v-container class="max-w-7xl animate-fade">
    <div class="d-flex justify-space-between align-center mb-8">
      <div>
        <h1 class="text-h4 font-weight-black uppercase">Departments</h1>
        <p class="text-body-2 text-muted">Manage company departments and organizational units.</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">ADD DEPARTMENT</v-btn>
    </div>

    <v-card class="rounded-xl border-thin bg-surface elevation-0">
      <v-data-table
        :headers="headers"
        :items="departments"
        :loading="loading"
        class="bg-transparent"
        hover
      >
        <template v-slot:item.name="{ item }">
          <div class="font-weight-black text-subtitle-2 uppercase">{{ item.name }}</div>
        </template>
        
        <template v-slot:item.status="{ item }">
          <v-chip :color="item.status === 'active' ? 'success' : 'error'" size="x-small" label class="font-weight-black px-3">
            {{ item.status.toUpperCase() }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-end ga-2">
            <v-btn icon="mdi-pencil-outline" variant="text" size="small" color="primary" @click="openDialog(item)"></v-btn>
            <v-btn icon="mdi-delete-outline" variant="text" size="small" color="error" @click="confirmDelete(item)"></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card class="rounded-xl pa-4">
        <v-card-title class="text-h6 font-weight-black uppercase">{{ isEditing ? 'EDIT DEPARTMENT' : 'NEW DEPARTMENT' }}</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="save">
            <v-text-field v-model="form.name" label="DEPARTMENT NAME" variant="outlined" class="mb-4" required></v-text-field>
            <v-textarea v-model="form.description" label="DESCRIPTION" variant="outlined" rows="3" class="mb-4"></v-textarea>
            <v-select v-model="form.status" :items="['active', 'inactive']" label="STATUS" variant="outlined" class="text-uppercase mb-4"></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions class="ga-6 px-6 pb-6">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" rounded="lg" class="px-8 font-weight-bold" @click="dialog = false">CANCEL</v-btn>
          <v-btn color="primary" rounded="lg" class="px-8 font-weight-bold" :loading="saving" @click="save">SAVE</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
const api = useApi()
const uiStore = useUiStore()

const departments = ref([])
const loading = ref(true)
const dialog = ref(false)
const isEditing = ref(false)
const saving = ref(false)

const headers = [
  { title: 'NAME', key: 'name', sortable: true },
  { title: 'DESCRIPTION', key: 'description', sortable: false },
  { title: 'STATUS', key: 'status', sortable: true },
  { title: 'ACTIONS', key: 'actions', sortable: false, align: 'end' as const }
]

const form = reactive({
  id: null as number | null,
  name: '',
  description: '',
  status: 'active'
})

const fetchDepartments = async () => {
  loading.value = true
  try {
    const res: any = await api.get('/departments')
    departments.value = res.data
  } catch (err) {
  } finally {
    loading.value = false
  }
}

const openDialog = (item?: any) => {
  if (item) {
    isEditing.value = true
    form.id = item.id
    form.name = item.name
    form.description = item.description || ''
    form.status = item.status || 'active'
  } else {
    isEditing.value = false
    form.id = null
    form.name = ''
    form.description = ''
    form.status = 'active'
  }
  dialog.value = true
}

const save = async () => {
  if (!form.name) {
    uiStore.error('Department name is required')
    return
  }
  saving.value = true
  try {
    if (isEditing.value && form.id) {
      await api.put(`/departments/${form.id}`, form)
      uiStore.success('Department updated successfully')
    } else {
      await api.post('/departments', form)
      uiStore.success('Department created successfully')
    }
    dialog.value = false
    fetchDepartments()
  } catch (err: any) {
    uiStore.error(err.data?.message || 'Failed to save department')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (item: any) => {
  if (confirm(`Are you sure you want to delete the department "${item.name}"?`)) {
    try {
      await api.delete(`/departments/${item.id}`)
      uiStore.success('Department deleted successfully')
      fetchDepartments()
    } catch (err: any) {
      uiStore.error(err.data?.message || 'Failed to delete department')
    }
  }
}

onMounted(() => {
  fetchDepartments()
})

definePageMeta({
  middleware: 'auth',
  permission: 'departments.view'
})
</script>

<style scoped>
.border-thin {
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}
.animate-fade {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
