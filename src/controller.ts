import type { GraphicState, LoadParams, TemplateData, UpdateActionParams } from './types'

type Listener = (state: GraphicState) => void

// Shared state machine driving the template, invoked identically by the
// AMCP bridge (public/nxtv.html) and the OGraf custom-element lifecycle
// methods (see main.tsx).
class GraphicController {
  state: GraphicState
  private listeners = new Set<Listener>()

  constructor(defaultState: TemplateData) {
    this.state = { ...defaultState, isPlaying: false }
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener)
    listener(this.state)
    return () => this.listeners.delete(listener)
  }

  private emit() {
    this.listeners.forEach((listener) => listener(this.state))
  }

  load({ data }: LoadParams = {}) {
    if (data) this.state = { ...this.state, ...data }
    this.emit()
  }

  playAction() {
    this.state = { ...this.state, isPlaying: true }
    this.emit()
  }

  stopAction() {
    this.state = { ...this.state, isPlaying: false }
    this.emit()
  }

  updateAction({ data }: UpdateActionParams = {}) {
    if (data) this.state = { ...this.state, ...data }
    this.emit()
  }

  dispose() {
    this.listeners.clear()
  }
}

export { GraphicController }
