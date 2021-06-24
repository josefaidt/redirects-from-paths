import { readFileSync } from 'fs'
import { writeFile } from 'fs/promises'
import { EOL } from 'os'
import { resolve } from 'path'

const dataFilePath = resolve('josefaidt-dev-metrics.csv')
export const data = readFileSync(dataFilePath, 'utf8')
  .split(EOL)
  .filter(Boolean)
  .map((line) => line.split(','))

export function getViewsFromSlug(slug) {
  return data.find(([oldSlug, views]) => oldSlug.contains(slug))?.[1]
}

const pathMap = data.map(([oldPath]) => {
  let name = oldPath.split('/').filter(Boolean).pop()
  let newPath = `/posts/${name}`
  return [oldPath, newPath]
})

async function generateVercelRedirects() {
  return JSON.stringify(
    {
      redirects: pathMap.map(([oldPath, newPath]) => {
        return {
          source: oldPath,
          destination: newPath,
        }
      }),
    },
    null,
    2
  )
}

async function generateNetlifyRedirects() {
  return [
    '# Redirects from what the browser requests to what we serve',
    ...pathMap.map((arr) => arr.join(' ')),
  ].join(EOL)
}

async function main() {
  await writeFile('vercel.json', await generateVercelRedirects(), 'utf-8')
  await writeFile('_redirects', await generateNetlifyRedirects(), 'utf-8')
}

main()
