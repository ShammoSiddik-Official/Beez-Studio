# BeeZ Studio — Complete Project Reference

This is the canonical handoff document for the two BeeZ Studio frontend applications and the cPanel-compatible backend.

It explains:

- the current architecture and deployment model;
- the public website and BeeZ Studio Console;
- the chatbot and API contract;
- the languages and tools used;
- every important directory and its purpose;
- the migration history and why the project previously looked confusing;
- current bottlenecks, known errors, and practical limitations;
- design, redesign, build, and deployment rules.

The current production target is standard shared cPanel hosting for `beezstudio.com.bd`, with PHP and MySQL/MariaDB. The production target is **not** a Node.js server.

---

## 1. Product Summary

BeeZ Studio is an architectural consultancy and construction firm website for a Dhaka-based studio.

It has two user-facing applications:

1. **BeeZ Studio public website**
   - The marketing and portfolio website.
   - Shows the studio, services, project categories, individual project pages, and contact form.
   - Includes the AI chatbot.
   - Runs at `https://beezstudio.com.bd/`.

2. **BeeZ Studio Console**
   - A private administration dashboard.
   - Used by authorized staff to manage projects, review contact submissions, view statistics, and manage admin users.
   - Runs at `https://beezstudio.com.bd/admin/`.

The backend is:

3. **PHP + MySQL API**
   - Receives contact submissions.
   - Provides admin authentication and authorization.
   - Provides project, contact, user, and dashboard endpoints.
   - Proxies chatbot requests to Google's Gemini REST API.
   - Runs at `https://beezstudio.com.bd/api/`.

### Production URL map

```text
https://beezstudio.com.bd/          Public React website
https://beezstudio.com.bd/admin/   BeeZ Studio Console
https://beezstudio.com.bd/api/     PHP API
```

---

## 2. Current Architecture

```text
                              Browser
                                 |
              +------------------+------------------+
              |                                     |
              v                                     v
   Public React/Vite SPA                    Console React/Vite SPA
   /                                       /admin/
              |                                     |
              +------------------+------------------+
                                 |
                                 v
                      Apache + .htaccess on cPanel
                                 |
                +----------------+----------------+
                |                                 |
                v                                 v
          Static files                         PHP API
       HTML/CSS/JavaScript                    /api/*.php
                                                   |
                                  +----------------+----------------+
                                  |                                 |
                                  v                                 v
                              MySQL/MariaDB                    Gemini REST API
                         contacts/projects/users              chatbot only
                         chat_messages
```

### Important architecture rule

The React applications are compiled into static files before upload. cPanel does not need Node.js, npm, pnpm, Vite, React, or a Node server.

The cPanel server only needs:

- Apache with `.htaccess` rewrite support;
- PHP;
- PHP PDO MySQL support;
- PHP cURL support;
- MySQL or MariaDB;
- HTTPS.

Node.js and pnpm are used only on the developer's computer to build the static frontends.

---

## 3. Canonical Workspace Structure

The current active source structure is:

```text
/
├── api/
│   ├── .htaccess
│   ├── config.example.php
│   ├── schema.sql
│   ├── chat.php
│   ├── contact.php
│   ├── admin/
│   │   ├── auth.php
│   │   ├── contacts.php
│   │   ├── projects.php
│   │   ├── stats.php
│   │   └── users.php
│   └── lib/
│       ├── auth.php
│       ├── db.php
│       ├── jwt.php
│       └── response.php
│
├── artifacts/
│   ├── beez-studio/
│   │   ├── src/
│   │   ├── public/
│   │   ├── dist/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── index.html
│   │   └── .replit-artifact/
│   ├── admin-panel/
│   │   ├── src/
│   │   ├── public/
│   │   ├── dist/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── index.html
│   │   └── .replit-artifact/
│   └── mockup-sandbox/
│       └── ...
│
├── docs/
│   ├── DEPLOYMENT-CPANEL.md
│   └── DEPLOYMENT.md
│
├── exports/
│   ├── beez-studio-cpanel-complete.zip
│   ├── beez-studio-console-source.zip
│   └── beez-studio-public-source.zip
│
├── attached_assets/
├── scripts/
├── README.md
├── beez-studio.md
├── replit.md
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── tsconfig.json
├── tsconfig.base.json
├── .replit
└── replit.nix
```

