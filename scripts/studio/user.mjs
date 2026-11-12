// Studio account recovery from the command line (needs DATABASE_URL, e.g. from `vercel env pull .env.local`).
//
//   pnpm studio:user list
//   pnpm studio:user reset-password someone@example.com     prompts for the new password
//   pnpm studio:user make-admin someone@example.com
//
// Normal account management happens on the Studio's Team page.
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline/promises'
import { fileURLToPath } from 'node:url'

import { hashPassword } from 'better-auth/crypto'
import pg from 'pg'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
for (const file of ['.env.local', '.env']) {
  const full = path.join(root, file)
  if (!process.env.DATABASE_URL && fs.existsSync(full)) process.loadEnvFile(full)
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set.')
  process.exit(1)
}

const [command, emailArg] = process.argv.slice(2)
const email = emailArg?.trim().toLowerCase()
const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

async function findUser() {
  if (!email) throw new Error('Give the account email address.')
  const { rows } = await client.query('SELECT id, name, email, role FROM studio_user WHERE lower(email) = $1', [email])
  if (!rows[0]) throw new Error(`No Studio account for ${email}.`)
  return rows[0]
}

try {
  if (command === 'list') {
    const { rows } = await client.query('SELECT name, email, role, created_at FROM studio_user ORDER BY created_at')
    console.table(rows)
  } else if (command === 'reset-password') {
    const user = await findUser()
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const password = await rl.question(`New password for ${user.email} (10+ characters): `)
    rl.close()
    if (password.length < 10 || password.length > 128) throw new Error('Passwords need 10 to 128 characters.')
    const hash = await hashPassword(password)
    const { rowCount } = await client.query(
      "UPDATE studio_account SET password = $1, updated_at = now() WHERE user_id = $2 AND provider_id = 'credential'",
      [hash, user.id],
    )
    if (!rowCount) {
      await client.query(
        "INSERT INTO studio_account (id, account_id, provider_id, user_id, password) VALUES ($1, $2, 'credential', $2, $3)",
        [crypto.randomUUID(), user.id, hash],
      )
    }
    await client.query('DELETE FROM studio_session WHERE user_id = $1', [user.id])
    console.log(`Password changed for ${user.email}. Their other sessions were signed out.`)
  } else if (command === 'make-admin') {
    const user = await findUser()
    await client.query("UPDATE studio_user SET role = 'admin', updated_at = now() WHERE id = $1", [user.id])
    console.log(`${user.email} is now an admin.`)
  } else {
    console.log('Usage: pnpm studio:user list | reset-password <email> | make-admin <email>')
  }
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  await client.end()
}
