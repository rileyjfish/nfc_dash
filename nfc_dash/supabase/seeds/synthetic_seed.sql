-- Synthetic dataset for development and UI testing.
-- Safe to run multiple times: deterministic IDs + upserts.

begin;

insert into facility_types (id, label, category) values
  ('mine', 'Mine', 'frontend'),
  ('mill', 'Mill', 'frontend'),
  ('isr', 'ISR', 'frontend'),
  ('conversion', 'Conversion', 'fuel_processing'),
  ('enrichment', 'Enrichment', 'fuel_processing'),
  ('deconversion', 'Deconversion', 'fuel_processing'),
  ('fuel_fabrication', 'Fuel Fabrication', 'fuel_processing'),
  ('reactor', 'Reactor', 'reactor'),
  ('on_site_afr', 'On-Site AFR', 'backend'),
  ('interim_storage', 'Interim Storage', 'backend'),
  ('repository', 'Repository', 'backend'),
  ('reprocessing', 'Reprocessing', 'backend')
on conflict (id) do update
set label = excluded.label,
    category = excluded.category;

insert into owners (id, owner_name, owner_type, notes) values
  ('10000000-0000-0000-0000-000000000001', 'Northern Uranium Corp', 'private', 'Synthetic owner for UI testing'),
  ('10000000-0000-0000-0000-000000000002', 'Frontier Fuel Systems', 'private', 'Synthetic owner for UI testing'),
  ('10000000-0000-0000-0000-000000000003', 'National Atomic Energy Agency', 'state', 'Synthetic owner for UI testing'),
  ('10000000-0000-0000-0000-000000000004', 'Bluewater Power Utility', 'utility', 'Synthetic owner for UI testing'),
  ('10000000-0000-0000-0000-000000000005', 'Continental Waste Authority', 'state', 'Synthetic owner for UI testing')
on conflict (id) do update
set owner_name = excluded.owner_name,
    owner_type = excluded.owner_type,
    notes = excluded.notes;

insert into sites (id, site_name, latitude, longitude, notes) values
  ('20000000-0000-0000-0000-000000000001', 'Raven Rock Mine Complex', 52.4781, -113.7214, 'Synthetic site in central Alberta, Canada'),
  ('20000000-0000-0000-0000-000000000002', 'Mesa Verde ISR Field', 36.7829, -108.1262, 'Synthetic site in New Mexico, USA'),
  ('20000000-0000-0000-0000-000000000003', 'Pine Basin Mill', 44.5917, -110.5478, 'Synthetic site near regional ore bodies'),
  ('20000000-0000-0000-0000-000000000004', 'Harbor Conversion Campus', 51.5081, -0.1281, 'Synthetic site with conversion and deconversion units'),
  ('20000000-0000-0000-0000-000000000005', 'Prairie Enrichment Park', 39.0997, -94.5786, 'Synthetic centrifuge campus'),
  ('20000000-0000-0000-0000-000000000006', 'Riverbend Fuel Works', 35.4676, -97.5164, 'Synthetic UO2 fuel fabrication site'),
  ('20000000-0000-0000-0000-000000000007', 'Seabrook Power Station', 50.9097, 1.4044, 'Synthetic twin-unit power reactor site'),
  ('20000000-0000-0000-0000-000000000008', 'North Bay AFR Annex', 43.6532, -79.3832, 'Synthetic on-site spent fuel storage area'),
  ('20000000-0000-0000-0000-000000000009', 'Granite Reprocessing Center', 48.8566, 2.3522, 'Synthetic backend fuel cycle facility'),
  ('20000000-0000-0000-0000-000000000010', 'Red Canyon Repository', 40.7608, -111.8910, 'Synthetic deep geological repository')
on conflict (id) do update
set site_name = excluded.site_name,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    notes = excluded.notes;

