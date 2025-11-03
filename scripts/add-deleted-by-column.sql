-- Migration: Add deleted_by column to conversations table
-- This column stores an array of user IDs who have deleted the conversation

ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS deleted_by JSONB DEFAULT '[]'::jsonb;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_conversations_deleted_by 
ON conversations USING gin(deleted_by);

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'conversations' 
AND column_name = 'deleted_by';
