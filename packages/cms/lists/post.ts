import { graphql, group, list } from '@keystone-6/core'
import {
  checkbox,
  json,
  relationship,
  select,
  text,
  timestamp,
  virtual,
} from '@keystone-6/core/fields'
import { KeystoneContext, ListConfig } from '@keystone-6/core/types'
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

const subSubcategories: OrderedRelationshipConfig = {
  fieldName: 'subSubcategories',
  relationshipConfig: {
    label: '選取',
    ref: 'SubSubcategory.relatedPosts',
    many: true,
    ui: {
      hideCreate: true,
    },
  },
  refLabelField: 'nameForCMS',
}

const tags: OrderedRelationshipConfig = {
  fieldName: 'tags',
  relationshipConfig: {
    label: '選取',
    ref: 'Tag.posts',
    many: true,
  },
  refLabelField: 'name',
}

const relatedPosts: OrderedRelationshipConfig = {
  fieldName: 'relatedPosts',
  relationshipConfig: {
    label: '選取',
    ref: 'Post',
    many: true,
    ui: {
      hideCreate: true,
    },
  },
  refLabelField: 'title',
}

const isTWReporterRelatedPostsEnabled = true
const TWReporterRelatedPostsConfig = isTWReporterRelatedPostsEnabled
  ? group({
      label: '報導者相關文章',
      fields: {
        TWReporterRelatedPostsJSON: json({
          label: '相關文章管理',
          defaultValue: [],
          ui: {
            views: './lists/views/twreporter-related-posts',
            createView: { fieldMode: 'hidden' },
            listView: { fieldMode: 'hidden' },
            itemView: { fieldMode: 'edit' },
          },
        }),
      },
    })
  : {}

