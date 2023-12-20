import { group, graphql } from '@keystone-6/core'
import { relationship, json, virtual } from '@keystone-6/core/fields'
import { BaseFields, BaseListTypeInfo } from '@keystone-6/core/types'

type ListInfo = {
  id: string
  label: string
}
type OrderJSON = ListInfo[]

type RelationshipInput =
  | {
      disconnect?: { id: string }[]
      connect?: { id: string }[]
    }
  | undefined

// createOrderedRelationship function takes configs like:
// {
//    fieldName,
//    refField,
//    normal relationship config,
// }
//
// 'fieldName' represents the field name of that relationship,
// 'refField' could be name/title of that ref list for query
export const createOrderedRelationship = (config: {
  fieldName: string
  ref: string
  refField: string
  many: boolean
  label: string
}): {
  fields: BaseFields<BaseListTypeInfo>
  resolveInputHook: any
} => {
  const relationshipField = config.fieldName
  const orderJSONField = `${relationshipField}_order_json`
  const orderedRelationshipField = `${relationshipField}_ordered`
  const targetType = config.ref // TODO: handle 2-sided ref

  return {
    fields: group({
      label: config.label,
      description: '選取與排序',
      fields: {
        [relationshipField]: relationship({
          ref: targetType,
          many: true,
          label: '選取(選完按Save changes才會出現在下方排序列)',
          ui: {
            createView: { fieldMode: 'edit' },
            itemView: { fieldMode: 'edit' },
            listView: { fieldMode: 'hidden' },
            hideCreate: true,
          },
        }),
        [orderJSONField]: json({
          label: '排序',
          defaultValue: [],
          ui: {
            views: './lists/views/ordered-relationship',
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
              type: graphql.list(
                graphql.nonNull(lists[targetType].types.output)
              ),
              async resolve(item, args, context, info) {
                // TODO: error handling
                const sourceType = info.parentType?.name

                // Query relationship & order to find target ids/ordered ids
                let targetIds, orderedIds
                try {
                  const source = await context.query[sourceType].findOne({
                    where: { id: item.id.toString() },
                    query: `${orderJSONField} ${relationshipField} { id }`,
                  })
                  const order = source?.[orderJSONField]
                  const relationships = source?.[relationshipField]
                  orderedIds = order?.map((item) => item.id) ?? []
                  targetIds = relationships?.map((relationship) => {
                    return relationship.id
                  })
                } catch (err) {
                  console.error(err)
                }

                // Query targets by ids
                let targets
                try {
                  targets = await context.db?.[targetType]?.findMany({
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
                          (target) => `${target.id}` === `${id}`
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
      },
    }),
    resolveInputHook: async ({ inputData, item, resolvedData, context }) => {
      const relationships: RelationshipInput = inputData?.[relationshipField]
      let orderJSON: OrderJSON =
        inputData?.[orderJSONField] || item?.[orderJSONField] || []

      // Remove disconnected relationships from json
      const disconnect = relationships?.disconnect
      if (Array.isArray(disconnect) && disconnect.length > 0) {
        const ids = disconnect.map(({ id }) => id)
        orderJSON = orderJSON.filter((item) => !ids.includes(item.id))
      }

      // Append connected relationships to end of json
      const connect = relationships?.connect
      if (Array.isArray(connect) && connect.length > 0) {
        const ids = connect.map(({ id }) => id)
        const items = await context.query[targetType].findMany({
          where: { id: { in: ids } },
          query: `id ${config.refField}`,
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
    },
  }
}
