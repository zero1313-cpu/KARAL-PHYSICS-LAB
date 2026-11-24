import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useApp } from '@/app/AppContext';
import type { BookmarkRecord } from '@/database/db';

export function BookmarkButton({ type, itemId, compact = false }: { type: BookmarkRecord['type']; itemId: string; compact?: boolean }) {
  const { bookmarks, toggleItemBookmark, t } = useApp();
  const saved = bookmarks.some((item) => item.key === `${type}:${itemId}`);
  return (
    <button
      className={`btn ${compact ? 'h-9 w-9 p-0' : ''}`}
      onClick={() => { void toggleItemBookmark(type, itemId); }}
      aria-label={saved ? t('removeBookmark') : t('addBookmark')}
      title={saved ? t('removeBookmark') : t('addBookmark')}
    >
      {saved ? <BookmarkCheck className="h-4 w-4 text-emerald-500" /> : <Bookmark className="h-4 w-4" />}
      {!compact && <span>{saved ? t('removeBookmark') : t('addBookmark')}</span>}
    </button>
  );
}
