import { useEffect, useState } from 'react'
import { apiService } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

type ProfileRole = 'donor' | 'recipient' | 'volunteer' | 'admin'

type ProfileRow = {
  id: string
  email: string
  full_name: string
  role: ProfileRole
  is_active: boolean | null
  created_at: string
}

export default function AdminUsers() {
  const [items, setItems] = useState<ProfileRow[]>([])
  const [loading, setLoading] = useState(true)
  const [meId, setMeId] = useState<string | null>(null)
  const { toast } = useToast()

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('id,email,full_name,role,is_active,created_at')
      .order('created_at', { ascending: false })
    if (error) {
      toast({ title: 'Error loading users', description: error.message, variant: 'destructive' })
    } else {
      setItems((data || []) as ProfileRow[])
    }
    setLoading(false)
  }

  useEffect(() => {
    // who am I? (used to block self-demotion/deactivation)
    supabase.auth.getUser().then(({ data }) => setMeId(data.user?.id ?? null))
    load()
  }, [])

  const promote = async (email: string) => {
    try {
      await apiService.promoteUserByEmail(email)
      toast({ title: 'Promoted to admin' })
      load()
    } catch (e: any) {
      toast({ title: 'Failed', description: e.message, variant: 'destructive' })
    }
  }

  const demote = async (id: string, email: string) => {
    if (id === meId) {
      toast({ title: "You can't demote yourself", variant: 'destructive' })
      return
    }
    try {
      await apiService.demoteUserByEmail(email) // demotes to a valid non-admin role (e.g. 'recipient')
      toast({ title: 'Demoted' })
      load()
    } catch (e: any) {
      toast({ title: 'Failed', description: e.message, variant: 'destructive' })
    }
  }

  const deactivateUser = async (id: string, email: string) => {
    if (id === meId) {
      toast({ title: "You can't deactivate yourself", variant: 'destructive' })
      return
    }
    if (!confirm(`Deactivate ${email}? They will lose access.`)) return
    try {
      await apiService.deactivateUserById(id) // soft delete via RPC
      toast({ title: 'User deactivated' })
      load()
    } catch (e: any) {
      toast({ title: 'Failed', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle>Users</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading…</p>
        ) : (
          <div className="space-y-2">
            {items.map((u) => (
              <div key={u.id} className="flex items-center justify-between border p-3 rounded">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    <span>{u.full_name || '(no name)'}</span>
                    {u.role === 'admin' && (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">admin</span>
                    )}
                    {u.is_active === false && (
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">inactive</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">{u.email}</div>
                </div>
                <div className="flex gap-2">
                  {u.role !== 'admin' ? (
                    <Button variant="secondary" onClick={() => promote(u.email)}>
                      Promote
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      disabled={u.id === meId}
                      onClick={() => demote(u.id, u.email)}
                    >
                      Demote
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    disabled={u.id === meId}
                    onClick={() => deactivateUser(u.id, u.email)}
                  >
                    Deactivate
                  </Button>
                </div>
              </div>
            ))}
            {!items.length && <p className="text-sm text-gray-600">No users yet.</p>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
