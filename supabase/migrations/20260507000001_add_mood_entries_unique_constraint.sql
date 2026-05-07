-- Remove any duplicate (user_id, date) rows before adding the unique constraint.
-- Tie-break: highest id value (deterministic; id is UUID v4 so not insertion-order).
-- Single-pass window function avoids the per-row re-scan of a correlated subquery.
DELETE FROM mood_entries
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY user_id, date ORDER BY id DESC) AS rn
    FROM mood_entries
  ) ranked
  WHERE rn > 1
);

-- The initial schema already created a non-unique index on (user_id, date).
-- Drop it now — the unique constraint below creates its own index, making it redundant.
DROP INDEX IF EXISTS mood_entries_user_id_date_idx;

ALTER TABLE mood_entries
  ADD CONSTRAINT mood_entries_user_id_date_key UNIQUE (user_id, date);
