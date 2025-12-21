#!/usr/bin/env python3
"""
Converts temp-contractors.csv to JSON format for bulk contractor upload to Bidrr.
Validates and formats data according to Bidrr's database schema.
"""

import csv
import json
import sys
import os

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

def parse_services(services_str):
    """Parse services from CSV string - supports comma or pipe separated"""
    if not services_str or services_str.strip() == '':
        return []
    
    # Try comma first, then pipe separator
    if ',' in services_str:
        services = [s.strip() for s in services_str.split(',')]
    elif '|' in services_str:
        services = [s.strip() for s in services_str.split('|')]
    else:
        services = [services_str.strip()]
    
    # Validate against known services
    invalid_services = [s for s in services if s and s not in VALID_SERVICES]
    if invalid_services:
        print(f"⚠️  Warning: Invalid services found: {invalid_services}")
        print(f"   These will be filtered out. Please check spelling/capitalization.")
    
    return [s for s in services if s in VALID_SERVICES]

def validate_contractor(row, row_num):
    """Validate required contractor fields"""
    errors = []
    
    if not row.get('company_name'):
        errors.append(f"Row {row_num}: Missing company_name")
    
    if not row.get('email'):
        errors.append(f"Row {row_num}: Missing email")
    
    if not row.get('postal_code'):
        errors.append(f"Row {row_num}: Missing postal_code")
    
    services = parse_services(row.get('services', ''))
    if not services:
        errors.append(f"Row {row_num}: No valid services (must match Bidrr service list)")
    
    return errors

def format_postal_code(postal_code):
    """Format Canadian postal code to standard format (A1A 1A1)"""
    if not postal_code:
        return postal_code
    
    # Remove spaces and convert to uppercase
    pc = postal_code.replace(' ', '').upper()
    
    # Add space if it's 6 characters (Canadian format)
    if len(pc) == 6:
        return f"{pc[:3]} {pc[3:]}"
    
    return pc

def convert_csv_to_json(csv_path, output_path):
    """Convert CSV file to JSON array for bulk upload"""
    contractors = []
    errors = []
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            
            for row_num, row in enumerate(reader, start=2):  # Start at 2 (header is row 1)
                # Validate row
                row_errors = validate_contractor(row, row_num)
                if row_errors:
                    errors.extend(row_errors)
                    continue
                
                # Parse and validate services
                services = parse_services(row.get('services', ''))
                
                # Build contractor object
                contractor = {
                    "email": row['email'].strip().lower(),
                    "company_name": row['company_name'].strip(),
                    "postal_code": format_postal_code(row['postal_code'].strip()),
                    "services": services,
                    "radius": 50,  # Hardcoded as requested
                    "is_temp_account": True  # Mark as temporary contractor
                }
                
                # Add optional fields if present
                if row.get('first_name'):
                    contractor["first_name"] = row['first_name'].strip()
                if row.get('last_name'):
                    contractor["last_name"] = row['last_name'].strip()
                if row.get('phone_number'):
                    contractor["phone_number"] = row['phone_number'].strip()
                if row.get('city'):
                    contractor["city"] = row['city'].strip()
                if row.get('region') or row.get('province'):
                    contractor["region"] = (row.get('region') or row.get('province', '')).strip()
                if row.get('business_address'):
                    contractor["business_address"] = row['business_address'].strip()
                if row.get('company_size'):
                    contractor["company_size"] = row['company_size'].strip()
                if row.get('website'):
                    contractor["website"] = row['website'].strip()
                
                contractors.append(contractor)
        
        # Print summary
        print(f"\n✅ Conversion Summary:")
        print(f"   Total contractors: {len(contractors)}")
        print(f"   Errors found: {len(errors)}")
        
        if errors:
            print(f"\n❌ Errors:")
            for error in errors:
                print(f"   {error}")
            print(f"\n⚠️  Fix these errors and try again.")
            return False
        
        # Write to output file
        with open(output_path, 'w', encoding='utf-8') as jsonfile:
            json.dump(contractors, jsonfile, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Successfully converted to: {output_path}")
        print(f"\nNext step: Run the upload script:")
        print(f"   node scripts/bulk-upload-contractors.js {output_path}")
        
        return True
        
    except FileNotFoundError:
        print(f"❌ Error: File not found: {csv_path}")
        print(f"   Make sure the CSV file exists at: ~/Desktop/temp-contractors.csv")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    # Default paths
    csv_path = os.path.expanduser("~/Desktop/temp-contractors.csv")
    output_path = os.path.expanduser("~/Desktop/temp-contractors.json")
    
    # Allow custom paths via command line
    if len(sys.argv) > 1:
        csv_path = sys.argv[1]
    if len(sys.argv) > 2:
        output_path = sys.argv[2]
    
    print(f"🔄 Converting CSV to JSON...")
    print(f"   Input:  {csv_path}")
    print(f"   Output: {output_path}")
    
    success = convert_csv_to_json(csv_path, output_path)
    
    sys.exit(0 if success else 1)
