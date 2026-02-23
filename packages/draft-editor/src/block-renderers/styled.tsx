import { ReactNode } from 'react'
import styled from 'styled-components'

const EditButton = styled.div`
  cursor: pointer;
  display: none;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`

const _EditableBlock = styled.div`
  position: relative;

  &:hover {
    ${EditButton} {
      opacity: 1;
      display: block;
    }
  }
`

export const FontStyler = styled.div`
  font-size: 18px;
  font-weight: 500;
  line-height: 2.1;
  letter-spacing: 1.08px;

  & h2 {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.6;
    letter-spacing: 1.4px;
  }

  & h3 {
    font-size: 24px;
    font-weight: 700;
    line-height: 1.6;
    letter-spacing: 1.2px;
  }

  & h4 {
    font-size: 22px;
    font-weight: 700;
    line-height: 1.6;
    letter-spacing: 1.1px;
  }

  & h5 {
    font-size: 20px;
    font-weight: 700;
    line-height: 1.6;
    letter-spacing: 1px;
  }

  & h6 {
    font-size: 18px;
    font-weight: 700;
    line-height: 1.6;
    letter-spacing: 0.9px;
  }

  @media (min-width: 1024px) {
    & h2 {
      font-size: 40px;
      letter-spacing: 2px;
    }

    & h3 {
      font-size: 32px;
      letter-spacing: 1.6px;
    }

    & h4 {
      font-size: 28px;
      letter-spacing: 1.4px;
    }

    & h5 {
      font-size: 22px;
      letter-spacing: 1.1px;
    }

    & h6 {
      font-size: 18px;
      letter-spacing: 0.9px;
    }
  }
`

export const EditableBlock = (props: {
  className?: string
  component: ReactNode
  onClick: () => void
}) => {
  return (
    <_EditableBlock className={props.className} onClick={props.onClick}>
      {props.component}
      <EditButton onClick={props.onClick}>
        <i className="fa-solid fa-pen"></i>
        <span>Modify</span>
      </EditButton>
    </_EditableBlock>
  )
}
