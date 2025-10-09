"use server"
import dotenv from "dotenv"

dotenv.config()


export default async ()=> {
   return { baseUrl :process.env.BACKEND_URL}
}