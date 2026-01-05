type EntityMap = Record<
  string,
  {
    data: Record<string, unknown>
    type: string
    mutability: 'IMMUTABLE' | 'MUTABLE'
  }
>

function parseTocIndexesFromEntityMap(entityMap: EntityMap | undefined) {
  if (!entityMap) {
    return []
  }
  return Object.keys(entityMap).reduce<{ key: string; label: string }[]>(
    (acc, key) => {
      const entity = entityMap[key]
      if (entity && entity.type === 'TOC_ANCHOR' && entity.data?.anchorKey) {
        const key: string = entity.data?.anchorKey as string
        const label: string = entity.data?.anchorLabel as string
        return [...acc, { key, label }]
      }
      return acc
    },
    []
  )
}

export default parseTocIndexesFromEntityMap
