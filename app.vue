<template>
  <v-app :theme="themeStore.theme">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- Global Notifications -->
    <v-snackbar
      v-model="uiStore.snackbar.show"
      :color="uiStore.snackbar.color"
      :timeout="uiStore.snackbar.timeout"
      location="top right"
      variant="elevated"
      class="mt-4 mr-4"
    >
      <div class="d-flex align-center gap-2">
        <v-icon v-if="uiStore.snackbar.color === 'success'">mdi-check-circle</v-icon>
        <v-icon v-else-if="uiStore.snackbar.color === 'error'">mdi-alert-circle</v-icon>
        <v-icon v-else>mdi-information</v-icon>
        <span class="font-weight-bold uppercase text-caption">{{ uiStore.snackbar.text }}</span>
      </div>
      <template v-slot:actions>
        <v-btn icon="mdi-close" variant="text" size="small" @click="uiStore.snackbar.show = false"></v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
const themeStore = useThemeStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

// Ensure we don't have hydration mismatches by only initing on client
onMounted(() => {
  themeStore.init()
  authStore.init()
})
</script>

<style>
/* Global scrollbar and base fixes */
html {
  overflow-y: auto !important;
}
</style>
