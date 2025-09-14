import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Profile } from '@/lib/supabase'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: Profile['role']
  fallbackPath?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallbackPath = '/signin'
}) => {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // Redirect to sign in if not authenticated
  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />
  }

  // Check role requirements if specified
  if (requiredRole && profile?.role !== requiredRole) {
    // Redirect to appropriate page based on user's role
    let redirectPath = '/'
    
    switch (profile?.role) {
      case 'admin':
        redirectPath = '/admin'
        break
      case 'donor':
        redirectPath = '/surplus'
        break
      case 'volunteer':
        redirectPath = '/volunteer'
        break
      case 'recipient':
        redirectPath = '/hubs'
        break
      default:
        redirectPath = '/'
    }
    
    return <Navigate to={redirectPath} replace />
  }

  return <>{children}</>
}

// Convenience components for specific roles
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="admin" fallbackPath="/signin">
    {children}
  </ProtectedRoute>
)

export const DonorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="donor" fallbackPath="/signin">
    {children}
  </ProtectedRoute>
)

export const VolunteerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="volunteer" fallbackPath="/signin">
    {children}
  </ProtectedRoute>
)

export const RecipientRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="recipient" fallbackPath="/signin">
    {children}
  </ProtectedRoute>
) 