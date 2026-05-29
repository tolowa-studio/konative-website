#!/usr/bin/env tsx
/**
 * CLI wrapper for promoteCanadaQueue — run queue ingest + Sanity promotion.
 */
import { promoteCanadaQueueToSanity } from './promoteCanadaQueue'

promoteCanadaQueueToSanity()
  .then((summary) => {
    console.log(JSON.stringify(summary, null, 2))
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
