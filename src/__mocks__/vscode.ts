export const window = {
  showInputBox: async () => undefined,
  showInformationMessage: async () => undefined,
  showErrorMessage: async () => undefined,
  createWebviewPanel: () => ({}),
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
