const tg = window.Telegram.WebApp;
tg.expand();

const mainScreen = document.getElementById('mainScreen');
const modal = document.getElementById('heroModal');
const heroesList = document.getElementById('heroesList');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');

let allHeroes = [];
let currentRole = 'ALL';

const roleConfig = {
    'CARRY': { icon: '🗡', class: 'role-carry' },
    'MID': { icon: '⚔️', class: 'role-mid' },
    'OFFLANE': { icon: '🛡️', class: 'role-offlane' },
    'SUPPORT': { icon: '⊕', class: 'role-support' }
};

fetch('heroes_v2.json')
    .then(response => response.json())
    .then(data => {
        allHeroes = data;
        renderHeroes();
    })
    .catch(error => {
        heroesList.innerHTML = '<div style="text-align:center; color:#f87171;">Ошибка загрузки меты!</div>';
    });

function renderHeroes() {
    heroesList.innerHTML = '';
    const query = searchInput.value.toLowerCase();
    
    let filtered = allHeroes.filter(h => {
        const matchRole = (currentRole === 'ALL' || h.role === currentRole);
        const matchSearch = h.name.toLowerCase().includes(query);
        return matchRole && matchSearch;
    });

    if (filtered.length === 0) {
        heroesList.innerHTML = '<div style="text-align:center; color:gray;">Герои не найдены</div>';
        return;
    }
    
    filtered.forEach(hero => {
        const conf = roleConfig[hero.role] || { icon: '', class: '' };
        const card = document.createElement('div');
        card.className = 'hero-card';
        
        let badgeColor = hero.winrate >= 50 ? '#4ade80' : '#f87171';
        let badgeBorder = hero.winrate >= 50 ? 'rgba(46, 204, 113, 0.3)' : 'rgba(248, 113, 113, 0.3)';

        card.innerHTML = `
            <img src="${hero.img}" alt="${hero.name}" class="hero-img">
            <div class="hero-info">
                <h3 class="hero-name">${hero.name}</h3>
                <span class="hero-role ${conf.class}">${conf.icon} ${hero.role}</span>
            </div>
            <div class="winrate-badge" style="color: ${badgeColor}; border-color: ${badgeBorder}">
                ${hero.winrate.toFixed(1)}%
            </div>
        `;
        
        card.addEventListener('click', () => openHeroProfile(hero, conf));
        heroesList.appendChild(card);
    });
}

function renderItems(containerId, itemsArray) {
    const container = document.getElementById(containerId);
    if (!container) return; // Защита от ошибок, если блока нет
    container.innerHTML = '';
    if (itemsArray && itemsArray.length > 0) {
        itemsArray.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.className = 'item-img';
            container.appendChild(img);
        });
    }
}

function openHeroProfile(hero, conf) {
    // Шапка
    document.getElementById('modalHeaderBg').style.backgroundImage = `url('${hero.bg_img}')`;
    document.getElementById('modalName').textContent = hero.name;
    document.getElementById('modalRole').className = `hero-role ${conf.class}`;
    document.getElementById('modalRole').innerHTML = `${conf.icon} ${hero.role}`;

    // Контрпики
    const modalCounters = document.getElementById('modalCounters');
    modalCounters.innerHTML = '';
    if (hero.counters) {
        hero.counters.forEach(c => {
            modalCounters.innerHTML += `
                <div class="counter-item">
                    <img src="${c.img}" class="counter-img">
                    <span class="counter-name">${c.name}</span>
                </div>
            `;
        });
    }

    // Сборка по стадиям
    if (hero.build) {
        renderItems('buildStart', hero.build.start);
        renderItems('buildEarly', hero.build.early);
        renderItems('buildCore', hero.build.core);
        renderItems('buildLate', hero.build.late);
        renderItems('buildSituational', hero.build.situational);
        // Вызов контр-предметов удален
    }

    mainScreen.style.display = 'none';
    modal.style.display = 'flex';
}

// Закрытие по кнопке Назад
document.getElementById('closeModal').addEventListener('click', () => {
    modal.style.display = 'none';
    mainScreen.style.display = 'block';
});

searchInput.addEventListener('input', renderHeroes);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentRole = btn.getAttribute('data-role');
        
        const ct = document.getElementById('categoryTitle');
        if (currentRole === 'ALL') ct.innerHTML = '👥 Все Герои';
        else if (currentRole === 'CARRY') ct.innerHTML = '🗡 Керри';
        else if (currentRole === 'MID') ct.innerHTML = '⚔️ Мид';
        else if (currentRole === 'OFFLANE') ct.innerHTML = '🛡️ Оффлейн';
        else if (currentRole === 'SUPPORT') ct.innerHTML = '⊕ Саппорты';
        
        renderHeroes();
    });
});