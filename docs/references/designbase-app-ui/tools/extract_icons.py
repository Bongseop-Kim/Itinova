"""pencil-new.pen(JSON)에서 `icons` 프레임의 아이콘을 SVG로 뽑는다. 사용: python3 extract_icons.py <file.pen> <out_dir>
경로 노드의 geometry(SVG d)를 프레임 좌표로 옮기고 fill 을 currentColor 로 바꾼다(단색 아이콘 전제)."""
import json, os, re, sys
pen, out = sys.argv[1], sys.argv[2]
d = json.load(open(pen))
icons = next(c for c in d['children'] if c.get('name') == 'icons')
def title(sec):
    acc = []
    def w(x):
        if x.get('type') == 'text': acc.append(x.get('content', ''))
        for k in x.get('children', []): w(k)
    w(sec['children'][0]); return acc[0] if acc else 'misc'
def svg(ic):
    W, H = ic.get('width', 24), ic.get('height', 24); parts = []
    def w(n, ox, oy):
        x, y = ox + (n.get('x') or 0), oy + (n.get('y') or 0)
        if n.get('type') == 'path' and n.get('geometry'):
            vb = n.get('viewBox'); tr = f'translate({x:g} {y:g})'
            if vb and (vb[0] or vb[1]): tr += f' translate({-vb[0]:g} {-vb[1]:g})'
            parts.append(f'<path transform="{tr}" d="{n["geometry"]}" fill-rule="{n.get("fillRule", "nonzero")}" fill="currentColor"/>')
        for k in n.get('children', []): w(k, x, y)
    for k in ic.get('children', []): w(k, 0, 0)
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:g} {H:g}" width="{W:g}" height="{H:g}">{"".join(parts)}</svg>'
n = 0
for sec in icons['children'][1:]:
    slug = re.sub(r'[^a-z0-9]+', '-', title(sec).lower()).strip('-'); os.makedirs(f'{out}/{slug}', exist_ok=True)
    for grid in sec['children'][1:]:
        for ic in grid.get('children', []):
            name = re.sub(r'\s+', '-', ic.get('name', 'icon').strip()); fn = f'{out}/{slug}/{name}.svg'
            if os.path.exists(fn): fn = f'{out}/{slug}/{name}-{ic["id"]}.svg'
            s = svg(ic)
            if '<path' in s: open(fn, 'w').write(s); n += 1
print(n, 'icons')
