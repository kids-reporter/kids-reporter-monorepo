import { list } from '@keystone-6/core'
import { relationship, text, timestamp } from '@keystone-6/core/fields'

import type { ListType } from '../types/keystone-list-types'
import {
  allowAllRoles,
  allowRoles,
  RoleEnum,
} from './utils/access-control-list'

const operationAccessControl = allowRoles([
  RoleEnum.Admin,
  RoleEnum.Owner,
  RoleEnum.Editor,
])

export default list<ListType<'PostEssayQuestion'>>({
  fields: {
    post: relationship({
      label: '文章',
      ref: 'Post.postEssayQuestions',
      many: false,
      ui: {
        hideCreate: true,
      },
    }),
    title: text({
      label: '題目標題',
      validation: {
        isRequired: true,
      },
      ui: { displayMode: 'textarea' },
    }),
    answers: relationship({
      label: '答案',
      ref: 'PostEssayAnswer.question',
      many: true,
      ui: {
        hideCreate: true,
      },
    }),
    hint: text({
      label: '提示',
    }),
    createdAt: timestamp({
      defaultValue: {
        kind: 'now',
      },
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        listView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'hidden',
        },
      },
    }),
    updatedAt: timestamp({
      db: { updatedAt: true },
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'read' },
        itemView: { fieldMode: 'read' },
      },
    }),
  },
  ui: {
    labelField: 'title',
    listView: { initialColumns: ['post', 'title'] },
  },
  db: { idField: { kind: 'autoincrement' } },
  access: {
    operation: {
      query: allowAllRoles(),
      create: operationAccessControl,
      update: operationAccessControl,
      delete: operationAccessControl,
    },
  },
  hooks: {},
})
