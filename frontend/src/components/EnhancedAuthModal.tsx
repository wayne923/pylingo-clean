import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { authService } from '../services/authService';
import './EnhancedAuthModal.css';

interface EnhancedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface SkillAssessmentQuestion {
  id: number;
  question: string;
  code?: string;
  options: string[];
  correct: number;
  explanation: string;
}

const EnhancedAuthModal: React.FC<EnhancedAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'welcome' | 'auth' | 'assessment' | 'personalization' | 'complete'>('welcome');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [assessmentScore, setAssessmentScore] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<number[]>([]);
  const [personalizeData, setPersonalizeData] = useState({
    experience: '',
    goals: [] as string[],
    timeCommitment: '',
    preferredStyle: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const skillQuestions: SkillAssessmentQuestion[] = [
    {
      id: 1,
      question: "What will this Python code output?",
      code: `x = [1, 2, 3]
y = x
y.append(4)
print(len(x))`,
      options: ["3", "4", "Error", "None"],
      correct: 1,
      explanation: "Lists are mutable objects. When y = x, both variables point to the same list object."
    },
    {
      id: 2,
      question: "Which is the correct way to create a function in Python?",
      options: [
        "function myFunc() { }",
        "def myFunc(): pass",
        "def myFunc() { }",
        "function myFunc(): pass"
      ],
      correct: 1,
      explanation: "Python uses 'def' keyword followed by colon and indented body."
    },
    {
      id: 3,
      question: "What's the difference between a list and a tuple?",
      options: [
        "Lists are faster",
        "Tuples are mutable, lists are not",
        "Lists are mutable, tuples are not",
        "No difference"
      ],
      correct: 2,
      explanation: "Lists can be modified after creation (mutable), while tuples cannot (immutable)."
    },
    {
      id: 4,
      question: "In PyTorch, what does tensor.shape return?",
      code: `import torch
x = torch.randn(3, 4, 5)
print(x.shape)`,
      options: ["torch.Size([3, 4, 5])", "[3, 4, 5]", "60", "Error - PyTorch not installed"],
      correct: 0,
      explanation: "tensor.shape returns a torch.Size object showing the dimensions of the tensor."
    },
    {
      id: 5,
      question: "What is attention in transformers?",
      options: [
        "A way to focus on important parts of input",
        "A method to reduce overfitting",
        "A type of activation function",
        "A regularization technique"
      ],
      correct: 0,
      explanation: "Attention allows the model to focus on different parts of the input when producing each output."
    }
  ];

  const experienceOptions = [
    { id: 'complete-beginner', label: 'Complete Beginner', description: 'Never coded before' },
    { id: 'some-basics', label: 'Know Some Basics', description: 'Variables, functions, loops' },
    { id: 'intermediate', label: 'Intermediate', description: 'Classes, data structures' },
    { id: 'experienced', label: 'Experienced', description: 'Libraries, frameworks' },
    { id: 'expert', label: 'Expert', description: 'Advanced concepts, AI/ML' }
  ];

  const goalOptions = [
    { id: 'career-change', label: '🎯 Career Change', description: 'Switch to tech/AI' },
    { id: 'ai-ml', label: '🤖 AI/ML Mastery', description: 'Build AI models' },
    { id: 'data-science', label: '📊 Data Science', description: 'Analyze data, insights' },
    { id: 'web-dev', label: '🌐 Web Development', description: 'Build websites/APIs' },
    { id: 'automation', label: '⚡ Automation', description: 'Automate tasks' },
    { id: 'academic', label: '🎓 Academic/Research', description: 'Studies or research' }
  ];

  const timeOptions = [
    { id: '15min', label: '15 min/day', description: 'Quick daily practice' },
    { id: '30min', label: '30 min/day', description: 'Steady progress' },
    { id: '1hour', label: '1 hour/day', description: 'Accelerated learning' },
    { id: '2hours', label: '2+ hours/day', description: 'Intensive immersion' }
  ];

  const styleOptions = [
    { id: 'visual', label: '👁️ Visual Learner', description: 'Diagrams, charts, colors' },
    { id: 'hands-on', label: '🛠️ Hands-On', description: 'Practice, experimentation' },
    { id: 'theoretical', label: '📚 Theoretical', description: 'Concepts, explanations' },
    { id: 'gamified', label: '🎮 Gamified', description: 'Challenges, achievements' }
  ];

  const handleAuth = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (authMode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }
        await authService.register({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
      } else {
        await authService.login({
          username: formData.username,
          password: formData.password
        });
      }
      
      setStep('assessment');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssessmentAnswer = (answerIndex: number) => {
    const newAnswers = [...assessmentAnswers, answerIndex];
    setAssessmentAnswers(newAnswers);
    
    if (answerIndex === skillQuestions[currentQuestion].correct) {
      setAssessmentScore(assessmentScore + 1);
    }

    if (currentQuestion < skillQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 1000);
    } else {
      setTimeout(() => setStep('personalization'), 1500);
    }
  };

  const handleGoalToggle = (goalId: string) => {
    setPersonalizeData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const completeOnboarding = async () => {
    try {
      console.log('Starting onboarding completion...');
      console.log('personalizeData:', personalizeData);
      console.log('assessmentScore:', assessmentScore);
      
      setIsLoading(true);
      
      // Validate required data before proceeding
      if (!personalizeData || typeof personalizeData !== 'object') {
        throw new Error('Personalization data is invalid');
      }
      
      if (personalizeData.goals.length === 0) {
        throw new Error('No goals selected');
      }
      
      // Save user preferences and assessment results
      const skillLevel = getSkillLevel();
      console.log('Calculated skill level:', skillLevel);
      
      const userData = {
        assessmentScore,
        skillLevel,
        experience: personalizeData.experience,
        goals: personalizeData.goals,
        timeCommitment: personalizeData.timeCommitment,
        preferredStyle: personalizeData.preferredStyle
      };
      
      console.log('User data to save:', userData);
      
      // In a real app, you'd save this to the backend
      localStorage.setItem('userPreferences', JSON.stringify(userData));
      console.log('Data saved to localStorage');
      
      setStep('complete');
      console.log('Step set to complete');
      
      // Use a shorter timeout and add safety checks
      setTimeout(() => {
        try {
          console.log('Calling completion callbacks...');
          if (typeof onSuccess === 'function') {
            console.log('Calling onSuccess');
            onSuccess();
          }
          if (typeof onClose === 'function') {
            console.log('Calling onClose');
            onClose();
          }
        } catch (error) {
          console.error('Error in completion callbacks:', error);
        }
      }, 1500);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to complete setup: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  const getSkillLevel = () => {
    const percentage = (assessmentScore / skillQuestions.length) * 100;
    if (percentage >= 80) return 'advanced';
    if (percentage >= 60) return 'intermediate';
    if (percentage >= 40) return 'beginner-plus';
    return 'beginner';
  };

  const getPersonalizedRecommendation = () => {
    const skillLevel = getSkillLevel();
    const primaryGoal = personalizeData.goals[0];
    
    if (primaryGoal === 'ai-ml' && skillLevel === 'advanced') {
      return "Perfect! Start with our Transformer Architecture track - you're ready for advanced AI.";
    } else if (primaryGoal === 'ai-ml') {
      return "Great choice! We'll start you with PyTorch fundamentals, then advance to transformers.";
    } else if (primaryGoal === 'data-science') {
      return "Excellent! Begin with Python basics, then dive into our Data Science visualization track.";
    } else {
      return "We've created the perfect learning path based on your goals and skill level!";
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
        className="enhanced-auth-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="enhanced-auth-modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <button className="modal-close" onClick={onClose}>×</button>

          <div>
            {step === 'welcome' && (
              <motion.div
                key="welcome"
                className="auth-step welcome-step"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <div className="welcome-animation">
                  <motion.div
                    className="python-logo"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    🐍
                  </motion.div>
                  <motion.div
                    className="sparkles"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ✨
                  </motion.div>
                </div>

                <h2>Welcome to Your AI Journey!</h2>
                <p>Let's create your personalized learning path in just 3 minutes.</p>

                <div className="welcome-features">
                  <div className="feature">
                    <span className="feature-icon">🎯</span>
                    <span>Personalized curriculum</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">🧠</span>
                    <span>Skill assessment</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">⚡</span>
                    <span>Instant feedback</span>
                  </div>
                </div>

                <motion.button
                  className="primary-button"
                  onClick={() => setStep('auth')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Let's Begin! 🚀
                </motion.button>
              </motion.div>
            )}

            {step === 'auth' && (
              <motion.div
                key="auth"
                className="auth-step auth-form-step"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <div className="auth-tabs">
                  <button
                    className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
                    onClick={() => setAuthMode('register')}
                  >
                    Sign Up
                  </button>
                  <button
                    className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                    onClick={() => setAuthMode('login')}
                  >
                    Sign In
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleAuth(); }}>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Username"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      required
                    />
                  </div>

                  {authMode === 'register' && (
                    <div className="form-group">
                      <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <input
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                  </div>

                  {authMode === 'register' && (
                    <div className="form-group">
                      <input
                        type="password"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        required
                      />
                    </div>
                  )}

                  {error && <div className="error-message">{error}</div>}

                  <motion.button
                    type="submit"
                    className="primary-button"
                    disabled={isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isLoading ? 'Processing...' : authMode === 'register' ? 'Create Account' : 'Sign In'}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {step === 'assessment' && (
              <motion.div
                key="assessment"
                className="auth-step assessment-step"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <div className="assessment-header">
                  <h2>Quick Skill Check</h2>
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${((currentQuestion + 1) / skillQuestions.length) * 100}%` }}
                      />
                    </div>
                    <span className="progress-text">
                      {currentQuestion + 1} of {skillQuestions.length}
                    </span>
                  </div>
                </div>

                <div className="question-card">
                  <h3>{skillQuestions[currentQuestion].question}</h3>
                  
                  {skillQuestions[currentQuestion].code && (
                    <div className="code-block">
                      <pre><code>{skillQuestions[currentQuestion].code}</code></pre>
                    </div>
                  )}

                  <div className="options">
                    {skillQuestions[currentQuestion].options.map((option, index) => (
                      <motion.button
                        key={index}
                        className={`option-button ${
                          assessmentAnswers[currentQuestion] !== undefined
                            ? index === skillQuestions[currentQuestion].correct
                              ? 'correct'
                              : index === assessmentAnswers[currentQuestion]
                                ? 'incorrect'
                                : 'disabled'
                            : ''
                        }`}
                        onClick={() => handleAssessmentAnswer(index)}
                        disabled={assessmentAnswers[currentQuestion] !== undefined}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {option}
                      </motion.button>
                    ))}
                  </div>

                  {assessmentAnswers[currentQuestion] !== undefined && (
                    <motion.div
                      className="explanation"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <p>{skillQuestions[currentQuestion].explanation}</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 'personalization' && (
              <motion.div
                key="personalization"
                className="auth-step personalization-step"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <h2>Personalize Your Experience</h2>
                <div className="assessment-result">
                  <div className="score-display">
                    <span className="score">{assessmentScore}/{skillQuestions.length}</span>
                    <span className="level">{getSkillLevel().toUpperCase()}</span>
                  </div>
                </div>

                <div className="personalization-section">
                  <h3>What are your goals? (Select all that apply)</h3>
                  <div className="options-grid">
                    {goalOptions.map(goal => (
                      <motion.button
                        key={goal.id}
                        className={`option-card ${personalizeData.goals.includes(goal.id) ? 'selected' : ''}`}
                        onClick={() => handleGoalToggle(goal.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="option-header">
                          <span className="option-label">{goal.label}</span>
                        </div>
                        <span className="option-description">{goal.description}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="personalization-section">
                  <h3>What's your current Python experience?</h3>
                  <div className="options-grid single-select">
                    {experienceOptions.map(exp => (
                      <motion.button
                        key={exp.id}
                        className={`option-card ${personalizeData.experience === exp.id ? 'selected' : ''}`}
                        onClick={() => setPersonalizeData({...personalizeData, experience: exp.id})}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="option-label">{exp.label}</div>
                        <div className="option-description">{exp.description}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="personalization-section">
                  <h3>How much time can you dedicate daily?</h3>
                  <div className="options-grid single-select">
                    {timeOptions.map(time => (
                      <motion.button
                        key={time.id}
                        className={`option-card ${personalizeData.timeCommitment === time.id ? 'selected' : ''}`}
                        onClick={() => setPersonalizeData({...personalizeData, timeCommitment: time.id})}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="option-label">{time.label}</div>
                        <div className="option-description">{time.description}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="personalization-section">
                  <h3>What's your preferred learning style?</h3>
                  <div className="options-grid single-select">
                    {styleOptions.map(style => (
                      <motion.button
                        key={style.id}
                        className={`option-card ${personalizeData.preferredStyle === style.id ? 'selected' : ''}`}
                        onClick={() => setPersonalizeData({...personalizeData, preferredStyle: style.id})}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="option-label">{style.label}</div>
                        <div className="option-description">{style.description}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                <motion.button
                  className="primary-button"
                  onClick={completeOnboarding}
                  disabled={personalizeData.goals.length === 0 || !personalizeData.timeCommitment || !personalizeData.experience || !personalizeData.preferredStyle}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create My Learning Path 🎯
                </motion.button>
              </motion.div>
            )}

            {step === 'complete' && (
              <motion.div
                key="complete"
                className="auth-step complete-step"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <motion.div
                  className="success-animation"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2 }}
                >
                  🎉
                </motion.div>

                <h2>Your AI Journey Begins!</h2>
                <div className="recommendation">
                  <p>{getPersonalizedRecommendation()}</p>
                </div>

                <div className="completion-stats">
                  <div className="stat">
                    <span className="stat-value">{getSkillLevel()}</span>
                    <span className="stat-label">Your Level</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{personalizeData.goals.length}</span>
                    <span className="stat-label">Goals Selected</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{personalizeData.timeCommitment}</span>
                    <span className="stat-label">Daily Commitment</span>
                  </div>
                </div>

                <motion.div
                  className="loading-message"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Setting up your personalized dashboard...
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
  );
};

export default EnhancedAuthModal;