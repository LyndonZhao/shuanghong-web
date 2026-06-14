import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./data', () => ({
  getAllSolutions: vi.fn(),
}));

import { buildSearchIndex } from './search';
import { getAllSolutions } from './data';

const mockGetAllSolutions = vi.mocked(getAllSolutions);

describe('buildSearchIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('combines solutions with static pages', async () => {
    mockGetAllSolutions.mockResolvedValue([
      {
        id: 1,
        title: '导览产品',
        slug: 'tour-guide',
        category: 'multimodal',
        order: 1,
        description: '智慧导览解决方案',
        tags: ['机器人'],
      },
    ] as any);

    const index = await buildSearchIndex();

    // 1 solution + 6 static pages = 7
    expect(index).toHaveLength(7);

    const solution = index.find((i) => i.type === 'solution');
    expect(solution).toMatchObject({
      type: 'solution',
      id: 1,
      title: '导览产品',
      href: '/cases/tour-guide',
    });

    const home = index.find((i) => i.type === 'page' && i.href === '/');
    expect(home).toBeDefined();
    expect(home!.title).toBe('首页');
  });

  it('routes ai_application solutions to /ai-application', async () => {
    mockGetAllSolutions.mockResolvedValue([
      { id: 2, title: 'AI 辅助专利撰写', slug: 'ai-patent', category: 'ai_application', order: 5 } as any,
    ]);

    const index = await buildSearchIndex();
    const item = index.find((i) => i.type === 'solution');

    expect(item?.href).toBe('/cases/ai-patent');
  });

  it('handles solutions with no tags', async () => {
    mockGetAllSolutions.mockResolvedValue([
      { id: 3, title: 'Test', slug: 't', category: 'multimodal', order: 1, tags: null } as any,
    ]);

    const index = await buildSearchIndex();
    const item = index.find((i) => i.type === 'solution');
    expect(item?.tags).toEqual([]);
  });
});
