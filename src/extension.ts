import { rename, lstatSync } from 'fs';
import { parse, dirname, posix, relative } from 'path';
import { promisify } from 'util';
import vscode, { QuickPickItem, window } from 'vscode';
import getRepoInfo from 'git-repo-info';
import { exec } from 'child_process';
import { camelize, kebablize, pascalize, snakelize } from './transforms';

const asyncRename = promisify(rename);
const asyncExec = promisify(exec);

enum CasingTransforms {
  camelCase, // fileName.ts
  pascalCase, // FileName.ts
  kebabCase, // file-name.ts
  snakeCase, // file_name.ts
}

type TransformFn = (str: string) => string;

interface SelectCaseItem extends QuickPickItem {
  transformType: CasingTransforms;
}

const quickPickItems: SelectCaseItem[] = [
  {
    label: 'Camel Case',
    description: 'fileName',
    alwaysShow: true,
    transformType: CasingTransforms.camelCase,
  },
  {
    label: 'Pascal Case',
    description: 'FileName',
    alwaysShow: true,
    transformType: CasingTransforms.pascalCase,
  },
  {
    label: 'Kebab Case',
    description: 'file-name',
    alwaysShow: true,
    transformType: CasingTransforms.kebabCase,
  },
  {
    label: 'Snake Case',
    description: 'file_name',
    alwaysShow: true,
    transformType: CasingTransforms.snakeCase,
  },
];

const transformFunctions: Record<CasingTransforms, TransformFn> = {
  [CasingTransforms.camelCase]: camelize,
  [CasingTransforms.pascalCase]: pascalize,
  [CasingTransforms.kebabCase]: kebablize,
  [CasingTransforms.snakeCase]: snakelize,
};

export function activate(context: vscode.ExtensionContext) {
  const changeFileCasingCommand = vscode.commands.registerCommand(
    'file-explorer-casing-utils.changeFileCasing',
    showDialog
  );

  const selectionToCamelCommand = vscode.commands.registerCommand(
    'file-explorer-casing-utils.changeSelectionToCamel',
    changeCasingOfSelection(CasingTransforms.camelCase)
  );

  const selectionToPascalCommand = vscode.commands.registerCommand(
    'file-explorer-casing-utils.changeSelectionToPascal',
    changeCasingOfSelection(CasingTransforms.pascalCase)
  );

  const selectionToKebabCommand = vscode.commands.registerCommand(
    'file-explorer-casing-utils.changeSelectionToKebab',
    changeCasingOfSelection(CasingTransforms.kebabCase)
  );

  const selectionToSnakeCommand = vscode.commands.registerCommand(
    'file-explorer-casing-utils.changeSelectionToSnake',
    changeCasingOfSelection(CasingTransforms.snakeCase)
  );

  context.subscriptions.push(changeFileCasingCommand);

  context.subscriptions.push(selectionToCamelCommand);
  context.subscriptions.push(selectionToPascalCommand);
  context.subscriptions.push(selectionToKebabCommand);
  context.subscriptions.push(selectionToSnakeCommand);
}

const changeCasingOfSelection = (transformType: CasingTransforms) => (() => {
    const editor = vscode.window.activeTextEditor;
    const selection = editor?.selection;
    const text = editor?.document.getText(selection);
    if (selection && text) {
      editor?.edit(editBuilder => editBuilder.replace(selection, transformFunctions[transformType](text)));
    }
  }
);

const showDialog = async (selectedFile: any, inputFiles: any[]): Promise<void> => {
  const selectedTransform = await window.showQuickPick(quickPickItems, {
    placeHolder: 'Which casing should the file name be transformed to?',
  });

  if (selectedTransform) {
    parseFiles(inputFiles, selectedTransform.transformType);
  }
};

const parseFiles = async (inputFiles: any[], transformType: CasingTransforms) => {
  let directories: string[] = [];
  let files: string[] = [];

  inputFiles.forEach((file) =>
    lstatSync(file.fsPath).isDirectory()
      ? directories.push(file.fsPath)
      : files.push(file.fsPath)
  );
  await renameFiles(files, transformType);
  await renameFiles(directories, transformType);
};

const renameFiles = async (files: string[], transformType: CasingTransforms): Promise<void> => {
  for (const file of files) {
    const parsedFile = parse(file);
    const fileParts = parsedFile.base.split('.');
    const fileName = fileParts.shift();

    // only transform first part of filename before a '.', so sample-component.models.ts will become SampleComponent.models.ts
    const newFileName = [
      transformFunctions[transformType](fileName as string),
      ...fileParts,
    ].join('.');
    const newFilePath = posix.join(dirname(file), newFileName);
    const gitRoot = getRepoInfo(file).root;

    try {
      if (gitRoot) {
        const relativeOldPath = relative(gitRoot, file);
        const relativeNewPath = relative(gitRoot, newFilePath);
        await asyncExec(`git mv ${relativeOldPath} ${relativeNewPath}`, {
          cwd: gitRoot,
        });
      } else {
        await asyncRename(file, newFilePath);
      }
      vscode.window.showInformationMessage('File(s) renamed successfully');
    } catch (error) {
      console.log(error);
      vscode.window.showErrorMessage(
        'An error occurred while renaming file(s)'
      );
    }
  }
};

export function deactivate() {}
