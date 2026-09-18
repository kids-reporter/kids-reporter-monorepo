import { graphql, group, list } from '@keystone-6/core'
import {
  relationship,
  select,
  text,
  timestamp,
  virtual,
} from '@keystone-6/core/fields'
import type { KeystoneContext, ListConfig } from '@keystone-6/core/types'
import {
  customFields,
  richTextEditorButtonNames,
} from '@kids-reporter/cms-core'

import envVars from '../environment-variables'
import { slugConfig } from './config'
import {
  allowAllRoles,
  allowRoles,
  RoleEnum,
} from './utils/access-control-list'
import relationshipUtil, {
  OrderedRelationshipConfig,
} from './utils/manual-order-relationship'

const relatedPosts: OrderedRelationshipConfig = {
  fieldName: 'relatedPosts',
  relationshipConfig: {
    label: '選取',
    ref: 'Post.projects',
    many: true,
    ui: {
      hideCreate: true,
    },
  },
  refLabelField: 'title',
}

const listConfigurations: ListConfig<any> = list({
  fields: {
    slug: slugConfig,
    title: text({
      validation: { isRequired: true },
      label: '專題標題',
      isIndexed: true,
    }),
    subtitle: text({
      label: '副標',
      validation: { isRequired: false },
    }),
    titlePosition: select({
      defaultValue: 'center',
      options: [
        { label: '正中', value: 'center' },
        { label: '中下', value: 'center-bottom' },
        { label: '左中', value: 'left-center' },
        { label: '左下', value: 'left-bottom' },
      ],
      label: '專題標題位置',
    }),
    status: select({
      isIndexed: true,
      defaultValue: 'draft',
      options: [
        { label: 'draft', value: 'draft' },
        { label: 'published', value: 'published' },
      ],
      label: '狀態',
    }),
    publishedDate: timestamp({
      isIndexed: true,
      label: '發布時間',
    }),
    heroImage: relationship({
      ref: 'Photo',
      label: '首圖',
    }),
    mobileHeroImage: relationship({
      ref: 'Photo',
      label: '手機首圖',
    }),
    content: customFields.richTextEditor({
      label: '前言',
      disabledButtons: [
        richTextEditorButtonNames.code,
        richTextEditorButtonNames.codeBlock,
        richTextEditorButtonNames.h2,
        richTextEditorButtonNames.newsReading,
      ],
    }),
    credits: customFields.richTextEditor({
      label: '團隊成員',
      disabledButtons: [
        richTextEditorButtonNames.annotation,
        richTextEditorButtonNames.blockquote,
        richTextEditorButtonNames.ol,
        richTextEditorButtonNames.ul,
        richTextEditorButtonNames.code,
        richTextEditorButtonNames.codeBlock,
        richTextEditorButtonNames.embed,
        richTextEditorButtonNames.h2,
        richTextEditorButtonNames.h5,
        richTextEditorButtonNames.image,
        richTextEditorButtonNames.infoBox,
        richTextEditorButtonNames.slideshow,
        richTextEditorButtonNames.newsReading,
      ],
      ui: {
        listView: {
          fieldMode: 'hidden',
        },
      },
    }),
    ...group({
      label: '相關文章',
      fields: {
        ...relationshipUtil.relationshipAndExtendedFields(relatedPosts),
      },
    }),
    projectCategories: relationship({
      many: true,
      label: '分類',
      ref: 'ProjectCategory.projects',
      ui: {
        hideCreate: true,
      },
    }),
    tags: relationship({
      ref: 'Tag.projects',
      label: '標籤',
      many: true,
      ui: {
        hideCreate: true,
      },
    }),
    ogTitle: text({
      label: 'og:title',
      validation: { isRequired: false },
    }),
    ogDescription: text({
      label: 'og:description',
      validation: { isRequired: false },
    }),
    ogImage: relationship({
      ref: 'Photo',
      label: 'og:image',
    }),
    createdAt: timestamp({
      defaultValue: { kind: 'now' },
    }),
    updatedAt: timestamp({
      db: {
        updatedAt: true,
      },
    }),
    preview: virtual({
      field: graphql.field({
        type: graphql.JSON,
        resolve(item: Record<string, unknown>): Record<string, string> {
          return {
            href: `${envVars.previewServer.path}/topic/${item.slug}`,
            label: '專題預覽',
            buttonLabel: 'Preview',
          }
        },
      }),
      ui: {
        // A module path that is resolved from where `keystone start` is run
        views: './lists/views/link-button',
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldPosition: 'sidebar',
        },
        listView: {
          fieldMode: 'hidden',
        },
      },
    }),
    onlineUsers: virtual({
      label: 'online user',
      field: graphql.field({
        type: graphql.JSON,
        async resolve(
          item: Record<string, unknown>,
          args,
          context: KeystoneContext
        ) {
          const authenticatedUser = context.session.data
          const userData = {
            id: authenticatedUser.id,
            email: authenticatedUser.email,
            name: authenticatedUser.name,
          }
          return {
            canonicalPath: `/projects/${item.id}`,
            userData: userData,
          }
        },
      }),
      ui: {
        views: './lists/views/online-users',
        createView: { fieldMode: 'hidden' },
        itemView: {
          fieldPosition: 'sidebar',
        },
        listView: { fieldMode: 'hidden' },
      },
    }),
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
  ui: {
    label: 'Topics',
    labelField: 'title',
    listView: {
      initialSort: { field: 'publishedDate', direction: 'DESC' },
      pageSize: 50,
    },
  },
  hooks: {
    resolveInput: async ({ inputData, item, resolvedData, context }) => {
      await relationshipUtil.mutateOrderFieldHook(relatedPosts)({
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
