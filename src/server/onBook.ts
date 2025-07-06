import perform from './perform'
import readPromptbook from './readPromptbook'
import getPromptbookName from './getPromptbookName'

const promptbookName = getPromptbookName()
const promptbook = readPromptbook({ onBook: true, promptbookName })
perform({ promptbook, promptbookName })
