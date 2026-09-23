import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import LearnMore from "./pages/LearnMore.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Success from "./pages/Success.jsx";
import NotFound from "./pages/NotFound.jsx";
import Products from "./pages/Products.jsx";
import Checkout from "./pages/Checkout.jsx";
import EditProfile from "./pages/EditProfile.jsx";

import UserDashboard from "./pages/user/UserDashboard.jsx";
import SendRequest from "./pages/user/SendRequest.jsx";
import Rewards from "./pages/user/Rewards.jsx";

import CollectorDashboard from "./pages/collector/CollectorDashboard.jsx";
import PendingTasks from "./pages/collector/PendingTasks.jsx";
import CompletedTasks from "./pages/collector/CompletedTasks.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AllUsers from "./pages/admin/AllUsers.jsx";
import AllCollectors from "./pages/admin/AllCollectors.jsx";
import ManageRewards from "./pages/admin/ManageRewards.jsx";
import Feedback from "./pages/admin/Feedback.jsx";

// Route paths are the old file names without ".html" (home.html → /home), so the
// `redirectTo` values your backend already sends keep working. "/whatever.html" is redirected
// to "/whatever" by <NotFound />.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* public */}
      <Route path="/home" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/learnMore" element={<LearnMore />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* user */}
      <Route path="/userDashboard" element={<UserDashboard />} />
      <Route path="/request" element={<SendRequest />} />
      <Route path="/rewards" element={<Rewards />} />
      <Route path="/products" element={<Products />} />
      <Route path="/checkouts" element={<Checkout />} />
      <Route path="/success" element={<Success />} />

      {/* any signed-in role */}
      <Route path="/editProfile" element={<EditProfile />} />

      {/* collector */}
      <Route path="/collectorDashboard" element={<CollectorDashboard />} />
      <Route path="/pendingTasks" element={<PendingTasks />} />
      <Route path="/completedTasks" element={<CompletedTasks />} />

      {/* admin */}
      <Route path="/adminDashboard" element={<AdminDashboard />} />
      <Route path="/allUsers" element={<AllUsers />} />
      <Route path="/allCollectors" element={<AllCollectors />} />
      <Route path="/manageRewards" element={<ManageRewards />} />
      <Route path="/feedback" element={<Feedback />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
