CREATE TABLE IF NOT EXISTS "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "organization_themes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL UNIQUE,
    "primaryColor" TEXT NOT NULL DEFAULT '#001F3F',
    "logoUrl" TEXT,
    "backgroundStyle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "platform_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "end_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cpf" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "profilePhotoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "qrCodeToken" TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "presence_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "endUserId" TEXT,
    "accessTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "initialScanToken" TEXT
);

CREATE TABLE IF NOT EXISTS "user_consents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "endUserId" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "isGiven" BOOLEAN NOT NULL,
    "consentTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS "Organization_slug_idx" ON "Organization"("slug");
CREATE INDEX IF NOT EXISTS "platform_users_organizationId_idx" ON "platform_users"("organizationId");
CREATE INDEX IF NOT EXISTS "end_users_cpf_idx" ON "end_users"("cpf");
CREATE INDEX IF NOT EXISTS "Event_organizationId_idx" ON "Event"("organizationId");
CREATE INDEX IF NOT EXISTS "presence_logs_eventId_idx" ON "presence_logs"("eventId");
CREATE INDEX IF NOT EXISTS "presence_logs_endUserId_idx" ON "presence_logs"("endUserId");
CREATE INDEX IF NOT EXISTS "presence_logs_accessTimestamp_idx" ON "presence_logs"("accessTimestamp");
CREATE INDEX IF NOT EXISTS "user_consents_endUserId_idx" ON "user_consents"("endUserId");
CREATE UNIQUE INDEX IF NOT EXISTS "user_consents_endUserId_dataType_key" ON "user_consents"("endUserId", "dataType");

-- Foreign Keys
ALTER TABLE "organization_themes" ADD CONSTRAINT "organization_themes_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "platform_users" ADD CONSTRAINT "platform_users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "presence_logs" ADD CONSTRAINT "presence_logs_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "presence_logs" ADD CONSTRAINT "presence_logs_endUserId_fkey" FOREIGN KEY ("endUserId") REFERENCES "end_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "user_consents" ADD CONSTRAINT "user_consents_endUserId_fkey" FOREIGN KEY ("endUserId") REFERENCES "end_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
