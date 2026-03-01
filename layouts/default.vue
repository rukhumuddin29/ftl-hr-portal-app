<template>
  <template v-if="true">
    <LayoutAppSidebar />
    <LayoutAppHeader />
    
    <v-main class="main-container">
      <v-container fluid class="pa-6">
        <slot />
      </v-container>
    </v-main>
  </template>
</template>

<script setup lang="ts">
// Initialization is handled in app.vue
</script>

<style scoped>
.main-container {
  background-color: var(--bg-base) !important;
  min-height: 100vh;
}
</style>
