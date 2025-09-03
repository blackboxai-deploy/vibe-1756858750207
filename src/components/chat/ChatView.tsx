'use client';

import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ChatView() {
  const { state, dispatch } = useApp();
  const [newMessage, setNewMessage] = useState('');
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set default active channel
  useEffect(() => {
    if (!activeChannel && state.channels.length > 0) {
      setActiveChannel(state.channels[0].id);
      dispatch({ type: 'SET_ACTIVE_CHANNEL', payload: state.channels[0].id });
    }
  }, [state.channels, activeChannel, dispatch]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, activeChannel]);

  // Filter messages for active channel
  const channelMessages = state.messages.filter(m => m.channelId === activeChannel);

  // Get active channel info
  const currentChannel = state.channels.find(c => c.id === activeChannel);

  // Get unread messages count for each channel
  const getUnreadCount = (channelId: string) => {
    return state.messages.filter(m => 
      m.channelId === channelId && 
      !m.readBy.some(r => r.userId === state.currentUser?.id)
    ).length;
  };

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim() || !activeChannel || !state.currentUser) return;

    const message = {
      id: `msg-${Date.now()}`,
      content: newMessage.trim(),
      senderId: state.currentUser.id,
      channelId: activeChannel,
      type: 'text' as const,
      timestamp: new Date(),
      readBy: [{ userId: state.currentUser.id, readAt: new Date() }],
    };

    dispatch({ type: 'ADD_MESSAGE', payload: message });
    setNewMessage('');

    // Auto-mark as read for sender
    setTimeout(() => {
      dispatch({ 
        type: 'MARK_MESSAGE_READ', 
        payload: { messageId: message.id, userId: state.currentUser!.id }
      });
    }, 100);
  };

  // Mark messages as read when viewing a channel
  useEffect(() => {
    if (activeChannel && state.currentUser) {
      const unreadMessages = state.messages.filter(m => 
        m.channelId === activeChannel && 
        !m.readBy.some(r => r.userId === state.currentUser!.id)
      );

      unreadMessages.forEach(msg => {
        dispatch({
          type: 'MARK_MESSAGE_READ',
          payload: { messageId: msg.id, userId: state.currentUser!.id }
        });
      });
    }
  }, [activeChannel, state.currentUser, state.messages, dispatch]);

  // Get user info
  const getUser = (userId: string) => {
    return state.users.find(u => u.id === userId);
  };

  // Format time
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Sidebar - Channels */}
      <Card className="w-80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💬 Canales
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-1 p-4">
              {state.channels.map((channel) => {
                const unreadCount = getUnreadCount(channel.id);
                const isActive = channel.id === activeChannel;

                return (
                  <button
                    key={channel.id}
                    onClick={() => {
                      setActiveChannel(channel.id);
                      dispatch({ type: 'SET_ACTIVE_CHANNEL', payload: channel.id });
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border-blue-200 border'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {channel.type === 'direct' ? '💬' : 
                           channel.type === 'project' ? '📋' : '👥'}
                        </span>
                        <span className="font-medium text-sm">{channel.name}</span>
                      </div>
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                    {channel.lastMessage && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {channel.lastMessage}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col">
        {currentChannel ? (
          <>
            {/* Chat Header */}
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span>
                      {currentChannel.type === 'direct' ? '💬' : 
                       currentChannel.type === 'project' ? '📋' : '👥'}
                    </span>
                    {currentChannel.name}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    {currentChannel.participants.length} participantes
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {currentChannel.participants.map(participantId => {
                    const user = getUser(participantId);
                    if (!user) return null;
                    
                    return (
                      <div key={user.id} className="flex items-center gap-1">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[calc(100vh-16rem)] p-4">
                <div className="space-y-4">
                  {channelMessages.map((message, index) => {
                    const sender = getUser(message.senderId);
                    const isOwnMessage = message.senderId === state.currentUser?.id;
                    const showAvatar = index === 0 || 
                      channelMessages[index - 1].senderId !== message.senderId;

                    return (
                      <div key={message.id} className={`flex gap-3 ${isOwnMessage ? 'justify-end' : ''}`}>
                        {!isOwnMessage && showAvatar && (
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-medium">
                              {sender?.name.charAt(0) || '?'}
                            </span>
                          </div>
                        )}
                        {!isOwnMessage && !showAvatar && (
                          <div className="w-8 flex-shrink-0" />
                        )}
                        
                        <div className={`max-w-md ${isOwnMessage ? 'order-first' : ''}`}>
                          {(!isOwnMessage && showAvatar) && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-700">
                                {sender?.name}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                          )}
                          
                          <div className={`rounded-lg p-3 ${
                            isOwnMessage
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            {isOwnMessage && (
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <span className="text-xs opacity-70">
                                  {formatTime(message.timestamp)}
                                </span>
                                <span className="text-xs opacity-70">
                                  {message.readBy.length > 1 ? '✓✓' : '✓'}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Read receipts for own messages */}
                          {isOwnMessage && message.readBy.length > 1 && (
                            <div className="text-xs text-gray-400 mt-1 text-right">
                              Leído por {message.readBy.length - 1} persona{message.readBy.length > 2 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Escribe un mensaje en ${currentChannel.name}...`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  Enviar
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Selecciona un canal para comenzar a chatear
          </div>
        )}
      </Card>
    </div>
  );
}