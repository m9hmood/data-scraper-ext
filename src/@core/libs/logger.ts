export const Logger = {
  log: (message: string, action: string) => {
    if (action) message = `${action}: ${message}`
    console.log(message)
  },
  error: (message: string, action: string) => {
    if (action) message = `${action}: ${message}`
    console.error(message)
  },
  warn: (message: string, action: string) => {
    if (action) message = `${action}: ${message}`
    console.warn(message)
  },
}
