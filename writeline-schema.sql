-- WriteLine Database Schema
-- A simplified version control system for creative writers

-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stories (like repositories)
CREATE TABLE stories (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  genre VARCHAR(100),
  is_public BOOLEAN DEFAULT false,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  forked_from INTEGER REFERENCES stories(id) ON DELETE SET NULL,
  default_timeline VARCHAR(100) DEFAULT 'main',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Timelines (like branches)
CREATE TABLE timelines (
  id SERIAL PRIMARY KEY,
  story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_from INTEGER REFERENCES timelines(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(story_id, name)
);

-- Versions (like commits)
CREATE TABLE versions (
  id SERIAL PRIMARY KEY,
  timeline_id INTEGER REFERENCES timelines(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title VARCHAR(255),
  content TEXT NOT NULL,
  message TEXT,
  word_count INTEGER DEFAULT 0,
  character_count INTEGER DEFAULT 0,
  author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  parent_version_id INTEGER REFERENCES versions(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(timeline_id, version_number)
);

-- Collaborators
CREATE TABLE collaborators (
  id SERIAL PRIMARY KEY,
  story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) CHECK (role IN ('owner', 'co-author', 'editor', 'reader')),
  invited_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  invited_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  UNIQUE(story_id, user_id)
);

-- Comments (feedback on specific versions)
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  version_id INTEGER REFERENCES versions(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  position INTEGER, -- character position in the document
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Stars (like GitHub stars)
CREATE TABLE stars (
  id SERIAL PRIMARY KEY,
  story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

-- Follows (follow authors)
CREATE TABLE follows (
  id SERIAL PRIMARY KEY,
  follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Tags for stories
CREATE TABLE story_tags (
  id SERIAL PRIMARY KEY,
  story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
  tag VARCHAR(50) NOT NULL,
  UNIQUE(story_id, tag)
);

-- Create indexes for performance
CREATE INDEX idx_stories_owner ON stories(owner_id);
CREATE INDEX idx_stories_public ON stories(is_public);
CREATE INDEX idx_timelines_story ON timelines(story_id);
CREATE INDEX idx_versions_timeline ON versions(timeline_id);
CREATE INDEX idx_versions_author ON versions(author_id);
CREATE INDEX idx_collaborators_story ON collaborators(story_id);
CREATE INDEX idx_collaborators_user ON collaborators(user_id);
CREATE INDEX idx_comments_version ON comments(version_id);
CREATE INDEX idx_stars_story ON stars(story_id);
CREATE INDEX idx_stars_user ON stars(user_id);
CREATE INDEX idx_story_tags_story ON story_tags(story_id);
