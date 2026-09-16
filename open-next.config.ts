import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Pages here are prerendered and never revalidated, so they can be served straight
// from Workers static assets — no R2 bucket or KV namespace needed.
export default defineCloudflareConfig({
	incrementalCache: staticAssetsIncrementalCache,
});
