// Entry point for CasparCG's HTML producer. Built as a classic (non-module)
// script — Chromium/CEF refuses to fetch external `type="module"` scripts
// over file://, which is how CasparCG loads templates from its local
// templates folder, so this can't share the ESM bundle OGraf hosts use.
import NxtvGraphic from './main'
import type { PlayActionParams, StopActionParams } from './types'

declare global {
  interface Window {
    __nxtvGraphic?: NxtvGraphic
    __nxtvQueue?: Array<['play' | 'stop', unknown] | ['update', string]>
  }
}

const legacyMount = document.getElementById('root')
if (legacyMount) {
  // main.tsx exports an unregistered class (see the comment there) — this
  // is CasparCG's only "host", so it has to do the registration itself.
  // A fresh name per evaluation sidesteps Vite dev-server HMR re-running
  // this module (a full page load, the production case, only ever runs
  // it once anyway).
  const tagName = `nxtv-graphic-${Math.random().toString(36).slice(2, 10)}`
  if (!customElements.get(tagName)) {
    customElements.define(tagName, NxtvGraphic)
  }

  const el = new NxtvGraphic()
  legacyMount.replaceWith(el)
  window.__nxtvGraphic = el

  const queue = window.__nxtvQueue || []
  queue.forEach(([action, arg]) => {
    if (action === 'play') el.playAction(arg as PlayActionParams)
    if (action === 'stop') el.stopAction(arg as StopActionParams)
    if (action === 'update') el.updateAction({ data: JSON.parse(arg as string) })
  })
  window.__nxtvQueue = []
}
