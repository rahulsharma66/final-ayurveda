import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Categories from "./pages/Categories";
import Products from "./pages/Product";
import Ingredients from "./pages/Ingredients";
import AdminUsers from "./pages/AdminUsers";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Categories Route */}
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Categories />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Product Route */}
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Products />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Ingredients Route */}
        <Route
          path="/ingredients"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Ingredients />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Users Route */}
        <Route
          path="/admins"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;