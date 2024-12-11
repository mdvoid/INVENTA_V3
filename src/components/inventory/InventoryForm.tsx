import React, { useState, useEffect } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { InventoryItem } from '../../types';
import Modal from '../common/Modal';
import ErrorMessage from '../ErrorMessage';

interface InventoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: InventoryItem;
}

export default function InventoryForm({ isOpen, onClose, itemToEdit }: InventoryFormProps) {
  const { addItem, updateItem, warehouses } = useInventory();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 0,
    price: 0,
    expiry_date: '',
    warehouse_id: '',
    threshold: 0,
  });

  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        name: itemToEdit.name,
        category: itemToEdit.category,
        quantity: itemToEdit.quantity,
        price: itemToEdit.price,
        expiry_date: itemToEdit.expiry_date,
        warehouse_id: itemToEdit.warehouse_id,
        threshold: itemToEdit.threshold,
      });
    } else {
      // Reset form when not editing
      setFormData({
        name: '',
        category: '',
        quantity: 0,
        price: 0,
        expiry_date: '',
        warehouse_id: '',
        threshold: 0,
      });
    }
    setError(null);
  }, [itemToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (itemToEdit) {
        console.log('Updating item:', itemToEdit.id, formData);
        await updateItem(itemToEdit.id, formData);
      } else {
        console.log('Adding new item:', formData);
        await addItem(formData);
      }
      onClose();
    } catch (err) {
      console.error('Error saving item:', err);
      setError(err instanceof Error ? err.message : 'Failed to save item');
    }
  };

  // ... rest of the component remains the same
}