
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface CalendarEvent {
  date: Date;
  title: string;
  type: 'pickup' | 'delivery' | 'event';
}

const InteractiveCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events] = useState<CalendarEvent[]>([
    { date: new Date(), title: "Food Pickup - SuperSpar", type: "pickup" },
    { date: new Date(Date.now() + 86400000), title: "Community Kitchen Delivery", type: "delivery" },
    { date: new Date(Date.now() + 172800000), title: "Volunteer Training", type: "event" }
  ]);

  const selectedEvents = events.filter(event => 
    selectedDate && event.date.toDateString() === selectedDate.toDateString()
  );

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="p-6">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
        />
      </Card>
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {selectedDate ? selectedDate.toDateString() : "Select a date"}
        </h3>
        <div className="space-y-3">
          {selectedEvents.length > 0 ? (
            selectedEvents.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <span className="font-medium">{event.title}</span>
                <Badge variant={event.type === 'pickup' ? 'default' : event.type === 'delivery' ? 'secondary' : 'outline'}>
                  {event.type}
                </Badge>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-500">No events scheduled for this date.</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default InteractiveCalendar;
