## 1. PocketBase Schema And Types

- [x] 1.1 Confirm or create `foto_portada` file field for actores, productos, experiencias and imperdibles.
- [x] 1.2 Confirm or create `galeria_fotos` multi-file field for actores, productos, experiencias and imperdibles with a maximum of 5 files.
- [x] 1.3 Keep existing `fotos` fields as legacy compatibility fields during the transition.
- [x] 1.4 Update TypeScript entity types to include `foto_portada?: string` and `galeria_fotos?: string[]`.

## 2. Shared Media Resolution

- [x] 2.1 Add helper logic to resolve cover image as `foto_portada || fotos[0]`.
- [x] 2.2 Add helper logic to resolve gallery images from `galeria_fotos` plus legacy `fotos` excluding the resolved cover.
- [x] 2.3 Ensure helper logic deduplicates filenames across cover, gallery and legacy fields.
- [x] 2.4 Add focused unit-like coverage or E2E fixture coverage for legacy fallback behavior.

## 3. Create And Edit Forms

- [x] 3.1 Update actor create/edit forms to separate cover upload and gallery upload.
- [x] 3.2 Update product create/edit forms to separate cover upload and gallery upload.
- [x] 3.3 Update experience create/edit forms to separate cover upload and gallery upload.
- [x] 3.4 Update imperdible create/edit forms to separate cover upload and gallery upload.
- [x] 3.5 Preserve station create/edit behavior and align copy/limits with the shared model.
- [x] 3.6 In edit views, allow choosing an existing image as cover as well as uploading a new cover.
- [x] 3.7 Enforce 1 cover plus up to 5 gallery images in UI validation.

## 4. Display Views

- [x] 4.1 Update actor list/detail views to use cover for summary and gallery for detail.
- [x] 4.2 Update product list/detail views to use cover for summary and gallery for detail.
- [x] 4.3 Update experience list/detail views to use cover for summary and gallery for detail.
- [x] 4.4 Update imperdible list/detail views to use cover for summary and gallery for detail.
- [x] 4.5 Verify station list/detail views still use cover and gallery with legacy fallback.

## 5. Data Migration And Documentation

- [x] 5.1 Document manual PocketBase schema changes required before deploying the UI.
- [x] 5.2 Document legacy behavior: first `fotos` image acts as fallback cover, remaining images act as fallback gallery.
- [x] 5.3 Decide whether to add a non-destructive backfill script for copying legacy `fotos` into new fields.

## 6. Verification

- [x] 6.1 Add or update Playwright tests for cover/gallery rendering with mocked records.
- [x] 6.2 Run `npm.cmd run lint`.
- [x] 6.3 Run `npm.cmd run build`.
- [x] 6.4 Run `npm.cmd run test:e2e`.
- [x] 6.5 Perform a manual smoke check against the configured PocketBase instance before merging.
