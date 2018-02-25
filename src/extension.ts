import * as vscode from 'vscode';

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

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {
    const decoratorInstances: DecoratorInstances = {};
    // Finds region[rgba(255,255,255,0.01)] ... endregion (spaces allowed around ",")
    const regex = /[Rr]egion ?(\[ ?rgba\(\d{1,3} ?, ?\d{1,3} ?, ?\d{1,3} ?, ?\d(?:\.\d{1,2})?\) ?\])([\s\S]*?)[Ee]nd ?[Rr]egion/g;

    vscode.window.visibleTextEditors.map((editor) => {
        colorRegions(editor);
    });

    vscode.window.onDidChangeActiveTextEditor(
        (editor) => {
            if (editor !== undefined) {
                colorRegions(editor);
            }
        },
        null,
        context.subscriptions
    );

    vscode.workspace.onDidChangeTextDocument(
        (event) => {
            vscode.window.visibleTextEditors.map((editor) => {
                if (editor.document === event.document) {
                    colorRegions(editor);
                }
            });
        },
        null,
        context.subscriptions
    );

    /*
    vscode.workspace.onDidOpenTextDocument(
        (event) => {
            // Schedule a new event so that the editor gets pushed
            // onto visibleTextEditors array
            setTimeout(() => {
                console.log('open');
                vscode.window.visibleTextEditors.map((editor) => {
                    if (editor.document === event) {
                        colorRegions(editor);
                    }
                });
            }, 0);
        },
        null,
        context.subscriptions
    );
    */

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
        const cleaned = inputColor.replace(/ /g, '');
        return cleaned.substring(1, cleaned.length - 1);
    }

    function colorRegions(activeEditor: vscode.TextEditor) {
        {
            // Clear decorations
            const keys = Object.keys(decoratorInstances);
            for (const key of keys) {
                activeEditor.setDecorations(decoratorInstances[key], []);
            }
        }

        const text = activeEditor.document.getText();
        const decoratorMap: DecoratorMap = {};
        let match;
        while ((match = regex.exec(text))) {
            const color = parseColor(match[1]);
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
}
