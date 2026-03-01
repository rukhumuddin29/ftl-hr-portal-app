<template>
    <v-row class="animate-fade">
    <v-col cols="12" class="mb-4">
      <h1 class="text-h4 font-weight-black">SETTINGS & ADMINISTRATION</h1>
      <p class="text-body-2 text-muted">Configure system preferences, user access, and role permissions.</p>
    </v-col>

    <v-col cols="12">
      <v-card class="rounded-xl border-thin bg-surface elevation-0 overflow-hidden">
        <v-tabs
          v-model="activeTab"
          color="primary"
          align-tabs="start"
          class="border-b"
        >
          <v-tab v-if="authStore.isAdmin || authStore.hasPermission('users.view')" value="users" class="text-none font-weight-bold">USERS</v-tab>
          <v-tab v-if="authStore.isAdmin || authStore.hasPermission('roles.view')" value="roles" class="text-none font-weight-bold">ROLES</v-tab>
          <v-tab v-if="authStore.isAdmin || authStore.isSuperAdmin" value="permissions" class="text-none font-weight-bold">PERMISSIONS</v-tab>
          <v-tab value="security" class="text-none font-weight-bold">SECURITY</v-tab>
        </v-tabs>

        <v-window v-model="activeTab" class="pa-6">
          <!-- Users Tab -->
          <v-window-item value="users">
            <div class="d-flex justify-space-between align-center mb-6">
              <h2 class="text-h6 font-weight-bold uppercase">User Management</h2>
              <v-btn color="primary" prepend-icon="mdi-account-plus" @click="openAddUser">ADD USER</v-btn>
            </div>

            <v-table class="bg-transparent">
              <thead>
                <tr class="text-overline font-weight-black opacity-50">
                  <th class="px-6 text-left">Name & ID</th>
                  <th class="px-6 text-left">Email / Role</th>
                  <th class="px-6 text-left">Status</th>
                  <th class="px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id" class="hover-row">
                  <td class="px-6 py-4">
                    <div class="font-weight-black text-subtitle-2 text-uppercase">{{ user.name }}</div>
                    <div class="text-[10px] text-primary font-mono font-bold">{{ user.employee_id || 'N/A' }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-caption font-weight-bold uppercase">{{ user.email }}</div>
                    <div class="d-flex ga-1 mt-1">
                       <v-chip v-for="role in user.roles" :key="role.id" size="x-small" label color="indigo" class="font-weight-black">
                         {{ role.display_name.toUpperCase() }}
                       </v-chip>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <v-chip :color="user.status === 'active' ? 'success' : 'error'" size="x-small" label class="font-weight-black px-3">
                      {{ user.status.toUpperCase() }}
                    </v-chip>
                  </td>
                  <td class="px-6 py-4 text-right">
                     <v-btn icon="mdi-pencil-outline" variant="text" size="small" color="primary" @click="openEditUser(user)"></v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-window-item>

          <!-- Roles Tab -->
          <v-window-item value="roles">
            <div class="d-flex justify-space-between align-center mb-6">
              <h2 class="text-h6 font-weight-bold uppercase">Roles & Permissions</h2>
              <v-btn color="primary" prepend-icon="mdi-shield-plus" @click="showAddRoleManual = true">CREATE ROLE</v-btn>
            </div>
            
            <v-row>
              <v-col v-for="role in roles" :key="role.id" cols="12" md="4">
                <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6 h-100 hover-lift">
                  <div class="d-flex justify-space-between items-start mb-4">
                     <h3 class="text-subtitle-1 font-weight-black text-primary uppercase">{{ role.display_name }}</h3>
                     <v-icon v-if="role.name === 'super_admin'" size="16" color="primary">mdi-shield-check</v-icon>
                  </div>
                  <p class="text-body-2 text-muted mb-6" style="height: 48px; overflow: hidden;">{{ role.description }}</p>
                  <v-divider class="mb-4 border-opacity-25"></v-divider>
                  <div class="d-flex justify-space-between align-center">
                     <span class="text-[10px] font-weight-black text-muted uppercase">{{ role.permissions_count || 0 }} Permissions</span>
                     <v-btn variant="text" color="primary" density="compact" class="text-none font-weight-bold" @click="editPermissions(role)">EDIT ACCESS</v-btn>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>

          <!-- Permissions Tab -->
          <v-window-item value="permissions">
            <div class="d-flex justify-space-between align-center mb-6">
              <h2 class="text-h6 font-weight-bold uppercase">System Permissions</h2>
              <v-btn color="primary" prepend-icon="mdi-key-plus" @click="openAddPermission">CREATE PERMISSION</v-btn>
            </div>

            <v-table class="bg-transparent">
              <thead>
                <tr class="text-overline font-weight-black opacity-50">
                  <th class="px-6 text-left">Module</th>
                  <th class="px-6 text-left">Permission Name</th>
                  <th class="px-6 text-left">Display Name</th>
                  <th class="px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(perms, module) in allPermissions" :key="module">
                  <tr v-for="p in perms" :key="p.id" class="hover-row">
                    <td class="px-6 py-4">
                      <v-chip size="x-small" label class="font-weight-black">{{ String(module).toUpperCase() }}</v-chip>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-caption font-mono font-bold text-primary">{{ p.name }}</div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="font-weight-black text-subtitle-2 uppercase">{{ p.display_name }}</div>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <v-btn icon="mdi-pencil-outline" variant="text" size="small" color="primary" @click="editPermission(p)"></v-btn>
                      <v-btn icon="mdi-delete-outline" variant="text" size="small" color="error" @click="deletePermission(p.id)"></v-btn>
                    </td>
                  </tr>
                </template>
              </tbody>
            </v-table>
          </v-window-item>

          <!-- Security Tab -->
          <v-window-item value="security">
            <div class="mb-6">
              <h2 class="text-h6 font-weight-bold uppercase">Security & Password</h2>
              <p class="text-body-2 text-muted">Update your security settings and manage active sessions.</p>
            </div>

            <v-row>
              <v-col cols="12" md="6">
                <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6">
                  <h3 class="text-subtitle-2 font-weight-black mb-4 uppercase">Change Password</h3>
                  <v-text-field label="CURRENT PASSWORD" type="password" variant="outlined" density="compact"></v-text-field>
                  <v-text-field label="NEW PASSWORD" type="password" variant="outlined" density="compact"></v-text-field>
                  <v-text-field label="CONFIRM NEW PASSWORD" type="password" variant="outlined" density="compact"></v-text-field>
                  <v-btn color="primary" block>UPDATE PASSWORD</v-btn>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card class="rounded-xl border-thin bg-surface elevation-0 pa-6">
                  <h3 class="text-subtitle-2 font-weight-black mb-4 uppercase">Login Sessions</h3>
                  <v-list class="bg-transparent pa-0">
                    <v-list-item class="px-0">
                      <template v-slot:prepend>
                        <v-icon color="success">mdi-monitor</v-icon>
                      </template>
                      <v-list-item-title class="text-caption font-weight-black">CHROME ON WINDOWS</v-list-item-title>
                      <v-list-item-subtitle class="text-[10px] text-muted uppercase">CURRENT SESSION • 1.1.1.1</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                  <v-btn variant="tonal" color="error" block class="mt-4">LOGOUT ALL OTHER DEVICES</v-btn>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-card>
    </v-col>

    <!-- Dialogs -->
    <v-dialog v-model="showAddUserManual" max-width="500">
      <v-card class="rounded-xl pa-4">
        <v-card-title class="text-h6 font-weight-black uppercase">{{ isEditingUser ? 'EDIT USER' : 'ADD NEW USER' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="userForm.name" label="FULL NAME" variant="outlined"></v-text-field>
          <v-text-field v-model="userForm.email" label="EMAIL ADDRESS" variant="outlined"></v-text-field>
          
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field v-model="userForm.department" label="DEPARTMENT" variant="outlined"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="userForm.designation" label="DESIGNATION" variant="outlined"></v-text-field>
            </v-col>
          </v-row>

          <v-select v-model="userForm.role_id" label="SELECT ROLE" :items="roles" item-title="display_name" item-value="id" variant="outlined"></v-select>
          <v-select v-if="isEditingUser" v-model="userForm.status" label="STATUS" :items="['active', 'inactive', 'on_leave']" variant="outlined" class="text-uppercase"></v-select>
          
          <v-text-field v-model="userForm.password" label="PASSWORD" type="password" variant="outlined" :placeholder="isEditingUser ? 'Leave blank to keep current' : ''" :hint="isEditingUser ? 'Only enter if you wish to change' : ''" persistent-hint></v-text-field>
        </v-card-text>
        <v-card-actions class="ga-6 px-6 pb-6">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" rounded="lg" class="px-8 font-weight-bold" @click="showAddUserManual = false">CANCEL</v-btn>
          <v-btn color="primary" rounded="lg" class="px-8 font-weight-bold" :loading="savingUser" @click="saveUser">{{ isEditingUser ? 'UPDATE USER' : 'SAVE USER' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showAddRoleManual" max-width="500">
      <v-card class="rounded-xl pa-4">
        <v-card-title class="text-h6 font-weight-black">CREATE NEW ROLE</v-card-title>
        <v-card-text>
          <v-text-field v-model="roleForm.display_name" label="ROLE DISPLAY NAME" variant="outlined" placeholder="e.g. Sales Manager"></v-text-field>
          <v-textarea v-model="roleForm.description" label="DESCRIPTION" variant="outlined"></v-textarea>
        </v-card-text>
        <v-card-actions class="ga-6 px-6 pb-6">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" rounded="lg" class="px-8 font-weight-bold" @click="showAddRoleManual = false">CANCEL</v-btn>
          <v-btn color="primary" rounded="lg" class="px-8 font-weight-bold" :loading="savingRole" @click="saveNewRole">CREATE</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showAddPermissionManual" max-width="500">
      <v-card class="rounded-xl pa-4">
        <v-card-title class="text-h6 font-weight-black uppercase">{{ isEditingPermission ? 'EDIT PERMISSION' : 'CREATE NEW PERMISSION' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="permissionForm.module" label="MODULE" variant="outlined" placeholder="e.g. leads"></v-text-field>
          <v-text-field v-model="permissionForm.name" label="PERMISSION KEY" variant="outlined" placeholder="e.g. leads.delete"></v-text-field>
          <v-text-field v-model="permissionForm.display_name" label="DISPLAY NAME" variant="outlined" placeholder="e.g. Delete Leads"></v-text-field>
          <v-textarea v-model="permissionForm.description" label="DESCRIPTION" variant="outlined" rows="2"></v-textarea>
        </v-card-text>
        <v-card-actions class="ga-6 px-6 pb-6">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" rounded="lg" class="px-8 font-weight-bold" @click="showAddPermissionManual = false">CANCEL</v-btn>
          <v-btn color="primary" rounded="lg" class="px-8 font-weight-bold" :loading="savingPermission" @click="savePermission">SAVE</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Permissions Dialog -->
    <v-dialog v-model="showPermissionDialog" max-width="800">
      <v-card class="rounded-xl pa-4 bg-surface">
        <v-card-title class="text-h6 font-weight-black uppercase pb-0">
          Edit Permissions: <span class="text-primary">{{ selectedRole?.display_name }}</span>
        </v-card-title>
        <v-card-subtitle class="text-muted text-caption mb-4">Control exactly what this role can see and do.</v-card-subtitle>
        <v-divider class="mb-4"></v-divider>
        <v-card-text class="pa-0 overflow-auto" style="max-height: 60vh">
          <div v-for="(perms, module) in allPermissions" :key="module" class="mb-6 px-4">
            <h4 class="text-overline font-weight-black text-primary mb-2">{{ module }}</h4>
            <v-row dense>
              <v-col v-for="p in perms" :key="p.id" cols="12" sm="6" md="4">
                <v-checkbox
                  v-model="selectedRolePermissions"
                  :label="p.display_name || p.name"
                  :value="p.id"
                  color="primary"
                  density="compact"
                  hide-details
                ></v-checkbox>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
        <v-divider class="my-4"></v-divider>
        <v-card-actions class="ga-6 px-6 pb-6">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" rounded="lg" class="font-weight-bold px-8" @click="showPermissionDialog = false">CANCEL</v-btn>
          <v-btn color="primary" rounded="lg" class="font-weight-bold px-8" :loading="savingRole" @click="savePermissions">SAVE CHANGES</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup lang="ts">
const api = useApi()

const route = useRoute()
const authStore = useAuthStore()
const activeTab = ref(route.query.tab?.toString() || 'users')

// Adjust default tab if permissions missing
watchEffect(() => {
  if (activeTab.value === 'users' && !authStore.isAdmin && !authStore.hasPermission('users.view')) {
    activeTab.value = 'security'
  }
})
const showAddUserManual = ref(false)
const isEditingUser = ref(false)
const showAddRoleManual = ref(false)
const showPermissionDialog = ref(false)
const showAddPermissionManual = ref(false)
const isEditingPermission = ref(false)
const savingPermission = ref(false)

const users = ref<any[]>([])
const roles = ref<any[]>([])
const allPermissions = ref<any>({})
const selectedRole = ref<any>(null)
const selectedRolePermissions = ref<number[]>([])
const savingRole = ref(false)
const savingUser = ref(false)
const loading = ref(false)

const userForm = reactive({
  id: null as number | null,
  name: '',
  email: '',
  password: '',
  department: '',
  designation: '',
  status: 'active',
  role_id: null as number | null
})

const roleForm = reactive({
  name: '',
  display_name: '',
  description: ''
})

const permissionForm = reactive({
  id: null as number | null,
  name: '',
  display_name: '',
  module: '',
  description: ''
})

const fetchData = async () => {
  if (!authStore.isAdmin && !authStore.isSuperAdmin && !authStore.hasPermission('users.view')) {
    loading.value = false
    return
  }
  
  loading.value = true
  try {
    const requests = []
    if (authStore.isAdmin || authStore.hasPermission('users.view')) requests.push(api.get('/users'))
    if (authStore.isAdmin || authStore.hasPermission('roles.view')) requests.push(api.get('/roles'))
    if (authStore.isAdmin || authStore.isSuperAdmin) requests.push(api.get('/permissions'))
    
    const results: any[] = await Promise.all(requests)
    
    let idx = 0
    if (authStore.isAdmin || authStore.hasPermission('users.view')) users.value = results[idx++].data
    if (authStore.isAdmin || authStore.hasPermission('roles.view')) roles.value = results[idx++].data
    if (authStore.isAdmin || authStore.isSuperAdmin) allPermissions.value = results[idx++]
  } catch (err: any) {
    console.error('Failed to fetch settings data', err)
  } finally {
    loading.value = false
  }
}

const editPermissions = async (role: any) => {
  selectedRole.value = role
  try {
    const res: any = await api.get(`/roles/${role.id}`)
    selectedRolePermissions.value = res.permissions.map((p: any) => p.id)
    showPermissionDialog.value = true
  } catch (err) {}
}

const savePermissions = async () => {
  if (!selectedRole.value) return
  savingRole.value = true
  try {
    await api.put(`/roles/${selectedRole.value.id}`, {
      permissions: selectedRolePermissions.value
    })
    showPermissionDialog.value = false
    fetchData() // Refresh roles count
  } catch (err) {} finally {
    savingRole.value = false
  }
}

const openAddUser = () => {
  isEditingUser.value = false
  userForm.id = null
  userForm.name = ''
  userForm.email = ''
  userForm.password = ''
  userForm.department = ''
  userForm.designation = ''
  userForm.status = 'active'
  userForm.role_id = null
  showAddUserManual.value = true
}

const openEditUser = (user: any) => {
  isEditingUser.value = true
  userForm.id = user.id
  userForm.name = user.name
  userForm.email = user.email
  userForm.password = ''
  userForm.department = user.department || ''
  userForm.designation = user.designation || ''
  userForm.status = user.status || 'active'
  userForm.role_id = user.roles?.[0]?.id || null
  showAddUserManual.value = true
}

const saveUser = async () => {
  savingUser.value = true
  try {
    if (isEditingUser.value && userForm.id) {
       await api.put(`/users/${userForm.id}`, userForm)
    } else {
       await api.post('/users', userForm)
    }
    showAddUserManual.value = false
    fetchData()
  } catch (err) {} finally {
    savingUser.value = false
  }
}

const saveNewRole = async () => {
  savingRole.value = true
  try {
    // Generate name from display_name if empty
    if (!roleForm.name) {
      roleForm.name = roleForm.display_name.toLowerCase().replace(/\s+/g, '_')
    }
    await api.post('/roles', roleForm)
    showAddRoleManual.value = false
    fetchData()
  } catch (err) {} finally {
    savingRole.value = false
  }
}

const openAddPermission = () => {
  isEditingPermission.value = false
  permissionForm.id = null
  permissionForm.name = ''
  permissionForm.display_name = ''
  permissionForm.module = ''
  permissionForm.description = ''
  showAddPermissionManual.value = true
}

const editPermission = (p: any) => {
  isEditingPermission.value = true
  permissionForm.id = p.id
  permissionForm.name = p.name
  permissionForm.display_name = p.display_name
  permissionForm.module = p.module
  permissionForm.description = p.description
  showAddPermissionManual.value = true
}

const savePermission = async () => {
  savingPermission.value = true
  try {
    if (isEditingPermission.value && permissionForm.id) {
      await api.put(`/permissions/${permissionForm.id}`, permissionForm)
    } else {
      await api.post('/permissions', permissionForm)
    }
    showAddPermissionManual.value = false
    fetchData()
  } catch (err) {} finally {
    savingPermission.value = false
  }
}

const deletePermission = async (id: number) => {
  if (!confirm('Are you sure you want to delete this permission?')) return
  try {
     await api.delete(`/permissions/${id}`)
     fetchData()
  } catch (err) {}
}

onMounted(() => {
  fetchData()
})

definePageMeta({
  middleware: 'auth'
})
</script>

<style scoped>
.border-thin {
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}
.animate-fade {
  animation: fadeIn 0.6s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.hover-row:hover {
  background: rgba(var(--v-theme-primary), 0.02) !important;
}
.hover-lift {
  transition: transform 0.3s ease, border-color 0.3s ease !important;
}
.hover-lift:hover {
  transform: translateY(-4px);
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
}
</style>
