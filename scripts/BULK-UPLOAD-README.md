# Bulk Upload Contractors to Bidrr

This guide explains how to bulk upload temp contractors from a CSV file.

## Prerequisites

- Python 3.x installed
- Node.js installed
- CSV file at `~/Desktop/temp-contractors.csv`

## CSV Format

Your CSV file should have these columns:

```csv
company_name,email,postal_code,services
ABC Plumbing,abc@example.com,S7K 1J5,"Plumbing,Water Heater Maintenance"
XYZ Electric,xyz@example.com,S7N 0W4,"Electrical Assistance,Smart Home Installation"
```

### Required Columns:
- `company_name` - Business name
- `email` - Contact email (unique)
- `postal_code` - Service location postal code
- `services` - Comma-separated service list (must match Bidrr services exactly)

### Optional Columns:
- `first_name` - Contact first name
- `last_name` - Contact last name
- `phone_number` - Contact phone
- `city` - City name
- `region` or `province` - Province/state (e.g., SK, ON, BC)
- `business_address` - Full business address
- `company_size` - Company size (e.g., "1-5 employees")
- `website` - Company website URL

**Note:** `radius` is automatically set to 50km for all contractors.

## Step 1: Convert CSV to JSON

Run the Python script to validate and convert your CSV:

```bash
python3 scripts/csv-to-json-contractors.py
```

This will:
- Read `~/Desktop/temp-contractors.csv`
- Validate all data against Bidrr requirements
- Check that services match the official Bidrr service list
- Format postal codes correctly
- Create `~/Desktop/temp-contractors.json`

### Custom Paths

You can specify custom input/output paths:

```bash
python3 scripts/csv-to-json-contractors.py /path/to/input.csv /path/to/output.json
```

## Step 2: Upload to Backend

### Option A: Using the API (Recommended)

Run the Node.js script to upload contractors through the API:

```bash
node scripts/bulk-upload-contractors.js ~/Desktop/temp-contractors.json
```

This will:
- Upload contractors in batches of 10
- Show progress in real-time
- Handle errors gracefully
- Save detailed results to `temp-contractors-results.json`

**Note:** The backend API endpoint `/api/admin/contractors/bulk-create` must be implemented on the backend for this to work.

### Option B: Direct SQL Upload

If the API endpoint is not ready, you can use direct SQL:

1. Open `scripts/bulk-upload-contractors.sql`
2. Replace the example data with your actual contractor data from the JSON
3. Run the SQL script in your database client (psql, Supabase SQL editor, etc.)

**Warning:** Direct SQL bypasses validation and security checks. Use the API method when possible.

## Valid Bidrr Services

Services must match exactly (case-sensitive). Here are some examples:

- Plumbing
- Electrical Assistance
- HVAC Maintenance
- Roof Repair & Replacement
- Landscaping
- House Cleaning
- Appliance Repair
- Smart Home Installation
- Solar Panel Installation
- Snow Removal

See the full list in `scripts/csv-to-json-contractors.py` or `lib/services.ts`.

## Troubleshooting

### Invalid Services Error

If you see "Invalid services found", check:
1. Spelling matches exactly (case-sensitive)
2. Use ampersands (&) not "and" where applicable
3. Check for extra spaces

### File Not Found

Make sure your CSV is at:
- macOS/Linux: `~/Desktop/temp-contractors.csv`
- Windows: `C:\Users\YourName\Desktop\temp-contractors.csv`

### Upload Failures

Check the `-results.json` file for detailed error messages. Common issues:
- Duplicate email addresses
- Missing required fields
- Invalid postal code format

## Example CSV

```csv
company_name,email,postal_code,services,phone_number,city,region
Wilson Plumbing,wilson@example.com,S7K 1J5,"Plumbing,Water Heater Maintenance",555-1234,Saskatoon,SK
Best Electric,best@example.com,S7N 0W4,"Electrical Assistance,Smart Home Installation",555-5678,Saskatoon,SK
Green Landscaping,green@example.com,S7M 3H2,"Landscaping,Lawncare,Snow Removal",555-9012,Saskatoon,SK
```

## Notes

- The `radius` field is automatically set to 50km for all contractors
- Duplicate emails will be rejected
- Invalid services are filtered out with warnings
- Postal codes are automatically formatted (e.g., S7K1J5 → S7K 1J5)
