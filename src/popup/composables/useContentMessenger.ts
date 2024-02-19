import { MESSAGES_TYPES } from '../../@core/enums/message-type.enum'
import { onMounted } from 'vue'
import { useChrome } from '../../@core/composables/useChrome'
import { state } from '../sharedState'
import { STEPS } from '../../@core/enums/steps.enum'

/**
 * Composable that handles all the communication with the content script
 * @returns {Object} - Object with methods that can be used to communicate with the content script
 * @example
 * const {
 * selectElements,
 * reSelectElements,
 * enablePageNavigationSelection,
 * downloadScrapedData,
 * downloadTableData,
 * startScrapingProcess,
 * resetExtensionSettings,
 * } = useContentMessenger()
 *
 */
export const useContentMessenger = () => {
  const { sendMessageToCurrentTab } = useChrome()
  /**
   * Method that sends a message to the content script
   * to enable user to select the elements that will be scraped
   * and change the current step to the next step
   *
   */
  const selectElements = async () => {
    try {
      await sendMessageToCurrentTab({
        type: MESSAGES_TYPES.SELECT_ELEMENTS,
        payload: null,
      })
      state.currentStep = STEPS.SELECT_PAGINATION
      window.close()
    } catch (error) {
      console.log('POPUP_ERROR(SELECT_ELEMENTS_METHOD):', error)
    }
  }
  /**
   * Method that sends a message to the content script
   * to enable user to re-select the elements that will be scraped
   * without changing the current step
   * @note - This method is used when the user wants to re-select the elements only
   */
  const reSelectElements = async () => {
    try {
      await sendMessageToCurrentTab({ type: MESSAGES_TYPES.SELECT_ELEMENTS, payload: null })
      window.close()
    } catch (error) {
      console.log('POPUP_ERROR(RE_SELECT_ELEMENTS_METHOD):', error)
    }
  }
  /**
   * Method that sends a message to the content script
   * to enable user to select the pagination element
   * and change the current step to the next step
   * @note - this method will allow the user to scrape multiple pages by selecting the pagination element
   */
  const enablePageNavigationSelection = async () => {
    try {
      await sendMessageToCurrentTab({ type: MESSAGES_TYPES.SELECT_PAGINATION, payload: null })
      state.currentStep = STEPS.START_SCRAPING
      window.close()
    } catch (error) {
      console.log('POPUP_ERROR(SELECT_PAGINATION_METHOD):', error)
    }
  }
  /**
   * Method that sends a message to the content script
   * to download the scraped data as a csv file
   * @note - this method will only work if the user has scraped the data first
   * or selected target elements
   */
  const downloadScrapedData = async () => {
    state.isPopupWaitingForResponse = true
    try {
      await sendMessageToCurrentTab({ type: MESSAGES_TYPES.DOWNLOAD_DATA, payload: null })
      state.isPopupWaitingForResponse = false
    } catch {
      state.isPopupWaitingForResponse = false
    }
  }
  /**
   * Method that sends a message to the content script
   * to download table data as a csv file without any user interaction
   * @note - this method will only work if the website has a table
   */
  const downloadTableData = async () => {
    state.isPopupWaitingForResponse = true
    try {
      await sendMessageToCurrentTab({ type: MESSAGES_TYPES.DOWNLOAD_TABLE_DATA, payload: null })
    } catch {
      state.isPopupWaitingForResponse = false
    }
  }
  /**
   * Method that sends a message to the content script
   * to start scraping the data and change the current step to the next step
   * @note - this method should be used only if the user has selected pagination element
   */
  const startScrapingProcess = async () => {
    await sendMessageToCurrentTab({ type: MESSAGES_TYPES.START_SCRAPING, payload: null })
    state.currentStep = STEPS.SCRAPING_IN_PROCESS
  }
  /**
   * Method that sends a message to the content script
   * to reset the extension settings and change the current step to the first step
   */
  const resetExtensionSettings = async () => {
    state.currentStep = STEPS.SELECT_ELEMENTS
    await sendMessageToCurrentTab({ type: MESSAGES_TYPES.RESET_SETTING, payload: null })
  }
  /**
   * Method that sends a message to the content script
   * to check if the website has a table or not
   */
  const checkIfTableExist = async () => {
    const response = await sendMessageToCurrentTab({ type: 'SEARCH_FOR_TABLE', payload: null })
    if (response === 'TABLE_EXIST') state.isTablePresent = true
  }
  /**
   * Method to check if content.js file is loaded in active tab
   */
  const getContentScriptState = async () => {
    return await sendMessageToCurrentTab({
      type: MESSAGES_TYPES.IS_CONTENT_SCRIPT_LOADED,
      payload: null,
    })
  }
  /**
   * Method that sends a message to the content script
   * to check if the user has saved settings for the current tab
   * and change the current step accordingly
   * @note - this method should be called when the popup is opened
   */
  const loadSavedSettingsForCurrentTab = async () => {
    const response = await sendMessageToCurrentTab({ type: 'HAS_SAVED_DATA', payload: null })
    if (response.targets && response.pagination) {
      state.currentStep = STEPS.START_SCRAPING
    }
    if (response.targets && !response.pagination) {
      state.currentStep = STEPS.SELECT_PAGINATION
    }
  }

  onMounted(() => {
    checkIfTableExist()
    loadSavedSettingsForCurrentTab()
  })

  return {
    selectElements,
    reSelectElements,
    enablePageNavigationSelection,
    downloadScrapedData,
    downloadTableData,
    startScrapingProcess,
    resetExtensionSettings,
    getContentScriptState
  }
}
