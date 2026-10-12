# Security Specification & Threat Model — ONS Healthcare

## 1. Core Data Invariants & Zero-Trust Principles

1. **Owner Authority**: Only users authenticated with Google whose verified email matches the configured Owner identity (and verified against the `/admins/{uid}` document) may read or write administrative data. Client assertions of roles are strictly ignored.
2. **PII Isolation & Non-Disclosure**: Customer requests containing patient contact information, phone numbers, and home addresses can only be read by authorized owners/admins. Public users can create requests with validated fields, but never list or read past requests.
3. **Public Catalog Visibility**: Published services, service categories, active service areas, and approved reviews are readable by the public. Administrative drafts and internal notes are restricted.
4. **No Self-Privilege Escalation**: Non-admin users cannot write to `/admins/{id}` or modify their authorization status.
5. **Request Immutability on Submission**: Customers cannot modify requests after creation. Only admins can transition request statuses or add operational notes.
6. **No Phantom Collections**: Any collection not explicitly allowlisted is denied by a default catch-all rule `match /{document=**} { allow read, write: if false; }`.

---

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Payload 1 (Self-Promotion Attack)**: An unauthenticated or standard Google user attempts `POST /admins/{uid}` with `{"role": "owner"}`.
   - *Expected Result*: `PERMISSION_DENIED`
2. **Payload 2 (PII Harvester Attack)**: An authenticated non-admin attempts `GET /customerRequests` or `GET /customerRequests/{id}`.
   - *Expected Result*: `PERMISSION_DENIED`
3. **Payload 3 (Shadow Field Injection)**: An attacker submits a request containing `{ "serviceId": "s1", "isInternalVip": true, "bypassFee": true }`.
   - *Expected Result*: `PERMISSION_DENIED` (fails `hasOnly` schema validation)
4. **Payload 4 (Denial of Wallet ID Bomb)**: An attacker creates a document with a 2KB junk document ID.
   - *Expected Result*: `PERMISSION_DENIED` (`isValidId` regex and length cap)
5. **Payload 5 (Unverified Email Spoof)**: An attacker logs in with an unverified email matching the owner address.
   - *Expected Result*: `PERMISSION_DENIED` (`request.auth.token.email_verified == true` mandate)
6. **Payload 6 (Price Tampering on Creation)**: A client creates a `customerRequest` with `confirmedPrice: 0` and `status: "confirmed"`.
   - *Expected Result*: `PERMISSION_DENIED` (initial status must be "new", confirmedPrice cannot be set by client)
7. **Payload 7 (Catalog Defacement)**: An unauthenticated visitor sends `PATCH /services/{id}` with altered pricing or malicious HTML.
   - *Expected Result*: `PERMISSION_DENIED`
8. **Payload 8 (Review Fabricator)**: A malicious script attempts `POST /reviews` with `verified: true, published: true`.
   - *Expected Result*: `PERMISSION_DENIED` (only admins can create/publish reviews)
9. **Payload 9 (Audit Log Deletion)**: A user attempts `DELETE /auditLogs/{id}`.
   - *Expected Result*: `PERMISSION_DENIED` (audit logs are append-only or admin-restricted)
10. **Payload 10 (Large Payload Exhaustion)**: An attacker sends a 5MB text payload into `notes` in `customerRequests`.
    - *Expected Result*: `PERMISSION_DENIED` (`.size() <= 1000` constraint)
11. **Payload 11 (Terminal State Override by Non-Admin)**: An ordinary visitor tries to cancel an already completed request.
    - *Expected Result*: `PERMISSION_DENIED`
12. **Payload 12 (Direct Settings Rewrite)**: An unauthenticated script attempts `PUT /siteSettings/global` to change contact phone numbers to a fraudulent number.
    - *Expected Result*: `PERMISSION_DENIED`
