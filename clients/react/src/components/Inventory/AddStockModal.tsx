import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addMedicine, type IMedicine, getMedicineByBarcode } from '../../services/inventory';
import './addStockModal.scss';

const MEDICINE_TYPES = ['Tablet', 'Capsule', 'Injection', 'Syrup', 'Powder', 'Tube', 'Spray', 'Inhaler'];

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  onSuccess?: () => void;
}

export const AddStockModal: React.FC<AddStockModalProps> = ({ isOpen, onClose, orgId, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingMedicine, setExistingMedicine] = useState<IMedicine | null>(null);

  const [barcode, setBarcode] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [medicineType, setMedicineType] = useState('Tablet');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  
  const [needsSpecialCare, setNeedsSpecialCare] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [handlingTemp, setHandlingTemp] = useState('');

  const [expiry, setExpiry] = useState('');
  const [mfg, setMfg] = useState('');
  const [qty, setQty] = useState('');

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  const resetForm = () => {
    setStep(1);
    setError(null);
    setExistingMedicine(null);
    setBarcode('');
    setMedicineName('');
    setMedicineType('Tablet');
    setDescription('');
    setPrice('');
    setNeedsSpecialCare(false);
    setSpecialInstructions('');
    setHandlingTemp('');
    setExpiry('');
    setMfg('');
    setQty('');
  };

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) {
      setError('Barcode cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const medicine = await getMedicineByBarcode(orgId, barcode);
      if (medicine) {
        setExistingMedicine(medicine);
        setStep(4);
      } else {
        setStep(2);
      }
    } catch (err) {
      const error = err as Record<string, unknown>;
      if ((error?.response as Record<string, unknown>)?.status === 404) {
        setStep(2);
      } else {
        setError(((error?.response as Record<string, unknown>)?.data as Record<string, unknown>)?.message as string || 'Error checking barcode');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMedicineDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineName.trim() || !price) {
      setError('Name and price are required');
      return;
    }
    setStep(3);
  };

  const handleSpecialCareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(4);
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expiry || !mfg || !qty) {
      setError('Expiry, manufacturing date, and quantity are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addMedicine(orgId, {
        barcodeNo: barcode,
        name: medicineName,
        type: medicineType,
        qty: Number(qty),
        desc: description || undefined,
        price: Number(price),
        specialInstructions: needsSpecialCare ? specialInstructions : undefined,
        handlingTemp: needsSpecialCare ? Number(handlingTemp) || undefined : undefined,
        exp: expiry,
        mfg: mfg,
      });

      onSuccess?.();
      onClose();
      resetForm();
    } catch (err) {
      const error = err as Record<string, unknown>;
      setError(((error?.response as Record<string, unknown>)?.data as Record<string, unknown>)?.message as string || 'Error adding medicine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="add-stock-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="modal-header">
              <h2>Add New Stock</h2>
              <button className="close-btn" onClick={onClose}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="stepper-header">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className={`stepper-item ${step >= s ? 'active' : ''} ${step === s ? 'current' : ''}`}>
                  <div className="stepper-number">{s}</div>
                  <div className="stepper-label">
                    {s === 1 && 'Barcode'}
                    {s === 2 && 'Details'}
                    {s === 3 && 'Care'}
                    {s === 4 && 'Batch'}
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <motion.div className="error-message" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                {error}
              </motion.div>
            )}

            <div className="modal-content">
              {step === 1 && (
                <motion.form onSubmit={handleBarcodeSubmit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="form-group">
                    <label htmlFor="barcode">Barcode *</label>
                    <input id="barcode" type="text" value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Enter medicine barcode" required autoFocus />
                    <span className="hint">Scan or enter the barcode</span>
                  </div>
                </motion.form>
              )}

              {step === 2 && (
                <motion.form onSubmit={handleMedicineDetailsSubmit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="form-group">
                    <label htmlFor="name">Medicine Name *</label>
                    <input id="name" type="text" value={medicineName} onChange={(e) => setMedicineName(e.target.value)} placeholder="e.g., Aspirin 500mg" required autoFocus />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="type">Medicine Type *</label>
                      <select id="type" value={medicineType} onChange={(e) => setMedicineType(e.target.value)} required>
                        {MEDICINE_TYPES.map((type) => (<option key={type} value={type}>{type}</option>))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="price">Price (₹) *</label>
                      <input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" min="0" step="0.01" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="desc">Description</label>
                    <textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Pain reliever, antifebrile" rows={3} />
                  </div>
                </motion.form>
              )}

              {step === 3 && (
                <motion.form onSubmit={handleSpecialCareSubmit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="form-group">
                    <label className="checkbox">
                      <input type="checkbox" checked={needsSpecialCare} onChange={(e) => setNeedsSpecialCare(e.target.checked)} />
                      <span>This medicine requires special care</span>
                    </label>
                  </div>
                  {needsSpecialCare && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <div className="form-group">
                        <label htmlFor="instructions">Special Instructions</label>
                        <textarea id="instructions" value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} placeholder="e.g., Keep away from direct sunlight" rows={3} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="temp">Handling Temperature (°C)</label>
                        <input id="temp" type="number" value={handlingTemp} onChange={(e) => setHandlingTemp(e.target.value)} placeholder="e.g., 25" step="0.1" />
                      </div>
                    </motion.div>
                  )}
                </motion.form>
              )}

              {step === 4 && (
                <motion.form onSubmit={handleBatchSubmit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  {existingMedicine && (
                    <div className="info-card">
                      <h4>Existing Medicine Found</h4>
                      <p><strong>{existingMedicine.name}</strong> ({existingMedicine.type})</p>
                      <p>Current Stock: <strong>{existingMedicine.qty} units</strong></p>
                    </div>
                  )}
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="mfg">Mfg. Date *</label>
                      <input id="mfg" type="date" value={mfg} onChange={(e) => setMfg(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="expiry">Expiry Date *</label>
                      <input id="expiry" type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="qty">Quantity *</label>
                    <input id="qty" type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" min="1" required autoFocus />
                  </div>
                </motion.form>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => { if (step === 1) { onClose(); } else { setStep(step - 1); setError(null); } }} disabled={loading}>
                {step === 1 ? 'Cancel' : 'Back'}
              </button>
              <button className="btn-primary" onClick={(e) => { const form = (e.target as HTMLElement).closest('.modal-content')?.querySelector('form') as HTMLFormElement; if (form) form.dispatchEvent(new Event('submit', { bubbles: true })); }} disabled={loading}>
                {loading ? 'Loading...' : step === 4 ? 'Add Stock' : 'Next'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddStockModal;
