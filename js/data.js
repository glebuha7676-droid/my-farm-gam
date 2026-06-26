const PLANTS = {
    carrot:      { id: 'carrot',      name: 'Морковь',   cost: 10,    time: 8,   reward: 30,    lvl: 1,  baseW: 0.2,  color: '#e67e22' },
    cucumber:    { id: 'cucumber',    name: 'Огурец',    cost: 15,    time: 12,  reward: 45,    lvl: 2,  baseW: 0.3,  color: '#2ecc71' },
    tomato:      { id: 'tomato',      name: 'Томат',     cost: 25,    time: 15,  reward: 75,    lvl: 2,  baseW: 0.25, color: '#e74c3c' },
    pepper:      { id: 'pepper',      name: 'Перец',     cost: 40,    time: 20,  reward: 120,   lvl: 3,  baseW: 0.15, color: '#c0392b' },
    strawberry:  { id: 'strawberry',  name: 'Клубника',  cost: 60,    time: 25,  reward: 180,   lvl: 3,  baseW: 0.05, color: '#ff4757' },
    eggplant:    { id: 'eggplant',    name: 'Баклажан',  cost: 90,    time: 30,  reward: 280,   lvl: 4,  baseW: 0.4,  color: '#9b59b6' },
    pumpkin:     { id: 'pumpkin',     name: 'Тыква',     cost: 150,   time: 40,  reward: 500,   lvl: 5,  baseW: 5.0,  color: '#d35400' },
    corn:        { id: 'corn',        name: 'Кукуруза',  cost: 250,   time: 50,  reward: 850,   lvl: 6,  baseW: 0.3,  color: '#f1c40f' },
    mushroom:    { id: 'mushroom',    name: 'Гриб',      cost: 350,   time: 55,  reward: 1200,  lvl: 6,  baseW: 0.1,  color: '#bdc3c7' },
    watermelon:  { id: 'watermelon',  name: 'Арбуз',     cost: 500,   time: 60,  reward: 1800,  lvl: 7,  baseW: 6.0,  color: '#27ae60' },
    melon:       { id: 'melon',       name: 'Дыня',      cost: 750,   time: 75,  reward: 2800,  lvl: 8,  baseW: 3.5,  color: '#f6e58d' },
    pineapple:   { id: 'pineapple',   name: 'Ананас',    cost: 1200,  time: 90,  reward: 5000,  lvl: 9,  baseW: 1.5,  color: '#f39c12' },
    pomegranate: { id: 'pomegranate', name: 'Гранат',    cost: 2000,  time: 110, reward: 9000,  lvl: 10, baseW: 0.4,  color: '#c0392b' },
    dragonfruit: { id: 'dragonfruit', name: 'Питахайя',  cost: 3500,  time: 130, reward: 16000, lvl: 11, baseW: 0.6,  color: '#e84393' },
    starfruit:   { id: 'starfruit',   name: 'Карамбола', cost: 6000,  time: 160, reward: 28000, lvl: 12, baseW: 0.2,  color: '#f1c40f' },
    fig:         { id: 'fig',         name: 'Инжир',     cost: 10000, time: 200, reward: 50000, lvl: 13, baseW: 0.1,  color: '#6c5ce7' }
};

