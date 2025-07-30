'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  ChartBarIcon, 
  DocumentTextIcon, 
  UserGroupIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { feedbackAPI } from '@/lib/api';

interface FeedbackSurvey {
  id: number;
  name: string;
  description: string;
  survey_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  questions: FeedbackQuestion[];
  submissions_count?: number;
}

interface FeedbackQuestion {
  id: number;
  question_text: string;
  question_type: string;
  is_required: boolean;
  order: number;
  options: string[];
}

interface SurveyStats {
  total_surveys: number;
  active_surveys: number;
  total_submissions: number;
  avg_completion_rate: number;
  surveys_by_type: Record<string, number>;
  recent_submissions: any[];
}

export default function FeedbackSurveysPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState<FeedbackSurvey[]>([]);
  const [stats, setStats] = useState<SurveyStats>({
    total_surveys: 0,
    active_surveys: 0,
    total_submissions: 0,
    avg_completion_rate: 0,
    surveys_by_type: {},
    recent_submissions: [],
  });
  const [selectedSurvey, setSelectedSurvey] = useState<FeedbackSurvey | null>(null);
  const [showSurveyDetails, setShowSurveyDetails] = useState(false);

  useEffect(() => {
    fetchSurveys();
    fetchStats();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const response = await feedbackAPI.getFeedbackSurveys();
      setSurveys(response.results || response);
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await feedbackAPI.getSurveyStats();
      setStats(response);
    } catch (error) {
      console.error('Error fetching survey stats:', error);
    }
  };

  const handleDeleteSurvey = async (surveyId: number) => {
    if (!confirm('Are you sure you want to delete this survey? This action cannot be undone.')) {
      return;
    }

    try {
      await feedbackAPI.deleteFeedbackSurvey(surveyId);
      fetchSurveys(); // Refresh the list
    } catch (error) {
      console.error('Error deleting survey:', error);
    }
  };

  const toggleSurveyStatus = async (survey: FeedbackSurvey) => {
    try {
      await feedbackAPI.updateFeedbackSurvey(survey.id, {
        ...survey,
        is_active: !survey.is_active,
      });
      fetchSurveys(); // Refresh the list
    } catch (error) {
      console.error('Error updating survey status:', error);
    }
  };

  const getSurveyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      post_purchase: 'Post Purchase',
      service_evaluation: 'Service Evaluation',
      satisfaction: 'General Satisfaction',
      custom: 'Custom Survey',
    };
    return labels[type] || type;
  };

  const getSurveyTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      post_purchase: 'bg-blue-100 text-blue-800',
      service_evaluation: 'bg-green-100 text-green-800',
      satisfaction: 'bg-purple-100 text-purple-800',
      custom: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const viewSurveyDetails = (survey: FeedbackSurvey) => {
    setSelectedSurvey(survey);
    setShowSurveyDetails(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feedback Surveys</h1>
          <p className="text-gray-600">Manage and view feedback surveys</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => router.push('/feedback/surveys/create')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Survey
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Surveys</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_surveys}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Surveys</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active_surveys}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_submissions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Completion</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avg_completion_rate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Surveys List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Surveys</h3>
        </div>
        
        {surveys.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No surveys</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first feedback survey.</p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/feedback/surveys/create')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Survey
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {surveys.map((survey) => (
              <div key={survey.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900">{survey.name}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSurveyTypeColor(survey.survey_type)}`}>
                        {getSurveyTypeLabel(survey.survey_type)}
                      </span>
                      {survey.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <XCircleIcon className="h-3 w-3 mr-1" />
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{survey.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>Questions: {survey.questions?.length || 0}</span>
                      <span>Submissions: {survey.submissions_count || 0}</span>
                      <span>Created: {formatDate(survey.created_at)}</span>
                      <span>Updated: {formatDate(survey.updated_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => viewSurveyDetails(survey)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="View Details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => router.push(`/feedback/surveys/${survey.id}/edit`)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Edit Survey"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => toggleSurveyStatus(survey)}
                      className={`p-2 transition-colors ${
                        survey.is_active 
                          ? 'text-green-600 hover:text-red-600' 
                          : 'text-gray-400 hover:text-green-600'
                      }`}
                      title={survey.is_active ? 'Deactivate Survey' : 'Activate Survey'}
                    >
                      {survey.is_active ? (
                        <XCircleIcon className="h-5 w-5" />
                      ) : (
                        <CheckCircleIcon className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteSurvey(survey.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Survey"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Survey Details Modal */}
      {showSurveyDetails && selectedSurvey && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">{selectedSurvey.name}</h3>
                <button
                  onClick={() => setShowSurveyDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Description</h4>
                  <p className="text-gray-600">{selectedSurvey.description}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Survey Type</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSurveyTypeColor(selectedSurvey.survey_type)}`}>
                    {getSurveyTypeLabel(selectedSurvey.survey_type)}
                  </span>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Questions ({selectedSurvey.questions?.length || 0})</h4>
                  {selectedSurvey.questions && selectedSurvey.questions.length > 0 ? (
                    <div className="space-y-2 mt-2">
                      {selectedSurvey.questions.map((question, index) => (
                        <div key={question.id} className="bg-gray-50 p-3 rounded">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">
                              {index + 1}. {question.question_text}
                            </span>
                            <span className="text-xs text-gray-500">
                              {question.question_type} {question.is_required && '(Required)'}
                            </span>
                          </div>
                          {question.options && question.options.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">Options:</p>
                              <ul className="list-disc list-inside text-sm text-gray-600">
                                {question.options.map((option, optIndex) => (
                                  <li key={optIndex}>{option}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No questions added yet.</p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => router.push(`/feedback/surveys/${selectedSurvey.id}/submissions`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    View Submissions
                  </button>
                  <button
                    onClick={() => setShowSurveyDetails(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 