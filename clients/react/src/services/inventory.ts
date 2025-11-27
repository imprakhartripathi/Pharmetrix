import axios from 'axios';
import { getApiBaseUrl } from './api';

export interface IBatch {
  batchId: string;
  qty: number;
  combinedExp: string | Date;
  averageMfg: string | Date;
  isDiscarded: boolean;
}

export interface IMedicine {
  id: string;
  barcodeNo: string;
  name: string;
  type: string;
  qty: number;
  price: number;
  desc?: string;
  exp: string | Date | null;
  mfg: string | Date | null;
  specialInstructions?: string;
  handlingTemp?: number;
  batches: IBatch[];
  firstStockedOn: string | Date | null;
  recentlyStockedOn: string | Date | null;
}

export interface InventoryResponse {
  items: IMedicine[];
  page: number;
  limit: number;
  total: number;
}

export async function getInventory(orgId: string, query = '', page = 1, limit = 20): Promise<InventoryResponse> {
  try {
    const baseUrl = await getApiBaseUrl();
    const response = await axios.get<InventoryResponse>(`${baseUrl}/orgs/${orgId}/inventory`, {
      params: { q: query, page, limit },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
    throw error;
  }
}

export async function getMedicineByBarcode(orgId: string, barcodeNo: string): Promise<IMedicine | null> {
  try {
    const baseUrl = await getApiBaseUrl();
    const response = await axios.get<IMedicine>(`${baseUrl}/orgs/${orgId}/medicines/${barcodeNo}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    const err = error as Record<string, unknown>;
    if ((err?.response as Record<string, unknown>)?.status === 404) {
      return null;
    }
    console.error('Failed to fetch medicine:', error);
    throw error;
  }
}

interface ApiResponse {
  message: string;
}

export async function addMedicine(orgId: string, medicine: {
  barcodeNo: string;
  name: string;
  type: string;
  qty: number;
  desc?: string;
  specialInstructions?: string;
  handlingTemp?: number;
  price?: number;
  exp: string | Date;
  mfg: string | Date;
}): Promise<ApiResponse> {
  try {
    const baseUrl = await getApiBaseUrl();
    const response = await axios.post<ApiResponse>(`${baseUrl}/orgs/${orgId}/medicines`, medicine, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to add medicine:', error);
    throw error;
  }
}

export async function sellMedicine(orgId: string, barcodeNo: string, qty: number): Promise<ApiResponse> {
  try {
    const baseUrl = await getApiBaseUrl();
    const response = await axios.post<ApiResponse>(`${baseUrl}/orgs/${orgId}/sell`, { barcodeNo, qty }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to sell medicine:', error);
    throw error;
  }
}

export async function discardBatch(orgId: string, batchId: string): Promise<ApiResponse> {
  try {
    const baseUrl = await getApiBaseUrl();
    const response = await axios.post<ApiResponse>(`${baseUrl}/orgs/${orgId}/batches/${batchId}/discard`, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to discard batch:', error);
    throw error;
  }
}

export async function markExpiredBatches(orgId: string): Promise<ApiResponse> {
  try {
    const baseUrl = await getApiBaseUrl();
    const response = await axios.post<ApiResponse>(`${baseUrl}/orgs/${orgId}/expire-check`, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to mark expired batches:', error);
    throw error;
  }
}
