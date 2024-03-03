import { useState, useEffect, useMemo, useCallback, createContext } from 'react'
import styled from 'styled-components'

import '/src/common.scss'

const TemplateContext = createContext()


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


const TemplateWrapper = ({defaultContext, ...props}) => {
  const [context, setContext] = useState({...(defaultContext || {}), isPlaying: false})
  const [contextEditor, setContextEditor] = useState("mmm")

  const isDev = useMemo(() => {
    return !!(import.meta.env.DEV || window.location.hostname === 'preview.nbla.xyz')
  }, [])

  useEffect(() => {
    setContextEditor(JSON.stringify(context, null, 2))
  }, [context])

  const handlePlay = () => setContext({...context, isPlaying: true})
  const handleStop = () => setContext({...context, isPlaying: false})

  const updateContextFromEditor = useCallback(() => {
    try {
      setContext(JSON.parse(contextEditor))
    }
    catch (e) {
      console.log("DATA", contextEditor)
      console.error('Error parsing context', e)
    }
  }, [contextEditor])

  useEffect(() => {
    window.playHandler = handlePlay
    window.stopHandler = handleStop
    if (!window.playRequested)
      return
    handlePlay()
  }, []) 


  const templateContent = (
    <TemplateContext.Provider value={context}>
      <main>
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
              updateContextFromEditor()
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
