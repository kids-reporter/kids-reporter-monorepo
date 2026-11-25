import { list } from '@keystone-6/core'
import { json, relationship, text, timestamp } from '@keystone-6/core/fields'

import type { ListType } from '../types/keystone-list-types'
import {
  allowAllRoles,
  allowRoles,
  RoleEnum,
} from './utils/access-control-list'

const operationAccessControl = allowRoles([
  RoleEnum.Editor,
  RoleEnum.Admin,
  RoleEnum.Owner,
])

export default list<ListType<'PostChoiceQuestion'>>({
  fields: {
    post: relationship({
      label: '文章',
      ref: 'Post.postChoiceQuestions',
      many: false,
      ui: {
        hideCreate: true,
      },
    }),
    answers: relationship({
      label: '答案',
      ref: 'PostChoiceAnswer.question',
      many: true,
      ui: {
        hideCreate: true,
      },
    }),
    title: text({
      label: '題目標題',
      validation: { isRequired: true },
      ui: { displayMode: 'textarea' },
    }),
    // Consolidated JSON: [{ content: string, isCorrectAnswer: boolean }]
    options: json({
      label: '選項設定',
      defaultValue: [],
      ui: {
        views: './lists/views/post-choice-question-options-editor.tsx',
      },
    }),
    reason: text({
      label: '原因',
    }),
    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        listView: { fieldMode: 'read' },
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
  hooks: {
    validateInput: async ({ resolvedData, item, addValidationError }) => {
      const options = resolvedData.options ?? item?.options
      if (!Array.isArray(options)) {
        addValidationError('options should be an array')
        return
      }

      const invalid = options.some((o) => {
        return typeof o?.content !== 'string' || o?.content?.trim() === ''
      })
      if (invalid) {
        addValidationError('option.content should be a string')
      }

      const correctCount = options.filter(
        (o) => o?.isCorrectAnswer === true
      ).length
      // Validate option objects
      if (correctCount !== 1) {
        addValidationError('One and only one correct answer is required.')
      }
    },
  },
})
