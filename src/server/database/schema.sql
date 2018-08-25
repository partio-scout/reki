BEGIN;

CREATE TABLE participant (
  participant_id serial PRIMARY KEY,
  member_number text CHECK (member_number <> ''),
  first_name text NOT NULL CHECK (first_name <> ''),
  last_name text NOT NULL CHECK (last_name <> ''),
  local_group text NOT NULL CHECK (local_group <> ''),
  sub_camp text NOT NULL CHECK (sub_camp <> ''),
  village text NOT NULL CHECK (village <> ''),
  camp_group text NOT NULL CHECK (camp_group <> ''),
  camp_office_notes text NOT NULL DEFAULT '',
  extra_info text NOT NULL DEFAULT '',
  kuksa_data jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE allergy (
  allergy_id integer PRIMARY KEY,
  name text NOT NULL CHECK (name <> '')
);

CREATE TABLE participant_allergy (
  participant_id integer REFERENCES participant (participant_id),
  allergy_id integer REFERENCES allergy (allergy_id),
  PRIMARY KEY (participant_id, allergy_id)
);

CREATE TABLE participant_date (
  participant integer NOT NULL REFERENCES participant (participant_id),
  date date NOT NULL,
  PRIMARY KEY (participant, date)
);

CREATE TABLE participant_note (
  participant_note_id serial PRIMARY KEY,
  participant integer NOT NULL REFERENCES participant (participant_id),
  timestamp timestamp NOT NULL DEFAULT NOW(),
  content text NOT NULL CHECK (content <> ''),
  archived boolean NOT NULL DEFAULT false
);

CREATE TABLE participant_presence (
  participant integer NOT NULL REFERENCES participant (participant_id),
  timestamp timestamp NOT NULL DEFAULT NOW(),
  presence integer NOT NULL,
  note text NOT NULL,
  PRIMARY KEY (participant, timestamp)
);

CREATE TABLE selection (
  selection_id serial PRIMARY KEY,
  kuksa_group_id integer NOT NULL,
  kuksa_selection_id integer NOT NULL,
  group_name text NOT NULL CHECK (group_name <> ''),
  selection_name text NOT NULL CHECK (group_name <> ''),
  participant_id integer NOT NULL REFERENCES participant (participant_id)
);

CREATE TABLE option (
  option_id serial PRIMARY KEY,
  property text NOT NULL CHECK (property <> ''),
  value text NOT NULL CHECK (property <> '')
);

CREATE TABLE search_filter (
  search_filter_id serial PRIMARY KEY,
  name text NOT NULL CHECK (name <> ''),
  free_text text NOT NULL,
  dates date[] NOT NULL,
  fields jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE migration_status (
  migrated boolean PRIMARY KEY
);

CREATE TABLE kuksa_campgroup (
  id integer PRIMARY KEY,
  name text NOT NULL
);

CREATE TABLE kuksa_localgroup (
  id integer PRIMARY KEY,
  name text NOT NULL,
  scout_organization text NOT NULL,
  locality text NOT NULL,
  country text NOT NULL,
  country_code text NOT NULL
);

CREATE TABLE kuksa_subcamp (
  id integer PRIMARY KEY,
  name text NOT NULL
);

CREATE TABLE kuksa_village (
  id integer PRIMARY KEY,
  name text NOT NULL
);

CREATE TABLE kuksa_participant (
  id integer PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  member_number text,
  nickname text,
  date_of_birth date NOT NULL,
  phone_number text,
  email text,
  represented_party text,
  accommodation text,
  cancelled boolean,
  diet text,
  local_group integer REFERENCES kuksa_localgroup (id),
  camp_group integer REFERENCES kuksa_campgroup (id),
  village integer REFERENCES kuksa_village (id),
  subcamp integer REFERENCES kuksa_subcamp (id)
);

CREATE TABLE kuksa_extrainfofield (
  id integer PRIMARY KEY,
  name text NOT NULL
);

CREATE TABLE kuksa_participantextrainfo (
  participant integer REFERENCES kuksa_participant (id),
  field integer REFERENCES kuksa_extrainfofield (id),
  value text NOT NULL,
  PRIMARY KEY (participant, field)
);

CREATE TABLE kuksa_extraselectiongroup (
  id integer PRIMARY KEY,
  name text NOT NULL
);

CREATE TABLE kuksa_extraselection (
  id integer PRIMARY KEY,
  name text NOT NULL,
  extra_selection_group integer NOT NULL REFERENCES kuksa_extraselectiongroup (id)
);

CREATE TABLE kuksa_participantextraselection (
  extra_selection integer REFERENCES kuksa_extraselection (id),
  participant integer REFERENCES kuksa_participant (id),
  PRIMARY KEY (extra_selection, participant)
);

CREATE TABLE kuksa_payment (
  id integer PRIMARY KEY,
  name text NOT NULL
);

CREATE TABLE kuksa_participantpayment (
  participant integer REFERENCES kuksa_participant (id),
  payment integer REFERENCES kuksa_payment (id),
  PRIMARY KEY (participant, payment)
);

CREATE TABLE kuksa_participantpaymentstatus (
  billed date,
  paid date,
  participant integer PRIMARY KEY REFERENCES kuksa_participant (id)
);

INSERT INTO migration_status (migrated) VALUES (true);

COMMIT;
