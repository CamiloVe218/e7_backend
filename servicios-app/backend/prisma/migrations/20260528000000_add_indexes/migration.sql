-- Add performance indexes for frequently-filtered columns

-- ServiceRequest: clientId filter (CLIENTE dashboard)
CREATE INDEX IF NOT EXISTS "service_requests_clientId_idx" ON "service_requests"("clientId");

-- ServiceRequest: providerId filter (PROVEEDOR dashboard)
CREATE INDEX IF NOT EXISTS "service_requests_providerId_idx" ON "service_requests"("providerId");

-- ServiceRequest: status filter (all dashboards + admin stats)
CREATE INDEX IF NOT EXISTS "service_requests_status_idx" ON "service_requests"("status");

-- ServiceRequest: createdAt for ordered listing
CREATE INDEX IF NOT EXISTS "service_requests_createdAt_idx" ON "service_requests"("createdAt");

-- Rating: providerId for provider rating lookup
CREATE INDEX IF NOT EXISTS "ratings_providerId_idx" ON "ratings"("providerId");

-- Rating: clientId for client rating history
CREATE INDEX IF NOT EXISTS "ratings_clientId_idx" ON "ratings"("clientId");
