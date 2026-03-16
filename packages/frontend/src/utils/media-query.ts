const breakpoints = {
  mobile: 375,
  tablet: 768,
  desktop: 1024,
  hd: 1440,
}

const mediaQuery = {
  smallOnly: `@media (max-width: ${breakpoints.tablet - 1}px)`,
  mediumAndDesktopOnly: `@media (min-width: ${breakpoints.tablet}px) and (max-width: ${
    breakpoints.hd - 1
  }px)`,
  mediumAbove: `@media (min-width: ${breakpoints.tablet}px)`,
  largeBelow: `@media (max-width: ${breakpoints.hd - 1}px)`,
  largeOnly: `@media (min-width: ${breakpoints.hd}px)`,
}

export { breakpoints, mediaQuery }
