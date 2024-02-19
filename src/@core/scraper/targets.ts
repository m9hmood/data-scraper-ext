import {
  startHighlightElementOnMouseHover,
  stopHighlightElementOnMouseHover,
} from '../utils/html.util'
import { retrieveData, storeData } from '../utils/storage.util'
import {
  isElementSelected,
  unHighlightSelector,
  highlightSelector,
  getElementPath,
  isClickInsideModal,
} from '../utils/html.util'
import { ITargetedElement } from '../interfaces/scraper.interface'
import alert from 'sweetalert2'

export let targets: ITargetedElement[] = []

/**
 * Method to update targets in storage
 */
const _updateTargetsValueInStorage = async () => {
  await storeData(window.location.origin + '-targets', { targets })
}

/**
 * Method to reset targets in storage
 */
export const resetTargets = async () => {
  targets = []
  await _updateTargetsValueInStorage()
}

/**
 * Method to load Load saved targets from  storage
 */
export const loadSavedTargets = async () => {
  const data = await retrieveData(window.location.origin + '-targets')
  if (data) {
    targets = data.targets
  }
}

/**
 * Method to set target settings (identifier and type)
 * @returns - an array of strings representing the settings
 * @example - ['identifier', 'text']
 * @example - ['identifier', 'image']
 * @example - ['identifier', 'link']
 */
const getTargetSettings = async (): Promise<string[]> => {

  const { value: formValues } = await alert.fire({
    title: chrome.i18n.getMessage('targetSettings'),
    customClass: 'sc-swal',
    html: `
              <div style="width: 100%; text-align: left">
                  <label for="cs-identifier-input">
                  ${chrome.i18n.getMessage('identifier')}
                  </label>
                  <input id="cs-identifier-input" class="swal2-input">
                  <label for="cs-type-input">
                  ${chrome.i18n.getMessage('type')}
                  </label>
                  <select id="cs-type-input" class="swal2-input">
                      <option value="text">Text</option>
                      <option value="image">Image</option>
                      <option value="link">Link</option>
                  </select>
              </div>
          `,
    focusConfirm: false,
    confirmButtonText: chrome.i18n.getMessage('save'),
    preConfirm: () => {
      const inputs = [
        (document.getElementById('cs-identifier-input') as HTMLInputElement).value,
        (document.getElementById('cs-type-input') as HTMLInputElement).value,
      ]
      if (!inputs[0] || targets.find((target) => target.identifier === inputs[0])) {
        alert.showValidationMessage(
          chrome.i18n.getMessage('identifierMustBeUnique'),
        )
        return
      }
      return inputs
    },
  })

  if (formValues) return formValues
  return [Math.random().toString(36).substring(7), 'text']
}

/**
 * Method to handle On click on element in the webpage
 * to select it as a target element to extract data from
 */
const onSelectElement = (event: MouseEvent) => {
  // check if click inside sweetalert modal to prevent closing
  if (isClickInsideModal(event)) return

  event.preventDefault()
  event.stopPropagation()
  event.stopImmediatePropagation()

  const el = event.target as HTMLElement
  const selector: string = getElementPath(el)
  if (isElementSelected(el)) {
    unHighlightSelector(selector)
    targets = targets.filter((target) => target.path !== selector)
    _updateTargetsValueInStorage()
    return
  }
  getTargetSettings().then((settings) => {
    targets.push({
      path: selector,
      identifier: settings[0],
      type: settings[1] as any,
    })
    highlightSelector(selector)
    _updateTargetsValueInStorage()
  })
}

export const startTargetsSelecting = () => {
  document.addEventListener('click', onSelectElement, true)
  startHighlightElementOnMouseHover()
}
export const stopTargetsSelecting = () => {
  document.removeEventListener('click', onSelectElement, true)
  stopHighlightElementOnMouseHover()
}
