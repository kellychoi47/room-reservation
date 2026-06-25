const today = new Date();
const dateAt = (days, time) => {
  const date = new Date(today);
  date.setDate(today.getDate() + days);
  const [hours, minutes] = time.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

export const demoRooms = [
  {
    id: 'demo-room-cedar',
    name: 'Cedar Conference Room',
    type: 'Conference room',
    building_name: 'East Wing',
    floor: 'Floor 2',
    room_number: 'E-204',
    location: 'East Wing · Floor 2',
    capacity: 12,
    equipment: ['Display', 'Video conferencing', 'Whiteboard'],
    description: 'A polished conference room for leadership meetings, interviews, and team planning sessions.',
    is_active: true,
    map_x: 42,
    map_y: 38,
  },
  {
    id: 'demo-room-oak',
    name: 'Oak Meeting Room',
    type: 'Meeting room',
    building_name: 'East Wing',
    floor: 'Floor 2',
    room_number: 'E-210',
    location: 'East Wing · Floor 2',
    capacity: 8,
    equipment: ['TV display', 'Conference phone', 'Glass board'],
    description: 'A flexible meeting room for small groups, staff check-ins, and project reviews.',
    is_active: true,
    map_x: 65,
    map_y: 46,
  },
  {
    id: 'demo-room-maple',
    name: 'Maple Training Hall',
    type: 'Training room',
    building_name: 'Main Building',
    floor: 'Floor 1',
    room_number: 'M-118',
    location: 'Main Building · Floor 1',
    capacity: 36,
    equipment: ['Projector', 'Podium', 'Portable microphones'],
    description: 'A larger training and workshop space with flexible seating and presentation equipment.',
    is_active: true,
    map_x: 28,
    map_y: 62,
  },
  {
    id: 'demo-room-birch',
    name: 'Birch Focus Room',
    type: 'Focus room',
    building_name: 'East Wing',
    floor: 'Floor 2',
    room_number: 'E-218',
    location: 'East Wing · Floor 2',
    capacity: 3,
    equipment: ['Monitor', 'Desk power', 'Acoustic panels'],
    description: 'A quiet focus room for one-on-one conversations or heads-down collaboration.',
    is_active: true,
    map_x: 76,
    map_y: 68,
  },
  {
    id: 'demo-room-phone',
    name: 'Phone Booth A',
    type: 'Phone booth',
    building_name: 'East Wing',
    floor: 'Floor 2',
    room_number: 'E-220',
    location: 'East Wing · Floor 2',
    capacity: 1,
    equipment: ['Desk', 'Power outlet', 'Sound privacy'],
    description: 'A compact phone booth for calls, virtual interviews, or private conversations.',
    is_active: true,
    map_x: 82,
    map_y: 30,
  },
];

export const demoReservations = [
  {
    id: 'demo-res-1',
    room_id: 'demo-room-cedar',
    title: 'Staff planning meeting',
    start_time: dateAt(1, '10:00'),
    end_time: dateAt(1, '11:00'),
    attendee_count: 9,
    notes: 'Weekly planning session.',
    status: 'confirmed',
    simulated: false,
  },
  {
    id: 'demo-res-2',
    room_id: 'demo-room-oak',
    title: 'Volunteer onboarding',
    start_time: dateAt(2, '13:30'),
    end_time: dateAt(2, '14:30'),
    attendee_count: 6,
    notes: 'Need TV display.',
    status: 'confirmed',
    simulated: false,
  },
  {
    id: 'demo-res-3',
    room_id: 'demo-room-maple',
    title: 'Community workshop',
    start_time: dateAt(4, '18:00'),
    end_time: dateAt(4, '20:00'),
    attendee_count: 28,
    notes: 'Classroom seating.',
    status: 'confirmed',
    simulated: false,
  },
];

export const demoFloorPlans = [
  {
    id: 'demo-floor-east-2',
    name: 'East Wing — Floor 2',
    building_name: 'East Wing',
    floor: 'Floor 2',
    image_url: '',
  },
];

export const demoSeed = {
  rooms: demoRooms,
  reservations: demoReservations,
  floorPlans: demoFloorPlans,
};
