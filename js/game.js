let player = {
        coins: BALANCE.startCoins || 50, lvl: 1, xp: 0, xpNeed: BALANCE.xpNeedStart || 100,
        rares: {}, unlockedMutations: [],
        pets: [], petLevels: {}, petInventory: [], equippedPets: [null, null, null], unlockedPetSlots: 1,
        incubator: [null, null, null], quests: [], lastSaved: Date.now(), bank: 0,
        plotStyle: 'default', ownedDecor: ['default'], decorPaintColor: '#ff7675',
        seedInventory: { carrot: 8, cucumber: 6, tomato: 4, pepper: 3 },
        shop: { stock: {}, refreshAt: 0, merchantStock: {}, merchantArrivesAt: 0, merchantLeavesAt: 0 },
        showcase: [null, null, null],
        companion: { name: 'Лайм', level: 1, xp: 0, hunger: 82, clean: 88, energy: 92, sleeping: false, skin: 'basic', lastUpdate: Date.now() },
        stats: { totalEarned: 0, maxWeight: 0, bestSale: 0, harvested: 0 },
        rewards: {
            dailyClaimed: 0,
            dailyLastClaimAt: 0,
            coinBoostUntil: 0,
            xpBoostUntil: 0,
            timedCycleStartedAt: Date.now(),
            timedCooldownUntil: 0,
            timedClaimed: [false, false, false, false]
        },
        tutorial: {
            done: false,
            step: 'welcome_seed',
            force: true,
            targetTiles: [0, 1],
            plantedCount: 0,
            harvestedCount: 0,
            weedSpawned: false,
            weedCleared: false,
            finalQueued: false,
            selectedSeed: '',
            weedTile: 1,
            readyTile: 0
        }
    };

    let env = { ticks: 0, currentEvent: 'day', eventTimer: 0, nextEventTimer: 75, potTimer: 0, potActive: false, activeNest: 0, activeEquip: 0, petPatCooldowns: {}, companionDrawer: '', companionShower: false, companionShowerTimer: null, companionPointerDown: false, companionPointer: null, companionPointerId: null, companionPointerStartedInZone: false, companionPointerStartX: 0, companionPointerStartY: 0, companionPointerLastX: 0, companionPointerLastY: 0, companionPointerStartedAt: 0, companionPetting: false, companionHoldTimer: null, companionTapTimer: null, companionHeartTimer: null, companionHeartLastSoundAt: 0, companionSpecial: '', companionSpecialTimer: null, companionSpecialEndTimer: null, companionSpecialAnchorX: 0, companionSpecialAnchorY: 0, companionCoinBurstAt: 0, openMenuSections: { showcase: false, diary: false, decor: false, rewards: false, admin: false }, backroomsLampTimer: null, backroomsLampEndTimer: null, shopTab: 'seeds' };
    let eventActions = []; 
    let tiles = Array(12).fill().map((_, i) => ({ id: i, active: false, plantId: null, growth: 0, water: 0, hasWeed: false, mutations: [], scale: 1, weight: 5, weightMult: 1, sizeTier: 'normal', beeLock: 0 }));
    let currentTool = 'water';
    const TEST_HATCH_INSTANT = false;
    const BIG_CROP_CHANCE = 0.08;
    const HUGE_CROP_CHANCE = 0.01;
    const WATER_DURATION = 15;
    
    const seedKeys = Object.keys(PLANTS);
    const BASE_STORE_SEEDS = ['carrot', 'cucumber', 'tomato', 'pepper'];
    const DECOR_PAINT_COLORS = ['#ff7675', '#fdcb6e', '#55efc4', '#74b9ff', '#a29bfe', '#2ecc71'];
    const SIZE_DIARY_ENTRIES = {
        big: { id: 'big', name: 'Большой', icon: 'B', mult: 'x1.5+' },
        huge: { id: 'huge', name: 'Огромный', icon: '!', mult: 'x3.5+' }
    };
    const TUTORIAL_TARGET_TILES = [0, 1];
    const DAILY_REWARD_INTERVAL = 24 * 60 * 60 * 1000;
    const TIMED_REWARD_STEP = 10 * 60 * 1000;
    const TIMED_REWARD_COOLDOWN = 5 * 60 * 60 * 1000;
    const TEST_UNLOCK_ALL_REWARDS = false;
    const DAILY_REWARDS = [
        { title: 'Монетки', icon: '$', accent: '#f2b632', rarity: 'common', claim: () => buildCoinsRewardPop(grantCoinsReward(900 + player.lvl * 150), { title: 'Монетки', accent: '#f2b632', glow: 'default' }) },
        { title: 'Монеты x2', icon: 'x2', accent: '#47a9e8', rarity: 'uncommon', claim: () => buildCoinBoostRewardPop(activateCoinBoost(30 * 60 * 1000), { accent: '#47a9e8' }) },
        { title: 'Лега яйцо', icon: '🥚', accent: '#e99b24', rarity: 'legendary', claim: () => buildEggRewardPop(grantEggReward('legendary'), { accent: '#e99b24' }) },
        { title: 'Секретное семечко', icon: '?', accent: '#7a64d8', rarity: 'secret', claim: () => buildSeedRewardPop(grantSeedReward('fig', 1), { title: 'Секретное семечко', accent: '#7a64d8', glow: 'secret' }) },
        { title: 'Секретный декор', icon: '?', accent: '#e66e4f', rarity: 'secret', claim: () => buildDecorRewardPop(grantDecorReward('vip'), { accent: '#e66e4f' }) },
        { title: 'Крупная награда', icon: '$$$', accent: '#35a96b', rarity: 'epic', claim: () => buildCoinsRewardPop(grantCoinsReward(2200 + player.lvl * 260), { title: 'Крупная награда', accent: '#f1c40f', glow: 'gold' }) },
        { title: 'Ультра редкий слайм', icon: '?', accent: '#9a45e5', ultra: true, rarity: 'ultra', claim: () => buildSecretSlimeRewardPop(grantSecretSlimeReward(), { accent: '#9a45e5' }) }
    ];
    const TIMED_REWARDS = [
        { title: 'Подарок 1', icon: '🎁', accent: '#f6c453', claim: () => buildTimedBundleRewardPop({ coins: grantCoinsReward(140 + player.lvl * 45), xp: grantXpReward(10 + player.lvl * 4) }, { title: 'Подарок открыт', accent: '#f6c453', glow: 'default' }) },
        { title: 'Подарок 2', icon: '🎁', accent: '#ff9f8f', claim: () => buildTimedBundleRewardPop({ coins: grantCoinsReward(170 + player.lvl * 55), xp: grantXpReward(14 + player.lvl * 5) }, { title: 'Подарок открыт', accent: '#ff9f8f', glow: 'default' }) },
        { title: 'Подарок 3', icon: '🎁', accent: '#74b9ff', claim: () => buildTimedBundleRewardPop({ coins: grantCoinsReward(220 + player.lvl * 65), xp: grantXpReward(18 + player.lvl * 6) }, { title: 'Подарок открыт', accent: '#74b9ff', glow: 'boost' }) },
        { title: 'Подарок 4', icon: '🎁', accent: '#a29bfe', rare: true, claim: () => buildTimedRareSeedPop(grantTimedRareSeedReward(), { accent: '#a29bfe' }) }
    ];

    function getHelperCost() {
        const ownedCount = player.petInventory ? player.petInventory.length : player.pets.length;
        return BALANCE.magicSeedCost + ownedCount * BALANCE.helperCostStep;
    }

    function defaultSeedInventory() {
        return { carrot: 8, cucumber: 6, tomato: 4, pepper: 3 };
    }

    function defaultShopState() {
        return { stock: {}, refreshAt: 0, merchantStock: {}, merchantArrivesAt: 0, merchantLeavesAt: 0 };
    }

    function defaultRewardsState() {
        return {
            dailyClaimed: 0,
            dailyLastClaimAt: 0,
            dailyTestClaimed: Array(DAILY_REWARDS.length).fill(false),
            coinBoostUntil: 0,
            xpBoostUntil: 0,
            timedCycleStartedAt: Date.now(),
            timedCooldownUntil: 0,
            timedClaimed: [false, false, false, false]
        };
    }

    function ensureTutorialState() {
        if (!player.tutorial || typeof player.tutorial !== 'object') {
            player.tutorial = {};
        }
        const legacyStepMap = {
            seed_select: 'welcome_seed',
            plant_tile: 'plant_two',
            water_tool: 'grow_watch',
            water_tile: 'grow_watch',
            wait_growth: 'grow_watch',
            harvest_tool: 'harvest_ready',
            harvest_tile: 'harvest_ready',
            shovel_tool: 'menu_open'
        };
        if (legacyStepMap[player.tutorial.step]) player.tutorial.step = legacyStepMap[player.tutorial.step];
        if (!player.tutorial.step) player.tutorial.step = 'welcome_seed';
        if (typeof player.tutorial.done !== 'boolean') player.tutorial.done = false;
        if (typeof player.tutorial.force !== 'boolean') player.tutorial.force = false;
        if (!Array.isArray(player.tutorial.targetTiles)) player.tutorial.targetTiles = [...TUTORIAL_TARGET_TILES];
        if (typeof player.tutorial.plantedCount !== 'number') player.tutorial.plantedCount = 0;
        if (typeof player.tutorial.harvestedCount !== 'number') player.tutorial.harvestedCount = 0;
        if (typeof player.tutorial.weedSpawned !== 'boolean') player.tutorial.weedSpawned = false;
        if (typeof player.tutorial.weedCleared !== 'boolean') player.tutorial.weedCleared = false;
        if (typeof player.tutorial.finalQueued !== 'boolean') player.tutorial.finalQueued = false;
        if (typeof player.tutorial.selectedSeed !== 'string') player.tutorial.selectedSeed = '';
        if (typeof player.tutorial.weedTile !== 'number') player.tutorial.weedTile = TUTORIAL_TARGET_TILES[1];
        if (typeof player.tutorial.readyTile !== 'number') player.tutorial.readyTile = TUTORIAL_TARGET_TILES[0];
        if (player.stats && player.stats.harvested > 0 && player.tutorial.done !== true && !player.tutorial.force) {
            player.tutorial.done = true;
        }
    }

    function ensureSeedAndShopState() {
        if (!player.seedInventory || typeof player.seedInventory !== 'object') {
            player.seedInventory = defaultSeedInventory();
        }
        seedKeys.forEach(id => {
            player.seedInventory[id] = Math.max(0, Math.floor(Number(player.seedInventory[id]) || 0));
        });
        if (!player.shop || typeof player.shop !== 'object') {
            player.shop = defaultShopState();
        }
        if (!player.shop.stock || typeof player.shop.stock !== 'object') player.shop.stock = {};
        if (!player.shop.merchantStock || typeof player.shop.merchantStock !== 'object') player.shop.merchantStock = {};
        player.shop.refreshAt = Number(player.shop.refreshAt) || 0;
        player.shop.merchantArrivesAt = Number(player.shop.merchantArrivesAt) || 0;
        player.shop.merchantLeavesAt = Number(player.shop.merchantLeavesAt) || 0;
    }

    function tutorialIsActive() {
        ensureTutorialState();
        return !player.tutorial.done;
    }

    function tutorialStep() {
        ensureTutorialState();
        return player.tutorial.step;
    }

    function tutorialNudge() {
        refreshTutorial();
        sfx.play('error');
    }

    function setTutorialStep(step) {
        ensureTutorialState();
        player.tutorial.step = step;
        refreshTutorial();
    }

    function finishTutorial() {
        ensureTutorialState();
        player.tutorial.done = true;
        player.tutorial.force = false;
        player.tutorial.step = 'done';
        player.tutorial.finalQueued = false;
        refreshTutorial();
        showToast('Обучение завершено!', '#f1c40f');
    }

    function tutorialAdvance() {
        if (!tutorialIsActive()) return;
        const step = tutorialStep();
        if (step === 'menu_intro') {
            setTutorialStep('final');
            return;
        }
        if (step === 'final') {
            finishTutorial();
        }
    }

    function getTutorialCardCopy() {
        const step = tutorialStep();
        if (step === 'welcome_seed') {
            return {
                title: 'Добро пожаловать на вашу ферму!',
                text: 'Выбери семена моркови.',
                progress: 'Шаг 1'
            };
        }
        if (step === 'plant_two') {
            return {
                title: 'Посади семена',
                text: `Посади морковь на две грядки. ${player.tutorial.plantedCount || 0} из 2`,
                progress: 'Шаг 2'
            };
        }
        if (step === 'grow_watch') {
            return {
                title: 'Отлично!',
                text: 'Теперь смотри, как морковь растет.',
                progress: 'Шаг 3'
            };
        }
        if (step === 'weed_alert') {
            return {
                title: 'О нет, это паразит!',
                text: 'Кликни на него, иначе растение не вырастет.',
                progress: 'Шаг 4'
            };
        }
        if (step === 'harvest_ready') {
            return {
                title: 'Золотая морковка!',
                text: currentTool === 'harvest'
                    ? `Осталось ${player.tutorial.harvestedCount || 0} из 2. Собери обе морковки.`
                    : 'Тебе попалась мутация, скорее собери свой урожай.',
                progress: 'Шаг 5'
            };
        }
        if (step === 'menu_open') {
            return {
                title: 'Теперь расскажу про меню',
                text: 'Нажми на кнопку меню.',
                progress: 'Шаг 6'
            };
        }
        if (step === 'menu_intro') {
            return {
                title: 'Вот что есть в меню',
                text: 'Тут ты можешь поставить свои растения на витрину, изменить внешний вид грядок и открыть очень милых слаймов!',
                progress: 'Шаг 6'
            };
        }
        if (step === 'final') {
            return {
                title: 'Ты молодец!',
                text: 'Теперь возвращайся и посади еще несколько морковок. Удачи!',
                progress: ''
            };
        }
        return {
            title: 'Добро пожаловать на вашу ферму!',
            text: 'Выбери семена моркови.',
            progress: 'Шаг 1'
        };
    }

    function getTutorialTargets() {
        const step = tutorialStep();
        if (step === 'welcome_seed') {
            const carrotSeed = document.querySelector('.seed-packet[data-seed="carrot"]');
            return carrotSeed ? [carrotSeed] : [];
        }
        if (step === 'plant_two') {
            return player.tutorial.targetTiles.map(idx => document.getElementById(`tile-${idx}`)).filter(Boolean);
        }
        if (step === 'weed_alert') {
            const weedTile = document.getElementById(`tile-${player.tutorial.weedTile}`);
            return weedTile ? [weedTile] : [];
        }
        if (step === 'harvest_ready') {
            if (currentTool !== 'harvest') {
                const harvestBtn = document.querySelector('.action-btn[data-tool="harvest"]');
                return harvestBtn ? [harvestBtn] : [];
            }
            return player.tutorial.targetTiles
                .map(idx => document.getElementById(`tile-${idx}`))
                .filter(el => el && el.classList.contains('ready'));
        }
        if (step === 'menu_open') {
            const menuBtn = document.getElementById('menu-btn');
            return menuBtn ? [menuBtn] : [];
        }
        return [];
    }

    function placeTutorialCard(overlay, targets) {
        const card = overlay.querySelector('.tutorial-card');
        if (!card) return;
        card.style.left = '50%';
        card.style.top = '';
        card.style.bottom = '132px';
        card.style.transform = 'translateX(-50%)';
        const step = tutorialStep();
        if (step === 'menu_intro' || step === 'final') {
            card.style.left = '50%';
            card.style.top = '108px';
            card.style.bottom = 'auto';
            card.style.transform = 'translateX(-50%)';
            return;
        }
        if (!targets || !targets.length) return;
        const rects = targets.map(el => el.getBoundingClientRect());
        const minTop = Math.min(...rects.map(r => r.top));
        const maxBottom = Math.max(...rects.map(r => r.bottom));
        const centerX = rects.reduce((sum, r) => sum + r.left + r.width / 2, 0) / rects.length;
        const placeAbove = maxBottom > window.innerHeight * 0.56;
        const cardWidth = Math.min(window.innerWidth * 0.92, 360);
        const safeLeft = Math.max(cardWidth / 2 + 12, Math.min(window.innerWidth - cardWidth / 2 - 12, centerX));
        card.style.left = `${safeLeft}px`;
        card.style.transform = 'translateX(-50%)';
        if (placeAbove) {
            card.style.top = '82px';
            card.style.bottom = 'auto';
        } else {
            const top = Math.max(maxBottom + 18, 82);
            card.style.top = `${Math.min(top, window.innerHeight - 170)}px`;
            card.style.bottom = 'auto';
        }
    }

    function refreshTutorial() {
        const overlay = document.getElementById('tutorial-overlay');
        const title = document.getElementById('tutorial-title');
        const text = document.getElementById('tutorial-text');
        const stepText = document.getElementById('tutorial-step');
        const actionBtn = document.getElementById('tutorial-action');
        document.querySelectorAll('.tutorial-focus').forEach(el => el.classList.remove('tutorial-focus'));
        if (!overlay || !title || !text || !stepText || !actionBtn) return;
        if (!tutorialIsActive()) {
            overlay.classList.remove('active');
            return;
        }
        const step = tutorialStep();
        const cfg = getTutorialCardCopy();
        title.textContent = cfg.title;
        text.textContent = cfg.text;
        stepText.textContent = cfg.progress || '';
        const dimOverlay = step === 'welcome_seed' || (step === 'harvest_ready' && currentTool !== 'harvest');
        overlay.style.background = dimOverlay ? 'rgba(18, 12, 4, 0.36)' : 'transparent';
        overlay.classList.toggle('menu-stage', step === 'menu_intro' || step === 'final');
        actionBtn.className = 'tutorial-action';
        actionBtn.textContent = 'Далее';
        if (step === 'menu_intro') actionBtn.classList.add('show');
        if (step === 'final') {
            actionBtn.textContent = 'Завершить обучение';
            actionBtn.classList.add('show', 'finish');
        }
        overlay.classList.add('active');
        const targets = getTutorialTargets();
        targets.forEach(target => target.classList.add('tutorial-focus'));
        placeTutorialCard(overlay, targets);
    }

    function resetTilesState() {
        tiles.forEach((tile, index) => {
            Object.assign(tile, { id: index, active: false, plantId: null, growth: 0, water: 0, hasWeed: false, mutations: [], scale: 1, weight: 5, weightMult: 1, sizeTier: 'normal', beeLock: 0 });
        });
    }

    function getBuffs() {
        const buffs = { speedMult: 0, coinMult: 0, mutChance: 0, weightMult: 0 };
        if (hasRewardCoinBoost()) buffs.coinMult += 1;
        ensureCompanionState();
        const skinDef = PET_DEFS[player.companion.skin];
        if (skinDef) applyPetBuff(buffs, skinDef, 1 + Math.min(0.6, (player.companion.level - 1) * 0.04));
        return buffs;
    }

    function applyPetBuff(buffs, def, mult = 1) {
        const v = def.value * mult;
        if (def.stat === 'speedMult') buffs.speedMult += v;
        else if (def.stat === 'coinMult') buffs.coinMult += v;
        else if (def.stat === 'mutChance') buffs.mutChance += v;
        else if (def.stat === 'weightMult') buffs.weightMult += v;
        else if (def.stat === 'hybridRare') { buffs.weightMult += v; buffs.mutChance += v; }
        else if (def.stat === 'hybridGrowth') { buffs.speedMult += v; buffs.weightMult += v; }
        else if (def.stat === 'all') { buffs.speedMult += v; buffs.coinMult += v; buffs.mutChance += v; buffs.weightMult += v; }
    }

    function getPetInstance(uid) {
        return (player.petInventory || []).find(p => p.uid === uid);
    }

    function getPetPowerMult(pet) {
        let mult = pet.level || 1;
        if (pet.size === 'huge') mult *= 1.5;
        if (pet.shiny === 'gold') mult *= 1.5;
        if (pet.shiny === 'rainbow') mult *= 2.5;
        return mult;
    }

    function rollPetVariant() {
        return {
            size: Math.random() < 0.08 ? 'huge' : 'normal',
            shiny: Math.random() < 0.015 ? 'rainbow' : (Math.random() < 0.06 ? 'gold' : 'normal')
        };
    }

    function petDisplayName(pet) {
        const def = PET_DEFS[pet.id];
        return def ? (def.shortName || def.name || 'СЛАЙМ').toUpperCase().replace(/\s*СЛАЙМ\s*/gi, '').trim() : 'СЛАЙМ';
    }

    function petRarityHTML(pet, def) {
        const style = PET_RARITY_STYLE[def.rarity] || PET_RARITY_STYLE.common;
        const parts = [];
        if (pet.size === 'huge') parts.push('<b class="trait-huge">HUGE</b>');
        if (pet.shiny === 'gold') parts.push('<b class="trait-gold">Золотой</b>');
        if (pet.shiny === 'rainbow') parts.push('<b class="trait-rainbow">Радужный</b>');
        parts.push(style.label);
        if (def.secret && def.rarity !== 'secret') parts.push('секретный');
        return `${parts.join(' ')} <i>${rarityStars(def)}</i>`;
    }

    function rarityStars(def) {
        const style = PET_RARITY_STYLE[def.rarity] || PET_RARITY_STYLE.common;
        return '★'.repeat(style.stars || 1);
    }

    function decorSfx(normalType, popitType = 'popitClick') {
        sfx.play((player.plotStyle || 'default') === 'popit' ? popitType : normalType);
    }

    function randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    function getWeightMultiplier(weight) {
        if (weight < 50) {
            return Math.max(0.5, Math.min(1.5, 0.5 + ((weight - 5) / 45)));
        }
        return 1.5 + Math.floor(weight / 100) * 0.5;
    }

    function getPlotUnlockLevel(idx) {
        return PLOT_UNLOCK_LEVELS[idx] || 1;
    }

    function isPlotUnlocked(idx) {
        return player.lvl >= getPlotUnlockLevel(idx);
    }

    function getShowcaseUnlockLevel(slot = -1) {
        if (slot === 0) return 5;
        if (slot === 1) return 10;
        if (slot === 2) return 18;
        return 5;
    }

    function isShowcaseUnlocked(slot = -1) {
        return player.lvl >= getShowcaseUnlockLevel(slot);
    }

    function getSeedOwned(id) {
        ensureSeedAndShopState();
        return Math.max(0, Math.floor(Number(player.seedInventory[id]) || 0));
    }

    function rollSeedShopCount(plantId, basic = false) {
        const p = PLANTS[plantId];
        if (!p) return 0;
        if (basic) {
            if (plantId === 'carrot') return Math.floor(randomRange(8, 13));
            if (plantId === 'cucumber') return Math.floor(randomRange(6, 10));
            if (plantId === 'tomato') return Math.floor(randomRange(4, 8));
            if (plantId === 'pepper') return Math.floor(randomRange(3, 6));
        }
        if (p.cost <= 100) return Math.floor(randomRange(2, 5));
        if (p.cost <= 500) return Math.floor(randomRange(1, 4));
        if (p.cost <= 2000) return Math.floor(randomRange(1, 3));
        return Math.floor(randomRange(1, 2));
    }

    function rollNextMerchantArrivalMs() {
        return Date.now() + Math.floor(randomRange(240000, 480001));
    }

    function buildSeedShopStock() {
        const stock = {};
        BASE_STORE_SEEDS.forEach(id => {
            stock[id] = rollSeedShopCount(id, true);
        });
        const extras = seedKeys.filter(id => !BASE_STORE_SEEDS.includes(id));
        const extraCount = Math.floor(randomRange(2, 4));
        extras.sort(() => Math.random() - 0.5).slice(0, extraCount).forEach(id => {
            stock[id] = rollSeedShopCount(id, false);
        });
        return stock;
    }

    function buildMerchantStock() {
        const stock = {};
        const pool = seedKeys.filter(id => (PLANTS[id].cost || 0) >= 150);
        pool.sort((a, b) => PLANTS[a].cost - PLANTS[b].cost);
        pool.sort(() => Math.random() - 0.5);
        pool.slice(0, 4).forEach(id => {
            stock[id] = Math.max(1, rollSeedShopCount(id, false));
        });
        return stock;
    }

    function updateShopState(forceRefresh = false) {
        ensureSeedAndShopState();
        const now = Date.now();
        if (forceRefresh || !player.shop.refreshAt || now >= player.shop.refreshAt) {
            player.shop.stock = buildSeedShopStock();
            player.shop.refreshAt = now + 180000;
        }
        if (!player.shop.merchantArrivesAt && !player.shop.merchantLeavesAt) {
            player.shop.merchantArrivesAt = rollNextMerchantArrivalMs();
        }
        if (player.shop.merchantLeavesAt && now >= player.shop.merchantLeavesAt) {
            player.shop.merchantLeavesAt = 0;
            player.shop.merchantStock = {};
            player.shop.merchantArrivesAt = rollNextMerchantArrivalMs();
        }
        if (!player.shop.merchantLeavesAt && player.shop.merchantArrivesAt && now >= player.shop.merchantArrivesAt) {
            player.shop.merchantStock = buildMerchantStock();
            player.shop.merchantLeavesAt = now + 120000;
            player.shop.merchantArrivesAt = 0;
        }
    }

    function getQuickSeedKeys() {
        return seedKeys
            .sort((a, b) => {
                const aReady = getSeedOwned(a) > 0 ? 1 : 0;
                const bReady = getSeedOwned(b) > 0 ? 1 : 0;
                if (aReady !== bReady) return bReady - aReady;
                return seedKeys.indexOf(a) - seedKeys.indexOf(b);
            });
    }

    function ensureSelectedSeedAvailable() {
        if (!PLANTS[currentTool]) return;
        if (getSeedOwned(currentTool) > 0) return;
        const nextSeed = getQuickSeedKeys().find(id => getSeedOwned(id) > 0);
        currentTool = nextSeed || 'water';
    }

    function visualScaleForWeight(weight, tier) {
        if (tier === 'huge') return parseFloat((3.05 + ((weight - 400) / 600) * 0.95).toFixed(2));
        if (tier === 'big') return parseFloat((2.2 + ((weight - 50) / 350) * 0.8).toFixed(2));
        return parseFloat(getWeightMultiplier(weight).toFixed(2));
    }

    function rollCropWeight() {
        const r = Math.random();
        let tier = 'normal';
        let weight = randomRange(5, 50);

        if (r < HUGE_CROP_CHANCE) {
            tier = 'huge';
            weight = randomRange(400, 1000);
        } else if (r < HUGE_CROP_CHANCE + BIG_CROP_CHANCE) {
            tier = 'big';
            weight = randomRange(50, 400);
        }

        weight = Math.round(weight * 10) / 10;
        return {
            tier,
            weight,
            weightMult: parseFloat(getWeightMultiplier(weight).toFixed(1)),
            scale: visualScaleForWeight(weight, tier)
        };
    }

    function formatWeight(value) {
        return Number(value).toFixed(1).replace('.', ',');
    }

    function slimeHTML(def, pet = {}, size = 'medium') {
        const slime = def.slime || {};
        const classes = [
            'slime-pet',
            `slime-${size}`,
            `rarity-${def.rarity || 'common'}`,
            `face-${def.face || 'happy'}`,
            `decor-${slime.decor || 'none'}`,
            pet.size === 'huge' ? 'is-huge' : '',
            pet.shiny === 'gold' ? 'is-gold' : '',
            pet.shiny === 'rainbow' ? 'is-rainbow' : '',
            pet.happy && size === 'featured' ? 'is-happy' : ''
        ].filter(Boolean).join(' ');
        return `<span class="${classes}" style="--slime-body:${slime.body || '#74b9ff'}; --slime-shade:${slime.shade || '#0984e3'}; --slime-blush:${slime.blush || '#ffb3c7'};"><i class="slime-face"><span class="slime-eye left"></span><span class="slime-eye right"></span><span class="slime-mouth"></span></i><i class="slime-decor"></i></span>`;
    }

    function seedIcon(id, extraClass = '') {
        return `<span class="seed-icon-art seed-${id} ${extraClass}" aria-hidden="true"></span>`;
    }

    function compactNumber(value) {
        const n = Math.floor(Number(value) || 0);
        if (n >= 1000000) return `${(n / 1000000).toFixed(n >= 10000000 ? 0 : 1).replace('.0', '')}m`;
        if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.0', '')}k`;
        return `${n}`;
    }

    function cropSizePercent(weight, sizeTier) {
        if (sizeTier === 'huge' || weight >= 400) return 60 + Math.min(20, ((weight - 400) / 600) * 20);
        if (sizeTier === 'big' || weight >= 50) return 40 + Math.min(20, ((weight - 50) / 350) * 20);
        return 20 + Math.max(0, Math.min(20, ((weight - 5) / 45) * 20));
    }

    function cropSaleValue(plantId, mutations, weight, coinMult = 0) {
        const p = PLANTS[plantId];
        if (!p) return 0;
        let mutationMult = 1;
        (mutations || []).forEach(mId => {
            const m = MUTATIONS[mId];
            if (m) mutationMult *= m.mult;
        });
        return Math.floor(p.reward * mutationMult * (1 + coinMult) * getWeightMultiplier(weight));
    }

    function showcaseIncome(crop) {
        if (!crop) return 0;
        return Math.max(1, Math.floor((crop.value || 0) * 0.08));
    }

    function ensureStats() {
        if (!player.stats) player.stats = {};
        player.stats.totalEarned = Math.max(0, Number(player.stats.totalEarned) || 0);
        player.stats.maxWeight = Math.max(0, Number(player.stats.maxWeight) || 0);
        player.stats.bestSale = Math.max(0, Number(player.stats.bestSale) || 0);
        player.stats.harvested = Math.max(0, Number(player.stats.harvested) || 0);
        if (!player.rares) player.rares = {};
        if (!Array.isArray(player.unlockedMutations)) player.unlockedMutations = [];
    }

    function recordCropStats(crop, earned = 0, countTraits = true) {
        if (!crop) return;
        ensureStats();
        const value = Math.floor(Number(earned) || 0);
        player.stats.harvested += 1;
        player.stats.totalEarned += Math.max(0, value);
        player.stats.bestSale = Math.max(player.stats.bestSale, value);
        player.stats.maxWeight = Math.max(player.stats.maxWeight, Number(crop.weight) || 0);

        if (!countTraits) return;
        (crop.mutations || []).forEach(mId => {
            if (!MUTATIONS[mId]) return;
            player.rares[mId] = (player.rares[mId] || 0) + 1;
            if (!player.unlockedMutations.includes(mId)) {
                player.unlockedMutations.push(mId);
                showBigMutation(mId);
            }
        });
        if (crop.sizeTier === 'big' || crop.sizeTier === 'huge') {
            player.rares[crop.sizeTier] = (player.rares[crop.sizeTier] || 0) + 1;
        }
    }

    function totalShowcaseIncome() {
        return (player.showcase || []).reduce((sum, crop) => sum + showcaseIncome(crop), 0);
    }

    function cropSnapshotFromTile(idx) {
        const t = tiles[idx];
        const p = t && PLANTS[t.plantId];
        if (!t || !p || !t.active || t.growth < 100) return null;
        const buffs = getBuffs();
        const weight = Math.min(1000, Math.max(5, (t.weight || p.baseW) * (1 + buffs.weightMult)));
        const sizeTier = weight >= 400 ? 'huge' : (weight >= 50 ? 'big' : 'normal');
        const mutations = [...(t.mutations || [])];
        const value = cropSaleValue(p.id, mutations, weight, buffs.coinMult);
        return {
            plantId: p.id,
            mutations,
            weight: Math.round(weight * 10) / 10,
            weightMult: parseFloat(getWeightMultiplier(weight).toFixed(1)),
            sizeTier,
            value,
            income: Math.max(1, Math.floor(value * 0.08)),
            createdAt: Date.now()
        };
    }

    function cropBadgesHTML(mutations) {
        if (!mutations || mutations.length === 0) return '';
        return `<div class="mutations-container showcase-mutations">${mutations.map(mId => {
            const m = MUTATIONS[mId];
            return m ? `<div class="mut-badge" style="--mut-color:${m.color};">${m.icon}</div>` : '';
        }).join('')}</div>`;
    }

    function cropMutationAuraHTML(mutations) {
        if (!mutations || mutations.length === 0) return '';
        return `<div class="mutation-aura active stack-${Math.min(mutations.length, 3)}">${mutations.map((mId, order) => {
            const m = MUTATIONS[mId];
            return m ? `<span class="mut-effect fx-${mId}" style="--mut-color:${m.color}; --i:${order};"></span>` : '';
        }).join('')}</div>`;
    }

    function showcaseCropHTML(crop) {
        if (!crop || !PLANTS[crop.plantId]) return '';
        const p = PLANTS[crop.plantId];
        const pct = cropSizePercent(crop.weight || 5, crop.sizeTier || 'normal');
        const scale = Math.max(0.48, Math.min(1.88, pct / 42));
        const mutations = crop.mutations || [];
        const mutClasses = mutations.map(mId => `mut-${mId}`).join(' ');
        const primary = mutations[0] ? `primary-${mutations[0]}` : '';
        const glowHtml = mutations.length ? '<span class="showcase-glow"></span>' : '';
        return `
            <div class="showcase-crop-art showcase-plant-preview tile occupied ready crop-${crop.sizeTier || 'normal'} ${mutClasses} ${primary}" style="--plant-scale:${scale}; --crop-color:${p.color};">
                ${glowHtml}
                ${cropMutationAuraHTML(mutations)}
                ${cropBadgesHTML(mutations)}
                <div class="plant-wrapper">
                    <div class="model visible model-${p.id} ready"></div>
                </div>
            </div>
        `;
    }