### Source of truth by purpose

| Purpose | Source of truth |
|---|---|
| Public website source | `artifacts/beez-studio/` |
| Console source | `artifacts/admin-panel/` |
| Production backend source | `api/` |
| MySQL schema | `api/schema.sql` |
| cPanel deployment instructions | `docs/DEPLOYMENT-CPANEL.md` |
| Downloadable deployment package | `exports/beez-studio-cpanel-complete.zip` |
| Console redesign handoff | `exports/beez-studio-console-source.zip` plus its README |
| Public-site source handoff | `exports/beez-studio-public-source.zip` |
| This complete architecture reference | `BEEZ-STUDIO-PROJECT-REFERENCE.md` |

---

## 4. Directory and File Usage

### `api/`

The active production backend. This is the backend that belongs on cPanel inside `public_html/api/`.

It contains no Node runtime and no Composer dependency. The implementation uses plain PHP and built-in PHP extensions.

#### `api/.htaccess`

Maps clean browser/API paths to PHP files.

Examples:

```text
/api/contact                 -> contact.php
/api/chat                    -> chat.php
/api/admin/stats             -> admin/stats.php
/api/admin/projects/12       -> admin/projects.php?id=12
```

It also blocks direct access to sensitive backend files such as:

- `config.php`;
- `config.example.php`;
- `schema.sql`.

#### `api/config.example.php`

Safe configuration template. The user must copy this to `config.php` on the server and fill in:

- `DB_HOST`;
- `DB_PORT`;
- `DB_NAME`;
- `DB_USER`;
- `DB_PASS`;
- `JWT_SECRET`;
- `GEMINI_API_KEY`.

The real `config.php` must never be committed to the project or uploaded in a public source package.

#### `api/schema.sql`

MySQL/MariaDB schema for:

- `contacts`;
- `projects`;
- `admin_users`;
- `chat_messages`.

Import this through phpMyAdmin before using the backend.

#### `api/contact.php`

Public contact form endpoint.

Responsibilities:

- accepts a JSON `POST`;
- validates required fields;
- inserts a contact lead into MySQL;
- returns JSON success or error data.

#### `api/chat.php`

Public chatbot endpoint.

Responsibilities:

- accepts the visitor's chat request;
- sends the request to the Gemini REST API using PHP cURL;
- reads Gemini's SSE response;
- reformats response chunks for the existing React chatbot;
- sends an explicit error event if the upstream request fails or returns no usable content;
- optionally records chat messages in `chat_messages`.

#### `api/admin/`

Private admin endpoint handlers. These endpoints require a valid bearer token.

- `auth.php` — setup status, first root-user setup, login, current-user lookup.
- `contacts.php` — list and delete contact submissions.
- `projects.php` — list, create, update, and delete projects.
- `stats.php` — dashboard counts and recent contacts.
- `users.php` — root-only admin-user management.

#### `api/lib/`

Shared PHP helpers.

- `response.php` — JSON response headers, JSON body parsing, CORS handling.
- `db.php` — singleton PDO connection to MySQL/MariaDB.
- `jwt.php` — minimal HS256 JWT signing and verification.
- `auth.php` — bearer-token extraction and `require_admin` / `require_root` guards.

---

### `artifacts/beez-studio/`

The public website React/Vite package.

#### Important source areas

```text
artifacts/beez-studio/src/
├── App.tsx
├── main.tsx
├── index.css
├── components/
│   ├── AnimatedText.tsx
│   ├── ChatBot.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── ui/
├── pages/
│   ├── home.tsx
│   ├── about.tsx
│   ├── services.tsx
│   ├── contact.tsx
│   ├── projects.tsx
│   ├── project-category.tsx
│   └── projects/
└── hooks/
```

#### Public website responsibilities

