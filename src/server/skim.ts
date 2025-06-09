import fs from 'fs'

export default function skim (props: {
  path: string
}): unknown {
  const indexString = fs.readFileSync(props.path, 'utf8')
  const indexJson: unknown = JSON.parse(indexString)
  return indexJson
}
