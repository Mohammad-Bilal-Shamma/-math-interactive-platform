# Aiven onboarding status

## Completed configuration

- The project `nuqta-numerical-platform` uses the Aiven MySQL service `mysql-121dc65` on the free tier.
- The deployment uses MySQL, not PostgreSQL, because the application schema and Drizzle adapter use the MySQL dialect.
- Aiven requires SSL/TLS. The runtime adapter now detects the Aiven hostname and constructs TLS-enabled mysql2 connection options; an optional `DATABASE_SSL_CA` allows strict certificate verification when supplied.
- The secure connection URL was stored in Vercel’s Production and Preview environments only and is not written to this repository.
- The corrected Drizzle migration sequence completed successfully against Aiven. A read-only schema check confirmed these 11 tables: `__drizzle_migrations`, `learning_units`, `learning_lessons`, `learning_questions`, `learning_solved_examples`, `users`, `student_lesson_progress`, `student_unit_progress`, `question_attempts`, `student_daily_streaks`, and `student_assistant_messages`.

## Operational commands

To reapply pending schema changes to Aiven, set `DATABASE_URL` only in the local command environment and run:

```bash
pnpm db:migrate:aiven
```

The script applies pending migrations and closes its database pool. Use the read-only `scripts/verify-aiven-schema.mjs` helper when a table-level verification is required.

## Remaining validation

After the next Vercel deployment, verify a Clerk-authenticated student can save lesson progress and a teacher can load the protected dashboard. These flows confirm the external database runtime, not merely its schema.
