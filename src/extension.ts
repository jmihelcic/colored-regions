import * as vscode from 'vscode'
import { getConfiguration, extensionConfigurationKey } from './configuration'
import ColoredRegions, { DecoratorMap } from './ColoredRegions'

export const activate = (context: vscode.ExtensionContext) => {
  const coloredRegions = new ColoredRegions()
  const decoratorMaps: Record<string, DecoratorMap> = {}

  const updateColoredRegions = (editor: vscode.TextEditor, editorId: number) => {
    const newDecoratorMap = coloredRegions.getDecoratorMap(editor.document.getText())
    const key = editorId + '|' + editor.document.uri.fsPath
    if (!decoratorMaps[key]) {
      decoratorMaps[key] = {}
    }
    Object.entries(decoratorMaps[key]).forEach(([color, { decorator }]) => {
      if (!newDecoratorMap[color]) {
        editor.setDecorations(decorator, [])
      }
    })
    Object.entries(newDecoratorMap).forEach(([color, { decorator, regions, regionsKey }]) => {
      if (decoratorMaps[key][color]?.regionsKey !== regionsKey) {
        editor.setDecorations(decorator, regions)
      }
    })
    decoratorMaps[key] = newDecoratorMap
  }

  const cleanupClosedEditors = () => {
    const openedEditorByKeys = vscode.window.visibleTextEditors.reduce((out: Record<string, true>, editor, editorId) => {
      out[editorId + '|' + editor.document.uri.fsPath] = true
      return out
    }, {})
    Object.keys(decoratorMaps).forEach((key) => {
      if (!openedEditorByKeys[key]) {
        delete decoratorMaps[key]
      }
    })
  }

  const readConfiguration = async () => {
    const configuration = await getConfiguration()
    coloredRegions.setConfiguration(configuration)
    vscode.window.visibleTextEditors.forEach((editor, editorId) => {
      updateColoredRegions(editor, editorId)
    })
    cleanupClosedEditors()
  }

  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration(extensionConfigurationKey)) {
      readConfiguration()
    }
  }, null, context.subscriptions)

  vscode.window.onDidChangeVisibleTextEditors((editors) => {
    const documentsChanged = editors.reduce((out: Record<string, true>, editor) => {
      out[editor.document.uri.fsPath] = true
      return out
    }, {})
    vscode.window.visibleTextEditors.forEach((editor, editorId) => {
      if (documentsChanged[editor.document.uri.fsPath]) {
        updateColoredRegions(editor, editorId)
      }
    })
    cleanupClosedEditors()
  }, null, context.subscriptions)

  vscode.workspace.onDidChangeTextDocument((event) => {
    vscode.window.visibleTextEditors.forEach((editor, editorId) => {
      if (editor.document.uri.fsPath === event.document.uri.fsPath) {
        updateColoredRegions(editor, editorId)
        return true
      }
    })
  }, null, context.subscriptions)

  readConfiguration()
}
