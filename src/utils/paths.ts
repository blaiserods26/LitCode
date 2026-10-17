import * as path from 'path';
import * as os from 'os';

/**
 * Resolves the global directory for storing user solution files.
 * Defaults to ~/.leetcode/solutions on the host system.
 */
export function getSolutionsDirectory(configuredPath?: string): string {
  if (configuredPath && configuredPath.trim().length > 0) {
    let resolved = configuredPath.trim();
    if (resolved.startsWith('~')) {
      resolved = path.join(os.homedir(), resolved.slice(1));
    }
    return path.resolve(resolved);
  }
  return path.join(os.homedir(), '.leetcode', 'solutions');
}
