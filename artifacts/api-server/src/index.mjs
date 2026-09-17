import crypto from "node:crypto";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pg from "pg";

const { Pool } = pg;
const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

const publicUser = (row) => ({
  id: Number(row.id),
  username: row.username,
  email: row.email,
  role: row.role,
  displayName: row.display_name ?? null,
  createdAt: row.created_at,
  lastLoginAt: row.last_login_at ?? null,
});

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET environment variable must be set for JWT signing.");
  return secret;
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, displayName: user.displayName ?? null },
    sessionSecret(),
    { expiresIn: "7d" },
  );
}

function bearerUser(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  try {
    req.admin = jwt.verify(header.slice(7), sessionSecret());
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

function rootUser(req, res, next) {
  bearerUser(req, res, () => {
    if (req.admin?.role !== "root") {
      res.status(403).json({ error: "Root access required" });
      return;
    }
    next();
  });
}

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function requireDatabase() {
  if (!process.env.DATABASE_URL) {
    const error = new Error("DATABASE_URL is not configured");
    error.status = 503;
    throw error;
  }
}

app.get("/api/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/admin/auth/setup-status", asyncRoute(async (_req, res) => {
  requireDatabase();
  const { rows } = await pool.query("SELECT COUNT(*)::int AS total FROM admin_users");
  res.json({ setupRequired: rows[0].total === 0 });
}));

app.post("/api/admin/auth/setup", asyncRoute(async (req, res) => {
  requireDatabase();
  const { rows: existing } = await pool.query("SELECT COUNT(*)::int AS total FROM admin_users");
  if (existing[0].total > 0) {
    res.status(403).json({ error: "Setup already completed" });
    return;
  }

  const { setupToken, username, password, displayName } = req.body ?? {};
  if (!setupToken || setupToken !== process.env.SESSION_SECRET) {
    res.status(401).json({ error: "Invalid setup token" });
    return;
  }
  if (!username || !password || String(password).length < 8) {
    res.status(400).json({ error: "Username and password (min 8 chars) required" });
    return;
  }

  const passwordHash = await bcrypt.hash(String(password), 12);
  const { rows } = await pool.query(
    `INSERT INTO admin_users (username, email, password_hash, role, display_name)
     VALUES ($1, $2, $3, 'root', $4)
     RETURNING id, username, email, role, display_name, created_at, last_login_at`,
    [String(username).trim(), `${String(username).trim()}@beezstudio.com.bd`, passwordHash, String(displayName || username).trim()],
  );
  const user = publicUser(rows[0]);
  res.status(201).json({ token: signToken(user), user });
}));

app.post("/api/admin/auth/reset-password", asyncRoute(async (req, res) => {
  requireDatabase();
  const { setupToken, username, password } = req.body ?? {};
  if (!setupToken || setupToken !== process.env.SESSION_SECRET) {
    res.status(401).json({ error: "Invalid setup token" });
    return;
  }
  if (!username || !password || String(password).length < 8) {
    res.status(400).json({ error: "Username and password (min 8 chars) required" });
    return;
  }

  const passwordHash = await bcrypt.hash(String(password), 12);
  const { rowCount } = await pool.query(
    "UPDATE admin_users SET password_hash = $1 WHERE username = $2",
    [passwordHash, String(username).trim()],
  );
  if (!rowCount) {
    res.status(404).json({ error: "Admin account not found" });
    return;
  }
  res.json({ success: true });
}));

app.post("/api/admin/auth/login", asyncRoute(async (req, res) => {
  requireDatabase();
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }

  const { rows } = await pool.query("SELECT * FROM admin_users WHERE username = $1 LIMIT 1", [String(username).trim()]);
  const row = rows[0];
  if (!row || !(await bcrypt.compare(String(password), row.password_hash))) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  await pool.query("UPDATE admin_users SET last_login_at = NOW() WHERE id = $1", [row.id]);
  const user = publicUser(row);
  res.json({ token: signToken(user), user });
}));

app.get("/api/admin/auth/me", bearerUser, (req, res) => {
  res.json(req.admin);
});

app.get("/api/admin/stats", bearerUser, asyncRoute(async (_req, res) => {
  const [contacts, projects, users, recent] = await Promise.all([
    pool.query("SELECT COUNT(*)::int AS total FROM contacts"),
    pool.query("SELECT COUNT(*)::int AS total FROM projects"),
    pool.query("SELECT COUNT(*)::int AS total FROM admin_users"),
    pool.query("SELECT id, name, email, phone, subject, message, created_at AS \"createdAt\" FROM contacts ORDER BY created_at DESC LIMIT 5"),
  ]);
  res.json({
    totalContacts: contacts.rows[0].total,
    totalProjects: projects.rows[0].total,
    totalUsers: users.rows[0].total,
    recentContacts: recent.rows,
  });
}));

app.get("/api/admin/contacts", bearerUser, asyncRoute(async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT id, name, email, phone, subject, message, created_at AS "createdAt"
     FROM contacts ORDER BY created_at DESC`,
  );
  res.json(rows);
}));

app.delete("/api/admin/contacts/:id", bearerUser, asyncRoute(async (req, res) => {
  await pool.query("DELETE FROM contacts WHERE id = $1", [Number(req.params.id)]);
  res.json({ success: true });
}));

const projectFields = ["title", "category", "slug", "description", "image_url", "location", "year", "featured", "published"];
function projectFromRow(row) {
  return {
    id: Number(row.id),
    title: row.title,
    category: row.category,
    slug: row.slug,
    description: row.description,
    imageUrl: row.image_url,
    location: row.location,
    year: row.year,
    featured: row.featured,
    published: row.published,
    createdAt: row.created_at,
  };
}

app.get("/api/admin/projects", bearerUser, asyncRoute(async (_req, res) => {
  const { rows } = await pool.query("SELECT * FROM projects ORDER BY created_at DESC");
  res.json(rows.map(projectFromRow));
}));

app.post("/api/admin/projects", bearerUser, asyncRoute(async (req, res) => {
  const body = req.body ?? {};
  if (!body.title || !body.category || !body.slug) {
    res.status(400).json({ error: "Title, category, and slug are required" });
    return;
  }
  const { rows } = await pool.query(
    `INSERT INTO projects (title, category, slug, description, image_url, location, year, featured, published)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [body.title, body.category, body.slug, body.description ?? null, body.imageUrl ?? null, body.location ?? null, body.year ?? null, Boolean(body.featured), body.published !== false],
  );
  res.status(201).json(projectFromRow(rows[0]));
}));

