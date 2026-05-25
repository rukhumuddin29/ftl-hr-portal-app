<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold uppercase">WhatsApp Templates</h1>
        <p class="text-caption text-muted">Manage the dynamic messaging templates</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" class="rounded-lg text-none px-6 font-weight-medium" @click="openDialog()">
        Add Template
      </v-btn>
    </div>

    <!-- Alert for Placeholders -->
    <v-alert type="info" variant="tonal" class="mb-6 rounded-lg text-body-2" icon="mdi-information">
      <strong>Available Placeholders:</strong> You can use <code>{name}</code> for the Lead's Name, <code>{category}</code> for the Lead Category, and <code>{bde}</code> for your Name.
    </v-alert>

    <v-card class="border-thin bg-surface rounded-xl elevation-0">
      <v-data-table
        :headers="headers"
        :items="templates"
        :loading="loading"
        class="bg-transparent"
        hide-default-footer
        :items-per-page="-1"
      >
        <template v-slot:item.lead_type="{ item }">
          <v-chip size="small" variant="tonal" :color="item.lead_type_id ? 'primary' : 'grey'">
            {{ item.lead_type ? item.lead_type.name : 'Global' }}
          </v-chip>
        </template>

        <template v-slot:item.is_active="{ item }">
          <v-chip :color="item.is_active ? 'success' : 'error'" size="small" class="font-weight-medium" variant="flat">
            {{ item.is_active ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>
        
        <template v-slot:item.body="{ item }">
          <div class="text-truncate" style="max-width: 400px;">
            {{ item.body }}
          </div>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex ga-2">
            <v-btn icon="mdi-pencil" size="small" variant="text" color="info" @click="openDialog(item)"></v-btn>
            <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="confirmDelete(item)"></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card class="rounded-xl pa-2">
        <v-card-title class="d-flex align-center pa-4 pb-0">
          <span class="text-h6 font-weight-bold">{{ editingId ? 'Edit' : 'Add' }} Template</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" size="small" @click="dialog = false"></v-btn>
        </v-card-title>

        <v-card-text class="pt-4">
          <v-select
            v-model="form.lead_type_id"
            :items="leadTypes"
            item-title="name"
            item-value="id"
            label="Lead Category (Leave blank for Global)"
            variant="outlined"
            density="comfortable"
            class="mb-4"
            clearable
          ></v-select>

          <v-text-field
            v-model="form.name"
            label="Template Name"
            variant="outlined"
            density="comfortable"
            class="mb-4"
          ></v-text-field>

          <v-textarea
            v-model="form.body"
            label="Template Body"
            variant="outlined"
            density="comfortable"
            rows="5"
            class="mb-4"
          ></v-textarea>

          <v-switch
            v-model="form.is_active"
            label="Active Status"
            color="success"
            hide-details
            inset
          ></v-switch>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" class="font-weight-medium" @click="dialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="rounded-lg font-weight-medium px-6"
            @click="save"
            :loading="saving"
          >Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
const api = useApi()
const uiStore = useUiStore()

const templates = ref<any[]>([])
const leadTypes = ref<any[]>([])
const loading = ref(true)

const dialog = ref(false)
const saving = ref(false)
const editingId = ref<number | null>(null)

const form = reactive({
  lead_type_id: null as number | null,
  name: '',
  body: '',
  is_active: true,
})

const headers = [
  { title: 'Template Name', key: 'name', sortable: true },
  { title: 'Category', key: 'lead_type', sortable: true },
  { title: 'Preview', key: 'body', sortable: false },
  { title: 'Status', key: 'is_active', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const },
]

const fetchTemplates = async () => {
  loading.value = true
  try {
    const res: any = await api.get('/leads/whatsapp-templates')
    templates.value = res.data
  } catch (e: any) {
    uiStore.error('Failed to fetch templates')
  } finally {
    loading.value = false
  }
}

const fetchLeadTypes = async () => {
  try {
    const res: any = await api.get('/leads/lead-types')
    leadTypes.value = res.data
  } catch (e) {
    console.error('Failed to fetch lead types')
  }
}

onMounted(() => {
  fetchTemplates()
  fetchLeadTypes()
})

const openDialog = (item?: any) => {
  if (item) {
    editingId.value = item.id
    form.lead_type_id = item.lead_type_id
    form.name = item.name
    form.body = item.body
    form.is_active = item.is_active
  } else {
    editingId.value = null
    form.lead_type_id = null
    form.name = ''
    form.body = ''
    form.is_active = true
  }
  dialog.value = true
}

const save = async () => {
  if (!form.name || !form.body) {
    uiStore.error('Name and Body are required')
    return
  }

  saving.value = true
  try {
    if (editingId.value) {
      await api.put(`/leads/whatsapp-templates/${editingId.value}`, form)
      uiStore.success('Template updated successfully')
    } else {
      await api.post('/leads/whatsapp-templates', form)
      uiStore.success('Template added successfully')
    }
    dialog.value = false
    fetchTemplates()
  } catch (e: any) {
    uiStore.error(e.data?.message || 'Operation failed')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (item: any) => {
  if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
    try {
      await api.delete(`/leads/whatsapp-templates/${item.id}`)
      uiStore.success('Template deleted')
      fetchTemplates()
    } catch {
      uiStore.error('Failed to delete')
    }
  }
}
</script>
