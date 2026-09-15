export const games = [
  {
    id: 1,
    day: 'Thursday',
    time: '7:15 PM CT',
    network: 'Prime Video',
    away: { city: 'Dallas', name: 'Cowboys', short: 'DAL', record: '0-0', color: '#003594' },
    home: { city: 'Philadelphia', name: 'Eagles', short: 'PHI', record: '0-0', color: '#004c54' },
    awayPercent: 38,
    homePercent: 62,
    status: 'open',
    lockText: 'Locks Thursday at 6:15 PM CT'
  },
  {
    id: 2,
    day: 'Sunday',
    time: '12:00 PM CT',
    network: 'CBS',
    away: { city: 'Pittsburgh', name: 'Steelers', short: 'PIT', record: '0-0', color: '#ffb612' },
    home: { city: 'Cincinnati', name: 'Bengals', short: 'CIN', record: '0-0', color: '#fb4f14' },
    awayPercent: 54,
    homePercent: 46,
    status: 'open',
    lockText: 'Locks Sunday at 11:00 AM CT'
  },
  {
    id: 3,
    day: 'Sunday',
    time: '3:25 PM CT',
    network: 'FOX',
    away: { city: 'Green Bay', name: 'Packers', short: 'GB', record: '0-0', color: '#203731' },
    home: { city: 'Chicago', name: 'Bears', short: 'CHI', record: '0-0', color: '#0b162a' },
    awayPercent: 71,
    homePercent: 29,
    status: 'open',
    lockText: 'Locks Sunday at 2:25 PM CT'
  },
  {
    id: 4,
    day: 'Sunday Night',
    time: '7:20 PM CT',
    network: 'NBC',
    away: { city: 'Buffalo', name: 'Bills', short: 'BUF', record: '0-0', color: '#00338d' },
    home: { city: 'Kansas City', name: 'Chiefs', short: 'KC', record: '0-0', color: '#e31837' },
    awayPercent: 44,
    homePercent: 56,
    status: 'locked',
    winner: 'home',
    awayScore: 24,
    homeScore: 27,
    lockText: 'Locked'
  }
];

export const leaderboard = [
  { rank: 1, name: 'Abdul S.', initials: 'AS', week: 13, season: 74, accuracy: '71.2%', streak: 6 },
  { rank: 2, name: 'Michael E.', initials: 'ME', week: 12, season: 72, accuracy: '69.2%', streak: 4, current: true },
  { rank: 3, name: 'Jose L.', initials: 'JL', week: 11, season: 69, accuracy: '66.3%', streak: 2 },
  { rank: 4, name: 'Divya S.', initials: 'DS', week: 10, season: 67, accuracy: '64.4%', streak: 3 },
  { rank: 5, name: 'Oscar M.', initials: 'OM', week: 9, season: 63, accuracy: '60.6%', streak: 1 }
];

export const players = [
  { name: 'Michael Eilers', email: 'michael@example.com', role: 'Commissioner', status: 'Active', submitted: '12 of 16' },
  { name: 'Abdul Shaik', email: 'abdul@example.com', role: 'Player', status: 'Active', submitted: '16 of 16' },
  { name: 'Jose Lozano', email: 'jose@example.com', role: 'Player', status: 'Active', submitted: '14 of 16' },
  { name: 'Divya Selvarajan', email: 'divya@example.com', role: 'Player', status: 'Active', submitted: '16 of 16' },
  { name: 'Oscar Mejia', email: 'oscar@example.com', role: 'Player', status: 'Inactive', submitted: '0 of 16' }
];
