# Security Specification for FreeSoul Music

## 1. Data Invariants
- Only authenticated admins can modify any data.
- Public users can read all settings and locations.
- `locationId` must match the `id` field within the document.
- `coverBackgroundUrl` must be a valid URL string.
- Timestamps are not strictly required for this simple CMS, but we'll include typical guards.

## 2. The "Dirty Dozen" Payloads (Denial Expected)
1. Unauthenticated user trying to update cover background.
2. Unauthenticated user trying to add a new location.
3. Authenticated (but non-admin) user trying to delete a location.
4. Setting an extremely large string (1MB) as `name` to cause resource exhaustion.
5. Updating a location `id` to something that doesn't match the path.
6. Injecting extra fields (ghost fields) like `isAdmin: true` into a location document.
7. Providing a negative value for `hitArea.x`.
8. Setting `character.width` to a value > 100.
9. Removing required fields like `name` during an update.
10. Spoofing ownerId (if we had one, but here it's global admin).
11. Bypassing validation by sending an invalid type (e.g., number for name).
12. Creating a location with a document ID containing special characters that aren't allowed.

## 3. Test Runner (Mock)
A `firestore.rules.test.ts` would typically check these, ensuring `PERMISSION_DENIED` for all above.
