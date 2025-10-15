// Professional Profile Page with Tabs (Profile + Documents)
import React, { useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth.jsx';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Edit3, Mail, Phone, Upload, Eye, Trash2 } from 'lucide-react';
import documentService from '@/services/documents/documentService.js';
import { useEffect } from 'react';

const ProfilePage = () => {
  const { user } = useAuth();
  const name = user?.full_name || 'Người dùng';
  const email = user?.email || 'Không có email';
  const phone = user?.phone || 'Không có số điện thoại';

  const initials = (name || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Documents state (fetched from API)
  const [tab, setTab] = useState('profile');
  const [docs, setDocs] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadType, setUploadType] = useState('');
  const [uploadNumber, setUploadNumber] = useState('');
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    if (tab === 'documents') {
      loadDocuments();
    }
  }, [tab]);

  const loadDocuments = async () => {
    try {
      setLoadingDocs(true);
      setError('');
      const res = await documentService.getAll();
      // backend returns array per your example
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

  const handleDebug = async () => {
    setDebugInfo(null);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const result = await documentService.getAll();
      setDebugInfo({ ok: true, accessTokenPreview: accessToken ? `${accessToken.slice(0,10)}...` : null, refreshTokenPresent: !!refreshToken, result });
    } catch (err) {
      setDebugInfo({ ok: false, message: err.message, status: err.status, authToken: err.authToken || null, refreshToken: err.refreshToken || null, raw: err.data || null });
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center">
                <Avatar className="w-28 h-28 mb-4">
                  {user?.avatar ? (
                    <AvatarImage src={user.avatar} />
                  ) : (
                    <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                  )}
                </Avatar>
                <h3 className="text-xl font-semibold">{name}</h3>
                <p className="text-sm text-gray-500 mt-1">{email}</p>
                <p className="text-sm text-gray-500">{phone}</p>

                <div className="mt-4">
                  <Button variant="ghost" size="sm">
                    <Edit3 className="mr-2 h-4 w-4" /> Chỉnh sửa hồ sơ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Tabs (Profile / Documents) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Hồ sơ & Tài liệu</CardTitle>
                <div className="text-sm text-gray-500">Quản lý thông tin và tài liệu xác thực</div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="profile">Thông tin</TabsTrigger>
                  <TabsTrigger value="documents">Tài liệu</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600 block">Họ và tên</label>
                      <div className="text-lg font-medium">{name}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block">Email</label>
                      <div className="text-sm text-gray-700 flex items-center"><Mail className="mr-2 h-4 w-4 text-gray-400"/>{email}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block">Số điện thoại</label>
                      <div className="text-sm text-gray-700 flex items-center"><Phone className="mr-2 h-4 w-4 text-gray-400"/>{phone}</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documents">
                  <div className="space-y-4">
                    {/* Upload area */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                      <div>
                        <Label htmlFor="docType">Loại tài liệu</Label>
                        <Input id="docType" value={uploadType} onChange={(e) => setUploadType(e.target.value)} placeholder="CMND | GPLX | Hộ chiếu" />
                      </div>
                      <div>
                        <Label htmlFor="docNumber">Số tài liệu</Label>
                        <Input id="docNumber" value={uploadNumber} onChange={(e) => setUploadNumber(e.target.value)} placeholder="123456789" />
                      </div>
                      <div>
                        <Label>Chọn tệp</Label>
                        <div className="flex items-center space-x-2">
                          <input type="file" accept="image/*,application/pdf" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} className="text-sm" />
                          <Button onClick={handleUpload} disabled={!uploadFile} size="sm">
                            <Upload className="mr-2 h-4 w-4"/> Tải lên
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Documents list */}
                    <div className="space-y-3">
                      <div className="mb-3">
                        <Button size="sm" variant="ghost" onClick={handleDebug}>Debug Documents API</Button>
                        {debugInfo && (
                          <div className="mt-2 p-2 bg-gray-50 border rounded text-xs text-gray-700">
                            {debugInfo.ok ? (
                              <div>OK — access: {debugInfo.accessTokenPreview} refreshPresent: {String(!!debugInfo.refreshTokenPresent)}</div>
                            ) : (
                              <div>
                                <div className="font-semibold">Error: {debugInfo.message}</div>
                                <div>Status: {debugInfo.status}</div>
                                <div>authToken present: {String(!!debugInfo.authToken)}</div>
                                <div>refreshToken present: {String(!!debugInfo.refreshToken)}</div>
                                <div>raw: {JSON.stringify(debugInfo.raw)}</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {docs.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="mx-auto h-10 w-10 mb-2 text-gray-300" />
                          <div>Chưa có tài liệu</div>
                        </div>
                      ) : (
                        docs.map(doc => (
                          <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-6 w-6 text-blue-600" />
                              <div>
                                <div className="font-medium">{doc.type} {doc.documentNumber ? `- ${doc.documentNumber}` : ''}</div>
                                <div className="text-xs text-gray-500">{new Date(doc.createdAt).toLocaleString('vi-VN')}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <a href={doc.url} target="_blank" rel="noreferrer">
                                <Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-1"/>Xem</Button>
                              </a>
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(doc.id)}><Trash2 className="h-4 w-4 mr-1"/>Xóa</Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
