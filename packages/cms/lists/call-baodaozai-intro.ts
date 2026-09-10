import { list } from '@keystone-6/core'
import { select, text, timestamp } from '@keystone-6/core/fields'

import {
  allowAllRoles,
  allowRoles,
  RoleEnum,
} from './utils/access-control-list'

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export default list({
  fields: {
    page: select({
      type: 'enum',
      options: [
        { label: '首頁', value: 'home' },
        { label: '最新頁', value: 'all' },
        { label: '集合頁-專題', value: 'topics' },
        { label: '集合頁-新聞', value: 'news' },
        { label: '集合頁-多媒體', value: 'storytelling' },
        { label: '集合頁-校園', value: 'campus' },
        { label: '集合頁-Podcast', value: 'listeningNews' },
        { label: '集合頁-教案', value: 'classroom' },
      ],
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),
    content: text(),
    buttonStatus: select({
      label: '按鈕狀態',
      type: 'enum',
      options: [
        { label: '不顯示', value: 'hidden' },
        { label: '自訂按鈕', value: 'custom' },
        { label: '顯示介紹', value: 'showIntro' },
      ],
      defaultValue: 'showIntro',
      validation: { isRequired: true },
    }),
    buttonText: text({
      label: '按鈕文字',
      defaultValue: '開始介紹',
    }),
    buttonUrl: text({
      label: '超連結對象',
      defaultValue: '',
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
      db: {
        updatedAt: true,
      },
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
  },
  access: {
    operation: {
      query: allowAllRoles(),
      create: allowRoles([RoleEnum.Owner, RoleEnum.Admin, RoleEnum.Editor]),
      update: allowRoles([RoleEnum.Owner, RoleEnum.Admin, RoleEnum.Editor]),
      delete: allowRoles([RoleEnum.Owner, RoleEnum.Admin, RoleEnum.Editor]),
    },
  },
  hooks: {
    validateInput: async ({ resolvedData, item, addValidationError }) => {
      const buttonStatus =
        resolvedData.buttonStatus ?? item?.buttonStatus ?? 'showIntro'
      if (buttonStatus === 'custom') {
        const buttonUrl = resolvedData.buttonUrl ?? item?.buttonUrl ?? ''
        if (
          typeof buttonUrl !== 'string' ||
          !isValidHttpUrl(buttonUrl.trim())
        ) {
          addValidationError(
            '超連結對象必須是有效的 http:// 或 https:// 網址（按鈕狀態為「自訂按鈕」時必填）'
          )
        }
      }
      const buttonText = resolvedData.buttonText ?? item?.buttonText ?? ''
      if (
        (buttonStatus === 'custom' || buttonStatus === 'showIntro') &&
        (typeof buttonText !== 'string' || buttonText.trim() === '')
      ) {
        addValidationError('按鈕文字不能為空')
      }
    },
  },
  ui: {
    listView: {
      initialColumns: ['page', 'buttonStatus', 'buttonText', 'content'],
    },
  },
})
