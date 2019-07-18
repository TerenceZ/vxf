import { ValueWrapper } from './wrapper'

export interface WacthCallback<T, R> {
  (value: T, prevValue: T | undefined, onCleanup: (cb: () => void) => void): R
}

export type Watchable<T> = ValueWrapper<T> | (() => T)

export type UnwrapWatchable<T> = T extends Watchable<infer V> ? V : never

export type UnwrapWatchableList<T extends any[]> = {
  readonly [K in keyof T]: UnwrapWatchable<T[K]>
}

export type RemoveReadonly<T> = { -readonly [K in keyof T]: T[K] }

export interface WatchOptions {
  lazy?: boolean
  deep?: boolean
  flush?: 'sync' | 'pre' | 'post'
}
