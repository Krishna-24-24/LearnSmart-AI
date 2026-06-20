'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import QuizUI from '@/components/QuizUI';
import { api, getToken, setUser, getUser } from '@/lib/api';

export default function DiagnosticPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Awaited<ReturnType<typeof api.getDiagnostic>>['questions']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getToken()) {
      router.push('/login');
      return;
    }

    api
      .getDiagnostic()
      .then((data) => setQuestions(data.questions))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSubmit(
    answers: { questionId: string; selectedOption: number }[]
  ) {
    await api.submitDiagnostic(answers);
    const user = getUser();
    if (user) setUser({ ...user, diagnosticCompleted: true });
    router.push('/dashboard');
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-rose-400">{error}</p>
        <p className="mt-2 text-sm text-slate-400">
          Ensure the backend and ML service are running.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-10">
      <QuizUI
        questions={questions}
        title="Diagnostic Assessment"
        subtitle="Step 1 of your learning journey"
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}