const MUTATIONS = {
    gold:     { id: 'gold',     name: 'Золотое',    mult: 2,   color: '#f1c40f', icon: '✨', chance: 0.08,  aura: 'shine' },
    toxic:    { id: 'toxic',    name: 'Токсичное',  mult: 3,   color: '#2ecc71', icon: '☣️', chance: 0.04,  aura: 'mist' },
    electric: { id: 'electric', name: 'Грозовое',   mult: 3.5, color: '#74b9ff', icon: '⚡', chance: 0.03,  aura: 'spark' },
    stellar:  { id: 'stellar',  name: 'Звездное',   mult: 4,   color: '#feca57', icon: '🌠', chance: 0.02,  aura: 'stars' },
    rainbow:  { id: 'rainbow',  name: 'Радужное',   mult: 5,   color: '#a29bfe', icon: '🌈', chance: 0.005, aura: 'rainbow' },
    holy:     { id: 'holy',     name: 'Солнечное',  mult: 4,   color: '#f5f6fa', icon: '🔆', chance: 0.015, aura: 'halo' },
    hell:     { id: 'hell',     name: 'Огненное',   mult: 4,   color: '#e84118', icon: '🔥', chance: 0.015, aura: 'ember' },
    candy:    { id: 'candy',    name: 'Сладкое',    mult: 3,   color: '#ff9ff3', icon: '🍬', chance: 0.02,  aura: 'candy' },
    honey:    { id: 'honey',    name: 'Медовое',    mult: 3,   color: '#f9ca24', icon: '🍯', chance: 0.02,  aura: 'honey' },
    alien:    { id: 'alien',    name: 'Инопланетное', mult: 4.5, color: '#40ffd2', icon: '🛸', chance: 0.01, aura: 'alien' }
};

const EGG_RARITIES = {
    common: { id: 'common', name: 'Обычное яйцо', label: 'Обычное', icon: '🥚', color: '#d7b98e', hatchSeconds: 300, cost: 350 },
    rare: { id: 'rare', name: 'Редкое яйцо', label: 'Редкое', icon: '🥚', color: '#74b9ff', hatchSeconds: 900, cost: 1500 },
    legendary: { id: 'legendary', name: 'Легендарное яйцо', label: 'Легендарное', icon: '🥚', color: '#f1c40f', hatchSeconds: 1800, cost: 6000 },
    mystery: { id: 'mystery', name: '???', label: '???', icon: '❔', color: '#a29bfe', hatchSeconds: 0, cost: 0, locked: true }
};

const PET_DEFS = {
    dew: { id: 'dew', egg: 'common', rarity: 'common', name: 'Капелька', icon: '💧', role: 'Ускоряет рост после полива', stat: 'speedMult', value: 0.12 },
    bun: { id: 'bun', egg: 'common', rarity: 'common', name: 'Булочка', icon: '🐰', role: 'Добавляет монеты при сборе', stat: 'coinMult', value: 0.07 },
    sprig: { id: 'sprig', egg: 'common', rarity: 'common', name: 'Росточек', icon: '🌱', role: 'Увеличивает вес урожая', stat: 'weightMult', value: 0.05 },
    moonseed: { id: 'moonseed', egg: 'common', rarity: 'secret', name: 'Лунное семечко', icon: '🌙', role: 'Чуть усиливает все редкие события', stat: 'mutChance', value: 0.18, secret: true },

    glimmer: { id: 'glimmer', egg: 'rare', rarity: 'rare', name: 'Блик', icon: '✨', role: 'Повышает шанс редких мутаций', stat: 'mutChance', value: 0.28 },
    splash: { id: 'splash', egg: 'rare', rarity: 'rare', name: 'Брызг', icon: '🌊', role: 'Сильно ускоряет рост после полива', stat: 'speedMult', value: 0.22 },
    honeybee: { id: 'honeybee', egg: 'rare', rarity: 'rare', name: 'Медунчик', icon: '🐝', role: 'Прибавляет монеты за урожай', stat: 'coinMult', value: 0.14 },
    ghostleaf: { id: 'ghostleaf', egg: 'rare', rarity: 'secret', name: 'Призрачный листик', icon: '👻', role: 'Усиливает вес и мутации', stat: 'hybridRare', value: 0.16, secret: true },

    solarcub: { id: 'solarcub', egg: 'legendary', rarity: 'legendary', name: 'Солнечный зверёк', icon: '🌞', role: 'Мощно увеличивает монеты', stat: 'coinMult', value: 0.28 },
    drake: { id: 'drake', egg: 'legendary', rarity: 'legendary', name: 'Дракоша', icon: '🐲', role: 'Ускоряет рост и вес урожая', stat: 'hybridGrowth', value: 0.24 },
    starling: { id: 'starling', egg: 'legendary', rarity: 'legendary', name: 'Звездокрыл', icon: '🌟', role: 'Сильно повышает шанс мутаций', stat: 'mutChance', value: 0.46 },
    voidling: { id: 'voidling', egg: 'legendary', rarity: 'secret', name: 'Пустотик', icon: '🛸', role: 'Даёт понемногу всего', stat: 'all', value: 0.18, secret: true }
};

