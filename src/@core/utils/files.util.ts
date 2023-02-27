/**
 * Method to convert file to blob with type text/csv;charset=utf-8;
 * and download it with the given filename
 * @param file - the file to convert to blob
 * @param filename - the name of the file to download
 * @returns - void
 */
export const convertToBlob = (file: any, type: string = 'text/csv;charset=utf-8;') => {
  return new Blob([file], { type })
}

/**
 * Method to download file with the given filename and blob data type
 * @param blob - the blob data to download
 * @param filename - the name of the file to download
 * @returns - void
 * @example
 * downloadFile(convertToBlob(file), 'filename')
 */
export const downloadFile = (blob: Blob, filename: string) => {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.click()
}
