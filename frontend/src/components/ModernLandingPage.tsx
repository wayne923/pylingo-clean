import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import './ModernLandingPage.css';

interface ModernLandingPageProps {
  onStartLearning: () => void;
  onShowAuth: () => void;
  onSelectTrack?: (track: string) => void;
}

const ModernLandingPage: React.FC<ModernLandingPageProps> = ({ onStartLearning, onShowAuth, onSelectTrack }) => {
  const [currentCodeIndex, setCurrentCodeIndex] = useState(0);
  const [typedCode, setTypedCode] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showDemo, setShowDemo] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const codeExamples = useMemo(() => [
    {
      title: "Start Simple",
      code: `# Your first Python program
print("Hello, AI World!")
name = "Future AI Engineer"
print(f"Welcome, {name}!")`,
      description: "Begin with fundamentals"
    },
    {
      title: "Build Intelligence", 
      code: `import torch
import torch.nn as nn

class SimpleNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.layer = nn.Linear(784, 10)
    
    def forward(self, x):
        return self.layer(x)

model = SimpleNet()`,
      description: "Create neural networks"
    },
    {
      title: "Master Transformers",
      code: `class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, num_heads):
        super().__init__()
        self.attention = nn.MultiheadAttention(
            d_model, num_heads, batch_first=True
        )
    
    def forward(self, x):
        return self.attention(x, x, x)[0]`,
      description: "Build ChatGPT-style models"
    }
  ], []);

  const features = [
    {
      icon: "🧠",
      title: "Adaptive Learning",
      description: "AI adjusts to your pace",
      details: "Our AI analyzes your learning patterns and adjusts difficulty in real-time. Using Zone of Proximal Development principles, we keep you in the perfect challenge zone.",
      color: "from-purple-500 to-pink-500",
      delay: 0.1
    },
    {
      icon: "⚡",
      title: "Instant Execution",
      description: "Run code in real-time",
      details: "Execute Python code instantly in your browser with Pyodide. No setup required - includes NumPy, Pandas, Matplotlib, and more scientific computing libraries.",
      color: "from-blue-500 to-cyan-500", 
      delay: 0.2
    },
    {
      icon: "🎯",
      title: "Spaced Repetition",
      description: "95% retention guarantee",
      details: "Based on SuperMemo 2 algorithm with modern learning science. Our system schedules reviews at optimal intervals for maximum knowledge retention.",
      color: "from-green-500 to-emerald-500",
      delay: 0.3
    },
    {
      icon: "🚀",
      title: "Production Ready",
      description: "Deploy real AI models",
      details: "Learn with real-world projects. Advanced lessons use Docker containers with full AI/ML environments for building production-ready applications.",
      color: "from-orange-500 to-red-500",
      delay: 0.4
    }
  ];

  const stats = [
    { number: "95%", label: "Success Rate", icon: "📈" },
    { number: "10K+", label: "Learners", icon: "👥" }, 
    { number: "4.9★", label: "Rating", icon: "⭐" },
    { number: "0s", label: "Setup Time", icon: "⚡" }
  ];

  const learningPaths = [
    {
      id: "fundamentals",
      title: "Python Fundamentals",
      description: "Variables, functions, data structures",
      lessons: 8,
      time: "2 weeks",
      icon: "🐍",
      color: "from-emerald-400 to-cyan-400",
      popular: false
    },
    {
      id: "ai-ml",
      title: "AI & Machine Learning", 
      description: "PyTorch, transformers, LLMs",
      lessons: 16,
      time: "6 weeks", 
      icon: "🤖",
      color: "from-purple-400 to-pink-400",
      popular: true
    },
    {
      id: "data-science",
      title: "Data Science",
      description: "Analysis, visualization, insights",
      lessons: 12,
      time: "4 weeks",
      icon: "📊", 
      color: "from-blue-400 to-indigo-400",
      popular: false
    }
  ];

  // Typewriter effect
  useEffect(() => {
    const currentExample = codeExamples[currentCodeIndex];
    let index = 0;
    setIsTyping(true);
    setTypedCode('');

    const typeInterval = setInterval(() => {
      if (index < currentExample.code.length) {
        setTypedCode(currentExample.code.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
        
        // Move to next example after delay
        setTimeout(() => {
          setCurrentCodeIndex((prev) => (prev + 1) % codeExamples.length);
        }, 3000);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [currentCodeIndex, codeExamples]);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="modern-landing">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/10 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [-20, -40, -20],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <motion.div 
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="text-white font-semibold text-xl">PyLingo</span>
        </motion.div>

        <motion.button
          className="px-6 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
          onClick={onShowAuth}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Sign In
        </motion.button>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Content */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight">
                Learn Python.
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Build AI.
                </span>
              </h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                From your first "Hello World" to building transformers and LLMs. 
                Interactive lessons with AI-powered personalization.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <motion.button
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-semibold text-lg shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
                onClick={onStartLearning}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Learning Free
                <span className="ml-2">→</span>
              </motion.button>
              
              <motion.button
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
                onClick={() => setShowDemo(true)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Watch Demo
                <span className="ml-2">▶</span>
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex flex-wrap justify-center gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-2xl font-bold text-white">{stat.number}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-6xl mx-auto">
            {/* Live Code Demo - Large */}
            <motion.div
              className="md:col-span-8 bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 relative overflow-hidden"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              style={{
                transform: `translate3d(${mousePosition.x * 5}px, ${mousePosition.y * 5}px, 0)`
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {codeExamples[currentCodeIndex].title}
                  </h3>
                  <p className="text-slate-400">
                    {codeExamples[currentCodeIndex].description}
                  </p>
                </div>
                <div className="flex space-x-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              
              <div className="bg-slate-900/50 rounded-2xl p-6 font-mono text-sm">
                <pre className="text-green-400 whitespace-pre-wrap">
                  {typedCode}
                  {isTyping && <span className="animate-pulse">|</span>}
                </pre>
              </div>

              <div className="flex justify-center mt-4 space-x-2">
                {codeExamples.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentCodeIndex ? 'bg-blue-400 w-6' : 'bg-white/30'
                    }`}
                    onClick={() => setCurrentCodeIndex(index)}
                  />
                ))}
              </div>
            </motion.div>

            {/* Features Grid */}
            <div className="md:col-span-4 grid grid-cols-1 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className={`bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer ${
                    selectedFeature === index ? 'ring-2 ring-blue-400 bg-white/15' : ''
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + feature.delay }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  onClick={() => setSelectedFeature(selectedFeature === index ? null : index)}
                >
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h4 className="text-white font-semibold mb-2">{feature.title}</h4>
                  <p className="text-slate-400 text-sm mb-2">{feature.description}</p>
                  {selectedFeature === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-white/20"
                    >
                      <p className="text-slate-300 text-xs leading-relaxed">{feature.details}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Learning Paths */}
            <motion.div
              className="md:col-span-12"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <h2 className="text-3xl font-bold text-white text-center mb-8">
                Choose Your Learning Journey
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {learningPaths.map((path, index) => (
                  <motion.div
                    key={index}
                    className={`relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer ${
                      path.popular ? 'ring-2 ring-purple-400' : ''
                    }`}
                    whileHover={{ scale: 1.02, y: -5 }}
                    onClick={() => {
                      if (onSelectTrack) {
                        onSelectTrack(path.id);
                      }
                      onStartLearning();
                    }}
                  >
                    {path.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <div className="text-4xl mb-4">{path.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-3">{path.title}</h3>
                    <p className="text-slate-400 mb-6">{path.description}</p>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-blue-400 font-medium">
                        {path.lessons} lessons
                      </span>
                      <span className="text-purple-400 font-medium">
                        {path.time}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              className="md:col-span-12 text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.6 }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Transform Your Future?
              </h2>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Join thousands of learners building the next generation of AI
              </p>
              
              <motion.button
                className="px-12 py-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-bold text-xl shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
                onClick={onStartLearning}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                Begin Your AI Journey
                <span className="ml-3">🚀</span>
              </motion.button>

              <div className="flex justify-center items-center space-x-8 mt-8 text-sm text-slate-400">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Free forever
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  No credit card
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Start in 30 seconds
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Demo Modal */}
      {showDemo && (
        <motion.div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowDemo(false)}
        >
          <motion.div
            className="bg-slate-900 rounded-3xl p-8 max-w-4xl w-full mx-4 border border-white/10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">PyLingo Demo</h2>
              <button
                onClick={() => setShowDemo(false)}
                className="text-white/60 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="aspect-video bg-black rounded-2xl flex items-center justify-center mb-6">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">🎥</div>
                <p className="text-xl">Interactive Demo</p>
                <p className="text-slate-400 mt-2">See PyLingo in action with real code execution</p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <motion.button
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-semibold"
                onClick={() => {
                  setShowDemo(false);
                  onStartLearning();
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try It Yourself
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ModernLandingPage;