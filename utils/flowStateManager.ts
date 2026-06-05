// utils/flowStateManager.ts
import * as fs from 'fs';
import * as path from 'path';

export function createFlowState(stateFileName: string) {
  const STATE_FILE = path.join(process.cwd(), stateFileName);

  function readState(): Record<string, boolean> {
    try {
      if (fs.existsSync(STATE_FILE)) {
        return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
      }
    } catch {
      console.warn(`Could not read state file: ${STATE_FILE}`);
    }
    return {};
  }

  function writeState(state: Record<string, boolean>) {
    try {
      fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    } catch {
      console.warn(`Could not write state file: ${STATE_FILE}`);
    }
  }

  function resetState() {
    writeState({});
  }

  function markPassed(testKey: string) {
    const current = readState();
    writeState({ ...current, [testKey]: true });
  }

  function markFailed(testKey: string) {
    const current = readState();
    writeState({ ...current, [testKey]: false });
  }

  function hasPassed(...testKeys: string[]): boolean {
    const current = readState();
    return testKeys.every(key => current[key] === true);
  }

  function deleteStateFile() {
    if (fs.existsSync(STATE_FILE)) {
      fs.unlinkSync(STATE_FILE);
    }
  }

  return {
    readState,
    writeState,
    resetState,
    markPassed,
    markFailed,
    hasPassed,
    deleteStateFile,
  };
}