import { list } from '@keystone-6/core'
import { text, timestamp } from '@keystone-6/core/fields'
import { allowRoles, RoleEnum } from './utils/access-control-list'

const operationAccessControl = allowRoles([
  RoleEnum.FrontendHeadlessAccount,
  RoleEnum.Admin,
  RoleEnum.Owner,
])

const filterAccessControl = ({ session }: { session?: any }) => {
  const userRole = session.data.role

  if (userRole === RoleEnum.Admin || userRole === RoleEnum.Owner) {
    return true
  }

  const memberID = session.data?.member?.id
  if (memberID) {
    return { id: { equals: memberID } }
  }

  return false
}

const listConfigurations = list({
  fields: {
    name: text({
      label: '稱呼',
    }),
    email: text({
      label: 'Email',
      isIndexed: true,
    }),
    twreporter_user_id: text({
      label: 'membership_user.users.id',
      validation: { isRequired: true },
      isIndexed: 'unique',
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
    listView: {
      initialColumns: ['id', 'name', 'email'],
    },
  },
  db: {
    idField: {
      kind: 'cuid',
    },
  },
  access: {
    operation: {
      query: operationAccessControl,
      create: operationAccessControl,
      update: operationAccessControl,
      delete: operationAccessControl,
    },
    filter: {
      query: filterAccessControl,
      update: filterAccessControl,
      delete: filterAccessControl,
    },
  },
  hooks: {},
})

export default listConfigurations
