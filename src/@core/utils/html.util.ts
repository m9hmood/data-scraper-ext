/**
 * Method to check if the given identifier is valid or not (id or class)
 * @param identifier - the identifier to check
 * @returns - true if the identifier is valid, false otherwise
 */
export const isIdentifierValid = (identifier: string) => {
  return /^[A-Za-z]+[\w\-\:\.]*$/.test(identifier)
}
/**
 * Method to get the unique identifier of the given element
 * @param el - the element to get the unique identifier from
 * @returns - the unique identifier or null
 * @example
 * <div id="my-div" class="my-class"></div>
 * getUniqueIdentifier(document.querySelector('#my-div'))
 * // returns '#my-div'
 */
export const getUniqueIdentifier = (el: HTMLElement) => {
  const { id, className } = el as any
  const classPath = className.length > 0 ? className.split(' ')[0] : null
  if (id && isIdentifierValid(id)) return `#${id}`
  if (classPath && isIdentifierValid(classPath)) return `.${classPath}`
  if (el.getAttribute('role')) return `[role="${el.getAttribute('role')}"]`
  return null
}
/**
 * Method to check if the given element is a table item (td or th) or not
 * @param el 
 * @returns boolean - true if the element is a table item, false otherwise
 */
export const isElementTableItem = (el: HTMLElement): boolean => {
  return !!(
    el.tagName === 'TD' ||
    el.tagName === 'TH' ||
    el.parentElement?.tagName === 'TD' ||
    el.parentElement?.tagName === 'TH' ||
    el.closest('td') ||
    el.closest('th')
  )
}

/**
 * Method to get the path of the given element (the path is the list of the parent elements)
 * @param el - the element to get the path from
 * @returns - the path of the element
 * @example
 * <div id="my-div" class="my-class">
 *  <div class="my-class">
 *   <div class="my-class"></div>
 * </div>
 * getElementPath(document.querySelector('.my-class'))
 * // returns '#my-class > .my-class > .my-class'
 */
export const getElementPath = (el: HTMLElement) => {
  const path = [];
  let columnNum = 0;

  while (el && el !== document.documentElement) {
    let identifier = getUniqueIdentifier(el) || el.tagName;

    if (el.tagName === 'TD' && el.parentNode) {
      const siblings = Array.from(el.parentNode.children);
      columnNum = siblings.indexOf(el) + 1;
    }

    if (el.tagName === 'TR' || !isElementTableItem(el)) {
      path.unshift(identifier);
    }

    el = el.parentNode as HTMLElement;
  }

  if (columnNum !== 0) {
    path.push(`:nth-child(${columnNum})`);
  }

  return path.join(' > ');
};

/**
 * Method to set the given selector as highlighted in the DOM (add the data-scraper attribute)
 * @param selector - the selector to highlight
 * @example
 * <div id="my-div" class="my-class"></div>
 * highlightSelector('#my-div')
 * // the div will have the data-scraper attribute
 * <div id="my-div" class="my-class" data-scraper="true"></div>
 */
export const highlightSelector = (selector: string) => {
  const elements: HTMLElement[] = Array.from(document.querySelectorAll(selector))
  elements.forEach((el: HTMLElement) => {
    el.dataset.scraper = 'true'
  })
}
/**
 * Method to remove the highlight from the given selector (remove the data-scraper attribute)
 * @param selector - the selector to remove the highlight from
 * @example
 * <div id="my-div" class="my-class" data-scraper="true"></div>
 * unHighlightSelector('#my-div')
 * // the div will not have the data-scraper attribute
 * <div id="my-div" class="my-class"></div>
 */
export const unHighlightSelector = (selector: string) => {
  const elements: HTMLElement[] = Array.from(document.querySelectorAll(selector))
  elements.forEach((el: HTMLElement) => {
    delete el.dataset.scraper
  })
}
/**
 * Method to check if the given element is highlighted
 * @param el - the element to check
 * @returns - true if the element is highlighted, false otherwise
 * @example
 * <div id="my-div" class="my-class" data-scraper="true"></div>
 * isElementSelected(document.querySelector('#my-div'))
 * // returns true
 * <div id="my-div" class="my-class"></div>
 * isElementSelected(document.querySelector('#my-div'))
 * // returns false
 */
export const isElementSelected = (el: HTMLElement) => el.dataset.scraper === 'true'

/**
 * Method to check if the click event is inside a SweetAlert2 modal
 * @param event - the click event
 * @returns - true if the click event is inside a SweetAlert2 modal, false otherwise
 */
export const isClickInsideModal = (event: MouseEvent): Boolean => {
  const el = event.target as HTMLElement
  return (
    document.querySelector('.swal2-popup')?.contains(el) ||
    el.classList.contains('swal2-confirm') ||
    el.classList.contains('swal2-center')
  )
}
/**
 * Method to highlight the element on mouse hover (add the data-highlighted attribute)
 * @param event - the mousemove event
 */
const _highlightElementOnMouseHover = (event: MouseEvent) => {
  const el = event.target as HTMLElement
  if (isClickInsideModal(event)) return
  document
    .querySelectorAll('[data-highlighted]')
    .forEach((el: any) => delete el.dataset.highlighted)
  el.dataset.highlighted = 'true'
}
/**
 * Method to start highlighting listeners in web page
 */
export const startHighlightElementOnMouseHover = () => {
  document.addEventListener('mousemove', _highlightElementOnMouseHover, true)
}
/**
 * Method to stop highlighting listeners in web page
 * and remove the data-highlighted attribute from all elements
 */
export const stopHighlightElementOnMouseHover = () => {
  document.removeEventListener('mousemove', _highlightElementOnMouseHover, true)
  document
    .querySelectorAll('[data-highlighted]')
    .forEach((el: any) => delete el.dataset.highlighted)
}
