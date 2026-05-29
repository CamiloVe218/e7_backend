-- Track whether a user has a pending cancellation fee.
-- Set to true when a CLIENTE cancels a request that was already ACEPTADA or EN_PROCESO.
-- Will be used in a future phase to add a $100 MXN surcharge on their next request.
-- IF NOT EXISTS is safe on any DB state.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pendingCancellationFee" BOOLEAN NOT NULL DEFAULT false;
