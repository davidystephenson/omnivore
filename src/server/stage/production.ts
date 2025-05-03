import { Vec2, Body } from 'planck'
import { Flags } from '../flags'
import { LayoutData } from '../layout'
import { Playhouse } from './playhouse'
import fs from 'fs'
import { Waypoint } from '../waypoint'
import { NavArea } from '../navArea'
import { Feature } from '../feature/feature'
import { Element } from '../../shared/element'

export class Production extends Playhouse {
  constructor (props: {
    flags: Flags
  }) {
    const layoutDataString = fs.readFileSync('input.json', 'utf-8')
    const layoutData = JSON.parse(layoutDataString) as LayoutData
    console.debug('layoutDataString.length', layoutDataString.length)
    console.debug('layoutData.wallDefs.length', layoutData.wallDefs.length)
    console.debug('layoutData.waypointDatas.length', layoutData.waypointDatas.length)
    console.debug('layoutData.navAreaDefs.length', layoutData.navAreaDefs.length)
    super({
      flags: props.flags,
      halfHeight: layoutData.halfHeight,
      halfWidth: layoutData.halfWidth
    })
    layoutData.wallDefs.forEach(wallDef => {
      this.addWall({ ...wallDef, position: new Vec2(wallDef.position.x, wallDef.position.y) })
    })
    layoutData.waypointDatas.forEach(waypointData => {
      const waypoint = new Waypoint({
        navigation: this.navigation,
        position: waypointData.position,
        radius: waypointData.radius,
        category: waypointData.category,
        id: waypointData.id
      })
      this.navigation.waypoints[waypoint.id] = waypoint
      for (const radiusString in waypointData.pathDistances) {
        const radius = Number(radiusString)
        waypoint.pathDistances[radius] = waypointData.pathDistances[radius]
      }
    })
    layoutData.waypointDatas.forEach(waypointData => {
      console.log('waypointData', waypointData.id, waypointData == null)
    })
    layoutData.waypointDatas.forEach(waypointData => {
      const waypoint = this.navigation.waypoints[waypointData.id]
      if (waypoint == null) throw new Error(`Missing waypoint ${waypointData.id}`)
      if (waypointData == null) return
      layoutData.radii.forEach(radius => {
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
    const is = [...layoutData.waypointMatrix.keys()]
    const js = [...layoutData.waypointMatrix[0].keys()]
    for (const i of is) {
      this.navigation.waypointMatrix[i] = []
      for (const j of js) {
        const id = layoutData.waypointMatrix[i][j]
        const waypoint = this.navigation.waypoints[id]
        if (waypoint == null) {
          throw new Error('missing waypoint')
        }
        this.navigation.waypointMatrix[i][j] = waypoint
      }
    }
    this.navigation.navAreas = layoutData.navAreaDefs.map(navAreaDef => {
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
