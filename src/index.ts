import yargs from 'yargs/yargs'
import { getEnglish } from './commands/getEnglishFiles';
import { pullCommand, rmCommand } from './commands/pull';
import { updateIssues } from './commands/updateIssues';
import { validate } from './commands/validate';

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
    docsRoots:  Array<{ name: string, from: string, to: string }>
    validate?: {
      ignoreFiles?: string[]
    }
}

yargs(process.argv.slice(2)).scriptName("docs-sync")

.command('pull <target> ', 'Used in your repo to grab localizations', (argv) => {
  argv.options("to-cwd", { type: "string", default: ".", description: "What folder do you want to treat as the base for the localize.json to use" })
  argv.options("from-cwd", { type: "string", description: "Instead of downloading from GitHub, you can use a local dir as the place to pull from"})
}, (argv: CLIOpts) => {
  pullCommand(argv)
})

.command('delete-translations  <target>', 'Remove translation files from an app repo',  (argv) => {
  argv.options("to-cwd", { type: "string", default: ".", description: "What folder do you want to treat as the base for the localize.json to use" })
  argv.options("from-cwd", { type: "string", description: "Instead of downloading from GitHub, you can use a local dir as the place to pull from"})
}, (argv: CLIOpts) => {
  rmCommand(argv)
})

.command('get-en <source>', 'Used in localizations to get the english versions', (argv) => {
  argv.options("to-cwd", { type: "string", default: ".", description: "What folder do you want to treat as the base for the localize.json to use" })
  argv.options("from-cwd", { type: "string", description: "Instead of downloading from GitHub, you can use a local dir as the place to pull from"})
  argv.options("all", { type: "boolean", default: false, description: "Also include the other folders"})
}, (argv: CLIOpts & { all: boolean }) => {
  getEnglish(argv)
})

.command('validate-against-en', 'Used in localizations to validate against english versions',  (argv) => {
  argv.options("to-cwd", { type: "string", default: ".", description: "What folder do you want to treat as the base for the localize.json to use" })
  argv.options("from-cwd", { type: "string", description: "Instead of downloading from GitHub, you can use a local dir as the place to pull from"})
}, (argv: CLIOpts) => {
  validate(argv)
})

.command('update-github-issues <this-repo>', 'Uses info in localization.json to create issues covering the state of translations', () => {}, (argv: { thisRepo: string}) => {
  updateIssues(argv)
})
.argv;

