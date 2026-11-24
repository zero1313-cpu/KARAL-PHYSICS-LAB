import { useMemo } from 'react';
import katex from 'katex';

interface MathTextProps {
  latex: string;
  display?: boolean;
  className?: string;
}

export function MathText({ latex, display = false, className = '' }: MathTextProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, { throwOnError: false, displayMode: display, output: 'html' });
    } catch {
      return `<span>${latex}</span>`;
    }
  }, [latex, display]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
