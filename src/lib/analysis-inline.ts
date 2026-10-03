/** Emphase du corps d’enquête : gras et italique du texte source, sans HTML brut. */

export type AnalysisBlock =
  | { type: 'p'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'table'; caption: string; headers: string[]; rows: string[][] };

function escapeHtml(src: string): string {
  return src
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** `**gras**` et `*italique*` du markdown d’enquête. Le reste est échappé. */
export function renderAnalysisInline(src: string): string {
  const escaped = escapeHtml(src);
  const withStrong = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  return withStrong.replace(/\*([^*]+)\*/g, '<em>$1</em>');
}
