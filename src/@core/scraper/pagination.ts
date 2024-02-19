import { storeData, retrieveData } from '../utils/storage.util'
import {
  isClickInsideModal,
  getElementPath,
  startHighlightElementOnMouseHover,
  stopHighlightElementOnMouseHover,
} from '../utils/html.util'
import alert from 'sweetalert2'

export let pagination: any = null
export let lastPage: string = ''

/**
 * method to sleep for a given time in milliseconds
 * @param ms - the time to sleep in milliseconds
 * @returns - a promise that resolves after the given time
 * @private
 */
const _sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Method to reset the pagination
 * @returns - void
 */
export const resetPagination = () => {
  pagination = null
  _updatePaginationValueInStorage()
}

/**
 * Method to update the pagination in the storage
 */
const _updatePaginationValueInStorage = async () => {
  await storeData(window.location.origin + '-pagination', { pagination, lastPage })
}

/**
 * Method to load the saved pagination from the storage and set it to the pagination variable and lastPage variable
 * @returns - void
 */
export const loadSavedPagination = async () => {
  const data = await retrieveData(window.location.origin + '-pagination')
  if (data) {
    pagination = data.pagination
    lastPage = data.lastPage
    console.log('Saved Last page: ', lastPage)
  }
}
/**
 * Method to extract the pagination list from the given element
 * and set it to the pagination variable
 * @param el - the element to extract the pagination list from
 * @returns - void
 * @example
 * <ul class="pagination">
 * <li><a href="/page/2">2</a></li>
 * <li><a href="/page/3">3</a></li>
 * </ul>
 * extractPaginationList(document.querySelector('.pagination'))
 * => [{ href: '/page/2', textContent: '2' }, { href: '/page/3', textContent: '3' }]
 */
export const extractPaginationList = (el: HTMLElement) => {
  const links = Array.from(el.querySelectorAll('li'))
  const pagination = links.map((link) => {
    const href = link.querySelector('a')?.getAttribute('href') || null
    const textContent = link.textContent || null
    return { href, textContent }
  })
  return reformatPaginationList(pagination)
}

/**
 * Method to extract the pagination links from the given element
 * and set it to the pagination variable
 * @param el - the element to extract the pagination links from
 * @returns - void
 * @example
 * <div class="pagination">
 * <a href="/page/2">2</a>
 * <a href="/page/3">3</a>
 * </div>
 * extractPaginationLinks(document.querySelector('.pagination'))
 * => [{ href: '/page/2', textContent: '2' }, { href: '/page/3', textContent: '3' }]
 */
const extractPaginationLinks = (el: HTMLElement) => {
  const links = Array.from(el.querySelectorAll('a'))
  const pagination = links.map((link) => {
    const href = link.getAttribute('href') || null
    const textContent = link.textContent || null
    return { href, textContent }
  })
  return reformatPaginationList(pagination)
}
/**
 * Method to reformat the pagination list to remove the non numeric values
 * @param list - the pagination list to reformate
 * @returns - the reformated pagination list
 * @example
 * reformatPaginationList([
 * { href: '/page/2', textContent: '2' },
 * { href: '/page/3', textContent: '3' },
 * { href: '/page/4', textContent: 'Next' }
 * ])
 * => [{ href: '/page/2', textContent: '2' }, { href: '/page/3', textContent: '3' }]
 */
const reformatPaginationList = (list: any[]) => {
  return list.filter((item) => item.textContent && /^\d+$/.test(item.textContent))
}
/**
 * Method to get the pagination list from the given element or its parent
 * or its parent's parent or null if not found
 * @param el - the element to get the pagination list from
 * @returns - the pagination list or null
 */
const getPaginationListFromTarget = (el: HTMLElement) => {
  return el.querySelector('ul') || el.querySelector('ol') || el.closest('ul') || null
}
/**
 * Method to get the pagination links from the given element or its parent
 * or its parent's parent or null if not found
 * @param el - the element to get the pagination links from
 * @returns - the pagination links or null
 */
const getPaginationLinksFromTarget = (el: HTMLElement) => {
  return Array.from(el.querySelectorAll('a')).length > 1 ? el : null
}

/**
 * Method to get the pagination data from the given element
 * @param el - the element to get the pagination data from
 */
const getPaginationData = (el: HTMLElement) => {
  const list = getPaginationListFromTarget(el)
  const links = getPaginationLinksFromTarget(el)
  if (list)
    return {
      list: extractPaginationList(list),
      path: getElementPath(list),
    }
  if (links)
    return {
      list: extractPaginationLinks(links),
      path: getElementPath(links),
    }
  return { pagination: null, path: null }
}

/**
 * Method to navigate to the given page number
 * @param page - the page number to navigate to
 * @returns - void
 */
const navigateToPage = (page: number) => {
  const { href } = pagination.list[page]
  if (href) {
    window.location.href = href
    _updatePaginationValueInStorage()
  }
}

/**
 * Method to auto navigate to the next page
 * when scraping the data from the website and the pagination
 * is selected.
 * @returns - void
 */
export const autoNavigate = async (callback: () => Promise<any>) => {
  await loadSavedPagination()
  pagination = getPaginationData(document.querySelector(pagination.path))
  if (pagination?.list) {
    lastPage =
      String(lastPage?.length || '').length > 0 ? lastPage : pagination.list[0]?.textContent
    const lastPageIndex = pagination.list.findIndex((page: any) => page.textContent === lastPage)
    const pageIndex = lastPageIndex + 1
    if (pageIndex <= pagination.list.length) {
      lastPage = pagination.list[pageIndex]?.textContent
      await _updatePaginationValueInStorage()
      if (!lastPage) {
        alert.fire(
          chrome.i18n.getMessage('success'),
          chrome.i18n.getMessage('scrapingDone'),
          'success',
        )
        await storeData(window.location.origin + '-scraping', 'inActive')
        chrome.runtime.sendMessage({ action: 'SCRAPING_DONE', payload: 'inactive' })
        return
      }
      await _sleep(10000)
      await callback()
      navigateToPage(pageIndex)
    }
  }
}

/**
 * Method to handle the pagination selecting when the user clicks on the pagination element
 * @param event - the event object
 * @returns - void
 */
const onSelectPagination = (event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()
  event.stopImmediatePropagation()

  if (isClickInsideModal(event)) return
  const el = event.target as HTMLElement
  pagination = getPaginationData(el)

  if ((!pagination.el && !pagination.list) || pagination.list.length === 0) {
    alert.fire({
      icon: 'error',
      title: chrome.i18n.getMessage('error'),
      text: chrome.i18n.getMessage('paginationSelectionError'),
      timer: 2500,
      showCancelButton: false,
      showConfirmButton: false,
      customClass: 'sc-swal',
    })
  } else {
    alert.fire({
      icon: 'success',
      title: chrome.i18n.getMessage('success'),
      text: chrome.i18n.getMessage('paginationSelectionSuccess'),
      timer: 2000,
      showCancelButton: false,
      showConfirmButton: false,
      customClass: 'sc-swal',
    })
    _updatePaginationValueInStorage()
    stopPaginationSelecting()
  }
}

export const startPaginationSelecting = () => {
  document.addEventListener('click', onSelectPagination)
  startHighlightElementOnMouseHover()
}

export const stopPaginationSelecting = () => {
  document.removeEventListener('click', onSelectPagination)
  stopHighlightElementOnMouseHover()
}
