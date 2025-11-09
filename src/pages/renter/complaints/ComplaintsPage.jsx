import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageSquare,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

// Components
import ComplaintCard from './ComplaintCard';

// Services
import renterComplaintsService from '@/services/renter/complaintsService';

const ComplaintsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // View complaints states
  const [myComplaints, setMyComplaints] = useState([]);
  

  useEffect(() => {
    loadMyComplaints();
  }, []);

  const loadMyComplaints = async () => {
    try {
      setLoading(true);
      // GET /api/renter/complaint - Get all complaints of current renter
      const complaints = await renterComplaintsService.getAll();
      setMyComplaints(complaints || []);
    } catch (err) {
      console.error('Error loading complaints:', err);
      setError('Không thể tải danh sách khiếu nại');
    } finally {
      setLoading(false);
    }
  };

  const handleViewComplaintDetail = (complaintId) => {
    navigate(`/complaints/${complaintId}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <MessageSquare className="h-8 w-8 mr-3 text-blue-600" />
            Danh sách khiếu nại
          </h1>
          <p className="text-gray-600 mt-2">
            Xem danh sách và chi tiết các khiếu nại đã gửi
          </p>
        </div>
        
        <Button
          onClick={() => loadMyComplaints()}
          variant="outline"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Complaints List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Khiếu nại của bạn
            {myComplaints.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {myComplaints.length}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Danh sách tất cả các khiếu nại bạn đã gửi và tình trạng xử lý
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Đang tải danh sách khiếu nại...</p>
            </div>
          ) : myComplaints.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có khiếu nại nào
              </h3>
              <p className="text-gray-600">
                Bạn chưa gửi khiếu nại nào trong hệ thống.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myComplaints.map((complaint) => (
                <ComplaintCard 
                  key={complaint.id} 
                  complaint={complaint} 
                  onViewDetail={handleViewComplaintDetail}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplaintsPage;
