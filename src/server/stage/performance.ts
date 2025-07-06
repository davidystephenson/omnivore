import { Flags } from '../flags'
import { Initial, Promptbook, WaypointDef } from '../types'
import { Stage } from './stage'

export class Performance extends Stage {
  constructor (props: {
    flags: Flags
    promptbook: Promptbook
    promptbookName: string
  }) {
    const waypointIndexes = props.promptbook.waypointDatas.map(waypointData => {
      const waypointIndex: WaypointDef = {
        id: waypointData.id,
        position: waypointData.position
      }
      return waypointIndex
    })
    const initial: Initial = {
      ...props.promptbook,
      waypointIndexes
    }
    super({
      flags: props.flags,
      halfHeight: props.promptbook.halfHeight,
      halfWidth: props.promptbook.halfWidth,
      initial,
      onBook: false,
      promptbookName: props.promptbookName,
      waypointDatas: props.promptbook.waypointDatas
    })
  }
}
