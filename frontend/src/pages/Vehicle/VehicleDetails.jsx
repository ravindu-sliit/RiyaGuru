import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { vehicleService } from '../../services/vehicleService';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Car, 
  Fuel, 
  Calendar, 
  User, 
  Settings,
  AlertTriangle,
  MapPin
} from 'lucide-react';
import { toast } from 'react-toastify';
import './VehicleDetails.css';

// ✅ API base URL (fallback to localhost:5000)
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const VehicleDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchVehicle();
    }
    // eslint-disable-next-line
  }, [id]);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getVehicleById(id);
      setVehicle(data);
    } catch (error) {
      toast.error('Failed to fetch vehicle details');
      console.error('Error fetching vehicle:', error);
      navigate('/vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(true);
    try {
      await vehicleService.deleteVehicle(id);
      toast.success('Vehicle deleted successfully');
      navigate('/admin/vehicles');
    } catch (error) {
      toast.error('Failed to delete vehicle');
      console.error('Error deleting vehicle:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Active': 'status-badge status-active',
      'Not-Active': 'status-badge status-inactive',
      'Maintenance': 'status-badge status-maintenance'
    };
    return statusClasses[status] || 'status-badge';
  };

  const getTypeIcon = () => {
    return <Car size={20} />;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading vehicle details...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="empty-state">
        <Car size={64} />
        <h3>Vehicle not found</h3>
        <p>The vehicle you're looking for doesn't exist or has been removed.</p>
        <Link to="/vehicles" className="btn btn-primary">
          <ArrowLeft size={16} />
          Back to Vehicles
        </Link>
      </div>
    );
  }

  return (
    <div className="vehicle-details-container">
      {/* Header */}
      <div className="details-header">
        <div className="header-left">
          <button 
            onClick={() => navigate('/admin/vehicles')}
            className="btn btn-outline btn-sm"
          >
            <ArrowLeft size={16} />
            Back to Vehicles
          </button>
          <div className="header-info">
            <h1 className="vehicle-title">
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className="vehicle-reg">{vehicle.regNo}</p>
          </div>
        </div>
        <div className="header-actions">
          <span className={getStatusBadge(vehicle.status)}>
            {vehicle.status}
          </span>
          <Link to={`/admin/vehicles/${vehicle._id}/edit`} className="btn btn-outline btn-sm">
            <Edit size={16} />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="btn btn-outline btn-sm btn-danger"
          >
            {deleteLoading ? (
              <div className="loading-spinner-sm"></div>
            ) : (
              <Trash2 size={16} />
            )}
            Delete
          </button>
        </div>
      </div>

      <div className="details-layout">
        {/* Vehicle Image */}
        <div className="details-sidebar">
          <div className="details-card">
            <h2 className="card-title">Vehicle Image</h2>
            <div className="vehicle-image-container">
            <img
  src={
    vehicle?.image
      ? `${process.env.REACT_APP_PUBLIC_URL || "http://localhost:5000"}${vehicle.image}`
      : "/placeholder-car.jpeg"   // ✅ must be inside your React /public folder
  }
  alt={`${vehicle?.brand || "Unknown"} ${vehicle?.model || ""}`}
  className="vehicle-image"
  onError={(e) => {
    e.currentTarget.onerror = null; // prevent infinite loop
    e.currentTarget.src = "/placeholder-car.jpeg"; // fallback
  }}
/>


            </div>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="details-main">
          {/* Basic Information */}
          <div className="details-card">
            <h2 className="card-title">
              <Car size={20} />
              Basic Information
            </h2>
            <div className="details-grid">
              <div className="detail-item">
                <label>Registration Number</label>
                <span className="detail-value reg-number">{vehicle.regNo}</span>
              </div>
              <div className="detail-item">
                <label>Brand</label>
                <span className="detail-value">{vehicle.brand}</span>
              </div>
              <div className="detail-item">
                <label>Model</label>
                <span className="detail-value">{vehicle.model}</span>
              </div>
              <div className="detail-item">
                <label>Year</label>
                <span className="detail-value">{vehicle.year}</span>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="details-card">
            <h2 className="card-title">
              <Settings size={20} />
              Specifications
            </h2>
            <div className="details-grid">
              <div className="detail-item">
                <label>Vehicle Type</label>
                <span className="detail-value">
                  {getTypeIcon(vehicle.type)}
                  {vehicle.type}
                </span>
              </div>
              <div className="detail-item">
                <label>Fuel Type</label>
                <span className="detail-value">
                  <Fuel size={16} />
                  {vehicle.fuelType}
                </span>
              </div>
              <div className="detail-item">
                <label>Mileage</label>
                <span className="detail-value">
                  <MapPin size={16} />
                  {vehicle.mileage.toLocaleString()} km
                </span>
              </div>
              <div className="detail-item">
                <label>Status</label>
                <span className={`detail-value ${getStatusBadge(vehicle.status)}`}>
                  <AlertTriangle size={16} />
                  {vehicle.status}
                </span>
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="details-card">
            <h2 className="card-title">
              <Calendar size={20} />
              Service Information
            </h2>
            <div className="details-grid">
              <div className="detail-item">
                <label>Last Service Date</label>
                <span className="detail-value">
                  {vehicle.lastServiceDate 
                    ? new Date(vehicle.lastServiceDate).toLocaleDateString()
                    : 'Not recorded'
                  }
                </span>
              </div>
              <div className="detail-item">
                <label>Next Service Due</label>
                <span className="detail-value">
                  {vehicle.nextServiceDue 
                    ? new Date(vehicle.nextServiceDue).toLocaleDateString()
                    : 'Not scheduled'
                  }
                </span>
              </div>
            </div>
            
            {vehicle.nextServiceDue && (
              <div className="service-alert">
                {(() => {
                  const dueDate = new Date(vehicle.nextServiceDue);
                  const today = new Date();
                  const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                  
                  if (daysUntilDue < 0) {
                    return (
                      <div className="alert alert-danger">
                        <AlertTriangle size={16} />
                        Service is overdue by {Math.abs(daysUntilDue)} days
                      </div>
                    );
                  } else if (daysUntilDue <= 7) {
                    return (
                      <div className="alert alert-warning">
                        <AlertTriangle size={16} />
                        Service due in {daysUntilDue} days
                      </div>
                    );
                  } else {
                    return (
                      <div className="alert alert-info">
                        <Calendar size={16} />
                        Next service in {daysUntilDue} days
                      </div>
                    );
                  }
                })()}
              </div>
            )}
          </div>

          {/* Assigned Instructor */}
          {vehicle.assignedInstructor && (
            <div className="details-card">
              <h2 className="card-title">
                <User size={20} />
                Assigned Instructor
              </h2>
              <div className="instructor-info">
                <div className="instructor-avatar">
                  <User size={24} />
                </div>
                <div className="instructor-details">
                  <h4 className="instructor-name">
                    {vehicle.assignedInstructor.name}
                  </h4>
                  <p className="instructor-email">
                    {vehicle.assignedInstructor.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Record Information */}
          <div className="details-card">
            <h2 className="card-title">Record Information</h2>
            <div className="details-grid">
              <div className="detail-item">
                <label>Created At</label>
                <span className="detail-value">
                  {new Date(vehicle.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="detail-item">
                <label>Last Updated</label>
                <span className="detail-value">
                  {new Date(vehicle.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
