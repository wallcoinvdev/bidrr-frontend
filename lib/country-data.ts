export const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
]

export const CANADIAN_PROVINCES = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Northwest Territories",
  "Nova Scotia",
  "Nunavut",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Yukon",
]

export const UK_REGIONS = ["England", "Scotland", "Wales", "Northern Ireland"]

export const AUSTRALIAN_STATES = [
  "Australian Capital Territory",
  "New South Wales",
  "Northern Territory",
  "Queensland",
  "South Australia",
  "Tasmania",
  "Victoria",
  "Western Australia",
]

export const NZ_REGIONS = [
  "Auckland",
  "Bay of Plenty",
  "Canterbury",
  "Gisborne",
  "Hawke's Bay",
  "Manawatu-Wanganui",
  "Marlborough",
  "Nelson",
  "Northland",
  "Otago",
  "Southland",
  "Taranaki",
  "Tasman",
  "Waikato",
  "Wellington",
  "West Coast",
]

export function getRegionsForCountry(country: string): string[] {
  switch (country) {
    case "US":
      return US_STATES
    case "CA":
      return CANADIAN_PROVINCES
    case "UK":
      return UK_REGIONS
    case "AU":
      return AUSTRALIAN_STATES
    case "NZ":
      return NZ_REGIONS
    default:
      return US_STATES
  }
}

export function getPostalCodeLabel(country: string): string {
  switch (country) {
    case "US":
      return "ZIP Code"
    case "CA":
      return "Postal Code"
    case "UK":
      return "Postcode"
    case "AU":
    case "NZ":
      return "Postcode"
    default:
      return "Postal Code"
  }
}

export function getRegionLabel(country: string): string {
  switch (country) {
    case "US":
      return "State"
    case "CA":
      return "Province"
    case "UK":
      return "Region"
    case "AU":
      return "State/Territory"
    case "NZ":
      return "Region"
    default:
      return "State/Province"
  }
}

export function getPostalCodePlaceholder(country: string): string {
  switch (country) {
    case "US":
      return "12345"
    case "CA":
      return "A1A 1A1"
    case "UK":
      return "SW1A 1AA"
    case "AU":
      return "2000"
    case "NZ":
      return "1010"
    default:
      return "12345"
  }
}
