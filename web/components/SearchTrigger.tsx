import { CommandPalette } from './CommandPalette';
import { buildSearchIndex } from '@/lib/search';

/**
 * Server component that builds the search index at build/request time,
 * then renders the client-side CommandPalette.
 */
export async function SearchTrigger() {
  const items = await buildSearchIndex();
  return <CommandPalette items={items} />;
}