- renders the marketing pages;
- renders the project portfolio;
- submits the contact form to `/api/contact`;
- opens the chatbot and reads `/api/chat`;
- uses client-side routing;
- serves images and brand assets from `public/`.

#### `public/`

Static assets that are copied into the production build:

- logo;
- favicon;
- hero background;
- Open Graph image;
- robots file.

#### `dist/public/`

Generated production output. Do not edit it manually.

It contains static files such as:

- `index.html`;
- bundled JavaScript;
- bundled CSS;
- copied images;
- favicon and robots files.

For cPanel, copy the contents of this directory into the domain's `public_html/` root.

---

### `artifacts/admin-panel/`

The BeeZ Studio Console React/Vite package.

#### Important source areas

```text
artifacts/admin-panel/src/
├── App.tsx
├── main.tsx
├── index.css
├── lib/
│   ├── api.ts
│   └── utils.ts
├── contexts/
│   └── AuthContext.tsx
├── components/
│   ├── ProtectedRoute.tsx
│   ├── layout/
│   │   ├── AdminLayout.tsx
│   │   └── Sidebar.tsx
│   └── ui/
├── pages/
│   ├── setup.tsx
│   ├── login.tsx
│   ├── dashboard.tsx
│   ├── contacts.tsx
│   ├── projects.tsx
│   ├── users.tsx
│   └── not-found.tsx
└── hooks/
```

#### Console responsibilities

- checks whether first-time setup is required;
- logs admin users in;
- stores the JWT in browser local storage;
- protects private pages;
- restricts user management to root admins;
- displays dashboard statistics;
- manages project records;
- displays and deletes contact submissions;
- manages editor/root admin accounts.

#### `dist/public/`

Generated static console output.

For cPanel, copy its contents into:

```text
public_html/admin/
```

The console Vite base path is `/admin/`. Do not change this during a redesign.

---

### `artifacts/mockup-sandbox/`

Design-preview infrastructure used for isolated component prototypes and visual exploration.

It is not part of the cPanel production upload and should not be copied to `public_html/`.

---

### `docs/`

Documentation.

- `DEPLOYMENT-CPANEL.md` — current deployment path for the user's hosting.
- `DEPLOYMENT.md` — historical/legacy deployment instructions and should not override the cPanel guide.

If there is a conflict, `DEPLOYMENT-CPANEL.md` wins.

---

### `exports/`

Generated download packages for the user.

These are convenience files, not application source directories:

- `beez-studio-cpanel-complete.zip` — complete upload package;
- `beez-studio-console-source.zip` — console source for redesign by another AI;
- `beez-studio-public-source.zip` — public-site source package.

Do not upload the `exports/` directory itself to cPanel.

---

### `scripts/`

Workspace scripts and post-merge support utilities. They are development/infrastructure helpers and are not part of the cPanel runtime.

---

### `attached_assets/`

Workspace-provided assets. Assets used by the public site or console should be intentionally copied into the relevant package's `public/` directory before a production build.

Do not assume every file in this directory belongs in the public website.

---

### Root workspace files

| File | Usage |
|---|---|
| `README.md` | Short project orientation |
| `BEEZ-STUDIO-PROJECT-REFERENCE.md` | This full architecture and handoff reference |
| `beez-studio.md` | Product brief and brand/content notes |
| `replit.md` | Replit collaborator/project context; parts of it still describe the historical Node version |
| `package.json` | Root pnpm workspace scripts and development tooling |
| `pnpm-workspace.yaml` | Workspace package and dependency configuration |
| `pnpm-lock.yaml` | pnpm dependency lockfile; may retain historical dependency entries after migration |
| `tsconfig*.json` | TypeScript compiler configuration |
| `.replit` / `replit.nix` | Replit development environment configuration |
| `.gitignore` | Prevents generated files and secrets from being committed |

---

## 5. Public Website Routes and Design

The public website is a portfolio and lead-generation experience.

Expected route groups include:

```text
/                         Home
/about                    About the studio
/services                 Services
/projects                 Project index
/projects/...             Project category/detail pages
/contact                  Contact form
```

