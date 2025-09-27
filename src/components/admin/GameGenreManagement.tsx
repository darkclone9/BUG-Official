'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff, Gamepad2 } from 'lucide-react';
import { toast } from 'sonner';
import { GameGenre } from '@/types/types';
import {
  createGameGenre,
  getGameGenres,
  updateGameGenre,
  deleteGameGenre,
  reorderGameGenres
} from '@/lib/database';

interface GameGenreFormData {
  name: string;
  displayName: string;
  description: string;
  isActive: boolean;
  color?: string;
  iconUrl?: string;
}

export default function GameGenreManagement() {
  const [genres, setGenres] = useState<GameGenre[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<GameGenre | null>(null);
  const [formData, setFormData] = useState<GameGenreFormData>({
    name: '',
    displayName: '',
    description: '',
    isActive: true,
    color: '',
    iconUrl: ''
  });

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    try {
      setLoading(true);
      const genreData = await getGameGenres(false); // Load all genres including inactive
      setGenres(genreData);
    } catch (error) {
      console.error('Error loading game genres:', error);
      toast.error('Failed to load game genres');
    } finally {
      setLoading(false);
    }
  };

  const populateDefaultGenres = async () => {
    const defaultGenres = [
      {
        name: 'mario_kart',
        displayName: 'Mario Kart',
        description: 'High-speed kart racing with power-ups and competitive multiplayer action',
        isActive: true,
        displayOrder: 1,
        color: '#FF6B6B',
        iconUrl: '',
        createdBy: 'admin'
      },
      {
        name: 'super_smash_bros',
        displayName: 'Super Smash Bros',
        description: 'Fighting game featuring Nintendo characters in epic battles',
        isActive: true,
        displayOrder: 2,
        color: '#4ECDC4',
        iconUrl: '',
        createdBy: 'admin'
      },
      {
        name: 'general',
        displayName: 'General Gaming',
        description: 'Mixed gaming events and general gaming activities',
        isActive: true,
        displayOrder: 3,
        color: '#45B7D1',
        iconUrl: '',
        createdBy: 'admin'
      }
    ];

    try {
      for (const genre of defaultGenres) {
        await createGameGenre(genre);
      }
      toast.success('Default genres created successfully!');
      loadGenres();
    } catch (error) {
      console.error('Error creating default genres:', error);
      toast.error('Failed to create default genres');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      description: '',
      isActive: true,
      color: '',
      iconUrl: ''
    });
  };

  const handleCreate = async () => {
    try {
      if (!formData.name.trim() || !formData.displayName.trim()) {
        toast.error('Name and display name are required');
        return;
      }

      // Check for duplicate names
      const existingGenre = genres.find(g =>
        g.name.toLowerCase() === formData.name.toLowerCase().trim()
      );
      if (existingGenre) {
        toast.error('A genre with this name already exists');
        return;
      }

      const genreData = {
        ...formData,
        name: formData.name.toLowerCase().trim().replace(/\s+/g, '_'),
        displayName: formData.displayName.trim(),
        description: formData.description.trim(),
        displayOrder: genres.length + 1,
        createdBy: 'current-admin-uid' // This should be replaced with actual admin UID
      };

      await createGameGenre(genreData);
      toast.success('Game genre created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      loadGenres();
    } catch (error) {
      console.error('Error creating game genre:', error);
      toast.error('Failed to create game genre');
    }
  };

  const handleEdit = async () => {
    try {
      if (!editingGenre || !formData.name.trim() || !formData.displayName.trim()) {
        toast.error('Name and display name are required');
        return;
      }

      // Check for duplicate names (excluding current genre)
      const existingGenre = genres.find(g =>
        g.id !== editingGenre.id &&
        g.name.toLowerCase() === formData.name.toLowerCase().trim()
      );
      if (existingGenre) {
        toast.error('A genre with this name already exists');
        return;
      }

      const updateData = {
        ...formData,
        name: formData.name.toLowerCase().trim().replace(/\s+/g, '_'),
        displayName: formData.displayName.trim(),
        description: formData.description.trim(),
      };

      await updateGameGenre(editingGenre.id, updateData);
      toast.success('Game genre updated successfully');
      setIsEditDialogOpen(false);
      setEditingGenre(null);
      resetForm();
      loadGenres();
    } catch (error) {
      console.error('Error updating game genre:', error);
      toast.error('Failed to update game genre');
    }
  };

  const handleDelete = async (genre: GameGenre) => {
    try {
      await deleteGameGenre(genre.id);
      toast.success('Game genre deactivated successfully');
      loadGenres();
    } catch (error) {
      console.error('Error deactivating game genre:', error);
      toast.error('Failed to deactivate game genre');
    }
  };

  const handleToggleActive = async (genre: GameGenre) => {
    try {
      await updateGameGenre(genre.id, { isActive: !genre.isActive });
      toast.success(`Game genre ${genre.isActive ? 'deactivated' : 'activated'} successfully`);
      loadGenres();
    } catch (error) {
      console.error('Error toggling genre status:', error);
      toast.error('Failed to update genre status');
    }
  };

  const openEditDialog = (genre: GameGenre) => {
    setEditingGenre(genre);
    setFormData({
      name: genre.name,
      displayName: genre.displayName,
      description: genre.description,
      isActive: genre.isActive,
      color: genre.color || '',
      iconUrl: genre.iconUrl || ''
    });
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading game genres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Game Genre Management</h2>
          <p className="text-muted-foreground">Manage available game genres for tournaments</p>
        </div>
        <div className="flex gap-2">
          {genres.length === 0 && !loading && (
            <Button variant="outline" onClick={populateDefaultGenres}>
              <Plus className="h-4 w-4 mr-2" />
              Populate Default Genres
            </Button>
          )}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Genre
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Game Genre</DialogTitle>
              <DialogDescription>
                Add a new game genre that can be used for tournaments
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Internal Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., mario_kart"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used internally, will be converted to lowercase with underscores
                </p>
              </div>
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g., Mario Kart"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the game genre"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create Genre</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Genres</CardTitle>
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{genres.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Genres</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{genres.filter(g => g.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Genres</CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{genres.filter(g => !g.isActive).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Genres Table */}
      <Card>
        <CardHeader>
          <CardTitle>Game Genres</CardTitle>
          <CardDescription>
            Manage game genres available for tournaments. Inactive genres are preserved for historical data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {genres.map((genre) => (
                <TableRow key={genre.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                      <span>{genre.displayOrder}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{genre.name}</TableCell>
                  <TableCell className="font-medium">{genre.displayName}</TableCell>
                  <TableCell className="max-w-xs truncate">{genre.description}</TableCell>
                  <TableCell>
                    <Badge variant={genre.isActive ? 'default' : 'secondary'}>
                      {genre.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(genre)}
                      >
                        {genre.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(genre)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deactivate Game Genre</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will deactivate "{genre.displayName}" but preserve it for historical tournament data.
                              Are you sure you want to continue?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(genre)}>
                              Deactivate
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Game Genre</DialogTitle>
            <DialogDescription>
              Update the game genre information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Internal Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., mario_kart"
              />
            </div>
            <div>
              <Label htmlFor="edit-displayName">Display Name</Label>
              <Input
                id="edit-displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="e.g., Mario Kart"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the game genre"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Update Genre</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
