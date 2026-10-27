import { list } from '@keystone-6/core'
import { relationship, select, text, timestamp } from '@keystone-6/core/fields'
import type { ListConfig } from '@keystone-6/core/types'

import { allowRoles, RoleEnum } from './utils/access-control-list'

const listConfigurations: ListConfig<any> = list({
  fields: {
    type: select({
      label: '類型',
      type: 'string',
      options: [
        { label: '文章', value: 'post' },
        { label: '專題', value: 'project' },
      ],
      validation: { isRequired: true },
      isIndexed: true,
    }),
    post: relationship({
      label: '文章',
      ref: 'Post',
      many: false,
      ui: { hideCreate: true },
    }),
    project: relationship({
      label: '專題',
      ref: 'Project',
      many: false,
      ui: { hideCreate: true },
    }),
    member: relationship({
      label: '會員',
      ref: 'Member',
      many: false,
      ui: { hideCreate: true },
      graphql: {
        omit: {
          create: true,
        },
      },
    }),
    compositeKey: text({
      label: '唯一鍵',
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
      isIndexed: 'unique',
      db: {
        isNullable: true,
      },
      graphql: {
        omit: {
          create: true,
        },
      },
      access: {
        create: () => false,
        update: () => false,
      },
    }),
    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    updatedAt: timestamp({
      db: { updatedAt: true },
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
  },
  ui: {
    label: '收藏',
    labelField: 'id',
    hideCreate: true,
    createView: {
      defaultFieldMode: 'hidden',
    },
    itemView: {
      defaultFieldMode: 'read',
    },
    listView: {
      initialColumns: ['id', 'type', 'post', 'project', 'member'],
    },
  },
  db: { idField: { kind: 'autoincrement' } },
  access: {
    operation: {
      query: allowRoles([RoleEnum.Admin, RoleEnum.Owner]),
      create: () => false,
      update: () => false,
      delete: allowRoles([RoleEnum.Admin, RoleEnum.Owner]),
    },
  },
  graphql: {
    omit: {
      create: true,
      update: true,
    },
  },
})

export default listConfigurations
