'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Target, Calendar, User, TrendingUp, CheckCircle, AlertCircle, Plus, Search, BarChart3, ArrowLeft } from 'lucide-react';

interface Goal {
  id: number;
  title: string;
  description: string;
  goal_type: string;
  period: string;
  target_value: number;
  current_value: number;
  start_date: string;
  end_date: string;
  assigned_to: {
    id: number;
    full_name: string;
    email: string;
  };
  store: {
    id: number;
    name: string;
  } | null;
  is_active: boolean;
  is_completed: boolean;
  progress_percentage: number;
  is_overdue: boolean;
  days_remaining: number;
  created_at: string;
  updated_at: string;
  created_by: {
    id: number;
    full_name: string;
    email: string;
  };
}

interface GoalStatistics {
  total_goals: number;
  active_goals: number;
  completed_goals: number;
  overdue_goals: number;
  average_progress: number;
  completion_rate: number;
}

const GoalsManagementPage = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [statistics, setStatistics] = useState<GoalStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOverdue, setShowOverdue] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    goal_type: 'sales',
    period: 'monthly',
    target_value: '',
    start_date: '',
    end_date: '',
    assigned_to: 'none'
  });

  useEffect(() => {
    fetchGoals();
    fetchStatistics();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (user?.id && newGoal.assigned_to === 'none') {
      setNewGoal(prev => ({
        ...prev,
        assigned_to: user.id.toString()
      }));
    }
  }, [user?.id, newGoal.assigned_to]);

  const fetchGoals = async () => {
    try {
      const response = await api.get('/tasks/goals/');
      console.log('Goals API response:', response.data);
      console.log('Goals type:', typeof response.data);
      console.log('Is Array:', Array.isArray(response.data));
      
      // Ensure we always set an array
      if (Array.isArray(response.data)) {
        setGoals(response.data);
      } else if (response.data && typeof response.data === 'object') {
        // If it's an object with results property (DRF pagination)
        setGoals(response.data.results || []);
      } else {
        setGoals([]);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
      setGoals([]);
      setError('Failed to load goals. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/tasks/goals/statistics/');
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/team-members/');
      setUsers(response.data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const createGoal = async () => {
    try {
      if (!newGoal.title.trim()) {
        alert('Please enter a goal title');
        return;
      }
      if (!newGoal.target_value) {
        alert('Please enter a target value');
        return;
      }
      if (!newGoal.start_date) {
        alert('Please select a start date');
        return;
      }
      if (!newGoal.end_date) {
        alert('Please select an end date');
        return;
      }
      if (newGoal.assigned_to === 'none') {
        alert('Please assign the goal to someone');
        return;
      }

      const goalData = {
        title: newGoal.title.trim(),
        description: newGoal.description.trim() || null,
        goal_type: newGoal.goal_type,
        period: newGoal.period,
        target_value: parseFloat(newGoal.target_value),
        start_date: newGoal.start_date,
        end_date: newGoal.end_date,
        assigned_to: parseInt(newGoal.assigned_to.toString())
      };

      await api.post('/tasks/goals/', goalData);
      setIsCreateDialogOpen(false);
      setNewGoal({
        title: '',
        description: '',
        goal_type: 'sales',
        period: 'monthly',
        target_value: '',
        start_date: '',
        end_date: '',
        assigned_to: 'none'
      });
      fetchGoals();
      fetchStatistics();
      alert('Goal created successfully!');
    } catch (error: any) {
      console.error('Error creating goal:', error);
      if (error.response?.data) {
        const errorMessage = typeof error.response.data === 'object' 
          ? JSON.stringify(error.response.data, null, 2)
          : error.response.data;
        alert(`Error creating goal: ${errorMessage}`);
      } else {
        alert('Error creating goal. Please try again.');
      }
    }
  };

  const updateGoalProgress = async (goalId: number, currentValue: number) => {
    try {
      await api.post(`/tasks/goals/${goalId}/update_progress/`, { current_value: currentValue });
      fetchGoals();
      fetchStatistics();
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };

  const getGoalTypeLabel = (type: string) => {
    switch (type) {
      case 'sales': return 'Sales Goal';
      case 'leads': return 'Lead Generation';
      case 'customer_satisfaction': return 'Customer Satisfaction';
      case 'task_completion': return 'Task Completion';
      case 'revenue': return 'Revenue Goal';
      case 'custom': return 'Custom Goal';
      default: return type;
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'yearly': return 'Yearly';
      default: return period;
    }
  };

  const getGoalTypeColor = (type: string) => {
    switch (type) {
      case 'sales': return 'bg-blue-500 text-white';
      case 'leads': return 'bg-green-500 text-white';
      case 'customer_satisfaction': return 'bg-purple-500 text-white';
      case 'task_completion': return 'bg-orange-500 text-white';
      case 'revenue': return 'bg-yellow-500 text-black';
      case 'custom': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Debug logging
  console.log('Goals state:', goals);
  console.log('Goals is array:', Array.isArray(goals));
  
  let filteredGoals: Goal[] = [];
  try {
    if (Array.isArray(goals)) {
             filteredGoals = goals.filter(goal => {
         if (filterStatus === 'active' && (!goal.is_active || goal.is_completed)) return false;
         if (filterStatus === 'completed' && !goal.is_completed) return false;
         if (filterStatus === 'overdue' && !goal.is_overdue) return false;
         if (filterType && filterType !== 'all' && goal.goal_type !== filterType) return false;
         if (showOverdue && !goal.is_overdue) return false;
         if (searchTerm && !goal.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
         return true;
       });
    }
  } catch (error) {
    console.error('Error filtering goals:', error);
    filteredGoals = [];
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading goals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Goals</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              fetchGoals();
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/inhouse-sales/tasks'}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tasks
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Goals Management</h1>
            <p className="text-gray-600">Set and track your goals and objectives</p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="Enter goal title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Enter goal description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="goal_type">Goal Type</Label>
                  <Select value={newGoal.goal_type} onValueChange={(value) => setNewGoal({ ...newGoal, goal_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales Goal</SelectItem>
                      <SelectItem value="leads">Lead Generation</SelectItem>
                      <SelectItem value="customer_satisfaction">Customer Satisfaction</SelectItem>
                      <SelectItem value="task_completion">Task Completion</SelectItem>
                      <SelectItem value="revenue">Revenue Goal</SelectItem>
                      <SelectItem value="custom">Custom Goal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="period">Period</Label>
                  <Select value={newGoal.period} onValueChange={(value) => setNewGoal({ ...newGoal, period: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="target_value">Target Value</Label>
                <Input
                  id="target_value"
                  type="number"
                  step="0.01"
                  value={newGoal.target_value}
                  onChange={(e) => setNewGoal({ ...newGoal, target_value: e.target.value })}
                  placeholder="Enter target value"
                />
              </div>
              <div>
                <Label htmlFor="assigned_to">Assign To</Label>
                <Select 
                  value={newGoal.assigned_to} 
                  onValueChange={(value) => setNewGoal({ ...newGoal, assigned_to: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select team member</SelectItem>
                    {Array.isArray(users) && users.length > 0 ? (
                      users.map((user: any) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.full_name || `${user.first_name} ${user.last_name}`}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No team members available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={newGoal.start_date}
                    onChange={(e) => setNewGoal({ ...newGoal, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={newGoal.end_date}
                    onChange={(e) => setNewGoal({ ...newGoal, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createGoal}>
                  Create Goal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Goals</p>
                  <p className="text-2xl font-bold">{statistics.total_goals}</p>
                </div>
                <Target className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Goals</p>
                  <p className="text-2xl font-bold">{statistics.active_goals}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">{statistics.completed_goals}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold">{statistics.overdue_goals}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search goals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
                         <Select value={filterStatus} onValueChange={setFilterStatus}>
               <SelectTrigger className="w-40">
                 <SelectValue placeholder="Status" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All Status</SelectItem>
                 <SelectItem value="active">Active</SelectItem>
                 <SelectItem value="completed">Completed</SelectItem>
                 <SelectItem value="overdue">Overdue</SelectItem>
               </SelectContent>
             </Select>
                         <Select value={filterType} onValueChange={setFilterType}>
               <SelectTrigger className="w-40">
                 <SelectValue placeholder="Type" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All Types</SelectItem>
                 <SelectItem value="sales">Sales</SelectItem>
                 <SelectItem value="leads">Lead Generation</SelectItem>
                 <SelectItem value="customer_satisfaction">Customer Satisfaction</SelectItem>
                 <SelectItem value="task_completion">Task Completion</SelectItem>
                 <SelectItem value="revenue">Revenue</SelectItem>
                 <SelectItem value="custom">Custom</SelectItem>
               </SelectContent>
             </Select>
            <Button
              variant={showOverdue ? "default" : "outline"}
              onClick={() => setShowOverdue(!showOverdue)}
              className="flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              Overdue Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.map((goal) => (
          <Card key={goal.id} className={`${goal.is_overdue ? 'border-red-500' : ''}`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{goal.title}</h3>
                    <Badge className={getGoalTypeColor(goal.goal_type)}>
                      {getGoalTypeLabel(goal.goal_type)}
                    </Badge>
                    <Badge variant={goal.is_completed ? "default" : "secondary"}>
                      {goal.is_completed ? 'COMPLETED' : goal.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </Badge>
                    {goal.is_overdue && (
                      <Badge className="bg-red-500 text-white">
                        OVERDUE
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{goal.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {goal.assigned_to.full_name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {getPeriodLabel(goal.period)} ({new Date(goal.end_date).toLocaleDateString()})
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" />
                      {goal.days_remaining} days remaining
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Target</div>
                    <div className="font-semibold">{goal.target_value}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Current</div>
                    <div className="font-semibold">{goal.current_value}</div>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-500">{goal.progress_percentage.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={goal.progress_percentage} 
                  className="w-full"
                  style={{
                    '--progress-color': getProgressColor(goal.progress_percentage)
                  } as React.CSSProperties}
                />
              </div>

              {/* Goal Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span> {getGoalTypeLabel(goal.goal_type)}
                </div>
                <div>
                  <span className="font-medium">Period:</span> {getPeriodLabel(goal.period)}
                </div>
                <div>
                  <span className="font-medium">Start Date:</span> {new Date(goal.start_date).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {new Date(goal.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Progress Update */}
              {!goal.is_completed && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Label htmlFor={`progress-${goal.id}`} className="font-medium">Update Progress:</Label>
                    <Input
                      id={`progress-${goal.id}`}
                      type="number"
                      step="0.01"
                      placeholder="Enter current value"
                      className="w-32"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const value = parseFloat((e.target as HTMLInputElement).value);
                          if (!isNaN(value)) {
                            updateGoalProgress(goal.id, value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById(`progress-${goal.id}`) as HTMLInputElement;
                        const value = parseFloat(input.value);
                        if (!isNaN(value)) {
                          updateGoalProgress(goal.id, value);
                          input.value = '';
                        }
                      }}
                    >
                      Update
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGoals.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No goals found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GoalsManagementPage; 