import { BrowserRouter, Routes, Route, Navigate } from "react-router";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<div>Login Page (TODO)</div>} />
        <Route path="/register" element={<div>Register Page (TODO)</div>} />
        <Route path="/dashboard" element={<div>Dashboard (TODO)</div>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
