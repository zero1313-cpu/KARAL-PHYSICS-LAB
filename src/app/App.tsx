import { Home as HomeIcon } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';
import { Layout } from '@/components/Layout';
import { EmptyState } from '@/components/UI';
import { useApp } from './AppContext';
import { HomePage } from '@/features/home/HomePage';
import { CoursesPage, LawLibraryPage } from '@/features/courses/CoursesPage';
import { LessonDetailPage } from '@/features/courses/LessonDetailPage';
import { LabBrowserPage } from '@/features/labs/LabBrowserPage';
import { Lab3DPage } from '@/features/labs/Lab3DPage';
import { SimulationRunner } from '@/features/labs/SimulationRunner';
import { CalculatorPage, NumericalsPage } from '@/features/numericals/NumericalsPage';
import { FormulaBookPage } from '@/features/formulas/FormulaBookPage';
import { ExperimentDetailPage, ExperimentsPage } from '@/features/experiments/ExperimentsPage';
import { QuizRunner, QuizzesPage } from '@/features/quizzes/QuizzesPage';
import { BookmarksPage } from '@/features/library/BookmarksPage';
import { SearchPage } from '@/features/library/SearchPage';
import { ProgressPage } from '@/features/progress/ProgressPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { simulationById } from '@/simulations/registry';

function NotFound() {
  const { t, navigate } = useApp();
  return (
    <div className="space-y-4">
      <EmptyState title={t('notFound')} text={t('notFoundText')} />
      <button className="btn btn-primary mx-auto flex" onClick={() => navigate('home')}><HomeIcon className="h-4 w-4" /> {t('goHome')}</button>
    </div>
  );
}

function Router() {
  const { route, content } = useApp();
  const [page, id] = route;

  switch (page) {
    case undefined:
    case 'home': return <HomePage />;
    case 'courses': return <CoursesPage />;
    case 'course': return <CoursesPage levelParam={id} />;
    case 'laws': return <LawLibraryPage />;
    case 'lesson': {
      const lesson = content.lessons.find((item) => item.id === id);
      return lesson ? <LessonDetailPage lesson={lesson} /> : <NotFound />;
    }
    case 'lab': return <LabBrowserPage />;
    case 'sim': {
      const sim = id ? simulationById.get(id) : undefined;
      return sim ? <SimulationRunner sim={sim} /> : <NotFound />;
    }
    case 'three': return <Lab3DPage sceneId={id ?? ''} />;
    case 'numericals': return <NumericalsPage />;
    case 'calculator': return <CalculatorPage />;
    case 'formulas': return <FormulaBookPage />;
    case 'experiments': return <ExperimentsPage />;
    case 'experiment': {
      const experiment = content.experiments.find((item) => item.id === id);
      return experiment ? <ExperimentDetailPage experiment={experiment} /> : <NotFound />;
    }
    case 'quizzes': return <QuizzesPage />;
    case 'quiz': {
      const quiz = content.quizzes.find((item) => item.id === id);
      return quiz ? <QuizRunner key={quiz.id} quiz={quiz} /> : <NotFound />;
    }
    case 'bookmarks': return <BookmarksPage />;
    case 'search': return <SearchPage />;
    case 'progress': return <ProgressPage />;
    case 'settings': return <SettingsPage />;
    default: return <NotFound />;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Router />
      </Layout>
    </ErrorBoundary>
  );
}
