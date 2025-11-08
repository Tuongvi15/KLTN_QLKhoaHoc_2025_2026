import { useState, useRef, useEffect } from 'react';
import { SendOutlined, CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { message as antdMessage } from 'antd';
import './ChatBox.css';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

interface ChatRequest {
    message: string;
    session_id: string;
    account_id?: string;
}

const ChatBox = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Xin chào! Tôi có thể giúp gì cho bạn? 😊',
            sender: 'bot',
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Lấy user ID từ Redux store
    const userId = useSelector((state: RootState) => state.user.id);

    // Tạo session ID mới khi component mount hoặc reload trang
    useEffect(() => {
        const newSessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        setSessionId(newSessionId);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (inputValue.trim() === '' || !sessionId) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        const messageToSend = inputValue;
        setInputValue('');
        setIsLoading(true);

        try {
            // Chuẩn bị request body
            const requestBody: ChatRequest = {
                message: messageToSend,
                session_id: sessionId,
            };

            // Chỉ thêm account_id nếu user đã đăng nhập
            if (userId && userId.trim() !== '') {
                requestBody.account_id = userId;
            }

            // Gọi API
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error('Không thể kết nối với server');
            }

            const data = await response.json();

            // Thêm response từ bot
            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: data.response || 'Xin lỗi, tôi không thể trả lời câu hỏi này.',
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botResponse]);
        } catch (error) {
            console.error('Error sending message:', error);
            antdMessage.error('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại!');
            
            // Thêm error message
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau!',
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    // Format message với xuống dòng và style đẹp hơn
    const formatMessage = (text: string) => {
        // Tách các dòng
        const lines = text.split('\n');
        
        return (
            <div className="chatbox-formatted-message">
                {lines.map((line, index) => {
                    // Kiểm tra nếu là bullet point
                    const isBullet = line.trim().startsWith('-') || line.trim().startsWith('•');
                    const isNumbered = /^\d+\./.test(line.trim());
                    
                    // Xử lý inline formatting: bold **text**, code `text`, link pattern
                    const formatInlineStyles = (str: string) => {
                        const elements: React.ReactNode[] = [];
                        let remaining = str;
                        let key = 0;

                        while (remaining.length > 0) {
                            // Check for bold **text**
                            const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
                            if (boldMatch) {
                                elements.push(<strong key={key++}>{boldMatch[1]}</strong>);
                                remaining = remaining.slice(boldMatch[0].length);
                                continue;
                            }

                            // Check for inline code `text` or backtick-style
                            const codeMatch = remaining.match(/^`([^`]+)`/);
                            if (codeMatch) {
                                elements.push(
                                    <code key={key++} className="chatbox-inline-code">
                                        {codeMatch[1]}
                                    </code>
                                );
                                remaining = remaining.slice(codeMatch[0].length);
                                continue;
                            }

                            // Check for emoji or special characters
                            const specialMatch = remaining.match(/^([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])/u);
                            if (specialMatch) {
                                elements.push(
                                    <span key={key++} className="chatbox-emoji">
                                        {specialMatch[1]}
                                    </span>
                                );
                                remaining = remaining.slice(specialMatch[0].length);
                                continue;
                            }

                            // Regular text - take up to next special character
                            const nextSpecial = remaining.search(/\*\*|`|[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u);
                            const chunk = nextSpecial === -1 ? remaining : remaining.slice(0, nextSpecial);
                            
                            if (chunk) {
                                elements.push(chunk);
                            }
                            remaining = remaining.slice(chunk.length);
                        }

                        return elements.length > 0 ? elements : str;
                    };

                    if (line.trim() === '') {
                        return <div key={index} className="chatbox-line-break"></div>;
                    }

                    if (isBullet) {
                        return (
                            <div key={index} className="chatbox-bullet-line">
                                <span className="chatbox-bullet">•</span>
                                <span>{formatInlineStyles(line.replace(/^[-•]\s*/, ''))}</span>
                            </div>
                        );
                    }

                    if (isNumbered) {
                        const match = line.match(/^(\d+\.)\s*(.+)/);
                        if (match) {
                            return (
                                <div key={index} className="chatbox-numbered-line">
                                    <span className="chatbox-number">{match[1]}</span>
                                    <span>{formatInlineStyles(match[2])}</span>
                                </div>
                            );
                        }
                    }

                    // Kiểm tra header với ### hoặc ##
                    if (line.trim().startsWith('###') || line.trim().startsWith('##')) {
                        const headerText = line.replace(/^#+\s*/, '');
                        return (
                            <div key={index} className="chatbox-header-line">
                                {formatInlineStyles(headerText)}
                            </div>
                        );
                    }

                    return (
                        <div key={index} className="chatbox-text-line">
                            {formatInlineStyles(line)}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="chatbox-container">
            {/* Chat Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                        className="chatbox-toggle-btn"
                        onClick={() => setIsOpen(true)}
                    >
                        <svg
                            className="chatbox-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12 2C6.477 2 2 6.477 2 12c0 1.592.387 3.17 1.119 4.595.135.26.199.555.149.853l-.707 4.243a.5.5 0 00.605.605l4.243-.707a1.5 1.5 0 01.853.149A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"
                                fill="currentColor"
                            />
                            <circle cx="8.5" cy="12" r="1.5" fill="white" />
                            <circle cx="12" cy="12" r="1.5" fill="white" />
                            <circle cx="15.5" cy="12" r="1.5" fill="white" />
                        </svg>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="chatbox-window"
                    >
                        {/* Header */}
                        <div className="chatbox-header">
                            <div className="flex items-center gap-3">
                                <div className="chatbox-avatar">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        className="chatbox-avatar-icon"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10S17.523 2 12 2z"
                                            fill="currentColor"
                                        />
                                        <path
                                            d="M8 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM16 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                                            fill="white"
                                        />
                                        <path
                                            d="M8.5 14.5c.5 1.5 2 2.5 3.5 2.5s3-.5 3.5-2.5"
                                            stroke="white"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="chatbox-header-title">Trợ lý AI StudyHub</h3>
                                    <p className="chatbox-header-status">
                                        <span className="chatbox-status-dot"></span>
                                        Luôn sẵn sàng hỗ trợ
                                    </p>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ rotate: 90, scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsOpen(false)}
                                className="chatbox-close-btn"
                            >
                                <CloseOutlined />
                            </motion.button>
                        </div>

                        {/* Messages */}
                        <div className="chatbox-messages">
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`chatbox-message ${
                                        message.sender === 'user'
                                            ? 'chatbox-message-user'
                                            : 'chatbox-message-bot'
                                    }`}
                                >
                                    <div className="chatbox-message-bubble">
                                        <div className="chatbox-message-text">
                                            {formatMessage(message.text)}
                                        </div>
                                        <span className="chatbox-message-time">
                                            {formatTime(message.timestamp)}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                            
                            {/* Loading indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="chatbox-message chatbox-message-bot"
                                >
                                    <div className="chatbox-message-bubble">
                                        <div className="chatbox-typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="chatbox-input-container">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Nhập tin nhắn..."
                                className="chatbox-input"
                                disabled={isLoading}
                            />
                            <motion.button
                                whileHover={{ scale: isLoading ? 1 : 1.1 }}
                                whileTap={{ scale: isLoading ? 1 : 0.9 }}
                                onClick={handleSendMessage}
                                className="chatbox-send-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? <LoadingOutlined /> : <SendOutlined />}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChatBox;
