const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const screens = [
  { id: 1, name: 'Screen 1', seats: 45, bookedSeats: [] },
  { id: 2, name: 'Screen 2', seats: 60, bookedSeats: [] },
  { id: 3, name: 'Screen 3', seats: 75, bookedSeats: [] }
];

const shows = [
  { id: 1, name: 'Show 1', screenId: 1 },
  { id: 2, name: 'Show 2', screenId: 2 },
  { id: 3, name: 'Show 3', screenId: 3 }
];

// Get available shows
app.get('/shows', (req, res) => {
  res.json(shows);
});

// Get available seats for a show
app.get('/shows/:showId/seats', (req, res) => {
  const showId = parseInt(req.params.showId);
  const show = shows.find(show => show.id === showId);
  if (!show) {
    res.status(404).json({ error: 'Show not found' });
    return;
  }
  const screen = screens.find(screen => screen.id === show.screenId);
  const availableSeats = screen.seats - screen.bookedSeats.length;
  res.json({ screen: screen.name, availableSeats });
});

// Book a seat for a show
app.post('/shows/:showId/book', (req, res) => {
  const showId = parseInt(req.params.showId);
  const show = shows.find(show => show.id === showId);
  if (!show) {
    res.status(404).json({ error: 'Show not found' });
    return;
  }
  const screen = screens.find(screen => screen.id === show.screenId);
  const seatNumber = req.body.seatNumber;

  if (!Number.isInteger(seatNumber) || seatNumber <= 0 || seatNumber > screen.seats) {
    res.status(400).json({ error: 'Invalid seat number' });
    return;
  }

  if (screen.bookedSeats.includes(seatNumber)) {
    res.status(409).json({ error: 'Seat already booked' });
    return;
  }

  if (screen.bookedSeats.length >= screen.seats) {
    const nextShow = shows.find(s => s.screenId === show.screenId && s.id !== show.id);
    if (nextShow) {
      res.status(409).json({ error: 'Seats are full. Suggested next show:', nextShow });
    } else {
      res.status(409).json({ error: 'Seats are full. No more shows available.' });
    }
    return;
  }

  screen.bookedSeats.push(seatNumber);
  res.json({ message: 'Seat booked successfully' });
});

// Cancel a booked seat for a show
app.post('/shows/:showId/cancel', (req, res) => {
  const showId = parseInt(req.params.showId);
  const show = shows.find(show => show.id === showId);
  if (!show) {
    res.status(404).json({ error: 'Show not found' });
    return;
  }
  const screen = screens.find(screen => screen.id === show.screenId);
  const seatNumber = req.body.seatNumber;

  if (!Number.isInteger(seatNumber) || seatNumber <= 0 || seatNumber > screen.seats) {
    res.status(400).json({ error: 'Invalid seat number' });
    return;
  }

  const index = screen.bookedSeats.indexOf(seatNumber);
  if (index === -1) {
    res.status(409).json({ error: 'Seat is not booked' });
    return;
  }

  screen.bookedSeats.splice(index, 1);
  res.json({ message: 'Seat cancelled successfully' });
});

// Start the server
app.listen(3000, () => {
  console.log('Theater ticket booking application is running on port 3000');
});