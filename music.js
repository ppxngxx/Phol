let moodsData = {};
let artistList = [];

const moodNames = {
    happy: "😊 มีความสุข",
    sad: "😢 เศร้า",
    angry: "😡 โมโห",
    relax: "😌 ผ่อนคลาย",
    motivated: "💪 ฮึกเหิม"
};

async function loadMoods() {
    const res = await fetch('moods.json');
    moodsData = await res.json();
    // สร้างรายชื่อศิลปินจาก artistPlaylists
    artistList = Object.keys(moodsData.artistPlaylists || {});
}

function renderPlaylist(mood) {
    const section = document.getElementById('playlist-section');
    if (!moodsData[mood]) {
        section.innerHTML = `<div class="playlist-title">ไม่พบเพลงสำหรับอารมณ์นี้</div>`;
        return;
    }
    section.innerHTML = `
        <div class="playlist-title">เพลย์ลิสต์สำหรับ${moodNames[mood] || mood}</div>
        <ul class="song-list">
            ${moodsData[mood].map(song => `
                <li class="song-item">
                    <img class="song-cover" src="${song.cover}" alt="cover">
                    <div class="song-info">
                        <div class="song-title">${song.title}</div>
                        <div class="song-artist">${song.artist}</div>
                        <audio controls src="${song.preview}" style="width:100%;margin-top:4px;" preload="none"></audio>
                    </div>
                    <div class="song-actions">
                        <a href="${song.spotify}" target="_blank" title="ฟังบน Spotify"><i class="fab fa-spotify"></i> Spotify</a>
                        <a href="${song.youtube}" target="_blank" title="ฟังบน YouTube"><i class="fab fa-youtube"></i> YouTube</a>
                        <button onclick="shareSong('${song.title}','${song.artist}','${song.spotify}','${song.youtube}')"><i class="fas fa-share-alt"></i> แชร์</button>
                    </div>
                </li>
            `).join('')}
        </ul>
    `;
}

function renderArtistSelector() {
    if (!artistList.length) return;
    const section = document.getElementById('playlist-section');
    const html = `
        <div class="playlist-title">เลือกศิลปินเพื่อดูเพลย์ลิสต์</div>
        <div class="artist-select">
            ${artistList.map(artist => `<button class="artist-btn" data-artist="${artist}">${artist}</button>`).join('')}
        </div>
        <div id="artist-playlist"></div>
    `;
    section.innerHTML = html;
    document.querySelectorAll('.artist-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            renderArtistPlaylist(btn.dataset.artist);
        });
    });
}

function renderArtistPlaylist(artist) {
    const list = moodsData.artistPlaylists?.[artist] || [];
    const section = document.getElementById('artist-playlist');
    if (!list.length) {
        section.innerHTML = `<div class="playlist-title">ไม่พบเพลงของศิลปินนี้</div>`;
        return;
    }
    section.innerHTML = `
        <div class="playlist-title">เพลย์ลิสต์ของ ${artist}</div>
        <ul class="song-list">
            ${list.map(song => `
                <li class="song-item">
                    <img class="song-cover" src="${song.cover}" alt="cover">
                    <div class="song-info">
                        <div class="song-title">${song.title}</div>
                        <div class="song-artist">${artist}</div>
                        <audio controls src="${song.preview}" style="width:100%;margin-top:4px;" preload="none"></audio>
                    </div>
                    <div class="song-actions">
                        <a href="${song.spotify}" target="_blank" title="ฟังบน Spotify"><i class="fab fa-spotify"></i> Spotify</a>
                        <a href="${song.youtube}" target="_blank" title="ฟังบน YouTube"><i class="fab fa-youtube"></i> YouTube</a>
                        <button onclick="shareSong('${song.title}','${artist}','${song.spotify}','${song.youtube}')"><i class="fas fa-share-alt"></i> แชร์</button>
                    </div>
                </li>
            `).join('')}
        </ul>
    `;
}

window.shareSong = function(title, artist, spotify, youtube) {
    const text = `แนะนำเพลง "${title}" (${artist})\nฟังบน Spotify: ${spotify}\nหรือ YouTube: ${youtube}`;
    const url = youtube;
    if (navigator.share) {
        navigator.share({ title: title, text, url });
    } else {
        const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        if (confirm("แชร์เพลงนี้ทาง Line? (กด Cancel เพื่อแชร์ Facebook)")) {
            window.open(lineUrl, '_blank');
        } else {
            window.open(fbUrl, '_blank');
        }
    }
};

function setActiveMood(mood) {
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mood === mood);
    });
}

function aiAnalyze(text) {
    // mock: วิเคราะห์อารมณ์จากข้อความ
    text = text.toLowerCase();
    if (text.includes('ดีใจ') || text.includes('สุข') || text.includes('happy')) return 'happy';
    if (text.includes('เศร้า') || text.includes('sad')) return 'sad';
    if (text.includes('โกรธ') || text.includes('โมโห') || text.includes('angry')) return 'angry';
    if (text.includes('ผ่อนคลาย') || text.includes('relax')) return 'relax';
    if (text.includes('สู้') || text.includes('ฮึกเหิม') || text.includes('motivate')) return 'motivated';
    // default
    return 'relax';
}

document.addEventListener('DOMContentLoaded', async function() {
    await loadMoods();
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setActiveMood(btn.dataset.mood);
            renderPlaylist(btn.dataset.mood);
        });
    });
    document.getElementById('ai-btn').addEventListener('click', () => {
        const text = document.getElementById('ai-text').value.trim();
        if (!text) return;
        const mood = aiAnalyze(text);
        setActiveMood(mood);
        renderPlaylist(mood);
    });
    // เพิ่มปุ่มแสดงเพลย์ลิสต์ศิลปิน
    const section = document.getElementById('playlist-section');
    const artistBtn = document.createElement('button');
    artistBtn.textContent = "ดูเพลย์ลิสต์ตามศิลปิน";
    artistBtn.className = "artist-main-btn";
    artistBtn.onclick = renderArtistSelector;
    section.parentNode.insertBefore(artistBtn, section);
});