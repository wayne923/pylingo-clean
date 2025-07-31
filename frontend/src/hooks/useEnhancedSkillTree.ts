import { useState, useEffect, useCallback, useRef } from 'react';

interface SkillNode {
  id: string;
  title: string;
  track: string;
  icon: string;
  description: string;
  prerequisites: string[];
  lessons: any[];
  depth: 'foundation' | 'core' | 'advanced' | 'mastery' | 'expert';
  category: 'technical' | 'practical' | 'theoretical' | 'project';
  unlocked: boolean;
  progress: number;
  mastery: number;
  estimatedHours: number;
  skillPoints: number;
  connections: string[];
  position: { x: number; y: number };
}

interface UseEnhancedSkillTreeProps {
  nodes: SkillNode[];
  viewMode: string;
  selectedNode: SkillNode | null;
  setSelectedNode: (node: SkillNode | null) => void;
}

export const useEnhancedSkillTree = ({
  nodes,
  viewMode,
  selectedNode,
  setSelectedNode
}: UseEnhancedSkillTreeProps) => {
  const [focusedNodeIndex, setFocusedNodeIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchResultsRef = useRef<SkillNode[]>([]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!nodes.length) return;

    const unlockedNodes = nodes.filter(node => node.unlocked);
    
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        const direction = event.key === 'ArrowUp' ? -1 : 1;
        const newIndex = Math.max(0, Math.min(unlockedNodes.length - 1, focusedNodeIndex + direction));
        setFocusedNodeIndex(newIndex);
        setSelectedNode(unlockedNodes[newIndex]);
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (unlockedNodes[focusedNodeIndex]) {
          setSelectedNode(unlockedNodes[focusedNodeIndex]);
          // Trigger celebration animation
          celebrateNodeSelection(unlockedNodes[focusedNodeIndex]);
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        setSelectedNode(null);
        break;
        
      case 'Tab':
        // Allow natural tab navigation
        break;
        
      default:
        // Letter navigation
        if (event.key.length === 1 && event.key.match(/[a-zA-Z]/)) {
          const letter = event.key.toLowerCase();
          const matchingNode = unlockedNodes.find(node => 
            node.title.toLowerCase().startsWith(letter)
          );
          if (matchingNode) {
            const index = unlockedNodes.indexOf(matchingNode);
            setFocusedNodeIndex(index);
            setSelectedNode(matchingNode);
          }
        }
        break;
    }
  }, [nodes, focusedNodeIndex, setSelectedNode]);

  // Smart search with fuzzy matching
  const performSmartSearch = useCallback((query: string, allNodes: SkillNode[]): SkillNode[] => {
    if (!query) return allNodes;

    const searchTerms = query.toLowerCase().split(' ');
    
    return allNodes
      .map(node => {
        let score = 0;
        const searchableText = `${node.title} ${node.description} ${node.track}`.toLowerCase();
        
        // Exact matches get highest score
        if (searchableText.includes(query.toLowerCase())) {
          score += 100;
        }
        
        // Individual term matches
        searchTerms.forEach(term => {
          if (searchableText.includes(term)) {
            score += 50;
          }
          
          // Fuzzy matching for typos
          if (fuzzyMatch(searchableText, term)) {
            score += 25;
          }
        });
        
        // Boost unlocked nodes
        if (node.unlocked) {
          score += 10;
        }
        
        // Boost nodes with progress
        score += node.progress * 0.1;
        
        return { node, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ node }) => node);
  }, []);

  // Simple fuzzy matching
  const fuzzyMatch = (text: string, pattern: string): boolean => {
    const patternLength = pattern.length;
    const textLength = text.length;
    
    if (patternLength > textLength) return false;
    if (patternLength === textLength) return pattern === text;
    
    let patternIndex = 0;
    for (let textIndex = 0; textIndex < textLength && patternIndex < patternLength; textIndex++) {
      if (text[textIndex] === pattern[patternIndex]) {
        patternIndex++;
      }
    }
    
    return patternIndex === patternLength;
  };

  // Celebration animation for node selection
  const celebrateNodeSelection = useCallback((node: SkillNode) => {
    if (!containerRef.current) return;
    
    setIsAnimating(true);
    
    // Create celebration particles
    const particles = document.createElement('div');
    particles.className = 'celebration-particles';
    particles.innerHTML = Array.from({ length: 12 }, (_, i) => 
      `<div class="celebration-particle" style="--delay: ${i * 0.1}s; --angle: ${i * 30}deg">${node.icon}</div>`
    ).join('');
    
    containerRef.current.appendChild(particles);
    
    // Play success sound (if available)
    playSuccessSound();
    
    // Clean up after animation
    setTimeout(() => {
      if (particles.parentNode) {
        particles.parentNode.removeChild(particles);
      }
      setIsAnimating(false);
    }, 2000);
  }, []);

  // Audio feedback
  const playSuccessSound = () => {
    try {
      // Create a simple beep using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Fallback for browsers that don't support Web Audio API
      console.log('🎉 Skill selected!');
    }
  };

  // Calculate optimal layout positions based on view mode
  const calculateLayout = useCallback((nodes: SkillNode[], viewMode: string) => {
    switch (viewMode) {
      case 'constellation':
        return calculateConstellationLayout(nodes);
      case 'tree':
        return calculateTreeLayout(nodes);
      case 'roadmap':
        return calculateRoadmapLayout(nodes);
      case 'focus':
        return calculateFocusLayout(nodes, selectedNode?.id || 'python-basics');
      default:
        return nodes;
    }
  }, [selectedNode]);

  const calculateConstellationLayout = (nodes: SkillNode[]): SkillNode[] => {
    // Organic constellation layout with physics-based positioning
    const center = { x: 400, y: 300 };
    const layers = {
      foundation: { radius: 0, angle: 0 },
      core: { radius: 150, angle: 0 },
      advanced: { radius: 280, angle: 45 },
      mastery: { radius: 400, angle: 90 },
      expert: { radius: 520, angle: 135 }
    };
    
    return nodes.map((node, index) => {
      const layer = layers[node.depth];
      const angleStep = 360 / nodes.filter(n => n.depth === node.depth).length;
      const nodeAngle = layer.angle + (angleStep * index);
      
      return {
        ...node,
        position: {
          x: center.x + layer.radius * Math.cos(nodeAngle * Math.PI / 180),
          y: center.y + layer.radius * Math.sin(nodeAngle * Math.PI / 180)
        }
      };
    });
  };

  const calculateTreeLayout = (nodes: SkillNode[]): SkillNode[] => {
    // Hierarchical tree layout
    const levelHeight = 200;
    const nodeWidth = 300;
    
    const levels = {
      foundation: 0,
      core: 1,
      advanced: 2,
      mastery: 3,
      expert: 4
    };
    
    return nodes.map((node, index) => {
      const level = levels[node.depth];
      const nodesAtLevel = nodes.filter(n => n.depth === node.depth);
      const nodeIndex = nodesAtLevel.indexOf(node);
      const totalWidth = nodesAtLevel.length * nodeWidth;
      
      return {
        ...node,
        position: {
          x: (nodeIndex - (nodesAtLevel.length - 1) / 2) * nodeWidth,
          y: level * levelHeight
        }
      };
    });
  };

  const calculateRoadmapLayout = (nodes: SkillNode[]): SkillNode[] => {
    // Linear roadmap layout
    return nodes.map((node, index) => ({
      ...node,
      position: {
        x: 0,
        y: index * 120
      }
    }));
  };

  const calculateFocusLayout = (nodes: SkillNode[], centerNodeId: string): SkillNode[] => {
    // Focus layout with center node and satellites
    const center = { x: 400, y: 300 };
    const satelliteRadius = 200;
    
    return nodes.map((node, index) => {
      if (node.id === centerNodeId) {
        return { ...node, position: center };
      }
      
      const angle = (index * 360) / (nodes.length - 1);
      return {
        ...node,
        position: {
          x: center.x + satelliteRadius * Math.cos(angle * Math.PI / 180),
          y: center.y + satelliteRadius * Math.sin(angle * Math.PI / 180)
        }
      };
    });
  };

  // Auto-suggest for search
  const generateSearchSuggestions = useCallback((query: string, allNodes: SkillNode[]): string[] => {
    if (!query || query.length < 2) return [];
    
    const suggestions = new Set<string>();
    
    allNodes.forEach(node => {
      // Add title suggestions
      if (node.title.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(node.title);
      }
      
      // Add track suggestions
      if (node.track.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(node.track.replace('-', ' '));
      }
      
      // Add category suggestions
      if (node.category.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(node.category);
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
  }, []);

  // Progressive skill unlocking animation
  const animateSkillUnlock = useCallback((nodeId: string) => {
    const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
    if (!nodeElement) return;
    
    nodeElement.classList.add('unlocking');
    
    // Add unlock effect
    const unlockEffect = document.createElement('div');
    unlockEffect.className = 'unlock-effect';
    unlockEffect.innerHTML = '🔓✨';
    nodeElement.appendChild(unlockEffect);
    
    setTimeout(() => {
      nodeElement.classList.remove('unlocking');
      nodeElement.classList.add('newly-unlocked');
      if (unlockEffect.parentNode) {
        unlockEffect.parentNode.removeChild(unlockEffect);
      }
      
      // Remove the newly-unlocked class after a delay
      setTimeout(() => {
        nodeElement.classList.remove('newly-unlocked');
      }, 3000);
    }, 1500);
  }, []);

  // Set up keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Auto-update layout when view mode changes
  useEffect(() => {
    if (nodes.length > 0) {
      const updatedNodes = calculateLayout(nodes, viewMode);
      // Trigger re-render with new positions
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, [viewMode, nodes, calculateLayout]);

  return {
    containerRef,
    focusedNodeIndex,
    isAnimating,
    performSmartSearch,
    generateSearchSuggestions,
    celebrateNodeSelection,
    animateSkillUnlock,
    calculateLayout,
    playSuccessSound
  };
};