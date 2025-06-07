import { Promptbook } from './types'

export default function trust (props: {
  data: unknown
}): Promptbook {
  return props.data as Promptbook
}