### Public design direction

The design should communicate:

- architectural confidence;
- premium but approachable consultancy;
- strong project photography;
- clear typography and spacious layouts;
- Dhaka/Bangladesh context without clutter;
- a direct path from project discovery to contact;
- mobile usability.

### Public functional rules

- Contact form submits to the PHP API, not directly to a third-party API.
- Chatbot requests must use the existing relative `/api/chat` route.
- Do not expose the Gemini key in browser JavaScript.
- Static assets must be bundled into the Vite build.
- The root Vite base path must remain `/`.

---

## 6. BeeZ Studio Console Definition

### What the Console is

BeeZ Studio Console is the private operations dashboard for the studio team. It is not a second public website and it is not a separate backend.

It is a static React application that communicates with the PHP API using authenticated HTTP requests.

### Console pages

#### Setup

Shown only when no admin user exists.

The first root account is created with:

- setup token;
- username;
- display name;
- password.

The setup token is the configured `JWT_SECRET`. This is only a bootstrap mechanism and must not be displayed publicly.

#### Login

Uses username and password. On success:

- the PHP API returns a JWT;
- the browser stores it under `beez_admin_token`;
- later API requests send `Authorization: Bearer <token>`.

#### Dashboard

Shows:

- total contacts;
- total projects;
- total users;
- recent contact submissions.

#### Contacts

Allows an authorized admin to:

- view submitted name, email, phone, subject, message, and timestamp;
- delete a contact record.

#### Projects

Allows an authorized admin to:

- list projects;
- create projects;
- edit projects;
- delete projects;
- set title, category, slug, description, image URL, location, year, featured state, and published state.

#### Users

Root-only page for:

- listing admin users;
- creating users;
- updating users;
- deleting users;
- assigning `root` or `editor` roles.

### Console roles

| Role | Access |
|---|---|
| `root` | Dashboard, contacts, projects, users |
| `editor` | Dashboard, contacts, projects; no user management |

Authorization is enforced in the PHP API as well as in the frontend. Frontend-only hiding is not sufficient security.

---

## 7. Console API Contract

The API client is in:

```text
artifacts/admin-panel/src/lib/api.ts
```

The base URL is:

```text
/api
```

Do not replace it with `localhost`, a Replit development domain, or a hardcoded production domain.

### Auth endpoints

```text
GET  /api/admin/auth/setup-status
POST /api/admin/auth/setup
POST /api/admin/auth/login
GET  /api/admin/auth/me
```

### Dashboard endpoint

```text
GET /api/admin/stats
```

### Contacts endpoints

```text
GET    /api/admin/contacts
DELETE /api/admin/contacts/:id
```

### Projects endpoints

```text
GET    /api/admin/projects
POST   /api/admin/projects
PUT    /api/admin/projects/:id
DELETE /api/admin/projects/:id
```

### Users endpoints

```text
GET    /api/admin/users
POST   /api/admin/users
PUT    /api/admin/users/:id
DELETE /api/admin/users/:id
```

### Data naming rule

The PHP API maps database snake_case columns to frontend camelCase fields.

Frontend field examples:

```text
createdAt
lastLoginAt
imageUrl
totalContacts
recentContacts
```

Do not change these names in a console redesign unless the PHP API and every consumer are changed together.

---

## 8. Chatbot Architecture

### User experience

The public website includes `ChatBot.tsx`.

The visitor sends a message through the browser. The browser calls:

```text
POST /api/chat
```

The browser never calls Gemini directly.

### Server flow

```text
ChatBot.tsx
    |
    | POST /api/chat
    v
api/chat.php
    |
    | PHP cURL with server-side GEMINI_API_KEY
    v
Gemini REST streamGenerateContent?alt=sse
    |
    | Gemini SSE chunks
    v
api/chat.php reformats chunks
    |
    | data: {"content":"..."}
    v
ChatBot.tsx renders the response
```

### Why the chatbot uses a proxy

The Gemini API key must remain server-side. Putting it in Vite frontend code, a `VITE_*` variable, or browser network requests would expose it to every visitor.

