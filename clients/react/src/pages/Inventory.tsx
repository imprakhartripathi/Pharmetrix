import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getInventory, type IMedicine } from '../services/inventory';
import InventoryList from '../components/Inventory/InventoryList';
import InventoryFilters from '../components/Inventory/InventoryFilters';
import AddStockModal from '../components/Inventory/AddStockModal';
import '../styles/inventory.scss';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const Inventory: React.FC = () => {
  const [medicines, setMedicines] = useState<IMedicine[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const limit = 20;

  useEffect(() => {
    const userStr = localStorage.getItem('authUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setOrgId(user.orgId || null);
      } catch (e) {
        console.error('Failed to parse user info:', e);
      }
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!orgId) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await getInventory(orgId, search, page, limit);
      setMedicines(response.items);
      setTotal(response.total);
    } catch (err) {
      const error = err as Record<string, unknown>;
      setError(((error?.response as Record<string, unknown>)?.data as Record<string, unknown>)?.message as string || (error?.message as string) || 'Failed to load inventory');
      console.error('Inventory fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [orgId, search, page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setPage(1);
    fetchData();
  };

  const handleEdit = (medicine: IMedicine) => {
    console.log('Edit medicine:', medicine);
  };

  const handleDiscard = (medicineId: string) => {
    console.log('Discard medicine:', medicineId);
  };

  const handleModalSuccess = () => {
    setPage(1);
    fetchData();
  };

  if (!orgId) {
    return (
      <div className="inventory-container">
        <motion.div variants={fadeInUp} initial="initial" animate="animate">
          <div className="error-container">
            <div className="error-title">Organization not found</div>
            <div className="error-message">Please set up your organization first</div>
          </div>
        </motion.div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="inventory-container">
      <motion.div variants={fadeInUp} initial="initial" animate="animate" className="inventory-header">
        <div>
          <h1>Inventory Management</h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem', marginBottom: 0 }}>
            Track medicines, batches, and expiry dates
          </p>
        </div>
        <div className="header-actions">
          <button className="add-medicine-btn" onClick={() => setIsModalOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Medicine
          </button>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <InventoryFilters 
          search={search} 
          setSearch={(searchValue: string) => {
            setSearch(searchValue);
            setPage(1);
          }} 
          onRefresh={handleRefresh}
        />
      </motion.div>

      {error && (
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="error-container" style={{ marginBottom: '1rem' }}>
          <div className="error-title">Error</div>
          <div className="error-message">{error}</div>
        </motion.div>
      )}

      {isLoading ? (
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="loading-container">
          <div className="loader" />
        </motion.div>
      ) : (
        <motion.div variants={fadeInUp} initial="initial" animate="animate">
          <InventoryList 
            items={medicines}
            onEdit={handleEdit}
            onDiscard={handleDiscard}
          />

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="page-info">
                Page {page} of {totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </motion.div>
      )}

      <AddStockModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        orgId={orgId}
        onSuccess={handleModalSuccess}
      />
    </main>
  );
};

export default Inventory;
