import { graphql, list } from '@keystone-6/core'
import {
  image,
  relationship,
  text,
  timestamp,
  virtual,
} from '@keystone-6/core/fields'

import config from '../config'
import type { ListType } from '../types/keystone-list-types'
import {
  allowAllRoles,
  allowRoles,
  RoleEnum,
} from './utils/access-control-list'
import { memberOwnedOperationAccess } from './utils/member-owned-access'

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
]

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

const operationAccessControl = memberOwnedOperationAccess
export default list<ListType<'MemberAvatar'>>({
  fields: {
    name: text({
      label: '標題',
      validation: { isRequired: true },
    }),
    imageFile: image({
      storage: 'images',
    }),
    member: relationship({
      ref: 'Member.avatar',
      many: false,
      label: 'Member',
    }),
    fileUrl: virtual({
      field: graphql.field({
        type: graphql.String,
        resolve(item: Record<string, unknown>) {
          const filename = item?.imageFile_id
          if (!filename) {
            return ''
          }

          const extension = item?.imageFile_extension
            ? '.' + item.imageFile_extension
            : ''
          return `${config.googleCloudStorage.origin}/images/${filename}${extension}`
        },
      }),
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
    label: 'Member Avatars',
    listView: {
      initialColumns: ['name'],
      initialSort: { field: 'updatedAt', direction: 'ASC' },
      pageSize: 50,
    },
  },
  access: {
    operation: {
      query: allowAllRoles(),
      create: allowRoles([RoleEnum.Member]),
      update: () => false,
      delete: operationAccessControl,
    },
    filter: {
      query: undefined,
      update: undefined,
      delete: () => ({ member: null }),
    },
  },
  hooks: {
    validateInput: async ({ inputData, addValidationError, operation }) => {
      // Validate file upload on create and update
      if (operation === 'create' || operation === 'update') {
        const imageFile = inputData?.imageFile
        if (imageFile?.upload) {
          // Check file size
          const fileSize = imageFile.upload.size
          if (fileSize && fileSize > MAX_IMAGE_SIZE) {
            addValidationError(
              `Image file size must be under ${MAX_IMAGE_SIZE / 1024 / 1024}MB.`
            )
          }

          // Check file type
          const mimetype = imageFile.upload.mimetype
          if (mimetype && !ALLOWED_IMAGE_TYPES.includes(mimetype)) {
            addValidationError(
              `Only image files are allowed. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`
            )
          }
        }
      }
    },
    resolveInput: async ({ resolvedData, context, operation }) => {
      const sessionMemberId = context.session?.data?.memberId?.toString()

      if (!sessionMemberId) {
        throw new Error(
          'You must be signed in as a member to upload a member avatar.'
        )
      }

      if (operation === 'create') {
        // connect the MemberAvatar record to the current member
        resolvedData.member = {
          connect: {
            id: sessionMemberId,
          },
        }
      }

      return resolvedData
    },
  },
})
