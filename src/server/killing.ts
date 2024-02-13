import { Feature } from './feature/feature'

export class Killing {
  killer: Feature
  victim: Feature

  constructor (props: { killer: Feature, victim: Feature }) {
    this.killer = props.killer
    this.victim = props.victim
  }
}
