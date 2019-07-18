import { ComputedValueWrapper } from '../types/wrapper'
import { Watcher, getCurrentVM, getFallbackVM, Dep } from './internal'
import { noop, tagAsComputedWrapper } from './utils'

const computedWatcherOptions = { lazy: true }
const computedPropertyOptions: PropertyDescriptor = {
  configurable: true,
  enumerable: true,
}

export function computed<T>(
  get: () => T,
  set?: (value: T) => void,
): ComputedValueWrapper<T> {
  let vm = getCurrentVM()
  const fallback = vm == null
  if (fallback) {
    vm = getFallbackVM()
  }

  const watcher = new Watcher(vm, get, noop, computedWatcherOptions)

  const computed = {} as ComputedValueWrapper<T>
  computedPropertyOptions.set = set
  computedPropertyOptions.get = () => {
    if (watcher.dirty) {
      watcher.evaluate()
    }
    if (Dep.target) {
      watcher.depend()
    }
    return watcher.value
  }

  Object.defineProperty(computed, 'value', computedPropertyOptions)
  return Object.seal(tagAsComputedWrapper(computed))
}
