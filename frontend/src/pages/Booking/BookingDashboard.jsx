//adimn booking disply
import { useEffect, useState } from "react";
import { BookingAPI } from "../../api/bookingsApi";
import { Calendar, CheckCircle, XCircle } from "lucide-react";

export default function AdminBookingDashboard() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    vehicle: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const vehicleTypes = ["Car", "Motorcycle", "ThreeWheeler", "HeavyVehicle"];
  const statusTypes = ["booked", "completed", "cancelled"];

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, filters, currentPage]);

  const fetchBookings = async () => {
    try {
      const data = await BookingAPI.getAll();
      setBookings(data);
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    if (filters.vehicle) {
      filtered = filtered.filter(
        (booking) => booking.course === filters.vehicle
      );
    }

    if (filters.status) {
      filtered = filtered.filter(
        (booking) => booking.status === filters.status
      );
    }

    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter((booking) => {
        const bookingDate = new Date(booking.date);
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        return bookingDate >= startDate && bookingDate <= endDate;
      });
    } else if (filters.startDate) {
      filtered = filtered.filter((booking) => {
        const bookingDate = new Date(booking.date);
        const startDate = new Date(filters.startDate);
        return bookingDate >= startDate;
      });
    } else if (filters.endDate) {
      filtered = filtered.filter((booking) => {
        const bookingDate = new Date(booking.date);
        const endDate = new Date(filters.endDate);
        return bookingDate <= endDate;
      });
    }

    setFilteredBookings(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      vehicle: "",
      status: "",
      startDate: "",
      endDate: "",
    });
    setCurrentPage(1);
  };

  const getPaginatedBookings = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBookings.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await BookingAPI.update(id, { status: newStatus });
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin mb-3"></div>
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="flex justify-between items-center bg-white px-6 py-3 border-b shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-base text-gray-800">
          <Calendar className="text-orange-500 w-5 h-5" />
          Admin – Manage Bookings
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 bg-white border-b">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">
              Vehicle Type:
            </label>
            <select
              value={filters.vehicle}
              onChange={(e) => handleFilterChange("vehicle", e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Vehicles</option>
              {vehicleTypes.map((vehicle) => (
                <option key={vehicle} value={vehicle}>
                  {vehicle}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">
              Status:
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Statuses</option>
              {statusTypes.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">
              Start Date:
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">
              End Date:
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <button
            onClick={clearFilters}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear Filters
          </button>

          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of{" "}
            {filteredBookings.length} bookings
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b text-sm font-semibold text-slate-700">
            All Bookings
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600">
                  <th className="px-4 py-2">Booking ID</th>
                  <th className="px-4 py-2">Student</th>
                  <th className="px-4 py-2">Course</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Time</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {getPaginatedBookings().length > 0 ? (
                  getPaginatedBookings().map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-2 font-medium text-slate-700">
                        {b.bookingId}
                      </td>
                      <td className="px-4 py-2">{b.userId}</td>
                      <td className="px-4 py-2">{b.course}</td>
                      <td className="px-4 py-2">{b.date}</td>
                      <td className="px-4 py-2">{b.time}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            b.status === "booked"
                              ? "bg-blue-100 text-blue-600"
                              : b.status === "completed"
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center space-x-2">
                        {b.status === "booked" && (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() =>
                                handleStatusUpdate(b._id, "completed")
                              }
                              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 flex items-center gap-1"
                            >
                              <CheckCircle size={14} /> Complete
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(b._id, "cancelled")
                              }
                              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 flex items-center gap-1"
                            >
                              <XCircle size={14} /> Cancel
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center text-slate-500 py-6 text-sm"
                    >
                      No bookings found matching the selected filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-4 py-3 border-t bg-gray-50">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    const shouldShow =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);

                    if (!shouldShow && page !== 2 && page !== totalPages - 1) {
                      if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span
                            key={page}
                            className="px-2 py-1 text-sm text-gray-500"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 text-sm border rounded-md ${
                          currentPage === page
                            ? "bg-orange-500 text-white border-orange-500"
                            : "border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
