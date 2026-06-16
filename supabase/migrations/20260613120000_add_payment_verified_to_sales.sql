-- Add payment_verified column to sales table
ALTER TABLE public.sales
ADD COLUMN IF NOT EXISTS payment_verified boolean DEFAULT false;

-- Add comment to explain the column
COMMENT ON COLUMN public.sales.payment_verified IS 'Indicates whether the full payment for the sale has been verified by admin';
