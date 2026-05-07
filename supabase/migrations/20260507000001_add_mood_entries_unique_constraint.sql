-- Remove any duplicate (user_id, date) rows that accumulated before this constraint,
-- keeping the most recent row for each day (tie-break: latest id).
DELETE FROM mood_entries AS m
WHERE id <> (
  SELECT id FROM mood_entries
  WHERE user_id = m.user_id AND date = m.date
  ORDER BY id DESC
  LIMIT 1
);

-- The initial schema already created a non-unique index on (user_id, date).
-- Drop it now — the unique constraint below creates its own index, making it redundant.
DROP INDEX IF EXISTS mood_entries_user_id_date_idx;

ALTER TABLE mood_entries
  ADD CONSTRAINT mood_entries_user_id_date_key UNIQUE (user_id, date);
