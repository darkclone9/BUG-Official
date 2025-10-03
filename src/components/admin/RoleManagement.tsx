'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Users, Search, Plus, X } from 'lucide-react';
import { getAllUsers, updateUserRoles, getGameGenres } from '@/lib/database';
import { User, UserRole, GameGenre } from '@/types/types';
import Image from 'next/image';

const STANDARD_ROLES: UserRole[] = [
  'admin',
  'member',
  'guest',
  'event_organizer',
  'officer',
  'president',
  'vice_president',
  'treasurer',
];

export default function RoleManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [gameGenres, setGameGenres] = useState<GameGenre[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredUsers(
        users.filter(user =>
          user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, genresData] = await Promise.all([
        getAllUsers(),
        getGameGenres(),
      ]);
      setUsers(usersData);
      setFilteredUsers(usersData);
      setGameGenres(genresData.filter(g => g.isActive));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles || [user.role]); // Use roles array or fallback to single role
    setModalOpen(true);
  };

  const handleRoleToggle = (role: UserRole) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      await updateUserRoles(selectedUser.uid, selectedRoles);
      await loadData();
      setModalOpen(false);
      setSelectedUser(null);
      setSelectedRoles([]);
    } catch (error) {
      console.error('Error updating roles:', error);
      alert('Failed to update roles');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeColor = (role: UserRole): string => {
    if (role === 'admin') return 'bg-red-500';
    if (role === 'president') return 'bg-purple-500';
    if (role === 'vice_president') return 'bg-purple-400';
    if (role === 'treasurer') return 'bg-green-500';
    if (role === 'event_organizer') return 'bg-blue-500';
    if (role === 'officer') return 'bg-cyan-500';
    if (role.endsWith('_officer')) return 'bg-orange-500';
    return 'bg-gray-500';
  };

  const formatRoleName = (role: UserRole): string => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Generate game genre officer roles
  const gameGenreOfficerRoles: UserRole[] = gameGenres.map(
    genre => `${genre.id}_officer` as UserRole
  );

  const allAvailableRoles = [...STANDARD_ROLES, ...gameGenreOfficerRoles];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Loading role management...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.roles?.includes('admin') || u.role === 'admin').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Event Organizers</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.roles?.includes('event_organizer')).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle>User Role Management</CardTitle>
          <CardDescription>Assign and manage user roles</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Users Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.displayName}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium">{user.displayName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(user.roles || [user.role]).map((role) => (
                        <Badge
                          key={role}
                          className={`${getRoleBadgeColor(role)} text-white text-xs`}
                        >
                          {formatRoleName(role)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openRoleModal(user)}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      Manage Roles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role Assignment Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Roles for {selectedUser?.displayName}</DialogTitle>
            <DialogDescription>
              Select the roles to assign to this user
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Standard Roles */}
            <div>
              <h3 className="font-semibold mb-3">Standard Roles</h3>
              <div className="grid grid-cols-2 gap-3">
                {STANDARD_ROLES.map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={role}
                      checked={selectedRoles.includes(role)}
                      onCheckedChange={() => handleRoleToggle(role)}
                    />
                    <Label htmlFor={role} className="cursor-pointer flex-1">
                      <Badge className={`${getRoleBadgeColor(role)} text-white`}>
                        {formatRoleName(role)}
                      </Badge>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Game Genre Officer Roles */}
            {gameGenreOfficerRoles.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Game Genre Officer Roles</h3>
                <div className="grid grid-cols-2 gap-3">
                  {gameGenreOfficerRoles.map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={role}
                        checked={selectedRoles.includes(role)}
                        onCheckedChange={() => handleRoleToggle(role)}
                      />
                      <Label htmlFor={role} className="cursor-pointer flex-1">
                        <Badge className={`${getRoleBadgeColor(role)} text-white`}>
                          {formatRoleName(role)}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveRoles} disabled={saving}>
              {saving ? 'Saving...' : 'Save Roles'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
