'use strict';
/**
 * safe-migrate.js
 *
 * Startup script that runs on every deploy. Handles three scenarios safely:
 *
 *   1. Fresh DB (no tables) → prisma migrate deploy creates schema from migrations,
 *      then seeds the catalog.
 *   2. Existing DB without _prisma_migrations (was bootstrapped via db push) →
 *      baselines structural migrations, runs deploy for additive ones, then seeds.
 *   3. Existing DB with _prisma_migrations → runs deploy normally (idempotent),
 *      seeds only if catalog is empty.
 *
 * Never uses --accept-data-loss. Never drops tables or data.
 * Seed is always idempotent (upsert): safe to run on re-deploys.
 */

const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

// Migrations to baseline on existing DBs without migration history.
// Only include migrations whose DDL is guaranteed to already be in the DB.
// Additive migrations (0001, 0002) are excluded so migrate deploy actually runs them.
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
  // ── Step 1: Detect DB state ──────────────────────────────────────────────────
  const prisma = new PrismaClient();
  let state;
  try {
    state = await detectState(prisma);
  } finally {
    await prisma.$disconnect();
  }

  const { hasTables, hasMigrations } = state;

  // ── Step 2: Baseline if needed ───────────────────────────────────────────────
  if (hasTables && !hasMigrations) {
    console.log('[safe-migrate] Existing schema without migration history detected.');
    console.log('[safe-migrate] Baselining structural migrations (additive migrations will run)...');
    for (const migration of BASELINE_MIGRATIONS) {
      run(`npx prisma migrate resolve --applied ${migration}`);
    }
    console.log('[safe-migrate] Baseline complete.');
  }

  // ── Step 3: Apply pending migrations ─────────────────────────────────────────
  console.log('[safe-migrate] Running prisma migrate deploy...');
  run('npx prisma migrate deploy');
  console.log('[safe-migrate] Migrations done.');

  // ── Step 4: Auto-seed catalog (idempotent — skipped if catalog already exists) ──
  const prisma2 = new PrismaClient();
  try {
    const serviceCount = await prisma2.service.count();
    if (serviceCount === 0) {
      console.log('[safe-migrate] Catalog is empty — running seed...');
      run('node prisma/seed.js');
      console.log('[safe-migrate] Seed complete.');
    } else {
      console.log(`[safe-migrate] Catalog already has ${serviceCount} service(s) — skipping seed.`);
    }
  } finally {
    await prisma2.$disconnect();
  }

  console.log('[safe-migrate] Startup complete.');
}

main().catch((err) => {
  console.error('[safe-migrate] Fatal error:', err.message);
  process.exit(1);
});
