ALTER TABLE publication_tags 
ADD CONSTRAINT publication_tags_publication_id_tag_id_key 
UNIQUE (publication_id, tag_id);