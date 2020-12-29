import yargs from 'yargs/yargs'
import { getEnglish } from './commands/getEnglishFiles';
import { pullCommand } from './commands/pull';

export interface CLIOpts {
  _: [string, string]
  target: string
  source: string
  toCwd: string
  fromCwd: string
}

export interface Settings {
    app: string,
    issues: Record<string, number>
    docsRoots:  Array<{ from: string, to: string }>
}

yargs(process.argv.slice(2))

.command('pull <target> ', 'Used in your repo to grab localizations', (argv) => {
  argv.options("to-cwd", { type: "string", default: ".", description: "What folder do you want to treat as the base for the localize.json to use" })
  argv.options("from-cwd", { type: "string", description: "Instead of downloading from GitHub, you can use a local dir as the place to pull from"})
}, (argv: CLIOpts) => {
  pullCommand(argv)
})

.command('get-en <source>', 'Used in localizations to get the english versions', (argv) => {
  argv.options("to-cwd", { type: "string", default: ".", description: "What folder do you want to treat as the base for the localize.json to use" })
  argv.options("from-cwd", { type: "string", description: "Instead of downloading from GitHub, you can use a local dir as the place to pull from"})
}, (argv: CLIOpts) => {
  getEnglish(argv)
})

.command('validate-against-en', 'Used in localizations to validate against english versions', () => {}, (_argv: CLIOpts) => {
  console.log('this command will be run by default2')
})
.command('update-github-issues', 'Uses info in localization.json to create issues covering the state of translations', () => {}, (_argv: CLIOpts) => {
  console.log('this command will be run by default2')
})
.argv;

