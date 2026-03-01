<template>
  <v-app-bar 
    flat 
    border
    color="surface" 
    height="64"
  >
    <template v-slot:prepend>
      <v-app-bar-nav-icon 
        variant="text" 
        @click="sidebarStore.toggle()"
      ></v-app-bar-nav-icon>
    </template>
    
    <v-app-bar-title 
      class="text-subtitle-1 font-weight-black uppercase tracking-widest"
    >
      {{ currentPageTitle }}
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <v-btn
      icon
      variant="text"
      @click="themeStore.toggle()"
      class="mr-2"
    >
      <v-icon>{{ themeStore.theme === 'dark' ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent' }}</v-icon>
    </v-btn>

    <!-- Notification Bell -->
    <v-menu
      v-if="authStore.isLoggedIn"
      v-model="showNotifications"
      :close-on-content-click="false"
      location="bottom end"
      min-width="380"
      max-width="420"
      transition="slide-y-transition"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          icon
          variant="text"
          class="mr-2"
          v-bind="props"
          @click="notificationStore.fetchNotifications()"
        >
          <v-badge
            :content="notificationStore.unreadCount"
            :model-value="notificationStore.unreadCount > 0"
            color="rose-accent-4"
            floating
          >
            <v-icon>{{ showNotifications ? 'mdi-bell' : 'mdi-bell-outline' }}</v-icon>
          </v-badge>
        </v-btn>
      </template>

      <v-card class="rounded-xl border-thin bg-surface elevation-24 overflow-hidden mt-2">
        <!-- Header -->
        <div class="pa-5 d-flex justify-space-between align-center border-b">
          <div>
            <h3 class="text-subtitle-1 font-weight-black uppercase tracking-wider">Notifications</h3>
            <p class="text-[10px] text-muted font-weight-bold uppercase opacity-50">
              You have {{ notificationStore.unreadCount }} unread messages
            </p>
          </div>
          <v-btn
            v-if="notificationStore.unreadCount > 0"
            size="x-small"
            variant="text"
            color="primary"
            class="font-weight-black tracking-widest"
            @click="notificationStore.markAllAsRead()"
          >
            MARK ALL READ
          </v-btn>
        </div>

        <!-- Notification List -->
        <v-list class="pa-0 bg-transparent overflow-y-auto" max-height="400" lines="three">
          <template v-if="notificationStore.loading && notificationStore.notifications.length === 0">
            <v-list-item v-for="i in 3" :key="i" class="border-b px-5 py-4">
               <v-skeleton-loader type="list-item-avatar-three-line" bg-color="transparent"></v-skeleton-loader>
            </v-list-item>
          </template>

          <v-list-item
            v-for="notif in notificationStore.notifications"
            :key="notif.id"
            :class="{ 'bg-primary-opacity': !notif.read_at }"
            class="border-b px-5 py-3 hover-row cursor-pointer"
            @click="handleNotifClick(notif)"
          >
            <template v-slot:prepend>
              <div class="mr-4">
                <v-avatar :color="notif.read_at ? 'grey-lighten-4' : (notif.color || 'primary')" size="40" class="rounded-lg">
                  <v-icon :icon="notif.icon || 'mdi-bell-outline'" :color="notif.read_at ? 'grey' : 'white'" size="20"></v-icon>
                </v-avatar>
              </div>
            </template>
            <v-list-item-title class="font-weight-black text-body-2 mb-1" :class="{ 'text-primary': !notif.read_at }">
              {{ notif.title }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption opacity-70 mb-2 line-height-1-4">
              {{ notif.message }}
            </v-list-item-subtitle>
            <div class="text-[10px] font-weight-black opacity-40 uppercase">
              {{ formatTimeAgo(notif.created_at) }}
            </div>
          </v-list-item>

          <v-list-item v-if="notificationStore.notifications.length === 0 && !notificationStore.loading">
            <div class="text-center py-12 px-6">
              <v-icon size="64" class="mb-4 opacity-10">mdi-bell-off-outline</v-icon>
              <p class="text-overline font-weight-black opacity-50">Quiet for now...</p>
              <p class="text-caption opacity-40">No notifications to display</p>
            </div>
          </v-list-item>
        </v-list>
        
        <div class="pa-3 text-center border-t bg-surface-variant bg-opacity-10 pointer-events-none">
           <span class="text-[10px] font-weight-black opacity-30 uppercase tracking-widest">End of Notifications</span>
        </div>
      </v-card>
    </v-menu>

    <v-menu v-if="authStore.user">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          variant="text"
          class="text-none"
        >
          <v-avatar size="32" color="primary" class="mr-2 rounded-lg font-weight-black text-white" style="font-size: 10px">
            {{ authStore.user?.name?.charAt(0) || '' }}
          </v-avatar>
          <div class="text-left d-none d-sm-block">
            <p class="text-caption font-weight-black mb-0 line-height-1">{{ authStore.user?.name || '' }}</p>
            <p class="text-[10px] opacity-50 uppercase font-weight-bold">{{ authStore.user?.roles?.[0]?.name?.replace('_', ' ') || '' }}</p>
          </div>
          <v-icon size="small" class="ml-1">mdi-chevron-down</v-icon>
        </v-btn>
      </template>
      <v-list density="compact" width="200" bg-color="surface" class="rounded-xl border-thin mt-2">
        <v-list-item prepend-icon="mdi-account-outline" title="Profile" value="profile" @click="navigateTo('/profile')"></v-list-item>
        <v-list-item prepend-icon="mdi-cog-outline" title="Settings" value="settings" @click="navigateTo('/settings?tab=security')"></v-list-item>
        <v-divider class="my-2 border-opacity-25"></v-divider>
        <v-list-item 
          prepend-icon="mdi-logout" 
          title="Logout" 
          value="logout" 
          color="error"
          @click="authStore.logout()"
        ></v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup lang="ts">
const sidebarStore = useSidebarStore()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const route = useRoute()

const showNotifications = ref(false)

const currentPageTitle = computed(() => {
  const name = route.name?.toString() || 'Dashboard'
  if (name === 'index') return 'DASHBOARD'
  return name.replace(/[-_]/g, ' ').toUpperCase()
})

const handleNotifClick = async (notif: any) => {
  if (!notif.read_at) {
    await notificationStore.markAsRead(notif.id)
  }
  if (notif.link) {
    navigateTo(notif.link)
    showNotifications.value = false
  }
}

const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

// Polling Logic
onMounted(() => {
  if (authStore.isLoggedIn) {
     notificationStore.startPolling()
  }
})

onUnmounted(() => {
  notificationStore.stopPolling()
})

watch(() => authStore.isLoggedIn, (isLoggedIn) => {
  if (isLoggedIn) {
    notificationStore.startPolling()
  } else {
    notificationStore.stopPolling()
  }
})
</script>

<style scoped>
:deep(.v-toolbar__content) {
  padding: 0 16px;
}
.bg-primary-opacity {
  background: rgba(var(--v-theme-primary), 0.05) !important;
}
.line-height-1-4 {
  line-height: 1.4 !important;
}
.hover-row:hover {
  background: rgba(var(--v-theme-primary), 0.02) !important;
}
</style>
