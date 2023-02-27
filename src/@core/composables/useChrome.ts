import { IExtensionMessage } from './../interfaces/messages.interface'

/**
 * Composable to use Chrome API in Vue components and JavaScript files
 */
export const useChrome = () => {
  /**
   * method that returns a tab by its id
   * @param tabId - the id of the tab
   * @returns - the tab object
   */
  const getTab = async (tabId: number): Promise<chrome.tabs.Tab> => {
    const tab = await chrome.tabs.get(tabId)
    if (chrome.runtime.lastError) {
      throw chrome.runtime.lastError
    }
    return tab
  }
  /**
   * method that returns the current tab
   * @returns - the current tab object
   */
  const getCurrentTab = async (): Promise<chrome.tabs.Tab> => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (chrome.runtime.lastError) {
      throw chrome.runtime.lastError
    }
    return tab
  }
  /**
   * method that sends a message to a tab by its id
   * @param tabId - the id of the tab
   * @param message - the message to send
   * @returns - the response from the tab
   * @throws - an error if the tab is not found
   */
  const sendMessage = async (tabId: any, message: IExtensionMessage) => {
    const tab = await getTab(tabId)
    if (!tab) {
      throw new Error('Tab not found')
    }
    const response = await chrome.tabs.sendMessage(tabId, message)
    if (chrome.runtime.lastError) {
      throw chrome.runtime.lastError
    }
    return response
  }
  /**
   * method that sends a message to the current tab
   * @param message - the message to send
   * @returns - the response from the tab
   * @throws - an error if the tab is not found
   */
  const sendMessageToCurrentTab = async (message: IExtensionMessage) => {
    const tab = await getCurrentTab()
    return await sendMessage(tab.id, message)
  }
  /**
   * method that sends a message to the background script
   * @param message - the message to send
   * @returns - the response from the background script
   * @throws - an error if the background script is not found
   * @throws - an error if the background script is not found
   */
  const sendMessageToBackground = async (message: IExtensionMessage) => {
    const response = await chrome.runtime.sendMessage(message)
    if (chrome.runtime.lastError) {
      throw chrome.runtime.lastError
    }
    return response
  }

  return {
    getTab,
    getCurrentTab,
    sendMessage,
    sendMessageToCurrentTab,
    sendMessageToBackground,
  }
}
