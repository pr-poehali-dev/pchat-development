import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';
import Icon from './ui/icon';

const CHATS_URL = 'https://functions.poehali.dev/6075572c-e69b-46dc-98d5-1a475f97548f';
const USERS_URL = 'https://functions.poehali.dev/e788aa75-8a17-452b-bc37-40eb09790295';

interface CreateChatDialogProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  onChatCreated: () => void;
}

export default function CreateChatDialog({ open, onClose, userId, onChatCreated }: CreateChatDialogProps) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!username.trim()) return;

    setLoading(true);
    try {
      const usersResponse = await fetch(`${USERS_URL}?username=${username}`);
      const usersData = await usersResponse.json();
      
      if (!usersData.user) {
        toast({
          title: 'Ошибка',
          description: 'Пользователь не найден',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      const response = await fetch(CHATS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'private',
          creator_id: userId,
          member_ids: [usersData.user.id]
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Чат создан!',
          description: `Вы можете начать общение с ${username}`
        });
        onChatCreated();
        onClose();
        setUsername('');
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать чат',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось связаться с сервером',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card">
        <DialogHeader>
          <DialogTitle>Новый чат</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username собеседника</Label>
            <Input
              id="username"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              className="glass-dark"
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={loading || !username.trim()}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <Icon name="Loader2" className="animate-spin" />
            ) : (
              'Создать чат'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}