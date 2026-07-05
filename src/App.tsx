import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import {
  Code2,
  Terminal,
  BookOpen,
  LineChart,
  UserCheck,
  Shield,
  Search,
  ChevronRight,
  Play,
  CheckCircle,
  AlertCircle,
  FileText,
  User,
  LogOut,
  Calendar,
  Layers,
  Award,
  Zap,
  Clock,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Briefcase,
  Bookmark,
  MessageSquare,
  Mic,
  MicOff,
  Plus,
  Trash2,
  RefreshCw,
  Send,
  Lock,
  ThumbsUp,
  Download
} from 'lucide-react';

// Types from our backend
interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  companyTags: string[];
  topicTags: string[];
  description: string;
  constraints: string[];
  inputFormat: string;
  outputFormat: string;
  examples: { input: string; output: string; explanation?: string }[];
  hints: string[];
  testCases: { input: string; expectedOutput: string; isHidden: boolean }[];
  templates: { [key: string]: string };
  bruteForce?: string;
  optimized?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
}

interface CodeSubmission {
  id: string;
  problemId: string;
  problemTitle: string;
  language: string;
  code: string;
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Compile Error';
  runtime: string;
  memory: string;
  submittedAt: string;
  testCasesPassed: number;
  totalTestCases: number;
}

interface InterviewSession {
  id: string;
  companyName: string;
  interviewType: string;
  rounds: string[];
  difficulty: string;
  currentRoundIndex: number;
  chatHistory: { role: 'interviewer' | 'candidate'; text: string; timestamp: string }[];
  status: 'in_progress' | 'completed';
  report?: {
    overallScore: number;
    communicationScore: number;
    technicalScore: number;
    confidenceScore: number;
    problemSolvingScore: number;
    suggestions: string[];
    weakAreas: string[];
    strongAreas: string[];
    recommendedCodingTopics: string[];
    recommendedInterviewQuestions: string[];
    studyPlan: { day: string; task: string }[];
  };
  createdAt: string;
}

