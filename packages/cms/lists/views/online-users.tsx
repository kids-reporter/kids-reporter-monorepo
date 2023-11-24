import React, { useEffect /*useState*/ } from 'react'
import axios from 'axios'
import styled from 'styled-components'
import { FieldProps } from '@keystone-6/core/types'
import { FieldContainer } from '@keystone-ui/fields'
import { controller } from '@keystone-6/core/fields/types/json/views'

/*
const addUserGql = `
mutation Mutation($where: PostWhereUniqueInput!, $data: PostUpdateInput!) {
  updatePost(where: $where, data: $data) {
    onlineUsers {
      connect: {
        id: $data.id
      }
    }
  }
}
`

const removeUserGql = `
mutation Mutation($where: PostWhereUniqueInput!, $data: PostUpdateInput!) {
  updatePost(where: $where, data: $data) {
    onlineUsers {
      disconect: {
        id: $data.id
      }
    }
  }
}
`
*/

const queryUserGql = `
query {
  post(where: $where) {
    onlineUsers {
      id
      name
    }
  }
}
`

export const Field = ({ value }: FieldProps<typeof controller>) => {
  console.log(value)
  // const  [ userState, setUserState ] = useState([])
  // TODO: check relationship value
  const users = ['jason', 'howar', 'nick'] //JSON.parse(value) // ['1', '2']

  useEffect(() => {
    // update onlineUsers after join
    /*
    axios.post('api host', addUserGql, {
      where: { slug: ...},
      data: {
        userId: userId,
      }
    })
    */
  }, [])

  useEffect(() => {
    // update onlineUsers before leave
    window.addEventListener('beforeunload', () => {
      /*
      axios.post('api host', removeUserGql, {
        where: { slug: ...},
        data: {
          userId: userId,
        }
      })
      */
    })
    return () => {
      // window.removeEventListener('beforeunload')
    }
  }, [])

  useEffect(() => {
    // polling user data
    setInterval(async () => {
      const users = await axios.post('api host', queryUserGql)
      console.log(users)
      // setUserState(users)
    }, 3000)
  })

  // TODO: get myself id, name
  users.push('nick') // ['jason', 'howar', 'nick']

  return (
    <FieldContainer>
      <Avatars users={users} />
    </FieldContainer>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
`

const AvatarContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  overflow: hidden;
  margin: 0px 2px;
  background: ${(props) => props.color};
`

// TODO: get light color only
const getColor = () => {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

const Avatars = (props: { users: string[] }) => {
  return (
    <Container>
      {props?.users?.map((user, index) => {
        return (
          <AvatarContainer key={`online-user-${index}`} color={getColor()}>
            {/*<img src={avatarURL} alt={author.name} />*/}
            <p>{user}</p>
          </AvatarContainer>
        )
      })}
    </Container>
  )
}
