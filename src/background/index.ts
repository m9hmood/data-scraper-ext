import { MESSAGES_TYPES } from './../@core/enums/message-type.enum'
import { IExtensionMessage } from './../@core/interfaces/messages.interface'
import { retrieveData, removeData } from './../@core/utils/storage.util'

/**
 * Listen for messages from the popup to background script
 * Or from the content script to background script
 */
chrome.runtime.onMessage.addListener((message: IExtensionMessage, sender, sendResponse) => {
  switch (message.type) {
    /**
     * Check if the user is scraping, if so, send the status to the popup
     * This is used to show the user that the scraping is active
     */
    case MESSAGES_TYPES.IS_SCRAPING:
      retrieveData(message.payload + '-scraping').then(
        (data: 'active' | 'inactive' | undefined) => {
          chrome.runtime.sendMessage({ type: 'IS_SCRAPING', payload: data || 'inactive' })
        },
      )
      break
    /**
     * Remove the scraping status from the storage
     * This is used when the user stops the scraping
     */
    case MESSAGES_TYPES.STOP_SCRAPING:
      removeData(message.payload + '-scraping')
      sendResponse('success')
      break
    default:
      sendResponse('success')
      break
  }
})
