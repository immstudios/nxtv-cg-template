import styled from 'styled-components';
import {CSSTransition} from 'react-transition-group';

const FADE_DURATION = 300;
const FADE_OFFSET = 200;

const InfoContainer = styled.div`
  padding: 0;
  margin: 0;
  list-style: none;
  line-height: 1.4;

  li {
    list-style: none;
    font-size: 34px;
    color: var(--color-text);
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.6);

    &:first-child {
      text-transform: uppercase;
      color: var(--color-aurora-03);
    }
  }

  &.fade-enter {
    li {
      opacity: 0;
      transform: translateY(-30px);
    }
  }

  &.fade-enter-active {
    li {
      opacity: 1;
      transform: translateY(0);
      transition: all ${FADE_DURATION}ms ease-in-out;
      transition-delay: var(--delay, 0s);
    }
  }

  &.fade-exit {
    li {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &.fade-exit-active {
    li {
      opacity: 0;
      transform: translateY(30px);
      transition: all ${FADE_DURATION}ms ease-in-out;
      transition-delay: var(--delay, 0s);
    }
  }
`;


const Info = ({visible, lines}) => {
  const content = lines || [];
  const timeout = content.length * FADE_DURATION;
  return (
    <CSSTransition 
      in={visible} 
      timeout={timeout} 
      classNames="fade" 
      unmountOnExit
    >
      <InfoContainer>
        {(lines || []).map((line, i) => (
          <li 
            key={i} 
            style={{ 
              '--delay': visible 
                ? `${i * FADE_OFFSET}ms` 
                : `${(content.length - i - 1) * FADE_OFFSET}ms` 
            }}
          >
            {line}
          </li>
        ))}
      </InfoContainer>
    </CSSTransition>
  )
}

export default Info
