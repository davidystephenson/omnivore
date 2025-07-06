export default function getPromptbookName (props?: {
  filename?: string
}): string {
  const promptbookName = props?.filename ?? process.argv[3] ?? 'output'
  return promptbookName
}
