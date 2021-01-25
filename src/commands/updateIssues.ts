import chalk from "chalk"
import { join, basename } from "path"
import {existsSync, readFileSync} from "fs"
import { Settings } from ".."
import { recursiveReadDirSync } from "../util/recursiveReadDirSync"
import { ghRepresentationForPath } from "../util/refForPath"
import { cloneRepo } from "../util/cloneRepo"
import * as https from "https"

const cwd = "."

export const updateIssues = async (args: {thisRepo: string}) => {
  const localizeJSONPath = join(cwd, "localize.json")
  if (!existsSync(localizeJSONPath)) {
    throw new Error(`There isn't a localize.json file in the root of the current working dir (expected at ${localizeJSONPath})`)
  }

  const settings = JSON.parse(readFileSync(localizeJSONPath, "utf8")) as Settings
  const ghRep = ghRepresentationForPath(settings.app)

  // Grab a copy of the other repo, and pull in the files
  const appRoot = await cloneRepo(ghRep)
  
  const langs = Object.keys(settings.issues)
  for (const lang of langs) {
    
    const todo = getAllTODOFiles(appRoot, settings, lang)
    const md = toMarkdown(todo, args.thisRepo)
      if (!process.env.GITHUB_ACCESS_TOKEN) {
      console.log(chalk.bold("Printing to console because GITHUB_ACCESS_TOKEN is not set"))
      console.log(md)
    } else {
      await updateGitHubIssue({ number: settings.issues[lang], repo: args.thisRepo, markdown: md, lang, token: process.env.GITHUB_ACCESS_TOKEN })
    }
  }
}

const getAllTODOFiles = (appCWD: string, settings:Settings, lang: string) => {
  const diffFolders = (en: string,  thisLang: string) => {

    const englishFiles = recursiveReadDirSync(en)
    const thisLangFiles = recursiveReadDirSync(thisLang)

    const todo: string[] = []
    const done: string[] = []
    englishFiles.forEach(enFile => {
      const localFile = enFile.replace(en, "").replace("/en/", `/${lang}/`)
      const reRooted = join(thisLang, localFile)
      if (thisLangFiles.includes(reRooted)) {
        done.push(localFile)
      } else {
        todo.push(enFile)
      }
    })

    return { todo, done }
  }

  const todos: Record<string, any> = {}
  for (const root of settings.docsRoots) {
    process.stderr.write(`\n  ${chalk.bold(root.to)}:`)

    const appDir = join(appCWD, root.from)
    const toDir = join(cwd, root.to)

    const en = join(appDir, "en")
    if (!existsSync(en)) {
      throw new Error(`No en folder found at ${en}.`)
    }

    const langRoot = join(toDir, lang)
    todos[root.name] = diffFolders(en, langRoot)

  }

  return todos
}

let totalDone = 0
let totalTodo = 0

const toMarkdown = (files: Record<string, { todo: string[], done: string[] }>, repo: string) => {
  const md = [""]

  const markdownLink = (f: string, done: boolean) => {
    const name = basename(f)
    const url = `https://github.com/${repo}/blob/v2/packages`
    const check = done ? "x" : " "
    return `- [${check}] [\`${name}\`](${url}${f.replace(/ /g, "%20")})`
  }

  Object.keys(files).forEach(section => {
    const todo = files[section].todo
    const done = files[section].done

    md.push("\n\n## " + section + "\n")
    md.push(`Done: ${done.length}, TODO: ${todo.length}.\n\n`)
    done.forEach(f => {
      md.push(markdownLink(f, true))
    })

    todo.forEach(f => {
      md.push(markdownLink(f, false))
    })

    totalDone += done.length
    totalTodo += todo.length
  })

  md[0] = `For this language there are ${totalDone} translated files, with ${totalTodo} TODO.\n\n`
  return md.join("\n")
}
function updateGitHubIssue(args: { number: number; repo: string; markdown: string, lang: string, token: string }) {
  // https://docs.github.com/en/rest/reference/issues#update-an-issue

  const data = JSON.stringify({
    body: args.markdown,
    labels: ["Translation Summary", args.lang]
  })
  
  const options = {
    hostname: 'api.github.com',
    port: 443,
    path: `/repos/${args.repo}/issues/${args.number}`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      "Accept": "application/vnd.github.v3+json",
      'User-Agent': "OSS Docs Sync Issue Auto-Updater",
      Authorization: `token ${args.token}`
    }
  }
  
  const req = https.request(options, res => { console.log(`statusCode: ${res.statusCode}`)  })
  req.on('error', error => {
    console.error(error)
  })
  req.write(data)
  req.end()
}

