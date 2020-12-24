// Based on fork of https://github.com/c8r/initit/blob/master/index.js
// which is MIT licensed

import path from "path"
import tar from "tar-fs"
import gunzip from "gunzip-maybe"
import https from "https"

interface TarOpts {
  user: string
  repo: string
  to: string
  branch: string
  templatepath?: string
}

export const getGHTar = ({ user, branch, repo, templatepath = "", to }: TarOpts) => {
  return new Promise((resolve, reject) => {
    const ignorePrefix = "__INITIT_IGNORE__/"
    const ignorepath = path.join(to, ignorePrefix)
    const extractTar = tar.extract(to, {
      map: (header: any) => {
        const suffix = branch === "v2" ? "-2" : ""
        const prefix = `${repo}${suffix}/${templatepath}`
        if (header.name.startsWith(prefix)) {
          return Object.assign({}, header, {
            name: header.name.substr(prefix.length),
          })
        } else {
          return Object.assign({}, header, {
            name: ignorePrefix + header.name,
          })
        }
      },
      ignore: (filepath: string) => {
        const isInIgnoreFolder = !path.relative(ignorepath, filepath).startsWith("..")
        return isInIgnoreFolder
      },
    })
    https.get(`https://codeload.github.com/${user}/${repo}/tar.gz/${branch}`, (response: any) => response.pipe(gunzip()).pipe(extractTar))
    extractTar.on("error", reject)
    extractTar.on("finish", resolve)
  })
}
