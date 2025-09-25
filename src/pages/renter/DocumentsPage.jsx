import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useToast } from '../../hooks/use-toast';
import apiClient from '../../lib/api/apiClient';

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    type: '',
    document_number: '',
    file: null
  });
  const { toast } = useToast();

  const documentTypes = [
    { value: 'CCCD', label: 'Căn cước công dân (CCCD)' },
    { value: 'CMND', label: 'Chứng minh nhân dân (CMND)' },
    { value: 'GPLX', label: 'Giấy phép lái xe (GPLX)' }
  ];

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/renter/documents');
      
      if (response.success) {
        setDocuments(response.data.documents || []);
      } else {
        if (response.statusCode === 404) {
          setDocuments([]);
        } else {
          toast({
            title: "Lỗi",
            description: response.message || "Không thể tải danh sách tài liệu",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách tài liệu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setUploadForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Lỗi file",
          description: "Chỉ chấp nhận file JPG, PNG hoặc PDF",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Lỗi file",
          description: "Kích thước file không được vượt quá 5MB",
          variant: "destructive",
        });
        return;
      }

      setUploadForm(prev => ({
        ...prev,
        file: file
      }));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.type || !uploadForm.document_number || !uploadForm.file) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin và chọn file",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('type', uploadForm.type);
      formData.append('document_number', uploadForm.document_number);
      formData.append('file', uploadForm.file);

      const response = await apiClient.post('/renter/documents', formData);
      
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Tải lên tài liệu thành công",
        });
        
        // Reset form
        setUploadForm({
          type: '',
          document_number: '',
          file: null
        });
        
        // Reset file input
        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.value = '';
        
        // Reload documents
        loadDocuments();
      } else {
        toast({
          title: "Lỗi",
          description: response.message || "Không thể tải lên tài liệu",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải lên tài liệu",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
      return;
    }

    try {
      const response = await apiClient.delete(`/renter/documents/${documentId}`);
      
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Xóa tài liệu thành công",
        });
        loadDocuments();
      } else {
        toast({
          title: "Lỗi",
          description: response.message || "Không thể xóa tài liệu",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa tài liệu",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (verified) => {
    if (verified) {
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Đã xác thực</Badge>;
    } else {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Chờ xác thực</Badge>;
    }
  };

  const getDocumentTypeName = (type) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType ? docType.label : type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý tài liệu</h1>
        <p className="text-gray-600">Tải lên và quản lý các giấy tờ tùy thân của bạn</p>
      </div>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Tải lên tài liệu mới
          </CardTitle>
          <CardDescription>
            Tải lên CCCD/CMND và GPLX để xác thực tài khoản
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="document-type">Loại giấy tờ</Label>
                <Select 
                  value={uploadForm.type} 
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại giấy tờ" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="document-number">Số giấy tờ</Label>
                <Input
                  id="document-number"
                  placeholder="Nhập số giấy tờ"
                  value={uploadForm.document_number}
                  onChange={(e) => handleInputChange('document_number', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="file-input">File tài liệu</Label>
              <Input
                id="file-input"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-sm text-gray-500 mt-1">
                Chỉ chấp nhận file JPG, PNG hoặc PDF. Tối đa 5MB.
              </p>
            </div>
            
            <Button type="submit" disabled={uploading} className="w-full">
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang tải lên...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Tải lên
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Tài liệu đã tải lên
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Chưa có tài liệu nào được tải lên. Hãy tải lên tài liệu đầu tiên của bạn.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div>
                        <h3 className="font-medium">{getDocumentTypeName(doc.type)}</h3>
                        <p className="text-sm text-gray-600">Số: {doc.document_number}</p>
                        <p className="text-xs text-gray-500">
                          Tải lên: {new Date(doc.created_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(doc.verified)}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(doc.document_url, '_blank')}
                    >
                      Xem
                    </Button>
                    
                    {!doc.verified && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsPage;