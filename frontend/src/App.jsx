import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Tasks from "@/pages/Tasks";
import Reminders from "@/pages/Reminders";
import Profile from "@/pages/Profile";
import Toaster from "@/components/Toaster";

function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Navbar />
      <main className="ml-60 flex-1 p-8 max-w-[1200px]">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index                element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"   element={<Dashboard />} />
              <Route path="/tasks"       element={<Tasks />} />
              <Route path="/reminders"   element={<Reminders />} />
              <Route path="/profile"     element={<Profile />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
