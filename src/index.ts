import yargs from 'yargs/yargs'
import { getEnglish } from './commands/getEngliishFiles';
import { pullCommand } from './commands/pull';

export interface CLIOpts {
  _: [string, string]
  target: string
  source: string
  toCwd: string
  fromCwd: string
}

const argv = yargs(process.argv.slice(2))

.command('pull <target> ', 'Used in your repo to grab localizations', (argv) => {
  argv.options("to-cwd", { type: "string", default: ".", description: "What folder do you want to treat as the base for the localize.json to use" })
  argv.options("from-cwd", { type: "string", description: "What"})
}, (argv: CLIOpts) => {
  pullCommand(argv)
})

.command('get-en <source>', 'Used in localizations to get the english versions', (argv) => {
  argv.options("to-cwd", { type: "string", default: ".", description: "What folder do you want to treat as the base for the localize.json to use" })
  argv.options("from-cwd", { type: "string", description: "Where is the other "})
}, (argv: CLIOpts) => {
  getEnglish(argv)
})

.command('validate-against-en', 'Used in localizations to validate against english versions', () => {}, (_argv: CLIOpts) => {
  console.log('this command will be run by default2')
})
.argv;

argv.$0
