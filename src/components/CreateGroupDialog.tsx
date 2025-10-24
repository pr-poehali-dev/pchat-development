import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';
import Icon from './ui/icon';

const CHATS_URL = 'https://functions.poehali.dev/6075572c-e69b-46dc-98d5-1a475f97548f';

interface CreateGroupDialogProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  onGroupCreated: () => void;
}

export default function CreateGroupDialog({ open, onClose, userId, onGroupCreated }: CreateGroupDialogProps) {
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!groupName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(CHATS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'group',
          name: groupName.trim(),
          creator_id: userId,
          member_ids: []
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Группа создана!',
          description: `Группа "${groupName}" успешно создана`
        });
        onGroupCreated();
        onClose();
        setGroupName('');
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать группу',
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
          <DialogTitle>Новая группа</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Название группы</Label>
            <Input
              id="groupName"
              placeholder="Моя группа"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              className="glass-dark"
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={loading || !groupName.trim()}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <Icon name="Loader2" className="animate-spin" />
            ) : (
              'Создать группу'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
