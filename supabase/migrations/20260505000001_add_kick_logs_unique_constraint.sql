-- Remove any duplicate (user_id, date) rows that accumulated before this constraint,
-- keeping the row with the highest count for each day (tie-break: latest id).
DELETE FROM kick_logs AS k
WHERE id <> (
  SELECT id FROM kick_logs
  WHERE user_id = k.user_id AND date = k.date
  ORDER BY count DESC, id DESC
  LIMIT 1
);

-- The initial schema already created a non-unique index on (user_id, date).
-- Drop it now — the unique constraint below creates its own index, making it redundant.
DROP INDEX IF EXISTS kick_logs_user_id_date_idx;

ALTER TABLE kick_logs
  ADD CONSTRAINT kick_logs_user_id_date_key UNIQUE (user_id, date);
