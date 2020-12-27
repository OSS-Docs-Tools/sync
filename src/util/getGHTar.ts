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
      ignore: (filepath: string) => {
        const isInIgnoreFolder = !path.relative(ignorepath, filepath).startsWith("..")
        return isInIgnoreFolder
      },
    })
    const url = `https://codeload.github.com/${user}/${repo}/tar.gz/${branch}`
    https.get(url, (response: any) => response.pipe(gunzip()).pipe(extractTar))
    extractTar.on("error", err => {
      console.error(`Could not download from ${url} - maybe wrong branch?`)
      reject(err)
    })
    extractTar.on("finish", resolve)
  })
}
