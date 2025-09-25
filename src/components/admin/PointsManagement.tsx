'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Coins, 
  Plus, 
  Search, 
  Award,
  TrendingUp,
  Users
} from 'lucide-react';
import { getAllUsers, awardPoints } from '@/lib/database';
import { User } from '@/types/types';
import Image from 'next/image';


export default function PointsManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [awardModalOpen, setAwardModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [awardForm, setAwardForm] = useState({
    amount: 0,
    reason: '',
  });
  const [awardLoading, setAwardLoading] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const usersData = await getAllUsers();
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleAwardPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setAwardLoading(true);
    try {
      await awardPoints(
        selectedUser.uid,
        awardForm.amount,
        awardForm.reason,
        'admin' // This should be the current admin's ID
      );

      // Refresh users data
      const usersData = await getAllUsers();
      setUsers(usersData);
      setFilteredUsers(usersData);

      setAwardModalOpen(false);
      setSelectedUser(null);
      setAwardForm({ amount: 0, reason: '' });
    } catch (error) {
      console.error('Error awarding points:', error);
    } finally {
      setAwardLoading(false);
    }
  };

  const openAwardModal = (user: User) => {
    setSelectedUser(user);
    setAwardModalOpen(true);
  };

  const getTotalPoints = () => {
    return users.reduce((sum, user) => sum + user.points, 0);
  };

  const getAveragePoints = () => {
    return users.length > 0 ? Math.round(getTotalPoints() / users.length) : 0;
  };

  const getTopPerformers = () => {
    return users
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse bg-slate-800 h-8 w-64 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-800 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Points Management</h2>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white w-64"
            />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Total Points</p>
                <p className="text-2xl font-bold">{getTotalPoints().toLocaleString()}</p>
                <p className="text-xs text-gray-400">across all users</p>
              </div>
              <Coins className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Average Points</p>
                <p className="text-2xl font-bold">{getAveragePoints()}</p>
                <p className="text-xs text-gray-400">per user</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Active Users</p>
                <p className="text-2xl font-bold">{users.filter(u => u.isActive).length}</p>
                <p className="text-xs text-gray-400">out of {users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card className="bg-slate-800/50 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2 text-yellow-400" />
            Top Performers
          </CardTitle>
          <CardDescription className="text-gray-300">
            Users with the highest points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getTopPerformers().map((user, index) => (
              <div key={user.uid} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-slate-600 rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-white">{user.displayName}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {user.points} points
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                    onClick={() => openAwardModal(user)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Award
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-slate-800/50 border-slate-700 text-white">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription className="text-gray-300">
            Manage points for all users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-gray-300">User</TableHead>
                <TableHead className="text-gray-300">Email</TableHead>
                <TableHead className="text-gray-300">Points</TableHead>
                <TableHead className="text-gray-300">Role</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.uid} className="border-slate-700">
                  <TableCell className="text-white">
                    <div className="flex items-center space-x-3">
                      {user.avatar ? (
                        <Image 
                          src={user.avatar} 
                          alt={user.displayName}
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {user.displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span>{user.displayName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{user.email}</TableCell>
                  <TableCell className="text-gray-300">{user.points}</TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        user.role === 'admin' 
                          ? 'bg-red-600 text-white' 
                          : 'bg-blue-600 text-white'
                      }
                    >
                      {user.role === 'admin' ? 'Admin' : 'Member'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                      onClick={() => openAwardModal(user)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Award Points
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Award Points Modal */}
      <Dialog open={awardModalOpen} onOpenChange={setAwardModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Award Points</DialogTitle>
            <DialogDescription>
              Award points to {selectedUser?.displayName}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAwardPoints} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                value={awardForm.amount}
                onChange={(e) => setAwardForm(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                placeholder="Enter points to award"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={awardForm.reason}
                onChange={(e) => setAwardForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Enter reason for awarding points"
                rows={3}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAwardModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={awardLoading}>
                {awardLoading ? 'Awarding...' : 'Award Points'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}