const PET_RARITY_STYLE = {
    common: { label: 'Обычный', color: '#d7b98e' },
    rare: { label: 'Редкий', color: '#74b9ff' },
    legendary: { label: 'Легендарный', color: '#f1c40f' },
    secret: { label: 'Секретный', color: '#a29bfe' }
};

Object.assign(EGG_RARITIES.common, { name: 'Обычное яйцо', label: 'Обычное', icon: '🥚', color: '#d8b47a', hatchSeconds: 300, cost: 50 });
Object.assign(EGG_RARITIES.rare, { name: 'Синее яйцо', label: 'Редкое', icon: '🥚', color: '#4aa3ff', hatchSeconds: 900, cost: 1500 });
Object.assign(EGG_RARITIES.legendary, { name: 'Золотое яйцо', label: 'Легендарное', icon: '🥚', color: '#ffd43b', hatchSeconds: 1800, cost: 6000 });
Object.assign(EGG_RARITIES.mystery, { name: '???', label: '???', icon: '❔', color: '#a29bfe', hatchSeconds: 0, cost: 0, locked: true });

Object.keys(PET_DEFS).forEach(id => delete PET_DEFS[id]);
Object.assign(PET_DEFS, {
    dewdrop: { id: 'dewdrop', egg: 'common', rarity: 'common', name: 'Капельный слайм', role: 'Ускоряет рост после полива', stat: 'speedMult', value: 0.12, face: 'sad', slime: { body: '#66d9ff', shade: '#1596d1', blush: '#ff9fcf', decor: 'drop' } },
    sproutslime: { id: 'sproutslime', egg: 'common', rarity: 'common', name: 'Ростковый слайм', role: 'Увеличивает вес урожая', stat: 'weightMult', value: 0.05, face: 'mischief', slime: { body: '#7ee37a', shade: '#27ae60', blush: '#ffd1dc', decor: 'leaf' } },
    coinblob: { id: 'coinblob', egg: 'common', rarity: 'common', name: 'Монетный слайм', role: 'Добавляет монеты при сборе', stat: 'coinMult', value: 0.07, face: 'coin', slime: { body: '#f6d365', shade: '#d49b17', blush: '#ffb3a7', decor: 'coin' } },
    moonmelt: { id: 'moonmelt', egg: 'common', rarity: 'secret', name: 'Лунный слайм', role: 'Чуть усиливает шанс мутаций', stat: 'mutChance', value: 0.18, secret: true, face: 'sleepy', slime: { body: '#4f4aa8', shade: '#1b1857', blush: '#908cff', decor: 'moon' } },

    sparkjelly: { id: 'sparkjelly', egg: 'rare', rarity: 'rare', name: 'Искристый слайм', role: 'Повышает шанс редких мутаций', stat: 'mutChance', value: 0.28, face: 'excited', slime: { body: '#74b9ff', shade: '#2478d4', blush: '#ffd1f4', decor: 'spark' } },
    wavegum: { id: 'wavegum', egg: 'rare', rarity: 'rare', name: 'Волновой слайм', role: 'Сильно ускоряет рост после полива', stat: 'speedMult', value: 0.22, face: 'surprise', slime: { body: '#55efc4', shade: '#00b894', blush: '#b8fff0', decor: 'wave' } },
    nectar: { id: 'nectar', egg: 'rare', rarity: 'rare', name: 'Нектарный слайм', role: 'Прибавляет монеты за урожай', stat: 'coinMult', value: 0.14, face: 'cute', slime: { body: '#ffbe76', shade: '#e58e26', blush: '#fff0a8', decor: 'honey' } },
    phantooze: { id: 'phantooze', egg: 'rare', rarity: 'secret', name: 'Призрачный слайм', role: 'Усиливает вес и мутации', stat: 'hybridRare', value: 0.16, secret: true, face: 'blank', slime: { body: '#dfe6ff', shade: '#8c9eff', blush: '#ffffff', decor: 'ghost' } },

    sunpudding: { id: 'sunpudding', egg: 'legendary', rarity: 'legendary', name: 'Солнечный слайм', role: 'Мощно увеличивает монеты', stat: 'coinMult', value: 0.28, face: 'proud', slime: { body: '#ffe66d', shade: '#f1c40f', blush: '#ffb3a7', decor: 'sun' } },
    embergoo: { id: 'embergoo', egg: 'legendary', rarity: 'legendary', name: 'Огненный слайм', role: 'Ускоряет рост и вес урожая', stat: 'hybridGrowth', value: 0.24, face: 'angry', slime: { body: '#ff7675', shade: '#d63031', blush: '#ffd0c2', decor: 'flame' } },
    stargum: { id: 'stargum', egg: 'legendary', rarity: 'legendary', name: 'Звёздный слайм', role: 'Сильно повышает шанс мутаций', stat: 'mutChance', value: 0.46, face: 'star', slime: { body: '#a29bfe', shade: '#6c5ce7', blush: '#f8dfff', decor: 'star' } },
    voidpuddle: { id: 'voidpuddle', egg: 'legendary', rarity: 'secret', name: 'Космический слайм', role: 'Даёт понемногу всего', stat: 'all', value: 0.18, secret: true, face: 'mystic', slime: { body: '#2d2a72', shade: '#0d0b2d', blush: '#40ffd2', decor: 'ufo' } }
});

