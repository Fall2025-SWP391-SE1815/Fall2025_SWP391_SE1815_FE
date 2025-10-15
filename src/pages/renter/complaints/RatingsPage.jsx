import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { 
  Star,
  User,
  Car,
  Calendar,
  MessageSquare,
  Send,
  Award,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock
} from 'lucide-react';

// Services
import { renterService } from '@/services/renter/renterService';

const RatingsPage = () => {
  const [activeTab, setActiveTab] = useState('submit');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Submission states
  const [availableRentals, setAvailableRentals] = useState([]);
  const [selectedRental, setSelectedRental] = useState('');
  const [rentalRating, setRentalRating] = useState(0);
  const [rentalComment, setRentalComment] = useState('');
  const [staffRating, setStaffRating] = useState(0);
  const [staffComment, setStaffComment] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  
  // History states
  const [submittedRatings, setSubmittedRatings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadAvailableRentals();
    loadSubmittedRatings();
  }, []);

  const loadAvailableRentals = async () => {
    try {
      setLoading(true);
      
      // GET /api/renter/rentals/all - Get completed rentals that can be rated
      const response = await renterService.rentals.getAll();
      const completedRentals = (response.data || []).filter(rental => 
        (rental.status === 'completed' || rental.status === 'returned') && !rental.hasRating
      );
      setAvailableRentals(completedRentals);
    } catch (err) {
      setError('Không thể tải danh sách chuyến đi');
    } finally {
      setLoading(false);
    }
  };

  const loadSubmittedRatings = async () => {
    try {
      // TODO: Implement API to get submitted ratings history
      // For now, keep mock data as there's no specific endpoint for ratings history
      const mockRatings = [
        {
          id: 1,
          type: 'rental',
          rentalId: 4,
          vehicleModel: 'VinFast Klara S',
          licensePlate: '51F-99999',
          rating: 5,
          comment: 'Xe rất tốt, pin bền, chạy êm ái',
          submittedAt: '2024-09-22T10:30:00Z',
          status: 'submitted'
        },
        {
          id: 2,
          type: 'staff',
          rentalId: 4,
          staffName: 'Nguyễn Văn D',
          staffRole: 'Nhân viên giao xe',
          rating: 4,
          comment: 'Nhân viên nhiệt tình, hướng dẫn chi tiết',
          submittedAt: '2024-09-22T10:35:00Z',
          status: 'submitted'
        },
        {
          id: 3,
          type: 'rental',
          rentalId: 5,
          vehicleModel: 'VinFast Theon S',
          licensePlate: '51F-88888',
          rating: 3,
          comment: 'Xe ổn nhưng pin hơi yếu',
          submittedAt: '2024-09-19T15:20:00Z',
          status: 'submitted'
        }
      ];
      
      setSubmittedRatings(mockRatings);
    } catch (err) {
      setError('Không thể tải lịch sử đánh giá');
    }
  };

  const submitRentalRating = async () => {
    if (!selectedRental || rentalRating === 0) {
      setError('Vui lòng chọn chuyến đi và đánh giá');
      return;
    }

    try {
      setLoading(true);
      
      // POST /api/renter/rating/trip
      const requestBody = {
        rentalId: parseInt(selectedRental),
        rating: rentalRating,
        comment: rentalComment || undefined
      };
      
      const response = await renterService.ratings.submitTrip(requestBody);
      
      // Reset form
      setSelectedRental('');
      setRentalRating(0);
      setRentalComment('');
      
      // Reload data
      await loadAvailableRentals();
      await loadSubmittedRatings();
      
      alert('Đánh giá dịch vụ thành công!');
    } catch (err) {
      setError('Không thể gửi đánh giá dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const submitStaffRating = async () => {
    if (!selectedRental || !selectedStaff || staffRating === 0) {
      setError('Vui lòng chọn đầy đủ thông tin và đánh giá');
      return;
    }

    try {
      setLoading(true);
      
      // POST /api/renter/rating/staff
      const requestBody = {
        rentalId: parseInt(selectedRental),
        staffId: parseInt(selectedStaff),
        rating: staffRating,
        comment: staffComment || undefined
      };
      
      const response = await renterService.ratings.submitStaff(requestBody);
      
      // Reset form
      setSelectedStaff('');
      setStaffRating(0);
      setStaffComment('');
      
      // Reload data
      await loadAvailableRentals();
      await loadSubmittedRatings();
      
      alert('Đánh giá nhân viên thành công!');
    } catch (err) {
      setError('Không thể gửi đánh giá nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, readOnly = false, size = 'w-6 h-6' }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          onClick={() => !readOnly && onRatingChange(star)}
          disabled={readOnly}
        >
          <Star className={`${size} ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  );

  const getRatingBadge = (rating) => {
    if (rating >= 4) return <Badge className="bg-green-100 text-green-800">Rất tốt</Badge>;
    if (rating >= 3) return <Badge className="bg-yellow-100 text-yellow-800">Tốt</Badge>;
    if (rating >= 2) return <Badge className="bg-orange-100 text-orange-800">Khá</Badge>;
    return <Badge className="bg-red-100 text-red-800">Cần cải thiện</Badge>;
  };

  const getSelectedRentalInfo = () => {
    return availableRentals.find(r => r.id.toString() === selectedRental);
  };

  const filteredRatings = submittedRatings.filter(rating => {
    const matchesSearch = searchTerm === '' || 
      rating.vehicleModel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rating.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rating.staffName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rating.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || rating.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Award className="h-8 w-8 mr-3 text-orange-600" />
            Đánh giá & Phản hồi
          </h1>
          <p className="text-gray-600 mt-2">
            Chia sẻ trải nghiệm và đánh giá dịch vụ thuê xe
          </p>
        </div>
        
        <Button
          onClick={() => {
            loadAvailableRentals();
            loadSubmittedRatings();
          }}
          variant="outline"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="submit" className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Gửi đánh giá
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Lịch sử đánh giá
          </TabsTrigger>
        </TabsList>

        {/* Submit Rating Tab */}
        <TabsContent value="submit" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rental Rating */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="h-5 w-5 mr-2" />
                  Đánh giá dịch vụ thuê xe
                </CardTitle>
                <CardDescription>
                  Đánh giá chất lượng xe và trải nghiệm thuê xe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Chọn chuyến đi</label>
                  <Select value={selectedRental} onValueChange={setSelectedRental}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn chuyến đi đã hoàn thành" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRentals.map(rental => (
                        <SelectItem key={rental.id} value={rental.id.toString()}>
                          {rental.licensePlate} - {rental.vehicleModel} 
                          ({new Date(rental.endTime).toLocaleDateString('vi-VN')})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Đánh giá</label>
                  <div className="flex items-center space-x-2">
                    <StarRating rating={rentalRating} onRatingChange={setRentalRating} />
                    <span className="text-sm text-gray-600">
                      {rentalRating > 0 && `${rentalRating}/5 sao`}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Nhận xét (tùy chọn)</label>
                  <Textarea
                    value={rentalComment}
                    onChange={(e) => setRentalComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn về chất lượng xe, độ tiện lợi..."
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={submitRentalRating}
                  disabled={loading || !selectedRental || rentalRating === 0}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Gửi đánh giá dịch vụ
                </Button>
              </CardContent>
            </Card>

            {/* Staff Rating */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Đánh giá nhân viên
                </CardTitle>
                <CardDescription>
                  Đánh giá chất lượng phục vụ của nhân viên giao/nhận xe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Chọn chuyến đi</label>
                  <Select value={selectedRental} onValueChange={setSelectedRental}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn chuyến đi đã hoàn thành" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRentals.map(rental => (
                        <SelectItem key={rental.id} value={rental.id.toString()}>
                          {rental.licensePlate} - {rental.vehicleModel}
                          ({new Date(rental.endTime).toLocaleDateString('vi-VN')})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedRental && getSelectedRentalInfo() && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium">Nhân viên phụ trách:</p>
                    <p className="text-sm text-gray-600">
                      {getSelectedRentalInfo().staff.name} - {getSelectedRentalInfo().staff.role}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">Đánh giá</label>
                  <div className="flex items-center space-x-2">
                    <StarRating rating={staffRating} onRatingChange={setStaffRating} />
                    <span className="text-sm text-gray-600">
                      {staffRating > 0 && `${staffRating}/5 sao`}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Nhận xét (tùy chọn)</label>
                  <Textarea
                    value={staffComment}
                    onChange={(e) => setStaffComment(e.target.value)}
                    placeholder="Chia sẻ về thái độ phục vụ, sự nhiệt tình, chuyên nghiệp..."
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={submitStaffRating}
                  disabled={loading || !selectedRental || !getSelectedRentalInfo()?.staff || staffRating === 0}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Gửi đánh giá nhân viên
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Tìm kiếm và lọc
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Tìm theo xe, nhân viên, nội dung..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Loại đánh giá" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="rental">Dịch vụ thuê xe</SelectItem>
                    <SelectItem value="staff">Nhân viên</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                  }}
                  variant="outline"
                >
                  Xóa lọc
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ratings List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Lịch sử đánh giá ({filteredRatings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredRatings.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chưa có đánh giá nào
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm || filterType !== 'all' 
                      ? 'Không tìm thấy đánh giá nào phù hợp.'
                      : 'Bạn chưa gửi đánh giá nào.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRatings.map((rating) => (
                    <div key={rating.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge variant={rating.type === 'rental' ? 'default' : 'secondary'}>
                            {rating.type === 'rental' ? 'Dịch vụ' : 'Nhân viên'}
                          </Badge>
                          {getRatingBadge(rating.rating)}
                          <div className="flex items-center">
                            <StarRating rating={rating.rating} readOnly size="w-4 h-4" />
                            <span className="ml-2 text-sm font-medium">{rating.rating}/5</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center text-green-600 mb-1">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-xs">Đã gửi</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(rating.submittedAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Đối tượng đánh giá:</p>
                          <p className="font-medium">
                            {rating.type === 'rental' 
                              ? `${rating.vehicleModel} (${rating.licensePlate})`
                              : `${rating.staffName} - ${rating.staffRole}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Mã chuyến:</p>
                          <p className="font-medium">#{rating.rentalId}</p>
                        </div>
                      </div>
                      
                      {rating.comment && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-gray-600 text-sm mb-1">Nhận xét:</p>
                          <p className="text-sm italic">"{rating.comment}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RatingsPage;