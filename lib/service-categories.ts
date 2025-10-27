// Service category definitions and mappings
export const SERVICE_CATEGORIES = {
  CLEANING: "Cleaning Services",
  PET: "Pet-Related Services",
  REPAIRS: "Repairs and Maintenance",
  INSTALLATION: "Installation Services",
  OUTDOOR: "Outdoor Services",
  SAFETY: "Safety and Security Services",
  ENERGY: "Energy Efficiency and Sustainability",
  PEST: "Pest Control Services",
  CHILD: "Child and Family Services",
  SEASONAL: "Seasonal and Event-Based Services",
  HOME_IMPROVEMENT: "Home Improvement and Decor",
  ROOFING: "Roofing Services",
  SPECIALIZED: "Specialized Home Services",
} as const

// Map each service to its category
export const SERVICE_TO_CATEGORY: Record<string, string> = {
  // Cleaning Services
  "Air Duct Cleaning": SERVICE_CATEGORIES.CLEANING,
  "Carpet Cleaning": SERVICE_CATEGORIES.CLEANING,
  "Chimney Cleaning": SERVICE_CATEGORIES.CLEANING,
  Cleaning: SERVICE_CATEGORIES.CLEANING,
  "Deep Cleaning": SERVICE_CATEGORIES.CLEANING,
  "House Cleaning": SERVICE_CATEGORIES.CLEANING,
  "Move-In/Move-Out Cleaning": SERVICE_CATEGORIES.CLEANING,
  "Oven Cleaning": SERVICE_CATEGORIES.CLEANING,
  "Post-Construction Cleaning": SERVICE_CATEGORIES.CLEANING,
  "Refrigerator Cleaning": SERVICE_CATEGORIES.CLEANING,
  "Spring Cleaning": SERVICE_CATEGORIES.CLEANING,
  "Tile and Grout Cleaning": SERVICE_CATEGORIES.CLEANING,
  "Upholstery Cleaning": SERVICE_CATEGORIES.CLEANING,
  "Window Cleaning": SERVICE_CATEGORIES.CLEANING,

  // Pet-Related Services
  "Aquarium Maintenance": SERVICE_CATEGORIES.PET,
  "Dog Walking": SERVICE_CATEGORIES.PET,
  "Pet Cleanup": SERVICE_CATEGORIES.PET,
  "Pet Grooming": SERVICE_CATEGORIES.PET,
  "Pet Kennel Cleaning": SERVICE_CATEGORIES.PET,
  "Pet Sitting": SERVICE_CATEGORIES.PET,
  "Pet Training": SERVICE_CATEGORIES.PET,
  "Pet Waste Removal": SERVICE_CATEGORIES.PET,

  // Repairs and Maintenance
  "Appliance Repair": SERVICE_CATEGORIES.REPAIRS,
  "Basement Waterproofing": SERVICE_CATEGORIES.REPAIRS,
  "Bathtub Refinishing": SERVICE_CATEGORIES.REPAIRS,
  "Ceiling Repair": SERVICE_CATEGORIES.REPAIRS,
  "Drywall Repair": SERVICE_CATEGORIES.REPAIRS,
  "Foundation Repair": SERVICE_CATEGORIES.REPAIRS,
  "Garage Door Repair": SERVICE_CATEGORIES.REPAIRS,
  "Glass Repair": SERVICE_CATEGORIES.REPAIRS,
  "Grout Repair": SERVICE_CATEGORIES.REPAIRS,
  "Gutter Repair": SERVICE_CATEGORIES.REPAIRS,
  "Home Maintenance": SERVICE_CATEGORIES.REPAIRS,
  "Masonry Repair": SERVICE_CATEGORIES.REPAIRS,
  "Minor Home Repairs": SERVICE_CATEGORIES.REPAIRS,
  "Siding Repair": SERVICE_CATEGORIES.REPAIRS,
  "Sump Pump Maintenance": SERVICE_CATEGORIES.REPAIRS,
  "Water Heater Maintenance": SERVICE_CATEGORIES.REPAIRS,
  "Windows & Doors Repair": SERVICE_CATEGORIES.REPAIRS,

  // Installation Services
  "Air Purifier Installation": SERVICE_CATEGORIES.INSTALLATION,
  "Cabinet Installation": SERVICE_CATEGORIES.INSTALLATION,
  "Child Safety Gate Installation": SERVICE_CATEGORIES.INSTALLATION,
  "Countertop Installation": SERVICE_CATEGORIES.INSTALLATION,
  "Curtain Rod Installation": SERVICE_CATEGORIES.INSTALLATION,
  "EV Charger Installation": SERVICE_CATEGORIES.INSTALLATION,
  "Floor Installation": SERVICE_CATEGORIES.INSTALLATION,
  "Humidifier Installation": SERVICE_CATEGORIES.INSTALLATION,
  "Install Blinds": SERVICE_CATEGORIES.INSTALLATION,
  "Install Window Treatments": SERVICE_CATEGORIES.INSTALLATION,
  "Light Installation": SERVICE_CATEGORIES.INSTALLATION,
  "Lock Installation or Repair": SERVICE_CATEGORIES.INSTALLATION,
  "Mirror Installation": SERVICE_CATEGORIES.INSTALLATION,
  "Pet Door Installation": SERVICE_CATEGORIES.INSTALLATION,
  "Safe Installation": SERVICE_CATEGORIES.INSTALLATION,
  "Satellite & Set Top Boxes Installation": SERVICE_CATEGORIES.INSTALLATION,
  "Security System Installation": SERVICE_CATEGORIES.INSTALLATION,
  "Shelf Installation": SERVICE_CATEGORIES.INSTALLATION,
  "Skylight Installation": SERVICE_CATEGORIES.INSTALLATION,
  "Smart Home Installation": SERVICE_CATEGORIES.INSTALLATION,
  "Smart Lighting Setup": SERVICE_CATEGORIES.INSTALLATION,
  "Smart Lock Installation": SERVICE_CATEGORIES.INSTALLATION,
  "Sprinkler System Installation": SERVICE_CATEGORIES.INSTALLATION,
  "Thermostat Installation & Repair": SERVICE_CATEGORIES.INSTALLATION,
  "TV & Home Theater Installation": SERVICE_CATEGORIES.INSTALLATION,
  "TV Mounting": SERVICE_CATEGORIES.INSTALLATION,

  // Outdoor Services
  "Deck Construction": SERVICE_CATEGORIES.OUTDOOR,
  "Driveway Sealing": SERVICE_CATEGORIES.OUTDOOR,
  Fencing: SERVICE_CATEGORIES.OUTDOOR,
  "Garden Bed Installation": SERVICE_CATEGORIES.OUTDOOR,
  Gardening: SERVICE_CATEGORIES.OUTDOOR,
  "Gate Installation & Repair": SERVICE_CATEGORIES.OUTDOOR,
  "Gutter Installation & Cleaning": SERVICE_CATEGORIES.OUTDOOR,
  Landscaping: SERVICE_CATEGORIES.OUTDOOR,
  Lawncare: SERVICE_CATEGORIES.OUTDOOR,
  "Outdoor Kitchen Installation": SERVICE_CATEGORIES.OUTDOOR,
  "Outdoor Lighting Installation": SERVICE_CATEGORIES.OUTDOOR,
  "Patio Installation": SERVICE_CATEGORIES.OUTDOOR,
  "Pergola Construction": SERVICE_CATEGORIES.OUTDOOR,
  "Pond Maintenance": SERVICE_CATEGORIES.OUTDOOR,
  "Pressure Washing": SERVICE_CATEGORIES.OUTDOOR,
  "Retaining Wall Construction": SERVICE_CATEGORIES.OUTDOOR,
  "Shed Installation": SERVICE_CATEGORIES.OUTDOOR,
  "Snow Removal": SERVICE_CATEGORIES.OUTDOOR,
  "Sprinkler System Maintenance": SERVICE_CATEGORIES.OUTDOOR,
  "Stump Grinding": SERVICE_CATEGORIES.OUTDOOR,
  "Tree Removal": SERVICE_CATEGORIES.OUTDOOR,
  "Yard Work": SERVICE_CATEGORIES.OUTDOOR,

  // Safety and Security Services
  "Carbon Monoxide Detector Maintenance": SERVICE_CATEGORIES.SAFETY,
  Fireproofing: SERVICE_CATEGORIES.SAFETY,
  "Smoke Detector Maintenance": SERVICE_CATEGORIES.SAFETY,

  // Energy Efficiency and Sustainability
  "Composting System Setup": SERVICE_CATEGORIES.ENERGY,
  "Energy Audit": SERVICE_CATEGORIES.ENERGY,
  "Green Roof Installation": SERVICE_CATEGORIES.ENERGY,
  "Insulation Installation": SERVICE_CATEGORIES.ENERGY,
  "Rainwater Harvesting System Installation": SERVICE_CATEGORIES.ENERGY,
  "Solar Panel Installation": SERVICE_CATEGORIES.ENERGY,
  "Solar Panel Maintenance": SERVICE_CATEGORIES.ENERGY,
  Weatherstripping: SERVICE_CATEGORIES.ENERGY,
  "Window Sealing": SERVICE_CATEGORIES.ENERGY,

  // Pest Control Services
  "Asbestos Removal": SERVICE_CATEGORIES.PEST,
  "Mold Remediation": SERVICE_CATEGORIES.PEST,
  "Pest Control": SERVICE_CATEGORIES.PEST,
  "Rodent Control": SERVICE_CATEGORIES.PEST,
  "Wildlife Removal": SERVICE_CATEGORIES.PEST,

  // Child and Family Services
  "Baby Proofing": SERVICE_CATEGORIES.CHILD,
  "Nursery Setup": SERVICE_CATEGORIES.CHILD,
  "Playground Installation": SERVICE_CATEGORIES.CHILD,
  "Toy Organization": SERVICE_CATEGORIES.CHILD,

  // Seasonal and Event-Based Services
  "Holiday Decoration Removal": SERVICE_CATEGORIES.SEASONAL,
  "Holiday Decoration Setup": SERVICE_CATEGORIES.SEASONAL,
  "Party Cleanup": SERVICE_CATEGORIES.SEASONAL,
  "Party Setup": SERVICE_CATEGORIES.SEASONAL,

  // Home Improvement and Decor
  "Acoustic Panel Installation": SERVICE_CATEGORIES.HOME_IMPROVEMENT,
  "Bed Assembly": SERVICE_CATEGORIES.HOME_IMPROVEMENT,
  Builders: SERVICE_CATEGORIES.HOME_IMPROVEMENT,
  "Carpentry Services": SERVICE_CATEGORIES.HOME_IMPROVEMENT,
  Decoration: SERVICE_CATEGORIES.HOME_IMPROVEMENT,
  "Fence Painting": SERVICE_CATEGORIES.HOME_IMPROVEMENT,
  "Floor Refinishing": SERVICE_CATEGORIES.HOME_IMPROVEMENT,
  "Furniture Assembly": SERVICE_CATEGORIES.HOME_IMPROVEMENT,
  "Hang Art": SERVICE_CATEGORIES.HOME_IMPROVEMENT,
  "Hang Curtains": SERVICE_CATEGORIES.HOME_IMPROVEMENT,
  "Home Improvement": SERVICE_CATEGORIES.HOME_IMPROVEMENT,
  "Home Staging": SERVICE_CATEGORIES.HOME_IMPROVEMENT,
  "Home Theater Setup": SERVICE_CATEGORIES.HOME_IMPROVEMENT,
  "IKEA Assembly": SERVICE_CATEGORIES.HOME_IMPROVEMENT,
  "Indoor Painting": SERVICE_CATEGORIES.HOME_IMPROVEMENT,
  "Interior Decoration": SERVICE_CATEGORIES.HOME_IMPROVEMENT,
  "Light Carpentry": SERVICE_CATEGORIES.HOME_IMPROVEMENT,
  "Odor Removal": SERVICE_CATEGORIES.HOME_IMPROVEMENT,
  Organization: SERVICE_CATEGORIES.HOME_IMPROVEMENT,
  "Painting & Decorating": SERVICE_CATEGORIES.HOME_IMPROVEMENT,
  "Picture Hanging": SERVICE_CATEGORIES.HOME_IMPROVEMENT,
  "Room Measurement": SERVICE_CATEGORIES.HOME_IMPROVEMENT,
  Soundproofing: SERVICE_CATEGORIES.HOME_IMPROVEMENT,
  "Vintage Home Restoration": SERVICE_CATEGORIES.HOME_IMPROVEMENT,
  Wallpapering: SERVICE_CATEGORIES.HOME_IMPROVEMENT,
  "Wallpaper Removal": SERVICE_CATEGORIES.HOME_IMPROVEMENT,

  // Roofing Services
  "Asphalt Shingle Preservation": SERVICE_CATEGORIES.ROOFING,
  "Asphalt Shingle Rejuvenation": SERVICE_CATEGORIES.ROOFING,
  "Asphalt Shingles Maintenance": SERVICE_CATEGORIES.ROOFING,
  "Asphalt Shingles Replacement": SERVICE_CATEGORIES.ROOFING,
  "Cedar Shake Maintenance": SERVICE_CATEGORIES.ROOFING,
  "Cedar Shake Replacement": SERVICE_CATEGORIES.ROOFING,
  "Roof Maintenance": SERVICE_CATEGORIES.ROOFING,
  "Roof Repair & Replacement": SERVICE_CATEGORIES.ROOFING,

  // Specialized Home Services
  "Attic Cleaning": SERVICE_CATEGORIES.SPECIALIZED,
  "Car Washing": SERVICE_CATEGORIES.SPECIALIZED,
  "Elevator Maintenance": SERVICE_CATEGORIES.SPECIALIZED,
  "Fireplace Maintenance": SERVICE_CATEGORIES.SPECIALIZED,
  "Home Automation Services": SERVICE_CATEGORIES.SPECIALIZED,
  "Home Gym Setup": SERVICE_CATEGORIES.SPECIALIZED,
  "Home Network Setup": SERVICE_CATEGORIES.SPECIALIZED,
  "Home Office Setup": SERVICE_CATEGORIES.SPECIALIZED,
  "Laundry and Ironing": SERVICE_CATEGORIES.SPECIALIZED,
  "Linens Washing": SERVICE_CATEGORIES.SPECIALIZED,
  "Packing & Unpacking": SERVICE_CATEGORIES.SPECIALIZED,
  "Pool Maintenance": SERVICE_CATEGORIES.SPECIALIZED,
  "Pool Table Maintenance": SERVICE_CATEGORIES.SPECIALIZED,
  "Sauna Maintenance": SERVICE_CATEGORIES.SPECIALIZED,
  Sewing: SERVICE_CATEGORIES.SPECIALIZED,
  "Storm Damage Repair": SERVICE_CATEGORIES.SPECIALIZED,
  "Structural Maintenance": SERVICE_CATEGORIES.SPECIALIZED,
  "Trash & Furniture Removal": SERVICE_CATEGORIES.SPECIALIZED,
  "Wine Cellar Maintenance": SERVICE_CATEGORIES.SPECIALIZED,
}

