'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { UserLoginReq } from '@/api/sys/UserController';
import { setCurrentUserInfo, setTokenName, setTokenValue } from '@/common/utils';
import { useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import LoginController from '@/api/sys/LoginController';

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    LoginController.login({
      email,
      password,
    } as UserLoginReq)
      .then(userLoginInfoResp => {
        if (userLoginInfoResp.tokenValue && userLoginInfoResp.tokenName) {
          setTokenValue(userLoginInfoResp.tokenValue);
          setTokenName(userLoginInfoResp.tokenName);

          setCurrentUserInfo(userLoginInfoResp.user);
          router.push('/');
        } else {
          toast.warning('登录失败，请重试。');
        }
      })
      .catch(e => {
        console.log('登录失败', e);
        const message = (e && e.errorMessage) || '登录失败，请重试。';
        toast.warning(message);
      });
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Toaster position="top-center" />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
              {/*<Button variant="outline" className="w-full">*/}
              {/*    Login with Google*/}
              {/*</Button>*/}
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <a href="#" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
