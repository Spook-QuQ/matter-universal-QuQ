(_=> {

  const moduleName = 'MatterWorld'

  const MatterWorldQuQ = class MatterWorldQuQ {
    constructor (_Matter = Matter, _MatterObject = MatterObject) {
      this.Matter = _Matter
      this.MatterObject = _MatterObject

      const {
        Engine,
        Runner
      } = _Matter

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
    }

    _ifMatterObjectOwO (obj) {
      let rsObject = null
      if (obj.constructor.name === 'MatterObjectOwO') {
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
      const rsObject = object.constructor.name === 'MatterObjectOwO'
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
        activeObjects: Object.keys(this.activeObjects).reduce((list, key) => {
          const {
            angle,
            angularVelocity,
            label,
            position,
            velocity,
          } = this.activeObjects[key]
          list[key] = {
            id: key,
            state: {
              angle,
              angularVelocity,
              position: {...position || {}},
              velocity: {...velocity || {}},
            },
            currentScale: this.activeObjects[key].OwO?.currentScale,
            type: this.activeObjects[key].OwO?.type,
            defaultVariables: this.activeObjects[key].OwO?.defaultVariables
          }
          return list
        }, {})
      }
    }

    _updateStateOfObject (nextObject, target) {
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

      // 新しい state に存在しないオブジェクトを削除
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
          if (nextObjects[key].defaultVariables) {
            const newObject = new this.MatterObject({
              type: nextObjects[key].type,
              variables: nextObjects[key].defaultVariables
            })
            // console.log(nextObjects[key].defaultVariables);
            this.add(newObject)
            // body の OwO をわざわざ使っているので、MatterObjectOwO の body を渡す必要がある
            this._updateStateOfObject(nextObjects[key], newObject.body)
          }
        }

        this._updateStateOfObject(nextObjects[key], target)
      })
    }
  }

  // ==

  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = MatterWorldQuQ
  } else {
    this[moduleName] = MatterWorldQuQ
  }

})``
