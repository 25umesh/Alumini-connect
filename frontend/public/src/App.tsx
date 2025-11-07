// src/App.tsx
import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import OnboardConfirm from "./pages/auth/OnboardConfirm";

import StudentDashboard from "./pages/student/StudentDashboard";
import ProfileView from "./pages/student/ProfileView";
import ProfileEdit from "./pages/student/ProfileEdit";
import UploadResume from "./pages/student/UploadResume";
import ResumeReview from "./pages/student/ResumeReview";

import AdminDashboard from "./pages/admin/AdminDashboard";
import BulkUpload from "./pages/admin/BulkUpload";
import StudentDetail from "./pages/admin/StudentDetail";
import Announcements from "./pages/admin/Announcements";
import WebhookSettings from "./pages/admin/WebhookSettings";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/onboard/:token" element={<OnboardConfirm />} />

          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<ProfileView />} />
          <Route path="/student/profile/edit" element={<ProfileEdit />} />
          <Route path="/student/upload-resume" element={<UploadResume />} />
          <Route path="/student/resume-review/:id" element={<ResumeReview />} />

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/bulk" element={<BulkUpload />} />
          <Route path="/admin/students/:id" element={<StudentDetail />} />
          <Route path="/admin/announcements" element={<Announcements />} />
          <Route path="/admin/webhook" element={<WebhookSettings />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function Home() {
  return (
    <div className="prose">
      <h1>Alumni Connect</h1>
      <p>
        Welcome. Use <Link to="/auth/signin">Sign in</Link> or <Link to="/auth/signup">Sign up</Link>.
      </p>
    </div>
  );
}
