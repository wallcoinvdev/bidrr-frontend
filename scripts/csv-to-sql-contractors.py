#!/usr/bin/env python3
"""
Converts temp-contractors.csv directly to SQL INSERT statements for Bidrr.
Validates and formats data, geocodes postal codes using OpenCage API, then outputs SQL ready for psql.
Uses temp_* columns for proper temp account functionality.
"""

import csv
import sys
import os
import time
import urllib.request
import urllib.parse
import json

# Valid Bidrr services (must match exactly)
VALID_SERVICES = [
    "Air Duct Cleaning", "Carpet Cleaning", "Chimney Cleaning", "Cleaning",
    "Deep Cleaning", "House Cleaning", "Move-In/Move-Out Cleaning", "Oven Cleaning",
    "Post-Construction Cleaning", "Refrigerator Cleaning", "Spring Cleaning",
    "Tile and Grout Cleaning", "Upholstery Cleaning", "Window Cleaning",
    "Aquarium Maintenance", "Dog Walking", "Pet Cleanup", "Pet Grooming",
    "Pet Kennel Cleaning", "Pet Sitting", "Pet Training", "Pet Waste Removal",
    "Appliance Repair", "Appliance Installation", "Range Hood Installation",
    "Basement Waterproofing", "Bathtub Refinishing", "Ceiling Repair",
    "Drywall Repair", "Foundation Repair", "Garage Door Repair", "Glass Repair",
    "Grout Repair", "Gutter Repair", "Gutter Installation & Cleaning",
    "Home Maintenance", "Masonry Repair", "Minor Home Repairs", "Siding Repair",
    "Sump Pump Maintenance", "Water Heater Maintenance", "Windows & Doors Repair",
    "Air Purifier Installation", "Cabinet Installation", "Cabinet Refacing",
    "Countertop Installation", "Countertop Repair", "Backsplash Installation",
    "Crown Molding Installation", "Curtain Rod Installation", "EV Charger Installation",
    "Floor Installation", "Floor Refinishing", "Humidifier Installation",
    "Install Blinds", "Install Window Treatments", "Light Installation",
    "Lock Installation or Repair", "Mirror Installation", "Pet Door Installation",
    "Safe Installation", "Satellite & Set Top Boxes Installation",
    "Security System Installation", "Security Camera Installation",
    "Doorbell Camera Installation", "Shelf Installation", "Shelving Installation",
    "Skylight Installation", "Smart Home Installation", "Smart Lighting Setup",
    "Smart Lock Installation", "Smart Thermostat Installation",
    "Sprinkler System Installation", "Sprinkler System Maintenance",
    "Thermostat Installation & Repair", "TV & Home Theater Installation",
    "TV Mounting", "Deck Construction", "Driveway Sealing", "Fencing",
    "Gate Installation & Repair", "Garden Bed Installation", "Gardening",
    "Landscaping", "Lawncare", "Outdoor Kitchen Installation",
    "Outdoor Lighting Installation", "Patio Installation", "Pergola Construction",
    "Pond Maintenance", "Pressure Washing", "Retaining Wall Construction",
    "Retaining Wall Installation", "Shed Installation", "Snow Removal",
    "Stump Grinding", "Tree Removal", "Yard Work", "Artificial Turf Installation",
    "Drainage Solutions", "French Drain Installation",
    "Carbon Monoxide Detector Maintenance", "Fireproofing",
    "Smoke Detector Maintenance", "Energy Audit", "Weatherproofing",
    "Weatherstripping", "Window Sealing", "Insulation Installation",
    "Green Roof Installation", "Solar Panel Installation", "Solar Panel Maintenance",
    "Generator Installation", "Generator Maintenance",
    "Backup Power System Installation", "Rainwater Harvesting System Installation",
    "Composting System Setup", "Asbestos Removal", "Mold Remediation",
    "Pest Control", "Rodent Control", "Wildlife Removal", "Baby Proofing",
    "Nursery Setup", "Playground Installation", "Toy Organization",
    "Wheelchair Ramp Installation", "Grab Bar Installation",
    "Accessibility Modifications", "Stair Lift Installation",
    "Holiday Decoration Removal", "Holiday Decoration Setup", "Party Cleanup",
    "Party Setup", "Winterization Services", "Storm Damage Repair",
    "Emergency Board-Up Services", "Acoustic Panel Installation", "Bed Assembly",
    "Builders", "Carpentry Services", "Ceiling Fan Repair", "Decoration",
    "Fence Painting", "Furniture Assembly", "Hang Art", "Hang Curtains",
    "Home Improvement", "Home Staging", "Home Theater Setup", "IKEA Assembly",
    "Indoor Painting", "Interior Decoration", "Light Carpentry", "Odor Removal",
    "Organization", "Painting & Decorating", "Picture Hanging", "Room Measurement",
    "Soundproofing", "Vintage Home Restoration", "Wallpapering", "Wallpaper Removal",
    "Asphalt Shingle Preservation", "Asphalt Shingle Rejuvenation",
    "Asphalt Shingles Maintenance", "Asphalt Shingles Replacement",
    "Cedar Shake Maintenance", "Cedar Shake Replacement", "Roof Maintenance",
    "Roof Repair & Replacement", "Attic Cleaning", "Car Washing",
    "Elevator Maintenance", "Fireplace Maintenance", "Home Automation Services",
    "Home Gym Setup", "Home Network Setup", "Home Office Setup",
    "Computer Setup & Troubleshooting", "Printer Setup & Installation",
    "Laundry and Ironing", "Linens Washing", "Packing & Unpacking",
    "Pool Maintenance", "Pool Table Maintenance", "Sauna Maintenance", "Sewing",
    "Structural Maintenance", "Trash & Furniture Removal", "Wine Cellar Maintenance",
    "Blinds Repair", "Dry Cleaning", "Electrical Assistance", "General Handyman",
    "Heavy Lifting & Loading", "Help Moving", "HVAC Maintenance",
    "Outdoor Maintenance", "Plumbing", "Septic Tank Maintenance",
    "Tile Installation", "Dog Run Installation"
]

