import { ITargetedElement } from '../interfaces/scraper.interface'

/**
 * method to extract src from image element or its child element
 * @param el - the element to extract data from
 * @returns - the src attribute of the image element
 */
const getDataFromImage = (el: HTMLElement): string => {
  if (el.tagName !== 'IMG') return getDataFromImage(el.querySelector('img') as HTMLElement)
  return el.getAttribute('src') as string
}
/**
 * method to extract href from link element or its child element
 * @param el - the element to extract data from
 * @returns - the href attribute of the link element
 */
const getDataFromLink = (el: HTMLElement): string => {
  if (!el) return ''
  if (el.tagName !== 'A') return getDataFromLink(el.querySelector('a') as HTMLElement)
  return el.getAttribute('href') as string
}

/**
 * method to extract text from text element or its child element
 * @param el - the element to extract data from
 * @returns - the text of the text element
 */
const getDataFromText = (el: HTMLElement): string => {
  return el.innerText
}
/**
 * method to extract data from an element based on its type
 * @param el - the element to extract data from
 * @param type - the type of the element
 * @returns - the extracted data
 */
const extractData = (el: HTMLElement, type: string) => {
  switch (type) {
    case 'image':
      return getDataFromImage(el)
    case 'link':
      return getDataFromLink(el)
    case 'text':
      return getDataFromText(el)
  }
}
/**
 * method to get all elements as an array based on a path selector string
 * @param path - the path selector string
 * @returns - an array of elements
 */
const getAllElementsAsArray = (path: string): HTMLElement[] => {
  return Array.from(document.querySelectorAll(path)) as HTMLElement[]
}
/**
 * method to get data from a list of targeted elements
 * @param targets - the list of targeted elements
 * @returns - an array of objects containing the data
 * @example
 * extractDataFromTargets([
 * {
 *  identifier: 'title',
 * path: '.title',
 * type: 'text'
 * },
 * {
 * identifier: 'image',
 * path: '.image',
 * type: 'image'
 * },
 * {
 * identifier: 'link',
 * path: '.link',
 * type: 'link'
 * }
 * ])
 * // returns
 * [
 * {
 * title: 'Title 1',
 * image: 'https://example.com/image1.jpg',
 * link: 'https://example.com/link1'
 * },
 * ...
 * ]
 */
export const extractDataFromTargets = (targets: ITargetedElement[]) => {
  const data: any = []
  targets.forEach((target) => {
    const elements = getAllElementsAsArray(target.path)
    elements.forEach((el, idx) => {
      if (!data[idx]) data[idx] = {}
      data[idx][target.identifier] = extractData(el, target.type)
    })
  })
  return data
}

/**
 * Method to extracts data from a table element
 * @param table - the table element to extract data from
 * @returns - an array of objects representing the table data
 */
export const extractTableData = (table: HTMLTableElement): Record<string, any>[] => {
  const headers = Array.from(table.querySelectorAll('th')).map((th) => th.textContent) as string[]
  const rows = Array.from(table.querySelectorAll('tr')) as HTMLTableRowElement[]
  const data = rows.map((row) => {
    const cells = Array.from(row.querySelectorAll('td'))
    return cells.reduce((acc: Record<string, any>, cell, index: number) => {
      acc[headers[index]] = cell.textContent
      return acc
    }, {})
  })
  return data.filter((row) => Object.keys(row).length > 0)
}
