(_=> {

  const moduleName = 'MatterObject'

  const MatterObjectQuQ = class MatterObjectQuQ {
    constructor (ctx, _Matter = Matter) {
      this.Matter = _Matter

      const {
        Bodies,
      } = _Matter

      const {
        type,
        variables // array
      } = ctx

      this.body = Bodies[type](...variables)
      this.body.OwO = this

      this.type = type
      this.defaultVariables = variables
      this.currentScale = { x: 1, y: 1 }
    }

    add () {
      // if (!this.engine) return
      // this.Matter.Composite.add(this.engine.world, this.body)
      // return this
      console.log('Not added to any world yet')
    }

    remove () {
      // if (!this.engine) return
      // this.Matter.World.remove(this.engine.world, this.body)
      // return this
      console.log('Not added to any world yet')
    }

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
      return this
    }

    setStatic (isStatic) {
      this.Matter.Body.setStatic(this.body, isStatic)
      return this
    }

  }

  // ==

  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = MatterObjectQuQ
  } else {
    this[moduleName] = MatterObjectQuQ
  }

})``
