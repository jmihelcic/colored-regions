import * as vscode from 'vscode'
import * as path from 'path'

export const extensionConfigurationKey = 'coloredRegions'

export type ExtensionConfiguration = {
  namedColors?: Record<string, string>
  colorRange?: string[]
}

export const getConfiguration = async () => {
  const out = getVSCodeConfiguration()
  const override = await getPackageConfiguration()
  // Merge namedColors and override colorRange
  if (override.namedColors) {
    out.namedColors = { ...out.namedColors, ...override.namedColors }
  }
  if (override.colorRange) {
    out.colorRange = override.colorRange
  }
  if (out.namedColors) {
    Object.entries(out.namedColors).forEach(([key, value]) => {
      const differentKeys = [key.trim(), key.replace(/\s/g, ''), key.toLowerCase(), key.trim().toLowerCase(), key.replace(/\s/g, '').toLowerCase()]
      differentKeys.forEach((key) => {
        if (!out.namedColors![key]) {
          out.namedColors![key] = value
        }
      })
    }, {})
  }
  return out
}

const getVSCodeConfiguration = () => {
  const configuration = vscode.workspace.getConfiguration(extensionConfigurationKey)
  return getValidExtensionConfiguration(configuration)
}

const getPackageConfiguration = async (): Promise<ExtensionConfiguration> => {
  try {
    const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath
    if (!workspacePath) {
      return {}
    }
    const fullPath = path.join(workspacePath, 'package.json')
    const document = await vscode.workspace.openTextDocument(fullPath)
    const text = document.getText()
    const json = JSON.parse(text)
    if (json && typeof json === 'object' && (extensionConfigurationKey in json)) {
      return getValidExtensionConfiguration(json[extensionConfigurationKey])
    }
  } catch (error) {
    // Fail silently
  }
  return {}
}

const getValidExtensionConfiguration = (configuration: unknown): ExtensionConfiguration => {
  const out: ExtensionConfiguration = {}
  if (configuration && typeof configuration === 'object') {
    if ('namedColors' in configuration && configuration.namedColors && typeof configuration.namedColors === 'object') {
      out.namedColors = {}
      Object.entries(configuration.namedColors).forEach(([key, value]) => {
        if (key && value && typeof value === 'string') {
          out.namedColors![key] = value
        }
      })
    }
    if ('colorRange' in configuration && Array.isArray(configuration.colorRange)) {
      out.colorRange = []
      configuration.colorRange.forEach((value) => {
        if (value && typeof value === 'string') {
          out.colorRange!.push(value)
        }
      })
    }
  }
  return out
}
