import axios from 'npm:axios@1.4.0'
import { Anima } from "../../@types/anima.d.ts";

export function splitArray<T>(arr: T[]): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += 4) {
    result.push(arr.slice(i, i + 4))
  }
  return result
}

export async function loginAsMidori() {
  return await axios.post<Anima.API.Login>(
    `${Deno.env.get('ANIMA_API')}/auth/sigin`,
    {
      username: Deno.env.get('MIDORI_USERNAME'),
      password: Deno.env.get('MIDORI_PASSWORD'),
    },
    {
      headers: {
        "Content-Type": "application/json"
      },
      params: {
        locale: 'en-US'
      }
    }
  )
}