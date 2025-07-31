import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './LandingPage.css';

interface LandingPageProps {
  onStartLearning: () => void;
  onShowAuth: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartLearning, onShowAuth }) => {
  const [currentDemo, setCurrentDemo] = useState(0);
  const [isCodeRunning, setIsCodeRunning] = useState(false);
  const [demoOutput, setDemoOutput] = useState('');

  const codeDemos = [
    {
      title: "From Zero to AI Hero",
      subtitle: "Start with basics, build ChatGPT",
      code: `# Your first Python variable
name = "Future AI Engineer"
print(f"Hello, {name}!")

# In 16 lessons, you'll be doing this:
import torch
model = build_transformer()
response = model.generate("Explain quantum computing")`,
      output: "Hello, Future AI Engineer!\n🤖 Building your own AI models...",
      gradient: "from-purple-600 to-blue-600"
    },
    {
      title: "Interactive Learning",
      subtitle: "Code, run, visualize instantly",
      code: `import matplotlib.pyplot as plt
import numpy as np

# Create stunning visualizations
x = np.linspace(0, 4*np.pi, 100)
y = np.sin(x) * np.exp(-x/10)

plt.plot(x, y, 'cyan', linewidth=3)
plt.title('Your Data Science Journey')
plt.show()`,
      output: "📊 Beautiful visualization created!\nInteractive plots rendered in real-time",
      gradient: "from-cyan-600 to-teal-600"
    },
    {
      title: "AI-Powered Insights",
      subtitle: "Let AI teach you AI",
      code: `from sklearn.ensemble import IsolationForest
import pandas as pd

# Detect patterns in your learning
learner_data = get_progress_data()
ai_insights = analyze_learning_patterns(learner_data)

print("💡 AI Insight: Focus on transformers next!")
suggest_personalized_path()`,
      output: "💡 AI Insight: Focus on transformers next!\n🎯 Personalized learning path generated",
      gradient: "from-emerald-600 to-green-600"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemo((prev) => (prev + 1) % codeDemos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [codeDemos.length]);

  const runDemo = async () => {
    setIsCodeRunning(true);
    setDemoOutput('');
    
    // Simulate code execution with typing effect
    const output = codeDemos[currentDemo].output;
    for (let i = 0; i <= output.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setDemoOutput(output.slice(0, i));
    }
    
    setIsCodeRunning(false);
  };

  const learningPaths = [
    {
      icon: "🌱",
      title: "Python Fundamentals",
      description: "Variables, functions, data structures",
      lessons: 8,
      time: "2 weeks"
    },
    {
      icon: "🧠",
      title: "AI & Machine Learning",
      description: "PyTorch, transformers, LLMs",
      lessons: 12,
      time: "4 weeks"
    },
    {
      icon: "📊",
      title: "Data Science",
      description: "Analysis, visualization, insights",
      lessons: 10,
      time: "3 weeks"
    },
    {
      icon: "🌐",
      title: "Web Development",
      description: "APIs, databases, deployment",
      lessons: 15,
      time: "5 weeks"
    }
  ];

  const features = [
    {
      icon: "🚀",
      title: "Instant Execution",
      description: "Run Python code instantly in secure Docker containers with full AI/ML libraries"
    },
    {
      icon: "🧠",
      title: "Spaced Repetition",
      description: "AI-optimized review schedule ensures 95% retention using learning science"
    },
    {
      icon: "🎯",
      title: "Adaptive Learning",
      description: "Personalized difficulty adjustment keeps you in the perfect learning zone"
    },
    {
      icon: "🤖",
      title: "AI Teaching Assistant",
      description: "Get personalized hints, explanations, and code reviews from our AI tutor"
    },
    {
      icon: "📊",
      title: "Visual Progress",
      description: "Beautiful dashboards track your journey from beginner to AI expert"
    },
    {
      icon: "🏆",
      title: "Achievement System",
      description: "Unlock badges, maintain streaks, and celebrate milestones"
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="floating-elements">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="floating-element"
                animate={{
                  y: [-20, -40, -20],
                  rotate: [0, 180, 360],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{
                  duration: 3 + i * 0.2,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
              >
                {['🐍', '🤖', '📊', '⚡', '🔥'][Math.floor(Math.random() * 5)]}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="hero-content">
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="hero-title">
              <span className="gradient-text">Learn Python</span>
              <br />
              <span className="hero-subtitle">Build the Future</span>
            </h1>
            <p className="hero-description">
              From your first "Hello World" to building ChatGPT-style AI models. 
              Interactive lessons, instant feedback, and AI-powered personalization.
            </p>
            
            <div className="hero-buttons">
              <motion.button
                className="cta-button primary"
                onClick={onStartLearning}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Learning Free
                <span className="button-icon">🚀</span>
              </motion.button>
              
              <motion.button
                className="cta-button secondary"
                onClick={onShowAuth}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
              </motion.button>
            </div>

            <div className="social-proof">
              <div className="stats">
                <div className="stat">
                  <div className="stat-number">10K+</div>
                  <div className="stat-label">Learners</div>
                </div>
                <div className="stat">
                  <div className="stat-number">95%</div>
                  <div className="stat-label">Success Rate</div>
                </div>
                <div className="stat">
                  <div className="stat-number">4.9★</div>
                  <div className="stat-label">Rating</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="hero-demo"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="demo-container">
              <div className="demo-header">
                <div className="demo-controls">
                  <div className="control red"></div>
                  <div className="control yellow"></div>
                  <div className="control green"></div>
                </div>
                <div className="demo-title">Interactive Python Playground</div>
              </div>

              <div className="demo-content">
                <motion.div
                    key={currentDemo}
                    className={`demo-card ${codeDemos[currentDemo].gradient}`}
                    initial={{ opacity: 0, rotateY: 90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: -90 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="demo-info">
                      <h3>{codeDemos[currentDemo].title}</h3>
                      <p>{codeDemos[currentDemo].subtitle}</p>
                    </div>

                    <div className="code-editor">
                      <pre><code>{codeDemos[currentDemo].code}</code></pre>
                    </div>

                    <motion.button
                      className="run-button"
                      onClick={runDemo}
                      disabled={isCodeRunning}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isCodeRunning ? '⚡ Running...' : '▶️ Run Code'}
                    </motion.button>

                    {demoOutput && (
                      <motion.div
                        className="demo-output"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                      >
                        <pre>{demoOutput}</pre>
                      </motion.div>
                    )}
                  </motion.div>

                <div className="demo-indicators">
                  {codeDemos.map((_, index) => (
                    <button
                      key={index}
                      className={`indicator ${index === currentDemo ? 'active' : ''}`}
                      onClick={() => setCurrentDemo(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Learning Paths Section */}
      <section className="learning-paths-section">
        <div className="section-container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Choose Your Learning Adventure</h2>
            <p>Personalized paths designed by AI experts and learning scientists</p>
          </motion.div>

          <div className="paths-grid">
            {learningPaths.map((path, index) => (
              <motion.div
                key={index}
                className="path-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                viewport={{ once: true }}
              >
                <div className="path-icon">{path.icon}</div>
                <h3>{path.title}</h3>
                <p>{path.description}</p>
                <div className="path-stats">
                  <span className="lessons">{path.lessons} lessons</span>
                  <span className="time">{path.time}</span>
                </div>
                <div className="path-difficulty">
                  <div className="difficulty-bar">
                    <div 
                      className="difficulty-fill" 
                      style={{ width: `${(index + 1) * 25}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Learning Science Meets Cutting-Edge Tech</h2>
            <p>Every feature is designed to maximize your learning efficiency and retention</p>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                viewport={{ once: true }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta-section">
        <div className="cta-container">
          <motion.div
            className="cta-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Ready to Transform Your Future?</h2>
            <p>Join thousands of learners building the next generation of AI</p>
            
            <motion.button
              className="final-cta-button"
              onClick={onStartLearning}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Begin Your AI Journey
              <span className="cta-arrow">→</span>
            </motion.button>

            <div className="cta-guarantee">
              <span>✅ Free forever</span>
              <span>✅ No credit card required</span>
              <span>✅ Start coding in 30 seconds</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;