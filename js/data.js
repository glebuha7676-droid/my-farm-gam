const PLANTS = {
    carrot:      { id: 'carrot',      name: 'Морковь',   cost: 10,    time: 10,  reward: 35,     lvl: 1,  baseW: 0.2,  color: '#e67e22' },
    cucumber:    { id: 'cucumber',    name: 'Огурец',    cost: 15,    time: 15,  reward: 60,     lvl: 1,  baseW: 0.3,  color: '#2ecc71' },
    tomato:      { id: 'tomato',      name: 'Томат',     cost: 25,    time: 20,  reward: 100,    lvl: 2,  baseW: 0.25, color: '#e74c3c' },
    pepper:      { id: 'pepper',      name: 'Перец',     cost: 40,    time: 25,  reward: 160,    lvl: 2,  baseW: 0.15, color: '#c0392b' },
    strawberry:  { id: 'strawberry',  name: 'Клубника',  cost: 60,    time: 30,  reward: 240,    lvl: 3,  baseW: 0.05, color: '#ff4757' },
    eggplant:    { id: 'eggplant',    name: 'Баклажан',  cost: 90,    time: 38,  reward: 380,    lvl: 4,  baseW: 0.4,  color: '#9b59b6' },
    pumpkin:     { id: 'pumpkin',     name: 'Тыква',     cost: 150,   time: 45,  reward: 650,    lvl: 5,  baseW: 5.0,  color: '#d35400' },
    corn:        { id: 'corn',        name: 'Кукуруза',  cost: 250,   time: 55,  reward: 1100,   lvl: 5,  baseW: 0.3,  color: '#f1c40f' },
    mushroom:    { id: 'mushroom',    name: 'Гриб',      cost: 350,   time: 60,  reward: 1600,   lvl: 6,  baseW: 0.1,  color: '#bdc3c7' },
    watermelon:  { id: 'watermelon',  name: 'Арбуз',     cost: 500,   time: 70,  reward: 2500,   lvl: 7,  baseW: 6.0,  color: '#27ae60' },
    melon:       { id: 'melon',       name: 'Дыня',      cost: 750,   time: 85,  reward: 4000,   lvl: 8,  baseW: 3.5,  color: '#f6e58d' },
    pineapple:   { id: 'pineapple',   name: 'Ананас',    cost: 1200,  time: 100, reward: 8000,   lvl: 9,  baseW: 1.5,  color: '#f39c12' },
    pomegranate: { id: 'pomegranate', name: 'Гранат',    cost: 2000,  time: 120, reward: 16000,  lvl: 10, baseW: 0.4,  color: '#c0392b' },
    dragonfruit: { id: 'dragonfruit', name: 'Питахайя',  cost: 3500,  time: 150, reward: 35000,  lvl: 12, baseW: 0.6,  color: '#e84393' },
    starfruit:   { id: 'starfruit',   name: 'Карамбола', cost: 6000,  time: 180, reward: 80000,  lvl: 14, baseW: 0.2,  color: '#f1c40f' },
    fig:         { id: 'fig',         name: 'Инжир',     cost: 10000, time: 220, reward: 200000, lvl: 17, baseW: 0.1,  color: '#6c5ce7' }
};

