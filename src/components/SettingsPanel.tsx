import { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { useToast } from '../hooks/use-toast';
import Icon from './ui/icon';

const PROFILE_URL = 'https://functions.poehali.dev/191c020a-f4a3-421d-80c7-4ca282695299';

interface User {
  id: number;
  username: string;
  nickname: string;
  avatar_url?: string;
}

interface SettingsPanelProps {
  user: User;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  onClose: () => void;
  onLogout: () => void;
}

export default function SettingsPanel({ user, theme, setTheme, onClose, onLogout }: SettingsPanelProps) {
  const [editingNickname, setEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState(user.nickname);
  const [hideOnline, setHideOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateProfile = async (updates: any) => {
    setLoading(true);
    try {
      const response = await fetch(PROFILE_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, ...updates })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Сохранено!',
          description: 'Настройки обновлены'
        });
        return true;
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось сохранить',
          variant: 'destructive'
        });
        return false;
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось связаться с сервером',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNickname = async () => {
    if (await updateProfile({ nickname: newNickname })) {
      user.nickname = newNickname;
      setEditingNickname(false);
    }
  };

  const handleThemeChange = async (value: 'light' | 'dark' | 'system') => {
    setTheme(value);
    await updateProfile({ theme: value });
  };

  const handleToggleOnline = async (checked: boolean) => {
    setHideOnline(checked);
    await updateProfile({ hide_online_status: checked });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <Card className="glass-card w-full max-w-md p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Настройки</h2>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Профиль</Label>
            <div className="glass-dark p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Username</p>
              <p className="font-semibold">@{user.username}</p>
              <Separator className="my-2" />
              <p className="text-sm text-muted-foreground">Никнейм</p>
              {editingNickname ? (
                <div className="flex gap-2">
                  <Input
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    className="glass-dark"
                  />
                  <Button size="sm" onClick={handleSaveNickname} disabled={loading}>
                    <Icon name="Check" size={16} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingNickname(false)}>
                    <Icon name="X" size={16} />
                  </Button>
                </div>
              ) : (
                <p className="font-semibold">{user.nickname}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Тема оформления</Label>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger id="theme" className="glass-dark">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">Системная</SelectItem>
                <SelectItem value="light">Светлая</SelectItem>
                <SelectItem value="dark">Темная</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start glass-dark hover:bg-primary/20"
              onClick={() => setEditingNickname(true)}
            >
              <Icon name="User" size={18} className="mr-2" />
              Изменить никнейм
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start glass-dark hover:bg-primary/20"
            >
              <Icon name="Image" size={18} className="mr-2" />
              Изменить аватар
            </Button>
            
            <div className="flex items-center justify-between glass-dark p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon name="EyeOff" size={18} />
                <span>Скрыть статус онлайн</span>
              </div>
              <Switch checked={hideOnline} onCheckedChange={handleToggleOnline} />
            </div>
            
            <Button
              variant="outline"
              className="w-full justify-start glass-dark hover:bg-primary/20"
            >
              <Icon name="Shield" size={18} className="mr-2" />
              Защита аккаунта
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:bg-destructive/20 glass-dark"
              onClick={onLogout}
            >
              <Icon name="LogOut" size={18} className="mr-2" />
              Выйти из аккаунта
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:bg-destructive/20 glass-dark"
            >
              <Icon name="Trash2" size={18} className="mr-2" />
              Удалить аккаунт
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}