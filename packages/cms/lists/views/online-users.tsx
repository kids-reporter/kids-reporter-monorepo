import React, { useEffect, useState } from 'react'
import axios from 'axios'
import styled from 'styled-components'
import { FieldProps } from '@keystone-6/core/types'
import { FieldContainer } from '@keystone-ui/fields'
import { controller } from '@keystone-6/core/fields/types/json/views'

const colors = [
  '#C0C0C0',
  '#87CEEB',
  '#F5DEB3',
  '#90EE90',
  '#FFB6C1',
  '#FF8C00',
  '#FFD700',
  '#66CDAA',
  '#FFE4B5',
  '#EEE8AA',
]

const upateUserGql = `
mutation Mutation($where: PostWhereUniqueInput!, $data: PostUpdateInput!) {
  updatePost(where: $where, data: $data) {
    onlineUsers {
      email
    }
  }
}
`

const currentUserGql = `
query User {
  authenticatedItem {
    ... on User {
      email
      name
    }
  }
}`

const onlineUsersGql = `
query($where: PostWhereUniqueInput!) {
  post(where: $where) {
    onlineUsers {
      name
      email
    }
  }
}
`

const Container = styled(FieldContainer)`
  display: flex;
  flex-direction: row;
`

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
  margin: 0px 2px;
  background: ${(props) => props.color};
`

const Tooltip = styled.span`
  visibility: visible;
  width: 120px;
  background-color: black;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  position: absolute;
  z-index: 1;
  bottom: 150%;
  left: 50%;
  margin-left: -60px;
`

type User = {
  name: string
  email: string
}

export const Field = ({ value }: FieldProps<typeof controller>) => {
  const postID = value?.id
  const [users, setUsers] = useState<User[]>([])
  let currentUserEmail = ''

  // Update onlineUsers after join
  useEffect(() => {
    const updateUser = async () => {
      try {
        const currentUserRes = await axios.post('/api/graphql', {
          query: currentUserGql,
        })
        const authenticatedItem = currentUserRes?.data?.data?.authenticatedItem
        if (authenticatedItem?.email && authenticatedItem?.name) {
          currentUserEmail = authenticatedItem.email
          await axios.post('/api/graphql', {
            query: upateUserGql,
            variables: {
              where: {
                id: postID,
              },
              data: {
                onlineUsers: {
                  connect: [
                    {
                      email: authenticatedItem.email,
                    },
                  ],
                },
              },
            },
          })
          setUsers([
            ...users,
            { email: authenticatedItem.email, name: authenticatedItem.name },
          ])
        }
      } catch (err) {
        console.log(err)
      }
    }
    updateUser()
  }, [])

  useEffect(() => {
    const polling = setInterval(async () => {
      try {
        const usersRes = await axios.post('/api/graphql', {
          query: onlineUsersGql,
          variables: {
            where: {
              id: postID,
            },
          },
        })
        const currentUsers = usersRes?.data?.data?.post?.onlineUsers
        setUsers(currentUsers ?? [])
        console.log('onlineUsers', currentUsers)
      } catch (err) {
        console.log(err)
      }
    }, 5000)

    return async () => {
      clearInterval(polling)
      if (currentUserEmail) {
        await axios.post('/api/graphql', {
          query: upateUserGql,
          variables: {
            where: {
              id: postID,
            },
            data: {
              onlineUsers: {
                disconnect: [
                  {
                    email: currentUserEmail,
                  },
                ],
              },
            },
          },
        })
      }
    }
  }, [])

  return (
    <Container>
      {users?.map((user, index) => {
        return (
          <Avatar
            key={`online-user-${index}`}
            color={colors[index % colors.length]}
          >
            <span>{user.name?.[0]}</span>
            <Tooltip>{`${user.name}: ${user.email}`}</Tooltip>
          </Avatar>
        )
      })}
    </Container>
  )
}
