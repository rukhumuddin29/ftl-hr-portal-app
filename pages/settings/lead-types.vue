<template>
  <div class="pa-4 pa-md-8 max-w-7xl mx-auto">
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-weight-black tracking-tight mb-2">Lead Types & Forms</h1>
        <p class="text-body-1 text-muted">Configure dynamic lead categories and build custom forms for each.</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" height="48" class="font-weight-bold px-6 rounded-lg" @click="openDialog()">
        NEW LEAD TYPE
      </v-btn>
    </div>

    <v-card class="rounded-xl border-thin bg-surface elevation-0">
      <v-table class="bg-transparent">
        <thead>
          <tr class="text-overline font-weight-black opacity-50">
            <th class="px-6 text-left">NAME</th>
            <th class="px-6 text-left">SLUG</th>
            <th class="px-6 text-left">FORM FIELDS</th>
            <th class="px-6 text-right">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="text-center">
            <td colspan="4" class="pa-8">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </td>
          </tr>
          <tr v-else-if="!leadTypes.length" class="text-center">
            <td colspan="4" class="pa-8 opacity-50 font-weight-bold">No Lead Types found. Create one above!</td>
          </tr>
          <tr v-else v-for="type in leadTypes" :key="type.id">
            <td class="px-6 py-4 font-weight-black text-subtitle-2 text-uppercase">{{ type.name }}</td>
            <td class="px-6 py-4 text-caption text-muted font-weight-bold">{{ type.slug }}</td>
            <td class="px-6 py-4">
              <v-chip size="small" color="primary" variant="tonal" class="font-weight-black">
                {{ type.form_schema ? type.form_schema.length : 0 }} FIELDS
              </v-chip>
            </td>
            <td class="px-6 py-4 text-right">
              <v-btn icon="mdi-pencil" variant="text" size="small" color="primary" @click="openDialog(type)"></v-btn>
              <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="confirmDelete(type)"></v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Dialog for Lead Type & Form Builder -->
    <v-dialog v-model="dialog" max-width="900" persistent>
      <v-card class="rounded-xl border-thin bg-surface">
        <v-toolbar color="transparent" class="px-4">
          <v-toolbar-title class="font-weight-black">{{ form.id ? 'Edit Lead Type' : 'New Lead Type' }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
        </v-toolbar>
        
        <v-divider class="border-opacity-10"></v-divider>

        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" md="4">
              <div class="text-subtitle-1 font-weight-black mb-4">Basic Info</div>
              <v-text-field
                v-model="form.name"
                label="Lead Type Name (e.g. Interior Design)"
                variant="outlined"
                class="mb-4 custom-input"
                hide-details="auto"
              ></v-text-field>
              <p class="text-caption text-muted">This defines the category name. The dynamic fields configured on the right will appear when this category is selected during lead creation.</p>
            </v-col>

            <v-col cols="12" md="8">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="text-subtitle-1 font-weight-black">Form Builder</div>
                <v-btn color="success" size="small" variant="tonal" prepend-icon="mdi-plus" class="font-weight-black" @click="addField">
                  ADD FIELD
                </v-btn>
              </div>

              <div v-if="!form.form_schema.length" class="pa-8 text-center border-thin rounded-lg bg-black-thin opacity-50">
                <v-icon size="32" class="mb-2">mdi-form-dropdown</v-icon>
                <div class="text-caption font-weight-bold">No custom fields added yet.</div>
              </div>

              <div v-else>
                <v-card v-for="(field, index) in form.form_schema" :key="index" elevation="0" class="mb-4 pa-4 rounded-lg border-thin bg-surface">
                  <v-row align="center">
                    <v-col cols="12" sm="5">
                      <v-text-field
                        v-model="field.label"
                        label="Field Label"
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="custom-input font-weight-bold"
                        @input="field.name = field.label.toLowerCase().replace(/[^a-z0-9]/g, '_')"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="4">
                      <v-select
                        v-model="field.type"
                        :items="fieldTypes"
                        label="Input Type"
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="custom-input font-weight-bold"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="3" class="d-flex align-center justify-end">
                      <v-checkbox v-model="field.required" hide-details density="compact" class="mr-2">
                        <template v-slot:label>
                          <span class="text-error font-weight-black text-h6">*</span>
                        </template>
                      </v-checkbox>
                      <v-btn icon="mdi-delete" color="error" variant="text" size="small" @click="removeField(index)"></v-btn>
                    </v-col>
                  </v-row>
                  
                  <!-- Options for Select Type -->
                  <v-row v-if="field.type === 'select'">
                    <v-col cols="12" class="pt-0 mt-2">
                      <v-combobox
                        v-model="field.options"
                        label="Dropdown Options (Type and press Enter)"
                        multiple
                        chips
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="custom-input"
                      ></v-combobox>
                    </v-col>
                  </v-row>
                </v-card>
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider class="border-opacity-10"></v-divider>
        
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" class="font-weight-black px-6" @click="closeDialog">CANCEL</v-btn>
          <v-btn color="primary" class="font-weight-black px-8 rounded-lg" :loading="saving" @click="save">SAVE CONFIGURATION</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script setup>
const api = useApi()
const loading = ref(true)
const saving = ref(false)
const leadTypes = ref([])

const dialog = ref(false)
const form = ref({ id: null, name: '', form_schema: [] })

const fieldTypes = [
  { title: 'Short Text', value: 'text' },
  { title: 'Long Text', value: 'textarea' },
  { title: 'Number', value: 'number' },
  { title: 'Dropdown', value: 'select' },
  { title: 'Date', value: 'date' },
]

const fetchLeadTypes = async () => {
  loading.value = true
  try {
    const res = await api.get('/lead-types')
    leadTypes.value = res.data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const openDialog = (type = null) => {
  if (type) {
    form.value = {
      id: type.id,
      name: type.name,
      form_schema: Array.isArray(type.form_schema) ? JSON.parse(JSON.stringify(type.form_schema)) : []
    }
  } else {
    form.value = { id: null, name: '', form_schema: [] }
  }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
}

const addField = () => {
  form.value.form_schema.push({
    name: '',
    label: '',
    type: 'text',
    required: false,
    options: []
  })
}

const removeField = (index) => {
  form.value.form_schema.splice(index, 1)
}

const save = async () => {
  if (!form.value.name) return useToast().error('Name is required')
  
  saving.value = true
  try {
    if (form.value.id) {
      await api.put(`/lead-types/${form.value.id}`, form.value)
      useToast().success('Lead Type updated successfully')
    } else {
      await api.post('/lead-types', form.value)
      useToast().success('Lead Type created successfully')
    }
    closeDialog()
    fetchLeadTypes()
  } catch (err) {
    console.error(err)
    useToast().error('Failed to save')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (type) => {
  if (confirm(`Are you sure you want to delete "${type.name}"?`)) {
    try {
      await api.delete(`/lead-types/${type.id}`)
      useToast().success('Deleted successfully')
      fetchLeadTypes()
    } catch (err) {
      console.error(err)
    }
  }
}

onMounted(() => {
  fetchLeadTypes()
})

definePageMeta({
  middleware: ['auth']
})
</script>

<style scoped>
.custom-input :deep(.v-field) {
  border-radius: 12px;
}
.bg-black-thin {
  background: rgba(var(--v-theme-on-surface), 0.05);
}
</style>
