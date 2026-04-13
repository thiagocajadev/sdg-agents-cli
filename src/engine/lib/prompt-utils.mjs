import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import { select, checkbox, confirm, input } from '@inquirer/prompts';

function isExitError(err) {
  return err.name === 'ExitPromptError' || err.message?.includes('force closed');
}

async function safeSelect(options) {
  try {
    return await select(options);
  } catch (error) {
    if (isExitError(error)) return 'back';
    throw error;
  }
}

async function safeCheckbox(options) {
  try {
    return await checkbox(options);
  } catch (error) {
    if (isExitError(error)) return ['back'];
    throw error;
  }
}

async function safeConfirm(options) {
  try {
    return await confirm(options);
  } catch (error) {
    if (isExitError(error)) return false;
    throw error;
  }
}

/**
 * Robust sanitization for terminal inputs.
 * - Normalizes Unicode (NFKD) to decouple accents.
 * - Strips HTML/Script tags (anti-injection).
 * - Trims and limits length.
 * - Escapes Markdown breaking characters (\, `, *, _, {, }, [, ], (, ), #, +, -, ., !).
 */
function sanitizeInput(val, maxLength = 200) {
  if (!val) return '';

  let sanitized = String(val)
    .normalize('NFKD') // Resovle acentos estranhos / Unicode Normalization
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos remanescentes
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .trim();

  // Escaping Markdown characters to prevent breaking context.md structure
  sanitized = sanitized.replace(/([\\`*_{}[\]()#+\-.!])/g, '\\$1');

  return sanitized.slice(0, maxLength);
}

async function safeInput(options) {
  const { minLength = 0, maxLength = 200, ...inquirerOptions } = options;

  try {
    while (true) {
      const response = await input(inquirerOptions);
      if (response === 'back') return 'back'; // Natural exit if they type "back"

      const sanitized = sanitizeInput(response, maxLength);

      if (minLength > 0 && sanitized.length < minLength) {
        console.log(`\n  ⚠️  Input too short (minimum ${minLength} characters).\n`);
        continue;
      }

      return sanitized;
    }
  } catch (error) {
    if (isExitError(error)) return 'back';
    throw error;
  }
}

const PROJECT_ROOT = process.cwd();
const AI_DIR = path.join(PROJECT_ROOT, '.ai');
const PROMPT_FILE = path.join(AI_DIR, 'last-prompt.md');

function isMaintainerMode() {
  const pkgPath = path.join(PROJECT_ROOT, 'package.json');
  if (!fs.existsSync(pkgPath)) return false;
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return pkg.name === 'sdg-agents';
  } catch {
    return false;
  }
}

function savePromptToFile(content) {
  if (!fs.existsSync(AI_DIR)) {
    fs.mkdirSync(AI_DIR, { recursive: true });
  }
  fs.writeFileSync(PROMPT_FILE, content, 'utf8');
}

async function copyToClipboard(content) {
  return new Promise((resolve) => {
    let command;

    switch (process.platform) {
      case 'darwin':
        command = 'pbcopy';
        break;
      case 'win32':
        command = 'clip';
        break;
      case 'linux':
        command = 'xclip -selection clipboard || xsel -bi';
        break;
      default:
        return resolve(false);
    }

    const child = exec(command, (error) => {
      resolve(!error);
    });

    child.on('error', () => {
      resolve(false);
    });

    if (child.stdin) {
      child.stdin.on('error', () => {
        resolve(false);
      });
      child.stdin.write(content);
      child.stdin.end();
    } else {
      resolve(false);
    }
  });
}

async function printPromptUI(content, title = 'AI Prompt Generated') {
  const maintainer = isMaintainerMode();
  savePromptToFile(content);
  const copied = await copyToClipboard(content);

  console.log(`\n  ✅ ${title}`);

  if (maintainer) {
    console.log('  🛠️  MAINTAINER MODE DETECTED: Prompt targets the Core Instructions.');
  }

  console.log('  ' + '─'.repeat(60));

  if (copied) {
    console.log('  📋 COPIED TO CLIPBOARD AUTOMATICALLY.');
  } else {
    console.log('  ⚠️  COULD NOT COPY TO CLIPBOARD (Install xclip/xsel on Linux).');
  }

  console.log(`  💾 SAVED TO: .ai/last-prompt.md`);
  console.log('  ' + '─'.repeat(60));

  console.log('\n  🤖 HOW TO USE WITH LOCAL AGENTS (Cursor, Claude Code, Windsurf):');
  console.log('     Tell your agent: "Follow the instructions in .ai/last-prompt.md"');

  console.log('\n  🌍 HOW TO USE WITH WEB CHATS (Claude.ai, ChatGPT, Gemini):');
  console.log('     The prompt is already in your clipboard. Just paste it (Ctrl+V).');
  console.log('  ' + '─'.repeat(60) + '\n');
}

export const PromptUtils = {
  isMaintainerMode,
  savePromptToFile,
  copyToClipboard,
  printPromptUI,
  safeSelect,
  safeCheckbox,
  safeConfirm,
  safeInput,
  sanitizeInput,
};
