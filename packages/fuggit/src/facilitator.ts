import inquirer from 'inquirer';
import { green, red, bold } from 'colorette';

type InputResponse = {
  input: string;
};

type ChoiceResponse = {
  choice: boolean;
};

type YesNoClipboardChoice = 'Yes' | 'No' | 'Copy to Clipboard';

export function somethingWentWrong(): void {
  console.log(red('Something went wrong, please try agian.'));
}

export function attemptingCommand(): void {
  console.log(bold(green('Attempting command')));
}

export function success(): void {
  console.log(bold(green('Success!')));
}

export function cmdFailed(error: Error): void {
  console.log(bold(red("Bummer, it didn't work.")));
  console.log(red(error.toString()));
}

export async function wantToTryIt(
  cmd: string
): Promise<{ choice: YesNoClipboardChoice }> {
  return promptForList<YesNoClipboardChoice>(
    `Here's what we got:\n${cmd}\n\nWant to try it?`,
    ['Yes', 'No', 'Copy to Clipboard']
  );
}

export async function whatchaDoin(): Promise<InputResponse> {
  return promptForInput('Whatcha trying to do?');
}

export async function askForAnotherCmd(): Promise<ChoiceResponse> {
  return promptForChoice('Want to try generating another command?');
}

export async function getMoreDetails(): Promise<{ input: string | null }> {
  let { input } = await promptForInput('Any more details to add?');
  input = input.toLowerCase();

  // brute force, oh well.
  if (
    !input ||
    input.includes('n') ||
    input.includes('no') ||
    input.includes('nope')
  ) {
    return { input: null };
  }

  return { input };
}

export async function tryAgain(): Promise<ChoiceResponse> {
  return promptForChoice('Want to try again?');
}

async function promptForInput(message: string): Promise<InputResponse> {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'input',
      message,
    },
  ]);
}

async function promptForChoice(message: string): Promise<ChoiceResponse> {
  return inquirer.prompt([
    {
      type: 'confirm',
      name: 'choice',
      message,
      default: true,
    },
  ]);
}

async function promptForList<T>(
  message: string,
  choices: string[]
): Promise<{ choice: T }> {
  return inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message,
      choices,
    },
  ]);
}