insert into facilities (
  id,
  site_id,
  facility_name,
  facility_type,
  facility_status,
  proposal_date,
  start_operation,
  end_operation,
  capacity,
  capacity_unit,
  source,
  notes
) values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Raven Rock Mine', 'mine', 'active', '1998-02-01', '2002-07-15', null, 12.4, 'ktU/yr', 'Synthetic data', 'Open pit and underground hybrid operation'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Mesa Verde ISR', 'isr', 'active', '2008-05-10', '2011-03-01', null, 3.1, 'ktU/yr', 'Synthetic data', 'In-situ recovery with satellite wellfields'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'Pine Basin Mill', 'mill', 'active', '1994-09-01', '1999-01-20', null, 5.8, 'ktU/yr', 'Synthetic data', 'Concentrates yellowcake from nearby mines'),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 'Harbor UF6 Conversion Plant', 'conversion', 'active', '1988-01-01', '1993-11-10', null, 9.0, 'ktU/yr', 'Synthetic data', 'Converts U3O8 to UF6 feed'),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', 'Prairie Enrichment Facility', 'enrichment', 'active', '2001-06-01', '2007-02-14', null, 5.2, 'M SWU/yr', 'Synthetic data', 'Gas centrifuge cascade halls A-D'),
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000006', 'Riverbend Fuel Fabrication', 'fuel_fabrication', 'active', '1999-03-15', '2004-08-30', null, 1100, 'tHM/yr', 'Synthetic data', 'Produces PWR and BWR assemblies'),
  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000007', 'Seabrook Unit 1', 'reactor', 'active', '1980-07-01', '1988-12-15', null, 1.2, 'GWe', 'Synthetic data', 'Pressurized water reactor unit 1'),
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000008', 'North Bay On-Site AFR', 'on_site_afr', 'active', '1991-04-10', '1995-10-01', null, 650, 'tHM', 'Synthetic data', 'Dry cask storage expansion area'),
  ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000009', 'Granite Reprocessing Plant', 'reprocessing', 'active', '1975-01-01', '1984-06-01', null, 900, 'tHM/yr', 'Synthetic data', 'Aqueous reprocessing with vitrification line'),
  ('30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000010', 'Red Canyon Repository', 'repository', 'planned', '2012-10-15', null, null, 70000, 'tHM', 'Synthetic data', 'Deep geological repository project')
on conflict (id) do update
set site_id = excluded.site_id,
    facility_name = excluded.facility_name,
    facility_type = excluded.facility_type,
    facility_status = excluded.facility_status,
    proposal_date = excluded.proposal_date,
    start_operation = excluded.start_operation,
    end_operation = excluded.end_operation,
    capacity = excluded.capacity,
    capacity_unit = excluded.capacity_unit,
    source = excluded.source,
    notes = excluded.notes;

insert into facility_ownerships (
  id,
  facility_id,
  owner_id,
  stake,
  stake_unit,
  stake_start,
  stake_end,
  source,
  notes
) values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 100, 'percent', '2002-07-15', null, 'Synthetic data', 'Single-owner mine'),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 100, 'percent', '2011-03-01', null, 'Synthetic data', 'Single-owner ISR site'),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 60, 'percent', '1999-01-20', null, 'Synthetic data', 'Joint ownership with state agency'),
  ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 40, 'percent', '1999-01-20', null, 'Synthetic data', 'Joint ownership with private operator'),
  ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 100, 'percent', '1993-11-10', null, 'Synthetic data', 'State-owned conversion asset'),
  ('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 100, 'percent', '2007-02-14', null, 'Synthetic data', 'Private enrichment operator'),
  ('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 100, 'percent', '2004-08-30', null, 'Synthetic data', 'Fuel fabrication owner'),
  ('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000004', 100, 'percent', '1988-12-15', null, 'Synthetic data', 'Utility-owned operating reactor'),
  ('40000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000004', 100, 'percent', '1995-10-01', null, 'Synthetic data', 'Utility-owned storage annex'),
  ('40000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005', 100, 'percent', '2012-10-15', null, 'Synthetic data', 'State waste authority repository project')
on conflict (id) do update
set facility_id = excluded.facility_id,
    owner_id = excluded.owner_id,
    stake = excluded.stake,
    stake_unit = excluded.stake_unit,
    stake_start = excluded.stake_start,
    stake_end = excluded.stake_end,
    source = excluded.source,
    notes = excluded.notes;

commit;
