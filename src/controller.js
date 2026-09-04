// Shared state machine driving the template, invoked identically by the
// AMCP bridge (nxtv.html) and the OGraf custom-element lifecycle methods.
class GraphicController {
  constructor(defaultState = {}) {
    this.state = { ...defaultState, isPlaying: false }
    this.listeners = new Set()
  }

  subscribe(listener) {
    this.listeners.add(listener)
    listener(this.state)
    return () => this.listeners.delete(listener)
  }

  _emit() {
    this.listeners.forEach((listener) => listener(this.state))
  }

  load({ data } = {}) {
    if (data) this.state = { ...this.state, ...data }
    this._emit()
  }

  playAction() {
    this.state = { ...this.state, isPlaying: true }
    this._emit()
  }

  stopAction() {
    this.state = { ...this.state, isPlaying: false }
    this._emit()
  }

  updateAction({ data } = {}) {
    if (data) this.state = { ...this.state, ...data }
    this._emit()
  }

  dispose() {
    this.listeners.clear()
  }
}

export { GraphicController }
