import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import JournalDoodles from "./components/JournalDoodles";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Journal from "./pages/Journal";
import NewEntry from "./pages/NewEntry";
import ViewEntry from "./pages/ViewEntry";
import EditEntry from "./pages/EditEntry";
import History from "./pages/History";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <JournalDoodles />
          <Navbar />
          <div className="app-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />

              {/* Protected Journal Routes */}
              <Route
                path="/journal"
                element={
                  <ProtectedRoute>
                    <Journal />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/new"
                element={
                  <ProtectedRoute>
                    <NewEntry />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/entry/:id"
                element={
                  <ProtectedRoute>
                    <ViewEntry />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/entry/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditEntry />
                  </ProtectedRoute>
                }
              />

              {/* Fallback redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}