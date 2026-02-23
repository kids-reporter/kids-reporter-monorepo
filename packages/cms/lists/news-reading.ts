import { list } from '@keystone-6/core'
import { integer, relationship, text, timestamp } from '@keystone-6/core/fields'
import type { ListConfig } from '@keystone-6/core/types'
import sanitizeHtml from 'sanitize-html'

import {
  allowAllRoles,
  allowRoles,
  RoleEnum,
} from './utils/access-control-list'
const NewsReadingGroupItem: ListConfig<any> = list({
  fields: {
    name: text({
      label: '語言類別',
      validation: { isRequired: true },
    }),
    embedCode: text({
      label: 'Spotify Iframe Embed Code',
      validation: { isRequired: true },
      ui: { displayMode: 'textarea' },
    }),
    order: integer({
      label: '排序（由小至大排列）',
      hooks: {
        resolveInput: ({ operation, resolvedData, fieldKey }) => {
          const itemOrder = [
            '中文',
            '烏克蘭語',
            '俄語',
            '英語',
            '日語',
            '印尼語',
            '泰語',
            '越語',
            '菲律賓語',
            '台語',
            '客語',
            '粵語',
            '法語',
          ]
          if (
            // `order` field is not specified
            resolvedData[fieldKey] === undefined &&
            // create a new item
            (operation === 'create' ||
              // update old item's `name` field
              (operation === 'update' && resolvedData['name'] !== undefined))
          ) {
            const itemName = resolvedData['name']
            const idx = itemOrder.indexOf(itemName)
            return idx + 1
          }
          return resolvedData[fieldKey]
        },
      },
    }),
    createdAt: timestamp({
      defaultValue: { kind: 'now' },
    }),
    updatedAt: timestamp({
      db: {
        updatedAt: true,
      },
    }),
  },
  ui: {
    isHidden: true,
    hideCreate: true,
    label: 'News-reading-group-item',
    singular: 'News-reading-group-item',
    plural: 'News-reading-group-items',
  },
  hooks: {
    resolveInput: ({ resolvedData, operation }) => {
      if (
        (operation === 'create' || operation === 'update') &&
        resolvedData.embedCode != null
      ) {
        resolvedData.embedCode = sanitizeHtml(resolvedData.embedCode, {
          allowedTags: ['iframe'],
          allowedAttributes: {
            iframe: [
              'align',
              'allow',
              'fetchpriority',
              'frameborder',
              'allowfullscreen',
              'height',
              'loading',
              'name',
              'referrerpolicy',
              'fullscreen',
              'src',
              'style',
              'title',
              'width',
            ],
          },
        })
      }

      return resolvedData
    },
  },
  access: {
    operation: {
      query: allowAllRoles(),
      create: allowRoles([
        RoleEnum.Owner,
        RoleEnum.Admin,
        RoleEnum.Editor,
        RoleEnum.Contributor,
      ]),
      update: allowRoles([RoleEnum.Owner, RoleEnum.Admin, RoleEnum.Editor]),
      delete: allowRoles([RoleEnum.Owner, RoleEnum.Admin, RoleEnum.Editor]),
    },
  },
})

const NewsReadingGroup: ListConfig<any> = list({
  fields: {
    name: text({
      isIndexed: true,
      label: '讀報主題',
      validation: { isRequired: true },
    }),
    items: relationship({
      label: '語言類別',
      ref: 'NewsReadingGroupItem',
      many: true,
    }),
    createdAt: timestamp({
      defaultValue: { kind: 'now' },
    }),
    updatedAt: timestamp({
      db: {
        updatedAt: true,
      },
    }),
  },
  ui: {
    label: 'News Readings Groups',
    singular: 'News Readings Group',
    plural: 'News Readings Groups',
  },
  access: {
    operation: {
      query: allowAllRoles(),
      create: allowRoles([
        RoleEnum.Owner,
        RoleEnum.Admin,
        RoleEnum.Editor,
        RoleEnum.Contributor,
      ]),
      update: allowRoles([RoleEnum.Owner, RoleEnum.Admin, RoleEnum.Editor]),
      delete: allowRoles([RoleEnum.Owner, RoleEnum.Admin, RoleEnum.Editor]),
    },
  },
})

export { NewsReadingGroup, NewsReadingGroupItem }
