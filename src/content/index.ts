import { MESSAGES_TYPES } from './../@core/enums/message-type.enum'
import { highlightSelector } from './../@core/utils/html.util'
import { generateCsvFile } from './../@core/utils/csv.util'
import {
  startTargetsSelecting,
  stopTargetsSelecting,
  loadSavedTargets,
  resetTargets,
  targets,
} from './../@core/scraper/targetExtractor'
import {
  autoNavigate,
  loadSavedPagination,
  pagination,
  resetPagination,
  startPaginationSelecting,
  stopPaginationSelecting,
} from './../@core/scraper/paginationExtractor'
import { IExtensionMessage } from './../@core/interfaces/messages.interface'
import { extractDataFromTargets,   extractTableData,
} from '../@core/scraper/dataExtractor'
import { getData as getStroageData, removeData, setData } from './../@core/utils/storage.util'

/**
 * Methods to load Load saved targets from  storage
 * @returns - an array of strings representing the settings
 */
loadSavedTargets()
loadSavedPagination()

/**
 * Check if the scraping is active and continue scraping if it is
 */
getStroageData(window.location.origin + '-scraping').then((data) => {
  if (data === 'active') {
    autoNavigate(async () => {
      /**
       * Extract the data from the web page
       * and save it in the storage with the previous data
       * if there is any
       */
      const data = extractDataFromTargets(targets)
      const prevData = await getStroageData(window.location.origin + '-data')
      const newData = [...(prevData || []), ...data]
      await setData(window.location.origin + '-data', newData)
    })
  }
})

chrome.runtime.onMessage.addListener((message: IExtensionMessage, sender, sendResponse) => {
  switch (message.type) {
    /**
     * Check if the web page has a table
     */
    case MESSAGES_TYPES.SEARCH_FOR_TABLE:
      const table = document.querySelector('table')
      sendResponse(table ? 'TABLE_EXIST' : 'NOT_FOUND')
      break
    /**
     * Start selecting elements to scrape from the web page
     * and remove other listeners
     */
    case MESSAGES_TYPES.SELECT_ELEMENTS:
      stopPaginationSelecting()
      stopTargetsSelecting()
      startTargetsSelecting()
      if (targets !== null) targets.forEach((target) => highlightSelector(target.path))
      sendResponse('success')
      break
    /**
     * Start scraping the web page and set the scraping status to active
     * to continue scraping if the user navigates to another page
     */
    case MESSAGES_TYPES.START_SCRAPING:
      setData(window.location.origin + '-scraping', 'active')
      autoNavigate(async () => {
        const data = extractDataFromTargets(targets)
        const prevData = await getStroageData(window.location.origin + '-data')
        const newData = [...(prevData || []), ...data]
        await setData(window.location.origin + '-data', newData)
      })
      sendResponse('success')
      break
    /**
     * Get the table from the web page and extract the data from it
     * and download it as a csv file
     */
    case MESSAGES_TYPES.DOWNLOAD_TABLE_DATA:
      const el = document.querySelector('table') as HTMLTableElement
      const data = extractTableData(el)
      generateCsvFile(
        data,
        document.title + '(Table)' + ' - ' + new Date().toISOString().slice(0, 10),
      )
      sendResponse('success')
      break
    /**
     * Start selecting pagination element listeners and remove other listeners
     */
    case MESSAGES_TYPES.SELECT_PAGINATION:
      stopTargetsSelecting()
      stopPaginationSelecting()
      startPaginationSelecting()
      sendResponse('success')
      break
    /**
     * Download the scraped data as a csv file
     * If the user has saved data in the storage, download it
     * otherwise download the data from the current page
     * and remove the data from the storage
     */
    case MESSAGES_TYPES.DOWNLOAD_DATA:
      getStroageData(window.location.origin + '-data').then((data) => {
        if (data) {
          generateCsvFile(
            data,
            document.title + '(Scraper)' + ' - ' + new Date().toISOString().slice(0, 10),
          )
          removeData(window.location.origin + '-data')
          return
        }
        generateCsvFile(
          extractDataFromTargets(targets),
          document.title + '(Scraper)' + ' - ' + new Date().toISOString().slice(0, 10),
        )
      })
      stopTargetsSelecting()
      sendResponse('success')
      break
    /**
     * Reset the settings and remove the saved data from the storage
     * and reload the page
     */
    case MESSAGES_TYPES.RESET_SETTING:
      resetTargets()
      resetPagination()
      removeData(window.location.origin + '-scraping')
      removeData(window.location.origin + '-pagination')
      removeData(window.location.origin + '-targets')
      sendResponse('success')
      location.reload()
      break
    /**
     * check if the user has saved targets and pagination
     * for the current page and send the response to the popup
     */
    case MESSAGES_TYPES.HAS_SAVED_DATA:
      sendResponse({
        targets: targets.length > 0 ? true : false,
        pagination: pagination ? true : false,
      })
      break
    case MESSAGES_TYPES.IS_CONTENT_SCRIPT_ACTIVE:
      sendResponse('success')
      break;
    default:
      sendResponse('success')
      break
  }
})
