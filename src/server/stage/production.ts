import { Vec2, Body } from 'planck'
import { Flags } from '../flags'
import { Playhouse } from './playhouse'
import { Waypoint } from '../waypoint'
import { NavArea } from '../navArea'
import { Feature } from '../feature/feature'
import { Element } from '../../shared/element'
import { Promptbook } from '../types'

export class Production extends Playhouse {
  constructor (props: {
    flags: Flags
    promptbook: Promptbook
  }) {
    super({
      flags: props.flags,
      halfHeight: props.promptbook.halfHeight,
      halfWidth: props.promptbook.halfWidth
    })
    props.promptbook.wallDefs.forEach(wallDef => {
      this.addWall({ ...wallDef, position: new Vec2(wallDef.position.x, wallDef.position.y) })
    })
    props.promptbook.waypointDatas.forEach(waypointData => {
      const waypoint = new Waypoint({
        navigation: this.navigation,
        position: waypointData.position,
        radius: waypointData.radius,
        category: waypointData.category,
        id: waypointData.id
      })
      this.navigation.waypoints[waypoint.id] = waypoint
      // for (const radius of props.promptbook.radii) {
      //   const radiusData = waypointData.pathDistances[radius]
      //   waypoint.pathDistances[radius] = radiusData
      // }
    })
    props.promptbook.waypointDatas.forEach(waypointData => {
      const waypoint = this.navigation.waypoints[waypointData.id]
      if (waypoint == null) throw new Error(`Missing waypoint ${waypointData.id}`)
      if (waypointData == null) return
      props.promptbook.radii.forEach(radius => {
        const waypoints: Record<number, Waypoint> = {}
        const ids = Object.keys(waypointData.nextWaypoints[radius]).map(s => Number(s))
        ids.forEach(id => {
          const waypoint = this.navigation.waypoints[id]
          if (waypoint == null) throw new Error(`Missing waypoint ${radius} ${id}`)
          waypoints[id] = waypoint
        })
        waypoint.nextWaypoints[radius] = waypoints
      })
    })
    const is = [...props.promptbook.waypointMatrix.keys()]
    const js = [...props.promptbook.waypointMatrix[0].keys()]
    for (const i of is) {
      this.navigation.waypointMatrix[i] = []
      for (const j of js) {
        const id = props.promptbook.waypointMatrix[i][j]
        const waypoint = this.navigation.waypoints[id]
        if (waypoint == null) {
          throw new Error('missing waypoint')
        }
        this.navigation.waypointMatrix[i][j] = waypoint
      }
    }
    this.navigation.navAreas = props.promptbook.navAreaDefs.map(navAreaDef => {
      return new NavArea({ stage: this, ...navAreaDef })
    })
    this.spawner.setupSpawnPoints()
    this.debug({ v: 'Starting the runner...' })
    setInterval(() => { this.runner.step() }, 1000 * this.runner.timeStep)
    this.debug({ v: 'Runner started!' })
  }

  getBodies (): Body[] {
    const bodies = []
    for (
      let body = this.world.getBodyList();
      body != null;
      body = body.getNext()
    ) {
      bodies.push(body)
    }
    return bodies
  }

  getFeatures (): Feature[] {
    const bodies = this.getBodies()
    const features: Feature[] = []
    bodies.forEach(body => {
      const feature = body.getUserData()
      if (feature instanceof Feature) {
        features.push(feature)
      }
    })
    return features
  }

  getElements (): Element[] {
    const filteredFeatures = this.getFeatures()
    const elements: Element[] = filteredFeatures.map(feature => {
      return feature.getElement(true)
    })
    return elements
  }
}
