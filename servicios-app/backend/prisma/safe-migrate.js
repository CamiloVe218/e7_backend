'use strict';
/**
 * safe-migrate.js
 *
 * Startup migration script that handles two scenarios safely:
 *
 *   1. Fresh DB (no tables) → prisma migrate deploy creates everything from migrations.
 *   2. Existing DB without _prisma_migrations (was bootstrapped via db push) →
 *      baselines all known migrations as "already applied", then runs deploy
 *      so future migrations are tracked correctly.
 *   3. Existing DB with _prisma_migrations → runs deploy normally (idempotent).
 *
 * Never uses --accept-data-loss. Never drops tables or data.
 */

const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

// Migrations to baseline on existing DBs without migration history.
// Only include migrations whose DDL is guaranteed to already be in the DB
// (created via prisma db push with an older schema).
// Migrations that add NEW columns (like 0001, 0002) are intentionally excluded
// from this list so prisma migrate deploy actually runs their SQL.
const BASELINE_MIGRATIONS = [
  '20260101000000_init',
  '20260528000000_add_indexes',
];

async function detectState(prisma) {
  const rows = await prisma.$queryRaw`
    SELECT
      EXISTS(
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'users'
      ) AS has_tables,
      EXISTS(
        SELECT 1 FROM information_schema.tables
        WHERE table_name = '_prisma_migrations'
      ) AS has_migrations
  `;
  return {
    hasTables:     rows[0].has_tables,
    hasMigrations: rows[0].has_migrations,
  };
}

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

async function main() {
  const prisma = new PrismaClient();

  let state;
  try {
    state = await detectState(prisma);
  } finally {
    await prisma.$disconnect();
  }

  const { hasTables, hasMigrations } = state;

  if (hasTables && !hasMigrations) {
    console.log('[safe-migrate] Existing schema without migration history detected.');
    console.log('[safe-migrate] Baselining structural migrations (additive migrations will run)...');
    for (const migration of BASELINE_MIGRATIONS) {
      run(`npx prisma migrate resolve --applied ${migration}`);
    }
    console.log('[safe-migrate] Baseline complete.');
  }

  console.log('[safe-migrate] Running prisma migrate deploy...');
  run('npx prisma migrate deploy');
  console.log('[safe-migrate] Done.');
}

main().catch((err) => {
  console.error('[safe-migrate] Fatal error:', err.message);
  process.exit(1);
});
