export interface IExtensionMessage {
  type:
    | 'SELECT_ELEMENTS'
    | 'RESET_SETTING'
    | 'SELECT_PAGINATION'
    | 'SHOW_ALERT'
    | 'SEARCH_FOR_TABLE'
    | 'TABLE_EXIST'
    | 'SELECT_PAGINATION_STOP'
    | 'DOWNLOAD_TABLE_DATA'
    | 'DOWNLOAD_DATA'
    | 'START_SCRAPING'
    | 'STOP_SCRAPING'
    | 'IS_SCRAPING'
    | 'HAS_SAVED_DATA'
    | 'IS_CONTENT_SCRIPT_LOADED'
  payload: any
}
