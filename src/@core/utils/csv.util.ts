import { unparse } from 'papaparse'
import { convertToBlob, downloadFile } from './files.util'

/**
 * Method to create a csv file from data
 * @param data - the data to create the csv file from
 * @returns - a csv file
 * @example
 * createCsvFile([
 * { name: 'John', age: 30 },
 * { name: 'Jane', age: 40 },
 * { name: 'Jack', age: 50 },
 * ])
 */
export const createCsvFile = (data: any) => {
  return unparse(data, { header: true, skipEmptyLines: true })
}
/**
 * Method to generate a csv file from data
 * @param data - the data to create the csv file from
 * @param filename - the name of the csv file
 * @returns - void
 * @example
 * generateCsvFile([
 * { name: 'John', age: 30 },
 * { name: 'Jane', age: 40 },
 * { name: 'Jack', age: 50 },
 * ], 'users.csv')
 * // => users.csv file is downloaded
 */
export const generateCsvFile = (data: any, filename: string) => {
  const csvFile = createCsvFile(data)
  const blob = convertToBlob(csvFile)
  downloadFile(blob, filename)
}