Object.assign(PET_DEFS.dewdrop, { shortName: 'КАПЛЯ' });
Object.assign(PET_DEFS.sproutslime, { shortName: 'РОСТОК' });
Object.assign(PET_DEFS.coinblob, { shortName: 'МОНЕТКА' });
Object.assign(PET_DEFS.moonmelt, { shortName: 'ЛУНА' });
Object.assign(PET_DEFS.sparkjelly, { shortName: 'ИСКРА' });
Object.assign(PET_DEFS.wavegum, { shortName: 'ВОЛНА' });
Object.assign(PET_DEFS.nectar, { shortName: 'НЕКТАР' });
Object.assign(PET_DEFS.phantooze, { shortName: 'ПРИЗРАК' });
Object.assign(PET_DEFS.sunpudding, { shortName: 'СОЛНЦЕ' });
Object.assign(PET_DEFS.embergoo, { shortName: 'ОГОНЕК' });
Object.assign(PET_DEFS.stargum, { shortName: 'ЗВЕЗДА' });
Object.assign(PET_DEFS.voidpuddle, { shortName: 'КОСМОС' });

Object.assign(PET_RARITY_STYLE.common, { label: 'Обычный', color: '#22a95a', stars: 1 });
Object.assign(PET_RARITY_STYLE.rare, { label: 'Редкий', color: '#4aa3ff', stars: 2 });
Object.assign(PET_RARITY_STYLE.legendary, { label: 'Легендарный', color: '#e94b4b', stars: 3 });
Object.assign(PET_RARITY_STYLE.secret, { label: 'Секретный', color: '#8f4cff', stars: 4 });

const HELPERS = Object.values(PET_DEFS);
const PETS = HELPERS;

