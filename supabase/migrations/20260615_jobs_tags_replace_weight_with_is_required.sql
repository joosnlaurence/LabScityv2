ALTER TABLE jobs_tags DROP COLUMN weight;
ALTER TABLE jobs_tags ADD COLUMN is_required boolean NOT NULL DEFAULT false;