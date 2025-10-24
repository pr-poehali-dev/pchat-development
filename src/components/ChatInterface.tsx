import { useState, useEffect } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import SettingsPanel from './SettingsPanel';
import CreateChatDialog from './CreateChatDialog';
import CreateGroupDialog from './CreateGroupDialog';
import Icon from './ui/icon';
import { Button } from './ui/button';

const CHATS_URL = 'https://functions.poehali.dev/6075572c-e69b-46dc-98d5-1a475f97548f';

interface User {
  id: number;
  username: string;
  nickname: string;
  avatar_url?: string;
  theme?: string;
}

interface ChatInterfaceProps {
  user: User;
  onLogout: () => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export interface Chat {
  id: number;
  type: string;
  name?: string;
  avatar_url?: string;
  owner_id?: number;
  last_message?: string;
  last_message_time?: string;
  other_user?: {
    id: number;
    username: string;
    nickname: string;
    avatar_url?: string;
  };
}

export default function ChatInterface({ user, onLogout, theme, setTheme }: ChatInterfaceProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateChat, setShowCreateChat] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 3000);
    return () => clearInterval(interval);
  }, [user.id]);

  const loadChats = async () => {
    try {
      const response = await fetch(`${CHATS_URL}?user_id=${user.id}`);
      const data = await response.json();
      if (data.chats) {
        setChats(data.chats);
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setShowCreateChat(true);
  };

  const handleNewGroup = () => {
    setShowCreateGroup(true);
  };

  return (
    <div className="h-screen flex">
      <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 glass-dark border-r border-border/50`}>
        <div className="p-4 border-b border-border/50 glass">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-primary">Pchat</h2>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleNewChat}
                className="hover:bg-primary/20"
                title="Новый чат"
              >
                <Icon name="UserPlus" size={20} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleNewGroup}
                className="hover:bg-primary/20"
                title="Новая группа"
              >
                <Icon name="Users" size={20} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowSettings(true)}
                className="hover:bg-primary/20"
                title="Настройки"
              >
                <Icon name="Settings" size={20} />
              </Button>
            </div>
          </div>
        </div>

        <ChatList
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
          currentUserId={user.id}
          loading={loading}
        />
      </div>

      <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
        {selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            user={user}
            onBack={() => setSelectedChat(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-4">
              <Icon name="MessageCircle" size={64} className="mx-auto opacity-50" />
              <p className="text-lg">Выберите чат для начала общения</p>
            </div>
          </div>
        )}
      </div>

      {showSettings && (
        <SettingsPanel
          user={user}
          theme={theme}
          setTheme={setTheme}
          onClose={() => setShowSettings(false)}
          onLogout={onLogout}
        />
      )}

      <CreateChatDialog
        open={showCreateChat}
        onClose={() => setShowCreateChat(false)}
        userId={user.id}
        onChatCreated={loadChats}
      />

      <CreateGroupDialog
        open={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        userId={user.id}
        onGroupCreated={loadChats}
      />
    </div>
  );
}