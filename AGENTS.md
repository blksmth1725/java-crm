# Agent CRM — Cursor agents

Use these alongside the always-on [`.cursor/rules/agent-crm.mdc`](.cursor/rules/agent-crm.mdc). Specialized rules live in `.cursor/rules/agent-0*.mdc` and attach by file pattern (or pick them in the rules UI).

| #   | Agent          | Role                                                                                                                                                           | Rule file                     |
| --- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| 2   | Java Teacher   | **🧠 What Just Happened** after every Java change; never skip                                                                                                  | `agent-02-java-teacher.mdc`   |
| 1   | Java Architect | Layers, DTOs, constructor injection, annotation explanations, Express parallels                                                                                | `agent-01-java-architect.mdc` |
| 3   | Security       | JWT filter (`OncePerRequestFilter`), `SecurityFilterChain` bean (not `WebSecurityConfigurerAdapter`), agent-scoped queries, filter chain vs Express middleware | `agent-03-security.mdc`       |
| 4   | SQL + JPA      | Supabase/JDBC, entities, `@OneToMany` / `@ManyToOne` / `@JoinColumn`, LAZY fetch, reporting SQL in Supabase, Hibernate vs raw SQL                              | `agent-04-jpa-sql.mdc`        |
| 5   | Automation     | `@Scheduled` + cron meaning, Slack via `RestTemplate` vs `WebClient`, dedicated service class, vs `node-cron`                                                  | `agent-05-automation.mdc`     |
| 6   | PHP            | Standalone cron: call Spring REST → parse → Slack; PHP 8, `curl`; JS vs PHP syntax callouts; keep script simple                                                | `agent-06-php.mdc`            |
| 7   | React          | TanStack Query, Table, Tailwind + shadcn, Zod + RHF, JWT in memory only, no React hand-holding                                                                 | `agent-07-react.mdc`          |
| 8   | DevOps         | Multi-stage Docker, Elastic Beanstalk Docker platform, Supabase env vars; Spring-specific deployment notes                                                     | `agent-08-devops.mdc`         |

**Tip:** Agents 1 and 2 are the default backbone for Java work. When Cursor introduces Java you have not seen yet, pause and ask for an explanation before moving on.
