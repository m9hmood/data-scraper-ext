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
  getContentScriptState
} = useContentMessenger()

const { getCurrentTab } = useChrome()
const { stopScrapingProcess } = useBackgroundMessenger()

const scriptIsActive = ref(false);

const setTabSettings = async () => {
  const tab = await getCurrentTab()
  state.STEP_STORAGE_KEY = `tab-${tab.id}-step`
  state.currentSiteOrigin = new URL(tab.url || '').origin
}

const checkIfContentScriptIsLoaded = async () => {
  const response = await getContentScriptState();
  if(response === 'success') scriptIsActive.value = true;
}

onMounted(() => {
  setTabSettings()
  checkIfContentScriptIsLoaded();
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
      <h3 class="header__title">Data Scraper</h3>
    </div>
    <div v-if="!scriptIsActive" class="alert">
      <p>Please, reload the current page to be able to use this extension.</p>
    </div>
    <div v-else class="main">
      <p class="main__content"></p>
      <button v-if="state.isTablePresent" class="btn btn-secondary" @click="downloadTableData">
        Download Table Data
      </button>
      <div class="main__buttons">
        <button
          v-if="state.currentStep === STEPS.SELECT_PAGINATION"
          class="btn btn-warning"
          @click="enablePageNavigationSelection"
        >
          Select Pagination
        </button>
        <button
          v-if="
            state.currentStep === STEPS.START_SCRAPING ||
            state.currentStep === STEPS.SELECT_PAGINATION
          "
          class="btn btn-primary"
          @click="reSelectElements"
        >
          Continue Picking
        </button>
        <button
          v-if="state.currentStep === STEPS.START_SCRAPING"
          class="btn btn-warning"
          @click="enablePageNavigationSelection"
        >
          Re-Select Pagination
        </button>
        <button
          v-if="state.currentStep === STEPS.SELECT_ELEMENTS"
          class="btn btn-primary"
          @click="selectElements"
        >
          Start Picking
        </button>
      </div>
      <div class="main__buttons">
        <button
          v-if="state.currentStep === STEPS.START_SCRAPING"
          class="btn btn-secondary"
          @click="startScrapingProcess"
        >
          Start Scraping
        </button>
        <button
          v-if="
            state.currentStep !== STEPS.SELECT_ELEMENTS &&
            state.currentStep !== STEPS.SCRAPING_IN_PROCESS
          "
          class="btn btn-success"
          @click="downloadScrapedData"
        >
          Download Data
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
        Reset
      </button>
      <button
        v-if="state.currentStep === STEPS.SCRAPING_IN_PROCESS"
        class="btn btn-danger"
        @click="stopScrapingProcess"
      >
        Stop Scraping
      </button>
    </div>
    <div class="footer">
      <span class="footer__copyright">
        Made with ❤️ by <a href="https://mahmoodshakir.com" target="_blank">Mahmood A.Shakir</a>
      </span>
      <span class="footer__version"> v 0.1.2 </span>
    </div>
  </div>
</template>

<style lang="scss" scoped src="./popup.scss" />
