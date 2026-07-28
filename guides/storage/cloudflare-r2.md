---
id: guide-storage-cloudflare-r2
type: skill
status: active
version: 1
related: [core-philosophy, core-audit, skill-06-lifecycle-and-versioning, skill-07-pre-interview, skill-08-conversation-archive, skill-09-visual-assets, skill-10-environment-integration]
summary: "Provider guide for storage: r2 — bucket setup, the frozen environment variables, how the SigV4 single PUT works in hnk.mjs, object-key conventions, the 100 MiB cap and manual-upload path, and credential hygiene."
---

# Storage Guide — Cloudflare R2

This is the provider document behind the Level 1 answer `storage: r2`
([`07-pre-interview.md` §2.1](../../skill/07-pre-interview.md#21-frozen-interface--the-level-1-question-bank),
question L1-6). Upload **behavior** is frozen by
[`08-conversation-archive.md` §9](../../skill/08-conversation-archive.md#9-upload--frozen-behavior)
and shared with media upload
([`09-visual-assets.md` §8](../../skill/09-visual-assets.md#8-upload));
this guide documents the provider side and adds nothing that overrides them.
Upload is optional: with `storage: none` the archive still works in full, and
the human accepts the disclosed loss surface
([`07-pre-interview.md` §2.2](../../skill/07-pre-interview.md#22-conduct-rules)).

## 1. Bucket setup

1. Create one bucket for the project in the Cloudflare dashboard (or with
   Cloudflare's tooling). **Keep the bucket private** — the default. Raw
   transcripts are private-by-default artifacts; even redacted, they carry
   working prose no one chose to publish.
2. Create an R2 API token **scoped to that bucket** with object read and
   write permission. Cloudflare issues an S3-compatible credential pair
   (access key id + secret access key); note them and the account id.
3. Consult Cloudflare's current documentation for the exact console steps —
   provider interfaces churn, and this guide follows the same
   read-current-documentation stance as
   [`10-environment-integration.md` §4](../../skill/10-environment-integration.md#4-generation-at-installation):
   it freezes nothing about the provider's UI.

## 2. Environment variables — the frozen interface

Upload is configured **only** through environment variables. The table is the
frozen set of [`08-conversation-archive.md` §9](../../skill/08-conversation-archive.md#9-upload--frozen-behavior),
reproduced verbatim; media upload uses the same variables
([`09-visual-assets.md` §8](../../skill/09-visual-assets.md#8-upload)):

| Environment variable | Required | Meaning |
| --- | --- | --- |
| `R2_ACCOUNT_ID` | yes | Cloudflare R2 account |
| `R2_ACCESS_KEY_ID` | yes | access key |
| `R2_SECRET_ACCESS_KEY` | yes | secret key |
| `R2_BUCKET` | yes | target bucket |
| `R2_PUBLIC_BASE_URL` | no | public base for recorded `raw_remote` values |

Set them in the shell of the human running the upload command. There is no
configuration file, and nothing about credentials is ever committed (§5).

## 3. How the upload works in `hnk.mjs`

High-level only — the implementation lives in `scripts/hnk.mjs`, and its
operational rules (eligibility, retries, state changes) are owned by
[`08-conversation-archive.md` §9](../../skill/08-conversation-archive.md#9-upload--frozen-behavior):

- The script speaks the S3-compatible protocol directly, signing each request
  with **AWS Signature Version 4** using `node:crypto` only — no SDK, no
  dependency, per the zero-dependency script rule.
- The payload is read fully into memory and SHA-256-hashed; the hash, host,
  and timestamp form the canonical request, and the derived signing key
  produces the `Authorization` header of one HTTPS **PUT** to the bucket
  endpoint (`<account-id>.r2.cloudflarestorage.com`).
- One buffered single PUT per object; on failure, bounded exponential backoff
  with at most two retries, and on final failure **no state change**. Only
  after a confirmed success are the affected key lines substituted —
  `raw_remote` and `status` on a card, `remote` on a media entry.

## 4. Object-key conventions

Both payload kinds share one bucket, separated by prefix. Keys and recorded
values are frozen by
[`08-conversation-archive.md` §9](../../skill/08-conversation-archive.md#9-upload--frozen-behavior)
point 5 and [`09-visual-assets.md` §8](../../skill/09-visual-assets.md#8-upload):

| Payload | Object key | Recorded value (`raw_remote` / `remote`) |
| --- | --- | --- |
| session raw | `sessions/<id>.full.md` | `<R2_PUBLIC_BASE_URL>/sessions/<id>.full.md` when the base is set, else `r2://<bucket>/sessions/<id>.full.md` |
| media payload | `media/<id>/<original filename>` | `<R2_PUBLIC_BASE_URL>/media/<id>/<filename>` when the base is set, else `r2://<bucket>/media/<id>/<filename>` |

Because identifiers are timestamped and immutable
([`08-conversation-archive.md` §3](../../skill/08-conversation-archive.md#3-the-identifier-scheme--frozen-interface)),
keys never collide and never need renaming.

## 5. The 100 MiB cap and the manual-upload path

The single PUT holds the whole file in memory for signing, so the size cap is
**100 MiB** (frozen; multipart and streaming upload are an explicit v2 item —
[`08-conversation-archive.md` §9](../../skill/08-conversation-archive.md#9-upload--frozen-behavior)
point 3). Oversize payloads are skipped with the reason reported: for raws, a
manual-upload note lands in the card's Follow-ups; for media, the advice goes
to the command output. The manual path:

1. Upload the file with any S3-compatible client (Cloudflare's own tooling,
   `rclone`, an S3 CLI pointed at the R2 endpoint) to the **same object key**
   as the table in §4.
2. Record the locator by hand after the upload is confirmed: edit only the
   `raw_remote` and `status` key lines of the card (`uploaded` only after a
   confirmed success — [`08-conversation-archive.md` §4.4](../../skill/08-conversation-archive.md#44-status-values-and-transitions)),
   or the `remote` field of the media entry (hand-writing `remote` for
   manually uploaded payloads is sanctioned by
   [`09-visual-assets.md` §4.3](../../skill/09-visual-assets.md#43-field-ownership-and-merge-regeneration)).
3. `node scripts/hnk.mjs verify` then treats the record like any uploaded
   one.

## 6. Credential hygiene

- **Never commit environment values**, and never paste them into cards,
  raws, specifications, or the Living layer. Two gates already guard the
  record: mandatory redaction masks credential patterns at write time
  ([`08-conversation-archive.md` §7](../../skill/08-conversation-archive.md#7-mandatory-redaction)),
  and the pre-upload secret scan **blocks** any upload with findings
  ([`08-conversation-archive.md` §9](../../skill/08-conversation-archive.md#9-upload--frozen-behavior)
  point 2; audit item [H4](../../core/audit.md#h--honesty-of-the-record)).
  Those gates protect the record — keeping the values out of shell history
  and dotfiles inside the repository is on the human.
- Prefer the bucket-scoped token of §1; rotate it on any suspicion. Nothing
  in `hnk` needs bucket-management permission.
- Set `R2_PUBLIC_BASE_URL` only when the bucket is deliberately public.
  With a private bucket leave it unset, so recorded locators use the
  `r2://<bucket>/...` form — resolvable only with credentials, and honest
  about that ([core §9](../../core/philosophy.md#9-honesty-of-the-record)).

## 7. Alternative S3-compatible providers

The upload path speaks plain SigV4 over a single PUT, which many providers
implement — but the v1 storage enum is **frozen at `none` | `r2`**
([`07-pre-interview.md` §2.1](../../skill/07-pre-interview.md#21-frozen-interface--the-level-1-question-bank),
L1-6), and the command surface accepts `--provider r2` only
([`08-conversation-archive.md` §8](../../skill/08-conversation-archive.md#8-command-shapes--frozen-interface)).
Pointing the R2 variables at another provider's endpoint is unsupported;
adding a provider value is a closed-enum growth, which requires a version
increment of `07-pre-interview.md` with a recorded reason per
[`06-lifecycle-and-versioning.md`](../../skill/06-lifecycle-and-versioning.md)
— plus a matching guide under `guides/storage/`. Until such a version lands,
the only sanctioned route to another provider is the manual-upload path of
§5, recording the resulting locator by hand.
