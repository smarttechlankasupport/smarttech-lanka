from pathlib import Path
import re
root = Path('frontend')
patterns = [
    ('hover:text-cyan-400', 'hover:text-white'),
    ('text-cyan-400', 'text-white'),
    ('hover:border-cyan-400/30', 'hover:border-white/10'),
    ('hover:border-cyan-400/25', 'hover:border-white/10'),
    ('hover:bg-cyan-400/5', 'hover:bg-white/10'),
    ('focus:border-cyan-400/40', 'focus:border-white/20'),
    ('bg-cyan-400/20', 'bg-white/10'),
    ('bg-cyan-400/15', 'bg-white/10'),
    ('bg-cyan-400/10', 'bg-white/10'),
    ('bg-cyan-400/8', 'bg-white/10'),
    ('bg-cyan-400', 'bg-white/10'),
    ('border-cyan-400/40', 'border-white/10'),
    ('border-cyan-400/30', 'border-white/10'),
    ('border-cyan-400', 'border-white/10'),
    ('shadow-cyan', 'shadow-soft'),
    ('text-blue-600', 'text-white'),
    ('bg-blue-600', 'bg-gray-900'),
    ('from-cyan-400 to-blue-600', 'from-white/50 to-gray-300/15'),
    ('from-cyan-400', 'from-white/50'),
    ('to-blue-600', 'to-gray-300/15'),
    ('from-blue-600', 'from-gray-300/15'),
    ("style={{ background: 'radial-gradient(circle, #00d4ff, transparent)' }}", "style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08), transparent)' }}"),
    ("style={{ background: 'linear-gradient(135deg, #00d4ff33, #0051cc33)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }}", "style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))', color: '#f8f8f8', border: '1px solid rgba(255,255,255,0.08)' }}"),
    ("color: '#00d4ff'", "color: '#f8f8f8'"),
    ("color: '#00ff9d'", "color: '#f8f8f8'"),
    ("color: '#ffd700'", "color: '#f8f8f8'"),
    ("color: '#a78bfa'", "color: '#f8f8f8'"),
    ("color: '#ff6b6b'", "color: '#f8f8f8'"),
    ("color: '#74b9ff'", "color: '#f8f8f8'"),
    ('#00d4ff', '#f8f8f8'),
    ('#00ff9d', '#d9d9d9'),
    ('#ffd700', '#d9d9d9'),
    ('#a78bfa', '#d9d9d9'),
    ('#ff6b6b', '#d9d9d9'),
    ('#74b9ff', '#d9d9d9'),
    ('rgba(0,212,255,0.08)', 'rgba(255,255,255,0.08)'),
    ('rgba(0,212,255,0.2)', 'rgba(255,255,255,0.08)'),
    ('rgba(0,212,255,0.25)', 'rgba(255,255,255,0.08)'),
]
changed = {}
for p in root.rglob('*'):
    if p.suffix in {'.js', '.jsx', '.css'} and p.is_file():
        text = p.read_text(encoding='utf-8')
        original = text
        for old, new in patterns:
            text = text.replace(old, new)
        if text != original:
            p.write_text(text, encoding='utf-8')
            changed[p] = sum(1 for _ in re.finditer('|'.join(re.escape(old) for old, _ in patterns), original))
print('Updated files:')
for path, count in changed.items():
    print(path, count)
