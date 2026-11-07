/*
 * 网易云已购专辑抓取脚本（本地工具，不入库）：
 * 用法：node scripts/fetch-albums.mjs
 * 产物：
 *   public/audio/albums/<albumKey>/<nn>-<songId>.<ext>   音源（320k）
 *   public/lyrics/<songId>.json                          每首歌词一个文件（LRC 解析）
 *   public/images/albums/<albumKey>.jpg                  专辑封面
 *   .mimosa/manifest.json                                供生成 src/data 的清单
 */
import fs from 'node:fs';
import path from 'node:path';

const COOKIE = 'MUSIC_U=00FD891555544D241CD37A47E6253100553F797F65C24EEBA999D8CE91E206EF41726E7C61DD7FA129732139684B18817035FF32FA4D0B64598398961F262AED47B527073653DFF9CCC724C56298293505927F24BE899CC5F6269CC3B5C30606CC285F9AD128737A2EDFA1572FEB5EBCFFC5BF494BDD1D0A073658EC6F10280A015DE9437D476E04A8A057CAABCDFFFAE6931228A747DEAB12F420D4F761B916ABD0469D0E490A3F51773059208819F1EAC6C2D478FF9AB948A3F2639F1E5C0D69594908D8738A866B5466B65DB38A86685F3B5A0645582E88592E645AD5BCBB891CBA22288DF2152712378A4BF82B771A330C4339EB8AC35D41EAA4359618180E1761C381F5E4AC541F573C973B15215CADD3C4D747A210D545EC430F835EE024E284CBBEFC58D1AE0D5A55F9518CCA60C3023D99928E3E116D6D7CB8EC8636BA4786FA4055EA97E46840BE892D2D0C88BEEF92DE087F10ADAA08DD2CE9B7026483F0E54EE04048DB85A1A5BFA199D2A3D3F45C1C69E1C16892BD8A1613466969BD231BD6C59042D9F4E3CC362A075ED1';
const H = { Cookie: COOKIE, Referer: 'https://music.163.com' };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const ALBUMS = [
  { key: 'sichongzou', name: '四重奏', id: 385696494 },
  { key: 'yiruchujian', name: '依如初见', id: 151073585 },
  { key: 'zaisheng', name: '再生', id: null },
  { key: 'wujinlan', name: '无尽蓝', id: null }
];

const root = process.cwd();

async function findAlbumIdByName(name) {
  const url = 'https://music.163.com/api/search/get/web?s=' + encodeURIComponent(name + ' 洛天依') + '&type=10&limit=20';
  const res = await fetch(url, { headers: H });
  const j = await res.json();
  const albums = (j.result && j.result.albums) || [];
  const hits = albums.filter(a => a.name.includes(name) && (a.artists || []).some(x => /洛天依|禾念|Vsinger/.test(x.name)));
  if (!hits.length) return null;
  hits.sort((a, b) => b.size - a.size); // 同名取曲目最多的版本
  console.log('  candidates for', name, '->', hits.map(a => `${a.name}(${a.id},${a.size}曲)`).join(', '));
  return hits[0].id;
}

