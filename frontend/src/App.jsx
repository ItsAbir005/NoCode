import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import AuthCallback from './components/AuthCallback';
import Dashboard from './components/Dashboard';
import ProjectEditor from './components/ProjectEditor';

function ProjectEditorWrapper() {
  const { id } = useParams();
  return <ProjectEditor projectId={id} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects/:id/edit" element={<ProjectEditorWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;