// src/pages/student/StudentDashboard.tsx
import React from "react";
import useAuth from "../../hooks/useAuth";

export default function StudentDashboard() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;
  return (
    <div>
      <h2 className="text-xl font-semibold">Your Dashboard</h2>
      <p>Welcome, {user.displayName || user.email}</p>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded">Profile quick links</div>
        <div className="bg-white p-4 rounded">Resume & sync</div>
      </div>
    </div>
  );
}
