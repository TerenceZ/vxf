import { VALUE_SYMBOL, COMPUTED_SYMBOL } from './symbols'
import { ValueWrapper, ComputedValueWrapper } from '../types/wrapper'

export const noop = () => {}

export const identity = <T>(x: T) => x

export function defineTagProperty<T extends object>(
  target: T,
  name: string | symbol,
) {
  Reflect.defineProperty(target, name, {
    configurable: true,
    enumerable: false,
    writable: false,
    value: true,
  })
  return target
}

export function tagAsValueWrapper<T extends { value: any }>(value: T) {
  return defineTagProperty(value, VALUE_SYMBOL)
}

export function isValueWrapper(value: any): value is ValueWrapper<any> {
  return value != null && value[VALUE_SYMBOL] === true
}

export function tagAsComputedWrapper<T extends { value: any }>(value: T) {
  return defineTagProperty(tagAsValueWrapper(value), COMPUTED_SYMBOL)
}

export function isComputedWrapper(
  value: any,
): value is ComputedValueWrapper<any> {
  return value != null && value[COMPUTED_SYMBOL] === true
}
