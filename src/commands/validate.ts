import chalk from "chalk"
import { existsSync, mkdirSync, statSync, readFileSync, readdirSync } from "fs"
import { join } from "path"
import { ghRepresentationForPath } from "../util/refForPath"
import { getGHTar } from "../util/getGHTar"
import { Settings } from ".."
import { recursiveReadDirSync } from "../util/recursiveReadDirSync"

// node dist/index.js validate  --to-cwd fixtures/target --from-cwd ./fixtures/source

const tick = chalk.bold.greenBright("✓")
const cross = chalk.bold.redBright("⤫")

export const validate = async (opts: { toCwd: string; fromCwd?: string }) => {
  console.error(`Comparing that all locale files match the en version:`)
  const toDir = opts.toCwd

  const localizeJSONPath = join(toDir, "localize.json")
  if (!existsSync(localizeJSONPath)) {
    throw new Error(
      `There isn't a localize.json file in the root of the current working dir (expected at ${localizeJSONPath})`
    )
  }

  const settings = JSON.parse(readFileSync(localizeJSONPath, "utf8")) as Settings
  const ghRep = ghRepresentationForPath(settings.app)

  const cachedir: string = require("cachedir")("oss-doc-sync")
  const [user, repo] = ghRep.repoSlug!.split("/")
  let localCopy = opts.fromCwd


  // Grab a copy of the other repo, and pull in the files
  if (!localCopy) {
    if (!existsSync(cachedir)) mkdirSync(cachedir)
    if (!existsSync(join(cachedir, user))) mkdirSync(join(cachedir, user))

    await getGHTar({
      user,
      repo,
      branch: ghRep.branch,
      to: join(cachedir, user, repo),
    })

    const unzipped = join(cachedir, user, repo)
    localCopy = join(unzipped, readdirSync(unzipped).find(p => !p.startsWith("."))!)
  }

  const wrong: {path: string, lang: string, from: string }[] = []

  for (const root of settings.docsRoots) {
    process.stderr.write(`\n  ${chalk.bold(root.to)}:`)

    const appDir = join(localCopy, root.from)
    const toDir = join(opts.toCwd, root.to)

    const en = join(appDir, "en")
    if (!existsSync(en)) {
      throw new Error(`No en folder found at ${en}.`)
    }

    const englishTree = recursiveReadDirSync(en)
    
    const allFolders = readdirSync(toDir)
    const languages = allFolders.filter(f => statSync(join(toDir, f)).isDirectory()).filter(f => f !== "en")
    languages.forEach(lang => {
      process.stderr.write(` ${lang}`)

      const fullpath = join(toDir, lang)
      const langTree = recursiveReadDirSync(fullpath)

      let error = false
      langTree.forEach(path => {
        const enRelative = path.replace(fullpath, "")
        const reRooted = join(appDir, "en", enRelative)
        
        if (!englishTree.includes(reRooted)) {
          error = true
          process.exitCode = 1
          wrong.push({ path, lang,  from: root.from})
        }
      })
      process.stderr.write(error ? cross : tick)
    })
  }
  console.error("")

  if (wrong.length) {
    console.error(chalk.bold.red("\nFiles with paths that aren't the same as English files:\n"))
     
    wrong.forEach(w => {
      console.error("  " + w.path)
    })

    console.error("\n")
  }
}
