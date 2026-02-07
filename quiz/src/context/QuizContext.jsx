import React, { createContext, useState, useEffect } from 'react';
import modulesConfig from '../data/modules.config.json';
import * as storage from '../services/storage';
import * as questionService from '../services/questionService';
import * as statsService from '../services/statsService';

// eslint-disable-next-line react-refresh/only-export-components
export const QuizContext = createContext();

/**
 * Parse config with backward-compatibility.
 * If config has `topics` array, use it directly.
 * If config only has flat `modules` array (old format), wrap it in a default topic.
 */
const parseTopics = () => {
  if (modulesConfig.topics) {
    return modulesConfig.topics;
  }
  // Backward compatibility: wrap flat modules in a default topic
  return [
    {
      id: 'default',
      name: 'Modulos',
      description: '',
      icon: 'book',
      color: '#667eea',
      modules: modulesConfig.modules || [],
    },
  ];
};

/**
 * Dynamically load all modules based on topics config.
 * Uses Vite's glob import for efficient module loading.
 * Returns { topics, flatModules } where flatModules is an array of all loaded modules.
 */
const loadModules = () => {
  try {
    const moduleFiles = import.meta.glob('../data/*.json', { eager: true });
    const topics = parseTopics();

    const loadedTopics = topics.map((topic) => {
      const loadedModules = topic.modules
        .map((moduleInfo) => {
          const modulePath = `../data/${moduleInfo.file}`;
          const moduleData = moduleFiles[modulePath];

          if (!moduleData) {
            console.warn(`Module file not found: ${moduleInfo.file}`);
            return null;
          }

          return {
            id: moduleInfo.id,
            name: moduleInfo.name,
            data: moduleData.default,
          };
        })
        .filter(Boolean);

      return {
        ...topic,
        modules: loadedModules,
      };
    });

    // Flatten all modules across topics for backward compat
    const flatModules = loadedTopics.flatMap((t) => t.modules);

    return { topics: loadedTopics, flatModules };
  } catch (error) {
    console.error('Error loading modules:', error);
    return { topics: [], flatModules: [] };
  }
};

export const QuizProvider = ({ children }) => {
  const [availableTopics, setAvailableTopics] = useState([]);
  const [selectedTopic, setSelectedTopicState] = useState(null);
  const [availableModules, setAvailableModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [multiModuleIds, setMultiModuleIds] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState({});
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load modules dynamically on init
  useEffect(() => {
    const { topics, flatModules } = loadModules();
    setAvailableTopics(topics);
    setAvailableModules(flatModules);

    // Restore selected topic from storage, or default to first
    const savedTopic = storage.getSelectedTopic();
    const defaultTopicId = topics.length > 0 ? topics[0].id : null;
    const topicId = savedTopic && topics.find((t) => t.id === savedTopic)
      ? savedTopic
      : defaultTopicId;
    setSelectedTopicState(topicId);

    // Set default module to first available module
    if (flatModules.length > 0) {
      setSelectedModule(flatModules[0].id);
      setQuestions(flatModules[0].data.questions);
    }

    loadData();
  }, []);

  // Update questions when module changes or multi-module mode toggles
  useEffect(() => {
    if (multiModuleIds && multiModuleIds.length > 0) {
      const merged = availableModules
        .filter((m) => multiModuleIds.includes(m.id))
        .flatMap((m) => m.data.questions);
      setQuestions(merged);
    } else if (selectedModule && availableModules.length > 0) {
      const module = availableModules.find((m) => m.id === selectedModule);
      if (module) {
        setQuestions(module.data.questions);
      }
    }
  }, [multiModuleIds, selectedModule, availableModules]);

  const loadData = () => {
    try {
      const savedStats = storage.getStats();
      const savedBookmarks = storage.getBookmarks();

      if (savedStats) {
        setStats(savedStats);
      }
      if (savedBookmarks) {
        setBookmarks(savedBookmarks);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setSelectedTopic = (topicId) => {
    setSelectedTopicState(topicId);
    storage.saveSelectedTopic(topicId);
  };

  /**
   * Get progress for a specific module.
   * @param {string} moduleId
   * @returns {{ answered: number, total: number, accuracy: string }}
   */
  const getModuleProgress = (moduleId) => {
    const module = availableModules.find((m) => m.id === moduleId);
    if (!module) return { answered: 0, total: 0, accuracy: '0.0' };

    const moduleQuestions = module.data.questions;
    const globalStats = statsService.calculateGlobalStats(moduleQuestions, stats);

    return {
      answered: globalStats.answeredQuestions,
      total: globalStats.totalQuestions,
      accuracy: globalStats.accuracy,
    };
  };

  /**
   * Get the modules for the currently selected topic.
   */
  const getTopicModules = () => {
    if (!selectedTopic || availableTopics.length === 0) return [];
    const topic = availableTopics.find((t) => t.id === selectedTopic);
    return topic ? topic.modules : [];
  };

  const saveStatsToStorage = (newStats) => {
    const success = storage.saveStats(newStats);
    if (success) {
      setStats(newStats);
    }
  };

  const saveBookmarksToStorage = (newBookmarks) => {
    const success = storage.saveBookmarks(newBookmarks);
    if (success) {
      setBookmarks(newBookmarks);
    }
  };

  const recordAnswer = (questionId, isCorrect) => {
    const newStats = statsService.recordAnswer(stats, questionId, isCorrect);
    saveStatsToStorage(newStats);
  };

  const toggleBookmark = (questionId) => {
    let newBookmarks;
    if (bookmarks.includes(questionId)) {
      newBookmarks = bookmarks.filter((id) => id !== questionId);
    } else {
      newBookmarks = [...bookmarks, questionId];
    }
    saveBookmarksToStorage(newBookmarks);
  };

  const getWeightedRandomQuestion = (excludeIds = []) => {
    return questionService.getWeightedRandomQuestion(questions, stats, excludeIds);
  };

  const getIncorrectQuestions = () => {
    return questionService.getIncorrectQuestions(questions, stats);
  };

  const getBookmarkedQuestions = () => {
    return questionService.getBookmarkedQuestions(questions, bookmarks);
  };

  const getQuestionsByBlock = (blockName) => {
    return questionService.getQuestionsByBlock(questions, blockName);
  };

  const getGlobalStats = () => {
    return statsService.calculateGlobalStats(questions, stats);
  };

  const resetStats = () => {
    const success = storage.resetAllData();
    if (success) {
      setStats({});
      setBookmarks([]);
    }
  };

  const startMultiModuleQuiz = (moduleIds) => {
    setMultiModuleIds(moduleIds);
  };

  const stopMultiModuleQuiz = () => {
    setMultiModuleIds(null);
  };

  const value = {
    questions,
    stats,
    bookmarks,
    loading,
    selectedModule,
    setSelectedModule,
    availableModules,
    selectedTopic,
    setSelectedTopic,
    availableTopics,
    getModuleProgress,
    getTopicModules,
    recordAnswer,
    toggleBookmark,
    getWeightedRandomQuestion,
    getIncorrectQuestions,
    getBookmarkedQuestions,
    getQuestionsByBlock,
    getGlobalStats,
    resetStats,
    multiModuleIds,
    startMultiModuleQuiz,
    stopMultiModuleQuiz,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};
