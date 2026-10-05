import * as vscode from 'vscode';
import { LeetCodeProblemDetail } from '../api/types';
import { buildSystemPrompt, filterCodeSpoilers, HintLevel } from './guardrails';

export class SocraticCoach {
  constructor() {}

  async getHint(
    problem: LeetCodeProblemDetail,
    userCode: string,
    level: HintLevel
  ): Promise<string> {
    const systemPrompt = buildSystemPrompt(level, 'hint');
    const userPrompt = `
Problem: #${problem.questionFrontendId}. ${problem.title}
Difficulty: ${problem.difficulty}
Description Summary: ${problem.content.replace(/<[^>]*>/g, '').slice(0, 500)}

Student's current code attempt:
${userCode || '# No code written yet.'}

Please provide a Level ${level} hint according to the Socratic rules.
`.trim();

    return this.queryModel(systemPrompt, userPrompt);
  }

  async explainFailure(
    problem: LeetCodeProblemDetail,
    userCode: string,
    failingInput: string,
    actualOutput: string,
    expectedOutput?: string
  ): Promise<string> {
    const systemPrompt = buildSystemPrompt(undefined, 'failure');
    const userPrompt = `
Problem: #${problem.questionFrontendId}. ${problem.title}

Student's current code:
${userCode}

Failing Test Case Input:
${failingInput}

Actual Student Output:
${actualOutput}

Expected Correct Output:
${expectedOutput || 'N/A'}

Explain the flawed assumption without writing code.
`.trim();

    return this.queryModel(systemPrompt, userPrompt);
  }

  async analyzeComplexity(
    problem: LeetCodeProblemDetail,
    userCode: string
  ): Promise<string> {
    const systemPrompt = buildSystemPrompt(undefined, 'complexity');
    const userPrompt = `
Problem: #${problem.questionFrontendId}. ${problem.title}

Student's current code:
${userCode}

Analyze the Time and Space complexity and nudge towards the optimal complexity if needed.
`.trim();

    return this.queryModel(systemPrompt, userPrompt);
  }

  private async queryModel(systemPrompt: string, userPrompt: string): Promise<string> {
    // 1. Try VS Code Language Model API (vscode.lm) first
    try {
      if (vscode.lm && typeof vscode.lm.selectChatModels === 'function') {
        const models = await vscode.lm.selectChatModels();
        if (models && models.length > 0) {
          const model = models[0];
          const messages = [
            vscode.LanguageModelChatMessage.User(`${systemPrompt}\n\n${userPrompt}`),
          ];

          const cts = new vscode.CancellationTokenSource();
          const response = await model.sendRequest(messages, {}, cts.token);

          let output = '';
          for await (const chunk of response.text) {
            output += chunk;
          }

          if (output.trim()) {
            return filterCodeSpoilers(output);
          }
        }
      }
    } catch (err) {
      console.warn('VS Code LM query failed, checking BYOK fallback:', err);
    }

    // 2. Fallback to BYOK if configured
    const config = vscode.workspace.getConfiguration('leetcode.ai');
    const apiKey = config.get<string>('apiKey', '').trim();
    const endpoint = config.get<string>('endpoint', 'https://api.openai.com/v1/chat/completions').trim();
    const modelName = config.get<string>('model', 'gpt-4o-mini').trim();

    if (apiKey) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 350,
          }),
        });

        if (!res.ok) {
          throw new Error(`AI API HTTP ${res.status}: ${res.statusText}`);
        }

        const data = (await res.json()) as any;
        const rawContent = data.choices?.[0]?.message?.content || '';
        return filterCodeSpoilers(rawContent);
      } catch (err: any) {
        return `⚠️ AI Error: ${err.message}`;
      }
    }

    // If neither is available, provide helpful Socratic heuristics directly!
    return this.getOfflineHeuristicNudge(problemSlugFromPrompt(userPrompt), systemPrompt);
  }

  private getOfflineHeuristicNudge(slug: string, systemPrompt: string): string {
    return filterCodeSpoilers(`
💡 **Socratic Guidance**:
- Ask yourself: What is the bottleneck in the brute-force approach?
- Can you trade space for time using a Hash Map or Frequency Array?
- Check your bounds: Are there negative numbers or empty inputs?
*(Tip: To enable live AI, install GitHub Copilot or configure your API key in VS Code Settings: \`leetcode.ai.apiKey\`)*
    `);
  }
}

function problemSlugFromPrompt(prompt: string): string {
  const match = /Problem:\s*#?\d*\.?\s*([^\r\n]+)/.exec(prompt);
  return match?.[1] || '';
}
