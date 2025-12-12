'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageSearch } from '@/components/search/ImageSearch';
import { Search } from 'lucide-react';

export default function SearchPage() {
    const [activeTab, setActiveTab] = useState('text');

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold gradient-text">스마트 검색</h1>
                    <p className="text-muted-foreground">
                        텍스트로 검색하거나, 사진을 업로드해서 AI가 자동으로 찾아드립니다
                    </p>
                </div>

                {/* Search Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                        <TabsTrigger value="text">
                            <Search className="mr-2 h-4 w-4" />
                            텍스트 검색
                        </TabsTrigger>
                        <TabsTrigger value="image">
                            📸 이미지 검색 (AI)
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="text" className="mt-8">
                        <div className="text-center text-muted-foreground p-12 glass-card">
                            <p>텍스트 검색 기능은 메인 페이지의 검색바를 이용해주세요.</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="image" className="mt-8">
                        <ImageSearch />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
