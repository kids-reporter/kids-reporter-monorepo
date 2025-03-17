import envVars from '../environment-variables'
import { list } from '@keystone-6/core'
import { relationship, text, timestamp } from '@keystone-6/core/fields'
import {
  allowAllRoles,
  allowRoles,
  RoleEnum,
} from './utils/access-control-list'
import { slugConfig } from './config'
import { algoliasearch } from 'algoliasearch'
import { authorIndexName, getAuthorObjectID } from './utils/algolia'
import errors from '@twreporter/errors'

const listConfigurations = list({
  fields: {
    slug: slugConfig,
    name: text({
      isIndexed: true,
      label: '作者姓名',
      validation: { isRequired: true },
    }),
    email: text(),
    bio: text({
      label: '簡介',
    }),
    avatar: relationship({
      ref: 'Photo',
      many: false,
      label: '大頭照',
    }),
    image: relationship({
      label: 'og:image',
      ref: 'Photo',
    }),
    posts: relationship({
      ref: 'Post.authors',
      many: true,
      label: '相關文章',
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
    label: 'Authors',
  },
  hooks: {
    afterOperation: async ({ operation, item, originalItem, context }) => {
      if (!envVars.enableAlgoliaFeatureToggle) {
        return
      }

      try {
        const indexName = authorIndexName
        const client = algoliasearch(
          envVars.algolia.appID,
          envVars.algolia.apiKey
        )

        const objectID = getAuthorObjectID((item || originalItem).id.toString())

        if (operation === 'delete') {
          try {
            await client.deleteObject({
              indexName,
              objectID,
            })

            return
          } catch (_error) {
            const error = errors.helpers.wrap(
              _error,
              'Author.hooks.afterOperation error',
              'Error to delete Algolia object.',
              { objectID, indexName }
            )
            throw error
          }
        }

        const { avatar, image: ogImage } = await context.query.Author.findOne({
          where: {
            id: item?.id.toString(),
          },
          query: 'avatar { resized { medium } }, image { resized { medium } } ',
        })

        const record = {
          url: `${envVars.kidsWebsiteUrlOrigin}/author/${item?.slug}`,
          name: item?.name,
          email: item?.email,
          bio: item?.bio,
          avatarSrc: avatar?.resized?.medium,
          ogImgSrc: ogImage?.resized?.medium,
        }

        try {
          await client.partialUpdateObject({
            indexName,
            objectID,
            attributesToUpdate: record,
            createIfNotExists: true,
          })
        } catch (_error) {
          const error = errors.helpers.wrap(
            _error,
            'Author.hooks.afterOperation error',
            'Error to partial update an object in Algolia.',
            { indexName, objectID, AttributeToUpdate: record }
          )
          throw error
        }
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

export default listConfigurations
