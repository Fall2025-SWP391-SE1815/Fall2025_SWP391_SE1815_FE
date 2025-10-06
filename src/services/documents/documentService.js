// Document Service - thin wrapper over real backend APIs for renter documents
import { apiGet, apiPost, apiDelete } from '@/lib/api/apiClient.js';
import { API_ENDPOINTS } from '@/lib/api/apiConfig.js';

const basePath = `${API_ENDPOINTS.RENTER.DOCUMENTS}`;

const getAll = async (params = {}) => {
  // Note: apiGet uses getApiUrl internally; params are not currently serialized by apiGet
  // If backend expects query params, pass them encoded directly in endpoint or extend apiGet.
  const query = params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
  return apiGet(`${basePath}${query}`, 'Không thể lấy tài liệu');
};

const getById = async (id) => {
  return apiGet(`${basePath}/${id}`, 'Không thể lấy tài liệu');
};

const upload = async (file, metadata = {}) => {
  const formData = new FormData();
  formData.append('file', file);

  const metadataQuery = metadata && Object.keys(metadata).length ? `?metadata=${encodeURIComponent(JSON.stringify(metadata))}` : '';
  // apiPost will detect FormData and avoid setting Content-Type so browser includes boundary
  return apiPost(`${basePath}${metadataQuery}`, formData, 'Không thể tải file lên');
};

const remove = async (id) => {
  return apiDelete(`${basePath}/${id}`, 'Không thể xóa tài liệu');
};

const getRenterDocumentsByStaff = async (renterId) => {
  return apiGet(API_ENDPOINTS.STAFF.RENTER_DOCUMENTS_BY_STAFF(renterId), 'Không thể lấy tài liệu của người thuê');
};

export default {
  getAll,
  getById,
  upload,
  delete: remove,
  getRenterDocumentsByStaff
};