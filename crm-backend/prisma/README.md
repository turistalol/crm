# Database Migration Guide

This document outlines the process for managing database migrations in different environments.

## Development Environment

For local development, use the following commands:

```bash
# Generate a new migration after schema changes
npm run db:migrate:dev -- --name <migration-name>

# Reset the database and apply all migrations
npm run db:migrate:reset

# Open Prisma Studio to view and edit data
npm run db:studio
```

## Production Environment

For production deployments, follow these steps:

1. **Never** run `migrate dev` in production
2. Use the following command to safely apply migrations:

```bash
npm run db:migrate:deploy
```

This command will:
- Apply pending migrations
- Not reset the database
- Not generate new migrations
- Be safe to run multiple times (idempotent)

## Best Practices

- Always commit migration files to version control
- Review migration files before applying them to production
- Test migrations in staging environment before production
- Use descriptive names for migrations
- Keep migrations small and focused on specific changes

## Troubleshooting

If you encounter issues with migrations:

1. Check the database connection in the `.env` file
2. Ensure the database user has the necessary permissions
3. For development only, you can reset the database using `npm run db:migrate:reset` 