// Get category for a service
export function getServiceCategory(service: string): string | null {
  return SERVICE_TO_CATEGORY[service] || null
}

// Check if category requires structure details
export function categoryRequiresStructureDetails(category: string | null): boolean {
  if (!category) return false
  return [
    SERVICE_CATEGORIES.CLEANING,
    SERVICE_CATEGORIES.REPAIRS,
    SERVICE_CATEGORIES.INSTALLATION,
    SERVICE_CATEGORIES.OUTDOOR,
    SERVICE_CATEGORIES.SAFETY,
    SERVICE_CATEGORIES.ENERGY,
    SERVICE_CATEGORIES.PEST,
    SERVICE_CATEGORIES.CHILD,
    SERVICE_CATEGORIES.HOME_IMPROVEMENT,
    SERVICE_CATEGORIES.ROOFING,
    SERVICE_CATEGORIES.SPECIALIZED,
  ].includes(category)
}

// Field definitions for each category
export interface CategoryFields {
  area_size?: boolean
  num_items?: boolean
  condition_severity?: boolean
  material_type?: boolean
  location_in_home?: boolean
  materials_provided?: boolean
  special_description?: boolean
  service_frequency?: boolean
  special_requirements?: boolean
  style_theme?: boolean
  energy_usage?: boolean
  event_duration_hours?: boolean
}

