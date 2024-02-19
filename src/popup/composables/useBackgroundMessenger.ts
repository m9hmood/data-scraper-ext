import { MESSAGES_TYPES } from '../../@core/enums/message-type.enum'
import { onMounted } from 'vue'
import { STEPS } from '../../@core/enums/steps.enum'
import { useChrome } from '../../@core/composables/useChrome'
import { state } from '../sharedState'

/**
 * Composable for sending messages to background script
 * @returns {Object} - object with methods for sending messages to background script
 * @example
 * const { stopScrapingProcess } = useBackgroundMessenger()
 * stopScrapingProcess()
 */
export const useBackgroundMessenger = () => {
  const { sendMessageToBackground } = useChrome()

  /**
   * Method for checking if scraping is in process on current site
   * and if it is, it sets current step to scraping in process
   */
  const updatePopupStepDuringScraping = async () => {
    await sendMessageToBackground({
      type: MESSAGES_TYPES.IS_SCRAPING,
      payload: state.currentSiteOrigin,
    })
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === 'IS_SCRAPING' && request.payload === 'active') {
        state.currentStep = STEPS.SCRAPING_IN_PROCESS
      }
    })
  }
  /**
   * Method for sending message to background script to stop scraping
   * and sets current step to start scraping step
   */
  const stopScrapingProcess = async () => {
    state.isPopupWaitingForResponse = true
    try {
      await sendMessageToBackground({ type: 'STOP_SCRAPING', payload: state.currentSiteOrigin })
      state.currentStep = STEPS.START_SCRAPING
      state.isPopupWaitingForResponse = false
    } catch (error) {
      console.log('POPUP_ERROR(STOP_SCRAPING_METHOD):', error)
      state.isPopupWaitingForResponse = false
    }
  }

  return {
    stopScrapingProcess,
    updatePopupStepDuringScraping,
  }
}
