#!/usr/bin/env node

import clipboard from 'clipboardy';
import { Command } from 'commander';
import { promisify } from 'util';
import { exec } from 'child_process';
import { green, red, bold } from 'colorette';
import { ChatBot } from './chatbot.js';

const execAsync = promisify(exec);
const program = new Command();
const chatBot = new ChatBot();

async function execCmd(cmd: string): Promise<void> {
  console.log(bold(green('Attempting command')));
  const { stdout } = await execAsync(cmd);
  console.log(stdout);
}

async function run(thePrompt: string): Promise<void> {
  if (!thePrompt) {
    console.log(red('Something went wrong, please try agian.'));
    process.exit(1);
  }

  const cmd = await chatBot.ask(thePrompt);
  const { choice } = await chatBot.promptForList<'Yes' | 'No' | 'Copy to Clipboard'>(
    `Here's what we got:\n${cmd}\n\nWant to try it?`,
    ['Yes', 'No','Copy to Clipboard']
  );

  if (choice === 'No') {
    const { choice } = await chatBot.promptForChoice(
      'Want to try generating another command?'
    );

    if (!choice) {
      process.exit()
    }

    const { input } = await chatBot.promptForInput('Any more details to add?');
    await run(input);
  }

  if(choice === 'Copy to Clipboard') {
     clipboard.writeSync(cmd);
    process.exit();
  }

  try {
    await execCmd(cmd);
    console.log(bold(green('Success!')));
    process.exit();
  } catch (error) {
    console.log(bold(red("Bummer, it didn't work.")));
    console.log(red(error.toString()));
    const { choice } = await chatBot.promptForChoice('Want to try again?');

    if (choice) {
      await run(thePrompt);
    }
    process.exit();
  }
}

program.version('0.0.1').action(async () => {
  const { input } = await chatBot.promptForInput('Whatcha trying to do?');
  await run(input);
});

program.parse();
