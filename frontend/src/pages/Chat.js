import React, { useState, useRef, useEffect } from 'react';
import { Send, AlertCircle, Trash2, Plus, BookOpen, LayoutGrid, ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import TopBar from '../components/TopBar';
import HomeButton from '../components/HomeButton';
import { sendMessage, getUserSubjects } from '../services/api';
import styles from '../styles/Chat.module.css';

const CHAT_STORAGE_KEY = 'smartStudyChat';

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Fetch Subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const userId = user?.id || 'test-user';
        const res = await getUserSubjects(userId);
        if (res.data.success && res.data.subjects) {
          setSubjects(res.data.subjects);
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
      }
    };
    fetchSubjects();
  }, [user]);

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const loadChatHistory = () => {
      try {
        const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
        if (savedMessages) {
          const parsedMessages = JSON.parse(savedMessages);
          console.log('✅ Loaded chat history:', parsedMessages.length, 'messages');
          setMessages(parsedMessages);
        } else {
          // Initialize with welcome message if no history
          const welcomeMessage = {
            id: Date.now(),
            type: 'ai',
            content: 'Hello! 👋 I\'m your Smart Study Assistant. Ask me anything about your lectures, get explanations, or discuss topics. How can I help you today?',
            timestamp: new Date(),
          };
          setMessages([welcomeMessage]);
          localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify([welcomeMessage]));
        }
      } catch (error) {
        console.error('❌ Error loading chat history:', error);
        // Fallback to default message if error
        const welcomeMessage = {
          id: Date.now(),
          type: 'ai',
          content: 'Hello! 👋 I\'m your Smart Study Assistant. Ask me anything about your lectures, get explanations, or discuss topics. How can I help you today?',
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      }
    };

    loadChatHistory();
  }, []);

  // Save chat history whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
        console.log('💾 Saved', messages.length, 'messages to localStorage');
      } catch (error) {
        console.error('❌ Error saving chat history:', error);
        if (error.name === 'QuotaExceededError') {
          toast.error('Chat history storage limit reached');
        }
      }
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userContent = input;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: userContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get conversation history (excluding first message if it's a system message)
      const conversationHistory = messages.map((msg) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      // Call the API
      const contextId = selectedSubjectId === 'all' ? null : selectedSubjectId;
      const response = await sendMessage(userContent, conversationHistory, contextId, user?.id);

      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      toast.success('✅ Response received');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Connection error';

      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: `❌ Sorry! ${errorMsg}. Please try again.`,
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
      toast.error(`Error: ${errorMsg}`);
      console.error('Chat API Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
      const welcomeMessage = {
        id: Date.now(),
        type: 'ai',
        content: 'Hello! 👋 I\'m your Smart Study Assistant. Chat history has been cleared. Ask me new questions to get started!',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      localStorage.removeItem(CHAT_STORAGE_KEY);
      toast.success('Chat history cleared');
    }
  };

  const formatTime = (date) => {
    try {
      // Handle both Date objects and ISO string timestamps from localStorage
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (!dateObj || isNaN(dateObj.getTime())) {
        return 'Just now';
      }
      return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Just now';
    }
  };

  const selectedSubject = selectedSubjectId === 'all' 
    ? { name: 'جميع المواد (General Assistant)' } 
    : subjects.find(s => s.id === selectedSubjectId);

  return (
    <div className={styles.chatPage}>
      <TopBar title="المساعد الذكي (Smart Chatbot)" showBackButton={true} />

      <div className={styles.mainLayout}>
        {/* SIDEBAR */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              className={styles.sidebar}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.sidebarHeader}>
                <div className={styles.sidebarTitle}>
                  <LayoutGrid size={20} className={styles.sidebarIcon} />
                  <h3>المواد الدراسية</h3>
                </div>
              </div>

              <div className={styles.sidebarContent}>
                <div
                  className={`${styles.subjectItem} ${selectedSubjectId === 'all' ? styles.subjectItemActive : ''}`}
                  onClick={() => setSelectedSubjectId('all')}
                >
                  <div className={styles.subjectIcon} style={{ background: 'var(--color-primary)' }}>
                    <BookOpen size={18} color="#fff" />
                  </div>
                  <div className={styles.subjectInfoText}>
                    <h4>جميع المواد</h4>
                    <p>مساعد عام لكل المحاضرات</p>
                  </div>
                </div>

                {subjects.map(subject => (
                  <div
                    key={subject.id}
                    className={`${styles.subjectItem} ${selectedSubjectId === subject.id ? styles.subjectItemActive : ''}`}
                    onClick={() => setSelectedSubjectId(subject.id)}
                  >
                    <div className={styles.subjectIcon} style={{ background: subject.color }}>
                      <BookOpen size={18} color="#fff" />
                    </div>
                    <div className={styles.subjectInfoText}>
                      <h4>{subject.name}</h4>
                      <p>{subject.totalLectures || 0} محاضرات</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* CHAT AREA */}
        <div className={styles.chatArea}>
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderLeft}>
              <button
                className={styles.toggleSidebarBtn}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                title="تبديل القائمة"
              >
                {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
              </button>
              <div className={styles.chatInfo}>
                <h2>{selectedSubject ? selectedSubject.name : 'Study Assistant'}</h2>
                <p>مساعدك الذكي المخصص للرد على أسئلتك من مصادرك.</p>
              </div>
            </div>
            <button
              className={styles.clearBtn}
              onClick={handleClearHistory}
              title="Clear chat history"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className={styles.messagesArea}>
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              className={`${styles.messageWrapper} ${msg.type === 'user' ? styles.userMessage : styles.aiMessage} ${msg.isError ? styles.errorMessage : ''
                }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {msg.type === 'ai' && (
                <div className={styles.aiAvatar}>
                  <span>🤖</span>
                </div>
              )}
              <div className={styles.messageBubble}>
                {msg.isError && <AlertCircle size={16} className={styles.errorIcon} />}
                <p className={styles.messageContent}>{msg.content}</p>
                <span className={styles.messageTime}>
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            className={`${styles.messageWrapper} ${styles.aiMessage}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.aiAvatar}>
              <span>🤖</span>
            </div>
            <div className={styles.messageBubble}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

        <div className={styles.inputArea}>
          <div className={styles.inputContainer}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question... (Shift + Enter for new line)"
              className={styles.input}
              disabled={isLoading}
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className={styles.sendBtn}
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </div>
          <p className={styles.hint}>💡 Tip: Select a subject from the sidebar to make the AI focus on its specific lectures.</p>
        </div>
      </div>
      </div>
      <HomeButton />
    </div>
  );
}

