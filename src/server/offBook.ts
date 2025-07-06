import getPromptbookName from './getPromptbookName'
import perform from './perform'
import readPromptbook from './readPromptbook'

const promptbookName = getPromptbookName()
const promptbook = readPromptbook({ onBook: false, promptbookName })
perform({ promptbook, promptbookName })
