import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarDays, Clock3, Users } from 'lucide-react';
import { api } from '../lib/supabase';
import Spinner from '../components/Spinner';

const today = () => new Date().toISOString().slice(0, 10);
const displayDate = (value) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
const dateValue = (date) => date.toISOString().slice(0, 10);
const timeOptions = Array.from({ length: 27 }, (_, index) => {
  const total = 600 + index * 30;
  const hour = Math.floor(total / 60);
  const minute = total % 60;
  const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  return {
    value,
    label: new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(2000, 0, 1, hour, minute)),
  };
});

export default function Booking() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [rooms, setRooms] = useState();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [month, setMonth] = useState(new Date());
  const [form, setForm] = useState({
    room_id: params.get('room') || '',
    title: '',
    date: today(),
    start_time: '10:00',
    end_time: '10:30',
    attendee_count: 1,
    notes: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        setRooms(await api('/rooms'));
      } catch (e) {
        setError(e.message);
      }
    }

    loadData();
  }, []);

  const update = (e) => {
    const next = { ...form, [e.target.name]: e.target.value };

    if (e.target.name === 'start_time' && next.end_time <= e.target.value) {
      const i = timeOptions.findIndex((t) => t.value === e.target.value);
      next.end_time = timeOptions[Math.min(i + 1, timeOptions.length - 1)].value;
    }

    setForm(next);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const start = new Date(`${form.date}T${form.start_time}`);
      const end = new Date(`${form.date}T${form.end_time}`);

      if (end <= start) throw new Error('End time must be after start time.');

      await api('/reservations', {
        method: 'POST',
        body: JSON.stringify({
          room_id: form.room_id,
          title: form.title,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          attendee_count: Number(form.attendee_count),
          notes: form.notes,
        }),
      });

      nav('/');
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  if (error && !rooms) return <div className="alert error">{error}</div>;
  if (!rooms) return <Spinner />;

  const ends = timeOptions.filter((t) => t.value > form.start_time);
  const selectDate = (value) => {
    setForm({ ...form, date: value });
    setCalendarOpen(false);
  };

  return (
    <div className="reserve-page">
      <div className="reserve-heading">
        <p className="eyebrow">NEW RESERVATION</p>
        <h2>Book a space</h2>
        <p>Reserve the right room for your meeting in a few simple details.</p>
      </div>

      <form className="reserve-card" onSubmit={submit}>
        {error && <div className="alert error">{error}</div>}

        <section className="reserve-section">
          <div className="reserve-section-title">
            <span className="reserve-step">1</span>
            <div>
              <h3>Meeting details</h3>
              <p>Name the meeting and select a room.</p>
            </div>
          </div>

          <div className="reserve-grid two">
            <label>
              Room
              <select name="room_id" value={form.room_id} onChange={update} required>
                <option value="">Select a room</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} · {r.capacity} people
                  </option>
                ))}
              </select>
            </label>

            <label>
              Event title
              <input
                name="title"
                value={form.title}
                onChange={update}
                required
                placeholder="Team planning session"
              />
            </label>
          </div>
        </section>

        <section className="reserve-section">
          <div className="reserve-section-title">
            <span className="reserve-step"><CalendarDays size={16} /></span>
            <div>
              <h3>Schedule</h3>
              <p>Business hours: 10:00 AM–11:00 PM, in 30-minute intervals.</p>
            </div>
          </div>

          <div className="reserve-grid three">
            <label>
              Date
              <div className="date-popover">
                <button type="button" className="date-trigger" onClick={() => setCalendarOpen(!calendarOpen)}>
                  <CalendarDays size={17} />
                  {displayDate(form.date)}
                </button>
                {calendarOpen && <Calendar month={month} selected={form.date} onMonth={setMonth} onSelect={selectDate} />}
              </div>
            </label>

            <label>
              Start time
              <select className="time-select" name="start_time" value={form.start_time} onChange={update}>
                {timeOptions.slice(0, -1).map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </label>

            <label>
              End time
              <select className="time-select" name="end_time" value={form.end_time} onChange={update}>
                {ends.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="reserve-section reserve-bottom">
          <div className="reserve-section-title">
            <span className="reserve-step"><Users size={16} /></span>
            <div>
              <h3>Attendance & notes</h3>
              <p>Help facilities prepare the room.</p>
            </div>
          </div>

          <label className="attendees">
            Expected attendees
            <input type="number" min="1" name="attendee_count" value={form.attendee_count} onChange={update} />
          </label>

          <label>
            Notes <em>Optional</em>
            <textarea
              name="notes"
              value={form.notes}
              onChange={update}
              placeholder="Accessibility needs, room setup, or equipment requests"
            />
          </label>
        </section>

        <footer className="reserve-actions">
          <button type="button" className="button-quiet" onClick={() => nav(-1)}>Cancel</button>
          <button className="primary" disabled={busy}>
            <Clock3 size={17} />
            {busy ? 'Checking availability…' : 'Confirm reservation'}
          </button>
        </footer>
      </form>
    </div>
  );
}

function Calendar({ month, selected, onMonth, onSelect }) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = new Date(firstDay);
  gridStart.setDate(1 - firstDay.getDay());
  const dates = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });

  return <div className="calendar-popover">
    <header>
      <button type="button" onClick={() => onMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>‹</button>
      <b>{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</b>
      <button type="button" onClick={() => onMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>›</button>
    </header>
    <div className="calendar-week">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <span key={index}>{day}</span>)}</div>
    <div className="calendar-days">{dates.map((date) => {
      const value = dateValue(date);
      const disabled = date.getMonth() !== month.getMonth() || value < today();
      return <button type="button" key={value} disabled={disabled} className={value === selected ? 'selected' : ''} onClick={() => onSelect(value)}>{date.getDate()}</button>;
    })}</div>
  </div>;
}
