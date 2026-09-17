import { graphql, list } from '@keystone-6/core'
import {
  checkbox,
  password,
  select,
  text,
  timestamp,
  virtual,
} from '@keystone-6/core/fields'
import type { ListConfig } from '@keystone-6/core/types'

import {
  allowAllRoles,
  allowRoles,
  RoleEnum,
} from './utils/access-control-list'
const listConfigurations: ListConfig<any> = list({
  fields: {
    name: text({
      label: '姓名',
      validation: { isRequired: true },
    }),
    email: text({
      label: 'Email',
      validation: { isRequired: true },
      isIndexed: 'unique',
      isFilterable: true,
    }),
    password: password({
      label: '密碼',
      validation: { isRequired: true },
    }),
    role: select({
      label: '角色權限',
      type: 'string',
      options: [
        {
          label: RoleEnum.Owner,
          value: RoleEnum.Owner,
        },
        {
          label: RoleEnum.Admin,
          value: RoleEnum.Admin,
        },
        {
          label: RoleEnum.Developer,
          value: RoleEnum.Developer,
        },
        {
          label: RoleEnum.Editor,
          value: RoleEnum.Editor,
        },
        {
          label: RoleEnum.Contributor,
          value: RoleEnum.Contributor,
        },
        {
          label: RoleEnum.Preview,
          value: RoleEnum.Preview,
        },
        {
          label: RoleEnum.CronjobHeadlessAccount,
          value: RoleEnum.CronjobHeadlessAccount,
        },
      ],
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
    twoFactorAuthBypass: checkbox({
      defaultValue: false,
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    twoFactorAuthSecret: text({
      db: {
        isNullable: true,
      },
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    twoFactorAuthTemp: text({
      db: {
        isNullable: true,
      },
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    twoFactorAuth: virtual({
      field: graphql.field({
        type: graphql.JSON,
        async resolve(item: any, args: any, context: any) {
          const user = await context.query.User.findOne({
            where: { id: item.id.toString() },
            query: 'id twoFactorAuthSecret twoFactorAuthBypass',
          })
          const twoFAIsSet =
            user.twoFactorAuthSecret && user.twoFactorAuthSecret.length
              ? true
              : false
          return {
            bypass: user.twoFactorAuthBypass,
            set: twoFAIsSet,
            id: user.id,
          }
        },
      }),
      ui: {
        views: './lists/views/two-fa-status',
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'read',
        },
        listView: {
          fieldMode: 'hidden',
        },
      },
    }),
  },
  ui: {
    listView: {
      initialColumns: ['name', 'role'],
    },
  },
  access: {
    operation: {
      query: allowAllRoles(),
      create: allowRoles([RoleEnum.Owner, RoleEnum.Admin]),
      update: allowAllRoles(),
      delete: allowRoles([RoleEnum.Owner, RoleEnum.Admin]),
    },
    item: {
      update: ({ session, inputData, item }) => {
        const userRole = session?.data?.role
        const userEmail = session?.data?.email

        // only owner and admin roles can update the items without further checking
        if ([RoleEnum.Owner, RoleEnum.Admin].indexOf(userRole) > -1) {
          return true
        }

        if (
          // session user updates her/his password
          item?.email === userEmail &&
          // `inputData` only contains `password` property
          Object.keys(inputData).length === 1 &&
          inputData?.password
        ) {
          return true
        }

        return false
      },
    },
  },
  hooks: {},
})

export default listConfigurations