### Streaming format

The PHP endpoint reads the upstream stream and emits the frontend-compatible format:

```text
data: {"content":"response chunk"}
```

The final event indicates completion. If Gemini fails, returns an empty response, or cURL fails, the endpoint emits an explicit error event rather than falsely reporting successful completion.

### Shared-hosting chatbot limitation

Some cPanel hosts buffer PHP output. In that case, the chatbot still works but the answer may appear all at once rather than token-by-token.

Possible causes:

- PHP-FPM output buffering;
- Apache compression/buffering;
- CDN or Cloudflare buffering;
- low PHP execution timeout;
- disabled or restricted cURL;
- upstream Gemini timeout.

The chatbot does not require a Node streaming server for correctness. Streaming animation is best effort on shared hosting.

### Chatbot configuration

Required server configuration:

```text
GEMINI_API_KEY
```

Never put this value in:

- `ChatBot.tsx`;
- `index.html`;
- a public JavaScript bundle;
- `public/`;
- GitHub;
- the downloadable frontend source package.

---

## 9. Database Architecture

The production database is MySQL or MariaDB.

The schema source is:

```text
api/schema.sql
```

### Tables

#### `contacts`

Stores public contact form submissions.

Typical data:

- name;
- email;
- phone;
- subject;
- message;
- created timestamp.

#### `projects`

Stores portfolio projects managed through the Console.

Typical data:

- title;
- category;
- slug;
- description;
- image URL;
- location;
- year;
- featured flag;
- published flag;
- created timestamp.

#### `admin_users`

Stores Console users.

Security-related data:

- username;
- email;
- password hash;
- role;
- display name;
- creation time;
- last login time.

Passwords are stored using PHP's `password_hash` and verified using `password_verify`.

#### `chat_messages`

Stores chatbot conversation data when enabled by the backend flow.

Do not store secrets, API keys, or unnecessary personal information in this table.

---

## 10. Languages and Formats Used

### Production/runtime languages

| Language/format | Usage |
|---|---|
| PHP | cPanel API, authentication, database access, chatbot proxy |
| SQL | MySQL/MariaDB schema and queries |
| JavaScript | Compiled browser runtime and package tooling |
| CSS | Compiled site and console styling |
| HTML | Vite entry documents and browser structure |
| Apache configuration | `.htaccess` rewrites, SPA fallback, file protection |

### Development/source languages

| Language/format | Usage |
|---|---|
| TypeScript | React source, API client, typed frontend data |
| TSX | React components and pages |
| JSX | Possible React syntax in component source |
| Bash/sh | Workspace and deployment helper scripts |
| YAML | pnpm workspace configuration and related tooling |
| JSON | package manifests, TypeScript/project configuration, data |
| Markdown | project documentation, deployment instructions, handoff notes |
| SVG | favicon and vector assets |

### Main libraries and tools

- React;
- Vite;
- TypeScript;
- Tailwind CSS;
- Framer Motion;
- Wouter;
- Radix UI/shadcn-style components;
- TanStack Query;
- Lucide/React icons;
- pnpm;
- PHP PDO;
- PHP cURL;
- MySQL/MariaDB.

The cPanel backend intentionally does not require Composer, Laravel, Node.js, Express, Drizzle, or a server-side React runtime.

---

## 11. Why the File Tree and Console Became Messy

The confusion came from a migration, not from one single broken component.

### 11.1 The project started as a Node/Postgres/Replit monorepo

The original structure included:

- an Express API server;
- PostgreSQL and Drizzle schema packages;
- generated API clients;
- shared TypeScript libraries;
- Replit-oriented deployment files;
- multiple artifact workflows.

Those files were valid for the original hosting model.

### 11.2 The hosting requirement changed to shared cPanel

The user's hosting did not provide a Node.js selector. It provided PHP and MySQL/MariaDB.

The backend was therefore rewritten to:

- plain PHP;
- PDO;
- MySQL/MariaDB;
- custom minimal HS256 JWT handling;
- PHP cURL for Gemini;
- Apache `.htaccess` routing.

