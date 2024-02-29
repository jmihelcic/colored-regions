import * as vscode from 'vscode'
import { getConfiguration, extensionConfigurationKey } from './configuration'
import ColoredRegions, { DecoratorMap } from './ColoredRegions'

export const activate = async (context: vscode.ExtensionContext) => {
  const coloredRegions = new ColoredRegions()
  let configuration = await getConfiguration()
  coloredRegions.setConfiguration(configuration)
  let decoratorMap: DecoratorMap = {}

  const updateColoredRegions = (editor: vscode.TextEditor) => {
    const newDecoratorMap = coloredRegions.getDecoratorMap(editor.document.getText())
    Object.entries(decoratorMap).forEach(([color, { decorator }]) => {
      if (!newDecoratorMap[color]) {
        editor.setDecorations(decorator, [])
      }
    })
    Object.entries(newDecoratorMap).forEach(([color, { decorator, regions, regionsKey }]) => {
      if (decoratorMap[color]?.regionsKey !== regionsKey) {
        editor.setDecorations(decorator, regions)
      }
    })
    decoratorMap = newDecoratorMap
  }

  vscode.workspace.onDidChangeConfiguration(async (event) => {
    if (event.affectsConfiguration(extensionConfigurationKey)) {
      configuration = await getConfiguration()
      coloredRegions.setConfiguration(configuration)
      vscode.window.visibleTextEditors.forEach((editor) => {
        updateColoredRegions(editor)
      })
    }
  }, null, context.subscriptions)

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor) {
      updateColoredRegions(editor)
    }
  }, null, context.subscriptions)

  vscode.workspace.onDidChangeTextDocument((event) => {
    vscode.window.visibleTextEditors.map((editor) => {
      if (editor.document === event.document) {
        updateColoredRegions(editor)
      }
    })
  }, null, context.subscriptions)

  vscode.window.visibleTextEditors.map((editor) => {
    updateColoredRegions(editor)
  })
}
