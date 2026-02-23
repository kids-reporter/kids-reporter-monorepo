import { list } from '@keystone-6/core'
import { integer, text, timestamp } from '@keystone-6/core/fields'
import type { ListConfig } from '@keystone-6/core/types'

import {
  allowAllRoles,
  allowRoles,
  RoleEnum,
} from './utils/access-control-list'

const listConfigurations: ListConfig<any> = list({
  fields: {
    name: text({
      label: '關鍵字',
      validation: { isRequired: true },
    }),
    order: integer({
      label: '排序（由小至大排列）',
      defaultValue: 0,
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
    listView: {
      initialColumns: ['name', 'order'],
      initialSort: { field: 'order', direction: 'ASC' },
    },
  },
})

export default listConfigurations
