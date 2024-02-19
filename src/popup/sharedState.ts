import { reactive } from 'vue'

export const state = reactive({
  isTablePresent: false,
  isPopupWaitingForResponse: false,
  currentStep: 0,
  STEP_STORAGE_KEY: 'ACTIVE_STEP',
  currentSiteOrigin: '',
})
