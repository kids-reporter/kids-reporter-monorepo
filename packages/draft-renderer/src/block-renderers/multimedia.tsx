import styled from 'styled-components'

import { mediaQuery } from '../utils/media-query'

const mockup = {
  mobile: {
    figure: {
      width: '100%',
    },
    caption: {
      width: 250, // px
    },
  },
  tablet: {
    figure: {
      width: '100%',
    },
    caption: {
      width: 512, // px
    },
  },
  desktop: {
    figure: {
      width: {
        normal: 100, // %
        small: 403, // px
      },
    },
    caption: {
      width: 180, // px
    },
  },
  hd: {
    figure: {
      width: {
        normal: 100, // %
        small: 532, // px
      },
    },
    caption: {
      width: 265, // px
    },
  },
}

const Caption = styled.figcaption`
  color: #575757;
  &::after {
    border-color: #c6c6c6;
  }

  letter-spacing: 0.5px;
  margin-bottom: 30px;
  padding: 0 0 20px 0;

  /* border-bottom of caption */
  &::after {
    content: '';
    height: 1px;
    position: absolute;
    bottom: 0;
    left: 0;
    border-width: 0 0 1px 0;
    border-style: solid;
  }

  ${mediaQuery.smallOnly} {
    position: relative;
    margin-left: auto;
    &:after {
      width: calc(100% - 15px);
    }
  }

  ${mediaQuery.smallOnly} {
    max-width: ${mockup.mobile.caption.width}px;
  }

  ${mediaQuery.mediumAbove} {
    /* clear float */
    clear: both;

    position: relative;
    float: right;

    &:after {
      width: 100%;
    }
  }

  ${mediaQuery.mediumAndDesktopOnly} {
    width: ${mockup.desktop.caption.width}px;
  }

  ${mediaQuery.largeOnly} {
    width: ${mockup.hd.caption.width}px;
  }
`

export default {
  Caption,
}
