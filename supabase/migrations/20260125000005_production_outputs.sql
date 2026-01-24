-- Production Outputs Table
-- Story 4.3: Stores output packages created during production

CREATE TABLE portal_production_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_entry_id UUID REFERENCES portal_production_entries(id) ON DELETE CASCADE NOT NULL,
  package_number TEXT NOT NULL,
  product_name_id UUID REFERENCES ref_product_names(id),
  wood_species_id UUID REFERENCES ref_wood_species(id),
  humidity_id UUID REFERENCES ref_humidity(id),
  type_id UUID REFERENCES ref_types(id),
  processing_id UUID REFERENCES ref_processing(id),
  fsc_id UUID REFERENCES ref_fsc(id),
  quality_id UUID REFERENCES ref_quality(id),
  thickness TEXT,
  width TEXT,
  length TEXT,
  pieces TEXT,
  volume_m3 DECIMAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for common query pattern
CREATE INDEX idx_production_outputs_entry_id ON portal_production_outputs(production_entry_id);

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
