import * as vscode from 'vscode';

export interface LeetCodeCredentials {
  session: string;
  csrf: string;
}

export interface SubmissionResponse {
  submission_id?: number;
  error?: string;
}

export interface SubmissionCheckResult {
  state: 'PENDING' | 'STARTED' | 'SUCCESS';
  status_msg?: string;
  status_runtime?: string;
  status_memory?: string;
  total_correct?: number;
  total_testcases?: number;
  input_formatted?: string;
  expected_output?: string;
  code_output?: string;
  std_output?: string;
  last_testcase?: string;
  error?: string;
}

export function parseCookieString(raw: string): { session?: string; csrf?: string } {
  let session: string | undefined;
  let csrf: string | undefined;

  const parts = raw.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;

    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();

    // Strip surrounding quotes
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }

    if (key === 'LEETCODE_SESSION') {
      session = val;
    } else if (key === 'csrftoken') {
      csrf = val;
    }
  }

  return { session, csrf };
}

const SECRET_KEY = 'leetcode.credentials';

export class SessionManager {
  private secrets: vscode.SecretStorage;
  private cachedCreds: LeetCodeCredentials | null = null;
  private baseUrl: string;

  constructor(secrets: vscode.SecretStorage, baseUrl = 'https://leetcode.com') {
    this.secrets = secrets;
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  async getCredentials(): Promise<LeetCodeCredentials | null> {
    if (this.cachedCreds) {
      return this.cachedCreds;
    }

    const raw = await this.secrets.get(SECRET_KEY);
    if (!raw) {
      return null;
    }

    try {
      this.cachedCreds = JSON.parse(raw);
      return this.cachedCreds;
    } catch {
      return null;
    }
  }

  async setCredentials(creds: LeetCodeCredentials): Promise<void> {
    this.cachedCreds = creds;
    await this.secrets.store(SECRET_KEY, JSON.stringify(creds));
  }

  async clearCredentials(): Promise<void> {
    this.cachedCreds = null;
    await this.secrets.delete(SECRET_KEY);
  }

  async promptSignIn(): Promise<boolean> {
    const input = await vscode.window.showInputBox({
      title: 'LeetCode Sign In (Session Cookie)',
      prompt:
        'Paste your raw LeetCode cookie string (containing LEETCODE_SESSION and csrftoken) from browser DevTools:',
      password: true,
      ignoreFocusOut: true,
      placeHolder: 'LEETCODE_SESSION=...; csrftoken=...',
    });

    if (!input) {
      return false;
    }

    const { session, csrf } = parseCookieString(input);
    if (!session || !csrf) {
      vscode.window.showErrorMessage(
        'Could not find both LEETCODE_SESSION and csrftoken in the input. Please check your cookies.'
      );
      return false;
    }

    await this.setCredentials({ session, csrf });
    vscode.window.showInformationMessage('Successfully saved LeetCode session credentials!');
    return true;
  }

  async promptSignOut(): Promise<void> {
    await this.clearCredentials();
    vscode.window.showInformationMessage('Signed out from LeetCode.');
  }

  async submitSolution(
    titleSlug: string,
    questionId: string,
    langSlug: string,
    typedCode: string
  ): Promise<SubmissionCheckResult> {
    const creds = await this.getCredentials();
    if (!creds) {
      throw new Error('Not signed in. Use command "LeetCode: Sign In with LeetCode Cookies" first.');
    }

    const submitUrl = `${this.baseUrl}/problems/${titleSlug}/submit/`;
    const res = await fetch(submitUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: `${this.baseUrl}/problems/${titleSlug}/`,
        Origin: this.baseUrl,
        Cookie: `LEETCODE_SESSION=${creds.session}; csrftoken=${creds.csrf};`,
        'X-CSRFToken': creds.csrf,
      },
      body: JSON.stringify({
        question_id: questionId,
        lang: langSlug,
        typed_code: typedCode,
      }),
    });

    if (!res.ok) {
      throw new Error(`LeetCode submit HTTP ${res.status}: ${res.statusText}`);
    }

    const submitData = (await res.json()) as SubmissionResponse;
    if (!submitData.submission_id) {
      throw new Error(submitData.error || 'Failed to obtain submission ID from LeetCode.');
    }

    const subId = submitData.submission_id;

    // Poll for submission result
    const checkUrl = `${this.baseUrl}/submissions/detail/${subId}/check/`;
    for (let attempt = 0; attempt < 25; attempt++) {
      await new Promise((r) => setTimeout(r, 1200));

      const checkRes = await fetch(checkUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: `${this.baseUrl}/problems/${titleSlug}/`,
          Cookie: `LEETCODE_SESSION=${creds.session}; csrftoken=${creds.csrf};`,
          'X-CSRFToken': creds.csrf,
        },
      });

      if (!checkRes.ok) {
        continue;
      }

      const result = (await checkRes.json()) as SubmissionCheckResult;
      if (result.state === 'SUCCESS') {
        return result;
      }
    }

    throw new Error('Submission timed out waiting for LeetCode judge.');
  }
}