def sql_escape(value):
    """Escape single quotes for SQL"""
    if value is None:
        return 'NULL'
    return value.replace("'", "''")

def sql_value(value):
    """Format value for SQL, return NULL if empty"""
    return f"'{sql_escape(value)}'" if value else 'NULL'

def parse_services(services_str):
    """Parse services from CSV string"""
    if not services_str or services_str.strip() == '':
        return []
    
    # Try comma first, then pipe separator
    if ',' in services_str:
        services = [s.strip() for s in services_str.split(',')]
    elif '|' in services_str:
        services = [s.strip() for s in services_str.split('|')]
    else:
        services = [services_str.strip()]
    
    # Filter to valid services only
    valid = [s for s in services if s in VALID_SERVICES]
    
    if len(valid) < len(services):
        invalid = [s for s in services if s not in VALID_SERVICES]
        print(f"-- Warning: Filtered out invalid services: {invalid}", file=sys.stderr)
    
    return valid

def format_services_array(services):
    """Format services as PostgreSQL text array"""
    if not services:
        return "ARRAY[]::text[]"
    
    escaped_services = [sql_escape(s) for s in services]
    services_list = "', '".join(escaped_services)
    return f"ARRAY['{services_list}']::text[]"

def format_postal_code(postal_code):
    """Format Canadian postal code to standard format (A1A 1A1)"""
    if not postal_code:
        return postal_code
    
    pc = postal_code.replace(' ', '').upper()
    
    if len(pc) == 6:
        return f"{pc[:3]} {pc[3:]}"
    
    return pc

# Get OpenCage API key from environment
OPENCAGE_API_KEY = os.environ.get('OPENCAGE_API_KEY')
if not OPENCAGE_API_KEY:
    print("ERROR: OPENCAGE_API_KEY environment variable not set", file=sys.stderr)
    print("Please set it with: export OPENCAGE_API_KEY='your_key_here'", file=sys.stderr)
    sys.exit(1)

# Cache for geocoding results to avoid duplicate API calls
geocode_cache = {}

def geocode_postal_code(postal_code):
    """
    Geocode a Canadian postal code using OpenCage API (same as backend).
    Returns (latitude, longitude) tuple or (None, None) if geocoding fails.
    Includes retry logic with exponential backoff.
    """
    if not postal_code:
        return None, None
    
    # Check cache first
    if postal_code in geocode_cache:
        return geocode_cache[postal_code]
    
    max_retries = 3
    base_wait = 1
    
    for attempt in range(max_retries):
        try:
            query = urllib.parse.quote(f"{postal_code}, Canada")
            url = f"https://api.opencagedata.com/geocode/v1/json?q={query}&key={OPENCAGE_API_KEY}&limit=1"
            
            print(f"-- Geocoding {postal_code} (attempt {attempt + 1}/{max_retries})...", file=sys.stderr)
            
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=15) as response:
                data = json.loads(response.read().decode())
                
                if data.get('results') and len(data['results']) > 0:
                    geometry = data['results'][0]['geometry']
                    lat = float(geometry['lat'])
                    lon = float(geometry['lng'])
                    geocode_cache[postal_code] = (lat, lon)
                    
                    print(f"-- Success: {postal_code} -> ({lat}, {lon})", file=sys.stderr)
                    
                    # Rate limiting: wait 1 second between requests
                    time.sleep(1)
                    
                    return lat, lon
                else:
                    print(f"-- Warning: No results for {postal_code}", file=sys.stderr)
                    geocode_cache[postal_code] = (None, None)
                    return None, None
                    
        except urllib.error.URLError as e:
            wait_time = base_wait * (2 ** attempt)
            print(f"-- Network error for {postal_code}: {str(e)}", file=sys.stderr)
            
            if attempt < max_retries - 1:
                print(f"-- Retrying in {wait_time} seconds...", file=sys.stderr)
                time.sleep(wait_time)
            else:
                print(f"-- Failed after {max_retries} attempts", file=sys.stderr)
                geocode_cache[postal_code] = (None, None)
                return None, None
                
        except Exception as e:
            print(f"-- Error geocoding {postal_code}: {str(e)}", file=sys.stderr)
            geocode_cache[postal_code] = (None, None)
            return None, None
    
    return None, None

