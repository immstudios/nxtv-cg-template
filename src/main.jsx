import React, { useContext } from 'react'
import ReactDOM from 'react-dom/client'

import { 
  TemplateWrapper, 
  TemplateContext, 
  SafeArea, 
  TopLeft, 
  BottomRight 
} from '/src/common'

import Logo from '/src/components/logo.jsx'
import Clock from '/src/components/clock.jsx'
import Info from '/src/components/info.jsx'


const DEFAULT_CONTEXT = {
  showLogo: true,
  showClock: true,
  showInfo: true,
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TemplateWrapper defaultContext={DEFAULT_CONTEXT}>
      <Template />
    </TemplateWrapper>
  </React.StrictMode>,
)
