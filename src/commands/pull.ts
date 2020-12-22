import {readFileSync} from "fs"

// import {join} from "path"


import {moveEnFoldersIn} from "../util/setupFolders"
import type { CLIOpts } from "..";
import { getGHTar } from "../util/getGHTar";
import { ghRepresentationForPath } from "../util/refForPath";

export const pullCommand = async (opts: { repo: string }) => {

    const ghRep = ghRepresentationForPath(opts.repo)



    // await getGHTar({ 
    //     user: ghRep.repoSlug!.split("/")[0], 
    //     repo: ghRep.repoSlug!.split("/")[1], 
    //     branch: ghRep.branch,
    //     to: "./tmp"
    // })

    // const fixtures = join("./fixtures")

    const settings = JSON.parse(readFileSync("fixtures/target/localize.json", "utf8"))
    console.log(settings)
    moveEnFoldersIn("fixtures/source", "fixtures/target", settings)

    console.log("after")

}