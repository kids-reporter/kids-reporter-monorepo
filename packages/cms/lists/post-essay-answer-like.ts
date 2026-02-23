import { list } from '@keystone-6/core'
import { relationship, text, timestamp } from '@keystone-6/core/fields'
import { GraphQLError } from 'graphql'

import type { ListType } from '../types/keystone-list-types'
import { allowRoles, RoleEnum } from './utils/access-control-list'
import {
  makeMemberOwnedFilter,
  memberOwnedOperationAccess,
} from './utils/member-owned-access'

const memberFieldName = 'member'

const operationAccessControl = memberOwnedOperationAccess
const filterAccessControl = makeMemberOwnedFilter(memberFieldName)

export default list<ListType<'PostEssayAnswerLike'>>({
  fields: {
    answer: relationship({
      label: '思辨題答案',
      ref: 'PostEssayAnswer',
      many: false,
      ui: { hideCreate: true },
    }),
    member: relationship({
      label: '會員',
      ref: 'Member',
      many: false,
      ui: { hideCreate: true },
      graphql: {
        omit: {
          create: true,
        },
      },
    }),
    compositeKey: text({
      label: '唯一鍵',
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
      isIndexed: 'unique',
      db: {
        isNullable: true,
      },
      graphql: {
        omit: {
          create: true,
        },
      },
      access: {
        create: () => false,
        update: () => false,
      },
    }),
    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    updatedAt: timestamp({
      db: { updatedAt: true },
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
  },
  ui: {
    labelField: 'id',
    hideCreate: true,
    createView: {
      defaultFieldMode: 'hidden',
    },
    itemView: {
      defaultFieldMode: 'read',
    },
    listView: {
      initialColumns: ['id', 'answer', 'member'],
    },
  },
  db: { idField: { kind: 'autoincrement' } },
  access: {
    operation: {
      query: operationAccessControl,
      create: allowRoles([RoleEnum.Member]),
      update: () => false,
      delete: operationAccessControl,
    },
    filter: {
      query: filterAccessControl,
      delete: filterAccessControl,
    },
  },
  graphql: {
    omit: {
      update: true,
    },
  },
  hooks: {
    resolveInput: async ({ resolvedData, item, context, operation }) => {
      const answerId = resolvedData.answer?.connect?.id ?? item?.answerId

      const sessionMemberId = context.session?.data?.memberId?.toString()

      if (!sessionMemberId) {
        throw new Error('You must be signed in as a member to submit a like.')
      }

      if (operation === 'create') {
        // connect the answer to the member
        resolvedData.member = {
          connect: {
            id: sessionMemberId,
          },
        }
      }

      if (answerId) {
        resolvedData.compositeKey = `${answerId}:${sessionMemberId}`
      }

      return resolvedData
    },
    afterOperation: async ({ operation, item, originalItem, context }) => {
      const assertExecuteSucceeded = (result: unknown) => {
        // NOTE: Keystone v6 wraps Prisma calls and can return a GraphQLError
        // instead of throwing (see keystonejs/keystone#9250). Until v6 pulls in
        // PR #9476, explicitly detect GraphQLError so the afterOperation surfaces
        // an actionable exception.
        if (result instanceof GraphQLError) {
          const debugInfo = result.extensions?.debug as
            | { message?: string }
            | undefined
          const errorMsg =
            debugInfo?.message?.trim() ??
            `Unknown error during likesCount update (op=${operation}, answerId=${item?.answerId ?? originalItem?.answerId ?? 'n/a'})`

          // TODO: throw and also enqueue a PubSub message to retry computing likesCount.
          throw new Error(
            `Update PostEssayAnswer failed with the following errors: ${errorMsg}`
          )
        }
      }

      const incrementLikesCount = async (answerId?: number | string | null) => {
        if (!answerId) return
        // Atomic row update in Postgres to avoid race conditions on concurrent likes
        const result = await context.prisma
          .$executeRaw`UPDATE "PostEssayAnswer" SET "likesCount" = "likesCount" + 1 WHERE "id" = ${Number(answerId)}`
        assertExecuteSucceeded(result)
      }

      const decrementLikesCount = async (answerId?: number | string | null) => {
        if (!answerId) return
        // Atomic row update in Postgres to avoid race conditions on concurrent unlikes
        const result = await context.prisma
          .$executeRaw`UPDATE "PostEssayAnswer" SET "likesCount" = "likesCount" - 1 WHERE "id" = ${Number(answerId)} AND "likesCount" > 0`
        assertExecuteSucceeded(result)
      }

      if (operation === 'create') {
        await incrementLikesCount(item?.answerId)
        return
      }

      if (operation === 'delete') {
        await decrementLikesCount(originalItem?.answerId)
        return
      }
    },
  },
})
