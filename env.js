import dotenv from "dotenv"
dotenv.config()
const BASE_URL = process.env.BASE_URL
const API_KEY = process.env.API_KEY
const MODEL_NAME = process.env.MODEL_NAME
const github_webhook_secret = process.env.GITHUB_WEBHOOK_SECRET
const github_token = process.env.GITHUB_TOKEN
const portfolio_repo = process.env.PORTFOLIO_REPO
export {
    BASE_URL,
    API_KEY,
    MODEL_NAME,
    github_webhook_secret,
    github_token,
    portfolio_repo,
}