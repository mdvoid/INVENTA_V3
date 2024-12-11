import React, { useState, useEffect } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Edit2, Trash2, Package, Plus, ArrowRightLeft, DollarSign, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { InventoryItem } from '../../types';
import InventoryForm from './InventoryForm';
import TransferModal from './TransferModal';
import SalesForm from '../sales/SalesForm';
import WastageForm from '../wastage/WastageForm';
import ErrorMessage from '../ErrorMessage';
import LoadingSpinner from '../LoadingSpinner';

interface InventoryListProps {
  showWarehouseView?: boolean;
}

export default function InventoryList({ showWarehouseView = false }: InventoryListProps) {
  const { inventory, warehouses, deleteItem, loading, error, refreshData } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isSalesOpen, setIsSalesOpen] = useState(false);
  const [isWastageOpen, setIsWastageOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | undefined>();
  const [itemToTransfer, setItemToTransfer] = useState<InventoryItem | undefined>();
  const [itemForSale, setItemForSale] = useState<InventoryItem | undefined>();
  const [itemForWastage, setItemForWastage] = useState<InventoryItem | undefined>();
  const [expandedWarehouses, setExpandedWarehouses] = useState<string[]>([]);

  useEffect(() => {
    refreshData();
  }, []);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inventoryByWarehouse = warehouses.map(warehouse => ({
    ...warehouse,
    items: filteredInventory.filter(item => item.warehouse_id === warehouse.id)
  }));

  const handleEdit = (item: InventoryItem) => {
    console.log('Editing item:', item);
    setItemToEdit(item);
    setIsFormOpen(true);
  };

  const handleCloseForm = async () => {
    setIsFormOpen(false);
    setItemToEdit(undefined);
    await refreshData(); // Refresh data after form closes
  };

  // ... rest of the component remains the same, just update the handleClose functions
  // to include refreshData() call

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="bg-black rounded-lg shadow-lg p-6">
      {/* ... rest of the JSX remains the same ... */}
    </div>
  );
}