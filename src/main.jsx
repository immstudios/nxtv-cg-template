import React, { useContext } from 'react'
import ReactDOM from 'react-dom/client'
import { StyleSheetManager } from 'styled-components'

import {
  TemplateWrapper,
  TemplateContext,
  SafeArea,
  TopLeft,
  BottomRight
} from '/src/common'
import { GraphicController } from '/src/controller'

import Logo from '/src/components/logo.jsx'
import Clock from '/src/components/clock.jsx'
import Info from '/src/components/info.jsx'

import commonStyles from '/src/common.scss?inline'
import fontStyles from '/src/fonts.scss?inline'


const DEFAULT_CONTEXT = {
  showLogo: true,
  showClock: false,
  showInfo: false,
  info: ['Line 1', 'Line 2', 'Line 3']
}


const Template = () => {
  const showLogo = useContext(TemplateContext).showLogo
  const showClock = useContext(TemplateContext).showClock
  const showInfo = useContext(TemplateContext).showInfo
  const infoLines = useContext(TemplateContext).info

  return (
    <SafeArea>
      <TopLeft>
        <Clock visible={showClock}/>
        <Info visible={showInfo} lines={infoLines} />
      </TopLeft>
      <BottomRight>
        <Logo visible={showLogo} />
      </BottomRight>
    </SafeArea>
  )
}


// The OGraf entry point: a Web Component implementing the standard graphic
// lifecycle (load/playAction/stopAction/updateAction/dispose/customAction).
// This module deliberately does NOT call customElements.define() on the
// class — per the Custom Elements spec, a constructor can only ever be
// passed to define() once, by anyone, for the lifetime of the registry.
// OGraf renderers (and this template's own AMCP bridge, src/amcp.jsx) are
// expected to register the class themselves under a name of their
// choosing; self-registering here would make any host's own define() call
// throw as soon as it tried.
//
// data-nxtv (not the tag name, which we don't control) is what
// common.scss scopes its rules to, so the element is stylable no matter
// what name it ends up registered under.
//
// Styled-components' <style> tags are pointed at our own mount node via
// StyleSheetManager rather than the default document.head: at least one
// real OGraf renderer (SuperFlyTV's devtool) always mounts graphics
// inside a closed shadow root, and a document.head stylesheet can never
// reach into a shadow tree.
class NxtvGraphic extends HTMLElement {
  constructor() {
    super()
    this.controller = new GraphicController(DEFAULT_CONTEXT)
  }

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
    // one piece of CSS that has to escape our own subtree — the opposite
    // of the StyleSheetManager choice below. Guarded so N instances only
    // inject once.
    if (!document.head.querySelector('style[data-nxtv-fonts]')) {
      const fontStyleTag = document.createElement('style')
      fontStyleTag.setAttribute('data-nxtv-fonts', '')
      fontStyleTag.textContent = fontStyles
      document.head.appendChild(fontStyleTag)
    }

    const style = document.createElement('style')
    style.textContent = commonStyles
    this.appendChild(style)

    // A separate sibling, not a child of `mount`: React exclusively owns
    // every child of the node passed to createRoot() and will clear
    // anything else inserted there, including the <style> tag
    // StyleSheetManager's target would otherwise try to append into it.
    const styleTarget = document.createElement('div')
    this.appendChild(styleTarget)

    const mount = document.createElement('div')
    mount.setAttribute('data-nxtv-mount', '')
    this.appendChild(mount)

    this._reactRoot = ReactDOM.createRoot(mount)
    this._reactRoot.render(
      <React.StrictMode>
        <StyleSheetManager target={styleTarget}>
          <TemplateWrapper controller={this.controller}>
            <Template />
          </TemplateWrapper>
        </StyleSheetManager>
      </React.StrictMode>
    )
  }

  disconnectedCallback() {
    this.dispose()
  }

  async load(params = {}) {
    this.controller.load(params)
  }

  async playAction(params = {}) {
    this.controller.playAction(params)
  }

  async stopAction(params = {}) {
    this.controller.stopAction(params)
  }

  async updateAction(params = {}) {
    this.controller.updateAction(params)
  }

  async customAction() {
    // No custom actions defined (see manifest.ograf.json: no customActions).
  }

  async dispose() {
    this.controller.dispose()
    this._reactRoot?.unmount()
  }
}

export default NxtvGraphic
