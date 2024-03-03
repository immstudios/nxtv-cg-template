import styled, { keyframes, css } from 'styled-components';

const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeOut = keyframes`
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(20px);
  }
`;

const InfoContainer = styled.div`
  opacity: ${props => (props.$show ? '1' : '0')};
  transition: opacity 1s ease-in-out;

  ul {
    padding: 0;
    margin: 0;
  }

  li {
    list-style: none;
    font-size: 34px;
    color: var(--color-text);

    &:first-child {
      color: var(--color-aurora-03);
    }

    ${props =>
      props.$show ?
      css`
        opacity: 0;
        animation: ${fadeIn} 0.5s ease-in-out forwards;
    ` 
    : css`
      opacity: 1;
      animation: ${fadeOut} 0.5s ease-in-out forwards;
    `}
  }
`;


const Info = ({visible, lines}) => {

  return (
    <InfoContainer $show={visible}>
      <ul>
        {(lines || []).map((line, i) => (
          <li key={i} style={{ animationDelay: `${i * 0.4}s`}}>{line}</li>
        ))}
      </ul>
    </InfoContainer>
  )

}

export default Info
