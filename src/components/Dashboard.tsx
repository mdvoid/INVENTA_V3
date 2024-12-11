import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, Package, DollarSign, AlertTriangle, ShoppingCart } from 'lucide-react';
import { dashboardService, DashboardSummary } from '../services/dashboardService';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import InventoryList from './inventory/InventoryList';
import WarehouseList from './warehouse/WarehouseList';
import LowStockNotifications from './notifications/LowStockNotifications';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getDashboardSummary();
        console.log('Dashboard summary:', data); // Debug log
        setSummary(data);
      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
    // Set up periodic refresh
    const refreshInterval = setInterval(fetchSummary, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-64 pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          <button className="p-2 text-gray-400 hover:text-gray-300">
            <Bell className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-black p-6 rounded-lg shadow-lg border border-gray-800">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-blue-500 text-sm font-medium">Total Inventory</h3>
          </div>
          <p className="mt-2 text-3xl font-semibold text-white">
            {summary?.totalInventoryItems.toLocaleString() ?? '0'}
          </p>
        </div>
        
        <div className="bg-black p-6 rounded-lg shadow-lg border border-gray-800">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-red-500 text-sm font-medium">Items Wasted</h3>
          </div>
          <p className="mt-2 text-3xl font-semibold text-white">
            {summary?.totalWastedItems.toLocaleString() ?? '0'}
          </p>
        </div>
        
        <div className="bg-black p-6 rounded-lg shadow-lg border border-gray-800">
          <div className="flex items-center">
            <ShoppingCart className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="text-green-500 text-sm font-medium">Items Sold</h3>
          </div>
          <p className="mt-2 text-3xl font-semibold text-white">
            {summary?.totalSoldItems.toLocaleString() ?? '0'}
          </p>
        </div>
        
        <div className="bg-black p-6 rounded-lg shadow-lg border border-gray-800">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-violet-500 mr-2" />
            <h3 className="text-violet-500 text-sm font-medium">Monthly Sales</h3>
          </div>
          <p className="mt-2 text-3xl font-semibold text-white">
            ${summary?.monthlySalesRevenue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }) ?? '0.00'}
          </p>
        </div>
      </div>

      <LowStockNotifications />
      <InventoryList showWarehouseView={true} />
      <WarehouseList />
    </div>
  );
}