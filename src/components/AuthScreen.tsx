import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useToast } from '../hooks/use-toast';
import Icon from './ui/icon';

const AUTH_URL = 'https://functions.poehali.dev/c216886e-b8d8-40b8-b32d-8877b8726184';

interface AuthScreenProps {
  onLogin: (user: any) => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: mode === 'register' ? 'register' : 'login',
          username,
          password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: mode === 'register' ? 'Аккаунт создан!' : 'Вход выполнен!',
          description: `Добро пожаловать, ${data.user.nickname}!`
        });
        onLogin(data.user);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Что-то пошло не так',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка подключения',
        description: 'Не удалось связаться с сервером',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
      
      <Card className="glass-card w-full max-w-md p-8 relative z-10 animate-fade-in">
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Icon name="MessageCircle" size={32} className="text-primary" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Pchat
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          {mode === 'login' && 'Войдите в свой аккаунт'}
          {mode === 'register' && 'Создайте новый аккаунт'}
          {mode === 'reset' && 'Восстановление пароля'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode !== 'reset' && (
            <>
              <div>
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="glass-dark"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Пароль (мин. 7 символов, 1 цифра)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={7}
                  className="glass-dark"
                />
              </div>
            </>
          )}

          {mode === 'reset' && (
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="glass-dark"
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? (
              <Icon name="Loader2" className="animate-spin" />
            ) : (
              <>
                {mode === 'login' && 'Войти'}
                {mode === 'register' && 'Зарегистрироваться'}
                {mode === 'reset' && 'Отправить код'}
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {mode === 'login' && (
            <>
              <button
                onClick={() => setMode('register')}
                className="text-sm text-primary hover:underline block w-full"
              >
                Создать аккаунт
              </button>
              <button
                onClick={() => setMode('reset')}
                className="text-sm text-muted-foreground hover:text-primary transition-colors block w-full"
              >
                Забыли пароль?
              </button>
            </>
          )}
          {mode !== 'login' && (
            <button
              onClick={() => setMode('login')}
              className="text-sm text-primary hover:underline"
            >
              Назад к входу
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
