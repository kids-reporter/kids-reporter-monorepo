import envVars from '../environment-variables'
import { RawDraftContentState } from 'draft-js'
import { KeystoneContext } from '@keystone-6/core/types'
import {
  customFields,
  richTextEditorButtonNames,
} from '@kids-reporter/cms-core'
import { graphql, list, group } from '@keystone-6/core'
import {
  virtual,
  relationship,
  text,
  select,
  timestamp,
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
import { algoliasearch } from 'algoliasearch'
import {
  topicIndexName,
  getTopicObjectID,
  convertDraftToText,
  splitText,
} from './utils/algolia'
import errors from '@twreporter/errors'

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

const listConfigurations = list({
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
    filter: {
      query: ({ session }) => {
        if (envVars.nodeEnv === 'test') {
          return {}
        }

        if (session?.data?.role === RoleEnum.FrontendHeadlessAccount) {
          return { status: { equals: 'published' } }
        }
        return {}
      },
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
    afterOperation: async ({
      inputData,
      item,
      operation,
      originalItem,
      context,
    }) => {
      if (!envVars.enableAlgoliaFeatureToggle) {
        return
      }

      try {
        const indexName = topicIndexName
        const client = algoliasearch(
          envVars.algolia.appID,
          envVars.algolia.apiKey
        )

        const topicID = item
          ? `topic-${item.id.toString()}`
          : `topic-${originalItem.id.toString()}`

        // Topic is deleted or not published any more.
        // Delete indexes on Algolia.
        if (
          operation === 'delete' ||
          (item?.status !== 'published' && originalItem?.status === 'published')
        ) {
          try {
            await client.deleteBy({
              indexName,
              deleteByParams: {
                filters: `topicID:${topicID}`,
              },
            })
          } catch (_error) {
            const error = errors.helpers.wrap(
              _error,
              'Project.hooks.afterOperation error',
              'Error to delete Algolia indexes.',
              { topicID, indexName }
            )
            throw error
          }

          return
        }

        // There is no need to index the topic.
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
          'heroImage',
        ]

        const shouldPartialUpdate = _fieldNames.find((fieldName) => {
          return Object.prototype.hasOwnProperty.call(inputData, fieldName)
        })

        if (
          !shouldPartialUpdate &&
          !inputData?.content &&
          !inputData?.credits
        ) {
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
                filters: `topicID:${topicID}`,
              },
            ],
          })
        } catch (_error) {
          const error = errors.helpers.wrap(
            _error,
            'Project.hooks.afterOperation error',
            'Error to search records in Algolia.',
            { indexName, topicID }
          )
          throw error
        }

        // @ts-ignore Not sure why `res.results` is `SearchForFacetValuesResponse` type, rather than `SearchResponse` type
        const hits = res.results?.[0]?.hits

        const shouldReindexOrBuildIndexFromScratch =
          hits?.length === 0 || inputData.credits || inputData.content

        const heroImageSrc = await getHeroImage(item.id.toString(), context)

        if (shouldReindexOrBuildIndexFromScratch) {
          if (hits?.length > 0) {
            // Delete old indexes
            await client.deleteBy({
              indexName,
              deleteByParams: {
                filters: `topicID:${topicID}`,
              },
            })
          }

          // Create records from `item`.
          const newRecord = prepareTopicRecord(item as FromObject)
          newRecord.imgSrc = heroImageSrc
          const { contentChunks, ...restAttributes } = newRecord

          // Algolia enforces a 10KB limit per record.
          // Split content into smaller chunks to prevent exceeding this limit.
          const objects = contentChunks?.map((chunk, index) => {
            return {
              objectID: getTopicObjectID(
                item.id.toString(),
                (index + 1).toString().padStart(3, '0')
              ),
              topicID: `topic-${item.id.toString()}`,
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
              'Project.hooks.afterOperation error',
              'Error to save objects into Algolia.',
              { topicID, indexName, objects }
            )
            throw error
          }
        }

        // Update only the modified fields of previously indexed records.
        const partialUpdate = prepareTopicRecord(inputData)
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
            'Project.hooks.afterOperation error',
            'Error to partial update indexes in Algolia.',
            { topicID, indexName, objects }
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

async function getHeroImage(
  itemID: string,
  context: KeystoneContext
): Promise<string> {
  const { heroImage } = await context.query.Project.findOne({
    where: {
      id: itemID,
    },
    query: 'heroImage { resized { medium }  }',
  })

  return heroImage?.resized?.medium || ''
}

type TopicRecord = {
  url?: string
  title?: string
  subtitle?: string
  desc?: string
  publishedDate?: string
  publishedTs?: number
  contentChunks?: string[]
  imgSrc?: string
}

type FromObject = {
  slug?: string
  title?: string
  subtitle?: string
  ogDescription?: string
  publishedDate?: string
  content?: RawDraftContentState
  credits?: RawDraftContentState
}

function prepareTopicRecord(fromObject: FromObject): TopicRecord {
  const url = fromObject.slug
    ? `${envVars.kidsWebsiteUrlOrigin}/topic/${fromObject.slug}`
    : undefined
  const title = fromObject.title
  const subtitle = fromObject.subtitle
  const desc = fromObject.ogDescription
  const publishedDate = fromObject.publishedDate
  let publishedTs: number | undefined = undefined
  if (publishedDate) {
    publishedTs = Math.ceil(new Date(publishedDate).getTime() / 1000)
  }

  let contentText = ''

  if (fromObject.content) {
    contentText += convertDraftToText(fromObject.content || '')
  }

  if (fromObject.credits) {
    contentText = convertDraftToText(fromObject.credits || '')
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

export default listConfigurations
