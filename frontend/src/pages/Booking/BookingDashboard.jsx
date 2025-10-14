import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookingAPI } from "../../api/bookingsApi";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  Eye,
  ArrowLeft,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  const navigate = useNavigate();

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
      // If backend supports PATCH /bookings/:id/status
      await BookingAPI.updateStatus(id, newStatus);

      // Or fallback: await BookingAPI.update(id, { status: newStatus });

      // Update state so UI refreshes immediately
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b))
      );
      setFilteredBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      console.error("❌ Failed to update status:", err);
    }
  };

  // 📄 Export PDF
  const exportPDF = () => {
    const doc = new jsPDF("landscape"); // landscape for wide tables
    doc.setFontSize(14);
    doc.setTextColor("#0A1A2F"); // Dark Navy
    doc.text("All Booking List of RiyaGuru.lk Driving School", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [
        [
          "Booking ID",
          "Student",
          "Instructor ID",
          "Course",
          "Date",
          "Time",
          "Status",
        ],
      ],
      body: filteredBookings.map((b) => [
        b.bookingId,
        b.userId,
        b.instructorId,
        b.course,
        b.date,
        b.time,
        b.status,
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 4,
        halign: "center",
        valign: "middle",
        textColor: "#0A1A2F", // Dark Navy text
      },
      headStyles: {
        fillColor: "#F47C20", // Orange
        textColor: "#FFFFFF", // White
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: "#F5F6FA", // Light Gray
      },
      theme: "grid",
    });

    doc.save("bookings.pdf");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/50 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Bookings
          </h2>
          <p className="text-gray-800">
            Please wait while we fetch the booking data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* 🔙 Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg transition-all font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Booking Management
                </h1>
                <p className="text-orange-100">
                  Monitor and manage all driving lesson bookings
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* 📄 Export PDF Button */}
              <button
                onClick={exportPDF}
                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all font-medium"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Total Bookings
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/80 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">
                  {bookings.filter((b) => b.status === "booked").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/80 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">Completed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {bookings.filter((b) => b.status === "completed").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/80 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">
                  {bookings.filter((b) => b.status === "cancelled").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/80 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Modern Filters */}
        <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Vehicle Type
              </label>
              <select
                value={filters.vehicle}
                onChange={(e) => handleFilterChange("vehicle", e.target.value)}
                className="w-full px-3 py-2 border border-white/40 bg-white/70 backdrop-blur-sm rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                <option value="">All Vehicles</option>
                {vehicleTypes.map((vehicle) => (
                  <option key={vehicle} value={vehicle}>
                    {vehicle}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-white/40 bg-white/70 backdrop-blur-sm rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                <option value="">All Statuses</option>
                {statusTypes.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className="w-full px-3 py-2 border border-white/40 bg-white/70 backdrop-blur-sm rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full px-3 py-2 border border-white/40 bg-white/70 backdrop-blur-sm rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>

            <div>
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-sm text-gray-800 hover:text-orange-700 border border-white/40 bg-white/70 backdrop-blur-sm rounded-lg hover:bg-white/80 transition-colors"
              >
                Clear Filters
              </button>
            </div>

            <div className="flex items-center text-sm text-gray-900 border border-white/40 bg-white/40 backdrop-blur-sm rounded-lg px-3 py-2">
              <span className="font-semibold">
                {filteredBookings.length} Results
              </span>
            </div>
          </div>
        </div>
        {/* Modern Table */}
        <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-white/40 bg-white/40">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">All Bookings</h3>
              <div className="text-sm text-gray-800">
                Showing {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/40 border-b border-white/40">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Booking ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white/40 divide-y divide-white/40">
                {getPaginatedBookings().length > 0 ? (
                  getPaginatedBookings().map((b, index) => (
                    <tr key={b._id} className={`hover:bg-white/60 transition-colors ${index % 2 === 0 ? "bg-white/40" : "bg-white/50"}`}>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-semibold text-gray-900">#{b.bookingId}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-semibold text-gray-900">{b.userId}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{b.course}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{b.date}</div><div className="text-sm text-gray-800">{b.time}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${b.status === "booked" ? "bg-blue-100 text-blue-800" : b.status === "completed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {b.status === "pending" ? (
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleStatusUpdate(b._id, "booked")} className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors font-medium"><CheckCircle className="w-3 h-3" />Confirm</button>
                            <button onClick={() => handleStatusUpdate(b._id, "cancelled")} className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors font-medium"><XCircle className="w-3 h-3" />Cancel</button>
                          </div>
                        ) : b.status === "booked" ? (
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleStatusUpdate(b._id, "started")} className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded-lg transition-colors font-medium"><CheckCircle className="w-3 h-3" />Start</button>
                            <button onClick={() => handleStatusUpdate(b._id, "completed")} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors font-medium"><CheckCircle className="w-3 h-3" />Complete</button>
                            <button onClick={() => handleStatusUpdate(b._id, "cancelled")} className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors font-medium"><XCircle className="w-3 h-3" />Cancel</button>
                          </div>
                        ) : b.status === "started" ? (
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleStatusUpdate(b._id, "completed")} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors font-medium"><CheckCircle className="w-3 h-3" />Complete</button>
                            <button onClick={() => handleStatusUpdate(b._id, "cancelled")} className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors font-medium"><XCircle className="w-3 h-3" />Cancel</button>
                          </div>
                        ) : (
                          <button className="inline-flex items-center gap-1 px-3 py-1.5 border border-white/40 bg-white/70 backdrop-blur-sm hover:bg-white/80 text-gray-900 text-xs rounded-lg transition-colors font-medium"><Eye className="w-3 h-3" />View</button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Calendar className="w-12 h-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                        <p className="text-gray-500">No bookings match the selected filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="bg-white/40 px-6 py-4 border-t border-white/40">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-800">Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span></div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-gray-800 border border-white/40 bg-white/70 backdrop-blur-sm rounded-lg hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Previous</button>
                  <div className="flex gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                      let page;
                      if (totalPages <= 5) page = index + 1;
                      else if (currentPage <= 3) page = index + 1;
                      else if (currentPage >= totalPages - 2) page = totalPages - 4 + index;
                      else page = currentPage - 2 + index;
                      return (
                        <button key={page} onClick={() => handlePageChange(page)} className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === page ? "bg-orange-500 text-white" : "text-gray-800 border border-white/40 bg-white/70 backdrop-blur-sm hover:bg-white/80"}`}>{page}</button>
                      );
                    })}
                  </div>
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-gray-800 border border-white/40 bg-white/70 backdrop-blur-sm rounded-lg hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
