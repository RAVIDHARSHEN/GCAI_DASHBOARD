// src/components/LoginPage.js
import React, { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (key === "gcai-admin") {
      onLogin();
    } else {
      setError("Invalid license key. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-900 text-white">
      <div className="bg-blue-800 p-10 rounded-2xl shadow-xl w-full max-w-md space-y-6">
        {/* Logo + Title */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div className="bg-white text-blue-900 font-bold px-3 py-2 rounded-md text-lg">GCAI</div>
            <h1 className="text-2xl font-bold">GCAI Technologies Ltd</h1>
          </div>
          <p className="text-gray-200">Enter your license key</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="License Key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold transition"
          >
            Log in
          </button>
        </form>

        {/* Error */}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {/* Footer */}
        <div className="text-center text-sm text-gray-300">
          Don’t have a license key?
        </div>
      </div>
    </div>
  );
}
