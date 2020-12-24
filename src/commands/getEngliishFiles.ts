import { readFileSync } from "fs"
import { moveEnFoldersIn } from "../util/setupFolders"
import { existsSync, mkdirSync } from "fs"
import { join } from "path"
import { ghRepresentationForPath } from "../util/refForPath"
import { getGHTar } from "../util/getGHTar"

// node dist/index.js get-en  asda/asdasd 111 --from-cwd ./fixtures/source --to-cwd fixtures/target

export const getEnglish = async (opts: { source: string, toCwd: string, fromCwd?: string }) => {
  const ghRep = ghRepresentationForPath(opts.source)

  console.log(opts, ghRep)
  const cachedir: string = require("cachedir")("oss-doc-sync")
  const [user, repo] = ghRep.repoSlug!.split("/")
  const localCopy = opts.fromCwd || join(cachedir, user, repo)
  const toDir = opts.toCwd

  if (!existsSync(localCopy)) {
    mkdirSync(join(cachedir, user))
    await getGHTar({
      user,
      repo,
      branch: ghRep.branch,
      to: localCopy,
    })
  }

  const localizeJSONPath = join(toDir, "localize.json")
  if (!existsSync(localizeJSONPath)) {
    throw new Error(`There isn't a localize.json file in the root of the repo: ${user}/${repo}#${ghRep.branch} (expected at ${localizeJSONPath})`)
  }

  const settings = JSON.parse(readFileSync(localizeJSONPath, "utf8"))
  moveEnFoldersIn(localCopy, toDir, settings)
}
