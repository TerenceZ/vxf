import Vue from 'vue'

interface Watcher<T> {
  readonly value: T

  readonly dirty: boolean

  get(): T

  update(): void

  evaluate(): void

  depend(): void

  teardown(): void
}

interface WatcherConstructor<T> {
  new (
    vm: Vue,
    fn: string | (() => T),
    cb: (value: T, prevValue: T | undefined) => void,
    options?: { deep?: boolean; lazy?: boolean; sync?: boolean },
  ): Watcher<T>
}

interface Dep {
  depend(): void
}

interface DepConstructor {
  new (): Dep

  target: Watcher<any> | null
}

/// Dirty Hack Code to Get Vue Internal Constructorrs
let Watcher: WatcherConstructor<any>
let Dep: DepConstructor

new Vue({
  data: { v: 0 },
  computed: {
    f(): any {
      return this.v
    },
  },
  render(c) {
    return c('a')
  },
  mounted() {
    // Trigger lazy watcher to collect deps.
    const _ = this.f // eslint-disable-line @typescript-eslint/no-unused-vars
    const watcher = (this as any)._watchers[0]
    Watcher = watcher.constructor
    Dep = watcher.deps[0].constructor
  },
}).$mount()

export { Watcher, Dep }

// VM context
let currentVM: Vue = null!

let fallbackVM: Vue = null!

export function getCurrentVM(fallback = false) {
  return currentVM || (fallback ? getFallbackVM() : null)
}

export function setCurrentVM(vm: Vue | null) {
  currentVM = vm
}

export function getFallbackVM() {
  return fallbackVM || (fallbackVM = new Vue())
}

// reactivity
export const observable = Vue.observable
