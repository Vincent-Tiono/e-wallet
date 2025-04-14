-- Add phone_number column to the user table
ALTER TABLE public."user"
    ADD COLUMN phone_number VARCHAR(20);

-- Add ip_address column to the wallet table
ALTER TABLE wallet
    ADD COLUMN ip_address VARCHAR(45); 