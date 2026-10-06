CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  display_name text NOT NULL,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'organizer', 'admin')),
  department text,
  year smallint CHECK (year IS NULL OR year BETWEEN 1 AND 8),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX users_email_lower_unique ON users (lower(email));
CREATE INDEX users_role_idx ON users (role);

CREATE TABLE clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  owner_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX clubs_owner_user_id_idx ON clubs (owner_user_id);

CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid REFERENCES clubs(id) ON DELETE SET NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  registration_deadline timestamptz,
  venue text,
  capacity integer CHECK (capacity IS NULL OR capacity > 0),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at),
  CHECK (registration_deadline IS NULL OR registration_deadline <= starts_at)
);

CREATE INDEX events_status_starts_at_idx ON events (status, starts_at);
CREATE INDEX events_club_id_idx ON events (club_id);
CREATE INDEX events_created_by_idx ON events (created_by);

CREATE TABLE event_registrations (
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'waitlisted', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

CREATE INDEX event_registrations_user_id_idx ON event_registrations (user_id);
CREATE INDEX event_registrations_event_status_idx ON event_registrations (event_id, status);

CREATE TABLE opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  title text NOT NULL,
  organization text NOT NULL,
  description text NOT NULL,
  opportunity_type text NOT NULL,
  application_url text,
  deadline timestamptz,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX opportunities_status_deadline_idx ON opportunities (status, deadline);
CREATE INDEX opportunities_created_by_idx ON opportunities (created_by);

CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  max_members smallint NOT NULL DEFAULT 5 CHECK (max_members BETWEEN 1 AND 20),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX teams_event_id_idx ON teams (event_id);
CREATE INDEX teams_created_by_idx ON teams (created_by);

CREATE TABLE team_members (
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);

CREATE INDEX team_members_user_id_idx ON team_members (user_id);
CREATE INDEX team_members_team_status_idx ON team_members (team_id, status);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  title text NOT NULL,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notifications_user_created_at_idx ON notifications (user_id, created_at DESC);
CREATE INDEX notifications_unread_idx ON notifications (user_id, created_at DESC) WHERE read_at IS NULL;
