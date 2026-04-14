# Agent CRM — project build (day by day) + architecture

**Acronyms** in this file link to [ACRONYM_LEGEND.md](./ACRONYM_LEGEND.md) (Cmd/Ctrl+click in VS Code / Cursor). Abbreviations like `lib` or `src` are not linked.

---

================================================================================
AGENT CRM — PROJECT BUILD (DAY BY DAY) + ARCHITECTURE
================================================================================
This document summarizes how the repository was built across the curriculum
days, defines the backend layering ([DTOs](./ACRONYM_LEGEND.md#dto), entities, repositories, services),
and describes how the React frontend talks to the [API](./ACRONYM_LEGEND.md#api) and what triggers work.

--------------------------------------------------------------------------------
PART A — CORE CONCEPTS (SPRING BACKEND)
--------------------------------------------------------------------------------

ENTITY ([JPA](./ACRONYM_LEGEND.md#jpa))
------------
Location: src/main/java/com/agentcrm/entity/

An entity is a Java class mapped to a database table. It holds persistent
state: identifiers, columns, relationships (@ManyToOne, @OneToOne, etc.),
lifecycle hooks (@PrePersist), and sometimes behavior.

In this project, entities include:
  Agent       — CRM user + domain “person”; holds credentials (passwordHash)
                and profile; implements UserDetails for Spring Security.
  Lead        — Prospect in the pipeline; has LeadStatus, belongs to Agent.
  Client      — Converted account; belongs to Agent; optional link to Lead.
  Interaction — Logged touchpoint (CALL, EMAIL, MEETING, NOTE); ties to Agent
                and either a Lead or a Client.
  Task        — Work item with due date and TaskStatus; ties to Agent and
                optionally Lead or Client.
  Report      — Nightly snapshot row: counts + [JSON](./ACRONYM_LEGEND.md#json) string of leads-by-status
                for an agent on a given reportDate.

Entities are NOT returned directly from [REST](./ACRONYM_LEGEND.md#rest) controllers as the primary [API](./ACRONYM_LEGEND.md#api)
shape; responses use [DTOs](./ACRONYM_LEGEND.md#dto) so the wire format stays stable and you avoid
lazy-loading leaks.


[DTO](./ACRONYM_LEGEND.md#dto) (DATA TRANSFER OBJECT)
--------------------------
Location: src/main/java/com/agentcrm/dto/... (packages: auth, agent, lead,
client, task, interaction, stats, report)

[DTOs](./ACRONYM_LEGEND.md#dto) are simple records (or POJOs) that represent [JSON](./ACRONYM_LEGEND.md#json) request bodies or
response bodies. They decouple the [HTTP](./ACRONYM_LEGEND.md#http) contract from [JPA](./ACRONYM_LEGEND.md#jpa) entities.

Typical split:
  *Request   — Input validation (@NotBlank, @Email, @NotNull, etc.)
  *Response  — What the client receives (often built via static fromEntity())

Examples:
  RegisterRequest / LoginRequest / AuthResponse
  CreateLeadRequest / UpdateLeadRequest / LeadResponse
  CreateClientRequest / UpdateClientRequest / ClientResponse
  CreateTaskRequest / UpdateTaskRequest / TaskResponse
  CreateInteractionRequest / InteractionResponse
  PipelineStatsResponse — Aggregated numbers + map of lead counts by status
  ReportResponse — Serialized report row including agentName and [JSON](./ACRONYM_LEGEND.md#json) string
                   for leadsByStatus as stored in DB


REPOSITORY
----------
Location: src/main/java/com/agentcrm/repository/

A repository is a Spring Data [JPA](./ACRONYM_LEGEND.md#jpa) interface extending JpaRepository<Entity, Id>.
Spring generates queries from method names (e.g. findByAgent_Id) or from
@Query [JPQL](./ACRONYM_LEGEND.md#jpql) where aggregation is needed.

Repositories only talk to the database; they contain no business rules.
They return entities (or projections).

Examples:
  AgentRepository, LeadRepository, ClientRepository, TaskRepository,
  InteractionRepository, ReportRepository

Some methods are custom counts or group-bys used by reporting (e.g. Lead
counts grouped by status for pipeline stats).


SERVICE
-------
Location: src/main/java/com/agentcrm/service/

A service holds business logic: validation, orchestration, transactions
(@Transactional), mapping entities to [DTOs](./ACRONYM_LEGEND.md#dto), and throwing [HTTP](./ACRONYM_LEGEND.md#http)-friendly errors
(ResponseStatusException with NOT_FOUND, CONFLICT, BAD_REQUEST, etc.).

Controllers stay thin: they validate @Valid input, call a service, map to
[HTTP](./ACRONYM_LEGEND.md#http) status codes.

Examples:
  AuthService        — Register and login; [BCrypt](./ACRONYM_LEGEND.md#bcrypt) hash; JwtUtil token issue.
  AgentService       — [CRUD](./ACRONYM_LEGEND.md#crud) agents; password hashing on create.
  LeadService        — [CRUD](./ACRONYM_LEGEND.md#crud) leads; convert lead to client (CLOSED_WON, etc.).
  ClientService      — [CRUD](./ACRONYM_LEGEND.md#crud) clients.
  TaskService        — Create/update/delete tasks; enforces lead XOR client.
  InteractionService — Create/list/delete interactions; enforces lead XOR client.
  StatsService       — Loads agent, runs repository counts, builds
                       PipelineStatsResponse.
  ReportService        — Idempotent daily Report per agent; uses StatsService +
                       Jackson to persist leadsByStatus [JSON](./ACRONYM_LEGEND.md#json) string.
  SlackWebhookService — POSTs [JSON](./ACRONYM_LEGEND.md#json) to Slack Incoming Webhook; logs failures,
                        does not throw (automation must not die on Slack).


CONTROLLER
----------
Location: src/main/java/com/agentcrm/controller/

[REST](./ACRONYM_LEGEND.md#rest) endpoints: @RestController + @RequestMapping("/api/...").
They wire [HTTP](./ACRONYM_LEGEND.md#http) verbs to service calls and return ResponseEntity where needed
(Created, No Content).

Security (after Day 3): most routes require a valid [JWT](./ACRONYM_LEGEND.md#jwt); exceptions are
declared in SecurityConfig (e.g. POST /api/auth/register, /api/auth/login,
GET /api/agents permitted without authentication).


--------------------------------------------------------------------------------
PART B — WHAT WAS DONE EACH DAY (BACKEND + FRONTEND)
--------------------------------------------------------------------------------

DAY 1 — FOUNDATION
------------------
Goals: Spring Boot application shell, persistence, domain model, basic security
       placeholder (often “permit all” before real [JWT](./ACRONYM_LEGEND.md#jwt)).

Typical deliverables in this track:
  - Spring Boot + Spring Data [JPA](./ACRONYM_LEGEND.md#jpa) + PostgreSQL configuration
  - application.properties (gitignored in this repo) + example template
  - Hibernate ddl-auto, timezone [UTC](./ACRONYM_LEGEND.md#utc)
  - Core entities and enums:
      LeadStatus, TaskStatus, InteractionType, AgentRole
      Agent, Lead, Client, Task, Interaction
  - Repositories extending JpaRepository for each aggregate
  - Early SecurityFilterChain allowing all traffic (replaced on Day 3)

Outcome: Database schema can be created/updated from entities; repositories
exist; no [JWT](./ACRONYM_LEGEND.md#jwt) yet.


DAY 2 — [REST](./ACRONYM_LEGEND.md#rest) [API](./ACRONYM_LEGEND.md#api) LAYER
----------------------
Goals: Expose the domain through [HTTP](./ACRONYM_LEGEND.md#http) with [DTOs](./ACRONYM_LEGEND.md#dto) and service-layer rules.

Deliverables:
  - [DTOs](./ACRONYM_LEGEND.md#dto) for create/update/response for agents, leads, clients, tasks,
    interactions
  - Services implementing validation, ownership checks, and conversions
    (e.g. lead → client)
  - Controllers under /api/agents, /api/leads, /api/clients, /api/tasks,
    /api/interactions
  - Standard patterns: GET list/detail, POST create, PUT update, DELETE

Outcome: Full [CRUD](./ACRONYM_LEGEND.md#crud)-style [API](./ACRONYM_LEGEND.md#api) for CRM operations, still secured loosely until
Day 3 depending on interim config.


DAY 3 — SPRING SECURITY + [JWT](./ACRONYM_LEGEND.md#jwt)
-----------------------------
Goals: Replace open security with stateless [JWT](./ACRONYM_LEGEND.md#jwt) authentication.

Deliverables:
  - [DTOs](./ACRONYM_LEGEND.md#dto): RegisterRequest, LoginRequest, AuthResponse
  - AuthService: register (unique email, [BCrypt](./ACRONYM_LEGEND.md#bcrypt)), login (verify password),
    return [JWT](./ACRONYM_LEGEND.md#jwt)
  - AuthController: POST /api/auth/register, POST /api/auth/login
  - JwtUtil: build/parse/validate [HS256](./ACRONYM_LEGEND.md#hs256) tokens; claims include subject (email),
    agentId, firstName, role; secret and TTL from application properties
  - JwtFilter: reads Authorization: Bearer …, validates token, loads user via
    AgentDetailsService, sets SecurityContextHolder
  - AgentDetailsService: UserDetailsService loading Agent by email
  - Agent implements UserDetails; passwordHash column required; [BCrypt](./ACRONYM_LEGEND.md#bcrypt) on save
  - SecurityConfig: [CSRF](./ACRONYM_LEGEND.md#csrf) off, STATELESS sessions, DaoAuthenticationProvider,
    JwtFilter before UsernamePasswordAuthenticationFilter; permit auth + GET
    /api/agents; all other requests authenticated
  - AuthenticatedAgentHelper: reads current Agent from security context
    (foundation for Day 4 “me” endpoints)

Outcome: Browser/[API](./ACRONYM_LEGEND.md#api) clients send [JWT](./ACRONYM_LEGEND.md#jwt) on protected routes; identity is server-
verified; agent id in [JWT](./ACRONYM_LEGEND.md#jwt) is trusted over arbitrary client-supplied ids.


DAY 4 — AUTOMATION, REPORTING, STATS
-----------------------------------
Goals: Scheduled work, aggregates, Slack notifications, agent-scoped stats.

Deliverables:
  - PipelineStatsResponse + StatsService + StatsController
      GET /api/stats/me — uses AuthenticatedAgentHelper
      GET /api/stats/agent/{id} — authenticated (admin hardening optional later)
  - Report entity, ReportRepository, ReportResponse, ReportService
      Idempotent generateReportForAgent (one row per agent per [UTC](./ACRONYM_LEGEND.md#utc) day)
      GET /api/reports/me, GET /api/reports/me/today
  - SlackWebhookService — RestTemplate POST { "text": "..." }; errors logged
  - NightlyReportJob — @Scheduled cron (e.g. 2 AM), iterates agents, generates
    reports, posts Slack digest per agent
  - @EnableScheduling on the Spring Boot application
  - POST /api/reports/trigger — manual job run for testing
  - application properties: slack.webhook.url, spring.task.scheduling.pool.size
  - [CORS](./ACRONYM_LEGEND.md#cors) (later tightened with frontend): SecurityConfig allows browser calls
    from local dev origins to /api/**

Outcome: Nightly snapshots in DB + optional Slack; stats endpoint powers UI.


DAY 5 — DASHBOARD SHELL (FRONTEND PREP / PLACEHOLDER)
-----------------------------------------------------
In the curriculum this day often introduces the Next.js app shell, routing
groups, and placeholder pages before the full dashboard (Day 6).

Backend may receive small fixes (dependencies, [JWT](./ACRONYM_LEGEND.md#jwt) claim tweaks) as needed.
The important handoff to Day 6: base URL env, login flow concept, and which
endpoints the UI will call.


DAY 6 — REACT DASHBOARD (MONOREPO UNDER /web)
--------------------------------------------
Goals: Agent-facing UI: stats, leads table + drawer, clients, tasks, auth.

Deliverables (web/):
  - Next.js App Router, TypeScript, Tailwind, shadcn/ui components
  - Fonts: Syne (headings), Montserrat (body); chart axis labels humanized
  - TanStack Query hooks wrapping plain lib/api/* axios functions
  - Axios instance (lib/axios.ts): baseURL from NEXT_PUBLIC_API_URL; Bearer
    token from in-memory auth store (not localStorage for access token)
  - Routes: / login/register; (dashboard) layout with Sidebar, header, auth
    guard redirect to /login; pages /, /leads, /clients, /tasks
  - Leads: TanStack Table, filters, status pipeline order + labels, detail
    Sheet, create dialog ([RHF](./ACRONYM_LEGEND.md#rhf) + Zod), interactions/tasks mini-forms
  - Dashboard: stat cards, Recharts bar chart (pipeline order), recent tasks
  - Repository root tracks web/ as normal files (nested .git removed) so the
    project is one monorepo: java-crm at root, web/ for frontend.


--------------------------------------------------------------------------------
PART C — HOW THE FRONTEND INTERACTS WITH [DTOs](./ACRONYM_LEGEND.md#dto) / SERVICES (TRIGGERS)
--------------------------------------------------------------------------------

GENERAL FLOW
------------
1) User action in the browser (click, submit, navigation, timer).
2) React event handler or TanStack Query hook invokes a function in web/lib/api.
3) Axios sends [HTTP](./ACRONYM_LEGEND.md#http) request to Spring Controller path with [JSON](./ACRONYM_LEGEND.md#json) body matching
   *Request [DTOs](./ACRONYM_LEGEND.md#dto) where applicable.
4) Controller validates input, calls Service.
5) Service uses Repositories to read/write Entities, applies rules, returns
   [DTOs](./ACRONYM_LEGEND.md#dto) or entities mapped to *Response records.
6) [JSON](./ACRONYM_LEGEND.md#json) response returns to the browser; TanStack Query updates cache;
   components re-render.

AUTH (TRIGGERS: LOGIN / REGISTER / LOGOUT)
------------------------------------------
  - Login form POST /api/auth/login with LoginRequest [JSON](./ACRONYM_LEGEND.md#json).
  - Spring AuthService verifies password, returns AuthResponse { token, … }.
  - Frontend stores [JWT](./ACRONYM_LEGEND.md#jwt) in memory (module + navigation flow) and attaches
    Authorization: Bearer on subsequent axios requests (interceptor).
  - Logout clears token and routes to /login.
  - AuthGuard on dashboard routes: if no token, redirect to login.

PROTECTED [API](./ACRONYM_LEGEND.md#api) (TRIGGER: ANY QUERY/MUTATION AFTER LOGIN)
------------------------------------------------------
  - JwtFilter runs before the controller: parses [JWT](./ACRONYM_LEGEND.md#jwt), loads Agent, sets
    SecurityContext.
  - Controllers that use AuthenticatedAgentHelper (or implied “me” paths)
    derive agent identity from the token, not from client-supplied ids in the
    body for security-sensitive operations.

LEADS PAGE (TRIGGERS)
--------------------
  - Page load / cache invalidation: useLeads(agentId) GET /api/leads/agent/{id}
    (agentId from [JWT](./ACRONYM_LEGEND.md#jwt) decode for scoping).
  - New Lead dialog submit: POST /api/leads with CreateLeadRequest including
    agentId from [JWT](./ACRONYM_LEGEND.md#jwt).
  - Inline status Select: PUT /api/leads/{id} with UpdateLeadRequest.
  - Convert button: POST /api/leads/{id}/convert → ClientResponse; TanStack
    invalidates leads + clients queries.
  - Delete: DELETE /api/leads/{id}.
  - Row click: opens drawer; useLead(id), useInteractionsByLead(leadId),
    useTasksByLead(leadId) fetch related lists; forms POST interactions/tasks.

CLIENTS PAGE (TRIGGERS)
-----------------------
  - List: GET /api/clients/agent/{agentId}.
  - Drawer + interactions/tasks analogous to leads.
  - Delete: DELETE /api/clients/{id}.

TASKS PAGE (TRIGGERS)
---------------------
  - List: GET /api/tasks/agent/{agentId}.
  - Inline status change: PUT /api/tasks/{id} with UpdateTaskRequest.

DASHBOARD STATS (TRIGGERS)
--------------------------
  - useMyStats → GET /api/stats/me → PipelineStatsResponse (includes
    leadsByStatus map or [JSON](./ACRONYM_LEGEND.md#json)-compatible shape for chart prep).
  - Recent tasks: GET /api/tasks/agent/{agentId} then client-side filter/sort.

REPORTS / NIGHTLY JOB (TRIGGERS — MOSTLY SERVER-SIDE)
-----------------------------------------------------
  - Cron: NightlyReportJob calls ReportService.generateReportForAgent for each
    Agent; persists Report; SlackWebhookService posts digest.
  - Manual: POST /api/reports/trigger (authenticated) for testing.
  - UI: GET /api/reports/me and /api/reports/me/today when those pages/hooks
    are wired (same [JWT](./ACRONYM_LEGEND.md#jwt) rules).

[CORS](./ACRONYM_LEGEND.md#cors)
----
  - Browser enforces origin rules; Spring SecurityConfig registers [CORS](./ACRONYM_LEGEND.md#cors) for
    /api/** so localhost Next dev can call the [API](./ACRONYM_LEGEND.md#api).


--------------------------------------------------------------------------------
PART D — QUICK FILE MAP
--------------------------------------------------------------------------------
Backend (src/main/java/com/agentcrm):
  entity/          [JPA](./ACRONYM_LEGEND.md#jpa) tables
  repository/      Spring Data [JPA](./ACRONYM_LEGEND.md#jpa)
  service/        Business logic
  controller/      [REST](./ACRONYM_LEGEND.md#rest) endpoints
  dto/             Request/response shapes
  security/        [JWT](./ACRONYM_LEGEND.md#jwt) filter, util, UserDetailsService, AuthenticatedAgentHelper
  config/          Security, RestTemplate, [CORS](./ACRONYM_LEGEND.md#cors)-related beans
  scheduler/       @Scheduled nightly job

Frontend (web/):
  app/             Routes, layouts, pages
  components/      UI (layout, tables, drawers, shadcn)
  hooks/           TanStack Query useX hooks
  lib/api/         Axios calls (mirror backend resources)
  lib/axios.ts     Client + auth header
  lib/auth-token.ts / lib/jwt.ts — token memory + claim decode for display


================================================================================
END OF DOCUMENT
================================================================================
