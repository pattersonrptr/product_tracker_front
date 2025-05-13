import { useState } from 'react';
import { toast } from 'react-toastify';

const useDeletion = ({ onDeleteItem, updateItemList, updateTotalItems, getItemId, onProductsChanged, onClearSelectedProducts }) => {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState([]);

  const openConfirmationModal = (id) => {
    setItemIdToDelete(id);
    setIsConfirmationOpen(true);
  };

  const openBulkConfirmationModal = (ids) => {
    setItemsToDelete(ids);
    setIsBulkDelete(true);
    setIsConfirmationOpen(true);
  };

  const closeConfirmationModal = () => {
    setIsConfirmationOpen(false);
    setItemIdToDelete(null);
    setIsBulkDelete(false);
    setItemsToDelete([]);
  };

  const handleConfirmDelete = async () => {
    setIsConfirmationOpen(false);
    if (isBulkDelete && itemsToDelete.length > 0) {
      const deletionResults = await Promise.all(
        itemsToDelete.map(id => onDeleteItem(id))
      );
      const successfulDeletions = deletionResults.filter(success => success).length;
      const failedDeletions = deletionResults.length - successfulDeletions;

      if (successfulDeletions > 0 && updateItemList && updateTotalItems && getItemId) {
        toast.success(`${successfulDeletions} item(s) deleted successfully!`);
        updateItemList(prevItems => prevItems.filter(item => !itemsToDelete.includes(getItemId(item))));
        updateTotalItems(prevTotal => prevTotal - successfulDeletions);
        onProductsChanged();
        onClearSelectedProducts();
      } else if (successfulDeletions > 0) {
        toast.success(`${successfulDeletions} item(s) deleted successfully!`);
      }

      if (failedDeletions > 0) {
        toast.error(`Failed to delete ${failedDeletions} item(s).`);
      }

      setItemsToDelete([]);
      setIsBulkDelete(false);
    } else if (itemIdToDelete) {
      const success = await onDeleteItem(itemIdToDelete);
      if (success && updateItemList && updateTotalItems && getItemId) {
        toast.success("Item deleted successfully!");
        updateItemList(prevItems => prevItems.filter(item => getItemId(item) !== itemIdToDelete));
        updateTotalItems(prevTotal => prevTotal - 1);
        onProductsChanged();
      } else if (success) {
        toast.success("Item deleted successfully!");
      } else {
        toast.error("Failed to delete item");
      }
      setItemIdToDelete(null);
    }
  };

  return {
    isConfirmationOpen,
    itemIdToDelete,
    isBulkDelete,
    openConfirmationModal,
    openBulkConfirmationModal,
    closeConfirmationModal,
    handleConfirmDelete,
    setIsBulkDelete,
    setItemsToDelete,
  };
};

export default useDeletion;