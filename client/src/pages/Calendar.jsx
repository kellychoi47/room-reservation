import { useEffect, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../lib/supabase';
import Spinner from '../components/Spinner';

const toDateValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDate = (value) => new Date(`${value}T12:00:00`);
const displayDate = (value) => new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}).format(parseDate(value));

export default function Calendar() {
  const [data, setData] = useState();
  const [error, setError] = useState('');
  const [start, setStart] = useState(toDateValue(new Date()));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [month, setMonth] = useState(new Date());

  useEffect(() => {
    async function loadData() {
      try {
        setError('');
        setData(await api(`/reservations?start=${start}`));
      } catch (e) {
        setError(e.message);
      }
    }

    loadData();
  }, [start]);

  if (error) return <div className="alert error">{error}</div>;
  if (!data) return <Spinner />;

  const startDate = parseDate(start);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });

  const moveWeek = (amount) => {
    const next = new Date(startDate);
    next.setDate(next.getDate() + amount * 7);
    setStart(toDateValue(next));
    setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
  };

  const selectDate = (value) => {
    setStart(value);
    setMonth(new Date(parseDate(value).getFullYear(), parseDate(value).getMonth(), 1));
    setPickerOpen(false);
  };

  return <>
    <div className="page-title calendar-title">
      <div>
        <p className="eyebrow">SCHEDULE</p>
        <h2>Reservation calendar</h2>
        <p>See reserved times across all available rooms.</p>
      </div>

      <div className="calendar-date-actions">
        <button className="calendar-nav-button" type="button" aria-label="Previous week" onClick={() => moveWeek(-1)}>
          <ChevronLeft size={18} />
        </button>
        <div className="calendar-date-popover">
          <button
            type="button"
            className="calendar-date-trigger"
            aria-expanded={pickerOpen}
            onClick={() => setPickerOpen((open) => !open)}
          >
            <CalendarDays size={17} />
            <span>{displayDate(start)}</span>
          </button>
          {pickerOpen && <DatePicker month={month} selected={start} onMonth={setMonth} onSelect={selectDate} />}
        </div>
        <button className="calendar-nav-button" type="button" aria-label="Next week" onClick={() => moveWeek(1)}>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>

    <div className="calendar card">
      <div className="calendar-head">
        {days.map((date) => <div key={toDateValue(date)}>
          <small>{date.toLocaleDateString('en', { weekday: 'short' })}</small>
          <b>{date.getDate()}</b>
        </div>)}
      </div>
      <div className="calendar-body">
        {days.map((date) => {
          const key = toDateValue(date);
          const reservations = data.filter((reservation) => reservation.start_time.slice(0, 10) === key);
          return <div className="day" key={key}>
            {reservations.map((reservation) => <div className="event" key={reservation.id}>
              <b>{new Date(reservation.start_time).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}</b>
              <span>{reservation.title}</span>
              <small>{reservation.rooms.name}</small>
            </div>)}
          </div>;
        })}
      </div>
    </div>
  </>;
}

function DatePicker({ month, selected, onMonth, onSelect }) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = new Date(firstDay);
  gridStart.setDate(1 - firstDay.getDay());
  const today = toDateValue(new Date());
  const dates = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });

  return <div className="calendar-popover calendar-page-picker" role="dialog" aria-label="Choose a calendar date">
    <header>
      <button type="button" aria-label="Previous month" onClick={() => onMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
        <ChevronLeft size={18} />
      </button>
      <b>{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</b>
      <button type="button" aria-label="Next month" onClick={() => onMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
        <ChevronRight size={18} />
      </button>
    </header>
    <div className="calendar-week">
      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
    </div>
    <div className="calendar-days">
      {dates.map((date) => {
        const value = toDateValue(date);
        const outsideMonth = date.getMonth() !== month.getMonth();
        const className = [value === selected && 'selected', value === today && 'today', outsideMonth && 'outside-month'].filter(Boolean).join(' ');
        return <button type="button" key={value} className={className} onClick={() => onSelect(value)}>{date.getDate()}</button>;
      })}
    </div>
  </div>;
}