The frontend could remain React because React is compiled into static files before upload.

### 11.3 Old and new deployment models temporarily coexisted

During the migration, the workspace contained both:

```text
old: Node + Express + PostgreSQL + Drizzle
new: PHP + MySQL + cPanel
```

That caused duplicated concepts:

- multiple deployment guides;
- old API references;
- old shared libraries;
- old workflow/artifact metadata;
- generated `dist` directories;
- source export staging directories;
- files that described the old database while the actual production plan used MySQL.

### 11.4 The Console looked more broken than it was

The Console itself is a separate React artifact, while the production backend is now outside the React package in `api/`.

This means:

- the Console source is in `artifacts/admin-panel/`;
- its API contract is in `src/lib/api.ts`;
- its backend is not inside the Console folder;
- Replit preview workflows and cPanel production deployment are different environments.

That separation is correct, but it was not clearly documented before.

### 11.5 Stale references caused development errors

Some frontend TypeScript configurations still referenced removed shared library projects. After the cleanup, Vite attempted to read a deleted library `tsconfig.json`.

The references were removed because the current frontends do not import those deleted libraries for the cPanel build.

The lesson:

- when removing a workspace package, also remove TypeScript project references;
- update pnpm workspace package lists;
- update root documentation and workflows;
- rebuild both frontends after cleanup.

### 11.6 Generated files added noise

These should not be mistaken for source:

- `dist/`;
- zip files under `exports/`;
- installed `node_modules/`;
- Replit artifact metadata;
- lockfile entries retained from historical packages.

The source directories are the `src/`, `public/`, and configuration files. The cPanel runtime is the generated `dist/public/` plus `api/`.

---

## 12. Historical/Legacy Architecture

The old architecture is documented here only to explain migration history.

```text
React/Vite frontend
        |
        v
Express API server
        |
        v
PostgreSQL + Drizzle ORM
```

It used or referenced:

- Express;
- PostgreSQL;
- Drizzle ORM;
- generated OpenAPI clients;
- generated Zod schemas;
- Replit-managed runtime configuration.

That architecture is not the current cPanel deployment target.

Do not reintroduce the old API server, PostgreSQL schema, or Node deployment files unless the hosting plan changes to a VPS or Node-capable host.

The old documentation may still exist for historical context. It must not override this document or `docs/DEPLOYMENT-CPANEL.md`.

---

## 13. Current Bottlenecks and Limitations

### Hosting bottlenecks

1. **No Node.js on cPanel**
   - Prevents running the original Express API directly.
   - Solved by PHP rewrite.

2. **PHP output buffering**
   - Can make chatbot streaming appear delayed.
   - The response should still complete if timeout and cURL are available.

3. **PHP execution time**
   - Long Gemini responses can exceed a restrictive shared-host timeout.
   - Ask the host for a suitable `max_execution_time`, preferably at least 60 seconds for the API path.

4. **Apache rewrite support**
   - Required for clean API paths and SPA routes.
   - `mod_rewrite` must be enabled.

5. **PHP extensions**
   - PDO MySQL and cURL must be enabled.

6. **No dedicated object storage**
   - Projects currently use image URLs rather than a built-in upload pipeline.
   - A future upload system would require cPanel storage rules or an external object-storage integration.

### Product bottlenecks

1. **Project image management**
   - The Console manages image URL fields, not a full media library.

2. **Contact workflow**
   - Contacts can be viewed and deleted.
   - There is no built-in email notification, assignment, status, or CRM pipeline in the current scope.

3. **Chatbot knowledge**
   - Gemini receives the configured prompt and conversation data.
   - There is no document retrieval/vector search layer in the cPanel package.

4. **Analytics**
   - The dashboard statistics are database counts.
   - They are not a full traffic analytics system.

5. **Shared hosting observability**
   - PHP error details are normally in cPanel logs.
   - There is no dedicated log dashboard.

### Development bottlenecks

