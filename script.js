/* script.js — full neon logic: data, render, random, konami, logo clicks, music */

// ---------- data (games with slugs & descriptions) ----------
const games = [
  { slug:"repo", name:"R.E.P.O.", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3241660/2cff5912c1add2e009eb1c1c630a47ac06cb81a1/capsule_616x353.jpg?t=1743517226", tags:["online"], desc:"Кооперативный шутер с атмосферой постапокалипсиса — руби, кради, выживай." },
  { slug:"peak", name:"PEAK", img:"https://assetsio.gnwcdn.com/peak-1.jpg?width=1920&height=1920&fit=bounds&quality=70&format=jpg&auto=webp", tags:["online"], desc:"Психоделическая экшн-приключуха с бешеным саундтреком и странными мирами." },
  { slug:"the-long-drive", name:"The Long Drive", img:"https://avatars.mds.yandex.net/get-vthumb/1594462/e169fc00fb156e7f4abbd2fead4aa1d2/564x318_1", tags:[], desc:"Длинная дорога, пустыня, радио и поломки — в путь и не оглядывайся." },
  { slug:"minecraft", name:"Minecraft (в разработке)", img:"https://education.minecraft.net/content/dam/education-edition/blogs/nether.png", dev:true, tags:["online"], desc:"Сборки, оптимизация и кастомные модпаки. Скоро здесь будут сборки специально под сквад." },
  { slug:"content-warning", name:"Content Warning", img:"https://i.ytimg.com/vi/OPhjmDN7RUs/maxresdefault.jpg", tags:["online","coop"], desc:"Кооперативный хаос ради просмотров — контент, который шокирует и притягивает." },
  { slug:"headliners", name:"Headliners", img:"https://i.ytimg.com/vi/WzVMuDdOR8E/maxresdefault.jpg", tags:["online"], desc:"Музыкальные баттлы и сцена, где каждый хочет стать звездой и выиграть аудиторию." },
  { slug:"buckshot-roulette", name:"Buckshot Roulette", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2835570/capsule_616x353.jpg", tags:[], desc:"Риск, дробовик и нервы — рулетка для настоящих экстремалов." },
  { slug:"guilty-as-sock", name:"Guilty As Sock", img:"https://i.ytimg.com/vi/I5F4KDgj4Q8/maxresdefault.jpg", tags:[], desc:"Юмористическое приключение — суд над носком, абсурд и мемы." },
  { slug:"deep-rock", name:"Deep Rock Galactic", img:"https://i.ytimg.com/vi/1AIXfu5F40w/maxresdefault.jpg", tags:["coop"], desc:"Кооп-шутер про шахтёров, жуков и тонны лута. Берём кирки и вперёд." },
  { slug:"among-us", name:"Among Us", img:"https://cs14.pikabu.ru/post_img/2021/05/27/9/og_og_1622127656226062215.jpg", tags:["online","coop"], desc:"Классика предательства и подозрений — игра для тех, кто любит драму." },
  // secret game included but hidden
  { slug:"1337-protocol", name:"1337 Protocol", img:"https://i.imgur.com/ZHLH3VL.jpeg", secret:true, desc:"Запрещённая сборка. Страница глючит, текст шепчет. Только для тех, кто знает код." }
];

// ---------- DOM refs ----------
const gamesContainer = document.getElementById("gamesContainer");
const tagFilters = document.getElementById("tagFilters");
const playBtn = document.getElementById("playMusic");
const randomBtn = document.getElementById("randomBtn");
const logo = document.getElementById("logo");

// ---------- build tag filter UI ----------
const allTags = [...new Set(games.flatMap(g => g.tags))].filter(t=>t);
let activeTag = null;
allTags.forEach(tag=>{
  const el = document.createElement("div");
  el.className = "tag";
  el.textContent = tag;
  el.onclick = () => {
    activeTag = (activeTag===tag)?null:tag;
    document.querySelectorAll(".tag").forEach(t=>t.classList.toggle("active", t===el));
    renderGames();
  };
  tagFilters.appendChild(el);
});

// ---------- render function ----------
function renderGames(){
  gamesContainer.innerHTML = "";
  const visible = games.filter(g => !g.secret && (!activeTag || g.tags.includes(activeTag)));
  visible.forEach((g, idx) => {
    const card = document.createElement("div");
    card.className = "game-card";
    // animation delay for staggered entrance
    card.style.animationDelay = (idx * 100) + "ms";

    card.innerHTML = `
      <img src="${g.img}" alt="${escapeHtml(g.name)}" loading="lazy">
      <h2>${escapeHtml(g.name)}</h2>
      ${g.dev ? '<div class="dev-label">В разработке</div>' : ''}
    `;

    // click -> game page with smooth transition
    card.onclick = () => {
      card.style.transform = "scale(0.95)";
      setTimeout(() => {
        window.location.href = `game.html?id=${encodeURIComponent(g.slug)}`;
      }, 150);
    };

    // neon spotlight under cursor
    card.onmousemove = e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--x", x + "px");
      card.style.setProperty("--y", y + "px");
    };

    card.onmouseleave = () => {
      card.style.setProperty("--x", "-999px");
      card.style.setProperty("--y", "-999px");
    };

    gamesContainer.appendChild(card);
    
    // Trigger animation after append
    requestAnimationFrame(() => {
      card.style.opacity = "1";
    });
  });
}
renderGames();

// helper
function escapeHtml(s){ return (s+"").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }

// ---------- Random Game ----------
randomBtn.onclick = () => {
  const pool = games.filter(g => !g.secret);
  const pick = pool[Math.floor(Math.random() * pool.length)];
  if(pick) window.location.href = `game.html?id=${encodeURIComponent(pick.slug)}`;
};

// ---------- Music (doomsound.mp3 in root) + volume + doom video ----------
let currentVolume = 0.7;
let audio = new Audio("doomsound.mp3");
audio.loop = true;
audio.volume = currentVolume;
let playing = false;

const doomVideo = document.getElementById("doomVideo");

const volumeSlider = document.getElementById("volumeSlider");
// отдельная ссылка на звук гифки, чтобы к нему был доступ внутри обработчика ползунка
let myaAudio = null;
if(volumeSlider){
  volumeSlider.value = String(currentVolume * 100);
  volumeSlider.addEventListener("input", () => {
    const value = Number(volumeSlider.value) || 0;
    currentVolume = Math.min(1, Math.max(0, value / 100));
    audio.volume = currentVolume;
    if(myaAudio){
      myaAudio.volume = currentVolume;
    }
  });
}
playBtn.onclick = async () => {
  try {
    if(!playing){
      await audio.play();
      if(doomVideo){
        try{
          doomVideo.currentTime = 5;
          await doomVideo.play();
        }catch(e){
          console.warn("Не удалось запустить видео doom:", e);
        }
      }
      playing = true;
      playBtn.textContent = "⏸ Pause Vibe";
    } else {
      audio.pause();
      if(doomVideo){
        doomVideo.pause();
      }
      playing = false;
      playBtn.textContent = "🎵 Play Vibe";
    }
  } catch(err){
    console.warn("Автовоспроизведение заблокировано браузером.", err);
    // можно показать уведомление пользователю
  }
};

// ---------- Konami Code (↑↑↓↓←→←→BA) to open secret ----------
const konami = [38,38,40,40,37,39,37,39,66,65];
let kpos = 0;
window.addEventListener("keydown", e=>{
  if(e.keyCode === konami[kpos]) {
    kpos++;
    if(kpos === konami.length){
      kpos = 0;
      // find secret game
      const secret = games.find(g=>g.secret);
      if(secret) window.location.href = `game.html?id=${encodeURIComponent(secret.slug)}`;
    }
  } else kpos = 0;
});

// ---------- Logo clicks -> 10 clicks toggles 1337 mode ----------
let logoClicks = 0;
logo.addEventListener("click", ()=>{
  logoClicks++;
  if(logoClicks >= 10){
    document.body.classList.toggle("ghost-1337");
    logoClicks = 0;
    // small pulse
    logo.animate([{transform:"scale(1)"},{transform:"scale(1.08)"},{transform:"scale(1)"}], {duration:400});
  }
});

// ---------- global console function to activate secret ----------
window.activate1337 = function(){
  const secret = games.find(g=>g.secret);
  if(secret) window.location.href = `game.html?id=${encodeURIComponent(secret.slug)}`;
};

// ---------- Dance GIF click -> play mya.mp3 ----------
const danceGif = document.getElementById("danceGif");
if(danceGif){
  myaAudio = new Audio("mya.mp3");
  myaAudio.volume = currentVolume;
  danceGif.style.cursor = "pointer";
  danceGif.addEventListener("click", async () => {
    try {
      myaAudio.currentTime = 0; // Перезапуск с начала
      myaAudio.volume = currentVolume;
      await myaAudio.play();
    } catch(err){
      console.warn("Не удалось воспроизвести звук:", err);
    }
  });
}