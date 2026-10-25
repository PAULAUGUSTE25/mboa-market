BEGIN;

ALTER TABLE community_posts
    ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS ix_community_posts_created_at
    ON community_posts(created_at);
CREATE INDEX IF NOT EXISTS ix_community_posts_domain_created_at
    ON community_posts(domain, created_at);

ALTER TABLE post_comments
    ALTER COLUMN author_id DROP NOT NULL;

ALTER TABLE post_comments
    ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE post_comments
    ADD COLUMN IF NOT EXISTS auto_reply_to_id VARCHAR(36)
    REFERENCES post_comments(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS uq_post_comment_auto_reply_to
    ON post_comments(auto_reply_to_id);
CREATE INDEX IF NOT EXISTS ix_post_comments_post_created_at
    ON post_comments(post_id, created_at);

COMMIT;
