import { useMemo, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  Clock3,
  LayoutDashboard,
  Map,
  MapPin,
  RefreshCw,
  Search,
  Users,
} from 'lucide-react';
import Status from '../components/Status';
import { useDemo } from '../demo/DemoContext';

const todayValue = () => new Date().toISOString().slice(0, 10);
const displayDate = (value) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
const timeOptions = Array.from({ length: 27 }, (_, index) => {
  const total = 600 + index * 30;
  const hour = Math.floor(total / 60);
  const minute = total % 60;
  const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const label = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(2000, 0, 1, hour, minute));
  return { value, label };
});

const formatDateTime = (value) => new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
}).format(new Date(value));

export default function Demo() {
  return <div className="shell demo-shell">
    <DemoSidebar />
    <main>
      <header>
        <div>
          <p className="eyebrow">PORTFOLIO DEMO</p>
          <h1>ReserveFlow demo</h1>
        </div>
        <Link className="primary" to="/login">Sign in</Link>
      </header>
      <DemoBanner />
      <DemoMobileNav />
      <section className="page">
        <Routes>
          <Route index element={<DemoDashboard />} />
          <Route path="calendar" element={<DemoCalendar />} />
          <Route path="rooms" element={<DemoRooms />} />
          <Route path="rooms/:id" element={<DemoRoomDetails />} />
          <Route path="book" element={<DemoBooking />} />
          <Route path="map" element={<DemoMap />} />
          <Route path="*" element={<Navigate to="/demo" replace />} />
        </Routes>
      </section>
    </main>
  </div>;
}

