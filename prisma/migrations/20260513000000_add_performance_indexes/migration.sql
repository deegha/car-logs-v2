-- ──────────────────────────────────────────────────────────────
-- Performance indexes
--
-- Root cause of 500ms+ TTFB on listing / detail pages:
--   1. Car_status_idx(status) only covers the WHERE clause; MySQL
--      still filesorts all AVAILABLE rows for ORDER BY createdAt DESC.
--   2. Car_make_model_idx(make, model) starts with make — useless when
--      the query always leads with status = 'AVAILABLE'.
--   3. CarImage has no index beyond the FK-generated carId index, so
--      WHERE carId IN (...) AND isPrimary = true reads all images per
--      car and post-filters.
-- ──────────────────────────────────────────────────────────────

-- Drop the two indexes being superseded
DROP INDEX `Car_status_idx`     ON `Car`;
DROP INDEX `Car_make_model_idx` ON `Car`;

-- status + createdAt
-- Covers: default listing page, homepage count, any query with no
-- extra filters — WHERE status = ? ORDER BY createdAt DESC LIMIT n
CREATE INDEX `Car_status_createdAt_idx`
    ON `Car`(`status`, `createdAt`);

-- status + make + createdAt
-- Covers: make-filtered listing + related-cars query
-- WHERE status = ? AND make = ? ORDER BY createdAt DESC LIMIT n
CREATE INDEX `Car_status_make_createdAt_idx`
    ON `Car`(`status`, `make`, `createdAt`);

-- status + make + model
-- Covers: make+model filtered listing
-- WHERE status = ? AND make = ? AND model = ?
CREATE INDEX `Car_status_make_model_idx`
    ON `Car`(`status`, `make`, `model`);

-- status + featured + createdAt
-- Covers: homepage featured-cars query
-- WHERE status = ? AND featured = ? ORDER BY createdAt DESC LIMIT 6
CREATE INDEX `Car_status_featured_createdAt_idx`
    ON `Car`(`status`, `featured`, `createdAt`);

-- status + bodyType
-- Covers: bodyType filter on listing page
-- WHERE status = ? AND bodyType = ?
CREATE INDEX `Car_status_bodyType_idx`
    ON `Car`(`status`, `bodyType`);

-- CarImage: composite for primary-image lookups on every listing page
-- WHERE carId IN (...) AND isPrimary = true LIMIT 1
CREATE INDEX `CarImage_carId_isPrimary_idx`
    ON `CarImage`(`carId`, `isPrimary`);
