import envVars from '../environment-variables'
import { KeystoneContext } from '@keystone-6/core/types'
import {
  customFields,
  richTextEditorButtonNames,
} from '@kids-reporter/cms-core'
import { graphql, list, group } from '@keystone-6/core'
import {
  json,
  virtual,
  relationship,
  timestamp,
  text,
  select,
} from '@keystone-6/core/fields'
import {
  allowAllRoles,
  allowRoles,
  RoleEnum,
} from './utils/access-control-list'
import relationshipUtil, {
  OrderedRelationshipConfig,
} from './utils/manual-order-relationship'
import { slugConfig } from './config'
import { RawDraftContentState } from 'draft-js'
import { algoliasearch } from 'algoliasearch'
import {
  articleIndexName,
  getArticleObjectID,
  getAuthorObjectID,
} from './utils/algolia'
import errors from '@twreporter/errors'

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
        searchTWReporterRelatedPosts: virtual({
          label: '搜尋 - 複製後貼入下方[新增與排序]之文字欄',
          field: () =>
            graphql.field({
              type: graphql.JSON,
              async resolve(item: Record<string, any>, args, context) {
                const postID = item?.id
                const post = await context.query.Post.findOne({
                  where: { id: postID },
                  query: 'id, tagsOrderJson',
                })
                return {
                  tags: post.tagsOrderJson,
                  twreporterID: envVars.twreporterID,
                  searchAPIKey: envVars.searchAPIKey,
                }
              },
            }),
          ui: {
            views: './lists/views/search-related-posts',
            createView: {
              fieldMode: 'hidden',
            },
            itemView: {
              fieldMode: 'edit',
            },
            listView: {
              fieldMode: 'hidden',
            },
          },
        }),
        TWReporterRelatedPostsJSON: json({
          label: '新增與排序',
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

const isChatGPTSummaryEnabled = true
const summaryFieldConfig = isChatGPTSummaryEnabled
  ? {
      summary: virtual({
        field: () =>
          graphql.field({
            type: graphql.JSON,
            async resolve(item: Record<string, any>, args, context) {
              const postID = item?.id
              const post = await context.query.Post.findOne({
                where: { id: postID },
                query: 'id, content',
              })
              return {
                label: '生成內容',
                content: post.content,
                openAIKey: envVars.openAIKey,
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
      }),
    }
  : {}
const multipleChoiceQuestionsFieldConfig = isChatGPTSummaryEnabled
  ? group({
      label: '選擇題組',
      fields: {
        aiSuggestion: virtual({
          field: () =>
            graphql.field({
              type: graphql.JSON,
              async resolve(item: Record<string, any>, args, context) {
                const postID = item?.id
                const post = await context.query.Post.findOne({
                  where: { id: postID },
                  query: 'id, content',
                })
                return {
                  label: 'AI助理生成',
                  content: post.content,
                  openAIKey: envVars.openAIKey,
                }
              },
            }),
          ui: {
            views: './lists/views/ai-suggestion-multiple-choice',
            createView: {
              fieldMode: 'hidden',
            },
            itemView: {
              fieldMode: 'edit',
            },
            listView: {
              fieldMode: 'hidden',
            },
          },
        }),
        multipleChoiceQuestionsJSON: json({
          label: '選擇題',
          defaultValue: [],
          ui: {
            views: './lists/views/multiple-choice-questions',
            createView: { fieldMode: 'hidden' },
            itemView: { fieldMode: 'edit' },
            listView: { fieldMode: 'hidden' },
          },
        }),
      },
    })
  : {}
const essayQuestionsFieldConfig = isChatGPTSummaryEnabled
  ? group({
      label: '思辨題組',
      fields: {
        aiEssaySuggestion: virtual({
          field: () =>
            graphql.field({
              type: graphql.JSON,
              async resolve(item: Record<string, any>, args, context) {
                const postID = item?.id
                const post = await context.query.Post.findOne({
                  where: { id: postID },
                  query: 'id, content',
                })
                return {
                  label: 'AI助理生成',
                  content: post.content,
                  openAIKey: envVars.openAIKey,
                }
              },
            }),
          ui: {
            views: './lists/views/ai-suggestion-essay',
            createView: {
              fieldMode: 'hidden',
            },
            itemView: {
              fieldMode: 'edit',
            },
            listView: {
              fieldMode: 'hidden',
            },
          },
        }),
        essayQuestionsJSON: json({
          label: '思辨題',
          defaultValue: [],
          ui: {
            views: './lists/views/essay-questions',
            createView: { fieldMode: 'hidden' },
            itemView: { fieldMode: 'edit' },
            listView: { fieldMode: 'hidden' },
          },
        }),
      },
    })
  : {}

const listConfigurations = list({
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
    ...multipleChoiceQuestionsFieldConfig,
    ...essayQuestionsFieldConfig,
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
    ...summaryFieldConfig,
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
    afterOperation: async ({
      operation,
      item,
      inputData,
      originalItem,
      context,
    }) => {
      if (!envVars.enableAlgoliaFeatureToggle) {
        return
      }

      try {
        const indexName = articleIndexName
        const client = algoliasearch(
          envVars.algolia.appID,
          envVars.algolia.apiKey
        )

        const articleID = item
          ? `article-${item.id.toString()}`
          : `article-${originalItem.id.toString()}`

        // Article is deleted or not published any more.
        // Delete indexes on Algolia.
        if (
          operation === 'delete' ||
          (item?.status !== 'published' && originalItem?.status === 'published')
        ) {
          try {
            await client.deleteBy({
              indexName,
              deleteByParams: {
                filters: `articleID:${articleID}`,
              },
            })
          } catch (_error) {
            const error = errors.helpers.wrap(
              _error,
              'Post.hooks.afterOperation error',
              'Error to delete Algolia indexes.',
              { articleID, indexName }
            )
            throw error
          }

          return
        }

        // There is no need to index the article.
        if (item.status !== 'published') {
          // `afterOperation` is done.
          return
        }

        const _fieldNames = [
          'slug',
          'title',
          'subtitle',
          'publishedDate',
          'ogDescription',
          'status',
          'authors',
          'heroImage',
        ]

        const shouldPartialUpdate = _fieldNames.find((fieldName) => {
          return Object.prototype.hasOwnProperty.call(inputData, fieldName)
        })

        if (!shouldPartialUpdate && !inputData?.brief && !inputData?.content) {
          // Data is unchanged; skip updating the index.
          // `afterOperation` is done
          return
        }

        let res

        try {
          res = await client.search({
            requests: [
              {
                indexName,
                query: '',
                // @TODO we need to handle pagination if needed
                hitsPerPage: 1000,
                filters: `articleID:${articleID}`,
              },
            ],
          })
        } catch (_error) {
          const error = errors.helpers.wrap(
            _error,
            'Post.hooks.afterOperation error',
            'Error to search records in Algolia.',
            { indexName, articleID }
          )
          throw error
        }

        // @ts-ignore Not sure why `res.results` is `SearchForFacetValuesResponse` type, rather than `SearchResponse` type
        const hits = res.results?.[0]?.hits

        const shouldReindexOrBuildIndexFromScratch =
          hits?.length === 0 || inputData.brief || inputData.content

        const authors = await getAuthors(item.id.toString(), context)
        const heroImageSrc = await getHeroImage(item.id.toString(), context)

        if (shouldReindexOrBuildIndexFromScratch) {
          if (hits?.length > 0) {
            // Delete old indexes
            await client.deleteBy({
              indexName,
              deleteByParams: {
                filters: `articleID:${articleID}`,
              },
            })
          }

          // Create records from `item`.
          const newRecord = prepareArticleRecord(item)
          newRecord.authorIDs = authors?.map((author) =>
            getAuthorObjectID(author.id)
          )
          newRecord.authorNames = authors?.map((author) => author.name)
          newRecord.imgSrc = heroImageSrc
          const { contentChunks, ...restAttributes } = newRecord

          // Algolia enforces a 10KB limit per record.
          // Split content into smaller chunks to prevent exceeding this limit.
          const objects = contentChunks?.map((chunk, index) => {
            return {
              objectID: getArticleObjectID(
                item.id.toString(),
                index.toString().padStart(3, '0')
              ),
              articleID: `article-${item.id.toString()}`,
              type: 'article',
              content: chunk,
              ...restAttributes,
            }
          })

          try {
            if (objects) {
              await client.saveObjects({
                indexName,
                objects,
              })
            }
          } catch (_error) {
            const error = errors.helpers.wrap(
              _error,
              'Post.hooks.afterOperation error',
              'Error to save objects into Algolia.',
              { articleID, indexName, objects }
            )
            throw error
          }
        }

        // Update only the modified fields of previously indexed records.
        const partialUpdate = prepareArticleRecord(inputData)
        if (inputData.authors) {
          partialUpdate.authorIDs = authors?.map((author) =>
            getAuthorObjectID(author.id)
          )
          partialUpdate.authorNames = authors?.map((author) => author.name)
        }
        if (inputData.heroImage) {
          partialUpdate.imgSrc = heroImageSrc
        }
        const { contentChunks, ...restUpdates } = partialUpdate // eslint-disable-line
        const objects = hits?.map((hit: { objectID: string }) => {
          return {
            objectID: hit.objectID,
            ...restUpdates,
          }
        })
        try {
          await client.partialUpdateObjects({
            indexName,
            objects,
          })
        } catch (_error) {
          const error = errors.helpers.wrap(
            _error,
            'Post.hooks.afterOperation error',
            'Error to partial update indexes in Algolia.',
            { articleID, indexName, objects }
          )
          throw error
        }

        // `afterOperation` is done
        return
      } catch (error) {
        console.log(
          JSON.stringify({
            severity: 'ERROR',
            message: errors.helpers.printAll(error, {
              withStack: true,
              withPayload: true,
            }),
          })
        )
        throw error
      }
    },
  },
})

type ArticleRecord = {
  url: string
  title: string
  subtitle?: string
  desc?: string
  publishedDate?: string
  publishedTs?: number
  contentChunks?: string[]
  authorNames?: string[]
  authorIDs?: string[]
  imgSrc?: string
}

function prepareArticleRecord(
  fromObject: Record<string, unknown>
): ArticleRecord {
  const url = `${envVars.kidsWebsiteUrlOrigin}/article/${fromObject.slug}`
  const title = fromObject.title as string
  const subtitle = fromObject.subtitle as string
  const desc = fromObject.ogDescription as string
  const publishedDate = fromObject.publishedDate as string
  let publishedTs: number | undefined = undefined
  if (publishedDate) {
    publishedTs = Math.ceil(new Date(publishedDate as string).getTime() / 1000)
  }

  let contentText = ''

  if (fromObject.brief) {
    contentText = convertDraftToText(
      (fromObject.brief as RawDraftContentState) || ''
    )
  }

  if (fromObject.content) {
    contentText += convertDraftToText(
      (fromObject.content as RawDraftContentState) || ''
    )
  }

  const contentChunks = splitText(contentText)

  return {
    url,
    title,
    subtitle,
    desc,
    publishedDate,
    publishedTs,
    contentChunks,
  }
}

async function getAuthors(
  postID: string,
  context: KeystoneContext
): Promise<{ id: string; name: string }[]> {
  const { authors } = await context.query.Post.findOne({
    where: {
      id: postID,
    },
    query: 'authors { id, name }',
  })

  return authors
}

async function getHeroImage(
  postID: string,
  context: KeystoneContext
): Promise<string> {
  const { heroImage } = await context.query.Post.findOne({
    where: {
      id: postID,
    },
    query: 'heroImage { resized { medium }  }',
  })

  return heroImage?.resized?.medium || ''
}

// Extract texts from draftjs object.
function convertDraftToText(draftRawData?: RawDraftContentState) {
  const blocks = draftRawData?.blocks || []
  const entityMap = draftRawData?.entityMap || {}

  const contentText: string[] = []

  blocks.forEach((block) => {
    let text = block.text || ''

    // convert inline entity, such as ANNOTATION entity
    if (block.entityRanges && block.entityRanges.length > 0) {
      //  + entity
      let resultText = ''
      let lastOffset = 0

      block.entityRanges.forEach(({ offset, length, key }) => {
        const entity = entityMap[key]
        if (!entity) {
          return
        }

        // Append plain text before the entity
        resultText += text.slice(lastOffset, offset)

        // Get the text covered by the entity
        const entityText = text.slice(offset, offset + length)

        if (entity.type === 'ANNOTATION') {
          const rawContentState = entity.data?.rawContentState
          const _text = convertDraftToText(rawContentState)
          resultText += `${entityText} (${_text})`
        } else {
          // If it's an unknown entity type, keep the text as is
          resultText += entityText
        }

        lastOffset = offset + length
      })

      // Move the cursor forward
      resultText += text.slice(lastOffset)

      text = resultText
    }

    // ----- Handle Atomic Blocks -----
    if (block.type === 'atomic') {
      const entityKey =
        block.entityRanges.length > 0 ? block.entityRanges[0].key : null
      const entity = entityKey !== null ? entityMap[entityKey] : null

      if (entity) {
        const entityType = entity.type.toUpperCase()

        // Convert atomic blocks into plain text descriptions
        switch (entityType) {
          case 'INFOBOX': {
            const rawContentState = entity.data?.rawContentState
            text = convertDraftToText(rawContentState)
            break
          }
          case 'BLOCKQUOTE': {
            text = entity.data?.text
            break
          }
        }
      }
    }

    contentText.push(text)
  })

  return contentText.join('\n')
}

// split long text into different chunks
function splitText(text: string, maxChars = 1500) {
  // separate long text into paragraphs
  const paragraphs = text
    .split(/\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)

  const chunks: string[] = []
  let currentChunk = ''

  paragraphs.forEach((paragraph) => {
    // if the length of currentChunk + paragraph is less than maxChars,
    // and then concat currentChunk and paragraph
    if ((currentChunk + paragraph).length <= maxChars) {
      currentChunk = currentChunk + paragraph
    } else {
      // otherwise, push currentChunk into chunks
      if (currentChunk) {
        chunks.push(currentChunk)
      }
      currentChunk = paragraph
    }
  })

  // push the last one currentChunk
  if (currentChunk) {
    chunks.push(currentChunk)
  }

  return chunks
}

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
