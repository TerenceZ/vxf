import Vue, {
  VNode,
  DirectiveOptions,
  DirectiveFunction,
  VNodeChildren,
  VueConstructor,
} from 'vue'
import { PropsDefinition } from 'vue/types/options'

export const PROPS_SYMBOL: unique symbol

export const SLOTS_SYMBOL: unique symbol

export interface DefaultSlots {
  [name: string]: (...args: any[]) => VNodeChildren | VNode
}

export interface ComponentOptions<Props, Slots> {
  setup: ComponentSetup<Props, Slots>

  props?: PropsDefinition<Props>
  directives?: Record<string, DirectiveFunction | DirectiveOptions>
  transitions?: { [key: string]: object }
  filters?: { [key: string]: Function }
}

export interface ComponentTypesContainer<Props, Slots> {
  [PROPS_SYMBOL]: Props
  [SLOTS_SYMBOL]: Slots
}

export type Component<Props, Slots> = VueConstructor<
  ComponentTypesContainer<Props, Slots> & Vue
>

export interface ComponentSetup<Props, Slots> {
  (props: Props, context: ComponentContext<Slots>): ComponentRenderer<
    Props,
    Slots
  >
}

export interface ComponentRenderer<Props, Slots> {
  (props: Props, slots: Slots, attrs: Record<string, any>, vnode: VNode): VNode
}

export interface ComponentContext<Slots> {
  attrs: Vue['$attrs']
  slots: Slots
  refs: Vue['$refs']
  emit: Vue['$emit']
  parent: Vue['$parent']
  root: Vue['$root']
}
