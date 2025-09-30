import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Car,
  MapPin,
  DollarSign,
  Activity,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  Calendar,
  UserCheck,
  BarChart3,
  Monitor,
  Shield,
  UserCog
} from 'lucide-react';
import { apiClient } from '@/lib/api/apiClient';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
    </div>
  );
}

export default AdminDashboard;