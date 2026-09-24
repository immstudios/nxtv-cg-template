import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'

import { TemplateWrapper } from './common'
import { useTemplateContext } from './templateContext'
import { GraphicController } from './controller'
import type { LoadParams, PlayActionParams, StopActionParams, TemplateData, UpdateActionParams } from './types'

import Logo from './components/logo'
import Clock from './components/clock'
import Info from './components/info'
import Weather from './components/weather'

import commonStyles from './common.css?inline'
import fontStyles from './fonts.css?inline'


const DEFAULT_CONTEXT: TemplateData = {
  showLogo: true,
  showClock: false,
  showInfo: false,
  info: ['Line 1', 'Line 2', 'Line 3'],
  showWeather: false,
  weatherLocation: 'Prague',
}


const Template = () => {
  const { showLogo, showClock, showInfo, info, showWeather, weatherLocation } = useTemplateContext()

  return (
    <>
      {/* Full-canvas layer, first so the corner elements draw above it. */}
      <Weather visible={showWeather} location={weatherLocation} />
      <div className="nxtv-safe-area">
        <div className="nxtv-corner nxtv-corner--top-left">
          <Clock visible={showClock} />
          <Info visible={showInfo} lines={info} />
        </div>
        <div className="nxtv-corner nxtv-corner--bottom-right">
          <Logo visible={showLogo} />
        </div>
      </div>
    </>
  )
}


// The OGraf entry point: a Web Component implementing the standard graphic
// lifecycle (load/playAction/stopAction/updateAction/dispose/customAction).
// This module deliberately does NOT call customElements.define() on the
// class — per the Custom Elements spec, a constructor can only ever be
// passed to define() once, by anyone, for the lifetime of the registry.
// OGraf renderers (and this template's own AMCP bridge, src/amcp.tsx) are
// expected to register the class themselves under a name of their
// choosing; self-registering here would make any host's own define() call
// throw as soon as it tried.
//
// data-nxtv (not the tag name, which we don't control) is what
// common.css scopes its rules to, so the element is stylable no matter
// what name it ends up registered under.
class NxtvGraphic extends HTMLElement {
  controller = new GraphicController(DEFAULT_CONTEXT)
  private reactRoot: Root | undefined

  connectedCallback() {
    // Attribute/DOM work belongs here, not the constructor: the Custom
    // Elements spec forbids a constructor from touching attributes or
    // children, and document.createElement() enforces that strictly
    // ("The result must not have attributes") even though a bare `new`
    // does not — this only breaks under the spec-compliant path.
    this.setAttribute('data-nxtv', '')

    // Into the real document <head>, not our own (possibly shadow-DOM
    // nested) element: Chrome never registers @font-face declared inside
    // a shadow root's stylesheet into document.fonts. Font resources are
    // document-global regardless of where the rule lives, so this is the
    // one piece of CSS that has to escape our own subtree. Guarded so N
    // instances only inject once.
    if (!document.head.querySelector('style[data-nxtv-fonts]')) {
      const fontStyleTag = document.createElement('style')
      fontStyleTag.setAttribute('data-nxtv-fonts', '')
      fontStyleTag.textContent = fontStyles
      document.head.appendChild(fontStyleTag)
    }

    const style = document.createElement('style')
    style.textContent = commonStyles
    this.appendChild(style)

    const mount = document.createElement('div')
    mount.setAttribute('data-nxtv-mount', '')
    this.appendChild(mount)

    this.reactRoot = createRoot(mount)
    this.reactRoot.render(
      <StrictMode>
        <TemplateWrapper controller={this.controller}>
          <Template />
        </TemplateWrapper>
      </StrictMode>
    )
  }

  disconnectedCallback() {
    this.dispose()
  }

  async load(params: LoadParams = {}) {
    this.controller.load(params)
  }

  // Accepts and ignores params: OGraf's spec-mandated public signature
  // (goto/delta/skipAnimation), which this graphic has no use for — it
  // has no per-step or animation-skip behavior. See types.ts.
  async playAction(_params: PlayActionParams = {}) {
    this.controller.playAction()
  }

  async stopAction(_params: StopActionParams = {}) {
    this.controller.stopAction()
  }

  async updateAction(params: UpdateActionParams = {}) {
    this.controller.updateAction(params)
  }

  async customAction() {
    // No custom actions defined (see manifest.ograf.json: no customActions).
  }

  async dispose() {
    this.controller.dispose()
    this.reactRoot?.unmount()
  }
}

export default NxtvGraphic
