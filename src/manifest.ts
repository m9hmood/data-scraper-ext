import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  name: 'Data Scraper',
  description:
    'extracts content from web pages, with the ability to navigate through multiple pages using pagination.',
  version: '0.1.2',
  manifest_version: 3,
  default_locale: 'en',
  icons: {
    16: 'img/logo-16.png',
    32: 'img/logo-34.png',
    48: 'img/logo-48.png',
    128: 'img/logo-128.png',
  },
  action: {
    default_popup: 'popup.html',
    default_icon: 'img/logo-48.png',
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['https://*/*'],
      js: ['src/content/index.ts'],
      css: ['custom.css'],
    },
  ],
  web_accessible_resources: [
    {
      resources: ['img/logo-16.png', 'img/logo-34.png', 'img/logo-48.png', 'img/logo-128.png'],
      matches: [],
    },
  ],
  permissions: ['activeTab', 'tabs', 'storage', 'unlimitedStorage'],
})
