// Document Service API
import { mockData } from '../mockData.js';

// Helper functions
const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

const createResponse = (data, success = true, message = "Success") => ({
  success,
  message,
  data,
  timestamp: new Date().toISOString()
});

const createErrorResponse = (message, statusCode = 400) => ({
  success: false,
  message,
  statusCode,
  timestamp: new Date().toISOString()
});

export const documentService = {
  // Get all documents with filtering
  getAll: async (params = {}) => {
    await simulateDelay();
    let documents = [...mockData.documents];
    
    // Filter by user
    if (params.user_id) {
      documents = documents.filter(d => d.user_id === parseInt(params.user_id));
    }
    
    // Filter by type
    if (params.type) {
      documents = documents.filter(d => d.type === params.type);
    }
    
    // Filter by verification status
    if (params.verified !== undefined) {
      documents = documents.filter(d => d.verified === (params.verified === 'true'));
    }
    
    // Filter by verifier
    if (params.verified_by) {
      documents = documents.filter(d => d.verified_by === parseInt(params.verified_by));
    }
    
    // Sort by creation date (newest first)
    documents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return createResponse({
      documents: documents.slice(startIndex, endIndex),
      total: documents.length,
      page,
      limit,
      totalPages: Math.ceil(documents.length / limit)
    });
  },

  // Get document by ID
  getById: async (id) => {
    await simulateDelay();
    const document = mockData.documents.find(d => d.id === parseInt(id));
    if (document) {
      return createResponse(document);
    }
    return createErrorResponse("Document not found", 404);
  },

  // Create new document
  create: async (documentData) => {
    await simulateDelay();
    
    // Validate user exists
    const user = mockData.users.find(u => u.id === documentData.user_id);
    if (!user) {
      return createErrorResponse("User not found", 404);
    }
    
    // Validate document type
    const validTypes = ['CMND', 'CCCD', 'GPLX'];
    if (!validTypes.includes(documentData.type)) {
      return createErrorResponse("Loại giấy tờ không hợp lệ", 400);
    }

    // Validate required fields
    if (!documentData.document_number) {
      return createErrorResponse("Thiếu số giấy tờ", 400);
    }

    // Validate file (simulate file extension check)
    if (documentData.document_url) {
      const validExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
      const hasValidExtension = validExtensions.some(ext => 
        documentData.document_url.toLowerCase().includes(ext)
      );
      
      if (!hasValidExtension) {
        return createErrorResponse("Chỉ chấp nhận JPG/PNG/PDF", 415);
      }
    }
    
    // Check if user already has this type of document
    const existingDoc = mockData.documents.find(d => 
      d.user_id === documentData.user_id && 
      d.type === documentData.type
    );
    
    if (existingDoc) {
      return createErrorResponse(`Người dùng đã có tài liệu ${documentData.type}`, 409);
    }
    
    // Check if document number already exists
    const duplicateNumber = mockData.documents.find(d => 
      d.document_number === documentData.document_number &&
      d.type === documentData.type
    );
    
    if (duplicateNumber) {
      return createErrorResponse("Số giấy tờ đã tồn tại", 409);
    }
    
    const newDocument = {
      id: Math.max(...mockData.documents.map(d => d.id)) + 1,
      user_id: documentData.user_id,
      type: documentData.type,
      document_number: documentData.document_number,
      document_url: documentData.document_url || `https://storage.evrent.com/docs/${documentData.type.toLowerCase()}_${documentData.user_id}_${Date.now()}.jpg`,
      verified: false,
      verified_by: null,
      created_at: new Date().toISOString()
    };

    mockData.documents.push(newDocument);
    return createResponse({
      document: newDocument
    });
  },

  // Update document
  update: async (id, documentData) => {
    await simulateDelay();
    const documentIndex = mockData.documents.findIndex(d => d.id === parseInt(id));
    if (documentIndex === -1) {
      return createErrorResponse("Document not found", 404);
    }
    
    const currentDoc = mockData.documents[documentIndex];
    
    // Cannot update verified documents
    if (currentDoc.verified && !documentData.admin_override) {
      return createErrorResponse("Cannot update verified document", 400);
    }
    
    // Check document number uniqueness if being changed
    if (documentData.document_number && 
        documentData.document_number !== currentDoc.document_number) {
      const duplicateNumber = mockData.documents.find(d => 
        d.document_number === documentData.document_number &&
        d.type === (documentData.type || currentDoc.type) &&
        d.id !== parseInt(id)
      );
      
      if (duplicateNumber) {
        return createErrorResponse("Document number already exists", 409);
      }
    }
    
    mockData.documents[documentIndex] = {
      ...currentDoc,
      ...documentData,
      updated_at: new Date().toISOString()
    };
    
    // Reset verification if document details changed
    if (documentData.document_number || documentData.document_url) {
      mockData.documents[documentIndex].verified = false;
      mockData.documents[documentIndex].verified_by = null;
    }
    
    return createResponse(mockData.documents[documentIndex]);
  },

  // Delete document
  delete: async (id) => {
    await simulateDelay();
    const documentIndex = mockData.documents.findIndex(d => d.id === parseInt(id));
    if (documentIndex === -1) {
      return createErrorResponse("Document not found", 404);
    }
    
    const document = mockData.documents[documentIndex];
    
    // Cannot delete verified documents
    if (document.verified) {
      return createErrorResponse("Cannot delete verified document", 400);
    }
    
    mockData.documents.splice(documentIndex, 1);
    return createResponse({ message: "Document deleted successfully" });
  },

  // Verify document
  verify: async (id, verifiedBy, notes = '') => {
    await simulateDelay();
    const documentIndex = mockData.documents.findIndex(d => d.id === parseInt(id));
    if (documentIndex === -1) {
      return createErrorResponse("Document not found", 404);
    }
    
    const document = mockData.documents[documentIndex];
    
    if (document.verified) {
      return createErrorResponse("Document already verified", 400);
    }
    
    // Verify the verifier exists and has appropriate role
    const verifier = mockData.users.find(u => u.id === verifiedBy);
    if (!verifier || (verifier.role !== 'admin' && verifier.role !== 'staff')) {
      return createErrorResponse("Verifier must be admin or staff", 403);
    }
    
    mockData.documents[documentIndex] = {
      ...document,
      verified: true,
      verified_by: verifiedBy,
      verified_at: new Date().toISOString(),
      verification_notes: notes
    };
    
    return createResponse(mockData.documents[documentIndex]);
  },

  // Reject document verification
  reject: async (id, rejectedBy, reason) => {
    await simulateDelay();
    const documentIndex = mockData.documents.findIndex(d => d.id === parseInt(id));
    if (documentIndex === -1) {
      return createErrorResponse("Document not found", 404);
    }
    
    const document = mockData.documents[documentIndex];
    
    // Verify the rejector exists and has appropriate role
    const rejector = mockData.users.find(u => u.id === rejectedBy);
    if (!rejector || (rejector.role !== 'admin' && rejector.role !== 'staff')) {
      return createErrorResponse("Rejector must be admin or staff", 403);
    }
    
    mockData.documents[documentIndex] = {
      ...document,
      verified: false,
      verified_by: null,
      rejected: true,
      rejected_by: rejectedBy,
      rejected_at: new Date().toISOString(),
      rejection_reason: reason
    };
    
    return createResponse(mockData.documents[documentIndex]);
  },

  // Get documents by user
  getByUser: async (userId) => {
    await simulateDelay();
    const documents = mockData.documents.filter(d => d.user_id === parseInt(userId));
    
    // Group by type
    const groupedDocs = documents.reduce((acc, doc) => {
      if (!acc[doc.type]) {
        acc[doc.type] = [];
      }
      acc[doc.type].push(doc);
      return acc;
    }, {});
    
    return createResponse({
      documents,
      groupedByType: groupedDocs,
      verificationStatus: {
        total: documents.length,
        verified: documents.filter(d => d.verified).length,
        pending: documents.filter(d => !d.verified && !d.rejected).length,
        rejected: documents.filter(d => d.rejected).length
      }
    });
  },

  // Get pending verifications
  getPending: async () => {
    await simulateDelay();
    const pendingDocs = mockData.documents.filter(d => !d.verified && !d.rejected);
    
    return createResponse(pendingDocs);
  },

  // Get verification statistics
  getVerificationStats: async (params = {}) => {
    await simulateDelay();
    let documents = [...mockData.documents];
    
    // Filter by date range if provided
    if (params.start_date) {
      documents = documents.filter(d => 
        new Date(d.created_at) >= new Date(params.start_date)
      );
    }
    
    if (params.end_date) {
      documents = documents.filter(d => 
        new Date(d.created_at) <= new Date(params.end_date)
      );
    }
    
    const total = documents.length;
    const verified = documents.filter(d => d.verified).length;
    const pending = documents.filter(d => !d.verified && !d.rejected).length;
    const rejected = documents.filter(d => d.rejected).length;
    
    // Group by type
    const byType = documents.reduce((acc, doc) => {
      if (!acc[doc.type]) {
        acc[doc.type] = { total: 0, verified: 0, pending: 0, rejected: 0 };
      }
      acc[doc.type].total++;
      if (doc.verified) acc[doc.type].verified++;
      else if (doc.rejected) acc[doc.type].rejected++;
      else acc[doc.type].pending++;
      return acc;
    }, {});
    
    return createResponse({
      total,
      verified,
      pending,
      rejected,
      verificationRate: total > 0 ? Math.round((verified / total) * 100) : 0,
      byType
    });
  },

  // Renter API methods - matching exact specification
  renter: {
    // Upload document (POST /api/renter/documents)
    uploadDocument: async (formData) => {
      await simulateDelay();
      
      // Extract data from formData (simulated)
      const type = formData.get ? formData.get('type') : formData.type;
      const document_number = formData.get ? formData.get('document_number') : formData.document_number;
      const file = formData.get ? formData.get('file') : formData.file;
      
      // Validate required fields
      if (!type) {
        return createErrorResponse("Thiếu loại giấy tờ", 400);
      }
      
      if (!document_number) {
        return createErrorResponse("Thiếu số giấy tờ", 400);
      }
      
      if (!file) {
        return createErrorResponse("Thiếu file đính kèm", 400);
      }
      
      // Validate document type
      const validTypes = ['CCCD', 'CMND', 'GPLX'];
      if (!validTypes.includes(type)) {
        return createErrorResponse("Loại giấy tờ không hợp lệ", 400);
      }
      
      // Validate file type (simulate file validation)
      const fileName = file.name || file.filename || 'unknown';
      const validExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
      const hasValidExtension = validExtensions.some(ext => 
        fileName.toLowerCase().endsWith(ext)
      );
      
      if (!hasValidExtension) {
        return createErrorResponse("Chỉ chấp nhận JPG/PNG/PDF", 415);
      }
      
      // Simulate upload failure (random 5% chance)
      if (Math.random() < 0.05) {
        return createErrorResponse("Không thể lưu file, vui lòng thử lại", 500);
      }
      
      // Get current user (simulate from token)
      const currentUserId = 1; // This would come from JWT token in real implementation
      
      // Check if user already has this type of document
      const existingDoc = mockData.documents.find(d => 
        d.user_id === currentUserId && 
        d.type === type
      );
      
      if (existingDoc) {
        return createErrorResponse(`Đã có tài liệu ${type}`, 409);
      }
      
      // Create new document
      const newDocument = {
        id: Math.max(...mockData.documents.map(d => d.id), 0) + 1,
        user_id: currentUserId,
        type: type,
        document_number: document_number,
        document_url: `https://storage.evrent.com/docs/${type.toLowerCase()}_${currentUserId}_${Date.now()}.${fileName.split('.').pop()}`,
        verified: false,
        verified_by: null,
        created_at: new Date().toISOString()
      };
      
      mockData.documents.push(newDocument);
      
      return createResponse({
        document: newDocument
      });
    },

    // Get renter documents (GET /api/renter/documents)
    getDocuments: async () => {
      await simulateDelay();
      
      // Get current user (simulate from token)
      const currentUserId = 1; // This would come from JWT token in real implementation
      
      const userDocuments = mockData.documents.filter(d => d.user_id === currentUserId);
      
      if (userDocuments.length === 0) {
        return createErrorResponse("Chưa có tài liệu nào được upload", 404);
      }
      
      // Sort by creation date (newest first)
      userDocuments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      return createResponse({
        documents: userDocuments.map(doc => ({
          id: doc.id,
          type: doc.type,
          document_number: doc.document_number,
          document_url: doc.document_url,
          verified: doc.verified,
          verified_by: doc.verified_by,
          created_at: doc.created_at
        }))
      });
    },

    // Delete document (DELETE /api/renter/documents/:id)
    deleteDocument: async (id) => {
      await simulateDelay();
      
      // Get current user (simulate from token)
      const currentUserId = 1; // This would come from JWT token in real implementation
      
      const documentIndex = mockData.documents.findIndex(d => 
        d.id === parseInt(id) && d.user_id === currentUserId
      );
      
      if (documentIndex === -1) {
        return createErrorResponse("Không tìm thấy tài liệu", 404);
      }
      
      const document = mockData.documents[documentIndex];
      
      // Optional: Prevent deletion of verified documents
      if (document.verified) {
        return createErrorResponse("Không thể xóa tài liệu đã được xác thực", 400);
      }
      
      mockData.documents.splice(documentIndex, 1);
      
      return createResponse({
        status: 200,
        message: "Xóa tài liệu thành công"
      });
    }
  },

  // Staff API methods - matching exact specification
  staff: {
    // Verify customer document (POST /api/staff/renters/:id/verify-documents)
    verifyDocument: async (customerId, verificationData) => {
      await simulateDelay();
      
      // Get current staff (simulate from token)
      const currentStaffId = 2; // This would come from JWT token in real implementation
      
      // Validate staff exists and has proper role
      const staff = mockData.users.find(u => u.id === currentStaffId && u.role === 'staff');
      if (!staff) {
        return createErrorResponse("Không có quyền truy cập", 403);
      }
      
      // Validate required fields
      if (!verificationData.document_id) {
        return createErrorResponse("Thiếu thông tin document_id", 400);
      }
      
      if (verificationData.verified === undefined) {
        return createErrorResponse("Thiếu thông tin verified", 400);
      }
      
      // Find the document
      const document = mockData.documents.find(d => 
        d.id === parseInt(verificationData.document_id) && 
        d.user_id === parseInt(customerId)
      );
      
      if (!document) {
        return createErrorResponse("Không tìm thấy tài liệu", 404);
      }
      
      // Update document verification status
      const documentIndex = mockData.documents.findIndex(d => d.id === parseInt(verificationData.document_id));
      mockData.documents[documentIndex] = {
        ...document,
        verified: verificationData.verified,
        verified_by: verificationData.verified ? currentStaffId : null,
        verified_at: verificationData.verified ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      };
      
      const updatedDocument = mockData.documents[documentIndex];
      
      return createResponse({
        document_id: updatedDocument.id,
        user_id: updatedDocument.user_id,
        type: updatedDocument.type,
        document_number: updatedDocument.document_number,
        document_url: updatedDocument.document_url,
        verified: updatedDocument.verified,
        verified_by: updatedDocument.verified_by
      }, true, "Tài liệu đã được xác thực.");
    },

    // Get customer documents (GET /api/staff/renters/:id/documents)
    getCustomerDocuments: async (customerId) => {
      await simulateDelay();
      
      // Get current staff (simulate from token)
      const currentStaffId = 2; // This would come from JWT token in real implementation
      
      // Validate staff exists and has proper role
      const staff = mockData.users.find(u => u.id === currentStaffId && u.role === 'staff');
      if (!staff) {
        return createErrorResponse("Không có quyền truy cập", 403);
      }
      
      // Validate customer exists
      const customer = mockData.users.find(u => u.id === parseInt(customerId) && u.role === 'renter');
      if (!customer) {
        return createErrorResponse("Không tìm thấy khách hàng", 404);
      }
      
      // Get customer's documents
      const documents = mockData.documents.filter(d => d.user_id === parseInt(customerId));
      
      // Format response data
      const formattedDocuments = documents.map(document => ({
        id: document.id,
        type: document.type,
        document_number: document.document_number,
        document_url: document.document_url,
        verified: document.verified,
        verified_by: document.verified_by
      }));
      
      // Sort by creation date (newest first)
      formattedDocuments.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      
      return createResponse({
        documents: formattedDocuments
      });
    }
  }
};