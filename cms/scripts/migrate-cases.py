#!/usr/bin/env python3
"""
一次性脚本：从本地缓存的远程 case HTML 提取 sections，
直接写入 Strapi SQLite 数据库（components_case_sections + solutions_cmps）。

Strapi restart 后会自动识别新组件并暴露到 /api/solutions?sections populate。

运行：
    python3 migrate-cases.py

幂等：可重复运行，会先清掉对应 solution 的旧 sections 再写新的。
"""
import sqlite3
import sys
import time
from pathlib import Path

from bs4 import BeautifulSoup
from markdownify import markdownify as md

# 默认数据库路径（与 cms/config/database.ts DATABASE_FILENAME 一致）
DB_PATH = Path(__file__).parent.parent / '.cms' / 'db' / 'data.db'

# 文件名 → solution slug 的映射
SLUG_MAP: dict[str, str] = {
    'manufacturing.html':  'manufacturing-ai-landing',
    'drawing-review.html': 'case-ai-drawing-review',
    'quotation.html':      'case-ai-quoting',
    'double-system.html':  'dual-system-contract-linkage',
    'first-patent.html':   'case-ai-patent',
}

CACHE_DIR = Path(__file__).parent / 'html-cache'


def extract_sections(html_path: Path) -> list[dict]:
    """从远程 case HTML 提取 {heading, body} sections 列表。

    远程页面结构：
        <article>
            <a>back</a>
            <header>hero</header>
            <div>
                <section> <!-- 第一节 -->
                    <h2>heading 1</h2>
                    <p>body...</p>
                </section>
                <section> <!-- 第二节 -->
                    <h2>heading 2</h2>
                    ...
                </section>
            </div>
        </article>
    """
    soup = BeautifulSoup(html_path.read_text(encoding='utf-8'), 'html.parser')
    article = soup.find('article')
    if not article:
        raise RuntimeError(f'No <article> in {html_path}')

    out: list[dict] = []
    for section in article.find_all('section', recursive=True):
        h2 = section.find('h2', recursive=False)
        if not h2:
            continue
        heading = h2.get_text(strip=True)
        # 移除 h2 自身，避免在 body 里再渲染一次标题
        h2.decompose()
        # 剩余的 inner HTML 转为 markdown
        body_html = section.decode_contents()
        body = md(
            body_html,
            heading_style='ATX',
            bullets='-',
            strip=['script', 'style'],
        )
        body = '\n'.join(line for line in body.splitlines() if line.strip())
        out.append({
            'heading': heading[:120],
            'body': body,
        })
    return out


def main() -> int:
    if not DB_PATH.exists():
        print(f'ERR: {DB_PATH} not found', file=sys.stderr)
        return 1

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # 确认表存在
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='components_case_sections'")
    if not cur.fetchone():
        print('ERR: components_case_sections table not found — Strapi not migrated?')
        print('  Restart Strapi to auto-migrate schema, then re-run this script.')
        return 1

    for html_name, slug in SLUG_MAP.items():
        path = CACHE_DIR / html_name
        if not path.exists():
            print(f'  [SKIP] {html_name} not in {CACHE_DIR}')
            continue

        print(f'== {html_name} → {slug} ==')
        cur.execute('SELECT id FROM solutions WHERE slug = ?', (slug,))
        row = cur.fetchone()
        if not row:
            print(f'  [WARN] solution {slug} not found, skip')
            continue
        solution_id = row[0]

        sections = extract_sections(path)
        print(f'  Extracted {len(sections)} sections')
        for s in sections:
            preview = s['body'][:60].replace('\n', ' ')
            print(f'    - {s["heading"]!r} ({len(s["body"])} chars): {preview}…')

        # 1) 清掉旧 sections（component row + link row）
        cur.execute('''
            SELECT cmp_id FROM solutions_cmps
            WHERE entity_id = ? AND component_type = 'case.section' AND field = 'sections'
        ''', (solution_id,))
        old_cmp_ids = [r[0] for r in cur.fetchall()]
        if old_cmp_ids:
            placeholders = ','.join('?' * len(old_cmp_ids))
            cur.execute(f'DELETE FROM solutions_cmps WHERE cmp_id IN ({placeholders}) AND entity_id = ?',
                        (*old_cmp_ids, solution_id))
            cur.execute(f'DELETE FROM components_case_sections WHERE id IN ({placeholders})', old_cmp_ids)
            print(f'  Cleared {len(old_cmp_ids)} old sections')

        # 2) 插新 sections（components_case_sections + solutions_cmps）
        now_ms = int(time.time() * 1000)
        for i, s in enumerate(sections):
            cur.execute('''
                INSERT INTO components_case_sections (heading, body)
                VALUES (?, ?)
            ''', (s['heading'], s['body']))
            cmp_id = cur.lastrowid
            cur.execute('''
                INSERT INTO solutions_cmps
                    (entity_id, cmp_id, component_type, field, "order")
                VALUES (?, ?, 'case.section', 'sections', ?)
            ''', (solution_id, cmp_id, float(i)))
        print(f'  [OK] inserted {len(sections)} sections for solution id={solution_id}')

    conn.commit()
    conn.close()
    print('\nAll done. Restart Strapi to pick up changes (it auto-loads SQLite).')
    return 0


if __name__ == '__main__':
    sys.exit(main())
