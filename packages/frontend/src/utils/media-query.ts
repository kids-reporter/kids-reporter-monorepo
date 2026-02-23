const breakpoints = {
  small: 375,
  medium: 768,
  desktop: 1024, // TODO: unify breakpoints in twreporter/kids reporter
  large: 1440,
}

const mediaQuery = {
  smallOnly: `@media (max-width: ${breakpoints.medium - 1}px)`,
  mediumAndDesktopOnly: `@media (min-width: ${breakpoints.medium}px) and (max-width: ${
    breakpoints.large - 1
  }px)`,
  mediumAbove: `@media (min-width: ${breakpoints.medium}px)`,
  largeBelow: `@media (max-width: ${breakpoints.large - 1}px)`,
  largeOnly: `@media (min-width: ${breakpoints.large}px)`,
}

export { breakpoints, mediaQuery }
