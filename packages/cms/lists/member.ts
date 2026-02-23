import { graphql, list } from '@keystone-6/core'
import {
  checkbox,
  integer,
  relationship,
  text,
  timestamp,
  virtual,
} from '@keystone-6/core/fields'

import type { ListType } from '../types/keystone-list-types'
import { allowAllRoles } from './utils/access-control-list'
import {
  makeMemberOwnedFilter,
  memberOwnedOperationAccess,
  memberOwnedPrivateFieldQueryAccess,
} from './utils/member-owned-access'

const operationAccessControl = memberOwnedOperationAccess
const filterAccessControl = makeMemberOwnedFilter('self')

export default list<ListType<'Member'>>({
  fields: {
    name: text({
      label: '稱呼',
    }),
    nickname: text({
      label: '暱稱',
    }),
    email: text({
      label: 'Email',
      isIndexed: true,
    }),
    contactEmail: text({
      label: '聯絡信箱',
      access: {
        read: memberOwnedPrivateFieldQueryAccess,
      },
    }),
    twreporter_user_id: text({
      label: 'TWReporter Membership ID',
      validation: { isRequired: true },
      isIndexed: 'unique',
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'read',
        },
        listView: {
          fieldMode: 'read',
        },
      },
      access: {
        read: memberOwnedPrivateFieldQueryAccess,
        create: () => false,
        update: () => false,
      },
    }),
    role: text({
      defaultValue: 'member',
      ui: {
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
      access: {
        read: memberOwnedPrivateFieldQueryAccess,
        create: () => false,
        update: () => false,
      },
    }),
    twoFactorAuth: virtual({
      field: graphql.field({
        type: graphql.JSON,
        async resolve() {
          return {
            bypass: true,
          }
        },
      }),
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'hidden',
        },
        listView: {
          fieldMode: 'hidden',
        },
      },
    }),
    showBaodaozai: checkbox({
      label: '是否顯示報導仔',
      defaultValue: true,
      access: {
        read: memberOwnedPrivateFieldQueryAccess,
      },
    }),
    essayQuestionCount: integer({
      label: '思辨題數量',
      defaultValue: 1,
      access: {
        read: memberOwnedPrivateFieldQueryAccess,
      },
    }),
    avatar: relationship({
      ref: 'MemberAvatar.member',
      many: false,
      label: '大頭照',
    }),
    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      access: {
        read: memberOwnedPrivateFieldQueryAccess,
      },
    }),
    updatedAt: timestamp({
      db: {
        updatedAt: true,
      },
      access: {
        read: memberOwnedPrivateFieldQueryAccess,
      },
    }),
  },
  ui: {
    listView: {
      initialColumns: ['id', 'twreporter_user_id', 'name', 'email'],
    },
  },
  db: {
    idField: {
      kind: 'cuid',
    },
  },
  access: {
    operation: {
      query: allowAllRoles(),
      create: operationAccessControl,
      update: operationAccessControl,
      delete: operationAccessControl,
    },
    filter: {
      update: filterAccessControl,
      delete: filterAccessControl,
    },
  },
  hooks: {},
})
