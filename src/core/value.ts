import { ValueWrapper } from '../types/wrapper'
import { isValueWrapper, tagAsValueWrapper } from './utils'
import { observable } from './internal'

export function value<T = any>(): ValueWrapper<T | undefined>

export function value<T>(value: T): ValueWrapper<T>

export function value(value?: any): any {
  if (isValueWrapper(value)) {
    return value
  }

  return Object.seal(tagAsValueWrapper(observable({ value })))
}
