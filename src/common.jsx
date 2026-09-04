import { useState, useEffect, useMemo, useRef, createContext } from 'react'
import styled from 'styled-components'

const TemplateContext = createContext()

// Must match [data-nxtv] main's fixed size in common.scss.
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1080


const SafeArea = styled.div`
  position: absolute;
  top: 54px;
  bottom: 54px;
  left: 96px;
  right: 96px;
`

const DevWrapper = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  padding: 40px;
  align-items: center;
  gap: 20px;
  background-color: #252c2c;
`

const DevPreviewContainer = styled.div`
  position: relative;
  min-width: 1024px;
  min-height: 576px;
  max-width: 1024px;
  max-height: 576px;
  display: flex;
  justify-content: center;
  align-items: center;

  background: url('https://picsum.photos/1440/810');
  background-size: cover;
  background-position: center;
`

const DevPreview = styled.div`
  min-width: 1920px;
  min-height: 1080px;
  max-width: 1920px;
  max-height: 1080px;
  transform: scale(0.5333);
  user-select: none;
  overflow: hidden;
`

const DevControls = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  flex-grow: 1;
  width: 1024px;
`

const Corner = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
`

const BottomLeft = styled(Corner)`
  bottom: 0;
  left: 0;
`

const BottomRight = styled(Corner)`
  bottom: 0;
  right: 0;
`

const TopRight = styled(Corner)`
  top: 0;
  right: 0;
`

const TopLeft = styled(Corner)`
  top: 0;
  left: 0;
`

const TextArea = styled.textarea`
  border: 1px solid #646464;
  background-color: #252c2c;
  color: #ddd;
`


const TemplateWrapper = ({controller, ...props}) => {
  const [context, setContext] = useState(controller.state)
  const [contextEditor, setContextEditor] = useState("")
  const [scale, setScale] = useState(1)
  const mainRef = useRef(null)

  const isDev = useMemo(() => {
    return !!(import.meta.env.DEV || window.location.hostname === 'preview.nbla.xyz')
  }, [])

  useEffect(() => controller.subscribe(setContext), [controller])

  // Fits the fixed 1920x1080 design canvas (main, below) into whatever
  // box the host actually provides — a host isn't guaranteed to render
  // at exactly 1920x1080. In dev preview, main's parent is the (already
  // exactly 1920x1080) DevPreview box, so this resolves to a no-op scale
  // of 1 there and DevPreview's own fixed scale still does the shrink.
  useEffect(() => {
    const container = mainRef.current?.parentElement
    if (!container || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) {
        setScale(Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT))
      }
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setContextEditor(JSON.stringify(context, null, 2))
  }, [context])

  const updateContext = (data) => {
    try {
      controller.updateAction({ data: JSON.parse(data) })
      console.log("New context", data)
    }
    catch (e) {
      console.error('Error parsing context', e)
      console.error("DATA", data)
    }
  }


  const templateContent = (
    <TemplateContext.Provider value={context}>
      <main ref={mainRef} style={{ transform: `scale(${scale})` }}>
        {props.children}
      </main>
    </TemplateContext.Provider>
  )

  if (!isDev) 
    return templateContent

  return (
    <DevWrapper>
      <DevPreviewContainer>
      <DevPreview>
        {templateContent}
      </DevPreview>
      </DevPreviewContainer>
      <DevControls>
        <TextArea 
          value={contextEditor} 
          onChange={(e) => setContextEditor(e.target.value)}
          style={{ flexGrow: 1}}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              e.preventDefault()
              updateContext(contextEditor)
            }
          }}
        />
      </DevControls>
    </DevWrapper>
  )
}

export {
  TemplateContext,
  TemplateWrapper,
  SafeArea, 
  BottomLeft,
  BottomRight,
  TopRight,
  TopLeft,
}
