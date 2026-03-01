// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4
  },

  srcDir: '.',

  compatibilityDate: '2025-07-15',


  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@nuxt/icon',
    'vuetify-nuxt-module',
    'nuxt-tiptap-editor'
  ],

  vuetify: {
    moduleOptions: {
      /* module specific options */
    },
    vuetifyOptions: {
      theme: {
        defaultTheme: 'dark',
        themes: {
          dark: {
            colors: {
              primary: '#ef6125',
              secondary: '#011a1a',
              background: '#011a1a',
              surface: '#022a2a',
            }
          }
        }
      }
    }
  },


  css: [
    '~/assets/css/theme.css',
    '~/assets/css/base.css'
  ],

  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8000/api/v1'
    }
  },

  ssr: false,

  app: {
    pageTransition: false,
    layoutTransition: false,
    head: {
      title: 'Elements HR',
      meta: [
        { name: 'description', content: 'Comprehensive HR & CRM Management System' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap' }
      ]
    }
  }
})

