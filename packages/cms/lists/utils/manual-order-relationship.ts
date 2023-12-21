import { graphql } from '@keystone-6/core'
import {
  json,
  virtual,
  relationship,
  RelationshipFieldConfig,
} from '@keystone-6/core/fields'
import { BaseListTypeInfo } from '@keystone-6/core/types'
import { RelationshipInfo } from '../views/relationship-order-editor'

export type OrderedRelationshipConfig = {
  fieldName: string
  relationshipConfig: RelationshipFieldConfig<BaseListTypeInfo>
  // refLabelField must be specified because it varies in difference lists,
  // ex: 'title' in Post list/'name' in Tag list
  refLabelField: string
}

// Create 3 fields for manual ordered relationship:
// 1. relationship field - for saving relationship
// 2. json field - for saving manual order
// 3. virtual field - for api query
const relationshipAndExtendedFields = ({
  fieldName,
  relationshipConfig,
}: {
  fieldName: string
  relationshipConfig: RelationshipFieldConfig<BaseListTypeInfo>
}) => {
  const relationshipField = fieldName
  const orderJSONField = `${relationshipField}_order_json`
  const orderedRelationshipField = `${relationshipField}_ordered`
  const refList = relationshipConfig?.ref?.split('.')?.[0]

  return {
    [relationshipField]: relationship(relationshipConfig),
    [orderJSONField]: json({
      label: '排序',
      defaultValue: [],
      ui: {
        views: './lists/views/relationship-order-editor',
        createView: {
          fieldMode: 'edit',
        },
        itemView: {
          fieldMode: 'edit',
        },
        listView: {
          fieldMode: 'hidden',
        },
      },
    }),
    [orderedRelationshipField]: virtual({
      field: (lists) =>
        graphql.field({
          type: graphql.list(graphql.nonNull(lists[refList].types.output)),
          async resolve(item, args, context, info) {
            const list = info.parentType?.name

            // Query relationship & order to find target ids/ordered ids
            let targetIds, orderedIds
            try {
              const source = await context.query[list].findOne({
                where: { id: item?.id?.toString() },
                query: `${orderJSONField} ${relationshipField} { id }`,
              })
              const order = source?.[orderJSONField]
              const relationships = source?.[relationshipField]
              orderedIds = order?.map((item) => item?.id) ?? []
              targetIds = relationships?.map((relationship: any) => {
                return relationship?.id
              })
            } catch (err) {
              console.error(err)
            }

            // Query targets by ids
            let targets: any
            try {
              targets = await context.db?.[refList]?.findMany({
                where: { id: { in: targetIds } },
              })
            } catch (err) {
              console.error(err)
            }

            // Order targets
            const orderedTargets =
              orderedIds?.length > 0 && targets?.length > 0
                ? orderedIds.map((id: string) => {
                    return targets.find(
                      (target: any) => `${target?.id}` === `${id}`
                    )
                  })
                : []

            return orderedTargets
          },
        }),
      ui: {
        itemView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
      },
    }),
  }
}

type RelationshipInput =
  | {
      disconnect?: { id: string }[]
      connect?: { id: string }[]
    }
  | undefined

// Mutate order field when relationships change in list hook
const mutateOrderFieldHook = ({
  fieldName,
  relationshipConfig,
  refLabelField,
}: OrderedRelationshipConfig) => {
  const relationshipField = fieldName
  const orderJSONField = `${relationshipField}_order_json`
  const refList = relationshipConfig?.ref?.split('.')?.[0]

  return async ({ inputData, item, resolvedData, context }) => {
    const relationships: RelationshipInput = inputData?.[relationshipField]
    let orderJSON: RelationshipInfo[] =
      inputData?.[orderJSONField] || item?.[orderJSONField] || []

    // Remove disconnected relationships from json
    const disconnect = relationships?.disconnect
    if (Array.isArray(disconnect) && disconnect.length > 0) {
      const ids = disconnect.map(({ id }) => id)
      orderJSON = orderJSON.filter((item) => !ids.includes(item?.id))
    }

    // Append connected relationships to end of json
    const connect = relationships?.connect
    if (Array.isArray(connect) && connect.length > 0) {
      const ids = connect.map(({ id }) => id)
      const items = await context.query[refList].findMany({
        where: { id: { in: ids } },
        query: `id ${refLabelField}`,
      })
      const newRelationships = items.map((item) => {
        return {
          id: item.id,
          label: item.title,
        }
      })
      orderJSON = [...orderJSON, ...newRelationships]
    }

    // Mutate order json field
    resolvedData[orderJSONField] = orderJSON
  }
}

export default { relationshipAndExtendedFields, mutateOrderFieldHook }
