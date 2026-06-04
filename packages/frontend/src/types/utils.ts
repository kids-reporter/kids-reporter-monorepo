import { Maybe } from '@/types/api'

export type DeepPartial<T> = T extends any[]
  ? DeepPartial<T[number]>[]
  : T extends Maybe<object>
    ? { [P in keyof T]?: DeepPartial<T[P]> }
    : T

export type RecursiveNonNullable<T> = T extends any[]
  ? RecursiveNonNullable<T[number]>[]
  : T extends object
    ? {
        [K in keyof T as K extends `__${string}`
          ? never
          : K]-?: RecursiveNonNullable<NonNullable<T[K]>>
      }
    : NonNullable<T>
