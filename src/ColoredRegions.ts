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
  private startRegionRegex = /^(#|\s*\/\/|#\s*\/\/|\/\/\s*#|--|<!--|<!--\s*#|--\[\[|'''|\/\*|#pragma\s|--\s*#|\/\*\s*#|::\s*#?|REM\s*#?|%|;\s*#)\s*region(\s|\[|\*\/|$)/i
  private regionOptionsRegex = /\[(\s*[#\w\d\s.,()]*)\]/ig
  private endRegionRegex = /((#|\/\/|--|'''|\/\*|pragma|--\s*#|\/\*\s*#|<!--|<!--\s*#|::\s*#?|REM\s*#?|%|;\s*#)\s*(end\s*region|region\s*end)|(end\s*region|region\s*end)\s*(\]\]|'''|\*\/))/i
  private colorRgbRegex = /(rgba?\(\d{1,3},\d{1,3},\d{1,3},\d(?:\.\d+)?\)|rgba?\(\d{1,3},\d{1,3},\d{1,3}\))/i
  private colorHexRegex = /(#[0-9a-f]{3,8})/i
  private namedColors: Record<string, string> = {}
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
      row = row.trim()
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
        let match: RegExpExecArray | null = null
        this.regionOptionsRegex.lastIndex = 0
        while ((match = this.regionOptionsRegex.exec(row)) !== null) {
          const key = match[1] || ''
          const differentKeys = [key, key.trim(), key.replace(/\s/g, ''), key.toLowerCase(), key.trim().toLowerCase(), key.replace(/\s/g, '').toLowerCase()]
          const foundKey = differentKeys.find(key => !!this.namedColors[key])
          let foundColor = foundKey ? this.namedColors[foundKey] : key
          foundColor = foundColor.replace(/\s/g, '')
          if (foundColor && (this.colorRgbRegex.test(foundColor) || this.colorHexRegex.test(foundColor))) {
            color = foundColor
            break
          }
        }
        if (!color && this.colorRange.length) {
          color = this.colorRange[nextColorIndex]
          nextColorIndex++
          if (nextColorIndex >= this.colorRange.length) {
            nextColorIndex -= this.colorRange.length
          }
        }
        color = color.replace(/\s/g, '')
        if (color) {
          const colorRgbMatch = color.match(this.colorRgbRegex)
          if (colorRgbMatch) {
            current.push({ color: colorRgbMatch[1], start: rowIndex })
          } else {
            const colorHexMatch = color.match(this.colorHexRegex)
            if (colorHexMatch) {
              // only #123, #123456 and #12345678 matches are valid
              let color = colorHexMatch[1]
              if (color.length < 9) {
                color = color.substring(0, 7)
              }
              if (color.length < 7) {
                color = color.substring(0, 4)
              }
              current.push({ color, start: rowIndex })
            }
          }
        }
      }
    })
    if (current.length) {
      addRegion(current[current.length - 1].color, current[current.length - 1].start, rows.length - 1)
    }

    return decoratorMap
  }
}
