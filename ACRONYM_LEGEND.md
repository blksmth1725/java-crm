# Acronym legend (Agent CRM docs)

Only **true acronyms / initialisms** used in the project docs—not casual abbreviations like `lib`, `src`, or `env`.

Click a heading in your editor’s outline, or use in-document links from [PROJECT_BUILD_DAY_BY_DAY.md](./PROJECT_BUILD_DAY_BY_DAY.md).

---

## API

**Application Programming Interface** — the contract (paths, methods, bodies) through which the frontend talks to the Spring server. Here it is mostly a [REST](#rest) HTTP [JSON](#json) API under `/api/...`.

---

## BCrypt

**Bcrypt** (from Blowfish-based crypt) — an adaptive password-hashing function. Spring’s `BCryptPasswordEncoder` hashes passwords before storage; logins compare plaintext to the hash. Not a classic “acronym” letter-by-letter, but treated as a named crypto primitive in the stack.

---

## CRUD

**Create, Read, Update, Delete** — the four basic persistence operations. REST routes often map `POST`/`GET`/`PUT`/`DELETE` to these.

---

## CORS

**Cross-Origin Resource Sharing** — browser rules for calling one origin (e.g. Next.js on `localhost:3000`) from another (`localhost:8080`). Spring exposes headers/preflight so the browser allows the dashboard to hit the API.

---

## CSRF

**Cross-Site Request Forgery** — a class of attacks where a site tricks a browser into submitting a request with the user’s cookies. This API is [JWT](#jwt)-bearer based and typically disables CSRF for stateless JSON clients; understand the tradeoff before copying config to cookie-based auth.

---

## DTO

**Data Transfer Object** — a simple type (often a Java `record`) representing request/response [JSON](#json). It is not a database row; it keeps HTTP contracts separate from [JPA](#jpa) entities.

---

## HTTP

**Hypertext Transfer Protocol** — how the browser and server exchange requests and responses (methods such as GET, POST, PUT, DELETE, status codes, headers).

---

## HS256

**HMAC-SHA256** — symmetric signing for [JWT](#jwt)s in this project: one shared secret, same algorithm to sign and verify. Distinct from asymmetric (RSA/EC) JWT setups.

---

## JPA

**Java Persistence API** — the standard Java ORM interface; Hibernate is the implementation used here. Entities and repositories are the [JPA](#jpa) side of the app.

---

## JPQL

**Java Persistence Query Language** — object-oriented query language over entities (not raw table names). Spring Data `@Query` can run [JPQL](#jpql) for aggregates like `COUNT … GROUP BY`.

---

## JSON

**JavaScript Object Notation** — text format for request/response bodies on the API and for stored blobs (e.g. serialized maps in `Report`).

---

## JWT

**JSON Web Token** — compact signed token (often `Authorization: Bearer …`) carrying claims such as subject and `agentId`. The server verifies; the client may decode only for display—not for security decisions.

---

## REST

**Representational State Transfer** — style of HTTP API using resources, verbs, and status codes; this project’s controllers follow common [REST](#rest) patterns.

---

## SQL

**Structured Query Language** — relational database language. Hibernate generates [SQL](#sql) from entities and [JPQL](#jpql); Postgres is the database used in deployment configs.

---

## UTC

**Coordinated Universal Time** — timezone baseline used in JPA / reporting (`reportDate`, etc.) so “today” is consistent server-side.

---

## RHF

**React Hook Form** — React library for form state and validation wiring (often with Zod). Used in the dashboard create-lead flow.

---

## ORM

**Object-Relational Mapping** — mapping tables/rows to objects. [JPA](#jpa) / Hibernate provide the [ORM](#orm) layer between Java entities and the database.