const MUTATIONS = {
    gold:     { id: 'gold',     name: 'Золотое',      mult: 2,   color: '#f1c40f', icon: '✨', chance: 0.06,  aura: 'shine' },
    toxic:    { id: 'toxic',    name: 'Токсичное',    mult: 3,   color: '#2ecc71', icon: '☣️', chance: 0.03,  aura: 'mist' },
    electric: { id: 'electric', name: 'Грозовое',     mult: 4,   color: '#74b9ff', icon: '⚡', chance: 0.025, aura: 'spark' },
    stellar:  { id: 'stellar',  name: 'Звездное',     mult: 4,   color: '#feca57', icon: '⭐', chance: 0.018, aura: 'stars' },
    rainbow:  { id: 'rainbow',  name: 'Радужное',     mult: 6,   color: '#a29bfe', icon: '🌈', chance: 0.003, aura: 'rainbow' },
    holy:     { id: 'holy',     name: 'Солнечное',    mult: 4.5, color: '#f5f6fa', icon: '🔆', chance: 0.012, aura: 'halo' },
    hell:     { id: 'hell',     name: 'Огненное',     mult: 4.5, color: '#e84118', icon: '🔥', chance: 0.012, aura: 'ember' },
    candy:    { id: 'candy',    name: 'Сладкое',      mult: 3.5, color: '#ff9ff3', icon: '🍬', chance: 0.015, aura: 'candy' },
    honey:    { id: 'honey',    name: 'Медовое',      mult: 3,   color: '#f9ca24', icon: '🍯', chance: 0.02,  aura: 'honey' },
    alien:    { id: 'alien',    name: 'Инопланетное', mult: 5,   color: '#40ffd2', icon: '🛸', chance: 0.008, aura: 'alien' },
    diamond:  { id: 'diamond',  name: 'Бриллиантовый', mult: 7,   color: '#bff8ff', icon: '💎', chance: 0,     aura: 'diamond' },
    eclipse:  { id: 'eclipse',  name: 'Затмение',      mult: 7.5, color: '#b3172f', icon: '🌘',  chance: 0,     aura: 'eclipse' },
    lava:     { id: 'lava',     name: 'Магма',         mult: 7.5, color: '#d94b24', icon: '🌋', chance: 0,     aura: 'lava' },
    meteor:   { id: 'meteor',   name: 'Комета',        mult: 7.5, color: '#b9a7ff', icon: '🌠', chance: 0,     aura: 'meteor' },
    lunar:    { id: 'lunar',    name: 'Лунное',        mult: 5.5, color: '#aebfff', icon: '☾',  chance: 0,     aura: 'lunar' },
    void:     { id: 'void',     name: 'Пустота',       mult: 9,   color: '#7b4dff', icon: '●',  chance: 0,     aura: 'void' },
    phantom:  { id: 'phantom',  name: 'Призрачное',    mult: 1,   color: '#cfd6df', icon: '◌',  chance: 0,     aura: 'phantom' }
};

const EGG_RARITIES = {
    common:    { id: 'common',    name: 'Обычное яйцо',  label: 'Обычное',     icon: '🥚', color: '#d8b47a', hatchSeconds: 180,  cost: 50 },
    rare:      { id: 'rare',      name: 'Синее яйцо',    label: 'Редкое',      icon: '🥚', color: '#4aa3ff', hatchSeconds: 600,  cost: 1500 },
    legendary: { id: 'legendary', name: 'Золотое яйцо',  label: 'Легендарное', icon: '🥚', color: '#ffd43b', hatchSeconds: 1200, cost: 6000 },
    mystery:   { id: 'mystery',   name: '???',           label: '???',         icon: '❔', color: '#a29bfe', hatchSeconds: 0,    cost: 0, locked: true }
};

