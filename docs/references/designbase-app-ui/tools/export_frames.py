"""Pen 데스크톱 MCP 서버(stdio)로 프레임을 PNG 로 내보낸다. 사용: python3 export_frames.py <file.pen> <out_dir> <scale> id=name [id=name ...]
Pen 앱이 해당 문서를 열고 있어야 한다. 첫 호출은 워밍업이라 1분쯤 걸릴 수 있다."""
import json, os, sys, signal
sys.path.insert(0, os.path.dirname(__file__)); from pen_mcp import MCP
signal.alarm(600)
pen, out, scale, pairs = sys.argv[1], os.path.abspath(sys.argv[2]), sys.argv[3], dict(p.split('=') for p in sys.argv[4:])
os.makedirs(out, exist_ok=True); m = MCP()
for _ in range(2):
    if 'error' not in m.tool('execute', {'filePath': pen, 'input': 'Print("warm")'}): break
ids = list(pairs)
for i in range(0, len(ids), 6):
    r = m.tool('execute', {'filePath': pen, 'input': f'Export({json.dumps(ids[i:i+6])}, "png", {json.dumps(out)}, {{scale: {scale}}})'})
    if 'error' in r: print('ERR', r)
for k, v in pairs.items():
    if os.path.exists(f'{out}/{k}.png'): os.rename(f'{out}/{k}.png', f'{out}/{v}.png')
print(sorted(os.listdir(out)))
