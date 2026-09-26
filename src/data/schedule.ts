export const days = [
  { key: 'mon', label: 'MON' },
  { key: 'tue', label: 'TUE' },
  { key: 'wed', label: 'WED' },
  { key: 'thu', label: 'THU' },
  { key: 'fri', label: 'FRI' },
  { key: 'sat', label: 'SAT' },
  { key: 'sun', label: 'SUN' },
] as const;

export type DayKey = (typeof days)[number]['key'];

export type ScheduleItem = {
  id: string;
  day: DayKey;
  time: string;
  className: string;
};

export const schedule: ScheduleItem[] = [
  { id: 'mon-1900', day: 'mon', time: '19:00', className: '하타' },
  { id: 'mon-2030', day: 'mon', time: '20:30', className: '소마' },

  { id: 'tue-1310', day: 'tue', time: '13:10', className: '사운드배스' },
  { id: 'tue-1830', day: 'tue', time: '18:30', className: '테라피' },
  { id: 'tue-2000', day: 'tue', time: '20:00', className: '하타' },

  { id: 'wed-1900', day: 'wed', time: '19:00', className: '소마' },
  { id: 'wed-2030', day: 'wed', time: '20:30', className: '아로마' },

  { id: 'thu-1310', day: 'thu', time: '13:10', className: '사운드배스' },
  { id: 'thu-1830', day: 'thu', time: '18:30', className: '하타' },
  { id: 'thu-2000', day: 'thu', time: '20:00', className: '테라피' },

  { id: 'fri-1900', day: 'fri', time: '19:00', className: '하타' },
  { id: 'fri-2030', day: 'fri', time: '20:30', className: '싱잉볼' },

  { id: 'sat-1600', day: 'sat', time: '16:00', className: '하타' },

  { id: 'sun-1800', day: 'sun', time: '18:00', className: '사운드배스' },
];

export const scheduleTimes = [
  '13:10',
  '16:00',
  '18:00',
  '18:30',
  '19:00',
  '20:00',
  '20:30',
] as const;