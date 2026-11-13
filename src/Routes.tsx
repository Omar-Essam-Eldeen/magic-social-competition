import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Auth/Login.tsx";
import Signup from "./pages/Auth/Signup.tsx";
import { RootSwitch } from "./pages/Landing/Landing.tsx";
import { GuestRoute, ProtectedRoute } from "./components/Guards/ProtectedRoutes.tsx";
import PostDetails from "./pages/Posts/PostDetails.tsx";
import TagPage from "./pages/Posts/TagPage.tsx";
import Profile from "./pages/Profile/Profile.tsx";
import Bookmarks from "./pages/Posts/Bookmarks.tsx";
import Notifications from "./pages/Notifications/Notifications.tsx";
import UserProfile from "./pages/Users/UserProfile.tsx";
import Explore from "./pages/Explore/Explore.tsx";

export default function AppRoutes() {
  return (
    <Routes>
      {/* "/" is public: RootSwitch shows the feed when logged in, the landing page otherwise. */}
      <Route path="/" element={<RootSwitch />} />
      <Route
        path="/signup"
        element={
          <GuestRoute>
            <Signup />
          </GuestRoute>
        }
      />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/posts/:id"
        element={
          <ProtectedRoute>
            <PostDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tags/:tag"
        element={
          <ProtectedRoute>
            <TagPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookmarks"
        element={
          <ProtectedRoute>
            <Bookmarks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/explore"
        element={
          <ProtectedRoute>
            <Explore />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:id"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