const QUEST_TEMPLATES = [
    { id: 'grow_carrot', desc: 'Вырасти 5 морковок', target: 5, reward: 50 },
    { id: 'earn_coins', desc: 'Заработай 200 монет', target: 200, reward: 100 },
    { id: 'find_mut', desc: 'Найди 1 мутацию', target: 1, reward: 150 },
    { id: 'water_plants', desc: 'Полей грядки 10 раз', target: 10, reward: 40 },
    { id: 'clear_weeds', desc: 'Прогони 3 паразитов', target: 3, reward: 60 }
];

const DECOR_STYLES = {
    default: { id: 'default', name: 'Стандарт', cost: 0, icon: '🌱', desc: 'Классическая грядка' },
    neon: { id: 'neon', name: 'Неон', cost: 2500, icon: '💡', desc: 'Яркие бортики' },
    farmer: { id: 'farmer', name: 'Фермерский', cost: 4500, icon: '🌳', desc: 'Забор, дерево и пугало' },
    candy: { id: 'candy', name: 'Пряник', cost: 7000, icon: '🍬', desc: 'Сладкий розовый стиль' }
};

Object.assign(DECOR_STYLES, {
    default: { id: 'default', name: 'Стандарт', cost: 0, icon: '🌱', desc: 'Классическая грядка' },
    neon: { id: 'neon', name: 'Неон', cost: 2500, icon: '💡', desc: 'Яркие бортики' },
    farmer: { id: 'farmer', name: 'Фермерский', cost: 4500, icon: '🌾', desc: 'Забор и травка' },
    candy: { id: 'candy', name: 'Пряник', cost: 7000, icon: '🍬', desc: 'Сладкая посыпка' },
    vip: { id: 'vip', name: 'VIP', cost: 12000, icon: '👑', desc: 'Золотая вывеска' },
    pixel: { id: 'pixel', name: 'Пиксель', cost: 9000, icon: '▣', desc: 'Ретро-клеточки' },
    block: { id: 'block', name: 'Блочный', cost: 10000, icon: '🧱', desc: 'Кубический стиль' },
    desert: { id: 'desert', name: 'Пустыня', cost: 9500, icon: '🌵', desc: 'Песок и кактусы' },
    popit: { id: 'popit', name: 'Поп ит', cost: 11000, icon: '🟣', desc: 'Пупырчатая грядка' },
    pink: { id: 'pink', name: 'Розовый', cost: 8500, icon: '🌸', desc: 'Пастель и темные бортики' },
    backrooms: { id: 'backrooms', name: 'Бэкрумс', cost: 9500, icon: '▦', desc: 'Желтые стены и старый ковролин' },
    paints: { id: 'paints', name: 'Краски', cost: 10500, icon: '▰', desc: 'Палитра акварели' },
    glass: { id: 'glass', name: 'Стекло', cost: 12000, icon: '◇', desc: 'Простое прозрачное стекло' },
    toyblocks: { id: 'toyblocks', name: 'Конструктор', cost: 10000, icon: '▣', desc: 'Яркие игрушечные блоки' },
    beach: { id: 'beach', name: 'Пляж', cost: 11000, icon: '≈', desc: 'Песок, море и прилив' },
    rich: { id: 'rich', name: 'Богатый', cost: 18000, icon: '💎', desc: 'Золото и бриллианты' }
});

delete DECOR_STYLES.desert;
delete DECOR_STYLES.rich;
delete DECOR_STYLES.honey;
delete DECOR_STYLES.castle;
delete DECOR_STYLES.marble;
delete DECOR_STYLES.italian;
delete DECOR_STYLES.royal;
delete DECOR_STYLES.glitch;
delete DECOR_STYLES.stream;
delete DECOR_STYLES.meme;
delete DECOR_STYLES.squish;
delete DECOR_STYLES.slime;

const BALANCE = {
    xpRewardRate: 0.32,
    weedChance: 0.016,
    autoEventChance: 0.042,
    magicSeedCost: 350,
    magicSeedSeconds: 38,
    helperMaxLevel: 3,
    helperCostStep: 90,
    offlineBankCapSeconds: 14400,
    offlineCoinIntervalSeconds: 12
};
