import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import Icon from './ui/icon';
import { Chat } from './ChatInterface';

const MESSAGES_URL = 'https://functions.poehali.dev/3bdf8938-1c66-4db5-ae96-1bd2801d0c42';

interface User {
  id: number;
  username: string;
  nickname: string;
  avatar_url?: string;
}

interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  content: string;
  message_type: string;
  is_system: boolean;
  read_by: number[];
  created_at: string;
  sender: {
    username: string;
    nickname: string;
    avatar_url?: string;
  };
}

interface ChatWindowProps {
  chat: Chat;
  user: User;
  onBack: () => void;
}

export default function ChatWindow({ chat, user, onBack }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, [chat.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await fetch(`${MESSAGES_URL}?chat_id=${chat.id}`);
      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    setLoading(true);
    try {
      const response = await fetch(MESSAGES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chat.id,
          sender_id: user.id,
          content: newMessage.trim()
        })
      });

      if (response.ok) {
        setNewMessage('');
        loadMessages();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const getChatDisplay = () => {
    if (chat.type === 'private' && chat.other_user) {
      return {
        name: chat.other_user.nickname || chat.other_user.username,
        initials: (chat.other_user.nickname || chat.other_user.username).slice(0, 2).toUpperCase()
      };
    }
    return {
      name: chat.name || 'Группа',
      initials: (chat.name || 'Г').slice(0, 2).toUpperCase()
    };
  };

  const display = getChatDisplay();

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b border-border/50 glass flex items-center gap-3">
        <Button
          size="icon"
          variant="ghost"
          onClick={onBack}
          className="md:hidden"
        >
          <Icon name="ArrowLeft" size={20} />
        </Button>
        
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-primary/30 text-primary font-semibold">
            {display.initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h2 className="font-semibold">{display.name}</h2>
          {chat.type === 'group' && (
            <p className="text-xs text-muted-foreground">Группа</p>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwn = message.sender_id === user.id;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {chat.type === 'group' && !isOwn && (
                    <span className="text-xs text-primary font-medium px-3">
                      {message.sender.nickname || message.sender.username}
                    </span>
                  )}
                  
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'glass-card'
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                  </div>
                  
                  <div className={`flex items-center gap-1 px-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.created_at)}
                    </span>
                    {isOwn && chat.type === 'private' && (
                      <div className="flex">
                        {message.read_by.length > 1 ? (
                          <Icon name="CheckCheck" size={14} className="text-primary" />
                        ) : (
                          <Icon name="Check" size={14} className="text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <form onSubmit={sendMessage} className="p-4 border-t border-border/50 glass">
        <div className="flex gap-2">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="hover:bg-primary/20"
          >
            <Icon name="Paperclip" size={20} />
          </Button>
          
          <Input
            type="text"
            placeholder="Сообщение..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="glass-dark flex-1"
            disabled={loading}
          />
          
          <Button
            type="submit"
            size="icon"
            className="bg-primary hover:bg-primary/90"
            disabled={loading || !newMessage.trim()}
          >
            <Icon name="Send" size={20} />
          </Button>
        </div>
      </form>
    </div>
  );
}
