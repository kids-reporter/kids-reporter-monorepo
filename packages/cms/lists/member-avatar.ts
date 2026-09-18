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
      create: () => false,
      update: () => false,
      delete: allowRoles([RoleEnum.Admin, RoleEnum.Owner]),
    },
    filter: {
      query: undefined,
      update: undefined,
      delete: () => ({ member: null }),
    },
  },
  graphql: {
    omit: {
      create: true,
      update: true,
    },
  },
})