app.put("/api/admin/projects/:id", bearerUser, asyncRoute(async (req, res) => {
  const body = req.body ?? {};
  const updates = [];
  const values = [];
  for (const field of projectFields) {
    const key = field === "image_url" ? "imageUrl" : field;
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      updates.push(`${field} = $${values.length + 1}`);
      values.push(body[key]);
    }
  }
  if (!updates.length) {
    res.status(400).json({ error: "No changes supplied" });
    return;
  }
  updates.push("updated_at = NOW()");
  values.push(Number(req.params.id));
  const { rows } = await pool.query(`UPDATE projects SET ${updates.join(", ")} WHERE id = $${values.length} RETURNING *`, values);
  if (!rows[0]) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(projectFromRow(rows[0]));
}));

app.delete("/api/admin/projects/:id", bearerUser, asyncRoute(async (req, res) => {
  await pool.query("DELETE FROM projects WHERE id = $1", [Number(req.params.id)]);
  res.json({ success: true });
}));

app.get("/api/admin/users", rootUser, asyncRoute(async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT id, username, email, role, display_name AS "displayName",
            created_at AS "createdAt", last_login_at AS "lastLoginAt"
     FROM admin_users ORDER BY created_at ASC`,
  );
  res.json(rows);
}));

app.post("/api/admin/users", rootUser, asyncRoute(async (req, res) => {
  const { username, email, password, role, displayName } = req.body ?? {};
  if (!username || !email || !password || !role) {
    res.status(400).json({ error: "All fields required" });
    return;
  }
  const passwordHash = await bcrypt.hash(String(password), 12);
  const { rows } = await pool.query(
    `INSERT INTO admin_users (username, email, password_hash, role, display_name)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING id, username, email, role, display_name AS "displayName"`,
    [username, email, passwordHash, role, displayName || null],
  );
  res.status(201).json(rows[0]);
}));

app.put("/api/admin/users/:id", rootUser, asyncRoute(async (req, res) => {
  const body = req.body ?? {};
  const updates = [];
  const values = [];
  for (const field of ["username", "email", "role", "display_name"]) {
    const key = field === "display_name" ? "displayName" : field;
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      updates.push(`${field} = $${values.length + 1}`);
      values.push(body[key]);
    }
  }
  if (body.password) {
    updates.push(`password_hash = $${values.length + 1}`);
    values.push(await bcrypt.hash(String(body.password), 12));
  }
  if (!updates.length) {
    res.status(400).json({ error: "No changes supplied" });
    return;
  }
  values.push(Number(req.params.id));
  const { rows } = await pool.query(
    `UPDATE admin_users SET ${updates.join(", ")} WHERE id = $${values.length}
     RETURNING id, username, email, role, display_name AS "displayName"`,
    values,
  );
  if (!rows[0]) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(rows[0]);
}));

app.delete("/api/admin/users/:id", rootUser, asyncRoute(async (req, res) => {
  await pool.query("DELETE FROM admin_users WHERE id = $1", [Number(req.params.id)]);
  res.json({ success: true });
}));

app.post("/api/contact", asyncRoute(async (req, res) => {
  const { name, email, phone, subject, message } = req.body ?? {};
  if (!name || !email || !subject || !message) {
    res.status(400).json({ error: "Name, email, subject, and message are required" });
    return;
  }
  const { rows } = await pool.query(
    `INSERT INTO contacts (name, email, phone, subject, message)
     VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [name, email, phone || null, subject, message],
  );
  res.json({ success: true, id: Number(rows[0].id) });
}));

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({ error: error.status ? error.message : "Internal server error" });
});

const rawPort = process.env.PORT;
if (!rawPort) throw new Error("PORT environment variable is required but was not provided.");
const port = Number(rawPort);
if (!Number.isFinite(port) || port <= 0) throw new Error(`Invalid PORT value: "${rawPort}"`);

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});