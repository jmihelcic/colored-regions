import * as vscode from 'vscode'
import { ExtensionConfiguration } from './configuration'

type DecoratorInstances = Record<string, vscode.TextEditorDecorationType>

type DecoratorDescription = {
  name: string
  regions: vscode.DecorationOptions[]
  regionsKey: string
  decorator: vscode.TextEditorDecorationType
}

export type DecoratorMap = Record<string, DecoratorDescription>

export default class ColoredRegions {
  private decoratorInstances: DecoratorInstances = {}
  private startRegionRegex = /(#|\/\/|--|\[\[|pragma)\s*region(\s|\[|$)/i
  private startRegionOptionsRegex = /(#|\/\/|--|\[\[|pragma)\s*region\s*\[(\s*[#\w\d\s.,()]*)\]/i
  private endRegionRegex = /((#|\/\/|--|pragma)\s*(end\s*region|region\s*end)|(end\s*region|region\s*end)\s*\]\])/i
  private colorRegex = /(rgba?\(\d{1,3},\d{1,3},\d{1,3},\d(?:\.\d+)?\)|rgba?\(\d{1,3},\d{1,3},\d{1,3}\)|#[0-9a-f]{3,8})/i
  private namedColors: Record<string, string> = {}
  private namedColorsLoose: Record<string, string> = {}
  private colorRange: string[] = []

  private getDecoratorInstance = (color: string) => {
    if (!this.decoratorInstances[color]) {
      this.decoratorInstances[color] = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: color,
        overviewRulerColor: color,
        overviewRulerLane: vscode.OverviewRulerLane.Full
      })
    }
    return this.decoratorInstances[color]
  }

  setConfiguration = (configuration: ExtensionConfiguration) => {
    this.namedColors = configuration.namedColors || {}
    this.namedColorsLoose = configuration.namedColorsLoose || {}
    this.colorRange = configuration.colorRange || []
  }

  getDecoratorMap = (text: string): DecoratorMap => {
    const decoratorMap: DecoratorMap = {}
    const addRegion = (color: string, rowStart: number, rowEnd: number) => {
      if (!decoratorMap[color]) {
        decoratorMap[color] = {
          name: color,
          regions: [],
          regionsKey: '',
          decorator: this.getDecoratorInstance(color)
        }
      }
      decoratorMap[color].regions.push({
        range: new vscode.Range(rowStart, 0, rowEnd, 0)
      })
      decoratorMap[color].regionsKey += `${rowStart}-${rowEnd};`
    }

    const rows = text.split("\n")
    let nextColorIndex = 0
    const current: { start: number; color: string }[] = []
    rows.forEach((row, rowIndex) => {
      if (current.length && this.endRegionRegex.test(row)) {
        addRegion(current[current.length - 1].color, current[current.length - 1].start, rowIndex)
        if (current.length > 1) {
          current[current.length - 2].start = rowIndex + 1
        }
        current.pop()
      } else if (this.startRegionRegex.test(row)) {
        if (current.length) {
          addRegion(current[current.length - 1].color, current[current.length - 1].start, rowIndex - 1)
        }
        let color = ''
        const match = row.match(this.startRegionOptionsRegex)
        if (match) {
          const colorOrName = (match[2] || '').trim()
          const colorOrNameLoose = colorOrName.replace(/\s/g, '').toLowerCase()
          color = this.namedColors[colorOrName] || this.namedColorsLoose[colorOrNameLoose] || colorOrName
        } else if (this.colorRange.length) {
          color = this.colorRange[nextColorIndex]
          nextColorIndex++
          if (nextColorIndex >= this.colorRange.length) {
            nextColorIndex -= this.colorRange.length
          }
        }
        color = color.replace(/\s/g, '')
        if (color && this.colorRegex.test(color)) {
          current.push({ color, start: rowIndex })
        }
      }
    })
    if (current.length) {
      addRegion(current[current.length - 1].color, current[current.length - 1].start, rows.length - 1)
    }

    return decoratorMap
  }
}
