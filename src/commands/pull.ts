// node dist/index.js pull  asda/asdasd 111 --from-cwd ./fixtures/target --to-cwd fixtures/source

import { readFileSync } from "fs"
import { moveLocaleFoldersIn } from "../util/setupFolders"
import { existsSync, mkdirSync } from "fs"
import { join } from "path"
import { ghRepresentationForPath } from "../util/refForPath"
import { getGHTar } from "../util/getGHTar"

export const pullCommand = async (opts: { target: string; toCwd: string; fromCwd?: string }) => {
  const ghRep = ghRepresentationForPath(opts.target)

  const cachedir: string = require("cachedir")("oss-doc-sync")
  const [user, repo] = ghRep.repoSlug!.split("/")
  const localCopy = opts.fromCwd || join(cachedir, user, repo)
  const toDir = opts.toCwd

  // Grab a copy of the other repo, and pull in the files
  if (!existsSync(localCopy)) {
    mkdirSync(join(cachedir, user))
    await getGHTar({
      user,
      repo,
      branch: ghRep.branch,
      to: localCopy,
    })
  }

  const localizeJSONPath = join(localCopy, "localize.json")
  if (!existsSync(localizeJSONPath)) {
    throw new Error(
      `There isn't a localize.json file in the root of this: ${user}/${repo}#${ghRep.branch} (locally found at ${localizeJSONPath})`
    )
  }

  const settings = JSON.parse(readFileSync(localizeJSONPath, "utf8"))
  moveLocaleFoldersIn(toDir, localCopy, settings)
}