function DemoMobileNav() {
  const links = [
    ['/demo', 'Overview'],
    ['/demo/calendar', 'Calendar'],
    ['/demo/rooms', 'Rooms'],
    ['/demo/map', 'Floor map'],
    ['/demo/book', 'Book'],
  ];

  return <nav className="demo-mobile-nav" aria-label="Demo navigation">
    {links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/demo'}>{label}</NavLink>)}
  </nav>;
}

function DemoSidebar() {
  const { resetDemo } = useDemo();
  const links = [
    ['/demo', LayoutDashboard, 'Overview'],
    ['/demo/calendar', CalendarDays, 'Calendar'],
    ['/demo/rooms', Building2, 'Rooms'],
    ['/demo/map', Map, 'Floor map'],
  ];

  return <aside className="sidebar demo-sidebar">
    <div className="brand"><span>R</span> ReserveFlow</div>
    <nav>
      {links.map(([to, Icon, label]) => (
        <NavLink key={to} to={to} end={to === '/demo'}>
          <Icon size={19} />
          {label}
        </NavLink>
      ))}
    </nav>
    <button className="demo-reset" type="button" onClick={resetDemo}>
      <RefreshCw size={16} />
      Reset Demo
    </button>
    <div className="account">
      <div className="avatar">D</div>
      <div>
        <b>Demo Visitor</b>
        <small>portfolio demo</small>
      </div>
    </div>
  </aside>;
}

function DemoBanner() {
  return <div className="demo-banner" role="status">
    You are viewing a demonstration environment. Changes are stored only in this browser and do not affect live data.
  </div>;
}

function DemoDashboard() {
  const { rooms, reservations } = useDemo();
  const upcoming = reservations
    .filter((reservation) => new Date(reservation.start_time) >= new Date())
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    .slice(0, 5);

  return <>
    <div className="welcome">
      <div>
        <p className="eyebrow">DEMO WORKSPACE</p>
        <h2>Explore a production-style room reservation flow.</h2>
        <p>Browse rooms, inspect the calendar, and simulate a reservation without an account.</p>
      </div>
      <Link className="primary" to="/demo/book">Try booking</Link>
    </div>
    <div className="stats">
      <div className="stat"><span>Upcoming</span><strong>{upcoming.length}</strong></div>
      <div className="stat"><span>Available rooms</span><strong>{rooms.length}</strong></div>
      <div className="stat"><span>Demo writes</span><strong>0</strong></div>
    </div>
    <div className="grid-two">
      <section className="card">
        <div className="section-head">
          <div><h3>Upcoming reservations</h3><p>Seeded and simulated demo bookings</p></div>
          <Link to="/demo/calendar">View calendar</Link>
        </div>
        <div className="reservation-list">
          {upcoming.map((reservation) => <ReservationRow key={reservation.id} reservation={reservation} />)}
        </div>
      </section>
      <section className="card">
        <div className="section-head">
          <div><h3>Available spaces</h3><p>Popular rooms for visitors to explore</p></div>
          <Link to="/demo/rooms">Browse rooms</Link>
        </div>
        <div className="room-mini">
          {rooms.slice(0, 4).map((room) => <Link key={room.id} to={`/demo/rooms/${room.id}`}>
            <div className="room-icon">{room.name[0]}</div>
            <div><b>{room.name}</b><p>{room.location} · {room.capacity} seats</p></div>
          </Link>)}
        </div>
      </section>
    </div>
  </>;
}

function ReservationRow({ reservation }) {
  return <div className="reservation">
    <div className="date-block">
      <b>{new Date(reservation.start_time).getDate()}</b>
      <span>{new Intl.DateTimeFormat('en', { month: 'short' }).format(new Date(reservation.start_time))}</span>
    </div>
    <div>
      <b>{reservation.title}{reservation.simulated ? ' · Simulated' : ''}</b>
      <p>{reservation.rooms.name} · {formatDateTime(reservation.start_time)}</p>
    </div>
    <Status value={reservation.status} />
  </div>;
}

function DemoRooms() {
  const { rooms } = useDemo();
  const [query, setQuery] = useState('');
  const [capacity, setCapacity] = useState('');
  const filtered = rooms.filter((room) => {
    const haystack = `${room.name} ${room.location} ${room.type}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (!capacity || room.capacity >= Number(capacity));
  });

  return <>
    <div className="page-title">
      <div><p className="eyebrow">SPACES</p><h2>Find a demo room</h2><p>Search realistic portfolio data without touching production records.</p></div>
    </div>
    <div className="filters">
      <label><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search rooms or locations" aria-label="Search rooms" /></label>
      <select value={capacity} onChange={(event) => setCapacity(event.target.value)} aria-label="Filter by capacity">
        <option value="">Any capacity</option>
        <option value="4">4+ people</option>
        <option value="10">10+ people</option>
        <option value="25">25+ people</option>
      </select>
    </div>
    {filtered.length ? <div className="room-grid">
      {filtered.map((room) => <RoomCard key={room.id} room={room} />)}
    </div> : <div className="empty">No demo rooms match that search.</div>}
  </>;
}

function RoomCard({ room }) {
  return <Link className="room-card" to={`/demo/rooms/${room.id}`}>
    <div className="room-photo"><span>{room.name[0]}</span><i>{room.type}</i></div>
    <div className="room-body">
      <h3>{room.name}</h3>
      <p><MapPin size={15} />{room.location}</p>
      <div><span><Users size={15} />{room.capacity}</span><span>{room.equipment.slice(0, 2).join(' · ')}</span></div>
    </div>
  </Link>;
}

function DemoRoomDetails() {
  const { rooms } = useDemo();
  const { id } = useParams();
  const room = rooms.find((item) => item.id === id);
  if (!room) return <div className="empty">Room not found.</div>;

  return <>
    <Link className="back" to="/demo/rooms"><ArrowLeft size={16} /> All demo rooms</Link>
    <div className="detail-hero">
      <div className="room-photo big"><span>{room.name[0]}</span></div>
      <div>
        <p className="eyebrow">{room.type}</p>
        <h2>{room.name}</h2>
        <p className="description">{room.description}</p>
        <div className="facts"><span><Users /> {room.capacity} people</span><span><MapPin /> {room.location}</span></div>
        <Link className="primary" to={`/demo/book?room=${room.id}`}>Simulate reservation</Link>
      </div>
    </div>
    <div className="detail-grid">
      <section className="card"><h3>Room equipment</h3><div className="equipment">{room.equipment.map((item) => <span key={item}><Check size={16} />{item}</span>)}</div></section>
      <section className="card"><h3>Demo notice</h3><p>This room is demo data. Booking it creates a simulated reservation only in this browser.</p></section>
    </div>
  </>;
}

function DemoCalendar() {
  const { reservations } = useDemo();
  const [start, setStart] = useState(todayValue());
  const startDate = new Date(`${start}T12:00:00`);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });
  const moveWeek = (amount) => {
    const next = new Date(startDate);
    next.setDate(next.getDate() + amount * 7);
    setStart(next.toISOString().slice(0, 10));
  };

  return <>
    <div className="page-title calendar-title">
      <div><p className="eyebrow">SCHEDULE</p><h2>Demo calendar</h2><p>Open reservation details and inspect realistic booking density.</p></div>
      <div className="calendar-date-actions">
        <button className="calendar-nav-button" type="button" onClick={() => moveWeek(-1)} aria-label="Previous week">‹</button>
        <button className="calendar-date-trigger" type="button">{displayDate(start)}</button>
        <button className="calendar-nav-button" type="button" onClick={() => moveWeek(1)} aria-label="Next week">›</button>
      </div>
    </div>
    <div className="calendar card">
      <div className="calendar-head">{days.map((date) => <div key={date.toISOString()}><small>{date.toLocaleDateString('en', { weekday: 'short' })}</small><b>{date.getDate()}</b></div>)}</div>
      <div className="calendar-body">
        {days.map((date) => {
          const key = date.toISOString().slice(0, 10);
          const dayReservations = reservations.filter((reservation) => reservation.start_time.slice(0, 10) === key);
          return <div className="day" key={key}>
            {dayReservations.map((reservation) => <details className="event demo-event" key={reservation.id}>
              <summary><b>{new Date(reservation.start_time).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}</b><span>{reservation.title}</span><small>{reservation.rooms.name}</small></summary>
              <p>{reservation.attendee_count} attendees · {reservation.simulated ? 'Simulated demo reservation' : 'Seeded demo reservation'}</p>
            </details>)}
          </div>;
        })}
      </div>
    </div>
  </>;
}

function DemoBooking() {
  const { rooms, createReservation } = useDemo();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    room_id: params.get('room') || rooms[0]?.id || '',
    title: '',
    date: todayValue(),
    start_time: '10:00',
    end_time: '10:30',
    attendee_count: 1,
    notes: '',
  });
  const endOptions = useMemo(() => timeOptions.filter((option) => option.value > form.start_time), [form.start_time]);
  const update = (event) => {
    const next = { ...form, [event.target.name]: event.target.value };
    if (event.target.name === 'start_time' && next.end_time <= event.target.value) {
      const index = timeOptions.findIndex((option) => option.value === event.target.value);
      next.end_time = timeOptions[Math.min(index + 1, timeOptions.length - 1)].value;
    }
    setForm(next);
  };
  const submit = (event) => {
    event.preventDefault();
    setError('');
    const room = rooms.find((item) => item.id === form.room_id);
    if (!room) return setError('Select a room.');
    if (Number(form.attendee_count) > room.capacity) return setError(`${room.name} holds up to ${room.capacity} people.`);
    createReservation({
      room_id: form.room_id,
      title: form.title,
      start_time: new Date(`${form.date}T${form.start_time}`).toISOString(),
      end_time: new Date(`${form.date}T${form.end_time}`).toISOString(),
      attendee_count: Number(form.attendee_count),
      notes: form.notes,
    });
    setSuccess('Simulated demo reservation created. It is stored only in this browser.');
  };

  return <div className="reserve-page">
    <div className="reserve-heading"><p className="eyebrow">DEMO RESERVATION</p><h2>Book a space</h2><p>This form simulates a booking without sending email or writing to Supabase.</p></div>
    <form className="reserve-card" onSubmit={submit}>
      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert demo-success">{success}</div>}
      <section className="reserve-section">
        <div className="reserve-section-title"><span className="reserve-step">1</span><div><h3>Meeting details</h3><p>Name the meeting and select a room.</p></div></div>
        <div className="reserve-grid two">
          <label>Room<select name="room_id" value={form.room_id} onChange={update} required>{rooms.map((room) => <option key={room.id} value={room.id}>{room.name} · {room.capacity} people</option>)}</select></label>
          <label>Event title<input name="title" value={form.title} onChange={update} required placeholder="Portfolio review" /></label>
        </div>
      </section>
      <section className="reserve-section">
        <div className="reserve-section-title"><span className="reserve-step"><CalendarDays size={16} /></span><div><h3>Schedule</h3><p>Business hours: 10:00 AM–11:00 PM, in 30-minute intervals.</p></div></div>
        <div className="reserve-grid three">
          <label>Date<input className="demo-date-input" type="date" name="date" value={form.date} onChange={update} min={todayValue()} /></label>
          <label>Start time<select className="time-select" name="start_time" value={form.start_time} onChange={update}>{timeOptions.slice(0, -1).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label>End time<select className="time-select" name="end_time" value={form.end_time} onChange={update}>{endOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        </div>
      </section>
      <section className="reserve-section reserve-bottom">
        <div className="reserve-section-title"><span className="reserve-step"><Users size={16} /></span><div><h3>Attendance & notes</h3><p>Help facilities prepare the room.</p></div></div>
        <label className="attendees">Expected attendees<input type="number" min="1" name="attendee_count" value={form.attendee_count} onChange={update} /></label>
        <label>Notes <em>Optional</em><textarea name="notes" value={form.notes} onChange={update} placeholder="Setup, access, or equipment needs" /></label>
      </section>
      <footer className="reserve-actions">
        <button type="button" className="button-quiet" onClick={() => navigate('/demo')}>Cancel</button>
        <button className="primary"><Clock3 size={17} />Create simulated reservation</button>
      </footer>
    </form>
  </div>;
}

function DemoMap() {
  const { floorPlans, rooms } = useDemo();
  const plan = floorPlans[0];
  const mapRooms = plan?.rooms || rooms;
  const count = (term) => mapRooms.filter((room) => room.type.toLowerCase().includes(term)).length;

  return <>
    <div className="page-title map-page-title">
      <div><p className="eyebrow">LOCATION MAP</p><h2>Demo floor map</h2><p>Click markers to open room details.</p></div>
      <div className="workspace-selector"><button type="button"><span className="workspace-icon"><Building2 size={20} /></span><span><b>{plan.building_name}</b><small>{plan.floor}</small></span></button></div>
    </div>
    <section className="map-workspace demo-map-card">
      <div className="map-canvas demo-map-canvas" aria-label="Demo floor map">
        <div className="demo-map-grid" />
        {mapRooms.map((room) => <Link className="map-pin" key={room.id} to={`/demo/rooms/${room.id}`} style={{ left: `${room.map_x}%`, top: `${room.map_y}%` }} aria-label={`View ${room.name}`}>
          <MapPin size={28} /><span>{room.room_number}</span>
        </Link>)}
      </div>
      <div className="map-summary">
        <MapStat label="Total rooms" value={mapRooms.length} />
        <MapStat label="Meeting rooms" value={count('meeting')} />
        <MapStat label="Conference rooms" value={count('conference')} />
        <MapStat label="Focus rooms" value={count('focus')} />
        <MapStat label="Phone booths" value={count('phone')} />
      </div>
    </section>
  </>;
}

function MapStat({ label, value }) {
  return <div className="map-stat"><Users size={16} /><div><b>{value}</b><span>{label}</span></div></div>;
}
