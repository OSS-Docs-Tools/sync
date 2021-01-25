import { existsSync, mkdirSync, readdirSync } from "fs"
import { join } from "path"
import { getGHTar } from "../util/getGHTar"
import { GHRep } from "./refForPath"

export const cloneRepo = async (ghRep: GHRep) => {
  const cachedir: string = require("cachedir")("oss-doc-sync")
  const [user, repo] = ghRep.repoSlug!.split("/")

  if (!existsSync(cachedir)) mkdirSync(cachedir);
  if (!existsSync(join(cachedir, user))) mkdirSync(join(cachedir, user));

  await getGHTar({
    user,
    repo,
    branch: ghRep.branch,
    to: join(cachedir, user, repo),
  })
  

  const unzipped = join(cachedir, user, repo)
  return join(unzipped, readdirSync(unzipped).find(p => !p.startsWith("."))!)
}
