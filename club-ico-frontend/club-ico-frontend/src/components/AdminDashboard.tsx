import { useState, useEffect } from 'react';
import AdminPage from '@/pages/admin_page';

const AdminDashboard: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (window.location.href.includes('/admin/dashboard')) {
      setIsAdmin(true);
    }
  }, []);

  if (!isAdmin) {
    return <p>You are not authorized to access this page.</p>;
  }

  return (
    <div className="container mx-auto p-4 pt-6 md:p-6 lg:p-12">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome, admin!</p>
      <AdminPage/>
    </div>
  );
};

export default AdminDashboard;