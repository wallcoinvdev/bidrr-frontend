# Simplified Bulk Upload for Temp Contractors

## Two Simple Steps

### Step 1: Generate SQL from CSV
```bash
python3 scripts/csv-to-sql-contractors.py > /tmp/insert-contractors.sql
```

This reads your CSV, validates everything, and creates SQL INSERT statements.

### Step 2: Run SQL with psql
```bash
psql 'postgresql://neondb_owner:npg_7dpDTMmrHu5j@ep-dry-grass-aedwml2y-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' < /tmp/insert-contractors.sql
```

## Or Do It In One Command

```bash
python3 scripts/csv-to-sql-contractors.py | psql 'postgresql://neondb_owner:npg_7dpDTMmrHu5j@ep-dry-grass-aedwml2y-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
```

## What Happens

1. Script reads `~/Desktop/temp-contractors.csv`
2. Validates all data (services, postal codes, required fields)
3. Generates SQL INSERT statements
4. Sets `is_temp_account = TRUE` for all contractors
5. Uses `ON CONFLICT (email) DO NOTHING` to skip duplicates
6. psql executes the SQL and inserts into your database

## CSV Format Required

Your CSV must have these columns:
- `company_name` (required)
- `email` (required)
- `postal_code` (required)
- `services` (required - comma or pipe separated)

Optional columns:
- `first_name`, `last_name`, `phone_number`, `city`, `region`/`province`, `business_address`, `company_size`, `website`

Done!
