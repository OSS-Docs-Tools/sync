import { readFileSync, readdirSync } from "fs"
import { moveEnFoldersIn, moveAllFoldersIn } from "../util/setupFolders"
import { existsSync, mkdirSync } from "fs"
import { join } from "path"
import { ghRepresentationForPath } from "../util/refForPath"
import { getGHTar } from "../util/getGHTar"

// node dist/index.js get-en --from-cwd ./fixtures/source --to-cwd fixtures/target

export const getEnglish = async (opts: { source: string; toCwd: string; fromCwd?: string, all:boolean }) => {
  const toDir = opts.toCwd
  const localizeJSONPath = join(toDir, "localize.json")
  if (!existsSync(localizeJSONPath)) {
    throw new Error(
      `There isn't a localize.json file in the root of the current working dir (expected at ${localizeJSONPath})`
    )
  }

  const settings = JSON.parse(readFileSync(localizeJSONPath, "utf8"))
  const ghRep = ghRepresentationForPath(opts.source)

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
    localCopy =  join(unzipped, readdirSync(unzipped).find(p => !p.startsWith("."))!)
  }

  if (opts.all) {
    moveAllFoldersIn(localCopy, toDir, settings)
  } else {
    moveEnFoldersIn(localCopy, toDir, settings)
  }
}
