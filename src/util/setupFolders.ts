import chalk from "chalk"
import { readdirSync, existsSync, statSync, rmdirSync } from "fs"
import { join } from "path"
import type { Settings } from ".."

const mvdir = require("mvdir")

export const moveAllFoldersIn = async (fromWD: string, toWD: string, settings: Settings) => {
  for (const root of settings.docsRoots) {
    const fromDir = join(fromWD, root.from)
    const toDir = join(toWD, root.to)

    const allFolders = readdirSync(fromDir)
    const folders = allFolders.filter(f => statSync(join(fromDir, f)).isDirectory()).filter(f => f !== "en")

    for (const lang of folders) {
      await mvdir(join(fromDir, lang), join(toDir, lang), { copy: true })
    }
  }
}

export const moveEnFoldersIn = async (fromWD: string, toWD: string, settings: Settings) => {
  const name = fromWD.includes("tmp") || fromWD.includes("Caches") ? settings.app : fromWD
  console.error(`Moved en files from ${chalk.bold(name)}:\n`)

  for (const root of settings.docsRoots) {
    const fromDir = join(fromWD, root.from)
    const toDir = join(toWD, root.to)
    const toEN = join(toDir, "en")

    const en = join(fromDir, "en")
    if (!existsSync(en)) {
      throw new Error(`No en folder found at ${en}.`)
    }

    await mvdir(en, toEN, { copy: true })
    console.error(`  ${chalk.bold(root.from)} -> ${chalk.bold(toEN)}`)
  }
  console.error("")
}

export const moveLocaleFoldersIn = async (appWD: string, lclWD: string, settings: Settings) => {
  const isFromTmp = lclWD.includes("tmp") || lclWD.includes("Caches")
  const name = isFromTmp ? settings.app : lclWD
  console.error(`Moved locale files from ${chalk.bold(name)}:\n`)

  for (const root of settings.docsRoots) {
    const fromDir = join(lclWD, root.to)
    const toDir = join(appWD, root.from)

    const allFolders = readdirSync(fromDir)
    const folders = allFolders.filter(f => statSync(join(fromDir, f)).isDirectory()).filter(f => f !== "en")
    for (const lang of folders) {
      await mvdir(join(fromDir, lang), join(toDir, lang), { copy: true })
    }

    const displayFrom = isFromTmp ? "[cache]" + fromDir.replace(root.from, "") : fromDir
    console.error(`  ${chalk.bold(displayFrom)} [${folders.join(", ")}] -> ${chalk.bold(toDir)}`)
  }

  console.error("")
}

export const deleteLocaleFiles = async (appWD: string, lclWD: string, settings: Settings) => {
  const isFromTmp = lclWD.includes("tmp") || lclWD.includes("Caches")
  const name = isFromTmp ? settings.app : lclWD
  console.error(`Moved preparing to delete locales from ${chalk.bold(name)}:\n`)

  for (const root of settings.docsRoots) {
    const fromDir = join(lclWD, root.to)
    const toDir = join(appWD, root.from)
    
    
    const allFolders = readdirSync(fromDir)
    const folders = allFolders.filter(f => statSync(join(fromDir, f)).isDirectory()).filter(f => f !== "en")
    for (const lang of folders) {
      rmdirSync(join(toDir, lang), { recursive: true })
    }

    console.error(`  ${chalk.bold("rm'd")} [${folders.join(", ")}]`)
  }

  console.error("")
}

