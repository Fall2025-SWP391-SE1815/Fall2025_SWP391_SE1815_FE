import React, { useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth.jsx';
import { Button } from '@/components/ui/button';


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Upload, Trash2 } from 'lucide-react';
import documentService from '@/services/documents/documentService.js';
import { useEffect } from 'react';

const ProfilePage = () => {
  const { user } = useAuth();
  const name = user?.fullName || 'Người dùng';
  const email = user?.email || 'Không có email';
  const phone = user?.phone || 'Không có số điện thoại';

  // Documents state (fetched from API)
  const [docs, setDocs] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadType, setUploadType] = useState('');
  const [uploadNumber, setUploadNumber] = useState('');
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoadingDocs(true);
      setError('');
      const res = await documentService.getAll();
      // backend returns array
      const data = res && res.data ? res.data : res;
      setDocs(Array.isArray(data) ? data : (data.documents || []));
    } catch (err) {
      console.error(err);
      setError('Không thể tải tài liệu.');
      setDocs([]);
    } finally {
      setLoadingDocs(false);
    }
  };



  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    setError('');
    try {
      const metadata = { type: uploadType || 'CCCD', documentNumber: uploadNumber || '' };
      const res = await documentService.upload(uploadFile, metadata);
      const payload = res && res.data ? res.data : res;
      // API returns the created document object
      setDocs(prev => [payload, ...prev]);
      setUploadFile(null);
      setUploadType('');
      setUploadNumber('');
    } catch (err) {
      console.error(err);
      setError('Không thể tải tài liệu lên.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa tài liệu này?')) return;
    setError('');
    try {
      await documentService.delete(id);
      setDocs(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error(err);
      setError('Không thể xóa tài liệu.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Họ và tên</label>
                    <div className="text-lg font-semibold text-gray-900">{name}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Email</label>
                    <div className="text-sm text-gray-700">{email}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Số điện thoại</label>
                    <div className="text-sm text-gray-700">{phone}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Documents Management */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Quản lý Tài liệu</CardTitle>
                  <div className="text-sm text-gray-500">Tải lên và quản lý tài liệu xác thực</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Upload area */}
                  <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="grid grid-rows-1 sm:grid-rows-2 lg:grid-rows-3 gap-4">
                      <div>
                        <Label htmlFor="docType" className="text-sm font-medium">Loại tài liệu</Label>
                        <Input
                          id="docType"
                          value={uploadType}
                          onChange={(e) => setUploadType(e.target.value)}
                          placeholder="CMND | GPLX | Hộ chiếu"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="docNumber" className="text-sm font-medium">Số tài liệu</Label>
                        <Input
                          id="docNumber"
                          value={uploadNumber}
                          onChange={(e) => setUploadNumber(e.target.value)}
                          placeholder="123456789"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium block mb-1">Chọn tệp</Label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                            className="text-sm flex-1 p-2 border rounded"
                          />
                          <Button
                            onClick={handleUpload}
                            disabled={!uploadFile || uploading}
                            size="sm"
                            className="whitespace-nowrap"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            {uploading ? 'Đang tải...' : 'Tải lên'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Documents list */}
                  <div className="space-y-3">
                    {docs.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="mx-auto h-10 w-10 mb-2 text-gray-300" />
                        <div>Chưa có tài liệu</div>
                      </div>
                    ) : (
                      docs.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <FileText className="h-8 w-8 text-blue-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {doc.type} {doc.documentNumber ? `- ${doc.documentNumber}` : ''}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(doc.createdAt).toLocaleString('vi-VN')}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center ml-4">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(doc.id)}
                              className="flex items-center"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Xóa
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
