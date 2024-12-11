-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(10,2) NOT NULL,
  expiry_date DATE,
  warehouse_id UUID REFERENCES warehouses(id),
  threshold INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS wastage_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES inventory(id),
  quantity INTEGER NOT NULL,
  reason TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS sales_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES inventory(id),
  quantity INTEGER NOT NULL,
  price_per_unit DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create materialized views with a unique row identifier for indexing
DROP MATERIALIZED VIEW IF EXISTS inventory_stats;
CREATE MATERIALIZED VIEW inventory_stats AS
SELECT 
  COALESCE(SUM(quantity), 0) AS total_items,
  COUNT(DISTINCT id) AS unique_items,
  COALESCE(SUM(quantity * price), 0) AS total_value,
  ROW_NUMBER() OVER () AS row_id -- Unique row identifier
FROM inventory;

DROP MATERIALIZED VIEW IF EXISTS wastage_stats;
CREATE MATERIALIZED VIEW wastage_stats AS
SELECT 
  COALESCE(SUM(quantity), 0) AS wasted_items_count,
  COUNT(DISTINCT id) AS wastage_records_count,
  ROW_NUMBER() OVER () AS row_id -- Unique row identifier
FROM wastage_records;

DROP MATERIALIZED VIEW IF EXISTS sales_stats;
CREATE MATERIALIZED VIEW sales_stats AS
SELECT 
  COALESCE(SUM(quantity), 0) AS sold_items_count,
  COALESCE(SUM(total_price), 0) AS total_sales_amount,
  COUNT(DISTINCT id) AS sales_records_count,
  ROW_NUMBER() OVER () AS row_id -- Unique row identifier
FROM sales_records;

DROP MATERIALIZED VIEW IF EXISTS monthly_sales_stats;
CREATE MATERIALIZED VIEW monthly_sales_stats AS
SELECT 
  COALESCE(SUM(quantity), 0) AS monthly_items_sold,
  COALESCE(SUM(total_price), 0) AS monthly_revenue,
  ROW_NUMBER() OVER () AS row_id -- Unique row identifier
FROM sales_records
WHERE date >= date_trunc('month', CURRENT_DATE);

-- Create unique indexes for materialized views to enable CONCURRENTLY refresh
CREATE UNIQUE INDEX inventory_stats_index ON inventory_stats(row_id);
CREATE UNIQUE INDEX wastage_stats_index ON wastage_stats(row_id);
CREATE UNIQUE INDEX sales_stats_index ON sales_stats(row_id);
CREATE UNIQUE INDEX monthly_sales_stats_index ON monthly_sales_stats(row_id);

-- Create refresh function for materialized views
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY inventory_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY wastage_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY sales_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_sales_stats;
END;
$$ LANGUAGE plpgsql;

-- Create function to get dashboard summary
CREATE OR REPLACE FUNCTION get_dashboard_summary()
RETURNS TABLE (
  total_inventory_items BIGINT,
  total_wasted_items BIGINT,
  total_sold_items BIGINT,
  monthly_sales_revenue DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.total_items,
    w.wasted_items_count,
    s.sold_items_count,
    m.monthly_revenue
  FROM 
    inventory_stats i,
    wastage_stats w,
    sales_stats s,
    monthly_sales_stats m;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh stats after data changes
CREATE OR REPLACE FUNCTION refresh_stats_trigger()
RETURNS trigger AS $$
BEGIN
  PERFORM refresh_dashboard_stats();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_inventory_stats
AFTER INSERT OR UPDATE OR DELETE ON inventory
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_stats_trigger();

CREATE TRIGGER refresh_wastage_stats
AFTER INSERT OR UPDATE OR DELETE ON wastage_records
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_stats_trigger();

CREATE TRIGGER refresh_sales_stats
AFTER INSERT OR UPDATE OR DELETE ON sales_records
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_stats_trigger();

-- Initial data refresh
SELECT refresh_dashboard_stats();
