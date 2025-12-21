#!/usr/bin/env python3
"""
Generates SQL INSERT statements from temp-contractors.json
Output can be piped directly into psql
"""

import json
import sys
import os

def escape_sql_string(s):
    """Escape single quotes for SQL"""
    if s is None:
        return 'NULL'
    return f"'{str(s).replace("'", "''")}'"

def generate_sql_inserts(json_path):
    """Generate SQL INSERT statements from JSON file"""
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            contractors = json.load(f)
        
        print("-- Bulk insert temp contractors")
        print("-- Generated from temp-contractors.json")
        print("BEGIN;\n")
        
        for contractor in contractors:
            # Required fields
            email = escape_sql_string(contractor['email'])
            company_name = escape_sql_string(contractor['company_name'])
            postal_code = escape_sql_string(contractor['postal_code'])
            services = escape_sql_string(','.join(contractor['services']))
            radius = contractor.get('radius', 50)
            
            # Optional fields
            first_name = escape_sql_string(contractor.get('first_name'))
            last_name = escape_sql_string(contractor.get('last_name'))
            phone_number = escape_sql_string(contractor.get('phone_number'))
            city = escape_sql_string(contractor.get('city'))
            region = escape_sql_string(contractor.get('region'))
            business_address = escape_sql_string(contractor.get('business_address'))
            company_size = escape_sql_string(contractor.get('company_size'))
            website = escape_sql_string(contractor.get('website'))
            
            sql = f"""
INSERT INTO users (
    email, 
    role, 
    first_name, 
    last_name, 
    company_name, 
    phone_number, 
    business_address, 
    city, 
    region, 
    postal_code, 
    services, 
    radius, 
    company_size, 
    website,
    is_temp_account,
    is_verified,
    created_at,
    updated_at
) VALUES (
    {email},
    'contractor',
    {first_name},
    {last_name},
    {company_name},
    {phone_number},
    {business_address},
    {city},
    {region},
    {postal_code},
    {services},
    {radius},
    {company_size},
    {website},
    TRUE,
    FALSE,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;
"""
            print(sql)
        
        print("\nCOMMIT;")
        print(f"\n-- Total contractors: {len(contractors)}")
        
        return True
        
    except FileNotFoundError:
        print(f"-- Error: File not found: {json_path}", file=sys.stderr)
        return False
    except Exception as e:
        print(f"-- Error: {e}", file=sys.stderr)
        return False

if __name__ == "__main__":
    json_path = os.path.expanduser("~/Desktop/temp-contractors.json")
    
    if len(sys.argv) > 1:
        json_path = sys.argv[1]
    
    success = generate_sql_inserts(json_path)
    sys.exit(0 if success else 1)
