-- Add creation_date column to the wallet table
ALTER TABLE wallet
    ADD COLUMN IF NOT EXISTS creation_date TIMESTAMP; 