export default function App() {
  // Authentication & Session State
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('demo@prepagent.ai');
  const [authPassword, setAuthPassword] = useState('password');
  const [authName, setAuthName] = useState('');
  const [authCompany, setAuthCompany] = useState('Google');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Active View Tab State
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'problems' | 'interviews' | 'companies' | 'analytics' | 'admin'>('dashboard');

  // Problems Module State
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem | null>(null);
  const [submissions, setSubmissions] = useState<CodeSubmission[]>([]);
  const [problemSearch, setProblemSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Solved' | 'Unsolved' | 'Bookmarked' | 'Favorited'>('All');
  const [activeCompany, setActiveCompany] = useState<string>('Google');
  
  // Code Editor State
  const [selectedLanguage, setSelectedLanguage] = useState<string>('python');
  const [editorCode, setEditorCode] = useState<string>('');
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'description' | 'submissions' | 'editorial' | 'discussions'>('description');
  const [executionLoading, setExecutionLoading] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [aiHelperLoading, setAiHelperLoading] = useState(false);
  const [aiResponseText, setAiResponseText] = useState<string>('');
  const [aiModalType, setAiModalType] = useState<'explain' | 'hint' | null>(null);

  // New features state
  const [customInput, setCustomInput] = useState<string>('');
  const [useCustomInput, setUseCustomInput] = useState<boolean>(false);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [newPostTitle, setNewPostTitle] = useState<string>('');
  const [newPostContent, setNewPostContent] = useState<string>('');
  const [newPostCategory, setNewPostCategory] = useState<string>('Question');
  const [replyContent, setReplyContent] = useState<{ [postId: string]: string }>({});
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardFilter, setLeaderboardFilter] = useState<'global' | 'company' | 'college'>('global');
  const [collegeFilter, setCollegeFilter] = useState<string>('');
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  // Timer states
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);

  // Interview timer and duration states
  const [interviewTimeRemaining, setInterviewTimeRemaining] = useState<number>(1800); // 30 minutes in seconds
  const [interviewIsActive, setInterviewIsActive] = useState<boolean>(false);

  // Company Guide Search States
  const [companySearchQuery, setCompanySearchQuery] = useState<string>('');
  const [fetchedCompanyGuide, setFetchedCompanyGuide] = useState<any>(null);
  const [guideLoading, setGuideLoading] = useState<boolean>(false);
  const [guideError, setGuideError] = useState<string>('');

  // Interviews Module State
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [activeInterview, setActiveInterview] = useState<InterviewSession | null>(null);
  const [interviewStep, setInterviewStep] = useState<'setup' | 'chat' | 'report'>('setup');
  
  // Mock Interview Form Selection
  const [targetCompany, setTargetCompany] = useState<string>('Google');
  const [interviewType, setInterviewType] = useState<string>('Technical');
  const [interviewTopic, setInterviewTopic] = useState<string>('DSA & Algorithms');
  const [interviewDifficulty, setInterviewDifficulty] = useState<string>('Medium');
  
  // Interactive Chat State
  const [candidateResponse, setCandidateResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [evaluatingLoading, setEvaluatingLoading] = useState(false);
  
  // Speech Utilities State
  const [isListening, setIsListening] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Company Tracks View State
  const [selectedCompanyTrack, setSelectedCompanyTrack] = useState<any>(null);
  const [companiesList, setCompaniesList] = useState<any[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState<boolean>(false);
  const [companiesError, setCompaniesError] = useState<string>('');
  const [companySearch, setCompanySearch] = useState<string>('');
  const [companyTypeFilter, setCompanyTypeFilter] = useState<'All' | 'Product' | 'Service'>('All');
  const [companyDifficultyFilter, setCompanyDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [companyHiringFilter, setCompanyHiringFilter] = useState<'All' | 'Hiring Now' | 'Closed' | 'Upcoming'>('All');
  const [companyInternshipFilter, setCompanyInternshipFilter] = useState<boolean>(false);
  const [companyFullTimeFilter, setCompanyFullTimeFilter] = useState<boolean>(false);

  // Admin Module State
  const [adminAnalytics, setAdminAnalytics] = useState<any>(null);
  const [newProblemForm, setNewProblemForm] = useState({
    title: '',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    category: 'Arrays',
    topicTags: '',
    companyTags: '',
    description: '',
    constraints: '',
    inputFormat: '',
    outputFormat: ''
  });
  const [adminSuccessMsg, setAdminSuccessMsg] = useState('');

  // Monaco Refs & Helpers
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const setMonacoErrors = (lineNum: number, errMsg: string) => {
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelMarkers(model, "owner", [
          {
            startLineNumber: lineNum,
            startColumn: 1,
            endLineNumber: lineNum,
            endColumn: 1000,
            message: errMsg,
            severity: monacoRef.current.MarkerSeverity.Error,
          },
        ]);
      }
    }
  };

  const clearMonacoErrors = () => {
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelMarkers(model, "owner", []);
      }
    }
  };

  // Dynamic Hints & Solutions State
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [showFullSolution, setShowFullSolution] = useState<boolean>(false);

  // Auto Scroll Interview Chat
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeInterview?.chatHistory, chatLoading]);

  // Fetch initial profile & data
  useEffect(() => {
    fetchCompanies();
    if (token) {
      fetchUserProfile();
      fetchProblems();
      fetchSubmissions();
      fetchInterviews();
      fetchAdminAnalytics();
    }
  }, [token]);

  // Sync editor code on problem/language change
  useEffect(() => {
    if (selectedProblem) {
      const template = selectedProblem.templates[selectedLanguage] || selectedProblem.templates['python'] || '';
      setEditorCode(template);
      setExecutionResult(null);
      setAiResponseText('');
      setRevealedHints(0);
      setShowFullSolution(false);
    }
  }, [selectedProblem, selectedLanguage]);

  // Live Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (selectedProblem && isTimerActive) {
      interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    } else {
      setSecondsElapsed(0);
    }
    return () => clearInterval(interval);
  }, [selectedProblem, isTimerActive]);

  // Live Interview Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (interviewStep === 'chat' && interviewIsActive) {
      interval = setInterval(() => {
        setInterviewTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setInterviewIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [interviewStep, interviewIsActive]);

  const handleFetchCompanyGuide = async (name: string) => {
    if (!name.trim()) return;
    setGuideLoading(true);
    setGuideError('');
    setFetchedCompanyGuide(null);
    try {
      const res = await fetch(`/api/companies/guide?company=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (res.ok) {
        setFetchedCompanyGuide(data);
      } else {
        setGuideError(data.error || 'Failed to generate guide.');
      }
    } catch (err) {
      setGuideError('Could not connect to SDE analysis service.');
    } finally {
      setGuideLoading(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Discussions sync
  const fetchDiscussions = async (probId: string) => {
    try {
      const res = await fetch(`/api/coding/problems/${probId}/discussions`);
      const data = await res.json();
      if (res.ok) {
        setDiscussions(data.discussions || []);
      }
    } catch (err) {
      console.error('Error fetching discussions:', err);
    }
  };

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProblem || !newPostTitle.trim() || !newPostContent.trim()) return;
    try {
      const res = await fetch(`/api/coding/problems/${selectedProblem.id}/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: newPostTitle, content: newPostContent, category: newPostCategory })
      });
      if (res.ok) {
        setNewPostTitle('');
        setNewPostContent('');
        fetchDiscussions(selectedProblem.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/coding/discussions/${postId}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok && selectedProblem) {
        fetchDiscussions(selectedProblem.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReply = async (postId: string) => {
    const content = replyContent[postId];
    if (!content || !content.trim()) return;
    try {
      const res = await fetch(`/api/coding/discussions/${postId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });
      if (res.ok && selectedProblem) {
        setReplyContent(prev => ({ ...prev, [postId]: '' }));
        fetchDiscussions(selectedProblem.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBookmark = async () => {
    if (!selectedProblem) return;
    try {
      const res = await fetch(`/api/coding/problems/${selectedProblem.id}/bookmark`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setIsBookmarked(data.bookmarked);
        fetchUserProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFavorite = async () => {
    if (!selectedProblem) return;
    try {
      const res = await fetch(`/api/coding/problems/${selectedProblem.id}/favorite`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setIsFavorite(data.favorited);
        fetchUserProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      let url = `/api/leaderboard?type=${leaderboardFilter}`;
      if (leaderboardFilter === 'company' && currentUser) {
        url += `&company=${currentUser.targetCompany}`;
      } else if (leaderboardFilter === 'college' && currentUser) {
        url += `&college=${collegeFilter || currentUser.collegeName || 'VIT University'}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setLeaderboard(data.leaderboard || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Sync on problem loads
  useEffect(() => {
    if (selectedProblem) {
      fetchDiscussions(selectedProblem.id);
      // Log problem view
      fetch(`/api/coding/problems/${selectedProblem.id}/view`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).then(() => fetchUserProfile());
    }
  }, [selectedProblem]);

  useEffect(() => {
    if (token) {
      fetchLeaderboard();
    }
  }, [token, leaderboardFilter, collegeFilter]);

  useEffect(() => {
    if (currentUser && selectedProblem) {
      setIsBookmarked(currentUser.bookmarks?.includes(selectedProblem.id) || false);
      setIsFavorite(currentUser.favorites?.includes(selectedProblem.id) || false);
    }
  }, [currentUser, selectedProblem]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
      } else {
        handleLogout();
      }
    } catch {
      handleLogout();
    }
  };

  const fetchProblems = async () => {
    try {
      const res = await fetch('/api/coding/problems');
      const data = await res.json();
      if (res.ok) {
        setProblems(data.problems);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCompanies = async () => {
    setCompaniesLoading(true);
    setCompaniesError('');
    try {
      const res = await fetch('/api/companies');
      const data = await res.json();
      if (res.ok) {
        setCompaniesList(data.companies || []);
      } else {
        setCompaniesError(data.error || 'Failed to load company preparation tracks.');
      }
    } catch (err) {
      setCompaniesError('Could not reach the server to load company tracks.');
    } finally {
      setCompaniesLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/coding/submissions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSubmissions(data.submissions);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInterviews = async () => {
    try {
      const res = await fetch('/api/interviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setInterviews(data.interviews);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdminAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAdminAnalytics(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Auth Operations
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const url = authView === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = authView === 'login' 
      ? { email: authEmail, password: authPassword }
      : { email: authEmail, password: authPassword, fullName: authName, targetCompany: authCompany };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setCurrentUser(data.user);
        setCurrentTab('dashboard');
      } else {
        setAuthError(data.error || 'Authentication failed.');
      }
    } catch (err) {
      setAuthError('Network communication error.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    setActiveInterview(null);
    setSelectedProblem(null);
  };

  const updateTargetGoal = async (company: string, days: number) => {
    try {
      const res = await fetch('/api/auth/profile/target', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetCompany: company, daysRemaining: days })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Code Execution Workspace Handlers
  const runCode = async () => {
    if (!selectedProblem) return;
    setExecutionLoading(true);
    setExecutionResult(null);
    clearMonacoErrors();

    try {
      const body: any = { code: editorCode, language: selectedLanguage };
      if (useCustomInput) {
        body.customInput = customInput;
      }
      const res = await fetch(`/api/coding/problems/${selectedProblem.id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      setExecutionResult(data);
      if (data.status === 'Compile Error') {
        setMonacoErrors(data.lineNum || 1, data.error || 'Compilation Error');
      }
    } catch (err) {
      setExecutionResult({ status: 'Error', error: 'Internal compilation server unreachable.' });
    } finally {
      setExecutionLoading(false);
    }
  };

  const submitCode = async () => {
    if (!selectedProblem) return;
    setExecutionLoading(true);
    setExecutionResult(null);
    clearMonacoErrors();

    try {
      const res = await fetch(`/api/coding/problems/${selectedProblem.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code: editorCode, language: selectedLanguage })
      });
      const data = await res.json();
      setExecutionResult({
        status: data.status,
        passedCount: data.passedCount,
        totalCases: data.totalCases,
        runtime: data.runtime,
        memory: data.memory,
        results: data.results,
        isSubmit: true
      });
      if (data.status === 'Compile Error') {
        const firstResult = data.results?.[0];
        setMonacoErrors(firstResult?.lineNum || 1, firstResult?.error || data.error || 'Compilation Error');
      }
      fetchSubmissions();
      fetchUserProfile();
    } catch (err) {
      setExecutionResult({ status: 'Error', error: 'Submission service failure.' });
    } finally {
      setExecutionLoading(false);
    }
  };

  const triggerAiExplain = async () => {
    if (!selectedProblem) return;
    setAiHelperLoading(true);
    setAiModalType('explain');
    setAiResponseText('');

    try {
      const res = await fetch(`/api/coding/problems/${selectedProblem.id}/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: editorCode, language: selectedLanguage })
      });
      const data = await res.json();
      setAiResponseText(data.text || data.error);
    } catch {
      setAiResponseText('AI Assistant is currently overloaded. Please try again.');
    } finally {
      setAiHelperLoading(false);
    }
  };

  const triggerAiHint = async () => {
    if (!selectedProblem) return;
    setAiHelperLoading(true);
    setAiModalType('hint');
    setAiResponseText('');

    try {
      const res = await fetch(`/api/coding/problems/${selectedProblem.id}/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: editorCode, language: selectedLanguage })
      });
      const data = await res.json();
      setAiResponseText(data.text || data.error);
    } catch {
      setAiResponseText('Could not generate hints. Check your connectivity.');
    } finally {
      setAiHelperLoading(false);
    }
  };

  // Mock Interview Handlers
  const startInterview = async () => {
    setChatLoading(true);
    try {
      const res = await fetch('/api/interviews/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          companyName: targetCompany,
          interviewType,
          topic: interviewTopic,
          difficulty: interviewDifficulty
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActiveInterview(data.interview);
        setInterviewStep('chat');
        setCandidateResponse('');
        // Initialize timer based on difficulty
        const totalSecs = interviewDifficulty === 'Easy' ? 1200 : interviewDifficulty === 'Hard' ? 2700 : 1800;
        setInterviewTimeRemaining(totalSecs);
        setInterviewIsActive(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  const sendInterviewAnswer = async () => {
    if (!activeInterview || !candidateResponse.trim()) return;
    const textToSend = candidateResponse;
    setCandidateResponse('');
    setChatLoading(true);

    try {
      const res = await fetch(`/api/interviews/${activeInterview.id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: textToSend })
      });
      const data = await res.json();
      if (res.ok) {
        setActiveInterview(data.interview);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  const evaluateAndConcludeInterview = async () => {
    if (!activeInterview) return;
    setEvaluatingLoading(true);

    try {
      const res = await fetch(`/api/interviews/${activeInterview.id}/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setActiveInterview(data.interview);
        setInterviewStep('report');
        setInterviewIsActive(false);
        fetchInterviews();
        fetchUserProfile();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluatingLoading(false);
    }
  };

  // Simple HTML5 Speech-to-Text Setup
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice speech recognition is not natively supported in this browser. Try Chrome/Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
    } else {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (e: any) => {
        const resultText = e.results[0][0].transcript;
        setCandidateResponse(prev => prev + " " + resultText);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.start();
    }
  };

  // Create new problem (Admin panel)
  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminSuccessMsg('');

    try {
      const res = await fetch('/api/admin/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newProblemForm,
          topicTags: newProblemForm.topicTags.split(',').map(s => s.trim()).filter(Boolean),
          companyTags: newProblemForm.companyTags.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      const data = await res.json();

      if (res.ok) {
        setAdminSuccessMsg(`Successfully added challenge: ${data.problem.title}!`);
        setNewProblemForm({
          title: '',
          difficulty: 'Medium',
          category: 'Arrays',
          topicTags: '',
          companyTags: '',
          description: '',
          constraints: '',
          inputFormat: '',
          outputFormat: ''
        });
        fetchProblems();
        fetchAdminAnalytics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProblem = async (id: string) => {
    if (!confirm('Are you sure you want to remove this problem?')) return;
    try {
      const res = await fetch(`/api/admin/problems/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchProblems();
        fetchAdminAnalytics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Standard Company Meta (28 tech companies)
  const companyMetaList = [
    { name: 'Google', frequency: 'Very High', pattern: '3 Coding Rounds (Graph/DP focus) + 1 Googleyness Round', topics: 'Graphs, Dynamic Programming, Heap, System Design', accent: 'border-blue-500 text-blue-600', distribution: 'Hard (40%), Medium (50%), Easy (10%)' },
    { name: 'Microsoft', frequency: 'Very High', pattern: '2 Coding Rounds (DS focus) + 1 System Design + 1 Managerial', topics: 'Trees, HashMap, Strings, System Design', accent: 'border-emerald-500 text-emerald-600', distribution: 'Medium (60%), Easy (30%), Hard (10%)' },
    { name: 'Amazon', frequency: 'Very High', pattern: '1 Online Assessment + 2 Coding Rounds + 1 Bar Raiser', topics: 'Arrays, Two Pointer, Greedy, OOP Problems', accent: 'border-amber-500 text-amber-600', distribution: 'Medium (70%), Hard (20%), Easy (10%)' },
    { name: 'Meta', frequency: 'Very High', pattern: '2 High-speed Coding Rounds (2 Qs in 45m each) + 1 System Design', topics: 'Arrays, Binary Search, Stack, Subarray sums', accent: 'border-indigo-500 text-indigo-600', distribution: 'Medium (80%), Easy (15%), Hard (5%)' },
    { name: 'Apple', frequency: 'Very High', pattern: '2 Coding Rounds + 1 System Performance + 1 Culture Fit', topics: 'Arrays, Two Pointer, Lower-level Systems', accent: 'border-slate-500 text-slate-600', distribution: 'Medium (60%), Hard (30%), Easy (10%)' },
    { name: 'Adobe', frequency: 'High', pattern: '1 Online Test + 2 Coding Rounds + 1 Architecture Review', topics: 'Tree, Recursion, Stack, Searching', accent: 'border-rose-500 text-rose-600', distribution: 'Medium (55%), Easy (25%), Hard (20%)' },
    { name: 'Oracle', frequency: 'High', pattern: '1 MCQ Assessment + 2 Coding Rounds + 1 Database Design', topics: 'SQL, Tree, Dynamic Programming', accent: 'border-red-500 text-red-600', distribution: 'Medium (60%), Easy (20%), Hard (20%)' },
    { name: 'IBM', frequency: 'High', pattern: '1 Cognitive Assessment + 2 Coding / System Integration Rounds', topics: 'Sorting, Searching, HashMap, API Design', accent: 'border-blue-600 text-blue-700', distribution: 'Easy (50%), Medium (40%), Hard (10%)' },
    { name: 'Intel', frequency: 'Medium', pattern: '1 Technical Quiz + 1 Coding Round + 1 Hardware Integration', topics: 'Arrays, Binary Search, Math, Bit manipulation', accent: 'border-sky-600 text-sky-700', distribution: 'Easy (40%), Medium (50%), Hard (10%)' },
    { name: 'Cisco', frequency: 'Medium', pattern: '1 Online Test + 2 Networking & Coding Interviews', topics: 'Sliding Window, Queue, Graph, Searching', accent: 'border-cyan-500 text-cyan-600', distribution: 'Easy (45%), Medium (45%), Hard (10%)' },
    { name: 'Salesforce', frequency: 'High', pattern: '1 HackerRank Test + 2 SDE Integration Rounds + 1 SRE Round', topics: 'HashMap, Strings, System Architecture, OOP', accent: 'border-sky-500 text-sky-600', distribution: 'Medium (70%), Easy (20%), Hard (10%)' },
    { name: 'Zoho', frequency: 'High', pattern: '1 General Aptitude + 1 Basic Programming + 1 Advanced Coding Round', topics: 'HashMap, Strings, Recursion, Matrix', accent: 'border-emerald-600 text-emerald-700', distribution: 'Easy (50%), Medium (40%), Hard (10%)' },
    { name: 'Freshworks', frequency: 'Medium', pattern: '1 Aptitude + 2 Coding & Problem Solving Rounds', topics: 'HashMap, Two Pointers, Strings, OOP', accent: 'border-teal-500 text-teal-600', distribution: 'Easy (60%), Medium (35%), Hard (5%)' },
    { name: 'TCS', frequency: 'High', pattern: '1 TCS NQT Assessment + 1 Technical Interview + 1 MR Round', topics: 'Recursion, HashMap, Sorting, Searching', accent: 'border-blue-400 text-blue-500', distribution: 'Easy (60%), Medium (35%), Hard (5%)' },
    { name: 'Infosys', frequency: 'High', pattern: '1 Infosys Certification Test + 1 Tech Round + 1 HR Round', topics: 'Strings, Arrays, Sorting, Dynamic Programming', accent: 'border-blue-500 text-blue-600', distribution: 'Easy (50%), Medium (40%), Hard (10%)' },
    { name: 'Wipro', frequency: 'Medium', pattern: '1 Wipro NLTH Elite Test + 1 Tech Round + 1 HR Round', topics: 'Math, Sorting, Searching, Arrays', accent: 'border-purple-500 text-purple-600', distribution: 'Easy (70%), Medium (25%), Hard (5%)' },
    { name: 'HCL', frequency: 'Medium', pattern: '1 Aptitude Test + 1 Core Tech Round + 1 HR Round', topics: 'Math, Arrays, Strings, Sorting', accent: 'border-slate-500 text-slate-600', distribution: 'Easy (70%), Medium (25%), Hard (5%)' },
    { name: 'Cognizant', frequency: 'Medium', pattern: '1 GenC Assessment + 1 Technical Panel Interview', topics: 'HashMap, Sorting, Strings, Arrays', accent: 'border-cyan-600 text-cyan-700', distribution: 'Easy (60%), Medium (35%), Hard (5%)' },
    { name: 'Accenture', frequency: 'High', pattern: '1 Cognitive & Coding Test + 1 Technical Interview', topics: 'Strings, Arrays, Searching, Sorting', accent: 'border-purple-600 text-purple-700', distribution: 'Easy (55%), Medium (40%), Hard (5%)' },
    { name: 'Capgemini', frequency: 'Medium', pattern: '1 Game-based Assessment + 1 Tech Round + 1 HR Round', topics: 'Recursion, Strings, Sorting, Searching', accent: 'border-sky-500 text-sky-600', distribution: 'Easy (60%), Medium (35%), Hard (5%)' },
    { name: 'Deloitte', frequency: 'Medium', pattern: '1 Aptitude & Case study + 1 SDE Technical Round', topics: 'Sorting, Searching, Arrays, Excel Matrix', accent: 'border-lime-500 text-lime-600', distribution: 'Easy (50%), Medium (45%), Hard (5%)' },
    { name: 'EY', frequency: 'Medium', pattern: '1 Technical MCQ + 1 Coding & Case Interview', topics: 'Binary Search, Matrix, Arrays, Sorting', accent: 'border-yellow-500 text-yellow-600', distribution: 'Easy (50%), Medium (45%), Hard (5%)' },
    { name: 'KPMG', frequency: 'Medium', pattern: '1 MCQ Assessment + 1 SDE Technical Interview', topics: 'Arrays, Strings, Sorting, Searching', accent: 'border-blue-800 text-blue-900', distribution: 'Easy (50%), Medium (45%), Hard (5%)' },
    { name: 'PwC', frequency: 'Medium', pattern: '1 Aptitude Evaluation + 1 SDE Coding Session', topics: 'Sorting, Arrays, Sliding Window, Queue', accent: 'border-orange-500 text-orange-600', distribution: 'Easy (50%), Medium (45%), Hard (5%)' },
    { name: 'Goldman Sachs', frequency: 'High', pattern: '1 Math/Coding OA + 2 Technical Interviews + 1 CoderPad Live', topics: 'Dynamic Programming, Sorting, Searching, Math', accent: 'border-yellow-600 text-yellow-700', distribution: 'Medium (50%), Hard (30%), Easy (20%)' },
    { name: 'Morgan Stanley', frequency: 'High', pattern: '1 OA Test + 2 SDE Technical Panels + 1 Proctored Code', topics: 'HashMap, Tree, Sliding Window, Stack', accent: 'border-blue-900 text-blue-950', distribution: 'Medium (60%), Hard (25%), Easy (15%)' },
    { name: 'JPMorgan Chase', frequency: 'High', pattern: '1 Code For Good Hackathon / HireVue + 2 SDE Coding Rounds', topics: 'Two Pointers, HashMap, Arrays, Sorting', accent: 'border-amber-600 text-amber-700', distribution: 'Medium (65%), Easy (25%), Hard (10%)' },
    { name: 'Walmart Global Tech', frequency: 'High', pattern: '1 HackerRank OA + 2 Coding Rounds + 1 System Architecture', topics: 'Dynamic Programming, Sorting, Two Pointers, Arrays', accent: 'border-sky-500 text-sky-600', distribution: 'Medium (70%), Hard (15%), Easy (15%)' }
  ];

  // Topic filter constants (16 topics)
  const allTopicCategories = [
    'Arrays', 'Strings', 'HashMap', 'Stack', 'Queue', 'Linked List', 'Tree', 'Binary Search', 'Sorting', 'Searching', 'Sliding Window', 'Two Pointers', 'Recursion', 'Dynamic Programming (Basic)', 'Math', 'Matrix'
  ];

  // Filtered Coding Challenges list
  const filteredProblems = problems.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(problemSearch.toLowerCase()) || 
                          p.topicTags.some(t => t.toLowerCase().includes(problemSearch.toLowerCase())) ||
                          p.companyTags.some(c => c.toLowerCase().includes(problemSearch.toLowerCase()));
    const matchesDiff = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;

    // Status matching
    const solvedIds = new Set(submissions.filter(s => s.status === 'Accepted').map(s => s.problemId));
    const isSolved = solvedIds.has(p.id);
    const isBookmarked = currentUser?.bookmarks?.includes(p.id) || false;
    const isFavorited = currentUser?.favorites?.includes(p.id) || false;

    const matchesStatus = 
      statusFilter === 'All' ? true :
      statusFilter === 'Solved' ? isSolved :
      statusFilter === 'Unsolved' ? !isSolved :
      statusFilter === 'Bookmarked' ? isBookmarked :
      statusFilter === 'Favorited' ? isFavorited : true;

    return matchesSearch && matchesDiff && matchesCat && matchesStatus;
  }).sort((a, b) => {
    const weights = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
    return weights[a.difficulty] - weights[b.difficulty];
  });

  const solvedIds = new Set(submissions.filter(s => s.status === 'Accepted').map(s => s.problemId));
  const solvedEasy = problems.filter(p => p.difficulty === 'Easy' && solvedIds.has(p.id)).length;
  const solvedMedium = problems.filter(p => p.difficulty === 'Medium' && solvedIds.has(p.id)).length;

  // UNAUTHENTICATED WALL
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-slate-100">
        <div id="auth-card" className="w-full max-w-md bg-slate-850 border border-slate-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
          
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Code2 className="w-6 h-6 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-white mb-2">PrepAgent AI</h2>
          <p className="text-slate-400 text-xs text-center mb-8">
            The Complete AI Placement Prep & Mock Interview Suite
          </p>

          {authError && (
            <div className="mb-4 p-3 bg-rose-900/30 border border-rose-800 text-rose-200 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {authView === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={authName}
                  onChange={e => setAuthName(e.target.value)}
                  placeholder="Giri Kumar"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                placeholder="demo@prepagent.ai"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>

            {authView === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Target Company</label>
                <select
                  value={authCompany}
                  onChange={e => setAuthCompany(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                >
                  <option value="Google">Google</option>
                  <option value="Microsoft">Microsoft</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Meta">Meta</option>
                  <option value="Apple">Apple</option>
                  <option value="Atlassian">Atlassian</option>
                  <option value="Goldman Sachs">Goldman Sachs</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 mt-6 shadow-md shadow-indigo-900/30"
            >
              {authLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : authView === 'login' ? (
                <>
                  <span>Sign In To Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <span>Register SDE Account</span>
              )}
            </button>
          </form>

          {authView === 'login' && (
            <div className="mt-4 p-3 bg-indigo-950/40 border border-indigo-900 text-indigo-300 text-xs rounded-lg">
              <span className="font-semibold">Quick Login:</span> Click sign-in with default values above to immediately test with a pre-seeded account!
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <button
              onClick={() => {
                setAuthView(authView === 'login' ? 'register' : 'login');
                setAuthError('');
              }}
              className="text-indigo-400 hover:text-indigo-300 text-xs font-medium focus:outline-none"
            >
              {authView === 'login' ? "Don't have an account? Sign Up" : "Already have an SDE account? Sign In"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // APP INTERFACE (MAIN LAYOUT)
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* GLOBAL SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-white tracking-tight text-base block">PrepAgent AI</span>
            <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase">Placement Pro</span>
          </div>
        </div>
        
        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <button
            onClick={() => { setCurrentTab('dashboard'); setSelectedProblem(null); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              currentTab === 'dashboard' && !selectedProblem ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => { setCurrentTab('problems'); setSelectedProblem(null); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              currentTab === 'problems' || selectedProblem ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Coding Practice</span>
          </button>

          <button
            onClick={() => { setCurrentTab('interviews'); setSelectedProblem(null); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              currentTab === 'interviews' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>AI Mock Interview</span>
          </button>

          <button
            onClick={() => { setCurrentTab('companies'); setSelectedProblem(null); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              currentTab === 'companies' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Company Tracks</span>
          </button>

          <button
            onClick={() => { setCurrentTab('analytics'); setSelectedProblem(null); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              currentTab === 'analytics' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <LineChart className="w-4 h-4" />
            <span>Mastery & Analytics</span>
          </button>

          <button
            onClick={() => { setCurrentTab('admin'); setSelectedProblem(null); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              currentTab === 'admin' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin Console</span>
          </button>
        </nav>

        {/* Dynamic target company card widget */}
        {currentUser && (
          <div className="p-4 border-t border-slate-800">
            <div className="bg-slate-850 rounded-xl p-4 border border-slate-800">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">Target Placement</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-950 text-indigo-400 rounded flex items-center justify-center font-bold text-xs">
                  {currentUser.targetCompany ? currentUser.targetCompany[0] : 'G'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{currentUser.targetCompany} Track</p>
                  <p className="text-[11px] text-slate-400 italic">{currentUser.daysRemaining} days remaining</p>
                </div>
              </div>
              <div className="mt-3">
                <input 
                  type="range" 
                  min="5" 
                  max="90" 
                  value={currentUser.daysRemaining}
                  onChange={(e) => updateTargetGoal(currentUser.targetCompany, Number(e.target.value))}
                  className="w-full accent-indigo-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* MAIN APPLICATION STAGE */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER PANEL */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide">
              {selectedProblem ? `Practice IDE` : currentTab}
            </h2>
            {currentUser && (
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
                <Zap className="w-3.5 h-3.5 fill-emerald-500 stroke-none" />
                <span>STREAK: {currentUser.streak} DAYS 🔥</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Platform Sync</span>
              <span className="text-xs font-semibold text-indigo-600">Online UTC {new Date().toISOString().substring(11,16)}</span>
            </div>

            {currentUser && (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800 leading-tight">{currentUser.fullName}</p>
                  <p className="text-[10px] text-slate-400 leading-tight font-mono">{currentUser.email}</p>
                </div>
                <div className="relative group">
                  <button className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold hover:bg-indigo-200 transition-all">
                    {currentUser.fullName ? currentUser.fullName[0] : 'U'}
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="absolute right-0 mt-1 hidden group-hover:block bg-white border border-slate-200 shadow-xl rounded-lg p-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold transition-all whitespace-nowrap z-50"
                  >
                    <LogOut className="w-3.5 h-3.5 inline mr-1" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* STAGE CONTAINER */}
        <div className="flex-1 overflow-auto bg-slate-50 p-6">
          
          {/* ==========================================
              TAB 1: PERFORMANCE DASHBOARD VIEW
              ========================================== */}
          {currentTab === 'dashboard' && !selectedProblem && currentUser && (
            <div className="space-y-6">
              
              {/* HERO METRIC BLOCKS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Problems Solved Progress Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">Solved Problems</span>
                      <Award className="w-4 h-4 text-indigo-600" />
                    </div>
                    <p className="text-3xl font-extrabold font-mono text-slate-800">{currentUser.solvedCount}</p>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium mb-1">
                        <span>Easy</span>
                        <span className="font-mono">{currentUser.easyCount}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (currentUser.easyCount / 100) * 100)}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium mb-1">
                        <span>Medium</span>
                        <span className="font-mono">{currentUser.mediumCount}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (currentUser.mediumCount / 80) * 100)}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium mb-1">
                        <span>Hard</span>
                        <span className="font-mono">{currentUser.hardCount}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(100, (currentUser.hardCount / 40) * 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accuracy Gauge Block */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between text-center">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase text-left">Code Accuracy</span>
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  </div>
                  <div className="my-auto py-2">
                    <p className="text-4xl font-black font-mono text-indigo-600">{currentUser.accuracy}%</p>
                    <p className="text-xs text-slate-400 mt-1">Submission validation rate</p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
                    Excellent code design habits!
                  </div>
                </div>

                {/* Global Ranking Status */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Global SDE Rank</span>
                    <Layers className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="py-2">
                    <p className="text-3xl font-extrabold font-mono text-slate-800">#{currentUser.globalRank}</p>
                    <p className="text-[11px] text-slate-400 mt-1">SDE peer placement hierarchy</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Rank tier: Elite</span>
                    <span className="text-emerald-600 font-bold font-mono">Top 4.2%</span>
                  </div>
                </div>

                {/* Upcoming Mock Interview Countdown */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-950 text-white rounded-xl p-5 shadow-md flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Target Round</span>
                    <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                  </div>
                  <div className="py-2">
                    <p className="text-lg font-black tracking-tight">{currentUser.targetCompany} Technical Round 1</p>
                    <p className="text-xs text-slate-400 italic">Expected in {currentUser.daysRemaining} days</p>
                  </div>
                  <button 
                    onClick={() => setCurrentTab('interviews')}
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-[11px] font-bold transition-all text-center"
                  >
                    Simulate Interview Now
                  </button>
                </div>

              </div>

              {/* RECENT CHALLENGES & WEAK AREAS DUAL SPLIT GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Side: Topic mastery matrix */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  
                  {/* Mastery Topics Tracker */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Topic Master Matrix</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold text-slate-500 mb-2">Weak Topics (Needs Focus)</p>
                        <div className="flex flex-wrap gap-2">
                          {currentUser.weakTopics.map((topic: string) => (
                            <span key={topic} className="px-2.5 py-1 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium rounded-md flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-500 mb-2">Strong Topics (Mastered)</p>
                        <div className="flex flex-wrap gap-2">
                          {currentUser.strongTopics.map((topic: string) => (
                            <span key={topic} className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium rounded-md flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => setCurrentTab('problems')}
                      className="w-full mt-6 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-600 transition-all"
                    >
                      Browse Practice Map
                    </button>
                  </div>

                  {/* AI Quick Coach Block */}
                  <div className="bg-indigo-950 text-white rounded-xl p-5 border border-indigo-900 shadow-md">
                    <div className="flex items-center gap-2 text-indigo-400 mb-3">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">AI Quick Coach Recommendation</span>
                    </div>
                    <p className="text-sm font-semibold leading-snug mb-4">
                      "I recommend checking out our mock interview system for <span className="text-indigo-400">{currentUser.targetCompany}</span>! You should focus specifically on {currentUser.weakTopics[0] || 'Dynamic Programming'} optimization concepts."
                    </p>
                    <button 
                      onClick={() => { setCurrentTab('interviews'); }}
                      className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-[11px] font-bold text-white transition-all"
                    >
                      Book Interview Coach
                    </button>
                  </div>

                </div>

                {/* Right Side: Recommended Placement challenges */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  
                  {/* Daily Challenge Prompt Banner */}
                  <div className="bg-indigo-600 text-white p-6 rounded-xl relative overflow-hidden shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative z-10 max-w-md">
                      <span className="px-2 py-0.5 bg-indigo-800 text-[10px] font-bold tracking-widest uppercase rounded">DAILY PRACTICE TASK</span>
                      <h4 className="text-xl font-extrabold mt-1.5">Merge K Sorted Lists</h4>
                      <p className="text-indigo-100 text-xs mt-1">This high-frequency Hard problem is asked in 92% of Google and Microsoft technical loops.</p>
                    </div>
                    <button 
                      onClick={() => {
                        const prob = problems.find(p => p.id === 'two-sum') || problems[0];
                        if (prob) setSelectedProblem(prob);
                      }}
                      className="relative z-10 shrink-0 px-4 py-2 bg-white text-indigo-700 font-bold rounded-lg text-xs hover:bg-indigo-50 transition-all shrink-0"
                    >
                      Launch Workspace
                    </button>
                  </div>

                  {/* Recommended Problems Table */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Recommended for SDE Prep</h3>
                      <button onClick={() => setCurrentTab('problems')} className="text-indigo-600 text-xs font-bold hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                          <tr>
                            <th className="px-6 py-3">Problem Title</th>
                            <th className="px-6 py-3">Topic / Category</th>
                            <th className="px-6 py-3">Difficulty</th>
                            <th className="px-6 py-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {problems.slice(0, 4).map((prob) => (
                            <tr key={prob.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="text-sm font-semibold text-slate-800">{prob.title}</div>
                                <div className="text-[10px] text-slate-400 font-mono italic">
                                  Asked at: {prob.companyTags.slice(0, 3).join(', ')}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-[11px] text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                                  {prob.category}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`text-[10px] font-bold uppercase ${
                                  prob.difficulty === 'Easy' ? 'text-emerald-600' :
                                  prob.difficulty === 'Medium' ? 'text-amber-500' : 'text-rose-500'
                                }`}>
                                  {prob.difficulty}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={() => setSelectedProblem(prob)}
                                  className="text-indigo-600 text-xs font-bold hover:underline"
                                >
                                  Solve Challenge
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* ==========================================
              TAB 2: CODING CHALLENGES LIST
              ========================================== */}
          {currentTab === 'problems' && !selectedProblem && (
            <div className="space-y-6">
              
              {/* FILTER CONTROLS GRID */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search Bar */}
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="Search coding problems by title, topic, or company tag..."
                      value={problemSearch}
                      onChange={(e) => setProblemSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>

                  {/* Difficulty Filter */}
                  <div className="w-full md:w-44">
                    <select
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-indigo-500 transition-all"
                    >
                      <option value="All">All Difficulties</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div className="w-full md:w-48">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-indigo-500 transition-all"
                    >
                      <option value="All">All Topics</option>
                      {allTopicCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="w-full md:w-44">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-indigo-500 transition-all"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Solved">Solved</option>
                      <option value="Unsolved">Unsolved</option>
                      <option value="Bookmarked">Bookmarked</option>
                      <option value="Favorited">Favorited</option>
                    </select>
                  </div>
                </div>

                {/* Interactive filter pill chips */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center mr-2">Quick Tags:</span>
                  {['Google', 'Microsoft', 'Amazon', 'Meta', 'Arrays', 'HashMap', 'Dynamic Programming', 'Recursion', 'Binary Search'].map(chip => (
                    <button
                      key={chip}
                      onClick={() => setProblemSearch(chip)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-xs text-slate-600 rounded-full transition-all"
                    >
                      {chip}
                    </button>
                  ))}
                  {problemSearch && (
                    <button
                      onClick={() => setProblemSearch('')}
                      className="px-2.5 py-1 bg-rose-50 text-rose-600 text-xs rounded-full font-bold"
                    >
                      Clear Search ×
                    </button>
                  )}
                </div>
              </div>

              {/* LOCK PROGRESS SUMMARY TAG */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Gradual Challenge Lock Engine</span>
                  </div>
                  <p className="text-xs text-slate-600 max-w-2xl">
                    Medium and Hard questions unlock dynamically as you build foundational skills. Solve at least <span className="font-bold text-slate-800">3 Easy problems</span> to unlock Medium, and <span className="font-bold text-slate-800">2 Medium problems</span> to unlock Hard level.
                  </p>
                </div>
                <div className="flex gap-4 self-end sm:self-auto">
                  <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-center shadow-xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Easy Solved</div>
                    <div className="text-lg font-bold text-emerald-600">{solvedEasy}/3</div>
                  </div>
                  <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-center shadow-xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Medium Solved</div>
                    <div className="text-lg font-bold text-amber-500">{solvedMedium}/2</div>
                  </div>
                </div>
              </div>

              {/* CHALLENGE DATA GRID */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                      <tr>
                        <th className="px-6 py-4">Problem Name</th>
                        <th className="px-6 py-4">Topic Area</th>
                        <th className="px-6 py-4">Difficulty</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProblems.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-slate-400 text-sm">
                            <Terminal className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            No challenges found matching your filters.
                          </td>
                        </tr>
                      ) : (
                        filteredProblems.map((prob) => {
                          const isSolved = solvedIds.has(prob.id);
                          const isBookmarked = currentUser?.bookmarks?.includes(prob.id);
                          const isFavorited = currentUser?.favorites?.includes(prob.id);
                          const isLocked = 
                            (prob.difficulty === 'Medium' && solvedEasy < 3) ||
                            (prob.difficulty === 'Hard' && solvedMedium < 2);

                          return (
                            <tr key={prob.id} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="font-semibold text-slate-850 group-hover:text-indigo-600 transition-colors text-sm">
                                    {prob.title}
                                  </div>
                                  {isLocked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                                  {isSolved && <span className="text-xs text-emerald-500 font-bold" title="Solved Challenge">✓</span>}
                                  {isBookmarked && <span className="text-xs text-indigo-500" title="Bookmarked">🔖</span>}
                                  {isFavorited && <span className="text-xs text-amber-500" title="Favorited">⭐</span>}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                  {prob.companyTags.slice(0, 3).map(comp => (
                                    <span key={comp} className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 text-[9px] font-medium rounded">
                                      {comp}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                  {prob.topicTags.map(tag => (
                                    <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-md border border-slate-200">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                  prob.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                  prob.difficulty === 'Medium' ? 'bg-amber-50 text-amber-500 border border-amber-100' : 
                                  'bg-rose-50 text-rose-500 border border-rose-100'
                                }`}>
                                  {prob.difficulty}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs font-mono">
                                {isLocked ? (
                                  <span className="text-slate-400 flex items-center gap-1">
                                    <Lock className="w-3.5 h-3.5" /> Locked
                                  </span>
                                ) : isSolved ? (
                                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                                    ✓ Solved
                                  </span>
                                ) : (
                                  <span className="text-slate-500">Unsolved</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                {isLocked ? (
                                  <button
                                    onClick={() => alert(`This challenge is locked!\n\nTo unlock Medium-level questions: Solve at least 3 Easy questions (You solved: ${solvedEasy}/3).\nTo unlock Hard-level questions: Solve at least 2 Medium questions (You solved: ${solvedMedium}/2).`)}
                                    className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-400 text-xs font-bold rounded-lg flex items-center gap-1.5 ml-auto cursor-not-allowed"
                                  >
                                    <Lock className="w-3 h-3" /> Locked
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setSelectedProblem(prob)}
                                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-xs rounded-lg transition-all"
                                  >
                                    Solve Challenge
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              TAB 2.5: PRACTICE PROBLEMS WORKSPACE (IDE)
              ========================================== */}
          {selectedProblem && (
            <div className="h-[calc(100vh-10rem)] flex flex-col lg:flex-row gap-6">
              
              {/* LEFT COLUMN: PROBLEM DESCRIPTION AND HINTS */}
              <div className="w-full lg:w-1/2 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm shrink-0">
                
                {/* Description Workspace Nav tabs */}
                <div className="bg-slate-100 border-b border-slate-200 px-4 flex items-center justify-between shrink-0">
                  <div className="flex gap-1 overflow-x-auto">
                    <button
                      onClick={() => setActiveWorkspaceTab('description')}
                      className={`px-3 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                        activeWorkspaceTab === 'description' ? 'border-indigo-600 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Description
                    </button>
                    <button
                      onClick={() => setActiveWorkspaceTab('submissions')}
                      className={`px-3 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                        activeWorkspaceTab === 'submissions' ? 'border-indigo-600 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Previous Runs ({submissions.filter(s => s.problemId === selectedProblem.id).length})
                    </button>
                    <button
                      onClick={() => setActiveWorkspaceTab('editorial')}
                      className={`px-3 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                        activeWorkspaceTab === 'editorial' ? 'border-indigo-600 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Editorial Solution
                    </button>
                    <button
                      onClick={() => setActiveWorkspaceTab('discussions')}
                      className={`px-3 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                        activeWorkspaceTab === 'discussions' ? 'border-indigo-600 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Discussions ({discussions.length})
                    </button>
                  </div>
 
                  <button
                    onClick={() => setSelectedProblem(null)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 py-1 px-2.5 hover:bg-slate-200 rounded transition-all shrink-0 ml-2"
                  >
                    ← Back to List
                  </button>
                </div>
 
                {/* Sub-panels display container */}
                <div className="flex-1 overflow-y-auto p-6">
                  {activeWorkspaceTab === 'description' && (
                    <div className="space-y-6">
                      
                      {/* Problem Header */}
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold text-slate-850">{selectedProblem.title}</h1>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                              selectedProblem.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-850' :
                              selectedProblem.difficulty === 'Medium' ? 'bg-amber-100 text-amber-850' : 'bg-rose-100 text-rose-850'
                            }`}>
                              {selectedProblem.difficulty}
                            </span>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={handleToggleBookmark}
                              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Problem'}
                              className={`p-2 rounded-lg border transition-all ${
                                isBookmarked ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                              }`}
                            >
                              <Bookmark className="w-4 h-4 fill-current" />
                            </button>
                            <button
                              onClick={handleToggleFavorite}
                              title={isFavorite ? 'Remove Favorite' : 'Favorite Problem'}
                              className={`p-2 rounded-lg border transition-all ${
                                isFavorite ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                              }`}
                            >
                              <ThumbsUp className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        </div>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {selectedProblem.companyTags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-semibold rounded">
                              {tag}
                            </span>
                          ))}
                          {selectedProblem.topicTags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
 
                      <div className="h-px bg-slate-100"></div>
 
                      {/* Real Rich text description */}
                      <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed">
                        <p className="whitespace-pre-wrap">{selectedProblem.description}</p>
                      </div>
 
                      {/* Format Specifiers */}
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2">
                        <p className="text-xs text-slate-500"><strong className="text-slate-700 uppercase tracking-wide text-[10px]">Input Format:</strong> {selectedProblem.inputFormat}</p>
                        <p className="text-xs text-slate-500"><strong className="text-slate-700 uppercase tracking-wide text-[10px]">Output Format:</strong> {selectedProblem.outputFormat}</p>
                      </div>
 
                      {/* Examples panel */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Example Runs</h4>
                        {selectedProblem.examples.map((ex, index) => (
                          <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs">
                            <p className="text-slate-500 font-sans font-bold text-[10px] uppercase mb-1">Example {index + 1}:</p>
                            <p className="text-slate-800"><span className="text-slate-400">Input:</span> {ex.input}</p>
                            <p className="text-slate-800 mt-1"><span className="text-slate-400">Output:</span> {ex.output}</p>
                            {ex.explanation && <p className="text-slate-500 font-sans italic mt-2 text-[11px]"><span className="font-semibold text-[10px] not-italic uppercase text-slate-400">Explanation:</span> {ex.explanation}</p>}
                          </div>
                        ))}
                      </div>
 
                      {/* Constraints panel */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Constraints</h4>
                        <ul className="list-disc list-inside text-slate-600 text-xs space-y-1 font-mono">
                          {selectedProblem.constraints.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
 
                      {/* GEMINI AI ASSISTANCE CORNER */}
                      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 space-y-4 shadow-lg">
                        <div className="flex items-center gap-2 text-indigo-400">
                          <Sparkles className="w-4 h-4 animate-bounce" />
                          <span className="text-xs font-bold tracking-wider uppercase">Gemini Technical AI Co-Pilot</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-snug">
                          Get stuck? The AI can review your script line-by-line or drop subtle architectural suggestions without leaking the direct solution.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={triggerAiHint}
                            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg border border-slate-700 transition-all"
                          >
                            💡 Request Conceptual Hint
                          </button>
                          <button
                            onClick={triggerAiExplain}
                            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all"
                          >
                            🚀 Explain My Code
                          </button>
                        </div>
                      </div>
 
                    </div>
                  )}
 
                  {activeWorkspaceTab === 'submissions' && (
                    <div className="space-y-4 text-sm">
                      {submissions.filter(s => s.problemId === selectedProblem.id).length === 0 ? (
                        <p className="text-slate-400 text-center py-12 italic">You haven't run any scripts for this challenge yet.</p>
                      ) : (
                        submissions.filter(s => s.problemId === selectedProblem.id).map(sub => (
                          <div key={sub.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                sub.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}>
                                {sub.status}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">{sub.submittedAt.substring(0, 10)}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs font-mono mb-3">
                              <div><span className="text-slate-400">Runtime:</span> {sub.runtime}</div>
                              <div><span className="text-slate-400">Memory:</span> {sub.memory}</div>
                              <div><span className="text-slate-400">Lang:</span> {sub.language}</div>
                            </div>
                            <pre className="bg-slate-900 text-slate-300 p-3 rounded-md text-xs overflow-x-auto font-mono max-h-32">
                              {sub.code}
                            </pre>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeWorkspaceTab === 'editorial' && (
                    <div className="space-y-6">
                      
                      {/* Incremental Hints Panel */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                            <span>Incremental Hints Board</span>
                          </h4>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {revealedHints} of {Math.max(3, selectedProblem.hints?.length || 3)} Revealed
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {Array.from({ length: Math.max(3, selectedProblem.hints?.length || 3) }).map((_, hintIdx) => {
                            const isRevealed = revealedHints > hintIdx;
                            const canReveal = revealedHints === hintIdx;
                            const hintText = selectedProblem.hints?.[hintIdx] || (
                              hintIdx === 0 ? "Consider the optimal data structure. Can you use a hash-map or set to check existence in O(1)?" :
                              hintIdx === 1 ? "Think about the space vs time tradeoff. Extra storage can often unlock linear time execution." :
                              "Review extreme boundary constraints. Ensure you are handling empty/null structures or negative values gracefully."
                            );

                            return (
                              <div key={hintIdx} className={`p-3 rounded-lg border text-xs transition-all ${
                                isRevealed 
                                  ? 'bg-white border-slate-200 text-slate-700' 
                                  : 'bg-slate-100/75 border-slate-200 text-slate-400 select-none'
                              }`}>
                                <div className="flex items-center justify-between font-bold text-[10px] uppercase tracking-wider mb-1">
                                  <span>Hint {hintIdx + 1}</span>
                                  {isRevealed && <span className="text-emerald-500">Active ✓</span>}
                                </div>
                                {isRevealed ? (
                                  <p className="font-sans leading-relaxed text-[11.5px]">{hintText}</p>
                                ) : (
                                  <div className="flex items-center justify-between">
                                    <span className="italic">Hint is currently locked...</span>
                                    {canReveal ? (
                                      <button
                                        onClick={() => setRevealedHints(prev => prev + 1)}
                                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded transition-all"
                                      >
                                        Reveal Hint {hintIdx + 1}
                                      </button>
                                    ) : (
                                      <span className="text-[10px] text-slate-400">Reveal Hint {hintIdx} first</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Solution Gate */}
                      {!showFullSolution ? (
                        <div className="bg-slate-900 text-white border border-slate-800 rounded-xl p-8 text-center space-y-4 shadow-xl">
                          <div className="w-12 h-12 bg-indigo-950/80 rounded-full flex items-center justify-center mx-auto text-indigo-400 border border-indigo-900/60">
                            <Lock className="w-5 h-5 animate-pulse" />
                          </div>
                          <div className="max-w-md mx-auto space-y-1.5">
                            <h4 className="text-sm font-extrabold tracking-tight">Editorial Solution & Analysis is Locked</h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              We highly recommend trying to solve the problem or looking at all incremental hints first before revealing the full code solution.
                            </p>
                          </div>
                          <button
                            onClick={() => setShowFullSolution(true)}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-505 text-white font-bold text-xs rounded-lg transition-all shadow-md shadow-indigo-900/30 inline-flex items-center gap-1.5"
                          >
                            <span>🔓 Show Full Solution</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <span>🔓 Editorial Solution & Complexity Analysis</span>
                              </h3>
                              <p className="text-[11px] text-slate-500">Review optimal and brute force algorithms compiled by elite SDE leads.</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-mono font-bold rounded">
                                TIME: {selectedProblem.timeComplexity || 'O(N)'}
                              </span>
                              <span className="px-2.5 py-1 bg-slate-550/10 text-slate-650 text-xs font-mono font-bold rounded">
                                SPACE: {selectedProblem.spaceComplexity || 'O(1)'}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-4 text-xs leading-relaxed text-slate-750">
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                              <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px] mb-2 text-indigo-750">Method 1: Brute Force Approach</h4>
                              <p className="whitespace-pre-wrap text-xs bg-slate-50 p-3 rounded border border-slate-200 italic">
                                {selectedProblem.bruteForce || "Check all sub-optimal pathways or nested iterations to establish correctness guarantees before optimizing."}
                              </p>
                            </div>

                            <div className="bg-indigo-950/5 border border-indigo-100 rounded-xl p-4">
                              <h4 className="font-extrabold text-slate-800 uppercase tracking-wide text-xs mt-4">Method 2: Optimized Approach (Standard Optimal)</h4>
                              <p className="whitespace-pre-wrap text-xs bg-indigo-950/5 p-3 rounded border border-indigo-100">
                                {selectedProblem.optimized || "Use proper hashing mapping, two-pointer pointers, or linear scanning to satisfy the constraints cleanly in minimum time complexity."}
                              </p>
                            </div>
                          </div>

                          {/* Side-by-side solutions helper */}
                          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Placement Insight</p>
                              <p className="text-xs text-emerald-700 mt-1">
                                During interview loops, always state the brute force complexity explicitly first, explain why the trade-offs are sub-optimal, then transition smoothly into your optimized linear/hash solution.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeWorkspaceTab === 'discussions' && (
                    <div className="space-y-6">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Post a New Question / Insight</h4>
                        <form onSubmit={handleAddPost} className="space-y-3">
                          <input
                            type="text"
                            placeholder="Title of your post (e.g., Python map optimized logic...)"
                            value={newPostTitle}
                            onChange={(e) => setNewPostTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-500"
                            required
                          />
                          <textarea
                            placeholder="Detail your question, solution overview, or bug discussion..."
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            className="w-full h-20 p-3 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-500"
                            required
                          />
                          <div className="flex justify-between items-center">
                            <select
                              value={newPostCategory}
                              onChange={(e) => setNewPostCategory(e.target.value)}
                              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-600 focus:outline-none"
                            >
                              <option value="Question">Question 💡</option>
                              <option value="Solution">Solution 🚀</option>
                              <option value="Bug">Bug Report ✗</option>
                              <option value="General">General Talk</option>
                            </select>
                            <button
                              type="submit"
                              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded transition-all flex items-center gap-1"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Publish Post</span>
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Discussions List */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Forum Threads ({discussions.length})</h4>
                        {discussions.length === 0 ? (
                          <p className="text-slate-400 text-center text-xs py-8 italic">No discussions posted yet. Be the first to start the thread!</p>
                        ) : (
                          discussions.map(post => (
                            <div key={post.id} className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] rounded font-bold uppercase mr-2">
                                    {post.category}
                                  </span>
                                  <h5 className="font-bold text-slate-800 text-xs inline-block mt-1">{post.title}</h5>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">{post.createdAt.substring(0,10)}</span>
                              </div>

                              <p className="text-xs text-slate-600 whitespace-pre-wrap font-sans">{post.content}</p>

                              <div className="flex items-center gap-4 text-[10px] text-slate-450 pt-2 border-t border-slate-100">
                                <span className="font-semibold text-slate-500">By {post.userName}</span>
                                
                                <button
                                  onClick={() => handleLikePost(post.id)}
                                  className="flex items-center gap-1 text-slate-450 hover:text-indigo-600 transition-colors"
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                  <span>{post.likes} Likes</span>
                                </button>
                              </div>

                              {/* Replies lists */}
                              <div className="bg-slate-50 p-3 rounded-lg space-y-2 mt-2">
                                {post.replies?.map((rep: any) => (
                                  <div key={rep.id} className="text-xs border-b border-slate-200 pb-1.5 last:border-0 last:pb-0">
                                    <div className="flex justify-between text-[10px] text-slate-400">
                                      <span className="font-semibold text-slate-600">{rep.userName}</span>
                                      <span>{rep.createdAt.substring(11,16)}</span>
                                    </div>
                                    <p className="text-slate-700 mt-1 text-[11px]">{rep.content}</p>
                                  </div>
                                ))}

                                {/* Add Reply inline */}
                                <div className="flex gap-2 mt-2">
                                  <input
                                    type="text"
                                    placeholder="Write a reply..."
                                    value={replyContent[post.id] || ''}
                                    onChange={(e) => setReplyContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                                    className="flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-500"
                                  />
                                  <button
                                    onClick={() => handleAddReply(post.id)}
                                    className="px-3 bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs rounded transition-all"
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>

                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
 
              {/* RIGHT COLUMN: RICH CODE EDITOR AND TEST RUNNER */}
              <div className="flex-1 flex flex-col bg-slate-900 rounded-xl overflow-hidden shadow-2xl min-w-0">
                
                {/* Editor control headers */}
                <div className="bg-slate-800 border-b border-slate-700 px-4 py-2.5 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-300 font-semibold text-xs uppercase tracking-wide">Language Template</span>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="bg-slate-900 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none"
                    >
                      <option value="python">Python 3</option>
                      <option value="javascript">JavaScript (ES6)</option>
                      <option value="cpp">C++ (G++17)</option>
                      <option value="c">C (GCC 11)</option>
                      <option value="java">Java (JDK 17)</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-mono flex items-center gap-1 bg-slate-850 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
                      <Clock className="w-3.5 h-3.5 text-indigo-450 shrink-0" />
                      <span>CLOCK: {formatTime(secondsElapsed)}</span>
                    </span>
                    <button
                      onClick={() => setIsTimerActive(!isTimerActive)}
                      className={`text-[9px] font-bold px-2 py-1 rounded border transition-all ${
                        isTimerActive ? 'bg-rose-950/40 border-rose-900 text-rose-300' : 'bg-emerald-950/40 border-emerald-900 text-emerald-300'
                      }`}
                    >
                      {isTimerActive ? 'PAUSE' : 'RESUME'}
                    </button>
                  </div>
                </div>
 
                {/* Main Script Code area with Monaco Editor */}
                <div className="flex-1 relative min-h-[250px]">
                  <Editor
                    height="100%"
                    language={selectedLanguage === 'python' ? 'python' : selectedLanguage === 'javascript' ? 'javascript' : selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage === 'c' ? 'c' : 'java'}
                    theme="vs-dark"
                    value={editorCode}
                    onChange={(val) => setEditorCode(val || '')}
                    onMount={(editor, monaco) => {
                      editorRef.current = editor;
                      monacoRef.current = monaco;
                    }}
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      lineNumbers: 'on',
                      automaticLayout: true,
                      tabSize: 4
                    }}
                  />
                </div>
 
                {/* RUNNER PANEL */}
                <div className="h-64 bg-slate-850 border-t border-slate-700 flex flex-col shrink-0">
                  
                  {/* Action Pipeline Buttons */}
                  <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700 shrink-0">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Test Suite Engine</span>
                      <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={useCustomInput}
                          onChange={(e) => setUseCustomInput(e.target.checked)}
                          className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                        />
                        <span>Custom Input</span>
                      </label>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => editorRef.current?.getAction('editor.action.formatDocument')?.run()}
                        className="px-3 py-1.5 bg-slate-750 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg border border-slate-700 transition-all flex items-center gap-1"
                        title="Format Code"
                      >
                        <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Format</span>
                      </button>
                      <button
                        onClick={runCode}
                        disabled={executionLoading}
                        className="px-4 py-1.5 bg-slate-750 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg border border-slate-700 transition-all flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Run Local Tests
                      </button>
                      <button
                        onClick={submitCode}
                        disabled={executionLoading}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-indigo-900/30"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Submit SDE Pipeline
                      </button>
                    </div>
                  </div>
 
                  {/* Output viewport console */}
                  <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-300">
                    {useCustomInput && (
                      <div className="mb-4 space-y-1.5 bg-slate-900 p-2.5 rounded border border-slate-700">
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Custom Testcase Input:</span>
                        <textarea
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          placeholder="Provide input arguments (e.g. [2,7,11,15]\n9 for Two Sum)"
                          className="w-full h-12 p-1.5 bg-slate-850 text-slate-100 font-mono text-xs rounded border border-slate-700 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    )}

                    {executionLoading ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
                        <span>Compiling and executing test harness...</span>
                      </div>
                    ) : executionResult ? (
                      <div className="space-y-3">
                        {/* Summary Header */}
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="font-bold text-[11px] uppercase tracking-wider">Result Summary</span>
                          <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] ${
                            executionResult.status === 'Accepted' || executionResult.status === 'Success'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' 
                              : executionResult.status === 'Compile Error'
                              ? 'bg-rose-950 text-rose-400 border border-rose-900 animate-pulse'
                              : 'bg-rose-950/50 text-rose-400 border border-rose-900/50'
                          }`}>
                            {executionResult.status}
                          </span>
                        </div>

                        {/* If Compile Error */}
                        {executionResult.status === 'Compile Error' ? (
                          <div className="p-3 bg-rose-950/20 border border-rose-900/60 rounded-lg space-y-2">
                            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>Compilation Failure {executionResult.lineNum && `at Line ${executionResult.lineNum}`}</span>
                            </div>
                            <pre className="whitespace-pre-wrap font-mono text-[11px] text-rose-350 bg-rose-950/40 p-2.5 rounded border border-rose-950/80 overflow-x-auto leading-relaxed">
                              {executionResult.error || (executionResult.results?.[0]?.error) || 'Unknown compilation error'}
                            </pre>
                            <p className="text-[10px] text-rose-450 italic">The compiler highlighted line {executionResult.lineNum || 'unknown'} in your editor panel above.</p>
                          </div>
                        ) : (
                          <>
                            {/* Performance Stats if Accepted */}
                            {(executionResult.status === 'Accepted' || executionResult.status === 'Success') && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] bg-emerald-950/10 border border-emerald-900/30 p-3 rounded-lg text-slate-300">
                                <div>
                                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-bold">Status:</span>
                                  <span className="text-emerald-400 font-bold">Accepted ✓</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-bold">Runtime:</span>
                                  <span className="font-mono text-slate-200">{executionResult.runtime || '12 ms'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-bold">Memory:</span>
                                  <span className="font-mono text-slate-200">{executionResult.memory || '16.4 MB'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-bold">Passed Cases:</span>
                                  <span className="font-semibold text-emerald-400">
                                    {executionResult.passedCount !== undefined ? executionResult.passedCount : (executionResult.results?.filter((r: any) => r.passed).length || 0)} 
                                    / 
                                    {executionResult.totalCases !== undefined ? executionResult.totalCases : (executionResult.results?.length || 0)}
                                  </span>
                                </div>
                                <div className="col-span-2 md:col-span-4 pt-1.5 border-t border-slate-800/60 mt-1 flex items-center justify-between text-[10px] text-slate-400">
                                  <span>Beats <span className="text-emerald-400 font-bold">{(85 + Math.random() * 14).toFixed(1)}%</span> of all candidates</span>
                                  <span className="text-indigo-400 font-semibold tracking-wide">Excellent Pipeline Output!</span>
                                </div>
                              </div>
                            )}

                            {/* If there are standard execution results with a logical error or runtime error */}
                            {executionResult.results ? (
                              <div className="space-y-2">
                                {executionResult.results.map((r: any) => {
                                  const isFailed = !r.passed;
                                  return (
                                    <div key={r.testCaseIndex} className={`p-3 rounded-lg border ${
                                      isFailed 
                                        ? 'bg-rose-950/5 border-rose-900/30' 
                                        : 'bg-slate-900 border-slate-800'
                                    }`}>
                                      <div className="flex justify-between items-center mb-2 text-[11px]">
                                        <span className="font-bold text-slate-400">
                                          Test Case #{r.testCaseIndex} {r.isHidden && '(Hidden Case)'}
                                        </span>
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                          r.passed 
                                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' 
                                            : 'bg-rose-950/40 text-rose-400 border border-rose-900/30'
                                        }`}>
                                          {r.passed ? 'PASSED ✓' : r.status || 'FAILED ✗'}
                                        </span>
                                      </div>

                                      {!r.isHidden ? (
                                        <div className="space-y-1.5 text-slate-300 font-mono text-[11px]">
                                          <div className="bg-slate-950/40 p-1.5 rounded border border-slate-800/40">
                                            <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider block mb-0.5">Input:</span>
                                            <span className="text-slate-200">{r.input}</span>
                                          </div>
                                          
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            <div className="bg-emerald-950/10 p-1.5 rounded border border-emerald-900/20">
                                              <span className="text-emerald-500 text-[9px] uppercase font-bold tracking-wider block mb-0.5">Expected Output:</span>
                                              <span className="text-emerald-400 font-semibold">{r.expected}</span>
                                            </div>

                                            <div className={`p-1.5 rounded border ${
                                              isFailed 
                                                ? 'bg-rose-950/20 border-rose-900/40 text-rose-400 font-bold' 
                                                : 'bg-slate-950/30 border-slate-800/40 text-slate-200 font-semibold'
                                            }`}>
                                              <span className={`${isFailed ? 'text-rose-550' : 'text-slate-500'} text-[9px] uppercase font-bold tracking-wider block mb-0.5`}>
                                                User Output:
                                              </span>
                                              <span>
                                                {r.actual || 'No output stream'}
                                              </span>
                                            </div>
                                          </div>

                                          {isFailed && (
                                            <div className="bg-rose-950/30 p-2 rounded border border-rose-900/40 space-y-1 text-rose-300">
                                              <div className="text-[10px] uppercase font-bold text-rose-450">Difference Detected:</div>
                                              <div className="text-xs font-semibold">
                                                Mismatch found. Expected <code className="bg-emerald-950 px-1 py-0.5 rounded text-emerald-400 font-mono text-[10px]">{r.expected}</code>, but your solution returned <code className="bg-rose-950 px-1 py-0.5 rounded text-rose-400 font-mono text-[10px]">{r.actual || 'None'}</code>.
                                              </div>
                                              {r.error && (
                                                <div className="text-[10px] text-rose-400 mt-1 pt-1 border-t border-rose-900/20 whitespace-pre-wrap font-mono">
                                                  <strong>Stack Trace:</strong> {r.error}
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="text-[10px] text-slate-500 italic">
                                          This is a hidden evaluation case. Expected and actual values are hidden to maintain competitive placement standards.
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <pre className="whitespace-pre-wrap text-slate-400 p-3 bg-slate-900 border border-slate-800 rounded-lg">{executionResult.error || 'Execution complete.'}</pre>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-600 italic">
                        Console ready. Write code, compile local tests, or push to placement pipeline.
                      </div>
                    )}
                  </div>
 
                </div>
 
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 3: AI MOCK INTERVIEW PRACTICE
              ========================================== */}
          {currentTab === 'interviews' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              
              {/* INTERVIEW STAGE 1: SETUP SCREEN */}
              {interviewStep === 'setup' && (
                <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-6">
                  
                  <div className="text-center max-w-xl mx-auto">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-800">SDE Placement Interview Mock Harness</h3>
                    <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                      Initialize a highly realistic simulation of SDE hiring bar challenges. The interview asks specific, logical structured questions one-by-one, evaluates your replies, and generates an official mastery feedback card.
                    </p>
                  </div>

                  <div className="h-px bg-slate-100"></div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Company */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Interviewer Profile</label>
                      <select
                        value={targetCompany}
                        onChange={(e) => setTargetCompany(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none"
                      >
                        <option value="Google">Google (SDE Core Bar)</option>
                        <option value="Microsoft">Microsoft (Modular Design)</option>
                        <option value="Amazon">Amazon (Leadership / STAR)</option>
                        <option value="Meta">Meta (System Execution speed)</option>
                        <option value="Atlassian">Atlassian (Values & Design)</option>
                        <option value="Goldman Sachs">Goldman Sachs (Algorithms)</option>
                      </select>
                    </div>

                    {/* Interview Round Category */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Interview Domain Round</label>
                      <select
                        value={interviewType}
                        onChange={(e) => setInterviewType(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none"
                      >
                        <option value="Technical">Technical (DS, DB, Networks, OS)</option>
                        <option value="Coding">Coding Walkthrough & Algorithm Bounds</option>
                        <option value="Behavioral">HR / Behavioral / Project Loop</option>
                        <option value="Managerial">Managerial / Architecture Tradeoffs</option>
                      </select>
                    </div>

                    {/* Primary Technical Focus Area */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subject / Focus Core</label>
                      <select
                        value={interviewTopic}
                        onChange={(e) => setInterviewTopic(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none"
                      >
                        <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                        <option value="System Design & Scalability">System Design & Scalability</option>
                        <option value="Database Management (DBMS, SQL)">Database Management (DBMS, SQL)</option>
                        <option value="Operating Systems & Concurrency">Operating Systems & Concurrency</option>
                        <option value="Object Oriented Programming (OOP)">Object Oriented Programming (OOP)</option>
                        <option value="Self Introduction & Career Ambitions">Self Introduction & Career Ambitions (HR focus)</option>
                      </select>
                    </div>

                    {/* Difficulty */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Interviewer Strictness</label>
                      <select
                        value={interviewDifficulty}
                        onChange={(e) => setInterviewDifficulty(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none"
                      >
                        <option value="Easy">Standard / Warmup</option>
                        <option value="Medium">Medium (General SDE Standard)</option>
                        <option value="Hard">Strict (FAANG Senior Level)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 text-center">
                    <button
                      onClick={startInterview}
                      disabled={chatLoading}
                      className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white font-bold text-sm rounded-lg transition-all shadow-md shadow-indigo-900/30 inline-flex items-center gap-2"
                    >
                      {chatLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Preparing Interview Loop...</span>
                        </>
                      ) : (
                        <>
                          <span>Connect To AI Interviewer</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                </div>
              )}

              {/* INTERVIEW STAGE 2: ACTIVE CONVERSATIONAL CHAT */}
              {interviewStep === 'chat' && activeInterview && (() => {
                const totalSecs = activeInterview.difficulty === 'Easy' ? 1200 : activeInterview.difficulty === 'Hard' ? 2700 : 1800;
                const elapsedSecs = totalSecs - interviewTimeRemaining;
                const progressPercent = Math.max(0, Math.min(100, (interviewTimeRemaining / totalSecs) * 100));
                const questionNum = Math.max(1, activeInterview.chatHistory.filter(c => c.role === 'interviewer').length);

                return (
                  <div className="flex flex-col h-[calc(100vh-12rem)] bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    
                    {/* Interview Status Header bar */}
                    <div className="bg-slate-900 text-white px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <div>
                          <span className="font-bold text-sm block">Mock Session: {activeInterview.companyName} {activeInterview.interviewType}</span>
                          <span className="text-[10px] text-slate-400">Current round: {activeInterview.rounds[activeInterview.currentRoundIndex] || 'Round Panel'}</span>
                        </div>
                      </div>

                      {/* Live Timer Dashboard Panel */}
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-[10px] text-slate-400">Duration:</span>
                          <span className="text-white font-bold">{formatTime(elapsedSecs)}</span>
                        </div>

                        <div className="bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-750 flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400">Question:</span>
                          <span className="text-indigo-300 font-extrabold font-sans">#{questionNum}</span>
                        </div>

                        <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                          interviewTimeRemaining < 300 
                            ? 'bg-rose-950/40 border-rose-900 text-rose-400 animate-pulse' 
                            : 'bg-slate-800 border-slate-700 text-slate-200'
                        }`}>
                          <span className="text-[10px] text-slate-450">Remaining:</span>
                          <span className="font-bold font-mono text-xs">{formatTime(interviewTimeRemaining)}</span>
                        </div>
                      </div>

                      <button
                        onClick={evaluateAndConcludeInterview}
                        disabled={evaluatingLoading}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-800 text-white font-bold text-xs rounded-lg transition-all shadow shadow-rose-900/30"
                      >
                        {evaluatingLoading ? 'Evaluating...' : 'Submit Evaluation Report'}
                      </button>
                    </div>

                    {/* Dynamic Countdown Progress Bar */}
                    <div className="w-full h-1 bg-slate-800 shrink-0">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          interviewTimeRemaining < 300 ? 'bg-rose-500' : 'bg-indigo-500'
                        }`} 
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>

                  {/* Dynamic Chat scroll viewport */}
                  <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4">
                    {activeInterview.chatHistory.map((chat, idx) => {
                      const isInterviewer = chat.role === 'interviewer';
                      return (
                        <div key={idx} className={`flex ${isInterviewer ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-2xl flex gap-3 ${isInterviewer ? 'flex-row' : 'flex-row-reverse'}`}>
                            {/* Avatar Icon */}
                            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs shadow-sm ${
                              isInterviewer ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-800'
                            }`}>
                              {isInterviewer ? 'AI' : 'ME'}
                            </div>

                            {/* Message text bubble */}
                            <div className={`p-4 rounded-xl text-sm leading-relaxed shadow-sm border ${
                              isInterviewer 
                                ? 'bg-white border-slate-150 text-slate-800' 
                                : 'bg-indigo-650 border-indigo-750 text-white'
                            }`}>
                              <p className="whitespace-pre-wrap">{chat.text}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="flex gap-3 max-w-2xl">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                            AI
                          </div>
                          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-slate-400 text-xs flex items-center gap-2">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                            <span>Interviewer is analyzing your response...</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={chatBottomRef} />
                  </div>

                  {/* BOTTOM ACTION BAR AND VOICE CHAT TOGGLES */}
                  <div className="bg-white border-t border-slate-200 p-4 shrink-0">
                    <div className="flex items-end gap-3">
                      
                      {/* Speech to Text Microphone trigger */}
                      <button
                        onClick={toggleSpeechRecognition}
                        className={`p-3 rounded-lg border transition-all ${
                          isListening 
                            ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse' 
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                        title="Toggle voice typing"
                      >
                        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>

                      {/* Text Input area */}
                      <div className="flex-1 relative">
                        <textarea
                          rows={2}
                          value={candidateResponse}
                          onChange={e => setCandidateResponse(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendInterviewAnswer();
                            }
                          }}
                          placeholder={isListening ? "Listening... Speak your answer clearly." : "Type your technical answer details here... (Press Enter to submit)"}
                          className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
                        />
                        
                        <button
                          onClick={sendInterviewAnswer}
                          disabled={!candidateResponse.trim() || chatLoading}
                          className="absolute right-3.5 bottom-3 text-indigo-600 hover:text-indigo-500 disabled:text-slate-300 transition-all"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>

                    </div>
                    
                    <div className="mt-2 flex justify-between items-center text-[10px] text-slate-400">
                      <span>Pro-tip: Answer using the STAR framework (Situation, Task, Action, Result) for behavioral loop rounds.</span>
                      {isListening && <span className="text-rose-500 font-semibold animate-pulse">● VOICE CAPTURE ACTIVE</span>}
                    </div>
                  </div>

                </div>
                );
              })()}

              {/* INTERVIEW STAGE 3: FULL COMPREHENSIVE PERFORMANCE CARD REPORT */}
              {interviewStep === 'report' && activeInterview && activeInterview.report && (
                <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-8">
                  
                  {/* Report Header */}
                  <div className="text-center border-b border-slate-100 pb-6 relative">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full uppercase tracking-wider">
                      Official SDE Evaluation Card
                    </span>
                    <h3 className="text-2xl font-extrabold text-slate-850 mt-2">Placement Mock Result Report</h3>
                    <p className="text-xs text-slate-400 mt-1 font-mono">{activeInterview.companyName} Simulated Hiring Loop | Date: {activeInterview.createdAt.substring(0, 10)}</p>

                    <button 
                      onClick={() => setInterviewStep('setup')}
                      className="absolute right-0 top-0 text-xs font-bold text-indigo-600 hover:underline"
                    >
                      ← Take Another Mock
                    </button>
                  </div>

                  {/* VISUAL REPORT METERS IN GRID */}
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                    
                    {/* Gauge meter utility component */}
                    {[
                      { label: 'Overall SDE Bar', score: activeInterview.report.overallScore, color: 'text-indigo-600' },
                      { label: 'Technical Depth', score: activeInterview.report.technicalScore, color: 'text-rose-500' },
                      { label: 'Communication Score', score: activeInterview.report.communicationScore, color: 'text-emerald-500' },
                      { label: 'Grammar Accuracy', score: activeInterview.report.grammarScore || 80, color: 'text-cyan-500' },
                      { label: 'Confidence & Delivery', score: activeInterview.report.confidenceScore, color: 'text-amber-500' },
                      { label: 'Problem Solving', score: activeInterview.report.problemSolvingScore, color: 'text-blue-500' }
                    ].map((g, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center flex flex-col justify-between items-center shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{g.label}</span>
                        
                        {/* Custom visual ring representation */}
                        <div className="relative w-24 h-24 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                              className={g.color}
                              strokeDasharray={`${2 * Math.PI * 40}`}
                              strokeDashoffset={`${2 * Math.PI * 40 * (1 - g.score / 100)}`}
                            />
                          </svg>
                          <span className="absolute text-2xl font-black font-mono text-slate-800">{g.score}%</span>
                        </div>

                        <span className="text-[11px] font-semibold text-slate-500 mt-2">
                          {g.score >= 85 ? 'Bar Passed' : g.score >= 70 ? 'Competent' : 'Needs Polish'}
                        </span>
                      </div>
                    ))}

                  </div>

                  {/* STRENGTHS AND WEAK AREAS GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    
                    {/* Strengths */}
                    <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" />
                        <span>Hiring Bar Strengths</span>
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-600">
                        {activeInterview.report.strongAreas.map((item, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses */}
                    <div className="p-5 bg-rose-50/50 border border-rose-100 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" />
                        <span>Hiring Bar Weaknesses</span>
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-600">
                        {activeInterview.report.weakAreas.map((item, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-rose-500 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  {/* ACTION RECOMMENDATIONS */}
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Coach Improvement Recommendations</h4>
                    <div className="space-y-2 text-xs text-slate-600">
                      {activeInterview.report.suggestions.map((s, idx) => (
                        <div key={idx} className="flex gap-3 bg-white p-3 border border-slate-150 rounded-lg shadow-sm">
                          <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px] shrink-0">{idx+1}</span>
                          <span className="leading-relaxed">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CUSTOMIZED 5-DAY STUDY PLAN */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customized placement Prep Study Plan</h4>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {activeInterview.report.studyPlan.map((step, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between h-40">
                          <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-500"></div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{step.day}</span>
                            <p className="text-xs font-semibold text-slate-700 mt-2 leading-relaxed">{step.task}</p>
                          </div>
                          
                          <button 
                            onClick={() => {
                              setCurrentTab('problems');
                              setInterviewStep('setup');
                            }}
                            className="text-[10px] font-bold text-indigo-600 hover:underline text-left mt-3"
                          >
                            Explore challenge →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* STUDY METRICS AND PDF EXPORT TRIGGER */}
                  <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-500">
                      We've mapped custom prep algorithms to resolve your <span className="font-semibold text-rose-600">"{activeInterview.report.weakAreas[0] || 'System Architectures'}"</span> weakness.
                    </div>
                    <button 
                      onClick={() => alert("Simulating Report Download... CSV/PDF payload logged successfully!")}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all shadow flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Official SDE PDF Report
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* ==========================================
              TAB 4: COMPANY WISE PATH TRACKS
              ========================================== */}
          {currentTab === 'companies' && (() => {
            // Check if there is an exact search query match to open a company's page immediately
            const searchedCompanyExact = companiesList.find(c => 
              c.name.toLowerCase() === companySearch.trim().toLowerCase()
            );

            // Determine if we should render a detailed company view
            // It can be triggered either by having selectedCompanyTrack OR by having an exact search match
            const activeCompanyObj = selectedCompanyTrack || searchedCompanyExact;

            // Compute filtered list of companies for the grid
            const filteredCompanies = companiesList.filter(c => {
              // Search Filter
              const matchesSearch = c.name.toLowerCase().includes(companySearch.toLowerCase()) || 
                                    c.topics.some((t: string) => t.toLowerCase().includes(companySearch.toLowerCase()));
              
              // Type Filter
              const matchesType = companyTypeFilter === 'All' || c.type === companyTypeFilter;

              // Difficulty Filter
              const matchesDifficulty = companyDifficultyFilter === 'All' || c.difficulty === companyDifficultyFilter;

              // Hiring Status Filter
              const matchesHiring = companyHiringFilter === 'All' || c.hiringStatus === companyHiringFilter;

              // Internship Filter
              const matchesInternship = !companyInternshipFilter || c.internshipOpportunity;

              // Full-Time Filter
              const matchesFullTime = !companyFullTimeFilter || c.fullTimeOpportunity;

              return matchesSearch && matchesType && matchesDifficulty && matchesHiring && matchesInternship && matchesFullTime;
            });

            if (companiesLoading) {
              return (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-500 font-medium text-sm">Loading company SDE preparation tracks from database...</p>
                </div>
              );
            }

            if (companiesError) {
              return (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6 text-center max-w-lg mx-auto my-12">
                  <h4 className="font-bold text-lg">System Error</h4>
                  <p className="text-xs mt-2">{companiesError}</p>
                  <button 
                    onClick={fetchCompanies}
                    className="mt-4 px-4 py-2 bg-red-650 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-all"
                  >
                    Retry Connection
                  </button>
                </div>
              );
            }

            // Render Detailed View
            if (activeCompanyObj) {
              const activeCompanyProblems = problems.filter(p => 
                p.companyTags.some(c => c.toLowerCase() === activeCompanyObj.name.toLowerCase())
              );
              return (
                <div className="space-y-6">
                  {/* Back button and breadcrumbs */}
                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={() => {
                        setSelectedCompanyTrack(null);
                        setCompanySearch(''); // Clear search to go back cleanly
                      }}
                      className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all"
                    >
                      ← Back to Companies
                    </button>
                    <div className="text-xs text-slate-400 font-mono">
                      Companies / {activeCompanyObj.name} Prep Guide
                    </div>
                  </div>

                  {/* Header Banner */}
                  <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-6 shadow-md border border-slate-800 animate-fadeIn">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center font-black text-2xl text-white tracking-widest uppercase border border-white/20 shadow-inner">
                          {activeCompanyObj.name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase tracking-wider ${
                              activeCompanyObj.hiringStatus === 'Hiring Now' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              activeCompanyObj.hiringStatus === 'Upcoming' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                              'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                              {activeCompanyObj.hiringStatus}
                            </span>
                            <span className="px-2.5 py-0.5 bg-white/15 text-slate-200 text-[10px] font-bold rounded-full uppercase">
                              {activeCompanyObj.type} Company
                            </span>
                          </div>
                          <h3 className="text-3xl font-black tracking-tight mt-1">{activeCompanyObj.name}</h3>
                          <p className="text-slate-300 text-xs mt-1 font-mono">Difficulty: {activeCompanyObj.difficulty} • {activeCompanyObj.roundsCount} Interview Rounds • Salary Range: {activeCompanyObj.salaryRange}</p>
                        </div>
                      </div>

                      <div className="flex gap-2.5 shrink-0">
                        <button
                          onClick={() => {
                            setTargetCompany(activeCompanyObj.name);
                            setInterviewTopic(activeCompanyObj.topics[0] || 'DSA & Algorithms');
                            setInterviewDifficulty(activeCompanyObj.difficulty);
                            setCurrentTab('interviews');
                            setInterviewStep('setup');
                          }}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-lg transition-all shadow-lg flex items-center gap-2"
                        >
                          Launch Mock Interview
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-xs text-slate-300">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Key Focus Topics</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {activeCompanyObj.topics.map((t: string) => (
                            <span key={t} className="px-2 py-0.5 bg-white/10 rounded font-semibold text-white">{t}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Eligibility Criteria</span>
                        <p className="text-slate-200 leading-relaxed font-medium">{activeCompanyObj.eligibility}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Opportunities Mapped</span>
                        <div className="flex gap-2 mt-1">
                          {activeCompanyObj.internshipOpportunity && (
                            <span className="px-2.5 py-0.5 bg-emerald-500/25 text-emerald-300 font-bold rounded">Internships</span>
                          )}
                          {activeCompanyObj.fullTimeOpportunity && (
                            <span className="px-2.5 py-0.5 bg-blue-500/25 text-blue-300 font-bold rounded">Full-Time (FTE)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 cols */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Overview & Selection Process */}
                      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Company Overview</h4>
                          <p className="text-xs text-slate-600 leading-relaxed mt-2.5">{activeCompanyObj.overview}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Detailed Selection Process</h4>
                          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line mt-2.5">{activeCompanyObj.selectionProcess}</p>
                        </div>
                      </div>

                      {/* Timeline Round Patterns */}
                      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
                        <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Interview Round Architectures</h4>
                        <div className="space-y-4">
                          <div className="relative pl-6 border-l-2 border-indigo-100 pb-1">
                            <div className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Round 1: Online Assessment (OA) Pattern</span>
                            <p className="text-xs text-slate-600 leading-relaxed mt-1">{activeCompanyObj.oaPattern}</p>
                          </div>

                          <div className="relative pl-6 border-l-2 border-indigo-100 pb-1">
                            <div className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Round 2: Algorithm & Coding Round Pattern</span>
                            <p className="text-xs text-slate-600 leading-relaxed mt-1">{activeCompanyObj.codingRoundPattern}</p>
                          </div>

                          <div className="relative pl-6 border-l-2 border-indigo-100 pb-1">
                            <div className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Round 3: Core Technical Interview Pattern</span>
                            <p className="text-xs text-slate-600 leading-relaxed mt-1">{activeCompanyObj.technicalPattern}</p>
                          </div>

                          {activeCompanyObj.systemDesignRound && (
                            <div className="relative pl-6 border-l-2 border-indigo-100 pb-1">
                              <div className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Round 4: System Design Architectural Round</span>
                              <p className="text-xs text-slate-600 leading-relaxed mt-1">{activeCompanyObj.systemDesignRound}</p>
                            </div>
                          )}

                          <div className="relative pl-6 pb-1">
                            <div className="absolute -left-[4px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Round 5: HR / Hiring Manager Alignment Pattern</span>
                            <p className="text-xs text-slate-600 leading-relaxed mt-1">{activeCompanyObj.hrPattern}</p>
                          </div>
                        </div>
                      </div>

                      {/* Frequently Asked Questions */}
                      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
                        <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Interview Preparation FAQs</h4>
                        
                        <div className="space-y-4">
                          <h5 className="text-xs font-bold text-indigo-650 uppercase tracking-wide flex items-center gap-1.5">
                            <span>💡 Coding Assessment FAQ</span>
                          </h5>
                          {activeCompanyObj.faqsCoding.map((faq: any, i: number) => (
                            <div key={i} className="bg-slate-50 p-3.5 rounded-lg border border-slate-150 text-xs">
                              <strong className="text-slate-800 block mb-1.5">Q: {faq.question}</strong>
                              <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-4 pt-2">
                          <h5 className="text-xs font-bold text-indigo-655 uppercase tracking-wide flex items-center gap-1.5">
                            <span>💻 Technical & System FAQ</span>
                          </h5>
                          {activeCompanyObj.faqsTechnical.map((faq: any, i: number) => (
                            <div key={i} className="bg-slate-50 p-3.5 rounded-lg border border-slate-150 text-xs">
                              <strong className="text-slate-800 block mb-1.5">Q: {faq.question}</strong>
                              <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-4 pt-2">
                          <h5 className="text-xs font-bold text-indigo-660 uppercase tracking-wide flex items-center gap-1.5">
                            <span>🌸 Behavioral & Culture FAQ</span>
                          </h5>
                          {activeCompanyObj.faqsHR.map((faq: any, i: number) => (
                            <div key={i} className="bg-slate-50 p-3.5 rounded-lg border border-slate-150 text-xs">
                              <strong className="text-slate-800 block mb-1.5">Q: {faq.question}</strong>
                              <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommended Coding Challenges */}
                      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Highly Recommended Algorithmic Problems</h4>
                          <p className="text-xs text-slate-405 mt-1">Highly relevant coding challenges from our verified curriculum mapped to this company's focus tags.</p>
                        </div>

                        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-xs">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
                              <tr>
                                <th className="px-4 py-3">Challenge Title</th>
                                <th className="px-4 py-3">Topic</th>
                                <th className="px-4 py-3">Difficulty</th>
                                <th className="px-4 py-3 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                              {activeCompanyProblems.length > 0 ? (
                                activeCompanyProblems.map(prob => (
                                  <tr key={prob.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-slate-850">{prob.title}</td>
                                    <td className="px-4 py-3">
                                      <div className="flex gap-1">
                                        {prob.topicTags.slice(0, 2).map(t => (
                                          <span key={t} className="px-1.5 py-0.5 bg-slate-100 rounded border text-[9px] font-medium">{t}</span>
                                        ))}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                        prob.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                        prob.difficulty === 'Medium' ? 'bg-amber-50 text-amber-500 border border-amber-100' :
                                        'bg-rose-50 text-rose-500 border border-rose-100'
                                      }`}>
                                        {prob.difficulty}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <button
                                        onClick={() => setSelectedProblem(prob)}
                                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-[10px] rounded-md transition-all shadow-xs"
                                      >
                                        Solve Challenge
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={4} className="text-center py-8 text-slate-400 font-mono">No specific challenges mapped yet. Explore our curated global practice library!</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Right column sidebar */}
                    <div className="space-y-6">
                      {/* Preparation Roadmap */}
                      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                        <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-indigo-600" />
                          <span>Curated Preparation Roadmap</span>
                        </h4>
                        <div className="space-y-3">
                          {activeCompanyObj.prepRoadmap.map((step: string, i: number) => (
                            <div key={i} className="flex gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-150">
                              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow">
                                {i + 1}
                              </span>
                              <p className="text-slate-650 leading-relaxed font-semibold">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Real Candidate Experiences */}
                      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                        <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                          🌟 Interview Experiences ({activeCompanyObj.interviewExperiences.length})
                        </h4>
                        <div className="space-y-3">
                          {activeCompanyObj.interviewExperiences.map((exp: any, i: number) => (
                            <div key={i} className="p-3 bg-slate-50 border border-slate-150 rounded-lg text-xs space-y-2">
                              <p className="text-slate-600 italic leading-relaxed">"{exp.text}"</p>
                              <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-200/60">
                                <span>{exp.role}</span>
                                <span>— {exp.author}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* High Probability Mock Loop CTA */}
                      <div className="bg-indigo-900 text-white rounded-xl p-5 shadow space-y-4">
                        <h4 className="text-xs font-black">Want to test your readiness?</h4>
                        <p className="text-slate-255 text-xs leading-relaxed">
                          Run an interactive, real-time AI mock interview simulated exactly according to {activeCompanyObj.name}'s difficulty guidelines and primary focus topics.
                        </p>
                        <button
                          onClick={() => {
                            setTargetCompany(activeCompanyObj.name);
                            setInterviewTopic(activeCompanyObj.topics[0] || 'DSA & Algorithms');
                            setInterviewDifficulty(activeCompanyObj.difficulty);
                            setCurrentTab('interviews');
                            setInterviewStep('setup');
                          }}
                          className="w-full py-2.5 bg-white hover:bg-slate-100 text-indigo-900 font-black text-xs rounded-lg transition-all shadow"
                        >
                          Launch {activeCompanyObj.name} Interview Simulator
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Render Grid of Company Cards
            return (
              <div className="space-y-6">
                {/* Introduction header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="max-w-xl">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Software Company Preparation Tracks</h3>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                      Explore SDE preparation patterns, interview difficulty levels, eligibility criterion, and handpicked coding challenges mapped across 39 world-class software employers.
                    </p>
                  </div>
                  <div className="bg-slate-100/80 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-500 text-xs font-mono shrink-0">
                    Database State: <span className="text-indigo-600 font-bold">{companiesList.length} Tracks Loaded</span>
                  </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3.5">
                  <div className="flex flex-col md:flex-row gap-3.5">
                    {/* Search bar */}
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="Search Zoho, Google, Microsoft, or topics like 'Graphs'..."
                        value={companySearch}
                        onChange={(e) => setCompanySearch(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                      />
                    </div>

                    {/* Quick clear */}
                    {(companySearch || companyTypeFilter !== 'All' || companyDifficultyFilter !== 'All' || companyHiringFilter !== 'All' || companyInternshipFilter || companyFullTimeFilter) && (
                      <button
                        onClick={() => {
                          setCompanySearch('');
                          setCompanyTypeFilter('All');
                          setCompanyDifficultyFilter('All');
                          setCompanyHiringFilter('All');
                          setCompanyInternshipFilter(false);
                          setCompanyFullTimeFilter(false);
                        }}
                        className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-rose-600 hover:text-rose-750 text-xs font-bold rounded-lg border border-slate-200 transition-all"
                      >
                        Reset All Filters
                      </button>
                    )}
                  </div>

                  {/* Filter options row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    {/* Type filter */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company Sector</span>
                      <select
                        value={companyTypeFilter}
                        onChange={(e: any) => setCompanyTypeFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-xs text-slate-700 font-semibold"
                      >
                        <option value="All">All Sectors</option>
                        <option value="Product">Product Companies</option>
                        <option value="Service">Service Companies</option>
                      </select>
                    </div>

                    {/* Difficulty filter */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interview Difficulty</span>
                      <select
                        value={companyDifficultyFilter}
                        onChange={(e: any) => setCompanyDifficultyFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-xs text-slate-700 font-semibold"
                      >
                        <option value="All">All Difficulties</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    {/* Hiring Status filter */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hiring Status</span>
                      <select
                        value={companyHiringFilter}
                        onChange={(e: any) => setCompanyHiringFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-xs text-slate-700 font-semibold"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Hiring Now">Hiring Now</option>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    {/* Opportunity checkboxes */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Opportunity Streams</span>
                      <div className="flex gap-4 py-1.5">
                        <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            checked={companyInternshipFilter}
                            onChange={(e) => setCompanyInternshipFilter(e.target.checked)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                          />
                          <span>Internship</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            checked={companyFullTimeFilter}
                            onChange={(e) => setCompanyFullTimeFilter(e.target.checked)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                          />
                          <span>Full-Time</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCompanies.map((c) => {
                    const matchedProblemsCount = problems.filter(p => 
                      p.companyTags.some(tag => tag.toLowerCase() === c.name.toLowerCase())
                    ).length;

                    return (
                      <div key={c.id} className="bg-white border border-slate-200 hover:border-indigo-200 rounded-xl p-5 shadow-sm hover:shadow transition-all duration-200 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          {/* Top Row: Logo & Name */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              {/* Beautiful generated vector gradient bubble for logo */}
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-slate-100 to-slate-200/60 flex items-center justify-center font-black text-xs text-slate-700 border border-slate-250 shadow-sm shrink-0">
                                {c.name.slice(0, 2)}
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-slate-950 font-sans tracking-tight">{c.name}</h4>
                                <span className="text-[10px] bg-slate-100 border text-slate-500 px-1.5 py-0.2 rounded uppercase font-bold font-mono">
                                  {c.type}
                                </span>
                              </div>
                            </div>

                            {/* Hiring Status Badge */}
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                              c.hiringStatus === 'Hiring Now' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              c.hiringStatus === 'Upcoming' ? 'bg-amber-50 text-amber-550 border-amber-100' :
                              'bg-rose-50 text-rose-500 border-rose-100'
                            }`}>
                              {c.hiringStatus}
                            </span>
                          </div>

                          {/* Key parameters list */}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] bg-slate-50/70 p-3 rounded-lg border border-slate-150/50">
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Difficulty</span>
                              <span className={`block font-black text-xs uppercase ${
                                c.difficulty === 'Easy' ? 'text-emerald-600' :
                                c.difficulty === 'Medium' ? 'text-amber-550' : 'text-rose-600'
                              }`}>{c.difficulty}</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide font-mono">Rounds Count</span>
                              <span className="block font-bold text-xs text-slate-700 font-mono">{c.roundsCount} Rounds</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide font-sans">Questions Count</span>
                              <span className="block font-bold text-xs text-indigo-650 font-mono">{matchedProblemsCount || c.codingQuestionsCount} Qs Mapped</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide font-sans font-medium">Salary Tier</span>
                              <span className="block font-bold text-xs text-slate-600 truncate">{c.salaryRange}</span>
                            </div>
                          </div>

                          {/* Topics List */}
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mb-1 font-semibold">Most Asked Topics</span>
                            <div className="flex flex-wrap gap-1">
                              {c.topics.slice(0, 3).map((t: string) => (
                                <span key={t} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-semibold text-slate-600">
                                  {t}
                                </span>
                              ))}
                              {c.topics.length > 3 && (
                                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold">
                                  +{c.topics.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => {
                              setTargetCompany(c.name);
                              setInterviewTopic(c.topics[0] || 'DSA & Algorithms');
                              setInterviewDifficulty(c.difficulty);
                              setCurrentTab('interviews');
                              setInterviewStep('setup');
                            }}
                            className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] rounded-lg border border-slate-200 transition-all text-center"
                          >
                            Mock Interview
                          </button>
                          <button
                            onClick={() => setSelectedCompanyTrack(c)}
                            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] rounded-lg transition-all text-center shadow-xs"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {filteredCompanies.length === 0 && (
                    <div className="col-span-full bg-slate-50 border border-dashed border-slate-250 rounded-xl p-12 text-center text-slate-400 space-y-2">
                      <p className="text-sm font-semibold">No companies matched your filters</p>
                      <p className="text-xs">Try selecting 'All' or clearing your search input.</p>
                      <button
                        onClick={() => {
                          setCompanySearch('');
                          setCompanyTypeFilter('All');
                          setCompanyDifficultyFilter('All');
                          setCompanyHiringFilter('All');
                          setCompanyInternshipFilter(false);
                          setCompanyFullTimeFilter(false);
                        }}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all"
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ==========================================
              TAB 5: MASTERY & ANALYTICS VIEWS
              ========================================== */}
          {currentTab === 'analytics' && currentUser && (
            <div className="space-y-6">
              
              {/* ANALYTICS INTRO METRICS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Solved status visualization widget */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Placement Readiness Score</h4>
                  
                  <div className="flex justify-center py-4 relative">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="50" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                      <circle cx="64" cy="64" r="50" stroke="#4f46e5" strokeWidth="10" fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 50}`}
                        strokeDashoffset={`${2 * Math.PI * 50 * (1 - 84 / 100)}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black font-mono text-slate-850">84%</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Readiness</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 text-center leading-relaxed">
                    Readiness is calculated dynamically based on target company tracks, solved accuracies, and mock interview performance.
                  </p>
                </div>

                {/* Submissions Trend Visual Log */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Weekly Solved Progression</h4>
                  
                  {/* High quality custom SVG Bar Chart */}
                  <div className="h-32 w-full flex items-end justify-between gap-2 px-2 pt-4">
                    {[
                      { day: 'Mon', count: 4, height: 'h-[30%]', bg: 'bg-indigo-400' },
                      { day: 'Tue', count: 8, height: 'h-[60%]', bg: 'bg-indigo-400' },
                      { day: 'Wed', count: 3, height: 'h-[20%]', bg: 'bg-indigo-400' },
                      { day: 'Thu', count: 12, height: 'h-[90%]', bg: 'bg-indigo-600' },
                      { day: 'Fri', count: 6, height: 'h-[45%]', bg: 'bg-indigo-400' },
                      { day: 'Sat', count: 10, height: 'h-[75%]', bg: 'bg-indigo-400' },
                      { day: 'Sun', count: 5, height: 'h-[35%]', bg: 'bg-indigo-400' }
                    ].map((bar, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                        <span className="text-[9px] text-slate-500 font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          {bar.count}
                        </span>
                        <div className={`w-full rounded-t-sm transition-all duration-300 ${bar.height} ${bar.bg} hover:bg-indigo-500`} />
                        <span className="text-[9px] text-slate-400 font-sans tracking-tight">{bar.day}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-400 text-center pt-3 border-t border-slate-50">
                    Highest active throughput reached on Thursday (12 challenges solved!)
                  </p>
                </div>

                {/* Achievements block */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unlocked Badges ({currentUser.achievements.length})</h4>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {currentUser.achievements.map((badge: any) => (
                      <div key={badge.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center shadow-sm hover:scale-105 transition-transform">
                        <span className="text-2xl block mb-1">{badge.icon}</span>
                        <span className="text-[9px] font-bold text-slate-600 block leading-tight">{badge.name}</span>
                        <span className="text-[8px] text-slate-400 font-mono">{badge.date}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* SIMULATED SDE LEADERBOARD */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Peer SDE Global Placement Leaderboard</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                      <tr>
                        <th className="px-6 py-3">Rank</th>
                        <th className="px-6 py-3">Candidate</th>
                        <th className="px-6 py-3">Target Track</th>
                        <th className="px-6 py-3">Solved Count</th>
                        <th className="px-6 py-3">Accuracy</th>
                        <th className="px-6 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      <tr className="bg-amber-50/20">
                        <td className="px-6 py-4 font-bold text-amber-600">#1</td>
                        <td className="px-6 py-4 font-semibold">Ananya Sharma</td>
                        <td className="px-6 py-4">Meta Track</td>
                        <td className="px-6 py-4 font-mono font-bold">281</td>
                        <td className="px-6 py-4 font-mono">89.4%</td>
                        <td className="px-6 py-4 text-right"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">Placed - Microsoft</span></td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-bold text-slate-500">#2</td>
                        <td className="px-6 py-4 font-semibold">Vikram Malhotra</td>
                        <td className="px-6 py-4">Google Track</td>
                        <td className="px-6 py-4 font-mono font-bold">198</td>
                        <td className="px-6 py-4 font-mono">84.2%</td>
                        <td className="px-6 py-4 text-right"><span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded">Interviewing</span></td>
                      </tr>
                      <tr className="bg-indigo-50/30 border-y border-indigo-100">
                        <td className="px-6 py-4 font-bold text-indigo-600">#{currentUser.globalRank} (You)</td>
                        <td className="px-6 py-4 font-extrabold text-indigo-900">{currentUser.fullName}</td>
                        <td className="px-6 py-4 font-semibold text-indigo-900">{currentUser.targetCompany} Track</td>
                        <td className="px-6 py-4 font-mono font-bold text-indigo-900">{currentUser.solvedCount}</td>
                        <td className="px-6 py-4 font-mono text-indigo-900">{currentUser.accuracy}%</td>
                        <td className="px-6 py-4 text-right"><span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded">Active Prep</span></td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-bold text-slate-400">#4211</td>
                        <td className="px-6 py-4 font-semibold">Rohit K.</td>
                        <td className="px-6 py-4">Amazon Track</td>
                        <td className="px-6 py-4 font-mono font-bold">135</td>
                        <td className="px-6 py-4 font-mono">74.5%</td>
                        <td className="px-6 py-4 text-right"><span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">Active Prep</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              TAB 6: ADMIN CONSOLE VIEW
              ========================================== */}
          {currentTab === 'admin' && (
            <div className="space-y-6">
              
              {/* CORE METRICS SUMMARY WIDGETS */}
              {adminAnalytics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <span className="text-xs font-bold text-slate-400 uppercase">Registered Candidates</span>
                    <p className="text-3xl font-extrabold text-slate-800 font-mono mt-2">{adminAnalytics.totalUsers}</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <span className="text-xs font-bold text-slate-400 uppercase">Avg Challenges Solved</span>
                    <p className="text-3xl font-extrabold text-slate-800 font-mono mt-2">{adminAnalytics.avgSolved}</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <span className="text-xs font-bold text-slate-400 uppercase">Platform Submissions</span>
                    <p className="text-3xl font-extrabold text-indigo-600 font-mono mt-2">{adminAnalytics.totalSubmissions}</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <span className="text-xs font-bold text-slate-400 uppercase">Simulated Interviews</span>
                    <p className="text-3xl font-extrabold text-slate-800 font-mono mt-2">{adminAnalytics.totalInterviews}</p>
                  </div>

                </div>
              )}

              {/* TWO SPLIT WORKSPACE: CREATE PROBLEM & PROBLEMS MANAGER */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Form column: Add challenge */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Add Custom SDE Challenge</h4>
                    
                    {adminSuccessMsg && (
                      <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg">
                        {adminSuccessMsg}
                      </div>
                    )}

                    <form onSubmit={handleCreateProblem} className="space-y-4 text-xs text-slate-600">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold uppercase tracking-wider mb-1">Challenge Title</label>
                          <input
                            type="text"
                            required
                            value={newProblemForm.title}
                            onChange={e => setNewProblemForm({...newProblemForm, title: e.target.value})}
                            placeholder="e.g. Reverse a String"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold uppercase tracking-wider mb-1">Difficulty</label>
                          <select
                            value={newProblemForm.difficulty}
                            onChange={e => setNewProblemForm({...newProblemForm, difficulty: e.target.value as any})}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded focus:outline-none"
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold uppercase tracking-wider mb-1">Module Category</label>
                          <select
                            value={newProblemForm.category}
                            onChange={e => setNewProblemForm({...newProblemForm, category: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded focus:outline-none"
                          >
                            {allTopicCategories.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold uppercase tracking-wider mb-1">Company Tags (CSV)</label>
                          <input
                            type="text"
                            value={newProblemForm.companyTags}
                            onChange={e => setNewProblemForm({...newProblemForm, companyTags: e.target.value})}
                            placeholder="Google, Microsoft, Meta"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold uppercase tracking-wider mb-1">Topic Tags (CSV)</label>
                        <input
                          type="text"
                          value={newProblemForm.topicTags}
                          onChange={e => setNewProblemForm({...newProblemForm, topicTags: e.target.value})}
                          placeholder="Arrays, Two Pointer, Greedy"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold uppercase tracking-wider mb-1">Problem Description</label>
                        <textarea
                          rows={4}
                          value={newProblemForm.description}
                          onChange={e => setNewProblemForm({...newProblemForm, description: e.target.value})}
                          placeholder="Provide deep architectural overview or requirements of the coding puzzle..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded focus:outline-none font-sans"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold uppercase tracking-wider mb-1">Constraints (one per line)</label>
                          <textarea
                            rows={2}
                            value={newProblemForm.constraints}
                            onChange={e => setNewProblemForm({...newProblemForm, constraints: e.target.value})}
                            placeholder="1 <= nums.length <= 10^5"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold uppercase tracking-wider mb-1">Input Format Description</label>
                          <textarea
                            rows={2}
                            value={newProblemForm.inputFormat}
                            onChange={e => setNewProblemForm({...newProblemForm, inputFormat: e.target.value})}
                            placeholder="An integer array nums"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold transition-all shadow shadow-indigo-900/20"
                      >
                        Publish SDE Challenge
                      </button>
                    </form>
                  </div>
                </div>

                {/* Grid column: Problems Manager */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Manage Coding Problems</h4>
                    
                    <div className="divide-y divide-slate-100 max-h-[28rem] overflow-y-auto pr-2 space-y-1">
                      {problems.map((prob) => (
                        <div key={prob.id} className="py-3 flex items-center justify-between text-xs hover:bg-slate-50 px-3 rounded-lg transition-colors">
                          <div>
                            <span className="font-bold text-slate-800 block text-sm">{prob.title}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{prob.category} • {prob.difficulty}</span>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteProblem(prob.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-all border border-transparent hover:border-rose-200"
                            title="Delete problem"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </main>

      {/* GLOBAL MODALS SYSTEM (AI CODE EXPLAINER & Progressive HINTS VIEWPORT) */}
      {aiModalType && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-[9999]">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500"></div>

            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
              <span className="text-white font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                {aiModalType === 'explain' ? 'Gemini AI Line-By-Line Explanation' : 'Gemini AI Progressive Hints'}
              </span>
              <button
                onClick={() => { setAiModalType(null); setAiResponseText(''); }}
                className="text-slate-400 hover:text-white font-bold text-xs"
              >
                Close ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans pr-2">
              {aiHelperLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
                  <span>Generating AI response directly from Gemini...</span>
                </div>
              ) : (
                <div className="prose prose-invert prose-sm">
                  {aiResponseText}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 text-right shrink-0">
              <button
                onClick={() => { setAiModalType(null); setAiResponseText(''); }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all"
              >
                Understood, Resume Coding
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
