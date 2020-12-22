import {readdirSync, existsSync, statSync} from "fs"
import {join} from "path"
const mvdir = require('mvdir');


interface Settings {
    docsRoots: Array<{ from: string, to: string }>
}

export const moveEnFoldersIn = async (fromWD: string, toWD: string, settings: Settings) => {
    for (const root of settings.docsRoots) {
        const fromDir = join(fromWD, root.from)
        const toDir = join(toWD, root.to)
        const toEN = join(toDir, "en")
        
        const en = join(fromDir, "en")
        if (!existsSync(en)) {
            throw new Error(`No en folder found at ${en}.`)
        }
        
        await mvdir(en, toEN, { copy: true})
    }
}

export const moveLocaleFoldersIn = async (appWD: string, lclWD: string, settings: Settings) => {
    for (const root of settings.docsRoots) {
        const fromDir = join(lclWD, root.to)
        const toDir = join(appWD, root.from)
        
        // const en = join(fromDir, "en")
        const allFolders = readdirSync(fromDir)
        const folders = allFolders.filter( f => statSync(join(lclWD, f)).isDirectory() ).filter(f => f !== "en")
        for (const lang of folders) {
            await mvdir(join(fromDir, lang), join(toDir),  { copy: true})
        }
    }
}