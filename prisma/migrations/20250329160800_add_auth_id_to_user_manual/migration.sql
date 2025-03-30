-- Add the authId column to the public.users table
ALTER TABLE "public"."users" ADD COLUMN "authId" UUID;

-- Add a unique constraint to the new column (as defined in schema.prisma)
ALTER TABLE "public"."users" ADD CONSTRAINT "users_authId_key" UNIQUE ("authId");

-- Add the foreign key constraint referencing auth.users
-- Using ON DELETE RESTRICT as a safe default. Change if needed (e.g., SET NULL).
ALTER TABLE "public"."users"
ADD CONSTRAINT "users_authId_fkey"
FOREIGN KEY ("authId") REFERENCES "auth"."users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
