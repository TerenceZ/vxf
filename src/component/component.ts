import {
  Component,
  ComponentOptions,
  DefaultSlots,
  ComponentSetup,
} from '../types/component'
import Vue from 'vue'
import { noop } from '../core/utils'
import { RENDER_SYMBOL, SETUP_SYMBOL } from '../core/symbols'
import { isFunction } from 'lodash'

const sharedSetupEventDescriptor = {
  configurable: true,
  get: noop,
  set: noop,
}

function render(this: Vue) {
  return this[RENDER_SYMBOL](this)
}

function makeBeforeCreateHook(setup: ComponentSetup<any, any>) {
  return function(this: Vue) {
    sharedSetupEventDescriptor.set = () => {
      setupComponent(this, setup)
    }
    Reflect.defineProperty(this, SETUP_SYMBOL, sharedSetupEventDescriptor)
  }
}

function createContext(vm: Vue) {
  return {
    get attrs() {
      return vm.$attrs
    },
    get slots() {
      return vm.$scopedSlots
    },
    get refs() {
      return vm.$refs
    },

    emit() {
      return vm.$emit.apply(vm, arguments)
    },

    get parent() {
      return vm.$parent
    },

    get root() {
      return vm.$root
    },
  }
}

function proxyProps(vm: Vue) {
  if (vm.$options.props) {
    return vm.$props
  }

  return new Proxy(vm, {
    get(target, p, receiver) {},
  })
}

function setupComponent(vm: Vue, setup: ComponentSetup<any, any>) {
  vm[RENDER_SYMBOL] = createRenderer(setup(proxyProps(vm), createContext(vm)))
}

export function component<Props, Slots = DefaultSlots>(
  setup: ComponentSetup<Props, Slots>,
): Component<Props, Slots>

export function component<Props, Slots = DefaultSlots>(
  options: ComponentOptions<Props, Slots>,
): Component<Props, Slots>

export function component(options: any): any {
  let setup: any
  if (isFunction(options)) {
    setup = options
    options = {}
  } else {
    setup = options.setup
  }

  return Vue.extend({
    mixins: [options],
    methods: {
      [SETUP_SYMBOL]: noop,
    },
    beforeCreate: makeBeforeCreateHook(setup),
    render: setup,
  })
}
