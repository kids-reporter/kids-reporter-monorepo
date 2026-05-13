import { ReactNode } from 'react'
import styled from 'styled-components'

const Wrapper = styled.span`
  display: inline;
  padding-right: 1.25em;
  color: #8e8e8e;
`

const EditButton = styled.span`
  position: absolute;
  right: -20px;
  cursor: pointer;
  user-select: none;
`

const IconAnchor = styled.span`
  display: inline;
  position: relative;
`

export const EditableWrapper = (props: {
  component: ReactNode
  onClick: (e: React.MouseEvent<HTMLElement>) => void
}) => {
  return (
    <Wrapper>
      {props.component}
      <IconAnchor>
        <EditButton
          contentEditable={false}
          onMouseDown={(e) => e.preventDefault()}
          onClick={props.onClick}
        >
          <i className="fas fa-pen"></i>
        </EditButton>
      </IconAnchor>
    </Wrapper>
  )
}
