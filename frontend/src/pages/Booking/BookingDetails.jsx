// src/pages/Booking/BookingDetails.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import bookingService from "../../services/bookingService";

export default function BookingDetails() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await bookingService.getBookingById(id);
        setBooking(data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [id]);

  if (!booking) return <p className="text-center py-10">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white shadow-sm rounded-md border p-6 text-sm">
        <h1 className="text-base font-bold mb-4">Booking Details</h1>
        <p><span className="font-medium">Booking ID:</span> {booking.bookingId}</p>
        <p><span className="font-medium">Course:</span> {booking.course}</p>
        <p><span className="font-medium">Date:</span> {booking.date}</p>
        <p><span className="font-medium">Time:</span> {booking.time}</p>
        <p><span className="font-medium">Instructor:</span> {booking.instructor?.name}</p>
        <p><span className="font-medium">Vehicle:</span> {booking.vehicle?.regNo} ({booking.vehicle?.model})</p>
        <p><span className="font-medium">Status:</span> {booking.status}</p>
        <div className="mt-4">
          <Link
            to="/bookings"
            className="text-orange-500 hover:underline"
          >
            ← Back to Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}
