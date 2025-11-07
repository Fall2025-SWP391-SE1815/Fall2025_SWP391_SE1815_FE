import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

const DashboardLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                {/* Sidebar navigation would go here */}
                <nav className="w-64 bg-white shadow-sm">
                    <div className="p-4">
                        <h2 className="text-lg font-semibold">Dashboard</h2>
                    </div>
                </nav>

                {/* Main content */}
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
            <Toaster />
        </div>
    );
};

export default DashboardLayout;