import * as assert from 'assert'
import * as vscode from 'vscode'
import ColoredRegions from '../ColoredRegions'

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.')

  const coloredRegions = new ColoredRegions()

  test('Nested Regions Test', () => {
    const decoratorMap = coloredRegions.getDecoratorMap(`
      #region [#ddd]
      #region [#aaa]
      Test
      #endregion
      #endregion
    `)
    console.log(decoratorMap)
    assert.strictEqual(decoratorMap['#ddd'].regionsKey, '1-1;5-5;')
    assert.strictEqual(decoratorMap['#aaa'].regionsKey, '2-4;')
  })
})
