import process from 'node:process'
import { Octokit } from 'octokit'

if (!process.env.GITHUB_TOKEN) {
  throw new Error('GITHUB_TOKEN environment variable is required')
}

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

export {
  octokit,
}
