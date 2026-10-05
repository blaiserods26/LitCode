export const window = {
  showInputBox: async () => undefined,
  showInformationMessage: async () => undefined,
  showErrorMessage: async () => undefined,
  showWarningMessage: async () => undefined,
  createWebviewPanel: () => ({}),
  withProgress: async (_opts: any, task: any) => task({ report: () => {} }),
};

export const ProgressLocation = {
  Notification: 15,
};

export const ViewColumn = {
  Beside: -2,
  One: 1,
};

export const Uri = {
  file: (f: string) => ({ fsPath: f }),
  parse: (s: string) => ({ toString: () => s }),
  joinPath: (base: any, ...segments: string[]) => ({
    fsPath: [base.fsPath, ...segments].join('/'),
  }),
};

export const commands = {
  registerCommand: () => ({ dispose: () => {} }),
  executeCommand: async () => {},
};

export const workspace = {
  getConfiguration: () => ({
    get: (key: string, def: any) => def,
  }),
};

export class CancellationTokenSource {
  token = { isCancellationRequested: false, onCancellationRequested: () => ({ dispose: () => {} }) };
  cancel() {}
  dispose() {}
}

export const LanguageModelChatMessage = {
  User: (content: string) => ({ role: 'user', content }),
  Assistant: (content: string) => ({ role: 'assistant', content }),
};

export const lm = {
  selectChatModels: async () => [],
};
