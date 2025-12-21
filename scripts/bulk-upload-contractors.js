#!/usr/bin/env node
/**
 * Bulk upload contractors to Bidrr backend API
 *
 * Usage: node scripts/bulk-upload-contractors.js <json-file-path>
 * Example: node scripts/bulk-upload-contractors.js ~/Desktop/temp-contractors.json
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.bidrr.ca"
const BATCH_SIZE = 10 // Upload in batches to avoid overwhelming the server
const DELAY_BETWEEN_BATCHES = 2000 // 2 seconds delay between batches

async function uploadContractor(contractor, index) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/contractors/bulk-create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contractor),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    const data = await response.json()
    console.log(`✅ [${index + 1}] Uploaded: ${contractor.company_name} (${contractor.email})`)
    return { success: true, contractor, data }
  } catch (error) {
    console.error(`❌ [${index + 1}] Failed: ${contractor.company_name} - ${error.message}`)
    return { success: false, contractor, error: error.message }
  }
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function bulkUpload(jsonPath) {
  try {
    // Read JSON file
    const fullPath = jsonPath.startsWith("~") ? path.join(process.env.HOME, jsonPath.slice(1)) : path.resolve(jsonPath)

    console.log(`📂 Reading file: ${fullPath}\n`)

    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${fullPath}`)
    }

    const fileContent = fs.readFileSync(fullPath, "utf8")
    const contractors = JSON.parse(fileContent)

    if (!Array.isArray(contractors) || contractors.length === 0) {
      throw new Error("JSON file must contain an array of contractors")
    }

    console.log(`📊 Found ${contractors.length} contractors to upload\n`)
    console.log(`🚀 Starting bulk upload (${BATCH_SIZE} at a time)...\n`)

    // Upload in batches
    const results = []
    for (let i = 0; i < contractors.length; i += BATCH_SIZE) {
      const batch = contractors.slice(i, i + BATCH_SIZE)
      const batchNum = Math.floor(i / BATCH_SIZE) + 1
      const totalBatches = Math.ceil(contractors.length / BATCH_SIZE)

      console.log(`📦 Batch ${batchNum}/${totalBatches} (${batch.length} contractors)...`)

      // Upload batch in parallel
      const batchPromises = batch.map((contractor, batchIndex) => uploadContractor(contractor, i + batchIndex))

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)

      // Delay between batches (except for the last batch)
      if (i + BATCH_SIZE < contractors.length) {
        console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES / 1000}s before next batch...\n`)
        await delay(DELAY_BETWEEN_BATCHES)
      }
    }

    // Summary
    const successful = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    console.log(`\n${"=".repeat(60)}`)
    console.log(`📊 Upload Summary:`)
    console.log(`   Total:      ${contractors.length}`)
    console.log(`   Successful: ${successful} ✅`)
    console.log(`   Failed:     ${failed} ❌`)
    console.log(`${"=".repeat(60)}\n`)

    // Show failed contractors
    if (failed > 0) {
      console.log(`❌ Failed contractors:`)
      results
        .filter((r) => !r.success)
        .forEach((r) => {
          console.log(`   - ${r.contractor.company_name} (${r.contractor.email}): ${r.error}`)
        })
      console.log("")
    }

    // Save results to file
    const resultsPath = fullPath.replace(".json", "-results.json")
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2))
    console.log(`💾 Detailed results saved to: ${resultsPath}\n`)

    process.exit(failed > 0 ? 1 : 0)
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`)
    process.exit(1)
  }
}

// Main execution
const args = process.argv.slice(2)

if (args.length === 0) {
  console.log(`
Usage: node scripts/bulk-upload-contractors.js <json-file-path>

Example:
  node scripts/bulk-upload-contractors.js ~/Desktop/temp-contractors.json

This script will:
  1. Read the JSON file with contractor data
  2. Upload contractors in batches of ${BATCH_SIZE}
  3. Show progress and results
  4. Save detailed results to a file
`)
  process.exit(1)
}

const jsonPath = args[0]
bulkUpload(jsonPath)
