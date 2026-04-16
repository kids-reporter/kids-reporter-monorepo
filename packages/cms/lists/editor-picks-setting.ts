import { group, list, ListConfig } from '@keystone-6/core'
import { relationship, text, timestamp } from '@keystone-6/core/fields'

import {
  allowAllRoles,
  allowRoles,
  RoleEnum,
} from './utils/access-control-list'
import relationshipUtil, {
  OrderedRelationshipConfig,
} from './utils/manual-order-relationship'

const editorPicksOfPosts: OrderedRelationshipConfig = {
  fieldName: 'editorPicksOfPosts',
  relationshipConfig: {
    label: '選取',
    ref: 'Post',
    many: true,
  },
  refLabelField: 'title',
}

const popularKeywords: OrderedRelationshipConfig = {
  fieldName: 'popularKeywords',
  relationshipConfig: {
    label: '選取',
    ref: 'PopularKeyword',
    many: true,
  },
  refLabelField: 'name',
}

const listConfigurations: ListConfig<any> = list({
  fields: {
    name: text({
      isIndexed: 'unique',
      label: '設定適用範圍（英文）',
      validation: { isRequired: true },
      access: {
        update: () => false,
      },
    }),
    nameForCMS: text({
      label: '設定適用範圍（中文）',
      validation: { isRequired: true },
    }),
    ...group({
      label: '精選文章',
      description: '首頁按順序呈現精選文章5篇',
      fields: {
        ...relationshipUtil.relationshipAndExtendedFields(editorPicksOfPosts),
      },
    }),
    ...group({
      label: '熱門關鍵字',
      description: 'Header 搜尋建議：可自訂顯示與順序',
      fields: {
        ...relationshipUtil.relationshipAndExtendedFields(popularKeywords),
      },
    }),
    editorPicksOfProjects: relationship({
      label: '精選專題',
      ref: 'Project',
      many: true,
    }),
    editorPicksOfTags: relationship({
      label: '精選標籤',
      ref: 'Tag',
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
  access: {
    operation: {
      query: allowAllRoles(),
      create: allowRoles([RoleEnum.Owner, RoleEnum.Admin, RoleEnum.Editor]),
      update: allowRoles([RoleEnum.Owner, RoleEnum.Admin, RoleEnum.Editor]),
      delete: allowRoles([RoleEnum.Owner, RoleEnum.Admin, RoleEnum.Editor]),
    },
  },
  ui: {
    label: 'Editor Picks',
    singular: 'Editor Pick',
    plural: 'Editor Picks',
    listView: {
      initialColumns: ['nameForCMS', 'name'],
    },
  },
  hooks: {
    resolveInput: async ({ inputData, item, resolvedData, context }) => {
      await relationshipUtil.mutateOrderFieldHook(editorPicksOfPosts)({
        inputData,
        item,
        resolvedData,
        context,
      })
      await relationshipUtil.mutateOrderFieldHook(popularKeywords)({
        inputData,
        item,
        resolvedData,
        context,
      })
      return resolvedData
    },
  },
})

export default listConfigurations
