import * as vscode from 'vscode';
import * as path from 'path';

interface NamedColorsMap {
    [key: string]: string;
}

interface DecoratorMap {
    [key: string]: DecoratorDescription;
}

interface DecoratorDescription {
    name: string;
    regions: vscode.DecorationOptions[];
    decorator: undefined | vscode.TextEditorDecorationType;
}

interface DecoratorInstances {
    [key: string]: vscode.TextEditorDecorationType;
}

export function activate(context: vscode.ExtensionContext) {
    const namedColors: NamedColorsMap = {};
    const decoratorInstances: DecoratorInstances = {};
    const regionRegex = /[Rr]egion ?\[( ?[\w\d., ()]+ ?)\]([\s\S]*?)[Ee]nd ?[Rr]egion/g;
    const colorRegex = /rgba\(\d{1,3},\d{1,3},\d{1,3},\d(?:\.\d{1,2})?\)/g;

    //#region [Subscriptions]

    vscode.window.onDidChangeActiveTextEditor(
        (editor) => {
            if (editor !== undefined) {
                onColorRegions(editor);
            }
        },
        null,
        context.subscriptions
    );

    vscode.workspace.onDidChangeTextDocument(
        (event) => {
            vscode.window.visibleTextEditors.map((editor) => {
                if (editor.document === event.document) {
                    onColorRegions(editor);
                }
            });
        },
        null,
        context.subscriptions
    );

    vscode.workspace.onDidChangeConfiguration(
        (event) => {
            if (event.affectsConfiguration('coloredRegions')) {
                onRefreshConfiguration();
            }
        }, null,
        context.subscriptions
    );

    //#endregion

    //#region [Main]

    readConfiguration();

    //#endregion

    //#region [Events]

    function onColorRegions(activeEditor: vscode.TextEditor) {
        {
            // Clear decorations
            const keys = Object.keys(decoratorInstances);
            for (const key of keys) {
                activeEditor.setDecorations(decoratorInstances[key], []);
            }
        }

        const namedColorsKeys = Object.keys(namedColors);
        const text = activeEditor.document.getText();
        const decoratorMap: DecoratorMap = {};
        let match;
        while ((match = regionRegex.exec(text))) {
            let color = parseColor(match[1]);

            // Color can be a name or a rgba value
            if (namedColorsKeys.indexOf(color) !== -1) {
                color = namedColors[color];
            } else if (color.match(colorRegex) === null) {
                continue;
            }

            const decorator = createDecoratorInstance(color);
            const startPos = activeEditor.document.positionAt(match.index);
            const endPos = activeEditor.document.positionAt(
                match.index + match[0].length
            );

            const decoration = {
                range: new vscode.Range(startPos, endPos)
            };

            if (decoratorMap[color] === undefined) {
                decoratorMap[color] = {
                    name: color,
                    regions: [],
                    decorator: undefined
                };
            }

            decoratorMap[color].regions.push(decoration);
            decoratorMap[color].decorator = decorator;
        }

        const keys = Object.keys(decoratorMap);
        for (const key of keys) {
            const decoratorDescription = decoratorMap[key];

            if (decoratorDescription.decorator !== undefined) {
                activeEditor.setDecorations(decoratorDescription.decorator, []);
                activeEditor.setDecorations(
                    decoratorDescription.decorator,
                    decoratorDescription.regions
                );
            }
        }
    }

    function onRefreshConfiguration() {
        const configuration = getConfiguration();
        Object.assign(namedColors, configuration);
    }

    //#endregion

    //#region [Helpers]

    async function readConfiguration() {
        const configuration = getConfiguration();
        const packageJsonConfiguration = await getPackageConfiguration();

        Object.assign(namedColors, configuration, packageJsonConfiguration);

        vscode.window.visibleTextEditors.map((editor) => {
            onColorRegions(editor);
        });
    }

    function getConfiguration() {
        const configuration = vscode.workspace.getConfiguration('coloredRegions');
        if (configuration && configuration.namedColors) {
            return configuration.namedColors;
        }

        return {};
    }

    async function getPackageConfiguration() {
        const workspaceFolders = vscode.workspace.workspaceFolders;

        if (workspaceFolders === undefined) {
            return {};
        }

        const workspacePath = workspaceFolders[0].uri.fsPath;

        try {
            const fullPath = path.join(workspacePath, 'package.json');
            const document = await vscode.workspace.openTextDocument(fullPath);
            const text = document.getText();
            const json = JSON.parse(text);

            if (json.coloredRegions !== undefined) {
                return json.coloredRegions.namedColors;
            }

        } catch (error) {
            // Fail silently
        }

        return {};
    }

    function createDecoratorInstance(color: string) {
        if (decoratorInstances[color] !== undefined) {
            return decoratorInstances[color];
        }

        const instance = vscode.window.createTextEditorDecorationType({
            isWholeLine: true,
            backgroundColor: color
        });

        decoratorInstances[color] = instance;
        return instance;
    }

    function parseColor(inputColor: string) {
        const cleaned = '' + inputColor.replace(/ /g, '');
        return cleaned;
    }

    //#endregion
}
