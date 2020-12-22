import yargs from 'yargs/yargs'
import { pullCommand } from './commands/pull';

export interface CLIOpts {
  _: [string, string]
  repo?: string
}

const argv = yargs(process.argv.slice(2))


// .command('$0', 'NOOP', () => {}, (_argv: CLIOpts) => {
//   console.log(_argv)
//   console.log('NOOP')
// })

.command('pull <target> ', 'Used in your repo to grab localizations', () => {}, (argv: CLIOpts) => {
  // if (!argv._[1]) throw new Error("No repo arg passed")

  pullCommand(argv)
})

.command('get-en <source>', 'Used in localizations to get the english versions', () => {}, (_argv: CLIOpts) => {
  if (!argv._[1]) throw new Error("No repo arg passed")

  console.log('Takes code from')
})

.command('validate-against-en', 'Used in localizations to validate against english versions', () => {}, (_argv: CLIOpts) => {
  console.log('this command will be run by default2')
})
.argv;

argv.$0
