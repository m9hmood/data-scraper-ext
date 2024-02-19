<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { state } from './sharedState'
import { useContentMessenger } from './composables/useContentMessenger'
import { useBackgroundMessenger } from './composables/useBackgroundMessenger'
import { useChrome } from '../@core/composables/useChrome'
import { STEPS } from '../@core/enums/steps.enum'

const {
  selectElements,
  reSelectElements,
  enablePageNavigationSelection,
  downloadScrapedData,
  downloadTableData,
  startScrapingProcess,
  resetExtensionSettings,
  getContentScriptState,
} = useContentMessenger()

const { getCurrentTab, getTranslation } = useChrome()
const { stopScrapingProcess, updatePopupStepDuringScraping } = useBackgroundMessenger()

const scriptIsActive = ref(false)

const setTabSettings = async () => {
  const tab = await getCurrentTab()
  state.STEP_STORAGE_KEY = `tab-${tab.id}-step`
  state.currentSiteOrigin = new URL(tab.url || '').origin
  updatePopupStepDuringScraping()
}

const checkIfContentScriptIsLoaded = async () => {
  const response = await getContentScriptState()
  if (response === 'success') scriptIsActive.value = true
}

onMounted(() => {
  setTabSettings()
  checkIfContentScriptIsLoaded()

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'SCRAPING_DONE') {
      state.currentStep = STEPS.SCRAPING_DONE
    }
  })
})
</script>

<template>
  <div :class="{ 'popup-wrapper': state.isPopupWaitingForResponse }">
    <div class="header">
      <h3 class="header__title">
        {{ getTranslation('extName') }}
      </h3>
    </div>
    <div v-if="!scriptIsActive" class="alert">
      <p>
        {{ getTranslation('contentScriptNotLoaded') }}
      </p>
    </div>
    <div v-else class="main">
      <p class="main__content"></p>
      <button v-if="state.isTablePresent" class="btn btn-secondary" @click="downloadTableData">
        {{ getTranslation('downloadTableData') }}
      </button>
      <div class="main__buttons">
        <button
          v-if="state.currentStep === STEPS.SELECT_PAGINATION"
          class="btn btn-warning"
          @click="enablePageNavigationSelection"
        >
          {{ getTranslation('selectPagination') }}
        </button>
        <button
          v-if="
            state.currentStep === STEPS.START_SCRAPING ||
            state.currentStep === STEPS.SELECT_PAGINATION
          "
          class="btn btn-primary"
          @click="reSelectElements"
        >
          {{ getTranslation('continuePicking') }}
        </button>
        <button
          v-if="state.currentStep === STEPS.START_SCRAPING"
          class="btn btn-warning"
          @click="enablePageNavigationSelection"
        >
          {{ getTranslation('reSelectPagination') }}
        </button>
        <button
          v-if="state.currentStep === STEPS.SELECT_ELEMENTS"
          class="btn btn-primary"
          @click="selectElements"
        >
          {{ getTranslation('startPicking') }}
        </button>
      </div>
      <div class="main__buttons">
        <button
          v-if="state.currentStep === STEPS.START_SCRAPING"
          class="btn btn-secondary"
          @click="startScrapingProcess"
        >
          {{ getTranslation('startScraping') }}
        </button>
        <button
          v-if="
            state.currentStep !== STEPS.SELECT_ELEMENTS &&
            state.currentStep !== STEPS.SCRAPING_IN_PROCESS
          "
          class="btn btn-success"
          @click="downloadScrapedData"
        >
          {{ getTranslation('downloadScrapedData') }}
        </button>
      </div>
      <button
        v-if="
          state.currentStep !== STEPS.SELECT_ELEMENTS &&
          state.currentStep !== STEPS.SCRAPING_IN_PROCESS
        "
        class="btn btn-danger"
        @click="resetExtensionSettings"
      >
        {{ getTranslation('resetSettings') }}
      </button>
      <button
        v-if="state.currentStep === STEPS.SCRAPING_IN_PROCESS"
        class="btn btn-danger"
        @click="stopScrapingProcess"
      >
        {{ getTranslation('stopScraping') }}
      </button>
    </div>
    <div class="footer">
      <span class="footer__copyright">
        {{ getTranslation('madeBy') }}
        <a href="https://mahmoodshakir.com" target="_blank">Mahmood A.Shakir</a>
      </span>
      <span class="footer__version"> v 0.1.2 </span>
    </div>
  </div>
</template>

<style lang="scss" scoped src="./popup.scss" />
