import { describe, it, expect } from 'vitest';
import { parseCookieString } from './sessionManager';

describe('Auth SessionManager', () => {
  it('parses raw cookie string containing LEETCODE_SESSION and csrftoken', () => {
    const raw = 'csrftoken=abc123456789; _ga=GA1.2.3; LEETCODE_SESSION=sess_token_xyz; other=value';
    const parsed = parseCookieString(raw);

    expect(parsed.session).toBe('sess_token_xyz');
    expect(parsed.csrf).toBe('abc123456789');
  });

  it('handles cookies without spaces or with quotes', () => {
    const raw = 'LEETCODE_SESSION="sess_quoted";csrftoken="csrf_quoted"';
    const parsed = parseCookieString(raw);

    expect(parsed.session).toBe('sess_quoted');
    expect(parsed.csrf).toBe('csrf_quoted');
  });

  it('returns undefined if tokens not present', () => {
    const raw = 'some_cookie=123; other=456';
    const parsed = parseCookieString(raw);

    expect(parsed.session).toBeUndefined();
    expect(parsed.csrf).toBeUndefined();
  });
});