1. The original monorepo lockfile can retain historical dependency entries after migration.
2. Replit artifact/workflow metadata may not disappear at the same time as source directories.
3. Replit preview runs React development servers, while cPanel runs static files and PHP.
4. A console redesign by another AI can easily break `/admin/`, `/api`, or the auth token contract if the handoff rules are ignored.

---

## 14. Known Errors and Resolutions

### Resolved: PDO port syntax

The PHP PDO connection initially treated a host/port combination incorrectly. The connection was corrected to use a separate `DB_PORT` value in the PDO DSN.

### Resolved: snake_case/camelCase mismatch

Some admin API responses initially returned raw database column names while the React Console expected camelCase fields such as `createdAt` and `imageUrl`.

Row-mapping helpers were added to return the frontend contract consistently.

### Resolved: weak chatbot success handling

The chatbot previously had a path that could make an upstream failure look like a successful completion. It was changed to:

- capture the raw upstream response;
- verify HTTP/cURL success;
- verify usable response content;
- log technical details server-side;
- emit an explicit SSE error event to the browser.

### Resolved: inconsistent ID re-fetch queries

Several post-create or post-update queries were changed to use prepared statements consistently.

### Resolved: sensitive file protection

The API `.htaccess` protection was corrected to cover the real `config.php`, the example config, and the schema file.

### Resolved: removed workspace references

The frontend TypeScript references to removed shared libraries were removed after the old library directories were cleaned out.

### Warning: build output may include non-fatal sourcemap notices

The Vite build previously reported a sourcemap warning around a UI tooltip source location. It did not stop the production build.

### Warning: large JavaScript chunks

Vite may warn that a bundled chunk is larger than 500 kB. This is a performance warning, not a cPanel deployment failure.

Possible future improvement:

- route-level dynamic imports;
- component splitting;
- image optimization;
- intentional manual chunking.

---

## 15. Redesign Rules for BeeZ Studio Console

Another AI may redesign the visual interface, but it must preserve the application contract.

### Must not change

1. Vite base path:

```text
/admin/
```

2. API base path:

```text
/api
```

3. Local storage token key:

```text
beez_admin_token
```

4. Authentication header:

```text
Authorization: Bearer <token>
```

5. Route paths:

```text
/login
/
/contacts
/projects
/users
```

6. Setup behavior:

If setup status says `setupRequired: true`, show the setup flow before private pages.

7. Role protection:

The users page remains root-only.

8. Static deployment:

The final result must build to static files in `dist/public/`. No Node backend or server-side rendering may be added.

### May change

- sidebar or top navigation;
- colors and typography;
- dashboard card layout;
- table design;
- responsive behavior;
- empty, loading, and error states;
- form presentation;
- icons and animation;
- page grouping;
- visual hierarchy;
- mobile navigation.

### Recommended Console design direction

The Console should feel like a calm professional studio operations tool:

- warm architectural neutrals;
- strong charcoal text;
- one controlled accent color;
- high-quality spacing;
- clear project thumbnails;
- compact but readable tables;
- obvious primary actions;
- good keyboard focus states;
- mobile drawer navigation;
- no decorative complexity that slows operational work.

The public website and Console may share brand cues, but the Console should prioritize information density and task completion over marketing presentation.

---

## 16. Build and Deployment Plan

### Local build prerequisites

On the developer's own computer:

- Node.js;
- pnpm;
- access to the source workspace.

On cPanel:

- PHP;
- MySQL/MariaDB;
- Apache rewrite support;
- PDO MySQL;
- cURL;
- HTTPS.

### Build commands

From the repository root:

```bash
pnpm install
BASE_PATH=/ pnpm --filter @workspace/beez-studio run build
BASE_PATH=/admin/ pnpm --filter @workspace/admin-panel run build
```

Expected output:

```text
artifacts/beez-studio/dist/public/
artifacts/admin-panel/dist/public/
```

### cPanel upload structure

```text
public_html/
├── index.html
├── assets/
├── images/
├── beez-studio-logo.png
├── favicon.svg
├── admin/
│   ├── index.html
│   ├── assets/
│   └── ...
└── api/
    ├── config.php
    ├── schema.sql
    ├── .htaccess
    ├── chat.php
    ├── contact.php
    ├── admin/
    └── lib/
```