def format_coordinate(coord):
    """Format coordinate for SQL, return NULL if None"""
    if coord is None:
        return 'NULL'
    return str(coord)

def generate_sql(csv_path):
    """Generate SQL INSERT statements from CSV"""
    
    print("-- Bulk Insert Temp Contractors for Bidrr")
    print("-- Generated from: temp-contractors.csv")
    print("-- Using OpenCage API for geocoding")
    print("-- Using temp_* columns for proper temp account functionality")
    print()
    print("BEGIN;")
    print()
    
    inserted_count = 0
    error_count = 0
    geocode_fail_count = 0
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            
            for row_num, row in enumerate(reader, start=2):
                try:
                    # Required fields
                    email = row.get('email', '').strip().lower()
                    company_name = row.get('company_name', '').strip()
                    postal_code = format_postal_code(row.get('postal_code', '').strip())
                    services = parse_services(row.get('services', ''))
                    
                    # Validation
                    if not email or not company_name or not postal_code or not services:
                        print(f"-- ERROR Row {row_num}: Missing required fields (email={bool(email)}, company={bool(company_name)}, postal={bool(postal_code)}, services={len(services)})", file=sys.stderr)
                        error_count += 1
                        continue
                    
                    # Geocode postal code
                    latitude, longitude = geocode_postal_code(postal_code)
                    
                    if latitude is None or longitude is None:
                        print(f"-- WARNING Row {row_num}: Failed to geocode {postal_code}, contractor may not receive mission notifications", file=sys.stderr)
                        geocode_fail_count += 1
                    
                    # Format services as PostgreSQL array
                    services_array = format_services_array(services)
                    
                    print(f"-- Row {row_num}: {company_name}")
                    print("INSERT INTO users (")
                    if latitude and longitude:
                        print("    temp_email, temp_company_name, temp_postal_code, temp_services, role, radius_km, latitude, longitude, is_temp_account, temp_account_created_at")
                    else:
                        print("    temp_email, temp_company_name, temp_postal_code, temp_services, role, radius_km, is_temp_account, temp_account_created_at")
                    print(") VALUES (")
                    print(f"    '{sql_escape(email)}',")
                    print(f"    '{sql_escape(company_name)}',")
                    print(f"    '{sql_escape(postal_code)}',")
                    print(f"    {services_array},")
                    print(f"    'contractor',")
                    print(f"    50,")
                    if latitude and longitude:
                        print(f"    {latitude},")
                        print(f"    {longitude},")
                    print(f"    TRUE,")
                    print(f"    NOW()")
                    print(");")
                    print()
                    
                    inserted_count += 1
                    
                except Exception as e:
                    print(f"-- ERROR Row {row_num}: {str(e)}", file=sys.stderr)
                    error_count += 1
        
        print("COMMIT;")
        print()
        print(f"-- Summary: {inserted_count} contractors prepared for insert")
        
        if geocode_fail_count > 0:
            print(f"-- Warning: {geocode_fail_count} contractors could not be geocoded", file=sys.stderr)
        
        if error_count > 0:
            print(f"-- Errors: {error_count} rows skipped due to validation errors", file=sys.stderr)
        
    except FileNotFoundError:
        print(f"-- ERROR: File not found: {csv_path}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"-- ERROR: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    csv_path = os.path.expanduser("~/Desktop/temp-contractors.csv")
    
    if len(sys.argv) > 1:
        csv_path = sys.argv[1]
    
    print(f"-- Reading CSV from: {csv_path}", file=sys.stderr)
    generate_sql(csv_path)