const PET_DEFS = {
    dewdrop:     { id: 'dewdrop',     egg: 'common',    rarity: 'common',    name: 'Капельный слайм',   shortName: 'КАПЛЯ',   role: 'Ускоряет рост после полива',        stat: 'speedMult',    value: 0.10, face: 'sad',      slime: { body: '#66d9ff', shade: '#1596d1', blush: '#ff9fcf', decor: 'drop' } },
    sproutslime: { id: 'sproutslime', egg: 'common',    rarity: 'common',    name: 'Ростковый слайм',   shortName: 'РОСТОК',  role: 'Увеличивает вес урожая',            stat: 'weightMult',   value: 0.08, face: 'mischief', slime: { body: '#7ee37a', shade: '#27ae60', blush: '#ffd1dc', decor: 'leaf' } },
    coinblob:    { id: 'coinblob',    egg: 'common',    rarity: 'common',    name: 'Монетный слайм',    shortName: 'МОНЕТКА', role: 'Добавляет монеты при сборе',        stat: 'coinMult',     value: 0.08, face: 'happy',    slime: { body: '#f6d365', shade: '#d49b17', blush: '#ffb3a7', decor: 'coin' } },
    moonmelt:    { id: 'moonmelt',    egg: 'common',    rarity: 'secret',    name: 'Лунный слайм',      shortName: 'ЛУНА',    role: 'Чуть усиливает шанс мутаций',       stat: 'mutChance',    value: 0.15, face: 'sleepy',   slime: { body: '#4f4aa8', shade: '#1b1857', blush: '#908cff', decor: 'moon' }, secret: true },

    sparkjelly:  { id: 'sparkjelly',  egg: 'rare',      rarity: 'rare',      name: 'Искристый слайм',   shortName: 'ИСКРА',   role: 'Повышает шанс редких мутаций',      stat: 'mutChance',    value: 0.22, face: 'excited',  slime: { body: '#74b9ff', shade: '#2478d4', blush: '#ffd1f4', decor: 'spark' } },
    wavegum:     { id: 'wavegum',     egg: 'rare',      rarity: 'rare',      name: 'Волновой слайм',    shortName: 'ВОЛНА',   role: 'Сильно ускоряет рост после полива', stat: 'speedMult',    value: 0.20, face: 'surprise', slime: { body: '#55efc4', shade: '#00b894', blush: '#b8fff0', decor: 'wave' } },
    nectar:      { id: 'nectar',      egg: 'rare',      rarity: 'rare',      name: 'Нектарный слайм',   shortName: 'НЕКТАР',  role: 'Прибавляет монеты за урожай',       stat: 'coinMult',     value: 0.15, face: 'cute',     slime: { body: '#ffbe76', shade: '#e58e26', blush: '#fff0a8', decor: 'honey' } },
    phantooze:   { id: 'phantooze',   egg: 'rare',      rarity: 'secret',    name: 'Призрачный слайм',  shortName: 'ПРИЗРАК', role: 'Усиливает вес и мутации',           stat: 'hybridRare',   value: 0.14, face: 'blank',    slime: { body: '#dfe6ff', shade: '#8c9eff', blush: '#ffffff', decor: 'ghost' }, secret: true },

    sunpudding:  { id: 'sunpudding',  egg: 'legendary', rarity: 'legendary', name: 'Солнечный слайм',   shortName: 'СОЛНЦЕ',  role: 'Мощно увеличивает монеты',          stat: 'coinMult',     value: 0.25, face: 'proud',    slime: { body: '#ffe66d', shade: '#f1c40f', blush: '#ffb3a7', decor: 'sun' } },
    embergoo:    { id: 'embergoo',    egg: 'legendary', rarity: 'legendary', name: 'Огненный слайм',    shortName: 'ОГОНЕК',  role: 'Ускоряет рост и вес урожая',        stat: 'hybridGrowth', value: 0.20, face: 'angry',    slime: { body: '#ff7675', shade: '#d63031', blush: '#ffd0c2', decor: 'flame' } },
    stargum:     { id: 'stargum',     egg: 'legendary', rarity: 'legendary', name: 'Звездный слайм',    shortName: 'ЗВЕЗДА',  role: 'Сильно повышает шанс мутаций',      stat: 'mutChance',    value: 0.35, face: 'happy',    slime: { body: '#a29bfe', shade: '#6c5ce7', blush: '#f8dfff', decor: 'star' } },
    voidpuddle:  { id: 'voidpuddle',  egg: 'legendary', rarity: 'secret',    name: 'Космический слайм', shortName: 'КОСМОС',  role: 'Дает понемногу всего',              stat: 'all',          value: 0.14, face: 'mystic',   slime: { body: '#2d2a72', shade: '#0d0b2d', blush: '#40ffd2', decor: 'ufo' }, secret: true }
};

const PET_RARITY_STYLE = {
    common:    { label: 'Обычный',     color: '#22a95a', stars: 1 },
    rare:      { label: 'Редкий',      color: '#4aa3ff', stars: 2 },
    legendary: { label: 'Легендарный', color: '#e94b4b', stars: 3 },
    secret:    { label: 'Секретный',   color: '#8f4cff', stars: 4 }
};

const HELPERS = Object.values(PET_DEFS);
const PETS = HELPERS;

const QUEST_TEMPLATES = [
    { id: 'grow_carrot',  desc: 'Вырасти 5 морковок',         target: 5,    reward: 50 },
    { id: 'earn_coins',   desc: 'Заработай 500 монет',        target: 500,  reward: 150 },
    { id: 'find_mut',     desc: 'Найди мутацию',              target: 1,    reward: 200 },
    { id: 'water_plants', desc: 'Полей грядки 10 раз',        target: 10,   reward: 40 },
    { id: 'clear_weeds',  desc: 'Прогони 3 паразитов',        target: 3,    reward: 60 },
    { id: 'harvest_any',  desc: 'Собери 10 урожаев',          target: 10,   reward: 100 },
    { id: 'find_gold',    desc: 'Поймай золотую мутацию',     target: 1,    reward: 250 },
    { id: 'earn_big',     desc: 'Заработай 2000 монет',       target: 2000, reward: 400 },
    { id: 'harvest_rare', desc: 'Собери арбуз или лучше',     target: 1,    reward: 500 }
];

