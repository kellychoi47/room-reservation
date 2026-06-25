import { createContext, useContext, useMemo, useState } from 'react';
import { demoSeed } from './demoData';

const DemoContext = createContext(null);
const storageKey = 'reserveflow-demo-state-v1';

const attachRooms = (reservations, rooms) => reservations.map((reservation) => ({
  ...reservation,
  rooms: rooms.find((room) => room.id === reservation.room_id) || { name: 'Unknown room', location: '' },
}));

const readInitialState = () => {
  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : demoSeed;
  } catch {
    return demoSeed;
  }
};

export function DemoProvider({ children }) {
  const [state, setState] = useState(readInitialState);

  const persist = (next) => {
    setState(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const resetDemo = () => {
    window.localStorage.removeItem(storageKey);
    setState(demoSeed);
  };

  const createReservation = (reservation) => {
    const next = {
      ...state,
      reservations: [
        ...state.reservations,
        {
          ...reservation,
          id: `demo-res-${Date.now()}`,
          status: 'confirmed',
          simulated: true,
        },
      ],
    };
    persist(next);
  };

  const value = useMemo(() => ({
    rooms: state.rooms,
    floorPlans: state.floorPlans.map((plan) => ({
      ...plan,
      rooms: state.rooms.filter((room) => room.building_name === plan.building_name && room.floor === plan.floor),
    })),
    reservations: attachRooms(state.reservations, state.rooms),
    createReservation,
    resetDemo,
  }), [state]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export const useDemo = () => useContext(DemoContext);
