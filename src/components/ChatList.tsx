import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Chat } from './ChatInterface';

interface ChatListProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  currentUserId: number;
  loading: boolean;
}

export default function ChatList({ chats, selectedChat, onSelectChat, currentUserId, loading }: ChatListProps) {
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}м`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}ч`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const getChatDisplay = (chat: Chat) => {
    if (chat.type === 'private' && chat.other_user) {
      return {
        name: chat.other_user.nickname || chat.other_user.username,
        avatar: chat.other_user.avatar_url,
        initials: (chat.other_user.nickname || chat.other_user.username).slice(0, 2).toUpperCase()
      };
    }
    return {
      name: chat.name || 'Группа',
      avatar: chat.avatar_url,
      initials: (chat.name || 'Г').slice(0, 2).toUpperCase()
    };
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Загрузка чатов...</p>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-muted-foreground text-center">
          Нет чатов.<br />Создайте новый чат, чтобы начать общение!
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="divide-y divide-border/50">
        {chats.map((chat) => {
          const display = getChatDisplay(chat);
          const isSelected = selectedChat?.id === chat.id;
          
          return (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-primary/10 transition-colors ${
                isSelected ? 'bg-primary/20' : ''
              }`}
            >
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-primary/30 text-primary font-semibold">
                  {display.initials}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold truncate">{display.name}</h3>
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatTime(chat.last_message_time)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {chat.last_message || 'Нет сообщений'}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
