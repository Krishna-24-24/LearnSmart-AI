'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import QuizUI from '@/components/QuizUI';
import { api, getToken, AdaptiveResult } from '@/lib/api';

export default function AdaptiveQuizPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Awaited<ReturnType<typeof api.getAdaptiveQuiz>>['questions']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getToken()) {
      router.push('/login');
      return;
    }

    api
      .getAdaptiveQuiz()
      .then((data) => setQuestions(data.questions))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSubmit(
    answers: { questionId: string; selectedOption: number }[]
  ) {
    const result: AdaptiveResult = await api.submitAdaptive(answers);
    sessionStorage.setItem('learnsmart_quiz_result', JSON.stringify(result));
    router.push('/quiz/results');
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-rose-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-10">
      <QuizUI
        questions={questions}
        title="Practice Weak Areas"
        subtitle="Adaptive quiz · 10 IRT-selected questions"
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}
