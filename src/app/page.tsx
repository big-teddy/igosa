export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-4">
          이거사 (Igosa)
        </h1>
        <p className="text-xl text-center text-muted-foreground">
          AI 쇼핑 에이전트 플랫폼
        </p>
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            프로젝트 세팅 완료! 개발을 시작할 준비가 되었습니다.
          </p>
        </div>
      </div>
    </main>
  );
}
