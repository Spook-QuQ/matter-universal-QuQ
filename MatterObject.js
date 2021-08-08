export default class MatterObjectQuQ {
  static Matter

  static setMatter (_Matter) {
    this.Matter = _Matter
  }

  // constructor (ctx, _Matter = Matter) {
  //   this.Matter = _Matter

  constructor (ctx) {
    this.Matter = MatterObjectQuQ.Matter

    // const {
    //   Bodies,
    // } = _Matter

    const {
      Bodies,
      Constraint
    } = this.Matter

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
    // this.Matter.Composite.add(this.engine.world, this.body)
    // return this
    console.log('Not added to any world yet')
  }

  // worldOwO で定義される
  remove () {
    // if (!this.engine) return
    // this.Matter.World.remove(this.engine.world, this.body)
    // return this
    console.log('Not added to any world yet')
  }

  // worldOwO で定義される
  addObjectEvent () {}

  rotate (rotation) {
    this.Matter.Body.rotate(this.body, rotation)
    return this
  }

  setAngle (angle) {
    this.Matter.Body.setAngle(this.body, angle)
    return this
  }

  setAngularVelocity (velocity) {
    this.Matter.Body.setAngularVelocity(this.body, velocity)
    return this
  }

  setInertia (inertia) {
    this.Matter.Body.setInertia(this.body, inertia)
    this.addObjectEvent({
      id: this.body.id,
      type: 'setInertia',
      value: inertia
    })
    return this
  }

  translate (translation) {
    this.Matter.Body.translate(this.body, translation)
    return this
  }

  setPosition(position) {
    this.Matter.Body.setPosition(this.body, position)
    return this
  }

  setVelocity (velocity) {
    this.Matter.Body.setVelocity(this.body, velocity)
    return this
  }

  scale (ctx) {
    const { x, y } = ctx
    this.Matter.Body.scale(this.body, x, y)
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
    this.Matter.Body.setStatic(this.body, isStatic)
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

}
