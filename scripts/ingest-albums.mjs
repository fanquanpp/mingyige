/*
 * 把网易云客户端下载的专辑音频摄取进站点（本地工具）：
 * 用法：node scripts/ingest-albums.mjs
 * 输入：C:\Users\fanqu\Music 下的 mp3/flac + 同名 .lrc
 * 逻辑：拉取四张已购专辑的曲目表 → 按曲名匹配下载文件 → 去重（同名曲按专辑优先级取一）
 *       → 复制为 public/audio/albums/<albumKey>/<albumKey>-<nn>.<ext> → 客户端 .lrc 转成 public/lyrics/<trackId>.json
 * 产出：.mimosa/manifest.json（供生成 src/data/site-content.ts）
 */
import fs from 'node:fs';
import path from 'node:path';

const COOKIE = 'MUSIC_U=00FD891555544D241CD37A47E6253100553F797F65C24EEBA999D8CE91E206EF41726E7C61DD7FA129732139684B18817035FF32FA4D0B64598398961F262AED47B527073653DFF9CCC724C56298293505927F24BE899CC5F6269CC3B5C30606CC285F9AD128737A2EDFA1572FEB5EBCFFC5BF494BDD1D0A073658EC6F10280A015DE9437D476E04A8A057CAABCDFFFAE6931228A747DEAB12F420D4F761B916ABD0469D0E490A3F51773059208819F1EAC6C2D478FF9AB948A3F2639F1E5C0D69594908D8738A866B5466B65DB38A86685F3B5A0645582E88592E645AD5BCBB891CBA22288DF2152712378A4BF82B771A330C4339EB8AC35D41EAA4359618180E1761C381F5E4AC541F573C973B15215CADD3C4D747A210D545EC430F835EE024E284CBBEFC58D1AE0D5A55F9518CCA60C3023D99928E3E116D6D7CB8EC8636BA4786FA4055EA97E46840BE892D2D0C88BEEF92DE087F10ADAA08DD2CE9B7026483F0E54EE04048DB85A1A5BFA199D2A3D3F45C1C69E1C16892BD8A1613466969BD231BD6C59042D9F4E3CC362A075ED1';
const H = { Cookie: COOKIE, Referer: 'https://music.163.com' };
const MUSIC_DIR = 'C:\\Users\\fanqu\\Music';
const root = process.cwd();
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* 专辑与去重优先级（靠前的专辑优先保留同名曲） */
const ALBUMS = [
  { key: 'sichongzou', name: '四重奏', id: 385696494 },
  { key: 'zaisheng', name: '再生', id: 241083511 },
  { key: 'wujinlan', name: '无尽蓝', id: 157289084 },
  { key: 'yiruchujian', name: '依如初见', id: 151073585 }
];

function normalizeTitle(t) {
  return t.replace(/\s+/g, '').toLowerCase();
}

