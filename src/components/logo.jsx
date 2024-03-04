import styled from 'styled-components'
import { CSSTransition } from 'react-transition-group'

const NXTVLogo = () => {

  return (
    <svg
       width="100"
       height="53"
       viewBox="0 0 105.83333 56.09167"
       version="1.1"
       id="svg4489"
       xmlns="http://www.w3.org/2000/svg"
       xmlns:svg="http://www.w3.org/2000/svg"
       xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
       xmlns:cc="http://creativecommons.org/ns#"
       xmlns:dc="http://purl.org/dc/elements/1.1/">
      <g
         id="logo"
         transform="translate(0,-191.16665)">
        <path
          style={{fill:'var(--color-snow-01)', fillOpacity:.8, stroke:'none', strokeWidth:0.26458332}}
           d="m 0,191.16665 v 56.09167 H 16.477982 V 216.5893 l 23.807304,30.66902 h 20.766412 l 12.735347,-17.43566 12.78733,17.43566 H 105.83333 L 82.805752,218.12927 101.44094,191.16665 H 83.923343 L 73.813037,206.51421 63.780702,191.16665 c -11.72176,0.0135 -14.141871,0 -25.184799,0 v 30.77342 L 14.866571,191.16665 Z m 55.073883,13.15504 9.902381,13.80758 -9.980355,12.86795 0.07794,-26.67553 z"
           />
      </g>
    </svg>
  )
}

const LogoContainer = styled.div`
  &.fade-enter {
    opacity: 0;
    transform: rotate3d(0, 1, 0, -90deg);
  }

  &.fade-enter-active {
    opacity: 1;
    transform: rotate3d(0, 0, 0, 0);
    transition: all 0.5s ease-in-out;
  }

  &.fade-exit {
    opacity: 1;
    transform: rotate3d(0, 0, 0, 0);
  }

  &.fade-exit-active {
    opacity: 0;
    transform: rotate3d(0, 1, 0, 90deg);
    transition: all 0.5s ease-in-out;
  }
`

const Logo = ({visible}) => {
  return (
    <CSSTransition in={visible} timeout={500} classNames="fade" unmountOnExit>
      <LogoContainer>
        <NXTVLogo />
      </LogoContainer>
    </CSSTransition>
  )
}

export default Logo
