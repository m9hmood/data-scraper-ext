import { computed, reactive, ref } from 'vue'

import { defineStore } from 'pinia'

export const state = reactive({
  isTablePresent: false,
  isPopupWaitingForResponse: false,
  currentStep: 0,
  STEP_STORAGE_KEY: 'ACTIVE_STEP',
  CURRENT_SITE_ORIGIN: '',
})

export const useExtensionState = defineStore('counter', () => {
  const STEP_STORAGE_KEY = ref<string>('ACTIVE_STEP')
  const CURRENT_SITE_ORIGIN = ref<string>('activeStep')
  const isPopupWaitingForResponse = ref<boolean>(false)
  const isTablePresent = ref<boolean>(false)
  const currentStep = ref<number>(0)

  return {
    STEP_STORAGE_KEY,
    CURRENT_SITE_ORIGIN,
    isPopupWaitingForResponse,
    isTablePresent,
    currentStep,
  }
})
