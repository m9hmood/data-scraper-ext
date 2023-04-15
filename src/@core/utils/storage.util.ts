/**
 * Method to store the data in local storage with the given key
 * @param key - the key to save the data with
 * @param data - the data to save
 * @returns - void
 */
export const storeData = async (key: string, data: any) => {
  try {
    await chrome.storage.local.set({ [key]: data })
  } catch (error) {
    console.error(error)
  }
}
/**
 * Method to get the data from the local storage with the given key
 * @param key - the key to get the data with
 * @returns - the data or null
 */
export const retrieveData = async (key: string) => {
  try {
    const data = await chrome.storage.local.get(key)
    return data[key]
  } catch {
    return null
  }
}
/**
 * Method to remove the data from the local storage with the given key
 * @param key - the key to remove the data with
 * @returns - void
 */
export const removeData = async (key: string) => {
  try {
    await chrome.storage.local.remove(key)
  } catch (error) {
    console.error(error)
  }
}
