-- Enable research on an existing Claude Sonnet 4.6 model without changing its
-- other admin-configured settings.
UPDATE "model"
SET "is_web_search" = true,
    "web_search_cost" = COALESCE("web_search_cost", 0.01)
WHERE "api_name" = 'claude-sonnet-4-6'
  AND "api_vendor_id" IN (
    SELECT "id" FROM "api_vendor" WHERE "name" = 'anthropic'
  );

-- Older seed data supplies explicit IDs, so sync the sequence before adding a
-- model to an installation that does not already have this model configured.
SELECT setval(
  pg_get_serial_sequence('model', 'id'),
  COALESCE((SELECT MAX("id") FROM "model"), 1),
  EXISTS(SELECT 1 FROM "model")
);

WITH vendor AS (
  SELECT "id" FROM "api_vendor" WHERE "name" = 'anthropic' LIMIT 1
)
INSERT INTO "model" (
  "api_name", "name", "is_vision", "is_image_generation", "is_web_search",
  "is_thinking", "api_vendor_id", "input_token_cost", "output_token_cost",
  "web_search_cost", "paid_only"
)
SELECT
  'claude-sonnet-4-6', 'Claude Sonnet 4.6', true, false, true,
  true, vendor."id", 0.000003, 0.000015, 0.01, false
FROM vendor
WHERE NOT EXISTS (
  SELECT 1 FROM "model"
  WHERE "api_name" = 'claude-sonnet-4-6'
    AND "api_vendor_id" = vendor."id"
);
