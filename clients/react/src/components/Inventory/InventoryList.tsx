import { type IMedicine } from '../../services/inventory';
import './inventoryList.scss';

interface InventoryListProps {
  items: IMedicine[];
  onEdit?: (item: IMedicine) => void;
  onDiscard?: (medicineId: string) => void;
}

const InventoryList = ({ items, onEdit, onDiscard }: InventoryListProps) => {
  const formatDate = (date: string | Date | null) => {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const isExpiringSoon = (expiryDate: string | Date | null) => {
    if (!expiryDate) return false;
    const exp = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry < 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate: string | Date | null) => {
    if (!expiryDate) return false;
    const exp = new Date(expiryDate);
    return exp < new Date();
  };

  if (items.length === 0) {
    return (
      <div className="inventory-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 12h6m-6 4h6M7 20h10a2 2 0 002-2V4a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <p>No medicines found</p>
        <span className="empty-hint">Add medicines to get started</span>
      </div>
    );
  }

  return (
    <div className="inventory-list-container">
      <div className="table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Barcode</th>
              <th>Medicine Name</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Expiry Date</th>
              <th>Mfg. Date</th>
              <th>Batches</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((medicine) => (
              <tr key={medicine.id} className={`${isExpired(medicine.exp) ? 'expired' : isExpiringSoon(medicine.exp) ? 'expiring-soon' : ''}`}>
                <td className="barcode-cell">{medicine.barcodeNo}</td>
                <td className="name-cell">
                  <div className="medicine-info">
                    <div className="medicine-name">{medicine.name}</div>
                    {medicine.desc && <div className="medicine-desc">{medicine.desc}</div>}
                  </div>
                </td>
                <td className="type-cell">
                  <span className="medicine-type">{medicine.type}</span>
                </td>
                <td className="qty-cell">
                  <span className={`qty-badge ${medicine.qty <= 0 ? 'out-of-stock' : medicine.qty <= 5 ? 'low-stock' : ''}`}>
                    {medicine.qty}
                  </span>
                </td>
                <td className="price-cell">₹{medicine.price.toFixed(2)}</td>
                <td className={`date-cell ${isExpired(medicine.exp) ? 'expired-text' : isExpiringSoon(medicine.exp) ? 'warning-text' : ''}`}>
                  {formatDate(medicine.exp)}
                </td>
                <td className="date-cell">{formatDate(medicine.mfg)}</td>
                <td className="batches-cell">
                  <span className="batch-count">{medicine.batches?.length || 0}</span>
                </td>
                <td className="actions-cell">
                  {onEdit && (
                    <button
                      className="action-btn edit-btn"
                      onClick={() => onEdit(medicine)}
                      title="Edit"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  )}
                  {onDiscard && (
                    <button
                      className="action-btn discard-btn"
                      onClick={() => onDiscard(medicine.id)}
                      title="Discard"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryList;