function parseLrc(text) {
  return text.split('\n').map(l => l.trim()).filter(l => /^\[\d+:\d+/.test(l)).map(l => {
    const m = l.match(/^\[(\d+):(\d+)(?:\.(\d+))?\](.*)$/);
    return m ? { t: Math.round(((+m[1]) * 60 + (+m[2]) + (+((m[3] || '0').padEnd(3, '0'))) / 1000) * 100) / 100, text: m[4].trim() } : null;
  }).filter(Boolean).filter(x => x.text && !x.text.startsWith('版权声明'));
}

async function main() {
  // 1. 清点下载目录
  const files = fs.readdirSync(MUSIC_DIR).filter(f => /\.(mp3|flac|m4a)$/i.test(f));
  const lrcs = new Set(fs.readdirSync(MUSIC_DIR).filter(f => /\.lrc$/i.test(f)));
  console.log('downloaded audio files:', files.length, '| lrc files:', lrcs.size);

  // 2. 拉取四张专辑曲目表
  const albumData = [];
  for (const album of ALBUMS) {
    const res = await fetch('https://music.163.com/api/album/' + album.id, { headers: H });
    const j = await res.json();
    const a = j.album;
    albumData.push({
      key: album.key,
      name: a.name,
      publishTime: new Date(a.publishTime).toISOString().slice(0, 10),
      cover: `/images/albums/${album.key}.jpg`,
      songs: a.songs.map(s => ({ id: String(s.id), name: s.name, durationMs: s.dt }))
    });
    console.log(`${a.name}(${album.key}): ${a.songs.length} 曲`);
    await sleep(300);
  }

  // 3. 封面
  const coverRoot = path.join(root, 'public', 'images', 'albums');
  fs.mkdirSync(coverRoot, { recursive: true });
  for (const album of albumData) {
    const url = 'https://music.163.com/api/album/' + album.id;
    const j = await (await fetch(url, { headers: H })).json();
    if (j.album && j.album.picUrl) {
      const img = await fetch(j.album.picUrl + '?param=500y500');
      fs.writeFileSync(path.join(coverRoot, album.key + '.jpg'), Buffer.from(await img.arrayBuffer()));
      console.log('cover saved:', album.key);
      await sleep(300);
    }
  }

  // 4. 匹配 + 复制 + 歌词
  const lyricRoot = path.join(root, 'public', 'lyrics');
  fs.mkdirSync(lyricRoot, { recursive: true });
  const audioRoot = path.join(root, 'public', 'audio', 'albums');
  const matched = [];   // {albumKey, title, src, lyric, durationMs}
  const takenTitles = new Set();

  for (const album of albumData) {
    const dir = path.join(audioRoot, album.key);
    fs.mkdirSync(dir, { recursive: true });
    let nn = 0;
    for (const song of album.songs) {
      const norm = normalizeTitle(song.name);
      if (takenTitles.has(norm)) continue; // 去重
      // 找下载文件：文件名 = "<artists> - <title>.<ext>"，title 需精确匹配
      const file = files.find(f => {
        const base = path.basename(f).replace(/\.(mp3|flac|m4a)$/i, '');
        const m = base.match(/^[^-]+\s*-\s*(.+)$/); // 艺术家 - 标题
        return m && normalizeTitle(m[1]) === norm;
      });
      if (!file) {
        console.log(`  [缺] ${album.key} / ${song.name}`);
        continue;
      }
      takenTitles.add(norm);
      nn++;
      const no = String(nn).padStart(2, '0');
      const ext = path.extname(file).slice(1).toLowerCase();
      const src = `/audio/albums/${album.key}/${album.key}-${no}.${ext}`;
      fs.copyFileSync(path.join(MUSIC_DIR, file), path.join(root, 'public', 'audio', 'albums', album.key, `${album.key}-${no}.${ext}`));

      // 歌词：优先客户端 .lrc
      const lrcName = path.basename(file.replace(/\.(mp3|flac|m4a)$/i, '.lrc'));
      let lines = null;
      if (lrcs.has(lrcName)) {
        lines = parseLrc(fs.readFileSync(path.join(MUSIC_DIR, lrcName), 'utf8'));
      }
      const trackId = `${album.key}-${no}`;
      if (lines && lines.length) {
        fs.writeFileSync(path.join(lyricRoot, trackId + '.json'), JSON.stringify({ songId: song.id, title: song.name, lines }));
      }
      matched.push({ albumKey: album.key, trackId, songId: song.id, no, title: song.name, src, lyric: lines && lines.length ? `/lyrics/${trackId}.json` : null, durationMs: song.durationMs });
      console.log(`  [收] ${album.key}-${no} ${song.name} (${ext}${lines && lines.length ? ', ' + lines.length + ' 行歌词' : ', 无歌词'})`);
    }
  }

  // 5. 未匹配到的下载文件（不在四张专辑里的，单独列出）
  const leftovers = files.filter(f => {
    const base = path.basename(f).replace(/\.(mp3|flac|m4a)$/i, '');
    const m = base.match(/^[^-]+\s*-\s*(.+)$/);
    const norm = m ? normalizeTitle(m[1]) : normalizeTitle(base);
    return !takenTitles.has(norm);
  });
  console.log('\n未匹配文件（不在四张专辑内）：');
  for (const f of leftovers) console.log('  -', path.basename(f));

  const manifest = albumData.map(a => ({
    key: a.key,
    title: a.name,
    publishTime: a.publishTime,
    cover: a.cover,
    tracks: matched.filter(m => m.albumKey === a.key).map(m => ({ id: m.trackId, songId: m.songId, no: m.no, title: m.title, src: m.src, lyric: m.lyric, durationMs: m.durationMs }))
  }));

  fs.mkdirSync(path.join(root, '.mimosa'), { recursive: true });
  fs.writeFileSync(path.join(root, '.mimosa', 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('\nmanifest -> .mimosa/manifest.json | tracks:', matched.length);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
