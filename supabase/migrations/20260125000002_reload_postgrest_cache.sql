-- Reload PostgREST schema cache after table rename (portal_processes → ref_processes)
NOTIFY pgrst, 'reload schema';
