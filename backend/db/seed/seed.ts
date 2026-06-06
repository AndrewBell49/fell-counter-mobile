import { PgTable } from "drizzle-orm/pg-core"
import { drizzle } from "drizzle-orm/libsql"
import { reset } from "drizzle-seed"
import { getTableName, sql } from "drizzle-orm"

import { db } from ".."
import { fells } from "../schema/fells"
import { fellClassifications } from "../schema/fellClassifications"
import { classifications } from "../schema/classifications"
import { ENV } from "../../lib/env"
import {
  integer,
  real,
  SQLiteTable,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core"

const seedDb = drizzle(ENV.seedDbFileName)

const fellsSqlite = sqliteTable("fells", {
  id: integer().notNull().primaryKey(),
  name: text(),
  elevation: real(),
  latitude: real().notNull(),
  longitude: real().notNull(),
  country: text(),
})

const classificationsSqlite = sqliteTable("classifications", {
  id: integer().notNull().primaryKey(),
  name: text().notNull(),
  description: text().notNull(),
})

const fellClassificationsSqlite = sqliteTable("fellClassifications", {
  fellId: integer().notNull(),
  classificationId: integer().notNull(),
})

const BATCH_SIZE = 500

async function seedTable(sqliteTable: SQLiteTable, pgTable: PgTable) {
  const tableName = getTableName(pgTable)
  const numRows = await seedDb.$count(pgTable)

  for (let i = 0; i < numRows; i += BATCH_SIZE) {
    const seedData = await seedDb
      .select()
      .from(sqliteTable)
      .offset(i)
      .limit(BATCH_SIZE)
    await db.insert(pgTable).values(seedData)
    console.log(
      `Successfully seeded ${Math.min(i + BATCH_SIZE, numRows)} / ${numRows} ${tableName}`,
    )
  }

  console.log(`Fully seeded ${tableName}`)
}

async function seed() {
  console.log("Resetting database")
  await reset(db, { fells, classifications, fellClassifications })
  console.log("Database reset")

  await seedTable(fellsSqlite, fells).catch((err) => {
    console.error("Fell seed failed:", err)
    process.exit(1)
  })
  await seedTable(classificationsSqlite, classifications).catch((err) => {
    console.error("Classifications failed:", err)
    process.exit(1)
  })
  await seedTable(fellClassificationsSqlite, fellClassifications).catch(
    (err) => {
      console.error("Fell classifications failed:", err)
      process.exit(1)
    },
  )
  process.exit(0)
}

await seed()
