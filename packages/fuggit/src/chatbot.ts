import * as os from 'os';
import inquirer from 'inquirer';
import axios from 'axios';
import ora from 'ora';

type Roles = 'system' | 'assistant' | 'user';

type Choice = {
  message: Message;
};

type Message = {
  role: Roles;
  content: string;
};

type CompletionType = {
  choices: Choice[];
};

type InputResponse = {
  input: string;
};

type ChoiceResponse = {
  choice: boolean;
};

export class ChatBot {
  private readonly shell = os.userInfo().shell;
  private readonly messageHistory: Message[] = [
    {
      role: 'system',
      content: `You are an assistent who helps generate command lines for a the following shell: ${this.shell}. You only respond with code; no text, no explanations, no extra words.`,
    },
  ];

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('No OPENAI_API_KEY found.');
    }
  }

  async ask(content: string): Promise<string> {
    const spinner = ora({
      text: 'Requesting help from our overlords',
      spinner: 'bouncingBar',
    }).start();

    try {
      this.messageHistory.push({
        role: 'user',
        content,
      });

      const edit = await axios<CompletionType>({
        method: 'post',
        url: 'https://api.openai.com/v1/chat/completions',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        data: {
          model: 'gpt-3.5-turbo',
          temperature: 0.5,
          messages: this.messageHistory,
        },
      });

      this.messageHistory.push(edit.data.choices[0].message);
      spinner.succeed();
      return this.parseCmd(edit.data.choices[0].message.content);
    } catch (error) {
      spinner.fail();
      throw new Error(`Chat error occurred: ${error.data.message}`);
    }
  }

  private parseCmd(cmd: string): string {
    if (!cmd) {
      return 'Bummer, failed to get a response.';
    }

    /**
     * Sometimes the chat will disobey instructions and say something like the following
     * that will result in a premature regex match
     * "Here's another way to print environment variables in the `/bin/zsh` shell"
     */
    cmd.replace(this.shell, '');

    if (cmd.includes('```')) {
      // https://regex101.com/r/hWo7PX/1
      return cmd.match(
        /```\s*([^]+?.*?[^]+?[^]+?)```|`\s*([^]+?.*?[^]+?[^]+?)`/
      )[1];
    }

    return cmd;
  }

  async promptForInput(message: string): Promise<InputResponse> {
    return inquirer.prompt([
      {
        type: 'input',
        name: 'input',
        message,
      },
    ]);
  }

  async promptForChoice(message: string): Promise<ChoiceResponse> {
    return inquirer.prompt([
      {
        type: 'confirm',
        name: 'choice',
        message,
        default: true,
      },
    ]);
  }

  async promptForList<T>(
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
}
