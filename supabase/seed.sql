-- Clear existing data
TRUNCATE TABLE shadcn_tasks RESTART IDENTITY CASCADE;

-- Insert sample tasks matching the Drizzle seed pattern
INSERT INTO shadcn_tasks (code, title, status, label, priority, estimated_hours, archived, created_at, updated_at) VALUES
('TASK-0001', 'Bypass mobile SSL transmitter', 'todo', 'bug', 'high', 12, false, now() - interval '5 days', now() - interval '5 days'),
('TASK-0002', 'Override optical XML array', 'in-progress', 'feature', 'medium', 8, false, now() - interval '4 days', now() - interval '2 days'),
('TASK-0003', 'Calculate neural HTTP monitor', 'done', 'enhancement', 'low', 16, false, now() - interval '3 days', now() - interval '1 day'),
('TASK-0004', 'Parse bluetooth RSS capacitor', 'canceled', 'documentation', 'high', 4, false, now() - interval '6 days', now() - interval '6 days'),
('TASK-0005', 'Navigate multi-byte SMTP interface', 'todo', 'feature', 'medium', 20, false, now() - interval '2 days', now() - interval '2 days'),
('TASK-0006', 'Compress online JSON bandwidth', 'in-progress', 'bug', 'high', 6, false, now() - interval '1 day', now() - interval '1 hour'),
('TASK-0007', 'Connect auxiliary CSS hard drive', 'done', 'enhancement', 'low', 14, false, now() - interval '7 days', now() - interval '7 days'),
('TASK-0008', 'Index primary JSON circuit', 'todo', 'documentation', 'medium', 10, true, now() - interval '8 days', now() - interval '8 days'),
('TASK-0009', 'Generate haptic TCP protocol', 'in-progress', 'feature', 'high', 18, false, now() - interval '3 hours', now() - interval '1 hour'),
('TASK-0010', 'Back up solid state SCSI array', 'done', 'bug', 'low', 22, false, now() - interval '9 days', now() - interval '9 days'),
('TASK-0011', 'Reboot redundant FTP sensor', 'todo', 'enhancement', 'medium', 7, false, now() - interval '4 hours', now() - interval '4 hours'),
('TASK-0012', 'Transmit optical USB port', 'canceled', 'feature', 'high', 15, false, now() - interval '10 days', now() - interval '10 days'),
('TASK-0013', 'Program cross-platform SQL bus', 'in-progress', 'documentation', 'low', 11, false, now() - interval '2 hours', now() - interval '30 minutes'),
('TASK-0014', 'Synthesize wireless TCP transmitter', 'done', 'bug', 'medium', 9, false, now() - interval '11 days', now() - interval '11 days'),
('TASK-0015', 'Input mobile HTTP firewall', 'todo', 'feature', 'high', 13, false, now() - interval '6 hours', now() - interval '6 hours'),
('TASK-0016', 'Hack multi-byte RAM driver', 'in-progress', 'enhancement', 'low', 5, false, now() - interval '1 hour', now() - interval '15 minutes'),
('TASK-0017', 'Copy auxiliary SSL application', 'done', 'documentation', 'medium', 17, true, now() - interval '12 days', now() - interval '12 days'),
('TASK-0018', 'Quantify virtual XML matrix', 'todo', 'bug', 'high', 8, false, now() - interval '8 hours', now() - interval '8 hours'),
('TASK-0019', 'Connect solid state COM hard drive', 'canceled', 'feature', 'low', 19, false, now() - interval '13 days', now() - interval '13 days'),
('TASK-0020', 'Override digital RSS feed', 'in-progress', 'enhancement', 'medium', 12, false, now() - interval '45 minutes', now() - interval '10 minutes'),
('TASK-0021', 'Generate auxiliary JSON interface', 'done', 'documentation', 'high', 6, false, now() - interval '14 days', now() - interval '14 days'),
('TASK-0022', 'Parse redundant HTTP monitor', 'todo', 'bug', 'low', 21, false, now() - interval '10 hours', now() - interval '10 hours'),
('TASK-0023', 'Navigate online SSL sensor', 'in-progress', 'feature', 'medium', 14, false, now() - interval '30 minutes', now() - interval '5 minutes'),
('TASK-0024', 'Compress digital TCP capacitor', 'done', 'enhancement', 'high', 3, false, now() - interval '15 days', now() - interval '15 days'),
('TASK-0025', 'Index primary USB circuit', 'canceled', 'documentation', 'low', 16, true, now() - interval '16 days', now() - interval '16 days'),
('TASK-0026', 'Calculate neural RSS protocol', 'todo', 'bug', 'medium', 11, false, now() - interval '12 hours', now() - interval '12 hours'),
('TASK-0027', 'Back up cross-platform SMTP array', 'in-progress', 'feature', 'high', 7, false, now() - interval '20 minutes', now() - interval '2 minutes'),
('TASK-0028', 'Reboot auxiliary FTP sensor', 'done', 'enhancement', 'low', 18, false, now() - interval '17 days', now() - interval '17 days'),
('TASK-0029', 'Transmit haptic SQL port', 'todo', 'documentation', 'medium', 9, false, now() - interval '14 hours', now() - interval '14 hours'),
('TASK-0030', 'Program wireless TCP bus', 'in-progress', 'bug', 'high', 15, false, now() - interval '10 minutes', now() - interval '1 minute'),
('TASK-0031', 'Synthesize mobile HTTP transmitter', 'done', 'feature', 'low', 13, false, now() - interval '18 days', now() - interval '18 days'),
('TASK-0032', 'Input optical SSL firewall', 'canceled', 'enhancement', 'medium', 4, false, now() - interval '19 days', now() - interval '19 days'),
('TASK-0033', 'Hack redundant RAM driver', 'todo', 'documentation', 'high', 20, true, now() - interval '16 hours', now() - interval '16 hours'),
('TASK-0034', 'Copy digital SSL application', 'in-progress', 'bug', 'low', 8, false, now() - interval '5 minutes', now() - interval '30 seconds'),
('TASK-0035', 'Quantify solid state XML matrix', 'done', 'feature', 'medium', 12, false, now() - interval '20 days', now() - interval '20 days');