function init() {
        loadGame();
        startEvent('day');
        renderGarden();
        renderSeeds();
        generateQuestsIfNeeded();
        calcOfflineBank();
        updateUI();
        refreshTutorial();
        document.getElementById('seeds-window').addEventListener('scroll', updateCarouselArrows);
        document.getElementById('garden').addEventListener('pointerdown', handleGardenDecorTap);
        bindPressFeedback();
        setInterval(gameTick, 1000);
        setInterval(realtimeUiTick, 250);
        setInterval(saveGame, 5000);
        scheduleCompanionSpecial();
    }

    function handleGardenDecorTap(event) {
        if (player.plotStyle !== 'slime' || event.target.closest('.tile')) return;
        const now = Date.now();
        if (env.decorTapCooldown && env.decorTapCooldown > now) return;
        env.decorTapCooldown = now + 1000;
        const garden = document.getElementById('garden');
        garden.classList.remove('slime-boop');
        void garden.offsetWidth;
        garden.classList.add('slime-boop');
        sfx.play('blop');
        setTimeout(() => garden.classList.remove('slime-boop'), 720);
    }

    function renderGarden() {
        const g = document.getElementById('garden');
        g.className = `garden style-${player.plotStyle || 'default'}`;
        applyDecorVars(g);
        g.innerHTML = '';
        tiles.forEach((t, i) => {
            const el = document.createElement('div');
            el.className = 'tile';
            el.id = `tile-${i}`;
            el.innerHTML = `
                <div class="tile-lock" id="lock-${i}"><span class="lock-icon" aria-hidden="true"></span><small id="lock-level-${i}"></small></div>
                <div class="toxic-cloud"></div>
                <div class="candy-rain-container"></div>
                <div class="mutation-aura" id="aura-${i}"></div>
                <div class="tile-progress"><div class="progress-fill" id="grow-${i}"></div></div>
                <div class="mutations-container" id="mut-container-${i}"></div>
                <div class="tile-bee">🐝</div>
                <div class="plant-wrapper">
                    <div class="model" id="model-${i}"></div>
                    <div class="weed-model">🐛</div>
                </div>
            `;
            el.addEventListener('pointerdown', (event) => {
                event.preventDefault();
                handleInteract(i);
            });
            g.appendChild(el);
            updateTileDOM(i);
        });
        renderPaintPalette(g);
    }

    function renderSeeds() {
        const container = document.getElementById('seeds-track');
        ensureSeedAndShopState();
        ensureSelectedSeedAvailable();
        container.innerHTML = '';
        getQuickSeedKeys().forEach(key => {
            const p = PLANTS[key];
            const amount = getSeedOwned(key);
            const empty = amount <= 0;
            const el = document.createElement('div');
            el.className = `seed-packet ${empty ? 'empty unavailable' : ''} ${currentTool === p.id ? 'active' : ''}`;
            el.dataset.seed = p.id;
            el.style.setProperty('--pkt-color', p.color);
            el.onclick = () => {
                if (amount <= 0) { showToast('Купи семена в магазине', 'gray'); return; }
                if (tutorialIsActive() && (tutorialStep() !== 'welcome_seed' || p.id !== 'carrot')) { tutorialNudge(); return; }
                selectAction(p.id);
            };
            el.innerHTML = `<div class="pkt-top"></div><div class="pkt-bg"></div><div class="seed-name">${p.name}</div><div class="seed-icon">${seedIcon(p.id)}</div><div class="seed-stock">${empty ? 'нет' : `x${amount}`}</div>`;
            container.appendChild(el);
        });
        setTimeout(updateCarouselArrows, 100);
    }

    function scrollSeeds(dir) {
        document.getElementById('seeds-window').scrollBy({ left: dir * 160, behavior: 'smooth' });
    }

    function updateCarouselArrows() {
        const w = document.getElementById('seeds-window');
        const btnLeft = document.getElementById('btn-left');
        const btnRight = document.getElementById('btn-right');
        if (w.scrollLeft <= 5) btnLeft.classList.add('disabled'); else btnLeft.classList.remove('disabled');
        if (w.scrollLeft >= (w.scrollWidth - w.clientWidth - 5)) btnRight.classList.add('disabled'); else btnRight.classList.remove('disabled');
    }

    function selectAction(tool) {
        if (tool === 'shop') {
            toggleShop();
            return;
        }
        if (tutorialIsActive()) {
            const step = tutorialStep();
            const allowed = (
                (step === 'welcome_seed' && tool === 'carrot') ||
                (step === 'harvest_ready' && tool === 'harvest')
            );
            if (!allowed) { tutorialNudge(); return; }
        }
        currentTool = tool; decorSfx('pop', 'popitClick');
        document.querySelectorAll('.action-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tool === tool));
        renderSeeds();
        if (tutorialIsActive()) {
            if (tutorialStep() === 'welcome_seed' && tool === 'carrot') {
                player.tutorial.selectedSeed = 'carrot';
                setTutorialStep('plant_two');
            } else if (tutorialStep() === 'harvest_ready' && tool === 'harvest') {
                player.tutorial.harvestedCount = 0;
                refreshTutorial();
            }
        } else {
            refreshTutorial();
        }
    }

    function handleInteract(idx) {
        const t = tiles[idx];
        if (!isPlotUnlocked(idx)) {
            showToast(`Нужен уровень ${getPlotUnlockLevel(idx)}`, '#a29bfe');
            sfx.play('error');
            return;
        }
        if (tutorialIsActive()) {
            const step = tutorialStep();
            const isTutorialTile = player.tutorial.targetTiles.includes(idx);
            const allowsWeed = step === 'weed_alert' && idx === player.tutorial.weedTile && t.hasWeed;
            const allowsPlant = step === 'plant_two' && isTutorialTile && currentTool === 'carrot' && !t.active;
            const allowsHarvest = step === 'harvest_ready' && isTutorialTile && currentTool === 'harvest' && t.active && t.growth >= 100;
            if (!allowsWeed && !allowsPlant && !allowsHarvest) { tutorialNudge(); return; }
        }
        if (t.hasWeed) {
            t.hasWeed = false;
            decorSfx('pop', 'popitClick');
            showToast("🐛 Паразит изгнан!", "#00b894");
            updateTileDOM(idx);
            updateQuest('clear_weeds', 1);
            if (tutorialIsActive() && tutorialStep() === 'weed_alert' && idx === player.tutorial.weedTile) {
                player.tutorial.weedCleared = true;
                if (!tiles[idx].mutations.includes('gold')) tiles[idx].mutations.push('gold');
                tiles[idx].growth = 100;
                updateTileDOM(idx);
                setTutorialStep('harvest_ready');
            }
            return;
        }
        if (currentTool === 'shovel') { if (t.active) { clearTile(idx); decorSfx('error', 'popitClick'); floatText(idx, "Очищено", "gray"); } else decorSfx('pop', 'popitClick'); return; }
        if (currentTool === 'water') {
            t.water = WATER_DURATION;
            decorSfx('pop', 'popitWater');
            floatText(idx, "💧", "#74b9ff");
            updateTileDOM(idx);
            updateQuest('water_plants', 1);
            return;
        }
        if (currentTool === 'harvest') { if (t.active && t.growth >= 100) harvestPlant(idx); else decorSfx('pop', 'popitClick'); return; }

        if (PLANTS[currentTool]) {
            if (t.active) { decorSfx('pop', 'popitClick'); return; }
            const p = PLANTS[currentTool];
            if (getSeedOwned(p.id) <= 0) { showToast('Семена закончились', '#ff7675'); sfx.play('error'); renderSeeds(); return; }
            player.seedInventory[p.id] = Math.max(0, getSeedOwned(p.id) - 1);
            const cropWeight = rollCropWeight();
            t.active = true; t.plantId = p.id; t.growth = 0; t.water = 0; t.hasWeed = false; t.mutations = []; t.beeLock = 0;
            t.weight = cropWeight.weight; t.weightMult = cropWeight.weightMult; t.sizeTier = cropWeight.tier; t.scale = cropWeight.scale;
            ensureSelectedSeedAvailable();
            decorSfx('pop', 'popitClick'); floatText(idx, `-1 ${p.name}`, "#74b9ff");
            updateUI(); updateTileDOM(idx);
            if (tutorialIsActive() && tutorialStep() === 'plant_two') {
                player.tutorial.plantedCount = player.tutorial.targetTiles.filter(tileId => tiles[tileId].active).length;
                if (player.tutorial.plantedCount >= 2) {
                    currentTool = 'water';
                    document.querySelectorAll('.action-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tool === 'water'));
                    setTutorialStep('grow_watch');
                } else {
                    refreshTutorial();
                }
            }
        }
    }

    function harvestPlant(idx) {
        const t = tiles[idx]; const p = PLANTS[t.plantId];
        let buffs = getBuffs();

        let totalMult = 1; 
        let highestColor = "#f1c40f"; 
        
        if (t.mutations.length > 0) {
            t.mutations.forEach(mId => {
                const m = MUTATIONS[mId];
                if (!m) return;
                totalMult *= m.mult;
                highestColor = m.color;
                updateQuest('find_mut', 1);
                if (mId === 'gold') updateQuest('find_gold', 1);
            });
        }

        const baseWeight = t.weight || Math.max(5, Math.min(1000, p.baseW * (t.scale || 1)));
        const actualWeight = Math.min(1000, Math.max(5, baseWeight * (1 + buffs.weightMult)));
        const weightMult = parseFloat(getWeightMultiplier(actualWeight).toFixed(1));
        const sizeTier = actualWeight >= 400 ? 'huge' : (actualWeight >= 50 ? 'big' : 'normal');
        let finalReward = Math.floor(p.reward * totalMult * (1 + buffs.coinMult) * weightMult);
        let xp = Math.floor(finalReward * BALANCE.xpRewardRate);
        const cropRecord = {
            plantId: p.id,
            mutations: [...(t.mutations || [])],
            weight: Math.round(actualWeight * 10) / 10,
            weightMult,
            sizeTier,
            value: finalReward
        };

        recordCropStats(cropRecord, finalReward, true);
        player.coins += finalReward; player.xp += xp;
        while (player.xp >= player.xpNeed) {
            player.lvl++; player.xp -= player.xpNeed; player.xpNeed = Math.floor(player.xpNeed * (BALANCE.xpNeedMult || 1.5));
            showToast(`УРОВЕНЬ ${player.lvl}! 🎉`, "#a29bfe");
            if (Object.values(PLOT_UNLOCK_LEVELS).includes(player.lvl)) {
                showToast('Открылась новая грядка!', '#55efc4');
            }
            renderSeeds();
            tiles.forEach((_, tileIdx) => updateTileDOM(tileIdx));
        }

        playHarvestSfx(sizeTier);
        showHarvestSizeEffect(idx, sizeTier);
        let multText = totalMult > 1 ? `<span style="font-size:16px; color:${highestColor}">x${totalMult.toFixed(1)}</span><br>` : '';
        floatText(idx, `${multText}+${finalReward}$<br><span style="font-size:14px">⚖️ ${formatWeight(actualWeight)}кг · x${weightMult}</span>`, highestColor);
        if (p.id === 'carrot') updateQuest('grow_carrot', 1);
        updateQuest('harvest_any', 1);
        updateQuest('earn_coins', finalReward);
        updateQuest('earn_big', finalReward);
        if ((p.lvl || 0) >= 7) updateQuest('harvest_rare', 1);
        if (tutorialIsActive() && tutorialStep() === 'harvest_ready') {
            player.tutorial.harvestedCount = (player.tutorial.harvestedCount || 0) + 1;
            if ((player.tutorial.harvestedCount || 0) >= 2) {
                setTutorialStep('menu_open');
            } else {
                updateUI();
            }
        }
        clearTile(idx); updateUI();
    }

    function playHarvestSfx(sizeTier) {
        if (sizeTier === 'huge') sfx.play('hugeHarvest');
        else if (sizeTier === 'big') sfx.play('bigHarvest');
        else decorSfx('coin', 'popitHarvest');
    }

    function showHarvestSizeEffect(idx, sizeTier) {
        if (sizeTier !== 'big' && sizeTier !== 'huge') return;
        const tileEl = document.getElementById(`tile-${idx}`);
        if (!tileEl) return;
        const rect = tileEl.getBoundingClientRect();
        const burst = document.createElement('div');
        burst.className = `harvest-size-burst ${sizeTier}`;
        burst.textContent = sizeTier === 'huge' ? 'ОГРОМНЫЙ!' : 'БОЛЬШОЙ';
        burst.style.left = `${rect.left + rect.width / 2}px`;
        burst.style.top = `${rect.top + rect.height / 2}px`;
        document.body.appendChild(burst);
        if (sizeTier === 'huge') {
            document.body.classList.add('huge-harvest-flash');
            setTimeout(() => document.body.classList.remove('huge-harvest-flash'), 520);
        }
        setTimeout(() => burst.remove(), sizeTier === 'huge' ? 1100 : 850);
    }

    function clearTile(idx) {
        tiles[idx].active = false; tiles[idx].plantId = null; tiles[idx].growth = 0; tiles[idx].water = 0; tiles[idx].hasWeed = false; tiles[idx].mutations = []; tiles[idx].scale = 1; tiles[idx].weight = 5; tiles[idx].weightMult = 1; tiles[idx].sizeTier = 'normal'; tiles[idx].beeLock = 0;
        updateTileDOM(idx);
    }

    function getEventIndicatorLabel(type) {
        if (type === 'day') return '☀️ День';
        if (type === 'rain') return '🌧️ Дождь';
        if (type === 'storm') return '⚡ Буря';
        if (type === 'toxic') return '☣️ Токсины';
        if (type === 'starfall') return '🌠 Звездопад';
        if (type === 'holy') return '🔆 Солнце';
        if (type === 'hell') return '🔥 Жар';
        if (type === 'candy') return '🍬 Сладости';
        if (type === 'bee') return '🐝 Пчелы';
        if (type === 'alien') return '🛸 Вторжение';
        return '☀️ День';
    }

    function formatEventTimer(seconds) {
        const safe = Math.max(0, Math.ceil(Number(seconds) || 0));
        const mins = Math.floor(safe / 60);
        const secs = safe % 60;
        return mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}с`;
    }

    function rollNextEventDelay() {
        return Math.floor(randomRange(55, 96));
    }

    function queueNextEvent() {
        env.nextEventTimer = rollNextEventDelay();
    }

    function triggerRandomDayEvent() {
        const r = Math.random();
        if (r < 0.3) Math.random() < 0.35 ? startEvent('storm') : startEvent('rain');
        else if (r < 0.5) startEvent('toxic');
        else if (r < 0.65) startEvent('starfall');
        else if (r < 0.8) startEvent('holy');
        else if (r < 0.9) startEvent('hell');
        else if (r < 0.95) startEvent('candy');
        else if (r < 0.985) startEvent('bee');
        else startEvent('alien');
    }

    function updateStateIndicator() {
        const indicator = document.getElementById('state-indicator');
        if (!indicator) return;
        if (env.currentEvent === 'day' || env.eventTimer <= 0) {
            const nextTimer = Math.max(0, Math.ceil(Number(env.nextEventTimer) || 0));
            if (nextTimer > 0) {
                indicator.innerHTML = `<span class="state-timer">${formatEventTimer(nextTimer)}</span>`;
            } else {
                indicator.innerHTML = `<span class="state-timer">0с</span>`;
            }
            return;
        }
        const label = getEventIndicatorLabel(env.currentEvent);
        indicator.innerHTML = `<span class="state-label">${label}</span>`;
    }

    function startEvent(type) {
        env.currentEvent = type;
        document.body.className = type === 'day' ? '' : `event-${type}`;
        const emitters = document.getElementById('bg-emitters'); emitters.innerHTML = '';

        if (type === 'starfall') { showToast("Магия звезд!", "#a29bfe"); createBgParticles(['⭐'], 'bgFlyStar'); }
        else if (type === 'holy') { showToast("Солнечный луч!", "#f5f6fa"); }
        else if (type === 'hell') { showToast("Теплый вихрь!", "#e84118"); createBgParticles(['■'], 'bgFlyAsh'); }
        else if (type === 'candy') { showToast("Конфетный дождь!", "#ff9ff3"); createBgParticles(['🍬','🍭','🍩','🍪'], 'bgFlyCandy'); }
        else if (type === 'bee') { showToast("Жужжание повсюду!", "#f9ca24"); createBgParticles(['🐝'], 'bgFlyBee'); }
        else if (type === 'alien') { showToast("Инопланетное вторжение!", "#40ffd2"); createBgParticles(['🛸'], 'bgFlyUfo'); }

        if (type === 'day') {
            env.eventTimer = 0;
            queueNextEvent();
            eventActions = [];
            updateStateIndicator();
            return;
        }
        
        env.eventTimer = BALANCE.eventDuration || 15;
        env.nextEventTimer = 0;
        eventActions = [];
        updateStateIndicator();
        let targetCount = 0; let mutType = '';

        if (type === 'toxic') { targetCount = Math.floor(Math.random() * 3) + 2; mutType = 'toxic'; } 
        else if (type === 'storm') { targetCount = Math.floor(Math.random() * 4) + 1; mutType = 'electric'; } 
        else if (type === 'starfall') { targetCount = Math.floor(Math.random() * 5) + 2; mutType = 'stellar'; } 
        else if (type === 'holy') { targetCount = Math.floor(Math.random() * 3) + 3; mutType = 'holy'; }
        else if (type === 'hell') { targetCount = Math.floor(Math.random() * 4) + 2; mutType = 'hell'; }
        else if (type === 'candy') { targetCount = Math.floor(Math.random() * 4) + 2; mutType = 'candy'; }
        else if (type === 'bee') { targetCount = Math.floor(Math.random() * 3) + 1; mutType = 'bee'; }
        else if (type === 'alien') { targetCount = Math.floor(Math.random() * 3) + 2; mutType = 'alien'; }

        if (targetCount > 0) {
            let available = tiles.filter(t => t.active && t.mutations.length < 3).map(t => t.id);
            available.sort(() => Math.random() - 0.5);
            for(let i=0; i < targetCount && available.length > 0; i++) {
                let tId = available.pop();
                eventActions.push({ time: Math.floor(Math.random() * 12) + 2, tileId: tId, mut: mutType, done: false });
            }
        }
    }

    function createBgParticles(chars, animName) {
        const container = document.getElementById('bg-emitters');
        for(let i=0; i<15; i++) {
            const p = document.createElement('div');
            p.innerText = chars[Math.floor(Math.random()*chars.length)];
            p.className = `bg-particle ${animName}`;
            p.style.setProperty('--x', `${Math.random() * 100}vw`);
            p.style.setProperty('--y', `${Math.random() * 100}vh`);
            p.style.setProperty('--delay', `${Math.random() * -6}s`);
            p.style.setProperty('--dur', `${Math.random() * 4 + 5}s`);
            p.style.setProperty('--size', `${Math.random() * 14 + 16}px`);
            container.appendChild(p);
        }
    }

    function runTutorialTick() {
        updateIncubatorAndPets();
        const step = tutorialStep();
        const firstTile = tiles[player.tutorial.readyTile];
        const weedTile = tiles[player.tutorial.weedTile];

        player.tutorial.targetTiles.forEach(idx => {
            const tile = tiles[idx];
            if (!tile) return;
            if (tile.water > 0) tile.water = Math.max(0, tile.water - 1);
        });

        if (step === 'grow_watch') {
            if (firstTile && firstTile.active && firstTile.growth < 100) {
                firstTile.growth = Math.min(100, firstTile.growth + 24);
                updateTileDOM(player.tutorial.readyTile);
            }
            if (weedTile && weedTile.active && !player.tutorial.weedSpawned) {
                weedTile.growth = Math.min(82, weedTile.growth + 18);
                if (weedTile.growth >= 82) {
                    weedTile.hasWeed = true;
                    player.tutorial.weedSpawned = true;
                    setTutorialStep('weed_alert');
                }
                updateTileDOM(player.tutorial.weedTile);
            }
            if (firstTile && firstTile.growth >= 100) updateTileDOM(player.tutorial.readyTile);
            return;
        }

        if (step === 'weed_alert') {
            if (firstTile && firstTile.active && firstTile.growth < 100) {
                firstTile.growth = Math.min(100, firstTile.growth + 8);
                updateTileDOM(player.tutorial.readyTile);
            }
            if (weedTile) updateTileDOM(player.tutorial.weedTile);
            return;
        }

        if (step === 'harvest_ready') {
            if (firstTile && firstTile.active) {
                firstTile.growth = 100;
                updateTileDOM(player.tutorial.readyTile);
            }
            if (weedTile && weedTile.active) {
                weedTile.growth = 100;
                updateTileDOM(player.tutorial.weedTile);
            }
            return;
        }

        refreshTutorial();
    }

    function applyEventMutation(idx, mutType) {
        const t = tiles[idx];
        if (!t.active || t.mutations.length >= 3 || t.mutations.includes(mutType)) return;
        
        const tileEl = document.getElementById(`tile-${idx}`);
        if (t.growth < 100) {
            tileEl.classList.add('sprout-mut-hit');
            setTimeout(() => tileEl.classList.remove('sprout-mut-hit'), 900);
        }

        // Визуальные эффекты ударов
        if (mutType === 'electric') { sfx.play('thunder'); tileEl.classList.add('strike'); setTimeout(() => tileEl.classList.remove('strike'), 300); }
        else if (mutType === 'stellar') { sfx.play('mut'); tileEl.classList.add('star-hit'); setTimeout(() => tileEl.classList.remove('star-hit'), 1000); }
        else if (mutType === 'candy') { sfx.play('candy'); tileEl.classList.add('candy-hit'); setTimeout(() => tileEl.classList.remove('candy-hit'), 1000); }
        else if (mutType === 'toxic') { sfx.play('mut'); tileEl.classList.add('toxic-hit'); setTimeout(() => tileEl.classList.remove('toxic-hit'), 1000); }
        else if (mutType === 'holy') {
            sfx.play('holy');
            tileEl.classList.add('holy-hit');
            setTimeout(() => {
                tileEl.classList.remove('holy-hit');
                if (t.active && t.mutations.length < 3 && !t.mutations.includes(mutType)) { t.mutations.push(mutType); updateTileDOM(idx); }
            }, 850);
            return;
        }
        else if (mutType === 'hell') {
            sfx.play('hell');
            tileEl.classList.add('hell-hit');
            setTimeout(() => {
                tileEl.classList.remove('hell-hit');
                if (t.active && t.mutations.length < 3 && !t.mutations.includes(mutType)) { t.mutations.push(mutType); updateTileDOM(idx); }
            }, 850);
            return;
        }
        else if (mutType === 'alien') {
            sfx.play('mut');
            tileEl.classList.add('alien-hit');
            setTimeout(() => {
                tileEl.classList.remove('alien-hit');
                if (t.active && t.mutations.length < 3 && !t.mutations.includes(mutType)) { t.mutations.push(mutType); updateTileDOM(idx); }
            }, 1100);
            return;
        }
        else if (mutType === 'bee') { 
            sfx.play('bee'); tileEl.classList.add('bee-arrived'); t.beeLock = 3;
            setTimeout(() => {
                tileEl.classList.remove('bee-arrived');
                if (t.active && !t.mutations.includes('honey')) { t.mutations.push('honey'); updateTileDOM(idx); }
            }, 2500);
            return; 
        }
        
        t.mutations.push(mutType);
        updateTileDOM(idx);
    }

    function gameTick() {
        env.ticks++;
        updateShopState();
        ensureRewardsState();
        updateCompanionState();
        if (tutorialIsActive()) {
            runTutorialTick();
            return;
        }
        
        if (env.eventTimer > 0) {
            env.eventTimer--;
            eventActions.forEach(act => {
                if (env.eventTimer <= act.time && !act.done) {
                    act.done = true; applyEventMutation(act.tileId, act.mut);
                }
            });
            updateStateIndicator();
            if (env.eventTimer <= 0) startEvent('day');
        } else {
            if (env.nextEventTimer > 0) {
                env.nextEventTimer--;
                updateStateIndicator();
            }
            if (env.nextEventTimer <= 0) {
                triggerRandomDayEvent();
            }
        }

        updateIncubatorAndPets();
        if (env.openMenuSections?.pets) renderPets();
        if (env.openMenuSections?.rewards) renderRewards();
        if (document.getElementById('shop-modal')?.classList.contains('open')) renderShop();
        renderActiveStatusStrip();
        const menuBadge = document.getElementById('menu-badge');
        if (menuBadge) {
            const hasDoneQuests = player.quests.some(q => q.current >= q.target && !q.claimed);
            menuBadge.style.display = (hasDoneQuests || hasClaimableRewards()) ? 'block' : 'none';
        }
        updateMenuMarkers();

        let buffs = getBuffs();

        tiles.forEach((t, idx) => {
            const wasWet = t.water > 0;

            if (!t.active || t.growth >= 100) {
                if (wasWet) {
                    t.water = Math.max(0, t.water - 1);
                    if (t.water === 0) updateTileDOM(idx);
                }
                return;
            }

            if (t.beeLock > 0) { t.beeLock--; return; }
            if (!t.hasWeed && env.currentEvent === 'day' && Math.random() < BALANCE.weedChance) { t.hasWeed = true; updateTileDOM(idx); return; }
            if (t.hasWeed) return;

            const p = PLANTS[t.plantId];
            let speed = 1 + buffs.speedMult;
            if (wasWet) speed *= 2;
            if (env.currentEvent === 'rain' || env.currentEvent === 'storm') speed *= 3;

            t.growth = Math.min(100, t.growth + (100 / p.time) * speed);
            if (wasWet) t.water = Math.max(0, t.water - 1);
            if (t.growth >= 100 && t.mutations.length < 3) {
                let r = Math.random(); let mChance = 1 + buffs.mutChance;
                if (r < MUTATIONS.rainbow.chance * mChance && !t.mutations.includes('rainbow')) t.mutations.push('rainbow');
                else if (r < MUTATIONS.gold.chance * mChance && !t.mutations.includes('gold')) t.mutations.push('gold');
            }
            updateTileDOM(idx);
        });
    }

    function updateTileDOM(idx) {
        const t = tiles[idx]; const el = document.getElementById(`tile-${idx}`);
        const model = document.getElementById(`model-${idx}`); const fill = document.getElementById(`grow-${idx}`);
        const wrapper = el.querySelector('.plant-wrapper');
        const mutContainer = document.getElementById(`mut-container-${idx}`);
        const aura = document.getElementById(`aura-${idx}`);
        const lock = document.getElementById(`lock-${idx}`);
        const lockLevel = document.getElementById(`lock-level-${idx}`);
        const unlocked = isPlotUnlocked(idx);
        
        fill.style.width = `${t.growth}%`;
        
        // Пересобираем классы
        el.className = 'tile';
        if (!unlocked) el.classList.add('locked');
        if (t.active) el.classList.add('occupied');
        if (t.water > 0) el.classList.add('wet');
        if (t.hasWeed) el.classList.add('has-weed');
        if (t.growth >= 100) el.classList.add('ready');
        if (t.beeLock > 0) el.classList.add('bee-arrived'); 
        if (t.active && t.sizeTier) el.classList.add(`crop-${t.sizeTier}`);

        if (lock && lockLevel) {
            lock.style.display = unlocked ? 'none' : 'flex';
            lockLevel.textContent = `ур. ${getPlotUnlockLevel(idx)}`;
        }

        wrapper.style.setProperty('--plant-scale', t.active ? t.scale : 1);

        aura.innerHTML = '';
        aura.className = 'mutation-aura';

        // Стаки мутаций
        mutContainer.innerHTML = '';
        if (t.mutations.length > 0) {
            t.mutations.forEach((mId, order) => {
                const m = MUTATIONS[mId];
                mutContainer.innerHTML += `<div class="mut-badge" style="--mut-color:${m.color};">${m.icon}</div>`;
                aura.innerHTML += `<span class="mut-effect fx-${mId}" style="--mut-color:${m.color}; --i:${order};"></span>`;
                el.classList.add(`mut-${mId}`); // Применяем ВСЕ мутации как классы
            });
            el.classList.add(`primary-${t.mutations[0]}`);
            aura.classList.add('active', `stack-${Math.min(t.mutations.length, 3)}`);

            // Капли мёда
            if (t.mutations.includes('honey')) {
                const honeyDrops = wrapper.querySelectorAll('.honey-drop');
                if (honeyDrops.length !== 3 || honeyDrops[0].dataset.sizeTier !== (t.sizeTier || 'normal')) {
                    honeyDrops.forEach(d => d.remove());
                    const offsets = t.sizeTier === 'huge' ? [-7, 0, 7] : (t.sizeTier === 'big' ? [-9, 0, 9] : [-12, 0, 12]);
                    for(let d=0; d<3; d++) {
                        const drop = document.createElement('div'); drop.className='honey-drop';
                        drop.dataset.sizeTier = t.sizeTier || 'normal';
                        drop.style.left = `calc(50% + ${offsets[d]}px)`;
                        drop.style.animationDelay = `${d*0.5}s`;
                        wrapper.appendChild(drop);
                    }
                }
            } else { wrapper.querySelectorAll('.honey-drop').forEach(d=>d.remove()); }

        } else { wrapper.querySelectorAll('.honey-drop').forEach(d=>d.remove()); }

        if (!unlocked) {
            aura.innerHTML = '';
            mutContainer.innerHTML = '';
            model.className = 'model';
            wrapper.querySelectorAll('.honey-drop').forEach(d => d.remove());
            return;
        }

        if (t.active) {
            let stateClass = '';
            if (t.growth < 30) stateClass = 'model-seed growing'; 
            else if (t.growth < 100) stateClass = `sprout-${t.plantId} growing`; 
            else stateClass = `model-${t.plantId} ready`;
            model.className = `model visible ${stateClass}`;
        } else model.className = 'model';
    }

    function updateUI() {
        document.getElementById('ui-coins').innerText = player.coins;
        document.getElementById('ui-lvl').innerText = player.lvl;
        document.getElementById('ui-xp-fill').style.width = `${Math.min(100, (player.xp / player.xpNeed) * 100)}%`;
        let hasDoneQuests = player.quests.some(q => q.current >= q.target && !q.claimed);
        document.getElementById('menu-badge').style.display = (hasDoneQuests || hasClaimableRewards()) ? 'block' : 'none';
        updateMenuMarkers();
        renderSeeds();
        tiles.forEach((_, idx) => updateTileDOM(idx));
        renderQuests();
        renderActiveStatusStrip();
        renderCompanion();
        renderPets();
        renderDecorShop();
        renderShowcase();
        renderDiary();
        renderRewards();
        applyDecorStyle();
        if (document.getElementById('shop-modal')?.classList.contains('open')) renderShop();
        refreshTutorial();
    }

    function realtimeUiTick() {
        updateCompanionState();
        if (document.getElementById('side-menu')?.classList.contains('open')) renderCompanionVitals();
        updateCompanionCoinEffect();
        updateStateIndicator();
        renderActiveStatusStrip();
    }

    function toggleMenu() {
        if (tutorialIsActive()) {
            if (tutorialStep() !== 'menu_open' && tutorialStep() !== 'final') {
                tutorialNudge();
                return;
            }
        }
        toggleShop(false);
        const menu = document.getElementById('side-menu');
        menu.classList.toggle('open');
        if (tutorialIsActive() && tutorialStep() === 'menu_open' && menu.classList.contains('open')) {
            setTutorialStep('menu_intro');
        }
        updateUI();
    }

    function selectShopTab(tab) {
        env.shopTab = tab;
        renderShop();
    }

    function toggleShop(force) {
        const modal = document.getElementById('shop-modal');
        if (!modal) return;
        const shouldOpen = typeof force === 'boolean' ? force : !modal.classList.contains('open');
        if (tutorialIsActive() && shouldOpen) {
            tutorialNudge();
            return;
        }
        modal.classList.toggle('open', shouldOpen);
        if (shouldOpen) {
            document.getElementById('side-menu')?.classList.remove('open');
            renderShop();
        }
    }

    function renderShopSeedCard(id, available, source) {
        const p = PLANTS[id];
        if (!p) return '';
        const soldOut = available <= 0;
        const affordable = !soldOut && player.coins >= p.cost;
        const disabled = soldOut;
        const stateClass = soldOut ? 'soldout' : affordable ? 'affordable' : 'pricey';
        const label = soldOut ? 'Ресток' : `${p.cost}$`;
        return `<button class="shop-seed-card ${disabled ? 'disabled' : ''} ${stateClass}" style="--shop-seed-color:${p.color};" type="button" onclick="buySeedFromShop('${source}','${id}', this)">
            <div class="pkt-top"></div>
            <div class="pkt-bg"></div>
            <div class="shop-seed-top">
                <b>${p.name}</b>
                <span>x${available}</span>
            </div>
            <div class="shop-seed-art">${seedIcon(id, 'shop-seed-icon')}</div>
            <div class="shop-seed-bottom">
                <em>${label}</em>
            </div>
        </button>`;
    }

    function getShopDisplayOrder(sourceStock) {
        return seedKeys
            .slice()
            .sort((a, b) => (PLANTS[a].cost || 0) - (PLANTS[b].cost || 0));
    }

    function renderShop() {
        updateShopState();
        const modal = document.getElementById('shop-modal');
        const content = document.getElementById('shop-content');
        const headerTitle = document.getElementById('shop-title');
        const headerMeter = document.getElementById('shop-header-meter');
        const seedsTab = document.getElementById('shop-tab-seeds');
        const merchantTab = document.getElementById('shop-tab-merchant');
        if (!modal || !content || !headerTitle || !headerMeter || !seedsTab || !merchantTab) return;
        modal.classList.toggle('merchant-theme', env.shopTab === 'merchant');
        seedsTab.classList.toggle('active', env.shopTab === 'seeds');
        merchantTab.classList.toggle('active', env.shopTab === 'merchant');

        const now = Date.now();
        const merchantActive = !!player.shop.merchantLeavesAt && player.shop.merchantLeavesAt > now;
        merchantTab.classList.toggle('hot', merchantActive);
        const merchantLabel = merchantTab.querySelector('span:last-child');
        if (merchantLabel) merchantLabel.textContent = merchantActive ? 'Торговец!' : 'Торговец';
        headerMeter.style.display = 'none';

        if (env.shopTab === 'merchant') {
            const merchantCards = getShopDisplayOrder(player.shop.merchantStock)
                .map(id => renderShopSeedCard(id, player.shop.merchantStock[id] || 0, 'merchant'))
                .join('');
            headerTitle.textContent = 'Загадочный Торговец';
            if (merchantActive) {
                const leaveIn = Math.ceil((player.shop.merchantLeavesAt - now) / 1000);
                content.innerHTML = `
                    <div class="shop-pane">
                        <div class="shop-info-banner hot with-timer"><span>Торговец прибыл!</span><b>${formatEventTimer(leaveIn)}</b></div>
                        <div class="shop-seed-grid">
                            ${merchantCards}
                        </div>
                    </div>
                `;
            } else {
                const arriveIn = Math.max(0, Math.ceil((player.shop.merchantArrivesAt - now) / 1000));
                content.innerHTML = `<div class="shop-pane">
                    <div class="shop-info-banner with-timer"><span>Торговец в пути</span><b>${formatEventTimer(arriveIn)}</b></div>
                    <div class="shop-empty-state">
                        <b>Скоро приедет с редкими семенами</b>
                        <small>Загляни позже, ассортимент меняется каждый визит.</small>
                    </div>
                    <div class="shop-seed-grid">
                        ${merchantCards}
                    </div>
                </div>`;
            }
            return;
        }

        const refreshIn = Math.max(0, Math.ceil((player.shop.refreshAt - now) / 1000));
        headerTitle.textContent = 'Лавка семян';
        const allCards = getShopDisplayOrder(player.shop.stock)
            .map(id => renderShopSeedCard(id, player.shop.stock[id] || 0, 'stock'))
            .join('');
        content.innerHTML = `
            <div class="shop-pane">
                <div class="shop-info-banner with-timer"><span>Ресток каждые 3 минуты</span><b>${formatEventTimer(refreshIn)}</b></div>
                <div class="shop-seed-grid">${allCards}</div>
            </div>
        `;
    }

    function buySeedFromShop(source, id, button) {
        updateShopState();
        const p = PLANTS[id];
        if (!p) return;
        const sourceStock = source === 'merchant' ? player.shop.merchantStock : player.shop.stock;
        const available = Math.max(0, Math.floor(Number(sourceStock[id]) || 0));
        if (available <= 0) { showToast('Этот товар раскупили', '#ff7675'); renderShop(); return; }
        if (player.coins < p.cost) { showToast('Не хватает монет', '#ff7675'); return; }
        if (button) {
            button.classList.remove('buy-pop');
            void button.offsetWidth;
            button.classList.add('buy-pop');
        }
        sfx.play('coin');
        player.coins -= p.cost;
        player.seedInventory[id] = getSeedOwned(id) + 1;
        sourceStock[id] = available - 1;
        showToast(`Куплено: ${p.name}`, '#f1c40f');
        updateUI();
        setTimeout(() => {
            renderShop();
            saveGame();
        }, 90);
    }

    function defaultCompanionState() {
        return { name: 'Лайм', level: 1, xp: 0, hunger: 82, clean: 88, energy: 92, sleeping: false, skin: 'basic', lastUpdate: Date.now(), hungerClock: 0, cleanClock: 0, energyClock: 0, cleanGraceUntil: 0 };
    }

    function ensureCompanionState() {
        const defaults = defaultCompanionState();
        if (!player.companion || typeof player.companion !== 'object') player.companion = defaults;
        player.companion = { ...defaults, ...player.companion };
        player.companion.name = String(player.companion.name || 'Лайм').trim().slice(0, 14) || 'Лайм';
        player.companion.level = Math.max(1, Math.min(30, Math.floor(Number(player.companion.level) || 1)));
        player.companion.xp = Math.max(0, Number(player.companion.xp) || 0);
        ['hunger', 'clean', 'energy'].forEach(key => {
            player.companion[key] = Math.round(Math.max(0, Math.min(100, Number(player.companion[key]) || 0)));
        });
        ['hungerClock', 'cleanClock', 'energyClock'].forEach(key => {
            player.companion[key] = Math.max(0, Number(player.companion[key]) || 0);
        });
        player.companion.cleanGraceUntil = Math.max(0, Number(player.companion.cleanGraceUntil) || 0);
        if (player.companion.skin !== 'basic' && !PET_DEFS[player.companion.skin]) player.companion.skin = 'basic';
        player.companion.sleeping = !!player.companion.sleeping;
        player.companion.lastUpdate = Number(player.companion.lastUpdate) || Date.now();
    }

    function companionXpNeed(level = player.companion.level) {
        return 40 + Math.max(1, level) * 20;
    }

    function updateCompanionState() {
        ensureCompanionState();
        const pet = player.companion;
        const now = Date.now();
        const previousUpdate = pet.lastUpdate;
        const elapsed = Math.max(0, Math.min(21600, (now - previousUpdate) / 1000));
        if (elapsed <= 0) return;

        pet.hungerClock += elapsed;
        const hungerSteps = Math.floor(pet.hungerClock / 4);
        if (hungerSteps > 0) {
            pet.hunger = Math.max(0, pet.hunger - hungerSteps);
            pet.hungerClock %= 4;
        }

        const cleanElapsed = now <= pet.cleanGraceUntil
            ? 0
            : Math.max(0, (now - Math.max(previousUpdate, pet.cleanGraceUntil)) / 1000);
        if (cleanElapsed > 0) {
            pet.cleanClock += cleanElapsed;
            const cleanSteps = Math.floor(pet.cleanClock / 2);
            if (cleanSteps > 0) {
                pet.clean = Math.max(0, pet.clean - cleanSteps);
                pet.cleanClock %= 2;
            }
        } else {
            pet.cleanClock = 0;
        }

        pet.energyClock += elapsed;
        const energyInterval = pet.sleeping ? 1 : 3;
        const energySteps = Math.floor(pet.energyClock / energyInterval);
        if (energySteps > 0) {
            const energyDelta = energySteps * (pet.sleeping ? 3 : 2);
            pet.energy = pet.sleeping ? Math.min(100, pet.energy + energyDelta) : Math.max(0, pet.energy - energyDelta);
            pet.energyClock %= energyInterval;
        }
        pet.lastUpdate = now;
        if (pet.sleeping && pet.energy >= 100) pet.sleeping = false;
    }

    function companionSkinDef() {
        ensureCompanionState();
        return player.companion.skin === 'basic' ? null : PET_DEFS[player.companion.skin];
    }

    function companionMoodScore() {
        const pet = player.companion;
        return Math.round(Math.max(0, Math.min(100, pet.hunger * 0.35 + pet.clean * 0.35 + pet.energy * 0.30)));
    }

    function companionMood() {
        if (player.companion.sleeping) return 'sleeping';
        const score = companionMoodScore();
        if (score < 25) return 'sad';
        if (score < 50) return 'neutral';
        if (score < 75) return 'joyful';
        return 'happy';
    }

    const COMPANION_FACE_CLASSES = ['happy', 'smile', 'cute', 'excited', 'angry', 'surprise', 'goofy', 'sleepy', 'blank', 'proud', 'star', 'mystic', 'sad', 'mischief', 'coin', 'relaxed'];

    function companionFaceForMood(def, mood) {
        if (mood === 'sleeping') return 'sleepy';
        const id = def?.id || 'basic';
        const generic = { sad: 'sad', neutral: 'blank', joyful: 'happy', happy: 'cute' };
        const unique = {
            dewdrop: { sad: 'sad', neutral: 'sad', joyful: 'blank', happy: 'happy' },
            sproutslime: { joyful: 'mischief' },
            coinblob: { sad: 'coin', neutral: 'coin', joyful: 'coin', happy: 'coin' },
            moonmelt: { neutral: 'sleepy' },
            wavegum: { joyful: 'relaxed', happy: 'relaxed' },
            nectar: { happy: 'cute' },
            phantooze: { sad: 'blank', neutral: 'blank', joyful: 'blank', happy: 'blank' },
            sunpudding: { joyful: 'proud' },
            embergoo: { sad: 'angry' },
            stargum: { sad: 'star', neutral: 'star', joyful: 'star', happy: 'star' },
            voidpuddle: { sad: 'mystic', neutral: 'mystic', joyful: 'mystic', happy: 'mystic' }
        };
        if (id === 'voidpuddle' && env.companionSpecial === 'levitating') return 'surprise';
        return unique[id]?.[mood] || generic[mood] || def?.face || 'happy';
    }

    function applyCompanionFace(stage, def, mood) {
        const slime = stage?.querySelector('.slime-pet');
        if (!slime) return;
        COMPANION_FACE_CLASSES.forEach(face => slime.classList.remove(`face-${face}`));
        slime.classList.add(`face-${companionFaceForMood(def, mood)}`);
    }

    function emitCompanionCoinBurst() {
        const stage = document.getElementById('companion-stage');
        const slime = stage?.querySelector('.slime-pet');
        if (!stage || !slime) return;
        const stageRect = stage.getBoundingClientRect();
        const slimeRect = slime.getBoundingClientRect();
        const originX = slimeRect.left + slimeRect.width / 2 - stageRect.left;
        const originY = slimeRect.top + slimeRect.height * .42 - stageRect.top;
        const count = 2 + Math.floor(Math.random() * 2);
        for (let index = 0; index < count; index++) {
            setTimeout(() => {
                if (player.companion.skin !== 'coinblob' || companionMood() !== 'happy') return;
                const coin = document.createElement('span');
                const travelX = Math.round((Math.random() < .5 ? -1 : 1) * (34 + Math.random() * 48));
                coin.className = 'companion-flying-coin';
                coin.textContent = '$';
                coin.style.left = `${originX}px`;
                coin.style.top = `${originY}px`;
                coin.style.setProperty('--coin-x', `${travelX}px`);
                coin.style.setProperty('--coin-mid-x', `${Math.round(travelX * .42)}px`);
                coin.style.setProperty('--coin-peak', `${Math.round(-52 - Math.random() * 42)}px`);
                const rotation = Math.round((Math.random() < .5 ? -1 : 1) * (190 + Math.random() * 220));
                coin.style.setProperty('--coin-mid-rotate', `${Math.round(rotation * .45)}deg`);
                coin.style.setProperty('--coin-rotate', `${rotation}deg`);
                stage.appendChild(coin);
                sfx.play('coinSoft');
                setTimeout(() => coin.remove(), 1250);
            }, index * 130);
        }
    }

    function updateCompanionCoinEffect() {
        const menuOpen = document.getElementById('side-menu')?.classList.contains('open');
        if (!menuOpen || player.companion.skin !== 'coinblob' || companionMood() !== 'happy' || player.companion.sleeping) {
            env.companionCoinBurstAt = 0;
            return;
        }
        const now = Date.now();
        if (!env.companionCoinBurstAt) {
            env.companionCoinBurstAt = now + 8000 + Math.random() * 6000;
            return;
        }
        if (now < env.companionCoinBurstAt) return;
        env.companionCoinBurstAt = now + 8000 + Math.random() * 6000;
        emitCompanionCoinBurst();
    }

    function syncCompanionSpecialClasses() {
        const stage = document.getElementById('companion-stage');
        const habitat = document.getElementById('companion-habitat');
        if (!stage) return;
        ['materialized', 'levitating', 'landing', 'sun-glow'].forEach(name => stage.classList.toggle(`special-${name}`, env.companionSpecial === name));
        habitat?.classList.toggle('cosmic-shadow', env.companionSpecial === 'levitating' || env.companionSpecial === 'landing');
        applyCompanionFace(stage, companionSkinDef(), companionMood());
    }

    function clearCompanionSpecial(scheduleNext = true) {
        if (env.companionSpecialEndTimer) clearTimeout(env.companionSpecialEndTimer);
        env.companionSpecialEndTimer = null;
        env.companionSpecial = '';
        syncCompanionSpecialClasses();
        env.companionSpecialAnchorX = 0;
        env.companionSpecialAnchorY = 0;
        if (scheduleNext) scheduleCompanionSpecial();
    }

    function startCompanionSpecial(type) {
        if (type === 'levitating') {
            const slime = document.querySelector('#companion-stage .slime-pet');
            const rect = slime?.getBoundingClientRect();
            if (rect) {
                env.companionSpecialAnchorX = rect.left + rect.width / 2;
                env.companionSpecialAnchorY = rect.top + rect.height / 2;
            }
        }
        env.companionSpecial = type;
        syncCompanionSpecialClasses();
        if (type === 'levitating') {
            env.companionSpecialEndTimer = setTimeout(() => {
                env.companionSpecial = 'landing';
                syncCompanionSpecialClasses();
                env.companionSpecialEndTimer = setTimeout(() => clearCompanionSpecial(), 2500);
            }, 8000);
            return;
        }
        env.companionSpecialEndTimer = setTimeout(() => clearCompanionSpecial(), 5000);
    }

    function scheduleCompanionSpecial() {
        if (env.companionSpecialTimer) clearTimeout(env.companionSpecialTimer);
        env.companionSpecialTimer = setTimeout(() => {
            env.companionSpecialTimer = null;
            const id = player.companion.skin;
            const special = id === 'phantooze' ? 'materialized' : (id === 'voidpuddle' ? 'levitating' : (id === 'sunpudding' ? 'sun-glow' : ''));
            if (special && !player.companion.sleeping && !env.companionPetting && Math.random() < 0.55) startCompanionSpecial(special);
            else scheduleCompanionSpecial();
        }, player.companion.skin === 'voidpuddle' ? 40000 : (25000 + Math.random() * 10000));
    }

    function companionBuffText() {
        const def = companionSkinDef();
        if (!def) return 'Нет бонуса';
        return petBuffText(def, 1 + Math.min(0.6, (player.companion.level - 1) * 0.04));
    }

    function companionStatHTML(type, label, value, color, symbol) {
        const safe = Math.round(Math.max(0, Math.min(100, value)));
        const tone = safe <= 15 ? 'is-critical' : (safe <= 35 ? 'is-low' : '');
        return `<div class="companion-stat ${type} ${tone}"><span class="companion-stat-icon">${symbol}</span><div><b>${label}</b><i><em style="width:${safe}%; --meter-color:${color}"></em></i></div><strong>${safe}%</strong></div>`;
    }

    function applyCompanionDirt(root, clean) {
        const safeClean = Math.round(Math.max(0, Math.min(100, clean)));
        const dirtSteps = safeClean < 50 ? Math.min(10, Math.floor((50 - safeClean) / 5) + 1) : 0;
        const level = dirtSteps / 10;
        root.style.setProperty('--dirt-opacity', (level * 0.72).toFixed(2));
        root.style.setProperty('--dirt-scale', (0.55 + level * 0.7).toFixed(2));
        [40, 35, 30, 20, 10].forEach((threshold, index) => {
            root.style.setProperty(`--fly-${index + 1}`, safeClean <= threshold ? '1' : '0');
        });
    }

    function createCompanionSplash(habitat, x, y) {
        const splash = document.createElement('i');
        splash.className = 'companion-water-splash';
        splash.style.left = `${x}px`;
        splash.style.top = `${y}px`;
        habitat.appendChild(splash);
        setTimeout(() => splash.remove(), 420);
    }

    function applyCompanionWashDrop() {
        const now = Date.now();
        const wasFullyClean = player.companion.clean >= 100;
        const cleanGain = Math.random() < 0.65 ? 1 : 2;
        player.companion.clean = Math.min(100, player.companion.clean + cleanGain);
        if (!wasFullyClean && player.companion.clean >= 100) {
            player.companion.cleanGraceUntil = now + 5000;
            player.companion.cleanClock = 0;
        }
        renderCompanionVitals();
    }

    function renderCompanionVitals() {
        const root = document.getElementById('companion-panel');
        if (!root) return;
        updateCompanionState();
        const pet = player.companion;
        const stats = [
            ['satiety', pet.hunger],
            ['clean', pet.clean],
            ['energy', pet.energy]
        ];
        stats.forEach(([type, value]) => {
            const row = root.querySelector(`.companion-stat.${type}`);
            if (!row) return;
            const safe = Math.round(Math.max(0, Math.min(100, value)));
            row.classList.toggle('is-low', safe > 15 && safe <= 35);
            row.classList.toggle('is-critical', safe <= 15);
            const fill = row.querySelector('i em');
            const text = row.querySelector('strong');
            if (fill) fill.style.width = `${safe}%`;
            if (text) text.textContent = `${safe}%`;
        });
        const mood = companionMood();
        const stage = document.getElementById('companion-stage');
        if (stage) {
            ['sad', 'neutral', 'joyful', 'happy', 'sleeping'].forEach(name => stage.classList.remove(`mood-${name}`));
            stage.classList.add(`mood-${mood}`);
            applyCompanionFace(stage, companionSkinDef(), mood);
        }
        root.classList.toggle('is-sleeping', pet.sleeping);
        root.classList.toggle('is-dirty', pet.clean < 35);
        applyCompanionDirt(root, pet.clean);
        const sleepBtn = document.getElementById('companion-sleep-btn');
        if (sleepBtn) sleepBtn.querySelector('b').textContent = pet.sleeping ? 'Разбудить' : 'Спать';
        const feedBtn = root.querySelector('.companion-action.feed');
        const washBtn = root.querySelector('.companion-action.wash');
        if (feedBtn) feedBtn.disabled = pet.sleeping;
        if (washBtn) washBtn.disabled = pet.sleeping;
        const sleepNote = document.getElementById('companion-sleep-note');
        if (sleepNote) sleepNote.style.display = pet.sleeping ? 'block' : 'none';
    }

    function companionFoodValue(crop) {
        if (!crop) return 0;
        const value = Math.max(1, Number(crop.value) || cropSaleValue(crop.plantId, crop.mutations, crop.weight));
        return Math.max(8, Math.min(65, Math.round(5 + Math.log10(value + 10) * 10)));
    }

    function companionSkinStars(def) {
        const rarity = def?.rarity || 'common';
        const count = (PET_RARITY_STYLE[rarity] || PET_RARITY_STYLE.common).stars || 1;
        return `<span class="companion-skin-stars" aria-label="${count} звезд">${'★'.repeat(count)}</span>`;
    }

    function renderCompanion() {
        const root = document.getElementById('companion-panel');
        if (!root) return;
        updateCompanionState();
        const pet = player.companion;
        const def = companionSkinDef();
        const basicDef = { id: 'basic', rarity: 'common', face: 'happy', slime: { body: '#72db68', shade: '#35a84c', blush: '#ffc1cf', decor: 'none' } };
        const mood = companionMood();
        const renderedDef = { ...(def || basicDef), face: companionFaceForMood(def || basicDef, mood) };
        const growth = 0.45 + ((pet.level - 1) / 29) * 1.05;
        const need = companionXpNeed();
        root.classList.toggle('is-sleeping', pet.sleeping);
        root.classList.toggle('is-dirty', pet.clean < 35);
        applyCompanionDirt(root, pet.clean);
        root.classList.toggle('is-shower-mode', !!env.companionShower);
        const nameButton = document.getElementById('companion-name');
        const editMark = document.createElement('span');
        editMark.setAttribute('aria-hidden', 'true');
        editMark.textContent = '✎';
        nameButton.replaceChildren(document.createTextNode(`${pet.name} `), editMark);
        document.getElementById('companion-level').textContent = pet.level;
        const stage = document.getElementById('companion-stage');
        stage.style.setProperty('--companion-growth', growth.toFixed(3));
        stage.className = `companion-stage skin-${def?.id || 'basic'} mood-${mood}`;
        stage.classList.toggle('is-tapped', !!env.companionTapTimer);
        stage.classList.toggle('is-petting', !!env.companionPetting);
        if ((env.companionPointerId === null && !env.companionTapTimer) || !stage.querySelector('.slime-pet')) {
            stage.innerHTML = `<span class="companion-mood-aura" aria-hidden="true"></span>${slimeHTML(renderedDef, {}, 'featured')}`;
        }
        applyCompanionFace(stage, def || basicDef, mood);
        syncCompanionSpecialClasses();
        document.getElementById('companion-xp-label').textContent = pet.level >= 30 ? 'МАКС. УРОВЕНЬ' : `${Math.floor(pet.xp)} / ${need} XP`;
        document.getElementById('companion-xp-fill').style.width = `${pet.level >= 30 ? 100 : Math.min(100, pet.xp / need * 100)}%`;
        document.getElementById('companion-skin-name').textContent = def ? (def.shortName || def.name) : 'Базовый';
        document.getElementById('companion-buff').textContent = companionBuffText();
        document.getElementById('companion-stats').innerHTML = [
            companionStatHTML('satiety', 'Сытость', pet.hunger, '#ef9c39', '●'),
            companionStatHTML('clean', 'Чистота', pet.clean, '#42bde9', '◆'),
            companionStatHTML('energy', 'Бодрость', pet.energy, '#8a73df', '◐')
        ].join('');
        const sleepBtn = document.getElementById('companion-sleep-btn');
        sleepBtn.querySelector('b').textContent = pet.sleeping ? 'Разбудить' : 'Спать';
        root.querySelector('.companion-action.feed').disabled = pet.sleeping;
        root.querySelector('.companion-action.wash').disabled = pet.sleeping;
        document.getElementById('companion-wash-btn').classList.toggle('active', !!env.companionShower);
        renderCompanionDrawer();
    }

    function renderCompanionDrawer() {
        const drawer = document.getElementById('companion-drawer');
        if (!drawer) return;
        if (!env.companionDrawer) {
            drawer.className = 'companion-drawer';
            drawer.innerHTML = '';
            return;
        }
        drawer.className = 'companion-drawer open';
        if (env.companionDrawer === 'feed') {
            const ready = readyCropsForShowcase();
            drawer.innerHTML = `<div class="companion-drawer-head"><span><b>Чем угостить?</b><small>Урожай исчезнет с грядки</small></span><button type="button" onclick="closeCompanionDrawer()">×</button></div><div class="companion-feed-list">${ready.length ? ready.map(item => {
                const food = companionFoodValue(item.crop);
                return `<button class="companion-feed-card" type="button" onclick="feedCompanion(${item.tileId})">
                    ${showcaseCropHTML(item.crop)}
                    <strong>+${food} сытости</strong>
                </button>`;
            }).join('') : '<div class="companion-empty"><b>Нет готового урожая</b><small>Вырастите растение на грядке</small></div>'}</div>`;
            return;
        }
        const rarityOrder = { common: 0, rare: 1, legendary: 2, secret: 3 };
        const skinIds = ['basic', ...Object.keys(PET_DEFS).sort((a, b) => {
            const rankA = rarityOrder[PET_DEFS[a]?.rarity] ?? 99;
            const rankB = rarityOrder[PET_DEFS[b]?.rarity] ?? 99;
            return rankA - rankB;
        })];
        drawer.innerHTML = `<div class="companion-drawer-head"><span><b>Облики</b><small>Выберите внешний вид и бонус</small></span><button type="button" onclick="closeCompanionDrawer()">×</button></div><div class="companion-skin-list">${skinIds.map(id => {
            const def = PET_DEFS[id];
            const selected = player.companion.skin === id;
            const previewDef = def || { rarity: 'common', face: 'happy', slime: { body: '#72db68', shade: '#35a84c', blush: '#ffc1cf', decor: 'none' } };
            const rarity = def?.rarity || 'common';
            return `<article class="companion-skin-card rarity-${rarity} ${selected ? 'selected' : ''}">
                <div class="companion-skin-preview">${slimeHTML(previewDef, {}, 'inventory')}</div>
                <div class="companion-skin-copy"><b>${def ? def.name : 'Базовый слайм'}</b>${companionSkinStars(previewDef)}<small>${def ? petBuffText(def, 1) : 'Без бонуса'}</small></div>
                <button type="button" onclick="selectCompanionSkin('${id}')" ${selected ? 'disabled' : ''}>${selected ? 'Выбран' : 'Выбрать'}</button>
            </article>`;
        }).join('')}</div>`;
    }

    function toggleCompanionFeed() {
        if (player.companion.sleeping) return;
        env.companionDrawer = env.companionDrawer === 'feed' ? '' : 'feed';
        renderCompanion();
    }

    function toggleCompanionSkins() {
        env.companionDrawer = env.companionDrawer === 'skins' ? '' : 'skins';
        renderCompanion();
    }

    function closeCompanionDrawer() {
        env.companionDrawer = '';
        renderCompanionDrawer();
    }

    function feedCompanion(tileId) {
        updateCompanionState();
        if (player.companion.sleeping) return;
        const crop = cropSnapshotFromTile(tileId);
        if (!crop) {
            showToast('Этот урожай уже недоступен', '#ff7675');
            renderCompanion();
            return;
        }
        const food = companionFoodValue(crop);
        const xpGain = Math.max(8, Math.min(42, Math.round(Math.log10((crop.value || 0) + 10) * 11)));
        player.companion.hunger = Math.min(100, player.companion.hunger + food);
        player.companion.xp += xpGain;
        recordCropStats(crop, 0, true);
        clearTile(tileId);
        while (player.companion.level < 30 && player.companion.xp >= companionXpNeed()) {
            player.companion.xp -= companionXpNeed();
            player.companion.level++;
            showToast(`${player.companion.name}: новый уровень!`, '#72db68');
        }
        env.companionDrawer = '';
        sfx.play('pop');
        updateUI();
        saveGame();
    }

    function stopCompanionShower() {
        env.companionPointerDown = false;
        env.companionPointer = null;
        if (env.companionShowerTimer) clearInterval(env.companionShowerTimer);
        env.companionShowerTimer = null;
        const cursor = document.getElementById('companion-shower-cursor');
        if (cursor) cursor.classList.remove('visible');
    }

    function toggleCompanionShower() {
        updateCompanionState();
        if (player.companion.sleeping) return;
        env.companionShower = !env.companionShower;
        env.companionDrawer = '';
        stopCompanionInteraction();
        stopCompanionShower();
        renderCompanion();
        if (env.companionShower) showToast('Зажмите лейку над слаймом', '#42bde9');
    }

    function updateCompanionPointer(event) {
        const habitat = document.getElementById('companion-habitat');
        if (!habitat) return;
        const rect = habitat.getBoundingClientRect();
        env.companionPointer = { clientX: event.clientX, clientY: event.clientY, x: event.clientX - rect.left, y: event.clientY - rect.top };
        const cursor = document.getElementById('companion-shower-cursor');
        if (cursor) {
            cursor.style.left = `${env.companionPointer.x}px`;
            cursor.style.top = `${env.companionPointer.y}px`;
            cursor.classList.add('visible');
        }
    }

    function companionShowerTick() {
        if (!env.companionShower || !env.companionPointerDown || !env.companionPointer) return;
        const habitat = document.getElementById('companion-habitat');
        const slime = document.querySelector('#companion-stage .slime-pet');
        if (!habitat || !slime) return;
        const point = env.companionPointer;
        const drop = document.createElement('i');
        drop.className = 'companion-water-drop';
        const dropX = point.x + (Math.random() * 14 - 7);
        const dropStartY = point.y + 12;
        const dropTravel = 86;
        drop.style.left = `${dropX}px`;
        drop.style.top = `${dropStartY}px`;
        habitat.appendChild(drop);
        const habitatRect = habitat.getBoundingClientRect();
        const slimeRect = slime.getBoundingClientRect();
        const dropClientX = habitatRect.left + dropX;
        const dropStartClientY = habitatRect.top + dropStartY;
        const dropEndClientY = dropStartClientY + dropTravel;
        const crossesSlime = dropStartClientY <= slimeRect.bottom && dropEndClientY >= slimeRect.top;
        const hitsSlime = dropClientX >= slimeRect.left - 10 && dropClientX <= slimeRect.right + 10 && crossesSlime;
        if (!hitsSlime) {
            setTimeout(() => drop.remove(), 540);
            return;
        }
        const slimeTop = slimeRect.top - habitatRect.top;
        const hitDistance = Math.max(0, slimeTop - dropStartY + 4);
        const hitDelay = Math.max(50, Math.min(500, (hitDistance / dropTravel) * 520));
        setTimeout(() => {
            drop.remove();
            createCompanionSplash(habitat, dropX, Math.max(dropStartY + 8, slimeTop + 5));
            applyCompanionWashDrop();
        }, hitDelay);
    }

    function companionPointerDown(event) {
        if (player.companion.sleeping || event.isPrimary === false || (event.pointerType === 'mouse' && event.button !== 0)) return;
        if (!env.companionShower) {
            beginCompanionInteraction(event);
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        updateCompanionPointer(event);
        env.companionPointerDown = true;
        event.currentTarget.setPointerCapture?.(event.pointerId);
        companionShowerTick();
        if (env.companionShowerTimer) clearInterval(env.companionShowerTimer);
        env.companionShowerTimer = setInterval(companionShowerTick, 120);
    }

    function companionPointerMove(event) {
        if (!env.companionShower) {
            moveCompanionInteraction(event);
            return;
        }
        if (env.companionPointerDown) {
            event.preventDefault();
            event.stopPropagation();
        }
        updateCompanionPointer(event);
    }

    function companionPointerUp(event) {
        if (!env.companionShower) {
            endCompanionInteraction(event);
            return;
        }
        event.preventDefault();
        stopCompanionShower();
        saveGame();
    }

    function companionPointerCancel(event) {
        if (env.companionShower) {
            stopCompanionShower();
            return;
        }
        if (env.companionPointerId === event.pointerId) stopCompanionInteraction();
    }

    function companionPointerLeave(event) {
        if (!env.companionShower && env.companionPointerId === event.pointerId) {
            stopCompanionInteraction();
            return;
        }
        if (!env.companionPointerDown) {
            const cursor = document.getElementById('companion-shower-cursor');
            if (cursor) cursor.classList.remove('visible');
        }
    }

    function toggleCompanionSleep() {
        updateCompanionState();
        env.companionShower = false;
        clearCompanionSpecial();
        stopCompanionInteraction();
        stopCompanionShower();
        player.companion.sleeping = !player.companion.sleeping;
        player.companion.energyClock = 0;
        env.companionDrawer = '';
        sfx.play('pop');
        renderCompanion();
        saveGame();
    }

    function renameCompanion() {
        const next = window.prompt('Как зовут вашего слайма?', player.companion.name);
        if (next === null) return;
        const name = next.trim().slice(0, 14);
        if (!name) {
            showToast('Введите имя', '#ff7675');
            return;
        }
        player.companion.name = name;
        renderCompanion();
        saveGame();
    }

    function selectCompanionSkin(id) {
        if (id !== 'basic' && !PET_DEFS[id]) return;
        clearCompanionSpecial(false);
        player.companion.skin = id;
        env.companionDrawer = '';
        sfx.play('pop');
        renderCompanion();
        scheduleCompanionSpecial();
        saveGame();
    }

    function companionInteractionZone() {
        const habitat = document.getElementById('companion-habitat');
        const slime = document.querySelector('#companion-stage .slime-pet');
        if (!habitat || !slime || player.companion.sleeping) return null;
        const room = habitat.getBoundingClientRect();
        const size = Math.min(140, room.width - 12, room.height - 12);
        const slimeRect = slime.getBoundingClientRect();
        const hasFixedAnchor = player.companion.skin === 'voidpuddle'
            && (env.companionSpecial === 'levitating' || env.companionSpecial === 'landing')
            && env.companionSpecialAnchorX > 0;
        const rawX = hasFixedAnchor ? env.companionSpecialAnchorX : slimeRect.left + slimeRect.width / 2;
        const rawY = hasFixedAnchor ? env.companionSpecialAnchorY : slimeRect.top + slimeRect.height / 2;
        return {
            left: Math.max(room.left + 6, rawX - size / 2),
            right: Math.min(room.right - 6, rawX + size / 2),
            top: Math.max(room.top + 6, rawY - size / 2),
            bottom: Math.min(room.bottom - 6, rawY + size / 2)
        };
    }

    function companionZoneContact(clientX, clientY) {
        const zone = companionInteractionZone();
        return !!zone && clientX >= zone.left && clientX <= zone.right && clientY >= zone.top && clientY <= zone.bottom;
    }

    function companionHabitatContact(clientX, clientY) {
        const habitat = document.getElementById('companion-habitat');
        if (!habitat) return false;
        const rect = habitat.getBoundingClientRect();
        return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
    }

    function setCompanionPetting(active) {
        env.companionPetting = active;
        const stage = document.getElementById('companion-stage');
        if (stage) stage.classList.toggle('is-petting', active);
    }

    function stopCompanionInteraction() {
        if (env.companionHoldTimer) clearTimeout(env.companionHoldTimer);
        if (env.companionHeartTimer) clearInterval(env.companionHeartTimer);
        env.companionHoldTimer = null;
        env.companionHeartTimer = null;
        env.companionPointerId = null;
        env.companionPointerStartedInZone = false;
        env.companionPointerStartX = 0;
        env.companionPointerStartY = 0;
        env.companionPointerLastX = 0;
        env.companionPointerLastY = 0;
        env.companionPointerStartedAt = 0;
        setCompanionPetting(false);
    }

    function triggerCompanionTap() {
        const stage = document.getElementById('companion-stage');
        if (!stage || player.companion.sleeping) return;
        if (player.companion.skin === 'voidpuddle' && env.companionSpecial) clearCompanionSpecial();
        setCompanionPetting(false);
        stage.classList.remove('is-tapped');
        void stage.offsetWidth;
        stage.classList.add('is-tapped');
        sfx.play('blop', 'companion-tap');
        if (env.companionTapTimer) clearTimeout(env.companionTapTimer);
        env.companionTapTimer = setTimeout(() => {
            env.companionTapTimer = null;
            stage.classList.remove('is-tapped');
            if (env.companionPointerId === null) renderCompanion();
        }, 360);
    }

    function emitCompanionHeart() {
        if (!env.companionPetting || !companionZoneContact(env.companionPointerLastX, env.companionPointerLastY)) return;
        const stage = document.getElementById('companion-stage');
        const slime = stage?.querySelector('.slime-pet');
        if (!stage || !slime) return;
        const stageRect = stage.getBoundingClientRect();
        const slimeRect = slime.getBoundingClientRect();
        const heart = document.createElement('span');
        heart.className = 'companion-heart';
        heart.textContent = '♥';
        heart.style.left = `${slimeRect.left + slimeRect.width / 2 - stageRect.left}px`;
        heart.style.top = `${slimeRect.top + slimeRect.height * .42 - stageRect.top}px`;
        heart.style.setProperty('--heart-x', `${Math.round((Math.random() - .5) * 100)}px`);
        heart.style.setProperty('--heart-y', `${Math.round(-42 - Math.random() * 48)}px`);
        heart.style.setProperty('--heart-rotate', `${Math.round((Math.random() - .5) * 55)}deg`);
        heart.style.setProperty('--heart-scale', `${(.75 + Math.random() * .65).toFixed(2)}`);
        stage.appendChild(heart);
        setTimeout(() => heart.remove(), 900);
        const now = Date.now();
        if (now - env.companionHeartLastSoundAt >= 360) {
            env.companionHeartLastSoundAt = now;
            sfx.play('pop');
        }
    }

    function startCompanionPetting() {
        if (env.companionPetting || env.companionPointerId === null) return;
        if (env.companionHoldTimer) clearTimeout(env.companionHoldTimer);
        env.companionHoldTimer = null;
        const stage = document.getElementById('companion-stage');
        if (env.companionTapTimer) clearTimeout(env.companionTapTimer);
        env.companionTapTimer = null;
        stage?.classList.remove('is-tapped');
        setCompanionPetting(true);
        emitCompanionHeart();
        env.companionHeartTimer = setInterval(emitCompanionHeart, 170);
    }

    function beginCompanionInteraction(event) {
        if (env.companionPointerId !== null) return;
        event.preventDefault();
        event.stopPropagation();
        const startedInZone = companionZoneContact(event.clientX, event.clientY);
        env.companionPointerId = event.pointerId;
        env.companionPointerStartedInZone = startedInZone;
        env.companionPointerStartX = event.clientX;
        env.companionPointerStartY = event.clientY;
        env.companionPointerLastX = event.clientX;
        env.companionPointerLastY = event.clientY;
        env.companionPointerStartedAt = Date.now();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        if (startedInZone) {
            triggerCompanionTap();
            env.companionHoldTimer = setTimeout(() => {
                if (env.companionPointerId === event.pointerId && companionZoneContact(env.companionPointerLastX, env.companionPointerLastY)) startCompanionPetting();
            }, 190);
        }
    }

    function moveCompanionInteraction(event) {
        if (env.companionPointerId !== event.pointerId) return;
        event.preventDefault();
        env.companionPointerLastX = event.clientX;
        env.companionPointerLastY = event.clientY;
        if (!companionHabitatContact(event.clientX, event.clientY)) {
            stopCompanionInteraction();
            return;
        }
        const inZone = companionZoneContact(event.clientX, event.clientY);
        if (env.companionPetting) {
            document.getElementById('companion-stage')?.classList.toggle('is-petting', inZone);
            return;
        }
        const distance = Math.hypot(event.clientX - env.companionPointerStartX, event.clientY - env.companionPointerStartY);
        if (inZone && (!env.companionPointerStartedInZone || distance >= 8 || Date.now() - env.companionPointerStartedAt >= 190)) {
            startCompanionPetting();
        }
    }

    function endCompanionInteraction(event) {
        if (env.companionPointerId !== event.pointerId) return;
        event.preventDefault();
        stopCompanionInteraction();
    }

    function renderShowcase() {
        if (!Array.isArray(player.showcase)) player.showcase = [null, null, null];
        player.showcase = [player.showcase[0] || null, player.showcase[1] || null, player.showcase[2] || null];
        const area = document.getElementById('showcase-section');
        const areaLock = document.getElementById('showcase-area-lock');
        const areaLockText = document.getElementById('showcase-area-lock-text');
        const slots = document.getElementById('showcase-slots');
        const rate = document.getElementById('showcase-rate');
        const bank = document.getElementById('bank-coins');
        if (!slots || !rate || !bank || !area || !areaLock || !areaLockText) return;

        const showcaseOpen = isShowcaseUnlocked();
        area.classList.toggle('locked', !showcaseOpen);
        areaLock.style.display = showcaseOpen ? 'none' : 'flex';
        areaLockText.textContent = `Нужен уровень ${getShowcaseUnlockLevel()}`;

        slots.innerHTML = player.showcase.map((crop, slot) => {
            const slotOpen = isShowcaseUnlocked(slot);
            if (!slotOpen) {
                return `<div class="showcase-slot locked-slot" aria-disabled="true">
                    <div class="showcase-slot-lock">
                        <span class="showcase-lock-icon small" aria-hidden="true"></span>
                        <b>Слот ${slot + 1}</b>
                        <small>ур. ${getShowcaseUnlockLevel(slot)}</small>
                    </div>
                </div>`;
            }
            if (!crop || !PLANTS[crop.plantId]) {
                return `<button class="showcase-slot empty" type="button" onclick="openShowcasePicker(${slot})">
                    <span class="showcase-plus" aria-hidden="true"></span>
                    <small>Поставить</small>
                </button>`;
            }
            const p = PLANTS[crop.plantId];
            const weight = formatWeight(crop.weight || 5);
            return `<div class="showcase-slot filled ${crop.sizeTier || 'normal'}">
                ${showcaseCropHTML(crop)}
                <div class="showcase-crop-name">${p.name}</div>
                <div class="showcase-crop-weight">${weight}кг</div>
                <div class="showcase-crop-income">+${compactNumber(showcaseIncome(crop))}/ч</div>
                <button class="showcase-sell" type="button" onclick="sellShowcaseCrop(${slot})">Продать</button>
            </div>`;
        }).join('');

        rate.textContent = `+${compactNumber(totalShowcaseIncome())}/ч`;
        bank.textContent = compactNumber(player.bank || 0);
    }

    function readyCropsForShowcase() {
        return tiles
            .filter(t => t.active && t.growth >= 100)
            .map(t => ({ tileId: t.id, crop: cropSnapshotFromTile(t.id) }))
            .filter(item => item.crop)
            .sort((a, b) => (b.crop.value || 0) - (a.crop.value || 0));
    }

    function openShowcasePicker(slot) {
        const picker = document.getElementById('showcase-picker');
        if (!picker) return;
        if (!isShowcaseUnlocked()) {
            showToast(`Витрина откроется на ${getShowcaseUnlockLevel()} уровне`, '#a29bfe');
            return;
        }
        if (!isShowcaseUnlocked(slot)) {
            showToast(`Слот откроется на ${getShowcaseUnlockLevel(slot)} уровне`, '#a29bfe');
            return;
        }
        const ready = readyCropsForShowcase();
        if (ready.length === 0) {
            picker.innerHTML = `<div class="showcase-picker-box"><b>У вас нет готового урожая</b><small>Вырастите растение до 100%, потом вернитесь к витрине.</small></div>`;
            return;
        }

        picker.innerHTML = `<div class="showcase-picker-box">
            <div class="showcase-picker-head">
                <b>Выберите урожай</b>
                <button type="button" onclick="closeShowcasePicker()">×</button>
            </div>
            <div class="showcase-ready-list">
                ${ready.map(item => {
                    const p = PLANTS[item.crop.plantId];
                    return `<button class="showcase-ready-item" type="button" onclick="addReadyCropToShowcase(${slot}, ${item.tileId})">
                        ${showcaseCropHTML(item.crop)}
                        <span><b>${p.name}</b><small>${formatWeight(item.crop.weight)}кг · +${compactNumber(showcaseIncome(item.crop))}/ч</small></span>
                    </button>`;
                }).join('')}
            </div>
        </div>`;
    }

    function closeShowcasePicker() {
        const picker = document.getElementById('showcase-picker');
        if (picker) picker.innerHTML = '';
    }

    function addReadyCropToShowcase(slot, tileId) {
        if (!isShowcaseUnlocked()) {
            showToast(`Витрина откроется на ${getShowcaseUnlockLevel()} уровне`, '#a29bfe');
            return;
        }
        if (!isShowcaseUnlocked(slot)) {
            showToast(`Слот откроется на ${getShowcaseUnlockLevel(slot)} уровне`, '#a29bfe');
            return;
        }
        const crop = cropSnapshotFromTile(tileId);
        if (!crop) {
            showToast("Урожай еще не готов", "#ff7675");
            return;
        }
        recordCropStats(crop, 0, true);
        player.showcase[slot] = crop;
        clearTile(tileId);
        closeShowcasePicker();
        sfx.play('coin');
        showToast("Растение добавлено в витрину", "#f1c40f");
        updateUI();
        saveGame();
    }

    function sellShowcaseCrop(slot) {
        if (!isShowcaseUnlocked()) {
            showToast(`Витрина откроется на ${getShowcaseUnlockLevel()} уровне`, '#a29bfe');
            return;
        }
        if (!isShowcaseUnlocked(slot)) {
            showToast(`Слот откроется на ${getShowcaseUnlockLevel(slot)} уровне`, '#a29bfe');
            return;
        }
        const crop = player.showcase && player.showcase[slot];
        if (!crop) return;
        player.coins += crop.value || 0;
        ensureStats();
        player.stats.totalEarned += Math.max(0, Math.floor(crop.value || 0));
        player.stats.bestSale = Math.max(player.stats.bestSale, Math.floor(crop.value || 0));
        player.showcase[slot] = null;
        closeShowcasePicker();
        sfx.play('coin');
        showToast(`Продано за ${compactNumber(crop.value || 0)}$`, "#f1c40f");
        updateUI();
        saveGame();
    }

    function toggleMenuSection(section) {
        env.openMenuSections[section] = !env.openMenuSections[section];
        const panel = document.getElementById(`${section}-section`);
        const mark = document.getElementById(`${section}-fold-mark`);
        if (panel) panel.classList.toggle('open', !!env.openMenuSections[section]);
        if (mark) mark.textContent = env.openMenuSections[section] ? '−' : '＋';
        if (section === 'diary' && env.openMenuSections[section]) renderDiary();
        if (section === 'showcase' && env.openMenuSections[section]) renderShowcase();
        if (section === 'decor' && env.openMenuSections[section]) renderDecorShop();
        if (section === 'rewards' && env.openMenuSections[section]) renderRewards();
    }

    function renderRewards() {
        ensureRewardsState();
        normalizeTimedRewards();
        const root = document.getElementById('rewards-content');
        if (!root) return;
        const nextDailyIndex = getDailyRewardIndex();
        const dailyReady = canClaimDailyReward();
        const waitingForNextDay = !dailyReady && !!player.rewards.dailyLastClaimAt;
        const dailyIndex = waitingForNextDay
            ? (nextDailyIndex + DAILY_REWARDS.length - 1) % DAILY_REWARDS.length
            : nextDailyIndex;
        const dailyLeft = getDailyRewardRemainingMs();
        const timedCooldown = Math.max(0, player.rewards.timedCooldownUntil - Date.now());
        const dailyHeadText = dailyReady
            ? 'Возьми подарок!'
            : `Следующая награда через ${formatRewardCountdown(dailyLeft)}`;

        root.innerHTML = `
            <div class="reward-block daily-block">
                <div class="reward-block-head">
                    <div><b>Ежедневные подарки</b><small>${dailyHeadText}</small></div>
                    <span class="reward-streak">День ${dailyIndex + 1}</span>
                </div>
                <div class="daily-rewards-grid">
                    ${DAILY_REWARDS.map((reward, index) => {
                        const claimed = TEST_UNLOCK_ALL_REWARDS
                            ? !!player.rewards.dailyTestClaimed?.[index]
                            : (waitingForNextDay ? index <= dailyIndex : index < dailyIndex);
                        const current = index === dailyIndex;
                        const claimable = TEST_UNLOCK_ALL_REWARDS
                            ? !claimed
                            : (index === nextDailyIndex && dailyReady);
                        const locked = !claimed && !claimable;
                        return `<button type="button" class="daily-reward-card rarity-${reward.rarity || 'common'} ${reward.ultra ? 'ultra' : ''} ${claimed ? 'claimed' : ''} ${current ? 'current' : ''} ${claimable ? 'claimable' : ''} ${locked ? 'locked' : ''}" style="--card-accent:${reward.accent}" ${claimable ? `onclick="claimDailyReward(${index}, this)"` : 'disabled'}>
                            <span class="daily-day">День ${index + 1}</span>
                            <div class="daily-icon ${reward.ultra ? 'silhouette' : ''}">${reward.icon}</div>
                            <div class="daily-copy"><b>${reward.title}</b></div>
                            ${reward.ultra ? '<div class="ultra-stars" aria-label="5 звезд">★★★★★</div>' : ''}
                            ${claimed ? '<span class="reward-state received">Получено</span>' : claimable ? '<span class="reward-state ready">Забрать</span>' : '<span class="reward-lock">🔒</span>'}
                        </button>`;
                    }).join('')}
                </div>
            </div>
            <div class="reward-block timed-block">
                <div class="reward-block-head">
                    <div><b>Подарки за время</b><small>${player.rewards.timedCooldownUntil ? `Новая серия через ${formatRewardCountdown(timedCooldown)}` : 'Каждые 10 минут открывается новый подарок'}</small></div>
                    <span class="reward-streak">${player.rewards.timedCooldownUntil ? 'Перерыв' : '4 подарка'}</span>
                </div>
                <div class="timed-rewards-grid">
                    ${TIMED_REWARDS.map((reward, index) => {
                        const claimed = !!player.rewards.timedClaimed[index];
                        const claimable = TEST_UNLOCK_ALL_REWARDS ? !claimed : canClaimTimedReward(index);
                        const remaining = getTimedRewardUnlockMs(index);
                        const label = claimed ? 'Открыт' : claimable ? 'Открыть' : formatRewardCountdown(remaining);
                        return `<button type="button" class="timed-reward-card ${reward.rare ? 'rare' : ''} ${claimed ? 'claimed' : ''} ${claimable ? 'claimable' : ''} ${!claimed && !claimable ? 'locked' : ''}" ${claimable ? `onclick="claimTimedReward(${index}, this)"` : 'disabled'}>
                            <div class="timed-gift"><div class="timed-gift-lid"></div><div class="timed-gift-box">${reward.icon}</div></div>
                            <div class="timed-copy"><b>${reward.title}</b><small>${label}</small></div>
                            ${claimed ? '<span class="timed-check">✓</span>' : ''}
                        </button>`;
                    }).join('')}
                </div>
            </div>
        `;
    }

    function claimDailyReward(index, button) {
        ensureRewardsState();
        if (TEST_UNLOCK_ALL_REWARDS) {
            if (player.rewards.dailyTestClaimed?.[index]) return;
            const reward = DAILY_REWARDS[index];
            if (!reward) return;
            const rewardView = reward.claim();
            if (rewardView?.blocked) {
                showToast(rewardView.message || 'Освободи место', '#ff7675');
                return;
            }
            player.rewards.dailyTestClaimed[index] = true;
            if (button) {
                button.classList.remove('gift-opened');
                void button.offsetWidth;
                button.classList.add('gift-opened');
            }
            sfx.play('mut');
            if (!rewardView?.skipPop) showRewardPop(rewardView || { title: reward.title, accent: reward.accent, icon: reward.icon });
            updateUI();
            saveGame();
            return;
        }
        const rewardIndex = getDailyRewardIndex();
        if (index !== rewardIndex || !canClaimDailyReward()) return;
        const reward = DAILY_REWARDS[rewardIndex];
        if (!reward) return;
        const rewardView = reward.claim();
        if (rewardView?.blocked) {
            showToast(rewardView.message || 'Освободи место', '#ff7675');
            return;
        }
        if (button) {
            button.classList.remove('gift-opened');
            void button.offsetWidth;
            button.classList.add('gift-opened');
        }
        player.rewards.dailyClaimed += 1;
        player.rewards.dailyLastClaimAt = Date.now();
        sfx.play('mut');
        if (!rewardView?.skipPop) showRewardPop(rewardView || { title: reward.title, accent: reward.accent, icon: reward.icon });
        updateUI();
        saveGame();
    }

    function claimTimedReward(index, button) {
        ensureRewardsState();
        normalizeTimedRewards();
        if (!TEST_UNLOCK_ALL_REWARDS && !canClaimTimedReward(index)) return;
        if (TEST_UNLOCK_ALL_REWARDS && player.rewards.timedClaimed[index]) return;
        const reward = TIMED_REWARDS[index];
        if (!reward) return;
        const rewardView = reward.claim();
        if (rewardView?.blocked) {
            showToast(rewardView.message || 'Освободи место', '#ff7675');
            return;
        }
        player.rewards.timedClaimed[index] = true;
        if (!TEST_UNLOCK_ALL_REWARDS && player.rewards.timedClaimed.every(Boolean)) {
            player.rewards.timedCooldownUntil = Date.now() + TIMED_REWARD_COOLDOWN;
        }
        if (button) {
            button.classList.remove('gift-opened');
            void button.offsetWidth;
            button.classList.add('gift-opened');
        }
        sfx.play('pop');
        if (!rewardView?.skipPop) showRewardPop(rewardView || { title: reward.title, accent: reward.accent, icon: reward.icon });
        updateUI();
        saveGame();
    }

    function diaryEntries() {
        return [
            ...Object.values(MUTATIONS).map(m => ({ id: m.id, name: m.name, icon: m.icon, mult: `x${m.mult}` })),
            SIZE_DIARY_ENTRIES.big,
            SIZE_DIARY_ENTRIES.huge
        ];
    }

    function renderDiary() {
        ensureStats();
        const statsEl = document.getElementById('diary-stats');
        const mutsEl = document.getElementById('diary-mutations');
        if (!statsEl || !mutsEl) return;

        statsEl.innerHTML = `
            <div class="diary-stat tone-coins"><span>$</span><strong>${compactNumber(player.stats.totalEarned)}</strong><small>Всего заработано</small></div>
            <div class="diary-stat tone-weight"><span>⚖</span><strong>${formatWeight(player.stats.maxWeight)}кг</strong><small>Лучший вес</small></div>
            <div class="diary-stat tone-sale"><span>★</span><strong>${compactNumber(player.stats.bestSale)}$</strong><small>Лучшая продажа</small></div>
            <div class="diary-stat tone-harvest"><span>✓</span><strong>${compactNumber(player.stats.harvested)}</strong><small>Всего растений</small></div>
        `;

        mutsEl.innerHTML = diaryEntries().map(entry => {
            const count = player.rares[entry.id] || 0;
            const unlocked = count > 0;
            return `<div class="diary-mut-card ${unlocked ? 'unlocked' : 'locked'}" style="--mut-color:${MUTATIONS[entry.id]?.color || '#ffd166'}">
                <div class="diary-mut-icon">${unlocked ? entry.icon : '?'}</div>
                <div class="diary-mut-info">
                    <b>${unlocked ? entry.name : '???'}</b>
                    <span class="diary-mut-mult">${unlocked ? entry.mult : 'x?'}</span>
                </div>
                <em>${unlocked ? compactNumber(count) : '0'}</em>
            </div>`;
        }).join('');
    }

    function applyDecorStyle() {
        const garden = document.getElementById('garden');
        if (garden) {
            const styleClass = `style-${player.plotStyle || 'default'}`;
            const hasOtherStyle = Array.from(garden.classList).some(cls => cls.startsWith('style-') && cls !== styleClass);
            if (!garden.classList.contains('garden') || !garden.classList.contains(styleClass) || hasOtherStyle) {
                garden.className = `garden ${styleClass}`;
            }
            applyDecorVars(garden);
            renderPaintPalette(garden);
            syncBackroomsLamp(garden);
        }
    }

    function applyDecorVars(garden) {
        garden.style.setProperty('--paint-color', player.decorPaintColor || DECOR_PAINT_COLORS[0]);
    }

    function renderPaintPalette(garden) {
        garden.querySelector('.paint-palette')?.remove();
        if ((player.plotStyle || 'default') !== 'paints') return;
        const palette = document.createElement('div');
        palette.className = 'paint-palette';
        palette.innerHTML = DECOR_PAINT_COLORS.map(color => `<button type="button" class="${color === player.decorPaintColor ? 'active' : ''}" style="--swatch:${color}" onclick="setDecorPaintColor('${color}')"></button>`).join('');
        garden.appendChild(palette);
    }

    function syncBackroomsLamp(garden) {
        const isBackrooms = (player.plotStyle || 'default') === 'backrooms';
        if (!isBackrooms) {
            if (env.backroomsLampTimer) clearTimeout(env.backroomsLampTimer);
            if (env.backroomsLampEndTimer) clearTimeout(env.backroomsLampEndTimer);
            env.backroomsLampTimer = null;
            env.backroomsLampEndTimer = null;
            garden.classList.remove('backrooms-outage');
            return;
        }
        if (env.backroomsLampTimer || env.backroomsLampEndTimer) return;
        const delay = 60000 + Math.random() * 60000;
        env.backroomsLampTimer = setTimeout(() => {
            env.backroomsLampTimer = null;
            const currentGarden = document.getElementById('garden');
            if ((player.plotStyle || 'default') !== 'backrooms' || !currentGarden) { syncBackroomsLamp(currentGarden || garden); return; }
            currentGarden.classList.add('backrooms-outage');
            env.backroomsLampEndTimer = setTimeout(() => {
                env.backroomsLampEndTimer = null;
                const refreshedGarden = document.getElementById('garden');
                if (refreshedGarden) refreshedGarden.classList.remove('backrooms-outage');
                syncBackroomsLamp(refreshedGarden || garden);
            }, 20000);
        }, delay);
    }

    function renderDecorShop() {
        const shop = document.getElementById('decor-shop');
        if (!shop || typeof DECOR_STYLES === 'undefined') return;
        const owned = Array.isArray(player.ownedDecor) ? player.ownedDecor : ['default'];
        shop.innerHTML = Object.values(DECOR_STYLES).map(style => {
            const bought = owned.includes(style.id);
            const active = (player.plotStyle || 'default') === style.id;
            const locked = player.lvl < (style.lvl || 1);
            const canBuy = style.cost > 0 && !bought && !locked && player.coins >= style.cost;
            return `<div class="decor-card ${active ? 'active' : ''} ${locked ? 'locked' : ''} style-${style.id}">
                <div class="decor-preview"></div>
                <b>${style.name}</b>
                ${style.cost > 0 && !bought && !locked ? `<em class="${canBuy ? 'can-buy' : ''}">${style.cost}$</em>` : ''}
                <button type="button" class="decor-buy ${active ? 'selected' : ''}" onclick="buyOrSelectDecor('${style.id}')">${locked ? `Ур. ${style.lvl}` : active ? 'Выбран' : bought ? 'Выбрать' : 'Купить'}</button>
            </div>`;
        }).join('');
    }

    function ensureRewardsState() {
        if (!player.rewards || typeof player.rewards !== 'object') {
            player.rewards = defaultRewardsState();
        }
        player.rewards.dailyClaimed = Math.max(0, Math.floor(Number(player.rewards.dailyClaimed) || 0));
        player.rewards.dailyLastClaimAt = Math.max(0, Number(player.rewards.dailyLastClaimAt) || 0);
        if (!Array.isArray(player.rewards.dailyTestClaimed)) player.rewards.dailyTestClaimed = Array(DAILY_REWARDS.length).fill(false);
        player.rewards.dailyTestClaimed = Array.from({ length: DAILY_REWARDS.length }, (_, i) => !!player.rewards.dailyTestClaimed[i]);
        player.rewards.coinBoostUntil = Math.max(0, Number(player.rewards.coinBoostUntil) || 0);
        player.rewards.xpBoostUntil = Math.max(0, Number(player.rewards.xpBoostUntil) || 0);
        player.rewards.timedCycleStartedAt = Math.max(0, Number(player.rewards.timedCycleStartedAt) || Date.now());
        player.rewards.timedCooldownUntil = Math.max(0, Number(player.rewards.timedCooldownUntil) || 0);
        if (!Array.isArray(player.rewards.timedClaimed)) player.rewards.timedClaimed = [false, false, false, false];
        player.rewards.timedClaimed = [0, 1, 2, 3].map(i => !!player.rewards.timedClaimed[i]);
        normalizeTimedRewards();
    }

    function normalizeTimedRewards() {
        const now = Date.now();
        if (player.rewards.coinBoostUntil && now >= player.rewards.coinBoostUntil) {
            player.rewards.coinBoostUntil = 0;
        }
        if (player.rewards.xpBoostUntil && now >= player.rewards.xpBoostUntil) {
            player.rewards.xpBoostUntil = 0;
        }
        if (player.rewards.timedCooldownUntil && now >= player.rewards.timedCooldownUntil) {
            player.rewards.timedCooldownUntil = 0;
            player.rewards.timedCycleStartedAt = now;
            player.rewards.timedClaimed = [false, false, false, false];
        }
        if (!player.rewards.timedCooldownUntil && player.rewards.timedClaimed.every(Boolean)) {
            player.rewards.timedCooldownUntil = now + TIMED_REWARD_COOLDOWN;
        }
    }

    function buyOrSelectDecor(styleId) {
        const style = DECOR_STYLES[styleId];
        if (!style) return;
        if (player.lvl < (style.lvl || 1)) { showToast(`Нужен уровень ${style.lvl}`, "#ff7675"); return; }
        if (!Array.isArray(player.ownedDecor)) player.ownedDecor = ['default'];
        const bought = player.ownedDecor.includes(styleId);
        if (!bought) {
            if (player.coins < style.cost) { showToast(`Нужно ${style.cost} монет`, "#ff7675"); return; }
            player.coins -= style.cost;
            player.ownedDecor.push(styleId);
            sfx.play('coin');
        } else {
            sfx.play('pop');
        }
        player.plotStyle = styleId;
        updateUI();
    }

    function setDecorPaintColor(color) {
        if (!DECOR_PAINT_COLORS.includes(color)) return;
        player.decorPaintColor = color;
        applyDecorStyle();
        saveGame();
        sfx.play('pop');
    }

    function addTestCoins() {
        player.coins += 99999999;
        sfx.play('coin');
        showToast("+99999999 монет", "#f1c40f");
        updateUI();
    }

    function resetProgress() {
        if (env.companionSpecialTimer) clearTimeout(env.companionSpecialTimer);
        if (env.companionSpecialEndTimer) clearTimeout(env.companionSpecialEndTimer);
        player = {
            coins: BALANCE.startCoins || 50, lvl: 1, xp: 0, xpNeed: BALANCE.xpNeedStart || 100,
            rares: {}, unlockedMutations: [],
            pets: [], petLevels: {}, petInventory: [], equippedPets: [null, null, null], unlockedPetSlots: 1,
            incubator: [null, null, null], quests: [], lastSaved: Date.now(), bank: 0,
            plotStyle: 'default', ownedDecor: ['default'], decorPaintColor: '#ff7675',
            seedInventory: defaultSeedInventory(),
            shop: defaultShopState(),
            showcase: [null, null, null],
            companion: defaultCompanionState(),
            stats: { totalEarned: 0, maxWeight: 0, bestSale: 0, harvested: 0 },
            rewards: defaultRewardsState(),
            tutorial: {
                done: false,
                step: 'welcome_seed',
                force: true,
                targetTiles: [...TUTORIAL_TARGET_TILES],
                plantedCount: 0,
                harvestedCount: 0,
                weedSpawned: false,
                weedCleared: false,
                finalQueued: false,
                selectedSeed: '',
                weedTile: TUTORIAL_TARGET_TILES[1],
                readyTile: TUTORIAL_TARGET_TILES[0]
            }
        };
        resetTilesState();
        env = {
            ticks: 0, currentEvent: 'day', eventTimer: 0, nextEventTimer: rollNextEventDelay(), potTimer: 0, potActive: false,
            activeNest: 0, activeEquip: 0, petPatCooldowns: {},
            companionDrawer: '',
            companionShower: false, companionShowerTimer: null, companionPointerDown: false, companionPointer: null,
            companionPointerId: null, companionPointerStartedInZone: false,
            companionPointerStartX: 0, companionPointerStartY: 0,
            companionPointerLastX: 0, companionPointerLastY: 0, companionPointerStartedAt: 0,
            companionPetting: false, companionHoldTimer: null, companionTapTimer: null,
            companionHeartTimer: null, companionHeartLastSoundAt: 0,
            companionSpecial: '', companionSpecialTimer: null, companionSpecialEndTimer: null,
            companionSpecialAnchorX: 0, companionSpecialAnchorY: 0,
            companionCoinBurstAt: 0,
            openMenuSections: { showcase: false, diary: false, decor: false, rewards: false, admin: false },
            backroomsLampTimer: null, backroomsLampEndTimer: null, shopTab: 'seeds'
        };
        eventActions = [];
        currentTool = 'water';
        startEvent('day');
        document.getElementById('side-menu').classList.remove('open');
        document.getElementById('shop-modal').classList.remove('open');
        document.getElementById('pet-reveal').classList.remove('active');
        document.getElementById('pet-sell-modal').classList.remove('active');
        document.querySelectorAll('.action-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tool === 'water'));
        localStorage.removeItem('FarmMobileV2');
        renderGarden();
        renderSeeds();
        generateQuestsIfNeeded();
        updateUI();
        refreshTutorial();
        scheduleCompanionSpecial();
        saveGame();
        showToast('Прогресс сброшен', '#f1c40f');
    }
    
    function floatText(tileIdx, text, color) {
        const el = document.getElementById(`tile-${tileIdx}`); const rect = el.getBoundingClientRect();
        const f = document.createElement('div'); f.className = 'floating-text';
        f.style.left = `${rect.left + rect.width/2 - 20}px`; f.style.top = `${rect.top}px`;
        f.style.color = color; f.innerHTML = text; document.body.appendChild(f);
        setTimeout(() => f.remove(), 1200);
    }

    function showToast(msg, color) {
        const c = document.getElementById('toasts'); const t = document.createElement('div');
        t.className = 'toast'; t.style.border = `2px solid ${color}`; t.innerText = msg;
        c.appendChild(t); setTimeout(() => { t.style.opacity=0; setTimeout(()=>t.remove(),300) }, 2000);
    }

    function showBigMutation(mutId) {
        sfx.play('mut'); const overlay = document.getElementById('mut-overlay'); const m = MUTATIONS[mutId];
        document.getElementById('mut-icon').innerText = m.icon;
        document.getElementById('mut-text').innerHTML = `Открыта новая мутация!<br><span style="font-size:20px; color:${m.color};">${m.name} • x${m.mult}</span>`;
        overlay.classList.add('active'); setTimeout(() => overlay.classList.remove('active'), 2000);
    }

    function generateQuestsIfNeeded() {
        if (player.quests.length === 0) {
            let shuffled = [...QUEST_TEMPLATES].sort(() => 0.5 - Math.random());
            player.quests = shuffled.slice(0, 3).map(q => ({...q, current: 0, claimed: false}));
        }
    }
    
    function updateQuest(type, amount) {
        let q = player.quests.find(x => x.id === type && !x.claimed);
        if (q && q.current < q.target) {
            q.current += amount;
            if (q.current >= q.target) { sfx.play('pop'); showToast("Задание выполнено!", "#f1c40f"); }
            updateUI();
        }
    }

    function renderQuests() {
        const c = document.getElementById('quests-container'); c.innerHTML = '';
        player.quests.forEach((q, i) => {
            let pct = Math.min(100, (q.current / q.target) * 100); let done = q.current >= q.target;
            c.innerHTML += `<div class="quest-card ${done ? 'done' : ''} ${q.claimed ? 'claimed' : ''}"><div class="quest-title">${q.desc}</div><div class="quest-progress"><div class="quest-fill" style="width:${pct}%"></div></div><div class="quest-reward"><span>Награда: ${q.reward}$</span>${!q.claimed ? `<button class="btn-claim" onclick="claimQuest(${i})">Забрать</button>` : '<span>✓</span>'}</div></div>`;
        });
    }

    function claimQuest(idx) {
        let q = player.quests[idx];
        if (q.current >= q.target && !q.claimed) {
            q.claimed = true; player.coins += q.reward; ensureStats(); player.stats.totalEarned += Math.max(0, q.reward || 0); sfx.play('coin'); updateUI();
            if (player.quests.every(x => x.claimed)) setTimeout(() => { player.quests = []; generateQuestsIfNeeded(); updateUI(); }, 2000);
        }
    }

    function plantMagicSeed() {
        startEgg('common');
    }

    function switchNest(dir) {
        env.activeEquip = (env.activeEquip + dir + 3) % 3;
        renderPets();
    }

    function startEgg(rarityId) {
        const egg = EGG_RARITIES[rarityId];
        if (!egg || egg.locked) { showToast("Это яйцо пока неизвестно", "gray"); return; }
        const slot = player.incubator.findIndex(x => !x);
        if (slot < 0) { showToast("Все гнёзда заняты!", "#ff7675"); return; }
        if (player.coins < egg.cost) { showToast(`Нужно ${egg.cost} монет!`, "#ff7675"); return; }
        player.coins -= egg.cost;
        env.activeNest = slot;
        const now = Date.now();
        player.incubator[slot] = {
            rarity: rarityId,
            startedAt: now,
            duration: egg.hatchSeconds,
            readyAt: now + (TEST_HATCH_INSTANT ? 1200 : egg.hatchSeconds * 1000),
            hatching: false,
            ready: false
        };
        sfx.play('pop');
        showToast(`${egg.name} в гнезде ${slot + 1}`, egg.color);
        updateUI();
    }

    function hatchNest(slot = env.activeNest) {
        const nest = player.incubator[slot];
        if (!nest || nest.hatching) return;
        if (player.petInventory.length >= (BALANCE.petInventoryMax || 8)) { showToast("Освободи место в инвентаре", "#ff7675"); return; }
        const now = Date.now();
        if (!nest.ready && now < nest.readyAt) { showToast("Яйцо ещё греется", "#74b9ff"); return; }
        nest.ready = true;
        nest.hatching = true;
        env.activeNest = slot;
        const reserved = {
            uid: `reserved-${Date.now()}-${slot}`,
            reserved: true,
            id: null,
            level: 1,
            hunger: 100,
            size: 'normal',
            shiny: 'normal',
            happy: false
        };
        player.petInventory.push(reserved);
        renderPets();
        setTimeout(() => {
            const petDef = rollPetFromEgg(nest.rarity);
            const variant = rollPetVariant();
            Object.assign(reserved, {
                uid: `pet-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
                reserved: false,
                id: petDef.id,
                level: 1,
                hunger: 100,
                size: variant.size || 'normal',
                shiny: variant.shiny || 'normal',
                happy: false
            });
            if (!player.equippedPets[0]) player.equippedPets[0] = reserved.uid;
            player.incubator[slot] = null;
            sfx.play('mut');
            showPetReveal(reserved);
            updateUI();
        }, 1450);
    }

    function rollPetFromEgg(rarityId) {
        const pool = Object.values(PET_DEFS).filter(p => p.egg === rarityId);
        const secret = pool.find(p => p.secret);
        const regular = pool.filter(p => !p.secret);
        if (secret && Math.random() < 0.04) return secret;
        return regular[Math.floor(Math.random() * regular.length)] || pool[0];
    }

    function addPetToInventory(petId, variant = {}) {
        const pet = {
            uid: `pet-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
            id: petId,
            level: 1,
            hunger: 100,
            size: variant.size || 'normal',
            shiny: variant.shiny || 'normal',
            happy: false
        };
        player.petInventory.push(pet);
        if (!player.equippedPets[0]) player.equippedPets[0] = pet.uid;
        return pet;
    }

    function showPetReveal(pet) {
        const def = PET_DEFS[pet.id]; const style = PET_RARITY_STYLE[def.rarity] || PET_RARITY_STYLE.common;
        const overlay = document.getElementById('pet-reveal');
        const card = document.getElementById('pet-reveal-card');
        card.style.setProperty('--rarity-color', style.color);
        card.className = `pet-reveal-card rarity-${def.rarity} ${pet.shiny === 'gold' ? 'card-gold' : ''} ${pet.shiny === 'rainbow' ? 'card-rainbow' : ''} ${pet.size === 'huge' ? 'card-huge' : ''}`;
        card.innerHTML = `
            <div class="pet-reveal-sprite">${slimeHTML(def, pet, 'reveal')}</div>
            <div class="pet-reveal-rarity">${petRarityHTML(pet, def)}</div>
            <div class="pet-reveal-name">${petDisplayName(pet)}</div>
            <div class="pet-reveal-role">${def.role}<br><b>${petBuffText(def, getPetPowerMult(pet))}</b></div>
            <button class="pot-btn" onclick="closePetReveal()">Забрать</button>`;
        overlay.classList.add('active');
    }

    function closePetReveal() {
        document.getElementById('pet-reveal').classList.remove('active');
    }

    function equipPet(uid, slot = -1) {
        const pet = getPetInstance(uid);
        if (!pet) return;
        const current = player.equippedPets.indexOf(uid);
        if (current >= 0) { player.equippedPets[current] = null; updateUI(); return; }
        let target = slot >= 0 ? slot : env.activeEquip;
        if (player.equippedPets[target]) target = player.equippedPets.findIndex((x, i) => i < player.unlockedPetSlots && !x);
        if (target < 0) { showToast("Свободных слотов нет", "#ff7675"); return; }
        if (target >= player.unlockedPetSlots) { showToast("Слот закрыт", "#ff7675"); return; }
        player.equippedPets[target] = uid;
        sfx.play('pop');
        updateUI();
    }

    function sellPet(uid) {
        const pet = getPetInstance(uid);
        if (!pet) return;
        if (player.equippedPets.includes(uid)) { showToast("Сначала сними слайма", "#ff7675"); return; }
        const def = PET_DEFS[pet.id];
        const price = getPetSellPrice(pet);
        player.petInventory = player.petInventory.filter(p => p.uid !== uid);
        player.coins += price;
        sfx.play('coin');
        showToast(`Продано за ${price}$`, "#f1c40f");
        closeSellConfirm();
        updateUI();
    }

    function getPetSellPrice(pet) {
        const def = PET_DEFS[pet.id];
        const base = def.rarity === 'legendary' ? 1200 : def.rarity === 'rare' ? 320 : def.rarity === 'secret' ? 1800 : 80;
        return Math.ceil(base * getPetPowerMult(pet));
    }

    function openSellConfirm(uid) {
        const pet = getPetInstance(uid);
        if (!pet) return;
        if (player.equippedPets.includes(uid)) { showToast("Сначала сними слайма", "#ff7675"); return; }
        const def = PET_DEFS[pet.id];
        const style = PET_RARITY_STYLE[def.rarity] || PET_RARITY_STYLE.common;
        const price = getPetSellPrice(pet);
        const overlay = document.getElementById('pet-sell-modal');
        const card = document.getElementById('pet-sell-card');
        if (!overlay || !card) return;
        card.style.setProperty('--rarity-color', style.color);
        card.className = `pet-sell-card rarity-${def.rarity} ${pet.shiny === 'gold' ? 'card-gold' : ''} ${pet.shiny === 'rainbow' ? 'card-rainbow' : ''}`;
        card.innerHTML = `
            <div class="sell-preview">${slimeHTML(def, pet, 'inventory')}</div>
            <b>Продать ${petDisplayName(pet)}?</b>
            <small>${petRarityHTML(pet, def)}</small>
            <span>Ты получишь ${price}$</span>
            <div class="sell-confirm-actions">
                <button type="button" class="sell-no" onclick="closeSellConfirm()">Нет</button>
                <button type="button" class="sell-yes" onclick="sellPet('${uid}')">Да</button>
            </div>`;
        overlay.classList.add('active');
    }

    function closeSellConfirm() {
        const overlay = document.getElementById('pet-sell-modal');
        if (overlay) overlay.classList.remove('active');
    }

    function unlockPetSlot(slot) {
        const costs = [0, BALANCE.petSlot2Cost || 2500, BALANCE.petSlot3Cost || 12000];
        if (slot !== player.unlockedPetSlots || slot >= 3) return;
        if (player.coins < costs[slot]) { showToast(`Нужно ${costs[slot]} монет!`, "#ff7675"); return; }
        player.coins -= costs[slot];
        player.unlockedPetSlots++;
        sfx.play('coin');
        updateUI();
    }

    function feedPet(uid) {
        const pet = getPetInstance(uid);
        if (!pet) return;
        const cost = Math.ceil(35 * getPetPowerMult(pet));
        if (player.coins < cost) { showToast(`Корм стоит ${cost}$`, "#ff7675"); return; }
        player.coins -= cost;
        pet.hunger = 100;
        pet.happy = true;
        sfx.play('slime');
        showToast(`${petDisplayName(pet)} сыт`, "#00b894");
        setTimeout(() => { pet.happy = false; renderPets(); }, 1200);
        updateUI();
        const el = document.querySelector(`[data-pet-uid="${uid}"]`);
        if (el) {
            el.classList.add('fed');
            setTimeout(() => el.classList.remove('fed'), 700);
        }
    }

    function petPet(uid) {
        const pet = getPetInstance(uid);
        const now = Date.now();
        if (!env.petPatCooldowns) env.petPatCooldowns = {};
        if (env.petPatCooldowns[uid] && env.petPatCooldowns[uid] > now) return;
        env.petPatCooldowns[uid] = now + 2000;
        if (pet) {
            pet.happy = true;
            setTimeout(() => { pet.happy = false; renderPets(); }, 1500);
        }
        renderPets();
        const el = document.querySelector(`.slime-showcase[data-pet-uid="${uid}"]`);
        if (el) {
            el.classList.remove('petted');
            void el.offsetWidth;
            el.classList.add('petted');
            const heart = document.createElement('span');
            heart.className = 'pet-heart';
            heart.textContent = '♥';
            el.appendChild(heart);
            setTimeout(() => heart.remove(), 1300);
            setTimeout(() => el.classList.remove('petted'), 1500);
        }
        sfx.play('slime');
    }

    function updateIncubatorAndPets() {
        const now = Date.now();
        player.incubator.forEach((nest, idx) => {
            if (nest && !nest.hatching && !nest.ready && now >= nest.readyAt) {
                nest.ready = true;
                renderPets();
            }
        });
    }

    function formatTime(ms) {
        const total = Math.max(0, Math.ceil(ms / 1000));
        const m = Math.floor(total / 60);
        const s = total % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    }

    function formatRewardCountdown(ms) {
        const total = Math.max(0, Math.ceil(ms / 1000));
        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = total % 60;
        if (h > 0) return `${h}ч ${String(m).padStart(2, '0')}м`;
        return `${m}:${String(s).padStart(2, '0')}`;
    }

    function grantCoinsReward(amount) {
        const safe = Math.max(0, Math.floor(Number(amount) || 0));
        if (!safe) return 0;
        player.coins += safe;
        ensureStats();
        player.stats.totalEarned += safe;
        return safe;
    }

    function grantXpReward(amount) {
        let safe = Math.max(0, Math.floor(Number(amount) || 0));
        if (!safe) return 0;
        if (hasRewardXpBoost()) safe *= 2;
        player.xp += safe;
        while (player.xp >= player.xpNeed) {
            player.lvl++;
            player.xp -= player.xpNeed;
            player.xpNeed = Math.floor(player.xpNeed * (BALANCE.xpNeedMult || 1.5));
            showToast(`УРОВЕНЬ ${player.lvl}! 🎉`, "#a29bfe");
            if (Object.values(PLOT_UNLOCK_LEVELS).includes(player.lvl)) {
                showToast('Открылась новая грядка!', '#55efc4');
            }
        }
        return safe;
    }

    function grantSeedReward(seedId, amount = 1) {
        if (!PLANTS[seedId]) return null;
        const safeAmount = Math.max(1, Math.floor(amount || 1));
        player.seedInventory[seedId] = getSeedOwned(seedId) + safeAmount;
        return { seedId, amount: safeAmount };
    }

    function grantDecorReward(styleId) {
        const style = DECOR_STYLES[styleId];
        if (!style) {
            return { duplicate: true, fallbackCoins: grantCoinsReward(2500) };
        }
        if (!Array.isArray(player.ownedDecor)) player.ownedDecor = ['default'];
        if (player.ownedDecor.includes(styleId)) {
            return { styleId, duplicate: true, fallbackCoins: grantCoinsReward(2500 + player.lvl * 120) };
        }
        player.ownedDecor.push(styleId);
        return { styleId, duplicate: false };
    }

    function grantEggReward(rarityId) {
        const egg = EGG_RARITIES[rarityId];
        const slot = player.incubator.findIndex(x => !x);
        if (!egg || slot < 0) {
            return { blocked: true, message: 'Освободите место' };
        }
        const now = Date.now();
        player.incubator[slot] = {
            rarity: rarityId,
            startedAt: now,
            duration: egg.hatchSeconds,
            readyAt: now + egg.hatchSeconds * 1000,
            hatching: false,
            ready: false
        };
        return { rarityId, slot };
    }

    function grantSecretSlimeReward() {
        const pool = Object.values(PET_DEFS).filter(def => def.secret);
        if (!pool.length || player.petInventory.length >= (BALANCE.petInventoryMax || 8)) {
            return { blocked: true, message: 'Нет мест для слайма' };
        }
        const picked = pool[Math.floor(Math.random() * pool.length)];
        const pet = addPetToInventory(picked.id, rollPetVariant());
        showPetReveal(pet);
        return { pet };
    }

    function grantTimedRareSeedReward() {
        const rarePool = ['watermelon', 'melon', 'pineapple', 'pomegranate', 'dragonfruit', 'starfruit', 'fig']
            .filter(id => PLANTS[id] && player.lvl >= ((PLANTS[id].lvl || 1) - 2));
        const picked = rarePool[rarePool.length - 1] || 'pumpkin';
        return {
            seed: grantSeedReward(picked, 1),
            coins: grantCoinsReward(160 + player.lvl * 30),
            xp: grantXpReward(18 + player.lvl * 5)
        };
    }

    function getDailyRewardIndex() {
        ensureRewardsState();
        return player.rewards.dailyClaimed % DAILY_REWARDS.length;
    }

    function canClaimDailyReward() {
        ensureRewardsState();
        return !player.rewards.dailyLastClaimAt || (Date.now() - player.rewards.dailyLastClaimAt) >= DAILY_REWARD_INTERVAL;
    }

    function getDailyRewardRemainingMs() {
        ensureRewardsState();
        if (canClaimDailyReward()) return 0;
        return Math.max(0, DAILY_REWARD_INTERVAL - (Date.now() - player.rewards.dailyLastClaimAt));
    }

    function canClaimTimedReward(slot) {
        ensureRewardsState();
        if (TEST_UNLOCK_ALL_REWARDS) return !player.rewards.timedClaimed[slot];
        if (slot < 0 || slot >= TIMED_REWARDS.length) return false;
        if (player.rewards.timedCooldownUntil) return false;
        if (player.rewards.timedClaimed[slot]) return false;
        return Date.now() >= player.rewards.timedCycleStartedAt + ((slot + 1) * TIMED_REWARD_STEP);
    }

    function getTimedRewardUnlockMs(slot) {
        ensureRewardsState();
        if (TEST_UNLOCK_ALL_REWARDS) return 0;
        if (player.rewards.timedClaimed[slot]) return 0;
        if (player.rewards.timedCooldownUntil) return Math.max(0, player.rewards.timedCooldownUntil - Date.now());
        return Math.max(0, (player.rewards.timedCycleStartedAt + ((slot + 1) * TIMED_REWARD_STEP)) - Date.now());
    }

    function hasClaimableRewards() {
        ensureRewardsState();
        if (TEST_UNLOCK_ALL_REWARDS) {
            const hasDailyLeft = (player.rewards.dailyTestClaimed || []).some(claimed => !claimed);
            const hasTimedLeft = (player.rewards.timedClaimed || []).some(claimed => !claimed);
            return hasDailyLeft || hasTimedLeft;
        }
        return canClaimDailyReward() || TIMED_REWARDS.some((_, index) => canClaimTimedReward(index));
    }

    function hasRewardCoinBoost() {
        ensureRewardsState();
        return !!player.rewards.coinBoostUntil && player.rewards.coinBoostUntil > Date.now();
    }

    function getRewardCoinBoostRemainingMs() {
        ensureRewardsState();
        return Math.max(0, (player.rewards.coinBoostUntil || 0) - Date.now());
    }

    function hasRewardXpBoost() {
        ensureRewardsState();
        return !!player.rewards.xpBoostUntil && player.rewards.xpBoostUntil > Date.now();
    }

    function getRewardXpBoostRemainingMs() {
        ensureRewardsState();
        return Math.max(0, (player.rewards.xpBoostUntil || 0) - Date.now());
    }

    function activateCoinBoost(durationMs) {
        ensureRewardsState();
        const safeDuration = Math.max(0, Math.floor(Number(durationMs) || 0));
        const baseTime = Math.max(Date.now(), player.rewards.coinBoostUntil || 0);
        player.rewards.coinBoostUntil = baseTime + safeDuration;
        return { until: player.rewards.coinBoostUntil, durationMs: safeDuration };
    }

    function activateXpBoost(durationMs) {
        ensureRewardsState();
        const safeDuration = Math.max(0, Math.floor(Number(durationMs) || 0));
        const baseTime = Math.max(Date.now(), player.rewards.xpBoostUntil || 0);
        player.rewards.xpBoostUntil = baseTime + safeDuration;
        return { until: player.rewards.xpBoostUntil, durationMs: safeDuration };
    }

    function activeStatusEntries() {
        const statuses = [];
        const coinLeft = getRewardCoinBoostRemainingMs();
        const xpLeft = getRewardXpBoostRemainingMs();
        if (coinLeft > 0) {
            statuses.push({ id: 'coin_x2', labelHtml: '<span class="active-status-word">Монетки</span><span class="active-status-mult">x2</span>', icon: '$', time: formatRewardCountdown(coinLeft), tone: 'coins' });
        }
        if (xpLeft > 0) {
            statuses.push({ id: 'xp_x2', labelHtml: '<span class="active-status-word">XP</span><span class="active-status-mult">x2</span>', icon: 'XP', time: formatRewardCountdown(xpLeft), tone: 'xp' });
        }
        return statuses;
    }

    function renderActiveStatusStrip() {
        const panel = document.getElementById('active-status-panel');
        const list = document.getElementById('active-status-list');
        if (!panel || !list) return;
        const statuses = activeStatusEntries().slice(0, 3);
        panel.style.display = statuses.length ? 'block' : 'none';
        if (!statuses.length) {
            list.innerHTML = '';
            return;
        }
        list.innerHTML = statuses.map(status => `
            <div class="active-status-chip tone-${status.tone}">
                <div class="active-status-copy">
                    <b><span class="active-status-inline-icon">${status.icon || ''}</span>${status.labelHtml || status.label || ''}</b>
                </div>
                <em>${status.time}</em>
            </div>
        `).join('');
    }

    function hasReadyPets() {
        return (player.incubator || []).some(nest => nest && !nest.hatching && (nest.ready || Date.now() >= nest.readyAt));
    }

    function updateMenuMarkers() {
        const rewardsMarker = document.getElementById('rewards-ready-marker');
        const petsMarker = document.getElementById('pets-ready-marker');
        if (rewardsMarker) rewardsMarker.classList.toggle('visible', hasClaimableRewards());
        if (petsMarker) petsMarker.classList.toggle('visible', hasReadyPets());
    }

    function buildCoinsRewardPop(amount, options = {}) {
        return {
            title: options.title || 'Монетки',
            subtitle: '',
            accent: options.accent || '#f1c40f',
            glow: options.glow || 'default',
            iconHtml: '<span class="reward-loot reward-loot-coins">$</span>',
            lootItems: [
                { type: 'coins', value: `+${compactNumber(amount)}` }
            ]
        };
    }

    function buildCoinBoostRewardPop(boost, options = {}) {
        return {
            title: 'Монеты',
            subtitle: '',
            accent: options.accent || '#47a9e8',
            glow: 'boost',
            iconHtml: '<span class="reward-loot reward-loot-boost">X2</span>',
            lootItems: [
                { type: 'boost', value: 'На 30 минут' }
            ]
        };
    }

    function buildEggRewardPop(result, options = {}) {
        const egg = EGG_RARITIES[result?.rarityId || 'legendary'] || EGG_RARITIES.legendary;
        if (result?.fallbackCoins) {
            return buildCoinsRewardPop(result.fallbackCoins, { title: 'Награда вместо яйца', accent: options.accent || '#e99b24', glow: 'gold' });
        }
        return {
            title: `${egg.label} яйцо`,
            accent: options.accent || egg.color,
            glow: 'gold',
            iconHtml: `<span class="egg-model reward-loot-egg egg-${egg.id}"></span>`,
            compact: true
        };
    }

    function buildSeedRewardPop(result, options = {}) {
        const seed = result?.seedId ? PLANTS[result.seedId] : null;
        if (!seed) return { title: options.title || 'Награда', accent: options.accent || '#f1c40f', icon: '🎁' };
        return {
            title: options.title || seed.name,
            subtitle: '',
            accent: options.accent || seed.color,
            glow: options.glow || 'secret',
            iconHtml: `<span class="reward-loot reward-loot-seed" style="--reward-seed-color:${seed.color};">${seedIcon(seed.id, 'reward-seed-icon')}</span>`,
            compact: true
        };
    }

    function buildDecorRewardPop(result, options = {}) {
        if (result?.fallbackCoins) {
            return buildCoinsRewardPop(result.fallbackCoins, { title: result.duplicate ? 'Декор уже был' : 'Награда', accent: options.accent || '#e66e4f', glow: result.duplicate ? 'default' : 'secret' });
        }
        const style = DECOR_STYLES[result?.styleId] || DECOR_STYLES.vip;
        return {
            title: 'Секретный декор',
            subtitle: '',
            accent: options.accent || '#e66e4f',
            glow: 'secret',
            iconHtml: `<span class="reward-decor-preview style-${style.id}"><span class="reward-decor-tile"></span></span>`,
            compact: true
        };
    }

    function buildSecretSlimeRewardPop(result, options = {}) {
        if (result?.fallbackCoins) {
            return buildCoinsRewardPop(result.fallbackCoins, { title: 'Секретный приз', accent: options.accent || '#9a45e5', glow: 'gold' });
        }
        const pet = result?.pet;
        const def = pet ? PET_DEFS[pet.id] : null;
        return {
            title: 'Ультра редкий слайм',
            subtitle: def ? def.name : 'Секретный питомец',
            accent: options.accent || '#9a45e5',
            glow: 'ultra',
            ultra: true,
            iconHtml: def ? slimeHTML(def, pet, 'inventory') : '<span class="reward-loot reward-loot-slime">?</span>',
            compact: true,
            skipPop: true
        };
    }

    function buildTimedBundleRewardPop(result, options = {}) {
        return {
            title: options.title || 'Подарок открыт',
            subtitle: result.xp ? 'Награда получена' : `+${compactNumber(result.coins)}`,
            accent: options.accent || '#f1c40f',
            glow: options.glow || 'default',
            iconHtml: '<span class="reward-loot reward-loot-gift">🎁</span>',
            lootItems: [
                result.coins ? { type: 'coins', value: `+${compactNumber(result.coins)}` } : null,
                result.xp ? { type: 'xp', value: `+${result.xp}` } : null
            ].filter(Boolean)
        };
    }

    function buildTimedRareSeedPop(result, options = {}) {
        if (!result?.seed) return buildTimedBundleRewardPop(result || {}, options);
        const seed = PLANTS[result.seed.seedId];
        return {
            title: 'Подарок открыт',
            subtitle: 'Награда получена',
            accent: options.accent || '#a29bfe',
            glow: 'secret',
            iconHtml: '<span class="reward-loot reward-loot-gift">🎁</span>',
            lootItems: [
                { type: 'seed', html: seedIcon(seed.id, 'reward-seed-mini'), value: `x${result.seed.amount}`, accent: seed.color },
                { type: 'coins', value: `+${compactNumber(result.coins)}` },
                { type: 'xp', value: `+${result.xp}` }
            ]
        };
    }

    function rewardLootItemHTML(item) {
        if (!item) return '';
        const icon = item.html || item.icon || (item.type === 'coins' ? '$' : item.type === 'xp' ? 'XP' : item.type === 'boost' ? 'x2' : item.type === 'time' ? '⏱' : item.type === 'egg' ? '🥚' : item.type === 'decor' ? '◆' : '?');
        return `<div class="reward-mini-card type-${item.type || 'default'}" ${item.accent ? `style="--mini-accent:${item.accent}"` : ''}>
            <span class="reward-mini-icon">${icon}</span>
            <b>${item.value || ''}</b>
        </div>`;
    }

    function showRewardPop(reward) {
        const overlay = document.getElementById('reward-pop');
        const card = document.getElementById('reward-pop-card');
        if (!overlay || !card) return;
        const view = typeof reward === 'object' && reward ? reward : { title: `${reward || ''}` };
        card.style.setProperty('--reward-accent', view.accent || '#f1c40f');
        card.className = `reward-pop-card glow-${view.glow || 'default'} ${view.ultra ? 'is-ultra' : ''}`;
        card.innerHTML = `
            <div class="reward-pop-icon-shell">
                <div class="reward-pop-burst"></div>
                <div class="reward-pop-icon">${view.iconHtml || view.icon || '🎁'}</div>
            </div>
            <b>${view.title || 'Награда'}</b>
            ${view.subtitle ? `<small>${view.subtitle}</small>` : ''}
            ${Array.isArray(view.lootItems) && view.lootItems.length && !view.compact ? `<div class="reward-pop-loot-row">${view.lootItems.map(rewardLootItemHTML).join('')}</div>` : ''}
            <div class="reward-pop-hint">Нажмите на экран</div>
        `;
        overlay.onclick = (event) => {
            if (event.target === overlay) overlay.classList.remove('active');
        };
        overlay.classList.remove('active');
        void overlay.offsetWidth;
        overlay.classList.add('active');
    }

    const pressableSelector = [
        'button',
        '.action-btn',
        '.seed-packet',
        '.shop-seed-card',
        '.nav-arrow',
        '.menu-fold-btn',
        '.menu-exit-btn',
        '.btn-icon',
        '.btn-shop-large',
        '.pot-btn',
        '.shop-tab',
        '.companion-action',
        '.companion-name',
        '.companion-stage',
        '.companion-skin-trigger',
        '.companion-feed-list > button',
        '.companion-skin-list > button',
        '.decor-buy',
        '.sell-btn',
        '.egg-buy',
        '.daily-reward-card',
        '.timed-reward-card',
        '.reward-mini-card',
        '.showcase-actions button',
        '.showcase-slime',
        '.tutorial-action',
        '.pet-card-actions button'
    ].join(',');

    function bindPressFeedback() {
        let activePress = null;
        const clearPress = () => {
            if (activePress) activePress.classList.remove('ui-press');
            activePress = null;
        };
        document.addEventListener('pointerdown', (event) => {
            const target = event.target.closest(pressableSelector);
            if (!target || target.disabled || target.classList.contains('disabled')) return;
            if (target.id === 'companion-stage') return;
            clearPress();
            activePress = target;
            target.classList.add('ui-press');
        }, { passive: true });
        document.addEventListener('pointerup', clearPress, { passive: true });
        document.addEventListener('pointercancel', clearPress, { passive: true });
        document.addEventListener('pointerleave', clearPress, { passive: true });
        document.addEventListener('click', clearPress, { passive: true });
        window.addEventListener('blur', clearPress, { passive: true });
    }

    function petBuffText(def, level = 1) {
        const pct = Math.round(def.value * level * 100);
        if (def.stat === 'speedMult') return `+${pct}% рост`;
        if (def.stat === 'coinMult') return `+${pct}% монеты`;
        if (def.stat === 'mutChance') return `+${pct}% мутации`;
        if (def.stat === 'weightMult') return `+${pct}% вес`;
        if (def.stat === 'hybridRare') return `+${pct}% вес и мутации`;
        if (def.stat === 'hybridGrowth') return `+${pct}% рост и вес`;
        if (def.stat === 'all') return `+${pct}% ко всему`;
        return def.role;
    }

    function renderPets() {
        const list = document.getElementById('pet-list');
        const shop = document.getElementById('egg-shop');
        const nestView = document.getElementById('nest-view');
        const dots = document.getElementById('nest-dots');
        const equipSlots = document.getElementById('equip-slots');
        const inventoryTitle = document.getElementById('pet-inventory-title');
        if (!list || !shop || !nestView || !dots || !equipSlots) return;
        if (inventoryTitle) inventoryTitle.textContent = `Инвентарь ${BALANCE.petInventoryMax || 8} мест`;

        shop.innerHTML = Object.values(EGG_RARITIES).map(egg => `
            <button class="egg-buy rarity-${egg.id} ${egg.locked ? 'locked' : ''}" ${egg.locked ? 'disabled' : ''} onclick="startEgg('${egg.id}')">
                <span class="egg-model egg-${egg.id}"></span><b>${egg.label}</b><small>${egg.locked ? 'Скоро' : `${egg.cost}$ • ${Math.floor(egg.hatchSeconds / 60)} мин`}</small>
            </button>`).join('');

        const activeSlotUnlocked = env.activeEquip < player.unlockedPetSlots;
        const activeUid = player.equippedPets[env.activeEquip];
        const activePet = activeUid ? getPetInstance(activeUid) : null;
        const activeDef = activePet ? PET_DEFS[activePet.id] : null;
        if (!activeSlotUnlocked) {
            const costs = [0, BALANCE.petSlot2Cost || 2500, BALANCE.petSlot3Cost || 12000];
            nestView.innerHTML = `<div class="slime-showcase locked"><div class="big-lock">🔒</div><div class="nest-info"><b>Слот ${env.activeEquip + 1} закрыт</b><span>Открыть за ${costs[env.activeEquip]}$</span></div><button class="pot-btn" onclick="unlockPetSlot(${env.activeEquip})">Открыть</button></div>`;
        } else if (!activePet || !activeDef) {
            nestView.innerHTML = `<div class="slime-showcase empty"><div class="big-slime empty"><span class="slime-face"><span class="slime-eye left"></span><span class="slime-eye right"></span><span class="slime-mouth"></span></span><i class="slime-decor"></i></div><div class="nest-info"><b>СЛОТ ${env.activeEquip + 1}</b><span>Нажми галочку у слайма</span></div></div>`;
        } else {
            const style = PET_RARITY_STYLE[activeDef.rarity] || PET_RARITY_STYLE.common;
            nestView.innerHTML = `<div class="slime-showcase ${activePet.shiny === 'gold' ? 'card-gold' : ''} ${activePet.shiny === 'rainbow' ? 'card-rainbow' : ''} rarity-${activeDef.rarity}" data-pet-uid="${activePet.uid}" style="--rarity-color:${style.color}">
                <button type="button" class="showcase-slime" onpointerdown="petPet('${activePet.uid}')">${slimeHTML(activeDef, activePet, 'featured')}</button>
                <div class="showcase-info">
                    <b>${petDisplayName(activePet)}</b>
                    <small>${petRarityHTML(activePet, activeDef)}</small>
                    <em>${petBuffText(activeDef, getPetPowerMult(activePet))}</em>
                </div>
                <button class="showcase-remove" type="button" onclick="equipPet('${activePet.uid}')">Снять</button>
            </div>`;
        }

        dots.innerHTML = [0, 1, 2].map(i => {
            const unlocked = i < player.unlockedPetSlots;
            const uid = player.equippedPets[i];
            const pet = uid ? getPetInstance(uid) : null;
            const def = pet ? PET_DEFS[pet.id] : null;
            return `<button class="nest-dot equip-dot ${i === env.activeEquip ? 'active' : ''} ${!unlocked ? 'locked' : ''} ${pet ? 'busy' : ''}" onclick="env.activeEquip=${i}; renderPets();">${!unlocked ? '🔒' : pet ? slimeHTML(def, pet, 'dot') : '•'}</button>`;
        }).join('');

        equipSlots.innerHTML = player.incubator.map((nest, i) => {
            const egg = nest ? EGG_RARITIES[nest.rarity] : null;
            const remaining = nest ? nest.readyAt - Date.now() : 0;
            const pct = nest ? Math.min(100, Math.max(0, ((nest.duration * 1000 - remaining) / (nest.duration * 1000)) * 100)) : 0;
            const isReady = nest && (nest.ready || remaining <= 0);
            if (!nest) return `<div class="egg-window empty"><span>Гнездо ${i + 1}</span><b>Пусто</b></div>`;
            return `<button class="egg-window rarity-${nest.rarity} ${nest.hatching ? 'hatching' : ''} ${isReady ? 'ready' : ''}" onclick="hatchNest(${i})">
                ${isReady && !nest.hatching ? '<em class="ready-badge">Готово</em>' : ''}
                <span class="egg-model egg-${nest.rarity}"></span>
                <b>${egg.label}</b>
                <small>${nest.hatching ? 'Трещит...' : isReady ? 'Нажми' : formatTime(remaining)}</small>
                <div class="incubator-progress"><div style="width:${isReady ? 100 : pct}%"></div></div>
            </button>`;
        }).join('');

        const inventoryLimit = BALANCE.petInventoryMax || 8;
        const inventory = player.petInventory.slice(0, inventoryLimit);
        const visibleSlots = Math.min(inventoryLimit, Math.max(4, Math.ceil(Math.max(4, inventory.length) / 2) * 2));
        const petCardsHtml = inventory.map(pet => {
            if (pet.reserved) {
                return `<div class="pet-card mini-pet-card inventory-reserved">
                    <div class="mini-pet-portrait"><span class="egg-model egg-common hatching"></span></div>
                    <div class="pet-card-main"><span class="pet-copy"><b>ОТКРЫВАЕТСЯ</b><small>место занято</small><strong>Слайм скоро появится</strong></span></div>
                    <div class="pet-card-actions"><button disabled>...</button><button disabled>...</button></div>
                </div>`;
            }
            const def = PET_DEFS[pet.id]; const style = PET_RARITY_STYLE[def.rarity] || PET_RARITY_STYLE.common;
            const equipped = player.equippedPets.includes(pet.uid);
            const cardClass = `pet-card mini-pet-card rarity-${def.rarity} ${equipped ? 'equipped' : ''} ${pet.shiny === 'gold' ? 'card-gold' : ''} ${pet.shiny === 'rainbow' ? 'card-rainbow' : ''} ${pet.size === 'huge' ? 'card-huge' : ''}`;
            return `<div class="${cardClass}" style="--rarity-color:${style.color}" data-pet-uid="${pet.uid}">
                <div class="mini-pet-portrait">${slimeHTML(def, pet, 'inventory')}</div>
                <div class="pet-card-main">
                    <span class="pet-copy"><b>${petDisplayName(pet)}</b><small>${petRarityHTML(pet, def)}</small><strong>${petBuffText(def, getPetPowerMult(pet))}</strong></span>
                </div>
                <div class="pet-card-actions">
                    <button class="equip-toggle ${equipped ? 'active' : ''}" type="button" title="${equipped ? 'Снять' : 'Надеть'}" onclick="equipPet('${pet.uid}')">✓</button>
                    <button class="sell-btn" type="button" title="Продать" onclick="openSellConfirm('${pet.uid}')">✕$</button>
                </div>
            </div>`;
        }).join('');
        const emptySlotsHtml = Array.from({ length: Math.max(0, visibleSlots - inventory.length) }, () => `<div class="pet-card mini-pet-card inventory-empty"><div class="mini-pet-portrait"><span class="inventory-plus">+</span></div></div>`).join('');
        list.innerHTML = petCardsHtml + emptySlotsHtml;

    }

    function calcOfflineBank() {
        let diffSec = Math.floor((Date.now() - player.lastSaved) / 1000);
        const incomePerHour = totalShowcaseIncome();
        if (diffSec > 60 && incomePerHour > 0) {
            const cappedSeconds = Math.min(BALANCE.offlineBankCapSeconds, diffSec);
            player.bank += Math.floor((incomePerHour * cappedSeconds) / 3600);
        }
        player.lastSaved = Date.now();
        renderShowcase();
    }

    function claimBank() {
        if (!isShowcaseUnlocked()) {
            showToast(`Витрина откроется на ${getShowcaseUnlockLevel()} уровне`, '#a29bfe');
            return;
        }
        if (player.bank > 0) {
            player.coins += player.bank; ensureStats(); player.stats.totalEarned += Math.max(0, player.bank || 0); sfx.play('coin'); showToast(`Собрано ${player.bank} монет!`, "#f1c40f");
            player.bank = 0; updateUI();
        }
    }

    function saveGame() {
        try {
            player.lastSaved = Date.now();
            localStorage.setItem('FarmMobileV2', JSON.stringify({ player, tiles }));
        } catch (error) {
            console.warn('Не удалось сохранить игру', error);
        }
    }
    
    function loadGame() {
        try {
            let saved = localStorage.getItem('FarmMobileV2');
            if (saved) {
                let data = JSON.parse(saved);
                if (data.player) player = {...player, ...data.player};
                if (Array.isArray(data.tiles)) {
                    tiles = tiles.map((tile, index) => ({ ...tile, ...(data.tiles[index] || {}) }));
                }
                if (!player.rares) player.rares = {};
                if (!player.quests) player.quests = [];
                if (!player.unlockedMutations) player.unlockedMutations = [];
                if (!player.stats) player.stats = { totalEarned: 0, maxWeight: 0, bestSale: 0, harvested: 0 };
                if (!player.xpNeed) player.xpNeed = BALANCE.xpNeedStart || 100;
            }
        } catch (error) {
            console.warn('Не удалось загрузить сохранение', error);
        }
        normalizePetState();
        renderPets();
    }

    function normalizePetState() {
        ensureStats();
        ensureTutorialState();
        ensureSeedAndShopState();
        ensureRewardsState();
        ensureCompanionState();
        if (!player.pets) player.pets = [];
        if (!player.petLevels) player.petLevels = {};
        if (!Array.isArray(player.petInventory)) player.petInventory = [];
        if (!Array.isArray(player.equippedPets)) player.equippedPets = [null, null, null];
        player.equippedPets = [player.equippedPets[0] || null, player.equippedPets[1] || null, player.equippedPets[2] || null];
        if (!player.unlockedPetSlots) player.unlockedPetSlots = 1;
        if (!Array.isArray(player.incubator)) player.incubator = [null, null, null];
        player.incubator = [player.incubator[0] || null, player.incubator[1] || null, player.incubator[2] || null];
        if (!Array.isArray(player.ownedDecor)) player.ownedDecor = ['default'];
        player.ownedDecor = player.ownedDecor.filter(id => DECOR_STYLES[id]);
        if (!player.ownedDecor.includes('default')) player.ownedDecor.unshift('default');
        if (!Array.isArray(player.showcase)) player.showcase = [null, null, null];
        player.showcase = [player.showcase[0] || null, player.showcase[1] || null, player.showcase[2] || null].map(crop => {
            if (!crop || !PLANTS[crop.plantId]) return null;
            const weight = Math.max(5, Math.min(1000, Number(crop.weight) || 5));
            const mutations = Array.isArray(crop.mutations) ? crop.mutations.filter(mId => MUTATIONS[mId]) : [];
            const sizeTier = crop.sizeTier || (weight >= 400 ? 'huge' : (weight >= 50 ? 'big' : 'normal'));
            const value = Number(crop.value) || cropSaleValue(crop.plantId, mutations, weight, 0);
            return {...crop, mutations, weight, sizeTier, value, weightMult: Number(crop.weightMult) || parseFloat(getWeightMultiplier(weight).toFixed(1)), income: showcaseIncome({value})};
        });
        if (player.decorPaintColor === '#ff9ff3') player.decorPaintColor = '#2ecc71';
        if (!DECOR_PAINT_COLORS.includes(player.decorPaintColor)) player.decorPaintColor = DECOR_PAINT_COLORS[0];
        if (!DECOR_STYLES[player.plotStyle]) player.plotStyle = 'default';
        if (!player.ownedDecor.includes(player.plotStyle)) player.plotStyle = 'default';

        const oldPetMap = { dog: 'dewdrop', cat: 'coinblob', dragon: 'sparkjelly', drop: 'dewdrop', dew: 'dewdrop', sun: 'coinblob', bun: 'coinblob', spark: 'sparkjelly', glimmer: 'sparkjelly', clover: 'sproutslime', sprig: 'sproutslime' };
        player.pets.forEach(id => {
            const mapped = oldPetMap[id] || id;
            if (PET_DEFS[mapped] && !player.petInventory.some(p => p.id === mapped)) {
                player.petInventory.push({ uid: `pet-${mapped}-${Date.now()}-${Math.floor(Math.random() * 999)}`, id: mapped, level: player.petLevels[id] || 1, hunger: 100, size: 'normal', shiny: 'normal', happy: false });
            }
        });
        player.petInventory = player.petInventory.map(p => {
            const mappedId = oldPetMap[p.id] || p.id;
            return {...p, id: mappedId};
        }).filter(p => p && PET_DEFS[p.id]).map(p => ({...p, hunger: Math.max(0, Math.min(100, p.hunger ?? 100)), level: Math.max(1, Math.min(BALANCE.helperMaxLevel, p.level || 1)), size: p.size || 'normal', shiny: p.shiny || 'normal', happy: !!p.happy }));
        player.petInventory = player.petInventory.slice(0, BALANCE.petInventoryMax || 8);
        player.equippedPets = player.equippedPets.map((uid, i) => i < player.unlockedPetSlots && player.petInventory.some(p => p.uid === uid) ? uid : null);
        if (!player.equippedPets[0] && player.petInventory[0]) player.equippedPets[0] = player.petInventory[0].uid;
        if (!Number.isInteger(player.tutorial.tileId)) player.tutorial.tileId = 0;
    }

    window.addEventListener('load', init);
