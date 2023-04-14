#!/usr/bin/env node

import clipboard from 'clipboardy';
import { Command } from 'commander';
import { promisify } from 'util';
import { exec } from 'child_process';
import { OpenAI } from './openai.js';
import * as Facilitator from './facilitator.js'

const execAsync = promisify(exec);
const program = new Command();
const chatBot = new OpenAI();

async function execCmd(cmd: string): Promise<void> {
  Facilitator.attemptingCommand()
  const { stdout } = await execAsync(cmd);
  console.log(stdout);
}

async function run(thePrompt: string): Promise<void> {
  if (!thePrompt) {
    Facilitator.somethingWentWrong();
    process.exit(1);
  }

  const cmd = await chatBot.ask(thePrompt);
  const { choice } = await Facilitator.wantToTryIt(cmd);

  if (choice === 'No') {
    const { choice } = await Facilitator.askForAnotherCmd();

    if (!choice) {
      process.exit()
    }

    const { input } = await Facilitator.getMoreDetails();
    await run(input);
  }

  if(choice === 'Copy to Clipboard') {
     clipboard.writeSync(cmd);
    process.exit();
  }

  try {
    await execCmd(cmd);
    Facilitator.success()
    process.exit();
  } catch (error) {
    Facilitator.cmdFailed(error);
    const { choice } = await Facilitator.tryAgain();
    if (choice) {
      await run(thePrompt);
    }
    process.exit();
  }
}

program.version('0.0.1').action(async () => {
  const { input } = await Facilitator.whatchaDoin();
  await run(input);
});

program.parse();
