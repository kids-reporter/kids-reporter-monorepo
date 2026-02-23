import { list } from '@keystone-6/core'
import {
  checkbox,
  integer,
  relationship,
  text,
  timestamp,
} from '@keystone-6/core/fields'

import type { ListType } from '../types/keystone-list-types'
import { allowRoles, RoleEnum } from './utils/access-control-list'
import {
  makeMemberOwnedFilter,
  memberOwnedOperationAccess,
} from './utils/member-owned-access'

const memberFieldName = 'member'

const operationAccessControl = memberOwnedOperationAccess
const filterAccessControl = makeMemberOwnedFilter(memberFieldName)

export default list<ListType<'PostChoiceAnswer'>>({
  fields: {
    question: relationship({
      label: '單選題',
      ref: 'PostChoiceQuestion.answers',
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
    choiceIndex: integer({
      label: '作答選項索引',
      validation: { isRequired: true },
    }),
    correct: checkbox({
      label: '是否答對',
      defaultValue: false,
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
      initialColumns: [
        'id',
        'question',
        'member',
        'choiceIndex',
        'correct',
        'compositeKey',
      ],
    },
  },
  db: { idField: { kind: 'autoincrement' } },
  access: {
    operation: {
      query: operationAccessControl,
      create: allowRoles([RoleEnum.Member]),
      update: allowRoles([RoleEnum.Member]),
      delete: operationAccessControl,
    },
    filter: {
      query: filterAccessControl,
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

      const choiceIndex = resolvedData.choiceIndex
      if (typeof choiceIndex === 'number' && choiceIndex >= 0) {
        // find out the choice is correct or not
        const q = await context.sudo().query.PostChoiceQuestion.findOne({
          where: { id: questionId?.toString() },
          query: 'id options',
        })
        const correctIndex = q?.options?.findIndex(
          (o: { isCorrectAnswer: boolean }) => o.isCorrectAnswer === true
        )
        resolvedData.correct = choiceIndex === correctIndex
      }

      return resolvedData
    },
  },
})
