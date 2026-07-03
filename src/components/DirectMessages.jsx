import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Info, Smile, Image, Plus, Check } from 'lucide-react';

export default function DirectMessages({ 
  currentUser, 
  users, 
  messages, 
  activeChatUser, 
  onSelectChatUser, 
  onSendMessage 
}) {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPickerForMsgId, setShowPickerForMsgId] = useState(null);
  
  // Local state to store reactions locally in the view
  const [localReactions, setLocalReactions] = useState({});

  const messagesEndRef = useRef(null);
  const otherUsers = users.filter(u => u.id !== currentUser.id);

  // Auto-scroll messages thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Simulate typing indicator when activeChatUser is changed
    if (activeChatUser) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [activeChatUser]);

  // Monitor incoming messages to trigger typing indicators
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // When the user sends a message, simulate the bot typing before replying
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.senderId === currentUser.id) {
        setIsTyping(true);
        const timer = setTimeout(() => setIsTyping(false), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatUser) return;
    onSendMessage(activeChatUser.id, inputText);
    setInputText('');
  };

  const handleAttachImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
          // Send image as base64 data url directly in the message payload
          onSendMessage(activeChatUser.id, readerEvent.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleReact = (msgId, emoji) => {
    setLocalReactions(prev => ({
      ...prev,
      [msgId]: emoji
    }));
    setShowPickerForMsgId(null);
  };

  // Helper Verification Check Badge SVG
  const VerificationBadge = () => (
    <svg className="verification-badge" viewBox="0 0 24 24" width="14" height="14" style={{marginLeft: '4px'}}>
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" stroke="white" strokeWidth="2.5" fill="none" />
      <circle cx="12" cy="12" r="10" fill="#0095f6" zIndex="-1" style={{mixBlendMode: 'destination-over'}} />
    </svg>
  );

  return (
    <div className="dm-container animate-fade-in">
      {/* Sidebar: Users list */}
      <div className="dm-sidebar">
        <div className="dm-sidebar-header">
          <h2>{currentUser.username}</h2>
        </div>
        
        <div className="dm-users-list">
          {otherUsers.map(user => {
            const isSelected = activeChatUser && activeChatUser.id === user.id;
            return (
              <div 
                className={`dm-user-item ${isSelected ? 'active' : ''}`}
                key={user.id}
                onClick={() => onSelectChatUser(user)}
              >
                <img src={user.avatar} alt={user.fullName} className="dm-avatar" />
                <div className="dm-user-info">
                  <span className="dm-username">
                    {user.username}
                    {user.isVerified && <VerificationBadge />}
                  </span>
                  <span className="dm-fullname">{user.fullName}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pane: Conversation chat */}
      <div className="dm-chat-pane">
        {activeChatUser ? (
          <>
            {/* Chat header */}
            <div className="dm-chat-header">
              <div className="chat-header-user">
                <img src={activeChatUser.avatar} alt={activeChatUser.username} className="dm-avatar-small" />
                <div className="chat-header-info">
                  <span className="chat-username">
                    {activeChatUser.username}
                    {activeChatUser.isVerified && <VerificationBadge />}
                  </span>
                  <span className="chat-status">Active now</span>
                </div>
              </div>
              <button className="chat-info-btn">
                <Info size={20} />
              </button>
            </div>

            {/* Messages area */}
            <div className="dm-messages-thread">
              {messages.length === 0 && !isTyping ? (
                <div className="empty-thread-prompt">
                  <img src={activeChatUser.avatar} alt={activeChatUser.username} className="prompt-avatar" />
                  <h3>{activeChatUser.fullName}</h3>
                  <p>@{activeChatUser.username} · Instagram</p>
                  <button className="btn btn-secondary">View Profile</button>
                </div>
              ) : (
                messages.map(msg => {
                  const isOwn = msg.senderId === currentUser.id;
                  const isImage = msg.text.startsWith('data:image/');
                  const reaction = localReactions[msg.id] || msg.reaction;

                  return (
                    <div 
                      className={`message-row ${isOwn ? 'own' : 'other'}`}
                      key={msg.id}
                    >
                      {!isOwn && (
                        <img 
                          src={activeChatUser.avatar} 
                          alt="avatar" 
                          className="msg-avatar-icon" 
                        />
                      )}
                      <div className="message-bubble-wrapper">
                        {/* Reaction Picker Icon Button */}
                        <div 
                          className={`message-bubble ${isImage ? 'image-bubble' : ''}`}
                          onClick={() => setShowPickerForMsgId(showPickerForMsgId === msg.id ? null : msg.id)}
                          style={{cursor: 'pointer'}}
                        >
                          {isImage ? (
                            <img src={msg.text} alt="chat attachment" className="chat-bubble-attached-img" />
                          ) : (
                            msg.text
                          )}

                          {/* Floating Picker overlay panel */}
                          {showPickerForMsgId === msg.id && (
                            <div className="reaction-picker-panel">
                              {['❤️', '👍', '😂', '🔥'].map(emoji => (
                                <button 
                                  key={emoji}
                                  type="button" 
                                  className="picker-emoji-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReact(msg.id, emoji);
                                  }}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Floating Reaction badge */}
                          {reaction && (
                            <div className="reactions-box-indicator">
                              {reaction}
                            </div>
                          )}
                        </div>
                        
                        <span className="message-time">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Bot Typing bubble */}
              {isTyping && (
                <div className="message-row other animate-fade-in">
                  <img src={activeChatUser.avatar} alt="avatar" className="msg-avatar-icon" />
                  <div className="typing-bubble">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleSend} className="dm-input-form">
              <button type="button" className="emoji-btn">
                <Smile size={22} />
              </button>
              <button type="button" className="chat-image-attach-btn" onClick={handleAttachImage}>
                <Image size={22} />
              </button>
              <input 
                type="text"
                placeholder="Message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="dm-input-box"
              />
              <button 
                type="submit" 
                className="dm-send-btn" 
                disabled={!inputText.trim()}
              >
                Send
              </button>
            </form>
          </>
        ) : (
          /* Empty state view */
          <div className="dm-empty-state">
            <div className="empty-icon-circle">
              <MessageSquare size={48} />
            </div>
            <h2>Your Messages</h2>
            <p>Send private photos and messages to a friend or group.</p>
            <button className="btn btn-primary" onClick={() => onSelectChatUser(otherUsers[0])}>
              Send Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
