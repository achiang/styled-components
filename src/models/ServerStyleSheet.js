// @flow
import React from 'react'
import { Tag, StyleSheet, SC_ATTR, LOCAL_ATTR } from './BrowserStyleSheet'
import StyleSheetManager from './StyleSheetManager'

class ServerTag implements Tag {
  isLocal: boolean
  components: Map<string, Object>
  names: Array<string>

  constructor(isLocal: boolean) {
    console.log('SERVER TAG')
    this.isLocal = isLocal
    this.components = new Map()
    this.names = []
  }

  isFull() {
    return false
  }

  inject(componentId: string, css: string, name: ?string) {
    console.log({ componentId, css, name })
    const comp = this.getComponent(componentId)
    comp.css += css.replace(/\n*$/, '\n')
    if (name) this.names.push(name)
  }

  toHTML() {
    const namesAttr = `${SC_ATTR}="${this.names.join(' ')}"`
    const localAttr = `${LOCAL_ATTR}="${this.isLocal ? 'true' : 'false'}"`
    return `<style type="text/css" ${namesAttr} ${localAttr}>\n${
      Array.from(this.components.values()).map(comp => comp.css)
      }\n</style>`
  }

  getComponent(componentId: string) {
    const existingComp = this.components.get(componentId)
    if (existingComp) return existingComp

    const css = `/* sc-component-id: ${componentId} */\n`
    const comp = { componentId, css }
    this.components.set(componentId, comp)
    return comp
  }
}

/* Factory function to separate DOM operations from logical ones*/
const createServerStyleSheet = () => {
  /* Factory for making more tags. Very little to do here. */
  const tagConstructor = isLocal => new ServerTag(isLocal)
  tagConstructor.type = 'SERVER'
  return new StyleSheet(tagConstructor)
}

export default class ServerStyleSheet {
  instance: StyleSheet

  constructor() {
    this.instance = createServerStyleSheet()
    this.instance.type = 'SERVER'
  }

  collectStyles(children: any) {
    return (
      <StyleSheetManager sheet={this.instance}>
        {children}
      </StyleSheetManager>
    )
  }

  get css() {
    return this.instance.toHTML()
  }
}