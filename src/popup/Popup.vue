<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { state } from './sharedState'
import { useContentMessanger } from './composables/useContentMessanger'
import { useBackgroundMessanger } from './composables/useBackgroundMessanger'
import { useChrome } from '../@core/composables/useChrome'
import { STEPS } from '../@core/enums/steps.enum'

const {
  selectElements,
  reSelectElements,
  selectPageNavigation,
  downloadScrapedData,
  downloadTableData,
  beginScraping,
  resetExtensionSettings,
  isContentScriptActive
} = useContentMessanger()

const { getCurrentTab } = useChrome()
const { stopScrapingProccess } = useBackgroundMessanger()

const scriptIsActive = ref(false);

const setTabSettings = async () => {
  const tab = await getCurrentTab()
  state.STEP_STORAGE_KEY = `tab-${tab.id}-step`
  state.CURRENT_SITE_ORIGIN = new URL(tab.url || '').origin
}

const checkIfContentScriptIsLoaded = async () => {
  const response = await isContentScriptActive();
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
          @click="selectPageNavigation"
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
          @click="selectPageNavigation"
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
          @click="beginScraping"
        >
          Start Scraping
        </button>
        <button
          v-if="
            state.currentStep !== STEPS.SELECT_ELEMENTS &&
            state.currentStep !== STEPS.SCRAPING_IN_PROCCESS
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
          state.currentStep !== STEPS.SCRAPING_IN_PROCCESS
        "
        class="btn btn-danger"
        @click="resetExtensionSettings"
      >
        Reset
      </button>
      <button
        v-if="state.currentStep === STEPS.SCRAPING_IN_PROCCESS"
        class="btn btn-danger"
        @click="stopScrapingProccess"
      >
        Stop Scraping
      </button>
    </div>
    <div class="footer">
      <span class="footer__copyright">
        Made with ❤️ by <a href="https://mahmoodshakir.com" target="_blank">Mahmood A.Shakir</a>
      </span>
      <span class="footer__version"> v 0.1.0 </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.popup-wrapper {
  animation: pulse 1.4s infinite;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0 0 0;

  &__title {
    --bg-size: 300%;
    --color-one: #b53471;
    --color-two: #ed4c67;
    font-size: 2rem;
    margin: 0;
    background: linear-gradient(90deg, var(--color-one), var(--color-two), var(--color-one)) 0 0 /
      var(--bg-size) 100%;
    color: transparent;
    background-clip: text;
    -webkit-background-clip: text;
    animation: move-bg 8s infinite linear;
    height: 40px;
    margin-bottom: 5px;
  }
}

.alert {
  margin: 0 30px;
  background: rgba(#EE5A24, 0.3);
  border-radius: 5px;
  font-size: 14px;
  color: #fff;
  padding: 0px 5px;
}

.main {
  padding: 0 30px;

  &__content {
    font-size: 0.9rem;
    color: #999999;
    margin: 0.5rem;
  }

  &__buttons {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
  }
}

.footer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 0.8rem;

  &__copyright {
    color: #ffffff;

    a {
      text-decoration: none;
      color: #ed4c67;
      font-weight: bold;
      transition: all 0.2s ease-in-out;

      &:hover {
        color: #ea2027;
      }
    }
  }

  &__version {
    margin-bottom: 10px;
  }
}

.btn {
  width: 100%;
  padding: 10px;
  font-weight: bold;
  text-transform: uppercase;
  border: none;
  border-radius: 5px;
  margin: 5px 0;
  transition: all 0.3s ease-in-out;

  &-primary {
    background: linear-gradient(90deg, #b53471, #ed4c67, #b53471) 0 0 / 400%;

    &:hover {
      cursor: pointer;
      background: linear-gradient(90deg, #b53471, #ed4c67, #b53471) 0 0 / 150%;
    }
  }

  &-secondary {
    background: linear-gradient(90deg, #5758bb, #9980fa, #5758bb) 0 0 / 400%;

    &:hover {
      cursor: pointer;
      background: linear-gradient(90deg, #5758bb, #9980fa, #5758bb) 0 0 / 150%;
    }
  }

  &-success {
    background: linear-gradient(90deg, #009432, #86ac1f, #009432) 0 0 / 400%;

    &:hover {
      cursor: pointer;
      background: linear-gradient(90deg, #009432, #86ac1f, #009432) 0 0 / 150%;
    }
  }

  &-warning {
    background: linear-gradient(90deg, #ee5a24, #f79f1f, #ee5a24) 0 0 / 400%;

    &:hover {
      cursor: pointer;
      background: linear-gradient(90deg, #ee5a24, #f79f1f, #ee5a24) 0 0 / 150%;
    }
  }

  &-danger {
    background: linear-gradient(90deg, #b71540, #eb2f06, #b71540) 0 0 / 400%;

    &:hover {
      cursor: pointer;
      background: linear-gradient(90deg, #b71540, #eb2f06, #b71540) 0 0 / 150%;
    }
  }
}

@media (prefers-reduced-motion: no-preference) {
  @keyframes move-bg {
    to {
      background-position: var(--bg-size) 0;
    }
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }

    50% {
      opacity: 0.7;
    }

    100% {
      opacity: 1;
    }
  }
}
</style>
