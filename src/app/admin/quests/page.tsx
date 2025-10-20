'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Quest, QuestCategory } from '@/types/types';
import { getAllQuests, deleteQuest, getQuestStats } from '@/lib/database';
import { toast } from 'sonner';
import CreateQuestModal from '@/components/admin/CreateQuestModal';
import EditQuestModal from '@/components/admin/EditQuestModal';

export default function QuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [filteredQuests, setFilteredQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<QuestCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [questStats, setQuestStats] = useState<Record<string, { completedCount: number; rewardsClaimed: number }>>({});

  useEffect(() => {
    loadQuests();
  }, []);

  useEffect(() => {
    filterQuests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quests, searchTerm, categoryFilter, statusFilter]);

  const loadQuests = async () => {
    try {
      setLoading(true);
      const questsData = await getAllQuests();
      setQuests(questsData);

      // Load stats for each quest
      const stats: Record<string, { completedCount: number; rewardsClaimed: number }> = {};
      for (const quest of questsData) {
        stats[quest.id] = await getQuestStats(quest.id);
      }
      setQuestStats(stats);
    } catch (error) {
      console.error('Error loading quests:', error);
      toast.error('Failed to load quests');
    } finally {
      setLoading(false);
    }
  };

  const filterQuests = () => {
    let filtered = quests;

    if (searchTerm) {
      filtered = filtered.filter(quest =>
        quest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quest.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(quest => quest.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(quest => 
        statusFilter === 'active' ? quest.isActive : !quest.isActive
      );
    }

    setFilteredQuests(filtered);
  };

  const handleDelete = async (questId: string) => {
    if (!confirm('Are you sure you want to delete this quest? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteQuest(questId);
      toast.success('Quest deleted successfully');
      await loadQuests();
    } catch (error) {
      console.error('Error deleting quest:', error);
      toast.error('Failed to delete quest');
    }
  };

  const handleEdit = (quest: Quest) => {
    setSelectedQuest(quest);
    setShowEditModal(true);
  };

  const handleCreateSuccess = async () => {
    setShowCreateModal(false);
    await loadQuests();
    toast.success('Quest created successfully');
  };

  const handleEditSuccess = async () => {
    setShowEditModal(false);
    setSelectedQuest(null);
    await loadQuests();
    toast.success('Quest updated successfully');
  };

  const getCategoryColor = (category: QuestCategory) => {
    const colors: Record<QuestCategory, string> = {
      profile_setup: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      club_participation: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      social: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      gaming_achievements: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      special: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    };
    return colors[category];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quests...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-background py-8">
        <div className="container max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Quest Management</h1>
              <p className="text-muted-foreground">Create and manage quests for your gaming club</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Quest
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Input
              placeholder="Search quests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:col-span-2"
            />
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as QuestCategory | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="profile_setup">Profile Setup</SelectItem>
                <SelectItem value="club_participation">Club Participation</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="gaming_achievements">Gaming Achievements</SelectItem>
                <SelectItem value="special">Special</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'inactive')}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quests List */}
          <div className="space-y-4">
            {filteredQuests.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">No quests found</p>
                  <Button onClick={() => setShowCreateModal(true)} variant="outline">
                    Create your first quest
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredQuests.map((quest) => (
                <Card key={quest.id} className={!quest.isActive ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle>{quest.name}</CardTitle>
                          <Badge variant={quest.isActive ? 'default' : 'secondary'}>
                            {quest.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge className={getCategoryColor(quest.category)}>
                            {quest.category.replace('_', ' ')}
                          </Badge>
                        </div>
                        <CardDescription>{quest.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(quest)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(quest.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Reward</p>
                        <p className="font-semibold">${(quest.rewardCents / 100).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-semibold capitalize">{quest.type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Requirement</p>
                        <p className="font-semibold">{quest.requirementTarget} {quest.requirementType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tracking</p>
                        <p className="font-semibold text-xs">{quest.trackingKey}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="font-semibold">{questStats[quest.id]?.completedCount || 0} users</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateQuestModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {showEditModal && selectedQuest && (
        <EditQuestModal
          isOpen={showEditModal}
          quest={selectedQuest}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </ProtectedRoute>
  );
}

