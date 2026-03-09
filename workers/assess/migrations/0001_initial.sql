-- Briu Analytics D1 Schema
-- Tracks visitors, conversations, messages, leads, and bookings

-- Visitors: one row per unique session, enriched over time
CREATE TABLE visitors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  company_name TEXT,
  company_domain TEXT,
  company_industries TEXT, -- JSON array
  ip_hash TEXT, -- hashed IP for rate limiting, not raw IP
  page_first TEXT, -- first page they visited
  quiz_role TEXT,
  quiz_team TEXT,
  quiz_ai TEXT,
  quiz_focus TEXT,
  stage TEXT DEFAULT 'visitor', -- visitor, assessed, chatting, contacted, booked
  quality_score INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_visitors_email ON visitors(email);
CREATE INDEX idx_visitors_stage ON visitors(stage);
CREATE INDEX idx_visitors_created ON visitors(created_at);

-- Conversations: one per chat session (a visitor can have multiple)
CREATE TABLE conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id INTEGER REFERENCES visitors(id),
  session_id TEXT NOT NULL,
  page TEXT,
  message_count INTEGER DEFAULT 0,
  has_handoff INTEGER DEFAULT 0,
  quality_score INTEGER DEFAULT 0,
  summary TEXT, -- AI-generated summary after handoff
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_conversations_visitor ON conversations(visitor_id);
CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_conversations_created ON conversations(created_at);

-- Messages: every message in every conversation
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER REFERENCES conversations(id),
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  actions TEXT, -- JSON array of action cards sent
  chunks_used TEXT, -- which content chunks were selected
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);

-- Leads: when a visitor hands off to the team
CREATE TABLE leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id INTEGER REFERENCES visitors(id),
  conversation_id INTEGER REFERENCES conversations(id),
  name TEXT,
  email TEXT NOT NULL,
  summary TEXT,
  company_name TEXT,
  company_domain TEXT,
  quality_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'new', -- new, contacted, qualified, won, lost
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created ON leads(created_at);

-- Bookings: tier purchases / booking requests
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id INTEGER REFERENCES visitors(id),
  booking_id TEXT UNIQUE NOT NULL,
  tier TEXT,
  tier_name TEXT,
  amount INTEGER,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  payment_method TEXT DEFAULT 'invoice',
  message TEXT,
  status TEXT DEFAULT 'pending', -- pending, invoiced, paid, cancelled
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_bookings_email ON bookings(email);
CREATE INDEX idx_bookings_status ON bookings(status);

-- FAQ candidates: surfaced from conversation patterns
CREATE TABLE faq_candidates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  answer TEXT,
  frequency INTEGER DEFAULT 1, -- how many times this topic came up
  source_conversations TEXT, -- JSON array of conversation IDs
  status TEXT DEFAULT 'candidate', -- candidate, approved, published, rejected
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Daily metrics: pre-aggregated for dashboard
CREATE TABLE daily_metrics (
  date TEXT PRIMARY KEY, -- YYYY-MM-DD
  total_visitors INTEGER DEFAULT 0,
  total_conversations INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  total_leads INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  avg_messages_per_conv REAL DEFAULT 0,
  avg_quality_score REAL DEFAULT 0,
  top_pages TEXT, -- JSON: {"/"": 10, "/services/": 5}
  top_topics TEXT, -- JSON: {"pricing": 15, "capabilities": 8}
  updated_at TEXT DEFAULT (datetime('now'))
);
