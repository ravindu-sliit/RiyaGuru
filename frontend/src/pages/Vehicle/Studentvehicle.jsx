import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { vehicleService } from '../../services/vehicleService';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Car, 
  Fuel, 
  Calendar, 
  User, 
  LayoutDashboard 
} from 'lucide-react';
import { toast } from 'react-toastify';



const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const navigate = useNavigate();

  // ⬇️ Place the function here (AFTER states, BEFORE return)
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Vehicle Details", 14, 15);

    const headers = [["Reg No", "Brand", "Model", "Type", "Year", "Fuel", "Mileage", "Status", "Instructor"]];

    const body = filteredVehicles.map((v) => [
      v.regNo,
      v.brand,
      v.model,
      v.type,
      v.year,
      v.fuelType,
      v.mileage ? v.mileage.toLocaleString() + " km" : "0 km",
      v.status,
      v.assignedInstructor ? v.assignedInstructor.name : "N/A",
    ]);

    autoTable(doc, {
      head: headers,
      body: body,
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [255, 165, 0] },
    });

    doc.save("vehicles.pdf");
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    filterVehicles();
  }, [vehicles, searchTerm, statusFilter, typeFilter]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getAllVehicles();
      setVehicles(data);
    } catch (error) {
      toast.error('Failed to fetch vehicles');
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVehicles = () => {
    let filtered = vehicles;

    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        vehicle.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.type === typeFilter);
    }

    setFilteredVehicles(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await vehicleService.deleteVehicle(id);
        toast.success('Vehicle deleted successfully');
        fetchVehicles();
      } catch (error) {
        toast.error('Failed to delete vehicle');
        console.error('Error deleting vehicle:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      Active: 'bg-green-100 text-green-700',
      'Not-Active': 'bg-yellow-100 text-yellow-700',
      Maintenance: 'bg-red-100 text-red-700',
    };
    return classes[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
        <p className="mt-4">Loading vehicles...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Details</h1>
        </div>
        <div className="flex gap-2">
          
          <button
          onClick={exportPDF}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-md shadow-sm transition"
           >
           Download PDF
            </button>
          {/* ✅ Dashboard button in header */}
          <button
            onClick={() => navigate('/student')}
            className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-medium px-4 py-2 rounded-md shadow-sm transition"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by registration, model, or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Not-Active">Not Active</option>
          <option value="Maintenance">Maintenance</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Types</option>
          <option value="Car">Car</option>
          <option value="Motorcycle">Motorcycle</option>
          <option value="ThreeWheeler">Three Wheeler</option>
          <option value="HeavyVehicle">Heavy Vehicle</option>
        </select>

        {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setTypeFilter('all');
            }}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-100"
          >
            <Filter size={16} />
            Clear
          </button>
        )}
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500 mb-4">
        Showing {filteredVehicles.length} of {vehicles.length} vehicles
      </p>

      {/* Vehicle Grid */}
      {filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle._id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition flex flex-col">
              {/* Vehicle Image */}
              <div className="h-32 bg-gray-100 flex items-center justify-center border-b">
                {vehicle.image ? (
                  <img
                    src={`http://localhost:5000${vehicle.image}`}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/placeholder-car.png'; }}
                  />
                ) : (
                  <Car size={40} className="text-gray-400" />
                )}
              </div>

              {/* Vehicle Info */}
              <div className="p-3 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-semibold text-gray-900">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(vehicle.status)}`}>
                    {vehicle.status}
                  </span>
                </div>

                <p className="text-xs text-gray-500 font-mono mb-2">{vehicle.regNo}</p>

                <div className="space-y-1 text-sm text-gray-600 mb-2">
                  <div className="flex items-center gap-2"><Car size={14} /> {vehicle.type}</div>
                  <div className="flex items-center gap-2"><Calendar size={14} /> {vehicle.year}</div>
                  <div className="flex items-center gap-2"><Fuel size={14} /> {vehicle.fuelType}</div>
                  <div className="flex items-center gap-2 font-medium">{vehicle.mileage?.toLocaleString() || 0} km</div>
                </div>

                {vehicle.assignedInstructor && (
                  <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded text-xs text-gray-500 mb-2">
                    <User size={12} />
                    Assigned: {vehicle.assignedInstructor.name}
                  </div>
                )}

                <div className="flex gap-2 mt-auto pt-2 border-t">
                  
                  <button
                    
                    className="flex-1 text-center text-xs px-2 py-1 border rounded text-red-600 hover:bg-red-50"
                  >
                    
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          <Car size={48} className="mx-auto mb-2 text-gray-400" />
          <h3 className="text-lg font-semibold">No vehicles found</h3>
          <p className="text-sm mb-4">
            {vehicles.length === 0
              ? "Get started by adding your first vehicle."
              : "Try adjusting your filters."}
          </p>
          <div className="flex justify-center gap-3">
          
            {/* ✅ Dashboard button in empty state */}
            <button
              onClick={() => navigate('/student')}
              className="inline-flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-md shadow-sm hover:bg-gray-800 transition"
            >
              <LayoutDashboard size={18} /> Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleList;
