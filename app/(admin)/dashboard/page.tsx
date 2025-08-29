"use client";

import { useEventStore } from "@/lib/store/event-store";
import { useEffect } from "react";


export default function Page() {

  const { loading, error, fetchEvents } = useEventStore();

  useEffect(() => {
    fetchEvents(); 
  }, [fetchEvents]);

  if (loading) return <p>Loading events...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <ul>
        {/* {(events && events.length > 0) ? events.map(event => (
          <li key={event.id} onClick={() => router.push(`/events/${event.id}`)} style={{ cursor: 'pointer' }}>
            {event.name} - Click to see details
          </li>
        )) : <p>No events found</p>} */}
      </ul>
      {/* <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={events} /> */}
    </>
  );
}
