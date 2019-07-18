import { VALUE_SYMBOL, COMPUTED_SYMBOL } from '../core/symbols'

export interface ValueWrapper<T> {
  [VALUE_SYMBOL]: true
  value: T
}

export interface ComputedValueWrapper<T> extends ValueWrapper<T> {
  [COMPUTED_SYMBOL]: true
}
