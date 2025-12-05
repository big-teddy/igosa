'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const formSchema = z.object({
    email: z.string().email('올바른 이메일 주소를 입력해주세요.'),
});

export default function ForgotPasswordPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // 실제로는 여기에 Supabase 비밀번호 재설정 로직 추가
        console.log(values);
        // 시뮬레이션
        setTimeout(() => setIsSubmitted(true), 1000);
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>비밀번호 재설정</CardTitle>
                    <CardDescription>
                        가입한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isSubmitted ? (
                        <div className="text-center space-y-4 py-4">
                            <div className="flex justify-center">
                                <CheckCircle className="h-12 w-12 text-green-500" />
                            </div>
                            <h3 className="font-semibold text-lg">이메일 전송 완료</h3>
                            <p className="text-muted-foreground text-sm">
                                입력하신 이메일로 비밀번호 재설정 링크가 전송되었습니다.
                                메일함을 확인해주세요.
                            </p>
                            <Button asChild className="w-full mt-4">
                                <Link href="/login">로그인으로 돌아가기</Link>
                            </Button>
                        </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>이메일</FormLabel>
                                            <FormControl>
                                                <Input placeholder="name@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="space-y-2">
                                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? '전송 중...' : '재설정 링크 보내기'}
                                    </Button>
                                    <Button variant="ghost" asChild className="w-full">
                                        <Link href="/login">
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            로그인으로 돌아가기
                                        </Link>
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