const DECOR_STYLES = {
    default:   { id: 'default',   name: 'Стандарт',    cost: 0,     lvl: 1,  icon: '🌱', desc: 'Классическая грядка' },
    neon:      { id: 'neon',      name: 'Неон',        cost: 2500,  lvl: 3,  icon: '💡', desc: 'Яркие бортики' },
    farmer:    { id: 'farmer',    name: 'Фермерский',  cost: 4500,  lvl: 4,  icon: '🌾', desc: 'Забор и травка' },
    pink:      { id: 'pink',      name: 'Розовый',     cost: 5000,  lvl: 4,  icon: '🌸', desc: 'Пастель и темные бортики' },
    candy:     { id: 'candy',     name: 'Пряник',      cost: 7000,  lvl: 5,  icon: '🍬', desc: 'Сладкая посыпка' },
    pixel:     { id: 'pixel',     name: 'Пиксель',     cost: 9000,  lvl: 7,  icon: '▣',  desc: 'Ретро-клеточки' },
    popit:     { id: 'popit',     name: 'Поп ит',      cost: 11000, lvl: 8,  icon: '🟣', desc: 'Пупырчатая грядка' },
    paints:    { id: 'paints',    name: 'Краски',      cost: 10500, lvl: 9,  icon: '▰',  desc: 'Палитра акварели' },
    beach:     { id: 'beach',     name: 'Пляж',        cost: 11000, lvl: 10, icon: '≈',  desc: 'Песок, море и прилив' },
    vip:       { id: 'vip',       name: 'VIP',         cost: 12000, lvl: 10, icon: '👑', desc: 'Золотая вывеска' },
    glass:     { id: 'glass',     name: 'Стекло',      cost: 12000, lvl: 12, icon: '◇',  desc: 'Простое прозрачное стекло' },
    backrooms: { id: 'backrooms', name: 'Бэкрумс',     cost: 9500,  lvl: 13, icon: '▦',  desc: 'Желтые стены и старый ковролин' },
    block:     { id: 'block',     name: 'Блочный',     cost: 10000, lvl: 17, icon: '🧱', desc: 'Кубический стиль' }
};

const ROOM_DECOR_STYLES = {
    cozy:      { id: 'cozy',      name: 'Уют',      cost: 3200,  lvl: 1,  icon: '●', desc: 'Теплая базовая комната с деревом и мягким текстилем' },
    mint:      { id: 'mint',      name: 'Мята',     cost: 6800,  lvl: 3,  icon: '◐', desc: 'Светлый свежий интерьер с аккуратными стеклянными акцентами' },
    sunset:    { id: 'sunset',    name: 'Закат',    cost: 11000, lvl: 5,  icon: '◒', desc: 'Теплые стены, янтарная лампа и уютные полки' },
    ocean:     { id: 'ocean',     name: 'Лагуна',   cost: 14500, lvl: 7,  icon: '◌', desc: 'Холодный морской интерьер с глубиной и контрастом' },
    candyroom: { id: 'candyroom', name: 'Сладкая',  cost: 18500, lvl: 9,  icon: '◎', desc: 'Яркая карамельная комната с декоративными мелочами' },
    starlight: { id: 'starlight', name: 'Звездная', cost: 24000, lvl: 12, icon: '✦', desc: 'Дорогая ночная комната с насыщенными тенями и золотым светом' },
    gamer:     { id: 'gamer',     name: 'Геймерская', cost: 32000, lvl: 15, icon: '▦', desc: 'Пиксельная комната с дубовыми стенами, верстаком и печью' },
    backroom:  { id: 'backroom',  name: 'Бэкрумс',    cost: 45000, lvl: 18, icon: '▥', desc: 'Лиминальная желтая комната с гулким светом и бесконечным проходом' }
};

const BALANCE = {
    xpRewardRate:               0.18,
    xpNeedStart:                80,
    xpNeedMult:                 1.6,
    startCoins:                 150,
    weedChance:                 0.012,
    weedBaseReward:             75,
    weedRewardGrowth:           0.35,
    autoEventChance:            0.055,
    autoEventCheckEvery:        8,
    eventDuration:              20,
    magicSeedCost:              350,
    magicSeedSeconds:           38,
    helperMaxLevel:             3,
    helperCostStep:             90,
    offlineBankCapSeconds:      14400,
    offlineCoinIntervalSeconds: 12,
    petInventoryMax:            12,
    petSlot2Cost:               2000,
    petSlot3Cost:               8000
};

const PLOT_UNLOCK_LEVELS = {
    2: 3,
    5: 5,
    6: 8,
    7: 10,
    8: 15,
    9: 20,
    10: 25,
    11: 30
};

const PLOT_PURCHASE_COSTS = {
    2: 300,
    5: 900,
    6: 1600,
    7: 2600,
    8: 4200,
    9: 7000,
    10: 11000,
    11: 16000
};