export const CATEGORY_FIELDS: Record<string, CategoryFields> = {
  [SERVICE_CATEGORIES.CLEANING]: {
    area_size: true,
    num_items: true,
    condition_severity: true,
  },
  [SERVICE_CATEGORIES.PET]: {
    special_description: true, // Pet type
    num_items: true, // Number of pets
    service_frequency: true,
    special_requirements: true,
  },
  [SERVICE_CATEGORIES.REPAIRS]: {
    special_description: true, // Item/area description
    condition_severity: true,
    materials_provided: true,
  },
  [SERVICE_CATEGORIES.INSTALLATION]: {
    num_items: true,
    location_in_home: true,
    materials_provided: true,
  },
  [SERVICE_CATEGORIES.OUTDOOR]: {
    area_size: true, // Yard size
    material_type: true,
    special_description: true, // Terrain/access
  },
  [SERVICE_CATEGORIES.SAFETY]: {
    num_items: true, // Number of detectors
    materials_provided: true, // Existing system
  },
  [SERVICE_CATEGORIES.ENERGY]: {
    special_description: true, // System size/type
    energy_usage: true,
  },
  [SERVICE_CATEGORIES.PEST]: {
    special_description: true, // Infestation type
    area_size: true,
    condition_severity: true,
  },
  [SERVICE_CATEGORIES.CHILD]: {
    special_description: true, // Children/ages
    area_size: true,
    materials_provided: true,
  },
  [SERVICE_CATEGORIES.SEASONAL]: {
    special_description: true, // Event type/size
    event_duration_hours: true,
  },
  [SERVICE_CATEGORIES.HOME_IMPROVEMENT]: {
    area_size: true, // Room size
    style_theme: true,
    materials_provided: true,
  },
  [SERVICE_CATEGORIES.ROOFING]: {
    area_size: true, // Roof size
    material_type: true,
    condition_severity: true,
  },
  [SERVICE_CATEGORIES.SPECIALIZED]: {
    special_description: true, // Item/system description
    service_frequency: true,
    special_requirements: true,
  },
}

// Get fields for a category
export function getCategoryFields(category: string | null): CategoryFields {
  if (!category) return {}
  return CATEGORY_FIELDS[category] || {}
}
