import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ItemsPage from './pages/ItemsPage';
import ItemForm from './pages/ItemForm';
import LoginPage from './pages/LoginPage';
import ItemDetails from './pages/ItemDetails';
import CategoriesPage from './pages/CategoriesPage';
import SuppliersPage from './pages/SuppliersPage';
import UsersPage from './pages/UsersPage';
import RolesPage from './pages/RolesPage';
import SettingsPage from './pages/SettingsPage';
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* All routes under Layout */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route 
            path="/items" 
            element={
              <PrivateRoute>
                <Layout>
                  <ItemsPage />
                </Layout>
              </PrivateRoute>
            } 
          />
          <Route
            path="/items/new"
            element={
              <PrivateRoute>
                <Layout>
                  <ItemForm />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/items/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <ItemDetails />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/items/:id/edit"
            element={
              <PrivateRoute>
                <Layout>
                  <ItemForm />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route 
            path="/categories" 
            element={
              <PrivateRoute>
                <Layout>
                  <CategoriesPage />
                </Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/suppliers" 
            element={
              <PrivateRoute>
                <Layout>
                  <SuppliersPage />
                </Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <PrivateRoute>
                <Layout>
                  <UsersPage />
                </Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/roles" 
            element={
              <PrivateRoute>
                <Layout>
                  <RolesPage />
                </Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <PrivateRoute>
                <Layout>
                  <SettingsPage />
                </Layout>
              </PrivateRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
