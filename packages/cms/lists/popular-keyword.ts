import { list } from '@keystone-6/core'
import { text, timestamp } from '@keystone-6/core/fields'
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
      initialColumns: ['name'],
      initialSort: { field: 'name', direction: 'ASC' },
    },
  },
})

export default listConfigurations
