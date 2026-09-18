import { RoleEnum } from '../../constants/index'
import envVars from '../../environment-variables'
import type { Session } from '../../types/index'

export { RoleEnum }

export const allowRoles = (roles: string[]) => {
  return ({ session }: { session?: Session }) => {
    if (envVars.nodeEnv === 'test') {
      return true
    }

    if (!Array.isArray(roles)) {
      return false
    }

    if (!session) {
      return false
    }

    const role = session?.data?.role
    if (role) {
      return roles.indexOf(role) > -1
    }

    return false
  }
}

export const allowAllRoles = () => {
  // Preview is not included in the list because it should not have access to the CMS
  const roles = [
    RoleEnum.Owner,
    RoleEnum.Admin,
    RoleEnum.Developer,
    RoleEnum.Editor,
    RoleEnum.Contributor,
    RoleEnum.CronjobHeadlessAccount,
  ]
  return allowRoles(roles)
}

export const denyRoles = (roles: string[]) => {
  return ({ session }: { session?: Session }) => {
    if (!Array.isArray(roles)) {
      return true
    }

    if (!session) {
      return false
    }

    const role = session?.data?.role
    if (role) {
      return roles.indexOf(role) > -1
    }

    return false
  }
}
