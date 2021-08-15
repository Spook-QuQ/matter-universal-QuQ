// TODO:
// scaleで変更されたすでに存在しているオブジェクトが含まれる state をワールドへ set する時
// の処理をまだ描いていない、ので書く
// [!] stateを受け取る旅に currentScale を使って scale をしてしまうと
// 無限にサイズが変わってしまう

import Matter from 'matter-js'
import MatterObject from '../matter-universal-QuQ/MatterObject.js'

export default class MatterWorldQuQ {
  static Matter = Matter
  // static MatterObject
  static MatterObject = MatterObject

  // static setMatter (_Matter) {
  //   this.Matter = _Matter
  // }
  // static setMatter (_Matter) {
  //   this.Matter = _Matter
  //   MatterObject.setMatter(_Matter)
  // }
  // static setMatterObject (_MatterObject) {
  //   this.MatterObject = _MatterObject
  // }

  static get Object () {
    return MatterWorldQuQ.MatterObject
  }

  // constructor (_Matter = Matter, _MatterObject = MatterObject) {
  //   this.Matter = _Matter
  //   this.MatterObject = _MatterObject
  constructor (options = {}) {

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

    const engine = Engine.create(options)
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

    this.timestamp = 0

    this.nextObjectEvents = []
  }

  _ifMatterObjectOwO (obj) {
    let rsObject = null
    if (obj.constructor === this.MatterObject) {
      // obj.engine = this.engine
      rsObject = obj.body
      obj.add = () => {
        this.add(obj)
        return obj
      }
      obj.remove = () => {
        this.remove(obj)
        return obj
      }
      obj.addObjectEvent = ctx => this.nextObjectEvents.push(ctx)
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

  makeRenderer (element, options = {
            width: 800,
            height: 600,
            showAngleIndicator: true,
            showCollisions: true,
            showVelocity: true
        }) {
    this.renderer = this.Matter.Render.create({
        element,
        engine: this.engine,
        options
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

    const state = {
      timestamp: new Date().getTime(),
      // currentObjectIndex: this.currentObjectIndex,
      activeObjects: Object.keys(this.activeObjects).reduce((list, id) => {
        const {
          angle,
          angularVelocity,
          // label,
          position,
          velocity,
          collisionFilter
        } = this.activeObjects[id]

        // constraint の場合
        if (this.activeObjects[id].OwO && this.activeObjects[id].OwO.type === 'constraint') {
          const defaultVariables = this.activeObjects[id].OwO && this.activeObjects[id].OwO.defaultVariables
          delete defaultVariables.bodyA
          delete defaultVariables.bodyB

          list[id] = {
            id,
            type: this.activeObjects[id].OwO && this.activeObjects[id].OwO.type,
            bodyIds: {
              bodyA: this.activeObjects[id].OwO && this.activeObjects[id].OwO.bodies.bodyA.id,
              bodyB: this.activeObjects[id].OwO && this.activeObjects[id].OwO.bodies.bodyB.id,
            },
            defaultVariables
          }
          return list

        // 通常の object の場合
        } else {
          list[id] = {
            id,
            state: {
              angle,
              angularVelocity,
              position: {...position || {}},
              velocity: {...velocity || {}},
              currentScale: this.activeObjects[id].OwO && this.activeObjects[id].OwO.currentScale,
              collisionFilter
            },
            type: this.activeObjects[id].OwO && this.activeObjects[id].OwO.type,
            defaultVariables: this.activeObjects[id].OwO && this.activeObjects[id].OwO.defaultVariables
          }
        }
        return list
      }, {}),
      objectEvents: [...this.nextObjectEvents]
    }

    this.nextObjectEvents = []

    return state
  }

  _updateStateOfObject (nextObject, target, options = {}) {
    if (!nextObject.state) return // constraint は state が無いのでここで終了

    const {
      initialize
    } = options

    if (target && target.OwO) {

      if (initialize) {
        if (nextObject.state.currentScale) {
          target.OwO.scale(nextObject.state.currentScale)
        }
        if (nextObject.state.collisionFilter) {
          Object.keys(nextObject.state.collisionFilter).forEach(keyName => {
            target.OwO.body.collisionFilter[keyName] = nextObject.state.collisionFilter[keyName]
          })
        }
      }

      Object.keys(nextObject.state).forEach(property => {
        switch (property) {
          case 'angle': return target.OwO.setAngle(nextObject.state[property])
          case 'angularVelocity': return target.OwO.setAngularVelocity(nextObject.state[property])
          case 'position': return target.OwO.setPosition(nextObject.state[property])
          case 'velocity': return target.OwO.setVelocity(nextObject.state[property]) // これでは無限にサイズが変わってしまう
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
      timestamp,
      activeObjects: nextObjects,
      objectEvents
    } = _state

    if (this.timestamp > timestamp) return
    this.timestamp = timestamp

    if (objectEvents && Array.isArray(objectEvents) && objectEvents.length) {
      objectEvents.forEach(event => {
        const {
          id,
          type,
          value
        } = event

        const target = this.activeObjects[id]
        if (target && target.OwO) target.OwO[type](value)
      })
    }

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

        // constraint のオブジェクト
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

        // 普通のオブジェクト
        } else if (nextObjects[key].defaultVariables) {
          const newObject = new this.MatterObject({
            id: nextObjects[key].id,
            type: nextObjects[key].type,
            variables: nextObjects[key].defaultVariables || {}
          })

          this.add(newObject)
          // update するのは body だけなので
          this._updateStateOfObject(nextObjects[key], newObject.body, { initialize: true })
          this.nextObjectEvents = []
        }
      }

      if (target && target.type === 'constraint') return
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

    if (this.renderer) {
      Render.stop(this.renderer)
      this.renderer.canvas.remove()
      this.renderer.canvas = null
      this.renderer.context = null
      this.renderer = null
    }
    Runner.stop(this.runner)
    World.clear(this.engine.world)
    Engine.clear(this.engine)

  }
}
