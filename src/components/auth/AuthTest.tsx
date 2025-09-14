import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const AuthTest: React.FC = () => {
  const { 
    user, 
    profile, 
    loading, 
    signOut, 
    isAdmin, 
    isDonor, 
    isRecipient, 
    isVolunteer 
  } = useAuth()

  if (loading) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading authentication status...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
          <CardDescription>You are not signed in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Badge variant="destructive">Not Authenticated</Badge>
            </div>
            <p className="text-sm text-gray-600">
              Please sign in to access your account and profile information.
            </p>
            <Button 
              onClick={() => window.location.href = '/signin'}
              className="w-full"
            >
              Go to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Authentication Status</CardTitle>
        <CardDescription>You are successfully signed in</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge variant="default" className="bg-green-600">Authenticated</Badge>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">User Information:</p>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email Verified:</strong> {user.email_confirmed_at ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {profile && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Profile Information:</p>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Full Name:</strong> {profile.full_name || 'Not set'}</p>
                <p><strong>Role:</strong> {profile.role}</p>
                <p><strong>Phone:</strong> {profile.phone || 'Not set'}</p>
                <p><strong>City:</strong> {profile.city || 'Not set'}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">Role Permissions:</p>
            <div className="flex flex-wrap gap-2">
              {isAdmin && <Badge variant="secondary">Admin</Badge>}
              {isDonor && <Badge variant="secondary">Donor</Badge>}
              {isRecipient && <Badge variant="secondary">Recipient</Badge>}
              {isVolunteer && <Badge variant="secondary">Volunteer</Badge>}
            </div>
          </div>

          <Button 
            onClick={signOut}
            variant="outline"
            className="w-full"
          >
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 