-- Additional randomized tasks for better testing
INSERT INTO shadcn_tasks (code, title, status, label, priority, estimated_hours, archived, created_at, updated_at) 
SELECT 
  'TASK-' || LPAD((1000 + row_number() OVER())::text, 4, '0'),
  CASE (random() * 10)::int
    WHEN 0 THEN 'Implement authentication system'
    WHEN 1 THEN 'Fix responsive design issues'
    WHEN 2 THEN 'Add dark mode support'
    WHEN 3 THEN 'Optimize database queries'
    WHEN 4 THEN 'Write unit tests'
    WHEN 5 THEN 'Update documentation'
    WHEN 6 THEN 'Refactor legacy code'
    WHEN 7 THEN 'Setup CI/CD pipeline'
    WHEN 8 THEN 'Implement caching layer'
    ELSE 'Review security protocols'
  END,
  CASE (random() * 4)::int
    WHEN 0 THEN 'todo'
    WHEN 1 THEN 'in-progress'
    WHEN 2 THEN 'done'
    ELSE 'canceled'
  END,
  CASE (random() * 4)::int
    WHEN 0 THEN 'bug'
    WHEN 1 THEN 'feature'
    WHEN 2 THEN 'enhancement'
    ELSE 'documentation'
  END,
  CASE (random() * 3)::int
    WHEN 0 THEN 'low'
    WHEN 1 THEN 'medium'
    ELSE 'high'
  END,
  (random() * 20 + 1)::int,
  (random() < 0.1),
  now() - (random() * interval '30 days'),
  now() - (random() * interval '7 days')
FROM generate_series(1, 65) -- Generate 65 more tasks for total of 100
;