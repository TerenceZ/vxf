import { observable } from './internal'

export function state<T extends object>(target: T) {
  return observable(target)
}
