<p align="center">
  <img width="300" height="220" src="./fuggit.png">
</p>

## Purpose 

The purpose of this command line chat utility is to assist users in generating CLI (Command Line Interface) commands by providing suggestions and guidance through an interactive chat interface. The tool aims to simplify the process of coming up with complex CLI commands, especially for users who may not have extensive experience with using command line interfaces.

## Usage 

``` sh
❯ node dist/packages/fuggit/src/index
? Whatcha trying to do? I need my terminal langauge
✔ Requesting help from our overlords
? Here's what we got:
echo $LANG

Want to try it? No
? Want to try generating another command? Yes
? Any more details to add? I meany my terminal colors for some reason
✔ Requesting help from our overlords
? Here's what we got:
echo -e "\033[0;31m RED \033[0m"

Want to try it? Copy to Clipboard
```

## Developing

### Running unit tests

Run `nx test fuggit` to execute the unit tests via [Jest](https://jestjs.io).

### Running lint

Run `nx lint fuggit` to execute the lint via [ESLint](https://eslint.org/).

