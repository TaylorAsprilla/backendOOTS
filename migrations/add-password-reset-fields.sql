-- Migration: Add password reset fields to users table
-- Created: 2024
-- Description: Adds password_reset_token and password_reset_expires columns for password recovery functionality

USE oots_db;

-- Add password reset token field
ALTER TABLE users
ADD COLUMN password_reset_token VARCHAR(255) NULL
AFTER status;

-- Add password reset expiration field
ALTER TABLE users
ADD COLUMN password_reset_expires DATETIME NULL
AFTER password_reset_token;

-- Create index for faster token lookups
CREATE INDEX idx_password_reset_token ON users(password_reset_token);

-- Verify changes
DESCRIBE users;