const aiDialog = virtual({
  field: () =>
    graphql.field({
      type: graphql.JSON,
      async resolve(item: Record<string, any>) {
        return {
          label: '生成內容',
          content: item.content,
          openAIKey: envVars.openAI.key,
          openAIOrganization: envVars.openAI.organization,
          openAIProject: envVars.openAI.project,
        }
      },
    }),
  ui: {
    views: './lists/views/ai-dialog',
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
})

const listConfigurations: ListConfig<any> = list({
  fields: {
    slug: slugConfig,
    title: text({
      label: '標題',
      validation: { isRequired: true },
      isIndexed: true,
    }),
    subtitle: text({
      label: '副標',
      validation: { isRequired: false },
    }),
    status: select({
      label: '狀態',
      options: [
        { label: '草稿 Draft', value: 'draft' },
        { label: '已發布 Published', value: 'published' },
        { label: '已排程 Scheduled', value: 'scheduled' },
        { label: '隱藏 Invisible', value: 'invisible' },
      ],
      defaultValue: 'draft',
      isIndexed: true,
    }),
    publishedDate: timestamp({
      isIndexed: true,
      label: '發布時間',
    }),
    mainProject: relationship({
      label: '文章所屬的主要專題（選擇後，文章最頂端會有該專題的按鈕）',
      ref: 'Project',
      many: false,
      ui: {
        hideCreate: true,
      },
    }),
    ...group({
      label: '次次分類',
      fields: {
        ...relationshipUtil.relationshipAndExtendedFields(subSubcategories),
      },
    }),
    authors: relationship({
      ref: 'Author.posts',
      many: true,
      label: '作者',
      ui: {
        hideCreate: true,
      },
    }),
    authorsJSON: json({
      label: '作者列',
      defaultValue: [],
      ui: {
        views: './lists/views/authorsJSON-editor',
        createView: { fieldMode: 'edit' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'edit' },
      },
    }),
    heroImage: relationship({
      label: '首圖',
      ref: 'Photo',
    }),
    heroCaption: text({
      label: '首圖圖說',
      validation: { isRequired: false },
    }),
    newsReadingGroup: relationship({
      label: '讀報',
      ref: 'NewsReadingGroup',
      many: false,
    }),
    brief: customFields.richTextEditor({
      label: '前言',
      disabledButtons: [
        richTextEditorButtonNames.blockquote,
        richTextEditorButtonNames.code,
        richTextEditorButtonNames.codeBlock,
        richTextEditorButtonNames.embed,
        richTextEditorButtonNames.h2,
        richTextEditorButtonNames.h3,
        richTextEditorButtonNames.h4,
        richTextEditorButtonNames.h5,
        richTextEditorButtonNames.image,
        richTextEditorButtonNames.imageLink,
        richTextEditorButtonNames.infoBox,
        richTextEditorButtonNames.slideshow,
        richTextEditorButtonNames.newsReading,
        richTextEditorButtonNames.divider,
        richTextEditorButtonNames.tocAnchor,
        richTextEditorButtonNames.anchor,
      ],
      ui: {
        listView: {
          fieldMode: 'hidden',
        },
      },
    }),
    content: customFields.richTextEditor({
      label: '內文',
      disabledButtons: [
        richTextEditorButtonNames.h2,
        richTextEditorButtonNames.code,
        richTextEditorButtonNames.codeBlock,
        richTextEditorButtonNames.newsReading,
      ],
      ui: {
        listView: {
          fieldMode: 'hidden',
        },
      },
    }),
    projects: relationship({
      label: '專題',
      ref: 'Project.relatedPosts',
      many: true,
      ui: {
        hideCreate: true,
      },
    }),
    ...group({
      label: '標籤',
      fields: {
        ...relationshipUtil.relationshipAndExtendedFields(tags),
      },
    }),
    ...group({
      label: '相關文章',
      fields: {
        ...relationshipUtil.relationshipAndExtendedFields(relatedPosts),
      },
    }),
    ...TWReporterRelatedPostsConfig,
    ogTitle: text({
      validation: { isRequired: false },
      label: 'og:title',
    }),
    ogDescription: text({
      label: 'og:description',
      validation: { isRequired: false },
    }),
    ogImage: relationship({
      label: 'og:image',
      ref: 'Photo',
    }),
    aiDialog,

    opening: text({
      label: '開場白',
      ui: {
        displayMode: 'textarea',
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'edit' },
        listView: { fieldMode: 'hidden' },
      },
    }),
    postChoiceQuestions: relationship({
      label: '單選題（新）',
      ref: 'PostChoiceQuestion.post',
      many: true,
      ui: {
        hideCreate: true,
        displayMode: 'cards',
        cardFields: ['title'],
        linkToItem: true,
        inlineCreate: {
          fields: ['title', 'options', 'reason'],
        },
        inlineEdit: {
          fields: ['title', 'options', 'reason'],
        },
        inlineConnect: true,
      },
    }),
    postEssayQuestions: relationship({
      label: '思辨題（新）',
      ref: 'PostEssayQuestion.post',
      many: true,
      ui: {
        hideCreate: true,
        displayMode: 'cards',
        cardFields: ['title'],
        linkToItem: true,
        inlineCreate: {
          fields: ['title', 'hint'],
        },
        inlineEdit: {
          fields: ['title', 'hint'],
        },
        inlineConnect: true,
      },
    }),
    showBaodaozai: checkbox({
      label: '是否顯示報導仔？',
      defaultValue: false,
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
      db: {
        updatedAt: true,
      },
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    createdBy: relationship({
      ref: 'User',
      many: false,
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    updatedBy: relationship({
      ref: 'User',
      many: false,
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    createdLog: virtual({
      field: () =>
        graphql.field({
          type: graphql.JSON,
          async resolve(item: Record<string, any>, args, context) {
            const userId = item?.createdById
            const user = await context.query.User.findOne({
              where: { id: userId },
              query: 'id, name, email',
            })

            return {
              href: `/users/${user.id}`,
              label: '最初建立',
              buttonLabel: `${user.name} (${
                user.email
              }) @ ${item.createdAt.toLocaleString('zh-TW', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                hour12: false,
                minute: '2-digit',
                second: '2-digit',
              })}`,
            }
          },
        }),
      ui: {
        views: './lists/views/link-button',
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'read' },
        itemView: { fieldMode: 'read' },
      },
    }),
    updatedLog: virtual({
      field: () =>
        graphql.field({
          type: graphql.JSON,
          async resolve(item: Record<string, any>, args, context) {
            const userId = item?.updatedById
            const user = await context.query.User.findOne({
              where: { id: userId },
              query: 'id, name, email',
            })

            return {
              href: `/users/${user.id}`,
              label: '最後更新',
              buttonLabel: `${user.name} (${
                user.email
              }) @ ${item.updatedAt.toLocaleString('zh-TW', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                hour12: false,
                minute: '2-digit',
                second: '2-digit',
              })}`,
            }
          },
        }),
      ui: {
        views: './lists/views/link-button',
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'read' },
        itemView: { fieldMode: 'read' },
      },
    }),
    preview: virtual({
      field: graphql.field({
        type: graphql.JSON,
        resolve(item: Record<string, unknown>): Record<string, string> {
          return {
            href: `${envVars.previewServer.path}/article/${item.slug}`,
            label: '文章預覽',
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
    listPreview: virtual({
      label: '預覽',
      field: graphql.field({
        type: graphql.String,
        resolve(item: Record<string, unknown>) {
          return `${envVars.previewServer.path}/article/${item.slug}`
        },
      }),
      ui: {
        views: './lists/views/cell-button',
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'hidden',
        },
        listView: {
          fieldMode: 'read',
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
            canonicalPath: `/posts/${item.id}`,
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
    generateQuestions: virtual({
      field: () =>
        graphql.field({
          type: graphql.JSON,
          async resolve(item: Record<string, any>) {
            return { postId: item.id }
          },
        }),
      ui: {
        views: './lists/views/generate-post-questions',
        createView: { fieldMode: 'hidden' },
        itemView: { fieldPosition: 'sidebar' },
        listView: { fieldMode: 'hidden' },
      },
    }),
    copyPostContent: virtual({
      field: () =>
        graphql.field({
          type: graphql.JSON,
          async resolve(
            item: Record<string, any>,
            args,
            context: KeystoneContext
          ) {
            const post = await context.query.Post.findOne({
              where: { id: item.id },
              query: `
                id
                title
                subtitle
                brief
                content
                ogDescription
                opening
                postChoiceQuestions {
                  title
                  options
                  reason
                }
                postEssayQuestions {
                  title
                  hint
                }
              `,
            })
            return post
          },
        }),
      ui: {
        views: './lists/views/copy-post-content',
        createView: { fieldMode: 'hidden' },
        itemView: { fieldPosition: 'sidebar' },
        listView: { fieldMode: 'hidden' },
      },
      graphql: {
        omit: {
          read: false,
          update: true,
          create: true,
        },
      },
    }),
  },
  ui: {
    label: 'Posts',
    labelField: 'title',
    listView: {
      initialColumns: ['title', 'slug', 'status', 'listPreview'],
      initialSort: { field: 'publishedDate', direction: 'DESC' },
      pageSize: 50,
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
      update: allowRoles([
        RoleEnum.Owner,
        RoleEnum.Admin,
        RoleEnum.Editor,
        RoleEnum.CronjobHeadlessAccount,
      ]),
      delete: allowRoles([RoleEnum.Owner, RoleEnum.Admin, RoleEnum.Editor]),
    },
    filter: {
      query: ({ session }) => {
        if (envVars.nodeEnv === 'test') {
          return {}
        }
        if (session?.data?.role === RoleEnum.FrontendHeadlessAccount) {
          return {
            OR: [
              { status: { equals: 'published' } },
              {
                AND: [
                  { status: { equals: 'scheduled' } },
                  {
                    publishedDate: {
                      lt: `${new Date().toISOString()}`,
                    },
                  },
                ],
              },
            ],
          }
        }
        return {}
      },
    },
  },
  hooks: {
    resolveInput: async ({
      inputData,
      item,
      resolvedData,
      context,
      operation,
    }) => {
      let authorsJSON: AuthorsJSON =
        inputData?.authorsJSON || item?.authorsJSON || []
      authorsJSON = resolveAuthorsJSON(authorsJSON)

      // `authors` is a relationship field.
      // Therefore, `authors` only store author id
      const relationshipAuthors: RelationshipInput = inputData?.authors
      if (relationshipAuthors) {
        const disconnect = relationshipAuthors?.disconnect
        // delete disconnected authors from `authorsJSON`
        if (Array.isArray(disconnect) && disconnect.length > 0) {
          disconnect.forEach(({ id }) => {
            authorsJSON = authorsJSON.filter((item) => {
              // if `item.id` is not existed,
              // which means it is manually added by users,
              // and then we don't filter this item out.
              if (!item.id) {
                return true
              }
              // filter out disconnected item
              return item.id !== id
            })
          })
        }

        // add new connected authors into `authorsJSON`
        const connect = relationshipAuthors?.connect
        if (Array.isArray(connect) && connect.length > 0) {
          const ids = connect.map(({ id }) => id)
          // find author items via gql query
          const items = await context.query.Author.findMany({
            where: { id: { in: ids } },
            query: 'id name',
          })
          items.forEach((item) => {
            authorsJSON.push({
              id: item.id,
              name: item.name,
              type: 'link',
              role: heuristicallyPickRole(item.name),
            })
          })
        }
      }

      const session = context.session
      if (operation === 'create') {
        resolvedData.createdBy = { connect: { id: session.itemId } }
      }
      if (operation === 'update') {
        if (inputData?.onlineUsers) {
          resolvedData.updatedAt = item.updatedAt
        } else {
          resolvedData.updatedBy = { connect: { id: session.itemId } }
        }
      }

      resolvedData.authorsJSON = authorsJSON

      await relationshipUtil.mutateOrderFieldHook(subSubcategories)({
        inputData,
        item,
        resolvedData,
        context,
      })

      await relationshipUtil.mutateOrderFieldHook(tags)({
        inputData,
        item,
        resolvedData,
        context,
      })

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

/**
 * This function is used to resolve field `authorsJSON`.
 * It filters out invalid data and
 * adds missing properties, such as `type`.
 */
function resolveAuthorsJSON(authorsJSON: AuthorsJSON): AuthorsJSON {
  return authorsJSON
    .filter(
      (item) =>
        typeof item === 'object' &&
        typeof item.name === 'string' &&
        typeof item.role === 'string'
    )
    .map((item) => {
      if (item.id) {
        item.type = 'link'
      } else {
        item.type = 'string'
      }
      return item
    })
}

function heuristicallyPickRole(authorName: string): string {
  switch (authorName) {
    case '陳韻如': {
      return '責任編輯'
    }
    case '邱紹雯':
    case '楊惠君': {
      return '核稿'
    }
    case '王家琛':
    case '黃禹禛':
    case '鄭涵文': {
      return '設計'
    }
    default:
      return '文字'
  }
}

type AuthorsJSON = {
  id?: string
  name: string
  type?: 'link' | 'string'
  role: string
}[]

type RelationshipInput =
  | {
      disconnect?: { id: string }[]
      connect?: { id: string }[]
    }
  | undefined

export default listConfigurations
