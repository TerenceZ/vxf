import {
  Watchable,
  WacthCallback,
  WatchOptions,
  UnwrapWatchableList,
  RemoveReadonly,
} from '../types/watch'
import { isFunction, eq, noop, isArray } from 'lodash'
import { ValueWrapper } from '../types/wrapper'
import assert from 'assert'
import { isValueWrapper } from './utils'
import { getCurrentVM, getFallbackVM, Watcher } from './internal'
import { WATCH_CONTEXT_SYMBOL } from './symbols'
import Vue from 'vue'

function transformValueWrapperToFunction<T>(wrapper: ValueWrapper<T>) {
  return () => wrapper.value
}

function transformArrayToFunction(list: Watchable<any>[]) {
  let values: UnwrapWatchableList<typeof list> | undefined

  const getters = list.map(value =>
    isFunction(value)
      ? value
      : transformValueWrapperToFunction(value as ValueWrapper<any>),
  )

  return () => {
    let changed = values != null
    const nextValues: any[] = []
    for (let i = 0; i < getters.length; ++i) {
      nextValues[i] = getters[i]()
      changed = changed || !eq(nextValues[i], values![i])
    }
    if (changed) {
      values = nextValues
    }
    return values
  }
}

function makeWatchUpdaterAndCleaner(update: WacthCallback<any, any>) {
  let clean = noop

  const cleaner = () => {
    const c = clean
    clean = noop
    if (c) {
      c()
    }
  }

  const onCleanup = (cb: () => void) => {
    if (process.env.NODE_ENV !== 'production') {
      assert(
        clean === noop,
        `[PANIC] Only one cleanup function can be set on one update call.`,
      )
    }
    clean = cb
  }

  const updater = (value: any, prevValue: any) => {
    cleaner()
    update(value, prevValue, onCleanup)
  }

  return <const>[updater, cleaner]
}

function makeFlushQueue() {
  let queue = [] as (() => void)[]

  const add = (task: () => void) => queue.push(task)

  const flush = () => {
    for (let i = 0; i < queue.length; ++i) {
      queue[i]()
    }
    queue = []
  }

  return {
    add,
    flush,
  }
}

function ensureFlushContext(vm: any) {
  let context = vm[WATCH_CONTEXT_SYMBOL]
  if (context) {
    return context
  }

  const pre = makeFlushQueue()
  const post = makeFlushQueue()

  vm.$on('hook:beforeUpdate', pre.flush)
  vm.$on('hook:updated', post.flush)

  const flush = () => {
    pre.flush()
    post.flush()
  }

  context = {
    pre,
    post,
    flush,
  }

  vm[WATCH_CONTEXT_SYMBOL] = context
  return context
}

function makeUpdateFlushTask(
  vm: any,
  update: (value: any, oldValue: any) => void,
  type?: 'sync' | 'pre' | 'post',
) {
  if (type === 'sync') {
    return update
  }

  const context = ensureFlushContext(vm)

  let pending = false
  const fallbackFlush = () => {
    if (pending) {
      return
    }

    pending = true
    Vue.nextTick(() => {
      pending = false
      context.flush()
    })
  }

  return (value: any, oldValue: any) => {
    fallbackFlush()
    context[type].add(() => update(value, oldValue))
  }
}

export function watch<T, R>(
  source: Watchable<T>,
  cb: WacthCallback<T, R>,
  options?: WatchOptions,
): () => void

export function watch<T extends ReadonlyArray<Watchable<any>>, R>(
  source: T,
  cb: WacthCallback<UnwrapWatchableList<RemoveReadonly<T>>, R>,
  options?: WatchOptions,
): () => void

export function watch(
  source: any,
  cb: (...args: any[]) => any,
  options: WatchOptions = {},
) {
  let get: () => any
  if (isArray(source)) {
    get = transformArrayToFunction(source)
  } else if (isValueWrapper(source)) {
    get = transformValueWrapperToFunction(source)
  } else {
    get = source
  }

  let [update, clean] = makeWatchUpdaterAndCleaner(cb)

  let vm = getCurrentVM()
  const fallback = vm == null
  if (fallback) {
    vm = getFallbackVM()
  }

  update = makeUpdateFlushTask(vm, update, options.flush)

  const watcher = new Watcher(vm, get, update, {
    deep: options.deep,
    sync: options.flush === 'sync',
  })

  if (!options.lazy) {
    update(watcher.value, undefined)
  }

  const unwatch = () => {
    watcher.teardown()
  }

  return () => {
    clean()
    unwatch()
  }
}
