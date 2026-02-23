'use client'
import styled from 'styled-components'

import { DividerLegacy } from '@/components/divider-legacy'
import { mediaQuery } from '@/utils/media-query'

import { DraftRenderer, DraftRendererProp } from './draft-renderer'

const Container = styled.div`
  margin-bottom: 120px;
`

export const Credits = ({ rawContentState, theme }: DraftRendererProp) => {
  return (
    <Container>
      <StyledHr />
      <DraftRenderer rawContentState={rawContentState} theme={theme} />
    </Container>
  )
}

const StyledHr = styled(DividerLegacy)`
  margin-top: 70px;
  margin-bottom: 70px;

  ${mediaQuery.smallOnly} {
    margin-top: 50px;
    margin-bottom: 50px;
  }
`

export default Credits
