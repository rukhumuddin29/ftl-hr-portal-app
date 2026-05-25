<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="sidebarStore.isCollapsed"
    permanent
    elevation="0"
    class="sidebar-nav"
    color="secondary"
    theme="dark"
  >
    <div class="pa-4 d-flex align-center justify-center" style="min-height: 72px;">
      <img
        src="/images/logo/ftl-white-logo.webp"
        alt="FTL Logo"
        style="width: 100%; object-fit: contain; transition: max-width 0.3s ease;"
        :style="{ maxWidth: sidebarStore.isCollapsed ? '40px' : '140px' }"
      />
    </div>

    <v-divider class="border-opacity-25"></v-divider>

    <v-list density="compact" nav>
      <template v-for="section in menuItems" :key="section.label">
        <v-list-subheader v-if="!sidebarStore.isCollapsed && section.items.length > 0" class="text-overline font-weight-bold opacity-50 px-4 mt-4">
          {{ section.label }}
        </v-list-subheader>
        
        <v-list-item
          v-for="item in section.items"
          :key="item.to"
          :to="item.to"
          :value="item.to"
          color="primary"
          class="rounded-lg mb-1"
        >
          <template v-slot:prepend>
            <v-icon :icon="item.mdi"></v-icon>
          </template>
          <v-list-item-title class="font-weight-bold text-white uppercase">{{ item.title }}</v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
const sidebarStore = useSidebarStore()
const authStore = useAuthStore()
const companyStore = useCompanyStore()
const drawer = ref(true)

onMounted(() => {
  companyStore.fetchCompany()
})

const hasPermission = (permission: string) => {
  return authStore.isAdmin || authStore.hasPermission(permission)
}

const menuItems = computed(() => {
  const sections: any[] = []

  // Core Section
  const coreItems = [
    { title: 'Dashboard', to: '/', mdi: 'mdi-view-dashboard-outline' },
  ]

  if (hasPermission('leads.view')) {
    coreItems.push({ title: 'Leads', to: '/leads', mdi: 'mdi-account-group-outline' })
  }

  coreItems.push({ title: 'My Leaves', to: '/leaves', mdi: 'mdi-calendar-check-outline' })



  sections.push({ label: 'Core', items: coreItems })

  // Operations Section removed

  // Management Section
  const manageItems = []
  if (hasPermission('expenses.view')) {
    manageItems.push({ title: 'Expenses', to: '/expenses', mdi: 'mdi-receipt-outline' })
  }
  if (hasPermission('departments.view') || authStore.isAdmin) {
    manageItems.push({ title: 'Departments', to: '/departments', mdi: 'mdi-domain' })
  }
  if (hasPermission('users.view') || hasPermission('roles.view')) {
    manageItems.push({ title: 'Users & Roles', to: '/settings', mdi: 'mdi-cog-outline' })
  }
  if (authStore.isSuperAdmin) {
    manageItems.push({ title: 'Company Info', to: '/settings/company', mdi: 'mdi-office-building-cog-outline' })
  }
  if (authStore.isAdmin && hasPermission('leads.view')) {
    manageItems.push({ title: 'Duplicate Leads', to: '/leads/duplicates', mdi: 'mdi-account-multiple-remove' })
    manageItems.push({ title: 'Lead Types', to: '/settings/lead-types', mdi: 'mdi-form-select' })
    manageItems.push({ title: 'WhatsApp Templates', to: '/settings/whatsapp-templates', mdi: 'mdi-whatsapp' })
  }
  if (hasPermission('leaves.approve')) {
    manageItems.push({ title: 'Leave Approvals', to: '/leaves/approvals', mdi: 'mdi-calendar-clock-outline' })
  }

  if (manageItems.length > 0) {
    sections.push({ label: 'Management', items: manageItems })
  }

  // Payroll Section
  const payrollItems = []
  if (hasPermission('payroll.view') || hasPermission('payroll.generate') || hasPermission('payroll.approve')) {
    payrollItems.push({ title: 'Payroll', to: '/payroll', mdi: 'mdi-cash-multiple' })
  }
  if (hasPermission('attendance.view') || hasPermission('attendance.mark')) {
    payrollItems.push({ title: 'Attendance', to: '/payroll/attendance', mdi: 'mdi-calendar-check-outline' })
  }
  if (hasPermission('payroll.manage')) {
    payrollItems.push({ title: 'Salary Structures', to: '/payroll/salary-structures', mdi: 'mdi-account-cash-outline' })
    payrollItems.push({ title: 'Workday Setup', to: '/payroll/workday-setup', mdi: 'mdi-calendar-clock-outline' })
  }

  if (payrollItems.length > 0) {
    sections.push({ label: 'Payroll', items: payrollItems })
  }

  // Reports Section
  const reportItems = []
  if (hasPermission('reports.view')) {
    reportItems.push({ title: 'BDE Scorecard', to: '/reports/bde-scorecard', mdi: 'mdi-trophy-outline' })
    reportItems.push({ title: 'Activity Log', to: '/activity-log', mdi: 'mdi-history' })
  }
  if (reportItems.length > 0) {
    sections.push({ label: 'Reports', items: reportItems })
  }

  return sections
})
</script>

<style scoped>
.sidebar-nav {
  border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
}

:deep(.v-list-item__prepend > .v-icon) {
  opacity: 1;
}

:deep(.v-list-item--active) {
  background: rgba(var(--v-theme-primary), 0.1) !important;
}
</style>
