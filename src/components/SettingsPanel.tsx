import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import Icon from './ui/icon';

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
              <p className="font-semibold">{user.nickname}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Тема оформления</Label>
            <Select value={theme} onValueChange={(value: any) => setTheme(value)}>
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
            
            <Button
              variant="outline"
              className="w-full justify-start glass-dark hover:bg-primary/20"
            >
              <Icon name="EyeOff" size={18} className="mr-2" />
              Скрыть статус онлайн
            </Button>
            
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
