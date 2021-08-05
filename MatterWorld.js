export default class MatterWorldQuQ {
  static Matter
  static MatterObject

  static setMatter (_Matter) {
    this.Matter = _Matter
  }
  static setMatterObject (_MatterObject) {
    this.MatterObject = _MatterObject
  }

  // constructor (_Matter = Matter, _MatterObject = MatterObject) {
  //   this.Matter = _Matter
  //   this.MatterObject = _MatterObject
  constructor () {

    this.Matter = MatterWorldQuQ.Matter
    this.MatterObject = MatterWorldQuQ.MatterObject

    // const {
    //   Engine,
    //   Runner
    // } = _Matter
    const {
      Engine,
      Runner
    } = this.Matter

    const engine = Engine.create()
    const runner = Runner.create()
    Runner.run(runner, engine)

    this.engine = engine
    this.runner = runner

    this.canvasMouse = null
    this.mouseConstraint = null
    this.mouseEvents = null
    this.isMouseEventsOn = null

    // this.currentObjectIndex = 0
    this.activeObjects = {}

    this.existEvent = {}
    this.eventFuncs = {}
  }

  _ifMatterObjectOwO (obj) {
    let rsObject = null
    if (obj.constructor === this.MatterObject) {
      // obj.engine = this.engine
      rsObject = obj.body
      obj.add = () => this.add(obj)
      obj.remove = () => this.remove(obj)
    } else {
      rsObject = obj
    }

    // const index = this.currentObjectIndex += 1 // 加算後の値が代入されている
    // this.activeObjects[index] = rsObject
    this.activeObjects[rsObject.id] = rsObject
    // rsObject._objectIndex = index
    return rsObject
  }

  add (object) {

    if (Array.isArray(object)) { // 配列の場合
      const rsObjects = object.map(obj => this._ifMatterObjectOwO(obj))
      this.Matter.Composite.add(this.engine.world, rsObjects)

    } else { // 配列ではない場合
      let rsObject = this._ifMatterObjectOwO(object)
      this.Matter.Composite.add(this.engine.world, rsObject)

    }
  }

  remove (object) {
    const rsObject = object.constructor === this.MatterObject
     ? object.body
     : object

    // delete this.activeObjects[rsObject._objectIndex]
    delete this.activeObjects[rsObject.id]
    this.Matter.World.remove(this.engine.world, rsObject)
  }

  makeRenderer (element) {
    this.renderer = this.Matter.Render.create({
        element,
        engine: this.engine
    })
    return this
  }

  runRenderer () {
    this.Matter.Render.run(this.renderer)
  }


  // ======== ======== ======== ======== ======== ======== ========
  // ======== ======== ======== ======== ======== ======== ========
  // ======== ======== ======== ======== ======== ======== ========


  addMouseEvent (ctx) { // Pixiと合わせて使う場合は使用する必要が無い
    if (!this.canvasMouse && !this.mouseConstraint) {
      this.canvasMouse = this.Matter.Mouse.create(document.querySelector('canvas'))
      this.mouseConstraint = this.Matter.MouseConstraint.create(this.engine, {
        mouse: this.canvasMouse
      })
      this.mouseEvents = {}
      this.isMouseEventsOn = {}
    }

    const {
      name,
      type,
      handler
    } = ctx

    if (!this.isMouseEventsOn[type]) {
      this.isMouseEventsOn[type] = true
      this.mouseEvents[type] = {}
      this.Matter.Events.on(this.mouseConstraint, type, e => {
        // this.mouseEvents[type].forEach(cb => cb(e))
        Object.values(this.mouseEvents[type]).forEach(cb => cb(e))
      })
    }

    // this.mouseEvents[type].push(handler)
    this.mouseEvents[type][name] = handler
  }

  removeMouseEvent (ctx) {
    const {
      name,
      type
    } = ctx

    if (this.mouseEvents[type] && this.mouseEvents[type][name]) {
      delete this.mouseEvents[type][name]
    }
  }

  get state () {
    return {
      // currentObjectIndex: this.currentObjectIndex,
      activeObjects: Object.keys(this.activeObjects).reduce((list, id) => {
        const {
          angle,
          angularVelocity,
          // label,
          position,
          velocity,
        } = this.activeObjects[id]

        if (this.activeObjects[id].OwO?.type === 'constraint') {
          const defaultVariables = this.activeObjects[id].OwO?.defaultVariables
          delete defaultVariables.bodyA
          delete defaultVariables.bodyB

          list[id] = {
            id,
            type: this.activeObjects[id].OwO?.type,
            bodyIds: {
              bodyA: this.activeObjects[id].OwO?.bodies.bodyA.id,
              bodyB: this.activeObjects[id].OwO?.bodies.bodyB.id,
            },
            defaultVariables
          }
          return list
        } else {
          list[id] = {
            id,
            state: {
              angle,
              angularVelocity,
              position: {...position || {}},
              velocity: {...velocity || {}},
            },
            currentScale: this.activeObjects[id].OwO?.currentScale,
            type: this.activeObjects[id].OwO?.type,
            defaultVariables: this.activeObjects[id].OwO?.defaultVariables
          }
        }
        return list
      }, {})
    }
  }

  _updateStateOfObject (nextObject, target) {
    if (!nextObject.state) return // constraint は state が無いのでここで終了

    if (target && target.OwO) {
      Object.keys(nextObject.state).forEach(property => {
        switch (property) {
          case 'angle': return target.OwO.setAngle(nextObject.state[property])
          case 'angularVelocity': return target.OwO.setAngularVelocity(nextObject.state[property])
          case 'position': return target.OwO.setPosition(nextObject.state[property])
          case 'velocity': return target.OwO.setVelocity(nextObject.state[property])
        }
      })
    } else if (target) {
      Object.keys(nextObject.state).forEach(property => {
        const { Body } = this.Matter
        switch (property) {
          case 'angle': return Body.setAngle(target, nextObject.state[property])
          case 'angularVelocity': return Body.setAngularVelocity(target, nextObject.state[property])
          case 'position': return Body.setPosition(target, nextObject.state[property])
          case 'velocity': return Body.setVelocity(target, nextObject.state[property])
        }
      })
    }
  }

  set state (_state = {}) {
    const {
      // currentObjectIndex,
      activeObjects: nextObjects
    } = _state

    // if (!currentObjectIndex) return
    if (!nextObjects) return

    // this.currentObjectIndex = currentObjectIndex
    const keysOfNextObjects = Object.keys(nextObjects)
    const keysOfPrevObjects = Object.keys(this.activeObjects)

    // next の state に存在しないオブジェクトを prev から削除
    keysOfPrevObjects
      .filter(key => !keysOfNextObjects.includes(key))
      .forEach(deleteTargetKey => {
        this.remove(this.activeObjects[deleteTargetKey])
      })

    // 存在しているオブジェクトの state を更新
    keysOfNextObjects.forEach(key => {
      const target = this.activeObjects[key]

      // 現在のstateに、更新対象のオブジェクトが存在しない場合に追加する
      if (!target) {
        if (nextObjects[key].type === 'constraint') {
          const bodyIds = nextObjects[key].bodyIds
          if (!this.activeObjects[bodyIds.bodyA] || !this.activeObjects[bodyIds.bodyB]) return
          console.log(nextObjects[key].defaultVariables);
          const newObject = new this.MatterObject({
            id: nextObjects[key].id,
            type: nextObjects[key].type,
            variables: {
              bodyA: this.activeObjects[bodyIds.bodyA],
              bodyB: this.activeObjects[bodyIds.bodyB],
              ...(nextObjects[key].defaultVariables || {})
            }
          })

          this.add(newObject)
        } else if (nextObjects[key].defaultVariables) {
          const newObject = new this.MatterObject({
            id: nextObjects[key].id,
            type: nextObjects[key].type,
            variables: nextObjects[key].defaultVariables || {}
          })

          this.add(newObject)
          // update するのは body だけなので
          this._updateStateOfObject(nextObjects[key], newObject.body)
        }
      }

      if (target?.type === 'constraint') return
      this._updateStateOfObject(nextObjects[key], target)
    })
  }

  addEvent (ctx) {
    const {
      type,
      func
    } = ctx

    if (!this.existEvent[type]) {
      this.existEvent[type] = true
      this.eventFuncs[type] = []

      this.Matter.Events.on(this.runner, type, () => {
        this.eventFuncs[type].forEach(func => func())
      })
    }

    this.eventFuncs[type].push(func)
  }

  removeEvent (ctx) {
    const {
      type,
      func
    } = ctx

    const index = this.eventFuncs[type].indexOf(func)
    this.eventFuncs[type].splice(index, 1)
  }

  deleteWorld () {
    const {
      World,
      Engine,
      Render,
      Runner
    } = this.Matter

    Render.stop(this.renderer)
    Runner.stop(this.runner)
    World.clear(this.engine.world)
    Engine.clear(this.engine)
    this.renderer.canvas.remove()
    this.renderer.canvas = null
    this.renderer.context = null

  }
}
