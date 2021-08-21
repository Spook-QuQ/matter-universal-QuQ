import Matter from 'matter-js'

export default class MatterObjectQuQ {
  static Matter = Matter

  // static setMatter (_Matter) {
  //   const Matter = _Matter
  // }

  // constructor (ctx, _Matter = Matter) {
  //   const Matter = _Matter

  constructor (ctx) {
    const Matter = MatterObjectQuQ.Matter

    // const {
    //   Bodies,
    // } = _Matter

    const {
      Bodies,
      Constraint
    } = Matter

    const {
      id,
      type,
      variables // array
    } = ctx

    if (type === 'constraint') {
      this.body = Constraint.create({...variables})
      this.body.OwO = this
      this.bodies = {
        bodyA: variables.bodyA,
        bodyB: variables.bodyB
      }
    } else {
      this.body = Bodies[type](...variables)
      this.body.OwO = this
      this.currentScale = { x: 1, y: 1 }
    }

    if (id) this.body.id = id

    this.defaultVariables = variables

    this.type = type
  }

  // worldOwO で定義される
  add () {
    // if (!this.engine) return
    // const Matter.Composite.add(this.engine.world, this.body)
    // return this
    console.log('Not added to any world yet')
  }

  // worldOwO で定義される
  remove () {
    // if (!this.engine) return
    // const Matter.World.remove(this.engine.world, this.body)
    // return this
    console.log('Not added to any world yet')
  }

  // worldOwO で定義される
  addObjectEvent () {}

  rotate (rotation) {
    Matter.Body.rotate(this.body, rotation)
    return this
  }

  setAngle (angle) {
    Matter.Body.setAngle(this.body, angle)
    return this
  }

  setAngularVelocity (velocity) {
    Matter.Body.setAngularVelocity(this.body, velocity)
    return this
  }

  setInertia (inertia) {
    Matter.Body.setInertia(this.body, inertia)
    this.addObjectEvent({
      id: this.body.id,
      type: 'setInertia',
      value: inertia
    })
    return this
  }

  translate (translation) {
    Matter.Body.translate(this.body, translation)
    return this
  }

  setPosition(position) {
    Matter.Body.setPosition(this.body, position)
    return this
  }

  setVelocity (velocity) {
    Matter.Body.setVelocity(this.body, velocity)
    return this
  }

  applyForce (from, to) {
    Matter.Body.applyForce(this.body, from, to)
    return this
  }

  scale (ctx) {
    const { x, y } = ctx
    Matter.Body.scale(this.body, x, y)
    this.currentScale.x *= x
    this.currentScale.y *= y
    this.addObjectEvent({
      id: this.body.id,
      type: 'scale',
      value: ctx
    })
    return this
  }

  setStatic (isStatic) {
    Matter.Body.setStatic(this.body, isStatic)
    return this
  }

  setGroup (id) {
    this.body.collisionFilter.group = Math.abs(id) * -1
    this.addObjectEvent({
      id: this.body.id,
      type: 'setGroup',
      value: id
    })
    return this
  }

  setCategory (id) {
    this.body.collisionFilter.category = id
    this.addObjectEvent({
      id: this.body.id,
      type: 'setCategory',
      value: id
    })
    return this
  }

  setMask (id) {
    this.body.collisionFilter.mask = id
    this.addObjectEvent({
      id: this.body.id,
      type: 'setMask',
      value: id
    })
    return this
  }

}