The public and admin SPA fallback `.htaccess` files must be present at the web root and inside `admin/`.

### Database setup

1. Create a MySQL/MariaDB database in cPanel.
2. Create a database user.
3. Grant all required privileges.
4. Import `api/schema.sql` in phpMyAdmin.
5. Copy `api/config.example.php` to `api/config.php`.
6. Fill in the database and Gemini configuration.
7. Visit `/admin/` and complete first-time setup.
8. Delete or protect any temporary setup notes after deployment.

---

## 17. Security Rules

1. Never commit `api/config.php`.
2. Never place `GEMINI_API_KEY` in frontend code.
3. Never paste secrets into chat, Markdown, screenshots, or source packages.
4. Use HTTPS before using admin login.
5. Use a long random `JWT_SECRET`.
6. Use a unique strong MySQL password.
7. Keep the API file-protection rules.
8. Use prepared SQL statements.
9. Keep password hashing through PHP `password_hash`.
10. Enforce admin authorization in PHP, not only React.
11. Do not expose raw PHP errors to public visitors.
12. Back up the MySQL database before destructive project/contact/user operations.

The GitHub connector shown in the workspace status is not connected and is not part of the current application architecture.

---

## 18. Practical Maintenance Rules

### When editing the public site

1. Edit source under `artifacts/beez-studio/src/`.
2. Keep public API calls relative to `/api`.
3. Build the site.
4. Upload only the generated `dist/public/` contents to the domain root.

### When editing the Console

1. Edit source under `artifacts/admin-panel/src/`.
2. Keep the API contract and `/admin/` base path.
3. Build the Console.
4. Replace the contents of `public_html/admin/`.

### When editing the backend

1. Edit PHP under `api/`.
2. Test PHP syntax.
3. Test against a local MySQL/MariaDB database where possible.
4. Upload changed PHP files to `public_html/api/`.
5. Do not rebuild React unless the API response contract changes.

### When changing the database

1. Update `api/schema.sql`.
2. Make a database backup.
3. Apply the change in phpMyAdmin.
4. Update affected PHP queries and frontend types together.
5. Test create, read, update, and delete behavior.

---

## 19. Final Handoff Checklist

### Public website

- [ ] Home page works.
- [ ] Navigation works on desktop and mobile.
- [ ] Project pages work.
- [ ] Contact form submits to `/api/contact`.
- [ ] Chatbot loads and returns an answer or explicit error.
- [ ] No Gemini key appears in browser source.
- [ ] Build output uses root base `/`.

### BeeZ Studio Console

- [ ] `/admin/` loads after upload.
- [ ] Setup flow works on an empty database.
- [ ] Login stores `beez_admin_token`.
- [ ] Dashboard loads stats.
- [ ] Contacts load with camelCase fields.
- [ ] Project CRUD works.
- [ ] Root-only user management works.
- [ ] Editor users cannot manage users.
- [ ] Console build uses `/admin/`.

### Backend

- [ ] MySQL schema imported.
- [ ] `config.php` created privately.
- [ ] API `.htaccess` enabled.
- [ ] PDO MySQL works.
- [ ] cURL works.
- [ ] HTTPS enabled.
- [ ] PHP timeout is sufficient for chatbot requests.

### Cleanup

- [ ] Do not upload `node_modules/`.
- [ ] Do not upload the source `src/` directories to cPanel unless keeping a separate backup.
- [ ] Do not upload `exports/`.
- [ ] Do not upload old Node/Postgres backend files.
- [ ] Do not upload `config.example.php` as the real config.
- [ ] Keep a backup of the final ZIP and database.

---

## 20. One-Sentence Architecture Decision

BeeZ Studio is a React/Vite static public website and static admin console, backed by a dependency-free PHP/MySQL API with a server-side Gemini chatbot proxy, packaged specifically so the whole production application can run on standard cPanel hosting without Node.js.