async function download(url, file) {
  const headers = { Referer: 'https://music.163.com', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36' };
  let res = await fetch(url, { headers });
  if (!res.ok) {
    // 一次重试：换回原始协议
    await sleep(500);
    res = await fetch(url.replace('https://', 'http://'), { headers });
  }
  if (!res.ok) throw new Error('HTTP ' + res.status);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  // 定位缺失的专辑 id
  for (const a of ALBUMS) {
    if (!a.id) {
      a.id = await findAlbumIdByName(a.name);
      console.log('resolved', a.key, '->', a.id);
      await sleep(400);
    }
    if (!a.id) throw new Error('album not found: ' + a.key);
  }

  const manifest = [];
  const seenSongNames = new Set(); // 去重：同名曲只保留第一张专辑里的版本
  const seenSongIds = new Set();
  const audioRoot = path.join(root, 'public', 'audio', 'albums');
  const lyricRoot = path.join(root, 'public', 'lyrics');
  const coverRoot = path.join(root, 'public', 'images', 'albums');
  fs.mkdirSync(lyricRoot, { recursive: true });
  fs.mkdirSync(coverRoot, { recursive: true });

  for (const album of ALBUMS) {
    const res = await fetch('https://music.163.com/api/album/' + album.id, { headers: H });
    const j = await res.json();
    if (!j.album) throw new Error('album detail failed: ' + album.key);
    const { name, picUrl, publishTime, company } = j.album;
    const songs = j.album.songs || [];
    console.log(`\n== ${name}（${album.key}）publish=${new Date(publishTime).toISOString().slice(0, 10)} tracks=${songs.length} ==`);

    // 封面
    if (picUrl) {
      await download(picUrl + '?param=500y500', path.join(coverRoot, album.key + '.jpg'));
      console.log('  cover saved');
      await sleep(300);
    }

    const dir = path.join(audioRoot, album.key);
    fs.mkdirSync(dir, { recursive: true });

    const tracks = [];
    let nn = 0;
    for (const song of songs) {
      nn++;
      const no = String(nn).padStart(2, '0');
      const norm = song.name.replace(/\s+/g, '').toLowerCase();
      if (seenSongNames.has(norm)) {
        console.log(`  ${no} ${song.name} — 跨专辑重复，跳过`);
        continue;
      }
      if (seenSongIds.has(song.id)) continue;
      seenSongNames.add(norm);
      seenSongIds.add(song.id);

      // 播放地址
      const pres = await fetch('https://music.163.com/api/song/enhance/player/url?ids=%5B' + song.id + '%5D&br=320000', { headers: H });
      const pj = await pres.json();
      const item = pj.data && pj.data[0];
      if (!item || !item.url) {
        console.log(`  ${no} ${song.name} — 无播放地址（code=${item && item.code}），跳过`);
        continue;
      }
      const ext = (item.type || 'mp3').toLowerCase();
      const file = path.join(dir, `${no}-${song.id}.${ext}`);
      await download(item.url, file);
      console.log(`  ${no} ${song.name} — ${ext} ${(fs.statSync(file).size / 1024 / 1024).toFixed(1)}MB`);

      // 歌词
      let hasLyric = false;
      try {
        const lres = await fetch('https://music.163.com/api/song/lyric?id=' + song.id + '&lv=1&kv=1&tv=-1', { headers: H });
        const lj = await lres.json();
        const lrc = (lj.lrc && lj.lrc.lyric) || '';
        const lines = lrc.split('\n').map(l => l.trim()).filter(l => /^\[\d+:\d+/.test(l)).map(l => {
          const m = l.match(/^\[(\d+):(\d+)(?:\.(\d+))?\](.*)$/);
          return m ? { t: Math.round(((+m[1]) * 60 + (+m[2]) + (+((m[3] || '0').padEnd(3, '0'))) / 1000) * 100) / 100, text: m[4].trim() } : null;
        }).filter(Boolean).filter(x => x.text && !x.text.startsWith('版权声明'));
        if (lines.length) {
          fs.writeFileSync(path.join(lyricRoot, song.id + '.json'), JSON.stringify({ songId: song.id, title: song.name, lines }));
          hasLyric = true;
          console.log(`      lyrics: ${lines.length} 行`);
        }
      } catch (e) {
        console.log('      lyrics fetch fail:', e.message);
      }
      await sleep(300);

      tracks.push({
        id: String(song.id),
        no,
        title: song.name,
        src: `/audio/albums/${album.key}/${no}-${song.id}.${ext}`,
        lyric: hasLyric ? `/lyrics/${song.id}.json` : null,
        durationMs: song.dt || null
      });
    }

    manifest.push({
      key: album.key,
      id: album.id,
      title: name,
      publishTime: new Date(publishTime).toISOString().slice(0, 10),
      company: company || '',
      cover: `/images/albums/${album.key}.jpg`,
      tracks
    });
  }

  fs.mkdirSync(path.join(root, '.mimosa'), { recursive: true });
  fs.writeFileSync(path.join(root, '.mimosa', 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('\nmanifest -> .mimosa/manifest.json');
  console.log('tracks total:', manifest.reduce((n, a) => n + a.tracks.length, 0));
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
