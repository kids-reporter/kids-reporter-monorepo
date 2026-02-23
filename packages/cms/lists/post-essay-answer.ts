import { list } from '@keystone-6/core'
import { integer, relationship, text, timestamp } from '@keystone-6/core/fields'

import type { ListType } from '../types/keystone-list-types'
import { allowRoles, RoleEnum } from './utils/access-control-list'
import {
  makeMemberOwnedFilter,
  memberOwnedOperationAccess,
} from './utils/member-owned-access'

const memberFieldName = 'member'

const operationAccessControl = memberOwnedOperationAccess
const filterAccessControl = makeMemberOwnedFilter(memberFieldName)

export default list<ListType<'PostEssayAnswer'>>({
  fields: {
    question: relationship({
      label: '思辨題',
      ref: 'PostEssayQuestion.answers',
      many: false,
      ui: {
        hideCreate: true,
      },
    }),
    [memberFieldName]: relationship({
      label: '會員',
      ref: 'Member',
      many: false,
      ui: {
        hideCreate: true,
      },
      graphql: {
        omit: {
          create: true,
          update: true,
        },
      },
    }),
    content: text({
      label: '內容',
      validation: { isRequired: true },
    }),
    likesCount: integer({
      label: '按讚數',
      defaultValue: 0,
      db: {
        isNullable: false,
      },
      ui: {
        itemView: { fieldMode: 'read' },
        listView: { fieldMode: 'read' },
        createView: { fieldMode: 'hidden' },
      },
      graphql: {
        omit: {
          create: true,
          update: true,
        },
      },
      access: {
        create: () => false,
        update: () => false,
      },
    }),
    compositeKey: text({
      label: '唯一鍵',
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
      isIndexed: 'unique',
      db: {
        isNullable: true,
      },
      graphql: {
        omit: {
          create: true,
          update: true,
        },
      },
      access: {
        create: () => false,
        update: () => false,
      },
    }),
    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      isIndexed: true,
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
    updatedAt: timestamp({
      db: { updatedAt: true },
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
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
      initialColumns: ['id', 'question', 'member'],
    },
  },
  db: { idField: { kind: 'autoincrement' } },
  access: {
    operation: {
      query: allowRoles([
        RoleEnum.Admin,
        RoleEnum.Member,

        // Frontend needs to list essay answers publicly (read-only).
        RoleEnum.FrontendHeadlessAccount,
      ]),
      create: allowRoles([RoleEnum.Member]),
      update: allowRoles([RoleEnum.Member]),
      delete: operationAccessControl,
    },
    filter: {
      // Do NOT apply member-owned query filter here
      // Frontend must fetch answers across members for listing
      // Warning: ensure sensitive fields are protected via field-level read ACL
      query: undefined,

      update: filterAccessControl,
      delete: filterAccessControl,
    },
  },
  hooks: {
    resolveInput: async ({ resolvedData, item, context, operation }) => {
      const questionId = resolvedData.question?.connect?.id ?? item?.questionId
      const memberId = item?.memberId?.toString()

      const sessionMemberId = context.session?.data?.memberId?.toString()

      if (!sessionMemberId) {
        throw new Error(
          'You must be signed in as a member to submit an answer.'
        )
      }

      if (operation === 'create') {
        // connect the answer to the member
        resolvedData.member = {
          connect: {
            id: sessionMemberId,
          },
        }
      } else if (operation === 'update') {
        if (sessionMemberId !== memberId) {
          throw new Error('You cannot edit the answer for another member.')
        }
      }

      if (questionId) {
        // Use relational question id + member id as uniqueness
        resolvedData.compositeKey = `${questionId}:${sessionMemberId}`
      }

      return resolvedData
    },
  },
})
