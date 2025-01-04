import { Vec2, PolygonShape } from 'planck'
import { Rgb } from '../../shared/color'
import { Actor } from '../actor/actor'
import { Prop } from './prop'
import { Feature } from './feature'

export class Sculpture extends Prop {
  constructor (props: {
    position: Vec2
    actor: Actor
    color?: Rgb
    vertices: Vec2[]
  }) {
    super({
      position: props.position,
      actor: props.actor,
      shape: new PolygonShape(props.vertices),
      color: props.color,
      label: 'sculpture'
    })
  }

  handleContact (props: {
    target: Feature
  }): void {
    super.handleContact({ target: props.target })
    if (!(props.target instanceof Prop)) {
      return
    }
    const combatDamage = this.getCombatDamage(props.target)
    props.target.combatDamage += combatDamage
    props.target.health = props.target.getHealth()
    if (props.target.health <= 0) {
      props.target.actor.destroy()
    }
  }
}
