-- Allow admin-created listings (e.g. Facebook imports saved as Pending) to omit
-- price and mileage. Missing values are stored as NULL rather than 0.
-- Existing rows are unaffected. Seller/public create flows still require both.
ALTER TABLE `Car` MODIFY `price` DECIMAL(12, 2) NULL,
    MODIFY `mileage` INTEGER NULL;
