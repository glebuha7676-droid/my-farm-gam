let player = {
        coins: BALANCE.startCoins || 50, lvl: 1, xp: 0, xpNeed: BALANCE.xpNeedStart || 100,
        rares: {}, unlockedMutations: [],
        pets: [], petLevels: {}, petInventory: [], equippedPets: [null, null, null], unlockedPetSlots: 1, slimeCollection: {},
        incubator: [null, null, null], quests: [], lastSaved: Date.now(), bank: 0, showcasePayoutAt: Date.now() + 30 * 60 * 1000, showcasePayoutRemainder: 0,
        plotStyle: 'default', ownedDecor: ['default'], decorPaintColor: '#ff7675', roomStyle: 'cozy', ownedRoomDecor: ['cozy'], purchasedPlots: [],
        seedInventory: { carrot: 6 }, cropInventory: [],
        shop: { stock: {}, refreshAt: 0, merchantStock: {}, merchantArrivesAt: 0, merchantLeavesAt: 0, adEggViews: 0, adEggUnlocked: false },
        showcase: [null, null, null],
        companion: { name: 'Слайми', level: 1, xp: 0, slimeLevels: {}, hunger: 82, clean: 88, energy: 92, sleeping: false, skin: 'basic', variant: 'normal', lastUpdate: Date.now() },
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
    };

    let env = { ticks: 0, currentEvent: 'day', eventTimer: 0, nextEventTimer: 75, potTimer: 0, potActive: false, activeNest: 0, activeEquip: 0, petPatCooldowns: {}, companionDrawer: '', companionShower: false, companionShowerTimer: null, companionPointerDown: false, companionPointer: null, companionPointerId: null, companionPointerStartedInZone: false, companionPointerStartX: 0, companionPointerStartY: 0, companionPointerLastX: 0, companionPointerLastY: 0, companionPointerStartedAt: 0, companionPetting: false, companionHoldTimer: null, companionTapTimer: null, companionHeartTimer: null, companionSpecial: '', companionSpecialTimer: null, companionSpecialEndTimer: null, companionAbilitySpecial: '', companionAbilitySpecialTimer: null, companionAbilityPayload: null, companionGiftTimers: [], companionSpecialAnchorX: 0, companionSpecialAnchorY: 0, companionCoinBurstAt: 0, gardenSlimePanelTab: 'profile', slimeFoodReaction: '', slimeFoodReactionTimer: null, harvestSelectedTile: null, harvestSelectionTimer: null, openMenuSections: { showcase: false, diary: false, decor: false, rewards: false, admin: false }, backroomsLampTimer: null, backroomsLampEndTimer: null, shopTab: 'seeds', decorShopTab: 'room', pendingPlotPurchase: null, abilityFloodTimer: null, sunpuddingEclipseTimer: null, sunpuddingEclipseDarkTimer: null, embergooMagmaTimers: [], stargumCometTimers: [], stargumCometFrames: [], stargumCometFinale: false, moonmeltLunarTimers: [], moonmeltLunarFinale: false, nightDawnTimer: null, nightDawnActive: false, nightPaletteFrame: null, nightPalette: null, nightPalettePhase: 'day', fpsMeterFrame: null, perfTelemetry: null, perfLongTaskObserver: null, lastCompanionVitalsAt: 0, rewardsRenderSignature: '', eventVisualFrame: null, eventStyleCache: {}, eventBackgroundLayer: 0 };
    let eventActions = []; 
    let tiles = Array(12).fill().map((_, i) => ({ id: i, active: false, plantId: null, growth: 0, water: 0, slimeWater: 0, slimeWaterMult: 1, hasWeed: false, mutations: [], scale: .4, weight: 1, weightMult: 1, sizeTier: 'small', beeLock: 0, ghostEchoPercent: 0, ghostMarked: false, ghostCopyMutationCount: 0, ghostEcho: false, ghostValue: 0 }));
    let currentTool = null;
    const TEST_HATCH_INSTANT = true;
    const TITANIC_CROP_CHANCE = 0.001;
    const HUGE_CROP_CHANCE = 0.01;
    const BIG_CROP_CHANCE = 0.09;
    const NORMAL_CROP_CHANCE = 0.65;
    const SMALL_WEIGHT_MIN = 1;
    const SMALL_WEIGHT_MAX = 10;
    const NORMAL_WEIGHT_MIN = 10;
    const NORMAL_WEIGHT_MAX = 50;
    const WATER_DURATION = 15;
    const CROP_INVENTORY_CAPACITY = 8;
    const COMPANION_ABILITY_DEFAULT_COOLDOWN_MS = 3 * 60 * 1000;
    const MATERIAL_MUTATIONS = new Set(['gold', 'rainbow', 'diamond']);
    const EVENT_BODY_CLASSES = ['rain', 'storm', 'toxic', 'starfall', 'holy', 'hell', 'candy', 'bee', 'alien', 'night', 'cosmic'].map(type => `event-${type}`);
    // These models already use ::after for their own body details, so honey needs a real child layer.
    const HONEY_CAP_MODEL_IDS = new Set(['pepper', 'corn', 'dragonfruit']);
    const BIG_WEIGHT_MIN = 50;
    const BIG_WEIGHT_MAX = 300;
    const HUGE_WEIGHT_MIN = 300;
    const HUGE_WEIGHT_MAX = 1000;
    const TITANIC_WEIGHT_MIN = 1000;
    const TITANIC_WEIGHT_MAX = 100000;
    
    const seedKeys = Object.keys(PLANTS);
    const BASE_STORE_SEEDS = ['carrot', 'cucumber'];
    const FREQUENT_STORE_SEEDS = ['tomato', 'pepper'];
    const DECOR_PAINT_COLORS = ['#ff7675', '#fdcb6e', '#55efc4', '#74b9ff', '#a29bfe', '#2ecc71'];
    const SIZE_DIARY_ENTRIES = {
        huge: { id: 'huge', name: 'Огромный', icon: 'H', mult: 'x3.5+' },
        titanic: { id: 'titanic', name: 'Титанический', icon: 'T', mult: 'x7+' }
    };
    // UNUSED: daily rewards are temporarily hidden while timed gifts are tuned.
    const DAILY_REWARDS_ENABLED = false;
    const DAILY_REWARD_INTERVAL = 24 * 60 * 60 * 1000;
    const TIMED_REWARD_STEP = 5 * 60 * 1000;
    const TIMED_REWARD_COOLDOWN = 60 * 60 * 1000;
    const SHOWCASE_PAYOUT_INTERVAL = 30 * 60 * 1000;
    // The mutation, its confirmation sound, and the full lava coverage happen together.
    const LAVA_MUTATION_COMMIT_DELAY_MS = 2200;
    const LAVA_MUTATION_REMOVE_DELAY_MS = 5800;
    const STARGUM_COMET_IMPACT_DELAY_MS = 2200;
    const STARGUM_COMET_CLEANUP_DELAY_MS = 3300;
    const STARGUM_COMET_PRELUDE_MS = 1080;
    const STARGUM_COMET_GAP_MS = 520;
    const MOONMELT_LUNAR_BEAM_COMMIT_DELAY_MS = 2050;
    const MOONMELT_LUNAR_BEAM_REMOVE_DELAY_MS = 2900;
    const MOONMELT_LUNAR_BEAM_GAP_MS = 960;
    const MOONMELT_BLOODMOON_BEAM_COMMIT_DELAY_MS = 1760;
    const MOONMELT_BLOODMOON_BEAM_REMOVE_DELAY_MS = 2500;
    const MOONMELT_BLOODMOON_BEAM_GAP_MS = 1040;
    const NIGHT_AMBIENCE_ENTER_MS = 3000;
    const NIGHT_AMBIENCE_EXIT_MS = 2300;
    const BLOODMOON_AMBIENCE_ENTER_MS = 1650;
    const EMBERGOO_MAGMA_FINALE_TIER2_CHANCE = 0.35;
    const EMBERGOO_MAGMA_SURGE_LEAD_MS = 3600;
    const EMBERGOO_MAGMA_COOLDOWN_MS = 1900;
    const TILE_TRANSIENT_EFFECT_CLASSES = new Set(['planting', 'sprout-emerge', 'sprout-mut-hit', 'strike', 'star-hit', 'candy-hit', 'toxic-hit', 'holy-hit', 'eclipse-hit', 'hell-hit', 'alien-hit', 'lava-hit', 'comet-hit', 'lunar-hit', 'bloodmoon-hit', 'slime-water-hit', 'slime-water-fade', 'midas-coin-hit', 'midas-diamond-hit', 'wave-rise-hit', 'ability-flooded', 'nectar-grow-hit', 'nectar-titanic-charge', 'nectar-titanic-flash', 'nectar-titanic-growing', 'crop-drag-source']);
    const TEST_MUTATION_SEQUENCE = ['hell', 'toxic', 'electric', 'stellar', 'holy', 'candy', 'honey', 'alien', 'lava', 'meteor', 'lunar', 'bloodmoon', 'gold', 'rainbow', 'diamond', 'eclipse'];
    const REMOVED_MUTATION_IDS = new Set(['void', 'phantom']);
    const TEST_MUTATION_HITS = {
        electric: { classes: ['strike'], sound: 'thunder', commitDelay: 300, removeDelay: 420 },
        stellar: { classes: ['star-hit'], sound: 'mut', commitDelay: 950, removeDelay: 1040 },
        candy: { classes: ['candy-hit'], sound: 'candy', commitDelay: 520, removeDelay: 1040 },
        toxic: { classes: ['toxic-hit'], sound: 'mut', commitDelay: 1020, removeDelay: 1120 },
        holy: { classes: ['holy-hit', 'sprout-mut-hit'], sound: 'holy', commitDelay: 850, removeDelay: 960 },
        eclipse: { classes: ['eclipse-hit'], sound: 'mut', commitDelay: 820, removeDelay: 940 },
        hell: { classes: ['hell-hit'], sound: 'hell', commitDelay: 850, removeDelay: 960 },
        alien: { classes: ['alien-hit'], sound: 'mut', commitDelay: 1100, removeDelay: 1210 },
        lava: { classes: ['lava-hit'], sound: 'hell', commitDelay: LAVA_MUTATION_COMMIT_DELAY_MS, removeDelay: LAVA_MUTATION_REMOVE_DELAY_MS },
        honey: { classes: ['bee-arrived'], sound: 'bee', commitDelay: 900, removeDelay: 1120 },
        default: { classes: ['sprout-mut-hit'], sound: 'mut', commitDelay: 360, removeDelay: 780 }
    };
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
        return { carrot: 6 };
    }

    function defaultShopState() {
        return { stock: {}, refreshAt: 0, merchantStock: {}, merchantArrivesAt: 0, merchantLeavesAt: 0, adEggViews: 0, adEggUnlocked: false };
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

    function defaultPurchasedPlots() {
        return Array.from({ length: tiles.length }, (_, idx) => idx).filter(idx => !PLOT_PURCHASE_COSTS[idx]);
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
        player.shop.adEggViews = Math.max(0, Math.min(10, Math.floor(Number(player.shop.adEggViews) || 0)));
        player.shop.adEggUnlocked = !!player.shop.adEggUnlocked || player.shop.adEggViews >= 10;
    }

    function ensureCropInventoryState() {
        const crops = Array.isArray(player.cropInventory) ? player.cropInventory : [];
        player.cropInventory = crops
            .filter(crop => crop && PLANTS[crop.plantId])
            .map((crop, index) => {
                const mutations = Array.isArray(crop.mutations) ? crop.mutations.filter(id => MUTATIONS[id]) : [];
                const weight = clampTileWeight(crop, PLANTS[crop.plantId]);
                const sizeTier = sizeTierFromWeight(weight, crop.sizeTier === 'titanic');
                const value = Math.max(1, Math.floor(Number(crop.value) || cropSaleValue(crop.plantId, mutations, weight, 0, sizeTier)));
                return {
                    ...crop,
                    uid: crop.uid || `crop-${Number(crop.createdAt) || Date.now()}-${index}`,
                    mutations,
                    weight: Math.round(weight * 10) / 10,
                    weightMult: Number(crop.weightMult) || getWeightMultiplier(weight, sizeTier),
                    sizeTier,
                    value,
                    createdAt: Number(crop.createdAt) || Date.now()
                };
            });
    }

    function ensurePlotPurchaseState() {
        if (!Array.isArray(player.purchasedPlots)) {
            player.purchasedPlots = defaultPurchasedPlots();
        }
        const normalized = new Set(defaultPurchasedPlots());
        player.purchasedPlots.forEach(idx => {
            const safeIdx = Math.floor(Number(idx));
            if (safeIdx >= 0 && safeIdx < tiles.length) normalized.add(safeIdx);
        });
        player.purchasedPlots = [...normalized].sort((a, b) => a - b);
    }

    function resetTilesState() {
        tiles.forEach((tile, index) => {
            Object.assign(tile, { id: index, active: false, plantId: null, growth: 0, water: 0, slimeWater: 0, slimeWaterMult: 1, hasWeed: false, mutations: [], scale: .4, weight: 1, weightMult: 1, sizeTier: 'small', beeLock: 0, ghostEchoPercent: 0, ghostMarked: false, ghostCopyMutationCount: 0, ghostEcho: false, ghostValue: 0 });
        });
    }

    function getBuffs() {
        const buffs = { speedMult: 0, coinMult: 0, mutChance: 0, weightMult: 0 };
        if (hasRewardCoinBoost()) buffs.coinMult += 1;
        return buffs;
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
        const roll = Math.random();
        if (roll < 0.015) return { size: 'normal', shiny: 'rainbow' };
        if (roll < 0.075) return { size: 'normal', shiny: 'gold' };
        if (roll < 0.155) return { size: 'huge', shiny: 'normal' };
        return { size: 'normal', shiny: 'normal' };
    }

    function companionVariantPet(variant = player.companion?.variant || 'normal') {
        if (variant === 'huge') return { size: 'huge', shiny: 'normal' };
        if (variant === 'gold') return { size: 'normal', shiny: 'gold' };
        if (variant === 'rainbow') return { size: 'normal', shiny: 'rainbow' };
        return { size: 'normal', shiny: 'normal' };
    }

    function ensureSlimeCollection() {
        if (!player.slimeCollection || typeof player.slimeCollection !== 'object' || Array.isArray(player.slimeCollection)) {
            player.slimeCollection = {};
        }
        const basicSaved = player.slimeCollection.basic || {};
        player.slimeCollection.basic = { owned: true, huge: !!basicSaved.huge, gold: !!basicSaved.gold, rainbow: !!basicSaved.rainbow };
        Object.keys(PET_DEFS).forEach(id => {
            const saved = player.slimeCollection[id] || {};
            player.slimeCollection[id] = {
                owned: !!saved.owned,
                huge: !!saved.huge,
                gold: !!saved.gold,
                rainbow: !!saved.rainbow
            };
        });
    }

    function slimeCollectionEntry(id) {
        ensureSlimeCollection();
        return player.slimeCollection[id] || { owned: false, huge: false, gold: false, rainbow: false };
    }

    function unlockSlimeCollectible(petId, variant = {}) {
        ensureSlimeCollection();
        const entry = slimeCollectionEntry(petId);
        entry.owned = true;
        if (variant.size === 'huge') entry.huge = true;
        if (variant.shiny === 'gold') entry.gold = true;
        if (variant.shiny === 'rainbow') entry.rainbow = true;
        return {
            uid: `collection-${petId}-${Date.now()}`,
            id: petId,
            level: companionLevelState(petId).level,
            hunger: 100,
            size: variant.size || 'normal',
            shiny: variant.shiny || 'normal',
            happy: false
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

    function getWeightMultiplier(weight, sizeTier = 'normal') {
        if (sizeTier === 'titanic') return 7;
        if (weight < BIG_WEIGHT_MIN) {
            return Math.max(0.5, Math.min(1.5, 0.5 + ((weight - SMALL_WEIGHT_MIN) / (BIG_WEIGHT_MIN - SMALL_WEIGHT_MIN))));
        }
        return 1.5 + Math.floor(weight / 100) * 0.5;
    }

    function sizeTierFromWeight(weight, forceTitanic = false) {
        if (forceTitanic) return 'titanic';
        if (weight >= HUGE_WEIGHT_MIN) return 'huge';
        if (weight >= BIG_WEIGHT_MIN) return 'big';
        if (weight >= NORMAL_WEIGHT_MIN) return 'normal';
        return 'small';
    }

    function weightCapForSizeTier(sizeTier = 'normal') {
        return sizeTier === 'titanic' ? TITANIC_WEIGHT_MAX : HUGE_WEIGHT_MAX;
    }

    function clampTileWeight(tile, plant = null) {
        const fallbackWeight = plant ? (plant.baseW * (tile?.scale || 1)) : 5;
        const forcedTier = tile?.sizeTier === 'titanic' ? 'titanic' : 'normal';
        const cap = weightCapForSizeTier(forcedTier);
        return Math.max(SMALL_WEIGHT_MIN, Math.min(cap, Number(tile?.weight) || fallbackWeight || SMALL_WEIGHT_MIN));
    }

    function resolveTileWeightState(tile, plant = null, buffs = null) {
        const activeBuffs = buffs || getBuffs();
        const baseWeight = clampTileWeight(tile, plant);
        const isTitanic = tile?.sizeTier === 'titanic';
        const sizeTier = sizeTierFromWeight(baseWeight, isTitanic);
        const weightCap = weightCapForSizeTier(sizeTier);
        const actualWeight = Math.max(SMALL_WEIGHT_MIN, Math.min(weightCap, baseWeight * (1 + (activeBuffs.weightMult || 0))));
        const resolvedTier = sizeTierFromWeight(actualWeight, sizeTier === 'titanic');
        return {
            baseWeight: Math.round(baseWeight * 10) / 10,
            actualWeight: Math.round(actualWeight * 10) / 10,
            weightCap,
            sizeTier: resolvedTier,
            weightMult: parseFloat(getWeightMultiplier(actualWeight, resolvedTier).toFixed(1)),
            scale: visualScaleForWeight(actualWeight, resolvedTier)
        };
    }

    function getPlotUnlockLevel(idx) {
        return PLOT_UNLOCK_LEVELS[idx] || 1;
    }

    function getPlotPurchaseCost(idx) {
        return PLOT_PURCHASE_COSTS[idx] || 0;
    }

    function isPlotLevelUnlocked(idx) {
        return player.lvl >= getPlotUnlockLevel(idx);
    }

    function isPlotPurchased(idx) {
        return Array.isArray(player.purchasedPlots) && player.purchasedPlots.includes(idx);
    }

    function isPlotUnlocked(idx) {
        return isPlotLevelUnlocked(idx) && isPlotPurchased(idx);
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
            if (plantId === 'carrot') return Math.floor(randomRange(4, 13));
            if (plantId === 'cucumber') return Math.floor(randomRange(2, 9));
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
        FREQUENT_STORE_SEEDS.forEach(id => {
            if (Math.random() < 0.82) stock[id] = rollSeedShopCount(id, true);
        });
        const extras = seedKeys.filter(id => !BASE_STORE_SEEDS.includes(id) && !FREQUENT_STORE_SEEDS.includes(id));
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
        return seedKeys.slice()
            .sort((a, b) => {
                const costDiff = (PLANTS[a]?.cost || 0) - (PLANTS[b]?.cost || 0);
                if (costDiff !== 0) return costDiff;
                return seedKeys.indexOf(a) - seedKeys.indexOf(b);
            });
    }

    function ensureSelectedSeedAvailable() {
        if (!PLANTS[currentTool]) return;
        if (getSeedOwned(currentTool) > 0) return;
        const nextSeed = getQuickSeedKeys().find(id => getSeedOwned(id) > 0);
        currentTool = nextSeed || null;
    }

    function visualScaleForWeight(weight, tier) {
        const scaleBetween = (minWeight, maxWeight, minScale, maxScale) => {
            const progress = Math.max(0, Math.min(1, (weight - minWeight) / (maxWeight - minWeight)));
            return parseFloat((minScale + (maxScale - minScale) * progress).toFixed(2));
        };
        if (tier === 'titanic') return scaleBetween(TITANIC_WEIGHT_MIN, TITANIC_WEIGHT_MAX, 2.4, 3.6);
        if (tier === 'huge') return scaleBetween(HUGE_WEIGHT_MIN, HUGE_WEIGHT_MAX, 1.8, 2.4);
        if (tier === 'big') return scaleBetween(BIG_WEIGHT_MIN, BIG_WEIGHT_MAX, 1.32, 1.8);
        if (tier === 'normal') return scaleBetween(NORMAL_WEIGHT_MIN, NORMAL_WEIGHT_MAX, .84, 1.32);
        return scaleBetween(SMALL_WEIGHT_MIN, SMALL_WEIGHT_MAX, .48, .84);
    }

    function rollCropWeight() {
        const r = Math.random();
        let tier = 'small';
        let weight = randomRange(SMALL_WEIGHT_MIN, SMALL_WEIGHT_MAX);

        if (r < TITANIC_CROP_CHANCE) {
            tier = 'titanic';
            weight = randomRange(TITANIC_WEIGHT_MIN, TITANIC_WEIGHT_MAX);
        } else if (r < TITANIC_CROP_CHANCE + HUGE_CROP_CHANCE) {
            tier = 'huge';
            weight = randomRange(HUGE_WEIGHT_MIN, HUGE_WEIGHT_MAX);
        } else if (r < TITANIC_CROP_CHANCE + HUGE_CROP_CHANCE + BIG_CROP_CHANCE) {
            tier = 'big';
            weight = randomRange(BIG_WEIGHT_MIN, BIG_WEIGHT_MAX);
        } else if (r < TITANIC_CROP_CHANCE + HUGE_CROP_CHANCE + BIG_CROP_CHANCE + NORMAL_CROP_CHANCE) {
            tier = 'normal';
            weight = randomRange(NORMAL_WEIGHT_MIN, NORMAL_WEIGHT_MAX);
        }

        weight = Math.round(weight * 10) / 10;
        return {
            tier,
            weight,
            weightMult: parseFloat(getWeightMultiplier(weight, tier).toFixed(1)),
            scale: visualScaleForWeight(weight, tier)
        };
    }

    function formatWeight(value) {
        const safe = Number(value) || 0;
        if (safe >= 1000) return `${(safe / 1000).toFixed(1).replace('.', ',')}m`;
        return safe.toFixed(1).replace('.', ',');
    }

    function formatWeightLabel(value) {
        const safe = Number(value) || 0;
        return safe >= 1000 ? formatWeight(safe) : `${formatWeight(safe)}кг`;
    }

    function formatInspectWeight(value) {
        const safe = Math.max(0, Number(value) || 0);
        return `${safe.toLocaleString('ru-RU', { maximumFractionDigits: 1 })} кг`;
    }

    function getWeedReward(level = player.lvl) {
        const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
        const base = BALANCE.weedBaseReward || 75;
        const growth = BALANCE.weedRewardGrowth || 0.35;
        return Math.max(1, Math.round(base * Math.pow(1 + growth, safeLevel - 1)));
    }

    function inspectCropValue(tile) {
        const plant = PLANTS[tile.plantId];
        if (!plant) return 0;
        const buffs = getBuffs();
        const resolved = resolveTileWeightState(tile, plant, buffs);
        return cropSaleValue(plant.id, tile.mutations || [], resolved.actualWeight, buffs.coinMult, resolved.sizeTier);
    }

    function hidePlantInspectCard() {
        const card = document.getElementById('plant-inspect-card');
        if (!card) return;
        card.hidden = true;
        card.innerHTML = '';
    }

    function showPlantInspectCard(idx) {
        const t = tiles[idx];
        if (!t.active || !t.plantId) {
            hidePlantInspectCard();
            return;
        }
        const plant = PLANTS[t.plantId];
        const buffs = getBuffs();
        const resolved = resolveTileWeightState(t, plant, buffs);
        const value = inspectCropValue(t);
        const mutationTags = (t.mutations || []).length
            ? t.mutations.map(mId => {
                const mut = MUTATIONS[mId];
                return mut ? `<span class="plant-inspect-tag">${mut.icon} ${mut.name}</span>` : '';
            }).join('')
            : '<span class="plant-inspect-tag">Нет мутаций</span>';
        const growthLabel = t.growth >= 100 ? 'Готово' : `${Math.floor(t.growth)}%`;
        const sizeLabels = {
            small: 'Маленький',
            normal: 'Обычный',
            big: 'Большой',
            huge: 'Огромный',
            titanic: 'Титанический'
        };
        const sizeLabel = sizeLabels[t.sizeTier] || sizeLabels[resolved.sizeTier] || 'Обычный';
        const card = document.getElementById('plant-inspect-card');
        if (!card) return;
        card.innerHTML = `
            <div class="plant-inspect-title">
                <span>${plant.icon || '🌱'}</span>
                <span>${plant.name}</span>
            </div>
            <div class="plant-inspect-grid">
                <div class="plant-inspect-cell">
                    <small>Стоимость</small>
                    <b>${compactNumber(value)}$</b>
                </div>
                <div class="plant-inspect-cell">
                    <small>Вес</small>
                    <b>${formatInspectWeight(resolved.actualWeight)}</b>
                </div>
                <div class="plant-inspect-cell">
                    <small>Рост</small>
                    <b>${growthLabel}</b>
                </div>
                <div class="plant-inspect-cell">
                    <small>Размер</small>
                    <b>${sizeLabel}</b>
                </div>
            </div>
            <div class="plant-inspect-muts">
                <small>Мутации</small>
                <div class="plant-inspect-tags">${mutationTags}</div>
            </div>
        `;
        card.hidden = false;
    }

    function slimeHTML(def, pet = {}, size = 'medium') {
        const slime = def.slime || {};
        const goldSparkles = pet.shiny === 'gold'
            ? '<i class="slime-gold-sparkles" aria-hidden="true"><b></b><b></b><b></b></i>'
            : '';
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
        return `<span class="${classes}" style="--slime-body:${slime.body || '#74b9ff'}; --slime-shade:${slime.shade || '#0984e3'}; --slime-blush:${slime.blush || '#ffb3c7'};">${goldSparkles}<i class="slime-face"><span class="slime-eye left"></span><span class="slime-eye right"></span><span class="slime-mouth"></span></i><i class="slime-decor"></i></span>`;
    }

    function seedIcon(id, extraClass = '') {
        return `<span class="seed-icon-art seed-${id} ${extraClass}" aria-hidden="true"></span>`;
    }

    function compactNumber(value) {
        const n = Math.max(0, Math.floor(Number(value) || 0));
        const units = [
            [1000000000000, 'T'],
            [1000000000, 'B'],
            [1000000, 'M'],
            [1000, 'K']
        ];
        const unit = units.find(([threshold]) => n >= threshold);
        if (!unit) return `${n}`;
        const scaled = n / unit[0];
        const decimals = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
        return `${scaled.toFixed(decimals).replace(/\.0+$/, '').replace('.', ',')}${unit[1]}`;
    }

    function compactCoinMarkup(value) {
        const label = compactNumber(value);
        const match = label.match(/^(.*?)([KMBT])$/);
        if (!match) return `<b class="coin-number">${label}</b>`;
        return `<b class="coin-number">${match[1]}</b><small class="coin-abbrev">${match[2]}</small>`;
    }

    function cropSizePercent(weight, sizeTier) {
        return Math.round(visualScaleForWeight(weight, sizeTier) * 100);
    }

    function cropSaleValue(plantId, mutations, weight, coinMult = 0, sizeTier = 'normal') {
        const p = PLANTS[plantId];
        if (!p) return 0;
        let mutationMult = 1;
        (mutations || []).forEach(mId => {
            const m = MUTATIONS[mId];
            if (m) mutationMult *= m.mult;
        });
        return Math.floor(p.reward * mutationMult * (1 + coinMult) * getWeightMultiplier(weight, sizeTier));
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

    function recordCropStats(crop, earned = 0, countTraits = true, options = {}) {
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
                if (!options.quiet) showBigMutation(mId);
            }
        });
        if (env.openMenuSections.diary) renderDiary();
        if (crop.sizeTier === 'big' || crop.sizeTier === 'huge' || crop.sizeTier === 'titanic') {
            player.rares[crop.sizeTier] = (player.rares[crop.sizeTier] || 0) + 1;
        }
    }

    function totalShowcaseIncome() {
        return (player.showcase || []).reduce((sum, crop) => sum + showcaseIncome(crop), 0);
    }

    function ensureShowcasePayoutState() {
        const now = Date.now();
        player.showcasePayoutAt = Math.max(0, Number(player.showcasePayoutAt) || ((Number(player.lastSaved) || now) + SHOWCASE_PAYOUT_INTERVAL));
        player.showcasePayoutRemainder = Math.max(0, Number(player.showcasePayoutRemainder) || 0);
    }

    function processShowcasePayout(maxCycles = 4) {
        ensureShowcasePayoutState();
        const now = Date.now();
        if (now < player.showcasePayoutAt) return;
        const cycles = Math.max(1, Math.min(maxCycles, Math.floor((now - player.showcasePayoutAt) / SHOWCASE_PAYOUT_INTERVAL) + 1));
        const pending = totalShowcaseIncome() * (cycles / 2) + player.showcasePayoutRemainder;
        const payout = Math.floor(pending);
        player.showcasePayoutRemainder = pending - payout;
        player.bank += payout;
        player.showcasePayoutAt += cycles * SHOWCASE_PAYOUT_INTERVAL;
        if (env.openMenuSections?.showcase) renderShowcase();
    }

    function cropSnapshotFromTile(idx) {
        const t = tiles[idx];
        const p = t && PLANTS[t.plantId];
        if (!t || !p || !t.active || t.growth < 100) return null;
        const buffs = getBuffs();
        const resolved = resolveTileWeightState(t, p, buffs);
        const weight = resolved.actualWeight;
        const sizeTier = resolved.sizeTier;
        const mutations = [...(t.mutations || [])];
        const value = t.ghostValue > 0 ? Math.floor(t.ghostValue) : cropSaleValue(p.id, mutations, weight, buffs.coinMult, sizeTier);
        return {
            plantId: p.id,
            mutations,
            weight: Math.round(weight * 10) / 10,
            weightMult: resolved.weightMult,
            sizeTier,
            value,
            income: Math.max(1, Math.floor(value * 0.08)),
            ghostValue: t.ghostValue || 0,
            createdAt: Date.now()
        };
    }

    function cropBadgesHTML(mutations) {
        if (!mutations || mutations.length === 0) return '';
        return `<div class="showcase-mutation-strip" aria-label="Мутации растения">${mutations.map(mId => {
            const m = MUTATIONS[mId];
            return m ? `<div class="mut-badge" style="--mut-color:${m.color};">${m.icon}</div>` : '';
        }).join('')}</div>`;
    }

    function mutationAuraEffectHTML(mId, mutation, order) {
        if (!mutation) return '';
        const cometParticles = mId === 'meteor' ? '<i class="comet-particle"></i>'.repeat(4) : '';
        const candyPieces = mId === 'candy'
            ? '<i class="candy-float">🍬</i><i class="candy-float">🍭</i><i class="candy-float">🍫</i>'
            : '';
        const lunarLight = (mId === 'lunar' || mId === 'bloodmoon')
            ? '<i class="lunar-beam"></i><i class="lunar-pool"></i><i class="lunar-speck speck-one"></i><i class="lunar-speck speck-two"></i><i class="lunar-speck speck-three"></i>'
            : '';
        return `<span class="mut-effect fx-${mId}" style="--mut-color:${mutation.color}; --i:${order};">${cometParticles}${candyPieces}${lunarLight}</span>`;
    }

    function toxicPuddleHTML() {
        return '<div class="toxic-cloud" aria-hidden="true"></div><i class="acid-bubble acid-bubble-one" aria-hidden="true"></i><i class="acid-bubble acid-bubble-two" aria-hidden="true"></i><i class="acid-bubble acid-bubble-three" aria-hidden="true"></i>';
    }

    function activeSurface() {
        if (document.getElementById('shop-modal')?.classList.contains('open')) return 'shop';
        if (document.getElementById('side-menu')?.classList.contains('open')) return 'menu';
        return 'garden';
    }

    function isGardenSurfaceActive() {
        return !document.hidden && activeSurface() === 'garden';
    }

    function isElementSurfaceActive(element) {
        if (!element || document.hidden) return false;
        const surface = activeSurface();
        if (element.closest('#garden')) return surface === 'garden';
        if (element.closest('#shop-modal')) return surface === 'shop';
        const fold = element.closest('.menu-fold');
        if (element.closest('#side-menu')) return surface === 'menu' && (!fold || fold.classList.contains('open'));
        return true;
    }

    function syncActiveSurfaceState() {
        const surface = activeSurface();
        document.body.classList.toggle('surface-garden-active', surface === 'garden');
        document.body.classList.toggle('surface-menu-active', surface === 'menu');
        document.body.classList.toggle('surface-shop-active', surface === 'shop');
        document.getElementById('garden')?.classList.toggle('effects-suspended', surface !== 'garden');
        if (surface === 'garden') scheduleMutationGeometryRefresh();
    }

    function mutationPresentationParts(mutations) {
        const badges = [];
        const auraEffects = [];
        const candyEffects = [];
        (mutations || []).forEach((mId, order) => {
            const mutation = MUTATIONS[mId];
            if (!mutation) return;
            badges.push(`<div class="mut-badge" style="--mut-color:${mutation.color};">${mutation.icon}</div>`);
            const effect = mutationAuraEffectHTML(mId, mutation, order);
            if (mId === 'candy') candyEffects.push(effect);
            else auraEffects.push(effect);
        });
        return { badges: badges.join(''), aura: auraEffects.join(''), candy: candyEffects.join('') };
    }

    function renderMutationPresentation(mutations, aura, candyAura, mutContainer) {
        const parts = mutationPresentationParts(mutations);
        aura.className = 'mutation-aura';
        candyAura.className = 'mutation-aura candy-front-aura';
        aura.innerHTML = parts.aura;
        candyAura.innerHTML = parts.candy;
        mutContainer.innerHTML = parts.badges;
        if (parts.aura) aura.classList.add('active', `stack-${Math.min(mutations.length, 3)}`);
        if (parts.candy) candyAura.classList.add('active');
    }

    function syncToxicPuddleMarkup(tileEl, enabled) {
        const cloud = tileEl.querySelector(':scope > .toxic-cloud');
        if (enabled && !cloud) {
            const anchor = tileEl.querySelector(':scope > .mutation-aura');
            anchor?.insertAdjacentHTML('beforebegin', toxicPuddleHTML());
            return;
        }
        if (!enabled && cloud) {
            cloud.remove();
            tileEl.querySelectorAll(':scope > .acid-bubble').forEach(bubble => bubble.remove());
        }
    }

    function cropMutationAuraHTML(mutations) {
        if (!mutations || mutations.length === 0) return '';
        const backMutations = mutations.filter(mId => mId === 'lunar' || mId === 'bloodmoon');
        const frontMutations = mutations.filter(mId => mId !== 'lunar' && mId !== 'bloodmoon');
        const layerHTML = (items, className) => items.length
            ? `<div class="mutation-aura active ${className} stack-${Math.min(items.length, 3)}">${items.map((mId, order) => {
                const m = MUTATIONS[mId];
                return mutationAuraEffectHTML(mId, m, order);
            }).join('')}</div>`
            : '';
        return layerHTML(backMutations, 'showcase-back-aura') + layerHTML(frontMutations, 'showcase-front-aura');
    }

    function shouldUseHoneyCap(plantId, mutations) {
        if (!mutations?.includes('honey')) return false;
        return mutations[0] !== 'honey' || HONEY_CAP_MODEL_IDS.has(plantId);
    }

    function honeyCapHTML(plantId, mutations) {
        return shouldUseHoneyCap(plantId, mutations) ? '<span class="honey-cap" aria-hidden="true"></span>' : '';
    }

    function honeyDropsHTML(mutations) {
        if (!mutations?.includes('honey')) return '';
        return [-12, 0, 12].map((offset, index) =>
            `<i class="honey-drop" aria-hidden="true" style="left:calc(50% + ${offset}px); animation-delay:${index * 0.5}s"></i>`
        ).join('');
    }

    function showcaseCropHTML(crop, options = {}) {
        if (!crop || !PLANTS[crop.plantId]) return '';
        const p = PLANTS[crop.plantId];
        // Showcase uses one dependable model scale. Garden size tiers remain in crop data and labels,
        // but the compact card has a single coordinate system for every mutation visual.
        const scale = Math.max(.72, Math.min(1.22, Number(options.modelScale) || 1));
        const stageScale = Math.max(.62, Math.min(.82, Number(options.stageScale) || .78));
        const mutations = crop.mutations || [];
        const mutClasses = mutations.map(mId => `mut-${mId}`).join(' ');
        const primary = mutations[0] ? `primary-${mutations[0]}` : '';
        return `
            <div class="showcase-crop-art">
                <div class="showcase-tile-preview tile occupied ready crop-normal ${mutClasses} ${primary}" data-source-size="${crop.sizeTier || 'normal'}" style="--plant-scale:${scale}; --crop-color:${p.color}; --showcase-stage-scale:${stageScale};">
                    ${mutations.includes('toxic') ? toxicPuddleHTML() : ''}
                    ${cropMutationAuraHTML(mutations)}
                    <div class="plant-wrapper">
                        <div class="model visible model-${p.id} ready">${honeyCapHTML(p.id, mutations)}</div>
                        ${honeyDropsHTML(mutations)}
                    </div>
                </div>
            </div>
            ${cropBadgesHTML(mutations)}
        `;
    }

    // Showcase cards use the same model-bound mutation placement as garden tiles.
    function syncShowcasePreviewVisuals(root) {
        if (!root) return;
        requestAnimationFrame(() => {
            root.querySelectorAll('.showcase-tile-preview').forEach(preview => {
                if (!preview.isConnected) return;
                const aura = preview.querySelector('.mutation-aura');
                const model = preview.querySelector('.model');
                if (model) queueModelBoundMutationGeometry(preview, model);
            });
        });
    }

function init() {
        setGameLoaderProgress(18, 'Загружаем сохранение...');
        loadGame();
        startEvent('day');
        setGameLoaderProgress(38, 'Собираем грядки...');
        renderGarden();
        renderSeeds();
        generateQuestsIfNeeded();
        calcOfflineBank();
        setGameLoaderProgress(68, 'Готовим модели и эффекты...');
        updateUI();
        updateAdminMutationCycleButton();
        document.getElementById('seeds-window').addEventListener('scroll', scheduleCarouselArrowUpdate, { passive: true });
        window.addEventListener('resize', refreshSeedCarouselMetrics, { passive: true });
        document.getElementById('garden').addEventListener('pointerdown', handleGardenDecorTap);
        document.addEventListener('pointerdown', (event) => {
            const inspectCard = document.getElementById('plant-inspect-card');
            if (!inspectCard || inspectCard.hidden) return;
            if (event.target.closest('.tile') || event.target.closest('#plant-inspect-card') || event.target.closest('.action-btn[data-tool="inspect"]')) return;
            hidePlantInspectCard();
        }, { passive: true });
        document.addEventListener('pointerdown', (event) => {
            if (env.harvestSelectedTile !== null && !event.target.closest('.tile,.garden-crop-action')) clearHarvestSelection();
        }, { passive: true });
        bindPressFeedback();
        setupMutationPerformanceObservers();
        syncActiveSurfaceState();
        setInterval(gameTick, 1000);
        setInterval(realtimeUiTick, 500);
        setInterval(saveGame, 10000);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) saveGame();
        });
        window.addEventListener('pagehide', saveGame);
        scheduleCompanionSpecial();
        finishGameLoading();
    }

    function initFpsMeter() {
        const meter = document.getElementById('fps-meter');
        const value = document.getElementById('fps-value');
        if (!meter || !value || env.fpsMeterFrame) return;

        initPerformanceTelemetry();

        let frames = 0;
        let sampleStartedAt = performance.now();
        let previousFrameAt = sampleStartedAt;
        let resetAfterHidden = false;
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) resetAfterHidden = true;
        }, { passive: true });
        const sample = now => {
            const frameMs = now - previousFrameAt;
            previousFrameAt = now;
            // Time spent in another app is not game FPS; a visible freeze is recorded separately.
            if (resetAfterHidden) {
                resetAfterHidden = false;
                frames = 0;
                sampleStartedAt = now;
                env.fpsMeterFrame = requestAnimationFrame(sample);
                return;
            }
            if (frameMs >= 1000) {
                value.textContent = '0';
                meter.dataset.state = 'bad';
                recordPerformanceEvent('frame-freeze', { frameMs: Math.round(frameMs) }, 1000);
                recordFpsSample(0, frameMs);
                frames = 0;
                sampleStartedAt = now;
                env.fpsMeterFrame = requestAnimationFrame(sample);
                return;
            }
            frames += 1;
            if (frameMs >= 55 && frameMs < 1000) recordPerformanceEvent('frame-stall', { frameMs: Math.round(frameMs) }, 1400);
            const elapsed = now - sampleStartedAt;
            if (elapsed >= 500) {
                const fps = Math.round((frames * 1000) / elapsed);
                value.textContent = String(Math.min(120, fps));
                meter.dataset.state = fps >= 50 ? 'good' : fps >= 30 ? 'warn' : 'bad';
                recordFpsSample(fps, elapsed);
                frames = 0;
                sampleStartedAt = now;
            }
            env.fpsMeterFrame = requestAnimationFrame(sample);
        };

        env.fpsMeterFrame = requestAnimationFrame(sample);
    }

    function initPerformanceTelemetry() {
        if (env.perfTelemetry) return;
        env.perfTelemetry = {
            startedAt: new Date().toISOString(),
            entries: [],
            actionTrail: [],
            samples: [],
            lowestFps: 120,
            lastEventAt: {},
            maxEntries: 240
        };
        document.addEventListener('pointerdown', event => trackPerformanceAction(event.target), { passive: true, capture: true });

        if (!('PerformanceObserver' in window)) return;
        try {
            env.perfLongTaskObserver = new PerformanceObserver(list => {
                list.getEntries().forEach(entry => {
                    recordPerformanceEvent('long-task', { durationMs: Math.round(entry.duration) }, 500);
                });
            });
            env.perfLongTaskObserver.observe({ entryTypes: ['longtask'] });
        } catch (_) {
            // Long Tasks API is not available in every mobile browser; frame samples remain enough there.
        }
    }

    function getPerformanceSnapshot() {
        const planted = tiles.filter(tile => tile.active && tile.plantId);
        const ready = planted.filter(tile => tile.growth >= 100).length;
        const mutationCount = planted.reduce((sum, tile) => sum + (tile.mutations?.length || 0), 0);
        const mutationTypes = {};
        planted.forEach(tile => (tile.mutations || []).forEach(id => {
            mutationTypes[id] = (mutationTypes[id] || 0) + 1;
        }));
        const surface = activeSurface();
        return {
            surface,
            event: env.currentEvent || 'day',
            eventSecondsLeft: Math.max(0, Math.ceil(Number(env.eventTimer) || 0)),
            plants: planted.length,
            ready,
            growing: planted.length - ready,
            mutations: mutationCount,
            mutationTypes,
            transientEffects: surface === 'garden'
                ? document.querySelectorAll('.lava-hit,.comet-hit,.lunar-hit,.bloodmoon-hit,.strike,.toxic-hit,.hell-hit,.wave-rise-hit').length
                : 0,
            recentActions: env.perfTelemetry?.actionTrail.slice(-6) || []
        };
    }

    function recordPerformanceEvent(type, detail = {}, cooldownMs = 0) {
        const telemetry = env.perfTelemetry;
        if (!telemetry || document.hidden) return;
        const now = performance.now();
        if (cooldownMs && now - (telemetry.lastEventAt[type] || 0) < cooldownMs) return;
        telemetry.lastEventAt[type] = now;
        telemetry.entries.push({
            atMs: Math.round(now),
            type,
            ...detail,
            snapshot: getPerformanceSnapshot()
        });
        if (telemetry.entries.length > telemetry.maxEntries) telemetry.entries.splice(0, telemetry.entries.length - telemetry.maxEntries);
        const panel = document.getElementById('perf-panel');
        if (panel && !panel.hidden) updatePerfPanel();
    }

    function recordFpsSample(fps, elapsed) {
        const telemetry = env.perfTelemetry;
        if (!telemetry || document.hidden) return;
        telemetry.lowestFps = Math.min(telemetry.lowestFps, fps);
        telemetry.samples.push({ atMs: Math.round(performance.now()), fps, windowMs: Math.round(elapsed) });
        if (telemetry.samples.length > 120) telemetry.samples.shift();
        if (fps < 45) recordPerformanceEvent('low-fps', { fps, windowMs: Math.round(elapsed) }, 2400);
    }

    function trackPerformanceAction(target) {
        const telemetry = env.perfTelemetry;
        if (!telemetry || !(target instanceof Element)) return;
        const tile = target.closest('.tile');
        const tool = target.closest('[data-tool]');
        const seed = target.closest('[data-seed]');
        const action = tile ? `tile:${tile.id.replace('tile-', '') || '?'}`
            : tool ? `tool:${tool.dataset.tool}`
            : seed ? `seed:${seed.dataset.seed}`
            : target.closest('#companion-quick-ability') ? 'slime-ability'
            : target.closest('#menu-btn') ? 'open-menu'
            : target.closest('#shop-btn') ? 'open-shop'
            : target.closest('#fps-meter') ? 'open-performance-panel'
            : '';
        if (!action) return;
        const now = performance.now();
        const previous = telemetry.actionTrail.at(-1);
        if (previous?.action === action && now - previous.atMs < 700) {
            previous.count += 1;
            previous.atMs = Math.round(now);
        } else {
            telemetry.actionTrail.push({ atMs: Math.round(now), action, count: 1 });
            if (telemetry.actionTrail.length > 32) telemetry.actionTrail.shift();
        }
    }

    function togglePerfPanel() {
        const panel = document.getElementById('perf-panel');
        if (!panel) return;
        panel.hidden = !panel.hidden;
        if (!panel.hidden) updatePerfPanel();
    }

    function updatePerfPanel() {
        const summary = document.getElementById('perf-summary');
        const telemetry = env.perfTelemetry;
        if (!summary || !telemetry) return;
        summary.textContent = `Запись включена · проблем: ${telemetry.entries.length} · минимум: ${telemetry.lowestFps === 120 ? '--' : telemetry.lowestFps} FPS`;
    }

    function clearPerformanceReport() {
        const telemetry = env.perfTelemetry;
        if (!telemetry) return;
        telemetry.startedAt = new Date().toISOString();
        telemetry.entries.length = 0;
        telemetry.actionTrail.length = 0;
        telemetry.samples.length = 0;
        telemetry.lowestFps = 120;
        telemetry.lastEventAt = {};
        updatePerfPanel();
    }

    function downloadPerformanceReport() {
        const telemetry = env.perfTelemetry;
        if (!telemetry) return;
        const report = {
            format: 'grow-a-farm-performance-report-v1',
            startedAt: telemetry.startedAt,
            exportedAt: new Date().toISOString(),
            device: {
                userAgent: navigator.userAgent,
                screen: `${window.screen.width}x${window.screen.height}`,
                deviceMemoryGb: navigator.deviceMemory || null,
                cpuThreads: navigator.hardwareConcurrency || null
            },
            summary: {
                lowestFps: telemetry.lowestFps === 120 ? null : telemetry.lowestFps,
                issueCount: telemetry.entries.length,
                sampleCount: telemetry.samples.length
            },
            currentSnapshot: getPerformanceSnapshot(),
            entries: telemetry.entries,
            fpsSamples: telemetry.samples
        };
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `grow-a-farm-perf-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 0);
    }

    function setGameLoaderProgress(value, label) {
        const loader = document.getElementById('game-loader');
        if (!loader) return;
        const safe = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
        loader.style.setProperty('--loader-progress', `${safe}%`);
        const fill = document.getElementById('game-loader-fill');
        const percent = document.getElementById('game-loader-percent');
        const status = document.getElementById('game-loader-status');
        if (fill) fill.style.width = `${safe}%`;
        if (percent) percent.textContent = `${safe}%`;
        if (status && label) status.textContent = label;
    }

    async function preloadGameAssets() {
        const urls = [...new Set([
            ...(window.gamePreloadAssets || []),
            ...[...document.querySelectorAll('img[src], audio[src], video[src], source[src]')]
                .map(node => node.currentSrc || node.src)
                .filter(Boolean)
        ])];
        if (!urls.length) return;
        await Promise.allSettled(urls.map(url => new Promise(resolve => {
            let settled = false;
            const finish = () => {
                if (settled) return;
                settled = true;
                resolve();
            };
            setTimeout(finish, 3000);
            if (/\.(?:mp3|wav|ogg|m4a)(?:[?#].*)?$/i.test(url)) {
                const audio = new Audio();
                audio.preload = 'auto';
                audio.oncanplaythrough = audio.onerror = finish;
                audio.src = url;
                audio.load();
                return;
            }
            const image = new Image();
            image.onload = image.onerror = finish;
            image.src = url;
        })));
    }

    const ISOLATED_EVENT_TYPES = new Set(['rain', 'storm', 'toxic', 'starfall', 'holy', 'hell', 'candy', 'bee', 'alien', 'cosmic']);
    const EVENT_OVERLAY_SELECTORS = ['.weather-overlay', '.holy-bg-rays', '.hell-bg-fire', '.night-sky-layer'];

    function copyComputedEventStyle(style) {
        return {
            display: style.display,
            opacity: style.opacity,
            backgroundColor: style.backgroundColor,
            backgroundImage: style.backgroundImage,
            backgroundSize: style.backgroundSize,
            backgroundPosition: style.backgroundPosition,
            backgroundRepeat: style.backgroundRepeat,
            filter: style.filter,
            animationName: style.animationName,
            animationDuration: style.animationDuration,
            animationTimingFunction: style.animationTimingFunction,
            animationIterationCount: style.animationIterationCount,
            animationDirection: style.animationDirection
        };
    }

    function applyInlineEventStyle(element, style) {
        if (!element) return;
        const properties = ['display', 'opacity', 'backgroundColor', 'backgroundImage', 'backgroundSize', 'backgroundPosition', 'backgroundRepeat', 'filter', 'animationName', 'animationDuration', 'animationTimingFunction', 'animationIterationCount', 'animationDirection'];
        properties.forEach(property => { element.style[property] = style?.[property] || ''; });
    }

    function applyIsolatedEventVisual(type) {
        const ambience = document.getElementById('event-ambience');
        if (!ambience) return;
        EVENT_BODY_CLASSES.forEach(className => ambience.classList.remove(className));
        const cache = env.eventStyleCache?.[`event-${type}`];
        const isIsolated = ISOLATED_EVENT_TYPES.has(type) && cache;
        ambience.classList.toggle('is-visible', !!isIsolated);
        if (isIsolated) ambience.classList.add(`event-${type}`);

        const layers = ambience.querySelectorAll('.event-background-layer');
        if (layers.length === 2) {
            const nextIndex = env.eventBackgroundLayer === 0 ? 1 : 0;
            const next = layers[nextIndex];
            const previous = layers[env.eventBackgroundLayer || 0];
            applyInlineEventStyle(next, cache?.body);
            next.style.display = 'block';
            next.style.opacity = '';
            next.classList.add('is-active');
            previous.classList.remove('is-active');
            env.eventBackgroundLayer = nextIndex;
        }
        EVENT_OVERLAY_SELECTORS.forEach(selector => {
            applyInlineEventStyle(ambience.querySelector(selector), isIsolated ? cache.overlays?.[selector] : null);
        });
    }

    function setBodyEventClass(type) {
        const nextClass = type && type !== 'day' ? `event-${type}` : '';
        EVENT_BODY_CLASSES.forEach(className => {
            if (className !== nextClass) document.body.classList.remove(className);
        });
        // Night changes several UI palettes. Regular events are isolated from the app tree
        // so their start/end cannot invalidate every plant and menu selector at once.
        if (nextClass && !ISOLATED_EVENT_TYPES.has(type)) document.body.classList.add(nextClass);
        applyIsolatedEventVisual(type);
    }

    async function prewarmEventStyles() {
        // Event backgrounds are CSS-generated. Resolve their gradients once behind the loader
        // so the first real event does not pay that compilation cost during play.
        document.documentElement.classList.add('app-style-prewarm');
        for (const className of EVENT_BODY_CLASSES) {
            EVENT_BODY_CLASSES.forEach(candidate => document.body.classList.remove(candidate));
            document.body.classList.add(className);
            const bodyStyle = getComputedStyle(document.body);
            const overlays = {};
            EVENT_OVERLAY_SELECTORS.forEach(selector => {
                const element = document.querySelector(selector);
                if (element) overlays[selector] = copyComputedEventStyle(getComputedStyle(element));
            });
            env.eventStyleCache[className] = {
                body: copyComputedEventStyle(bodyStyle),
                overlays
            };
            await new Promise(resolve => requestAnimationFrame(resolve));
        }
        EVENT_BODY_CLASSES.forEach(className => document.body.classList.remove(className));
        document.documentElement.classList.remove('app-style-prewarm');
        setBodyEventClass(env.currentEvent);
        syncActiveSurfaceState();
    }

    async function finishGameLoading() {
        setGameLoaderProgress(82, 'Проверяем ресурсы...');
        await Promise.allSettled([
            preloadGameAssets(),
            document.fonts?.ready || Promise.resolve()
        ]);
        setGameLoaderProgress(90, 'Прогреваем графику...');
        await prewarmEventStyles();
        setGameLoaderProgress(94, 'Запускаем ферму...');
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        window.YandexGames?.gameReady();
        setGameLoaderProgress(100, 'Готово!');
        initFpsMeter();
        const loader = document.getElementById('game-loader');
        if (!loader) return;
        setTimeout(() => {
            loader.classList.add('is-ready');
            loader.addEventListener('transitionend', () => loader.remove(), { once: true });
            setTimeout(() => loader.remove(), 900);
        }, 180);
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

    function computeTileLayer(tile, index) {
        const baseLayer = (index % 3) === 1 ? 3 : 1;
        if (!tile || !tile.active) return baseLayer;
        if (tile.sizeTier === 'titanic') return Math.max(baseLayer, 34);
        if (tile.sizeTier === 'huge') return Math.max(baseLayer, 28);
        if (tile.sizeTier === 'big') return Math.max(baseLayer, 18);
        return baseLayer;
    }

    function renderGarden() {
        const g = document.getElementById('garden');
        g.className = `garden style-${player.plotStyle || 'default'}`;
        applyDecorVars(g);
        g.innerHTML = '';
        const fragment = document.createDocumentFragment();
        tiles.forEach((t, i) => {
            const el = document.createElement('div');
            el.className = 'tile';
            el.id = `tile-${i}`;
            el.style.setProperty('--tile-layer', `${computeTileLayer(t, i)}`);
            el.innerHTML = `
                <div class="tile-lock" id="lock-${i}">
                    <span class="lock-icon" aria-hidden="true"></span>
                    <small id="lock-level-${i}"></small>
                    <small id="lock-price-${i}" class="lock-price"></small>
                </div>
                <div class="tile-soil-detail" aria-hidden="true"></div>
                <div class="planting-feedback" aria-hidden="true"><i></i><i></i><i></i></div>
                <div class="mutation-aura" id="aura-${i}"></div>
                <div class="mutation-aura candy-front-aura" id="candy-aura-${i}"></div>
                <div class="tile-progress"><div class="progress-fill" id="grow-${i}"></div></div>
                <div class="mutations-container" id="mut-container-${i}"></div>
                <i class="harvest-select-shade" aria-hidden="true"></i>
                <i class="harvest-select-frame" aria-hidden="true"></i>
                <i class="harvest-select-money" aria-hidden="true">💰</i>
                <div class="tile-bee">🐝</div>
                <div class="weed-model"><span class="weed-model-core">🐛</span></div>
                <div class="plant-wrapper">
                    <div class="model" id="model-${i}"></div>
                </div>
            `;
            bindTilePointerInteractions(el, i);
            fragment.appendChild(el);
        });
        g.appendChild(fragment);
        tiles.forEach((_, i) => updateTileDOM(i));
        renderPaintPalette(g);
    }

    function renderSeeds() {
        const container = document.getElementById('seeds-track');
        const windowEl = document.getElementById('seeds-window');
        if (!container || !windowEl) return;
        ensureSeedAndShopState();
        ensureSelectedSeedAvailable();
        const quickSeedKeys = getQuickSeedKeys();
        const seedSignature = getSeedRenderSignature(quickSeedKeys);
        if (container.dataset.renderSignature === seedSignature) return;
        const previousScrollLeft = windowEl.scrollLeft;
        container.dataset.renderSignature = seedSignature;
        container.innerHTML = '';
        quickSeedKeys.forEach(key => {
            const p = PLANTS[key];
            const amount = getSeedOwned(key);
            const empty = amount <= 0;
            const affordable = player.coins >= p.cost;
            const el = document.createElement('div');
            el.className = `seed-packet ${empty ? 'empty needs-purchase' : ''} ${affordable ? '' : 'cant-afford'} ${currentTool === p.id ? 'active' : ''}`;
            el.dataset.seed = p.id;
            el.style.setProperty('--pkt-color', p.color);
            el.onclick = () => {
                if (getSeedOwned(p.id) <= 0) { showToast('Нажми на цену, чтобы купить семечко', '#f1c40f'); return; }
                selectAction(p.id);
            };
            el.innerHTML = `<div class="pkt-top"></div><div class="pkt-bg"></div><div class="seed-name">${p.name}</div><div class="seed-icon">${seedIcon(p.id)}</div><button class="seed-price" type="button" ${affordable ? '' : 'disabled'}>${compactNumber(p.cost)}$</button><div class="seed-stock">x${amount}</div>`;
            el.querySelector('.seed-price').addEventListener('click', event => {
                event.stopPropagation();
                buySeedFromQuickPanel(p.id);
            });
            container.appendChild(el);
        });
        if (env.seedCarouselFrame) cancelAnimationFrame(env.seedCarouselFrame);
        env.seedCarouselFrame = requestAnimationFrame(() => {
            env.seedCarouselFrame = null;
            windowEl.scrollLeft = previousScrollLeft;
            refreshSeedCarouselMetrics();
        });
    }

    function buySeedFromQuickPanel(seedId) {
        const plant = PLANTS[seedId];
        if (!plant) return;
        if (player.coins < plant.cost) {
            showToast('Не хватает монет', '#ff7675');
            sfx.play('error');
            return;
        }
        player.coins -= plant.cost;
        player.seedInventory[seedId] = getSeedOwned(seedId) + 1;
        decorSfx('coin', 'popitClick');
        showToast(`+1 ${plant.name}`, plant.color);
        updateHeaderUI();
        renderSeeds();
        saveGame();
    }

    function scrollSeeds(dir) {
        document.getElementById('seeds-window').scrollBy({ left: dir * 160, behavior: 'smooth' });
    }

    function refreshSeedCarouselMetrics() {
        const windowEl = document.getElementById('seeds-window');
        if (!windowEl) return;
        env.seedCarouselMaxScroll = Math.max(0, windowEl.scrollWidth - windowEl.clientWidth);
        updateCarouselArrows();
    }

    function scheduleCarouselArrowUpdate() {
        if (env.seedCarouselScrollFrame) return;
        env.seedCarouselScrollFrame = requestAnimationFrame(() => {
            env.seedCarouselScrollFrame = null;
            updateCarouselArrows();
        });
    }

    function updateCarouselArrows() {
        const w = document.getElementById('seeds-window');
        const btnLeft = document.getElementById('btn-left');
        const btnRight = document.getElementById('btn-right');
        if (!w || !btnLeft || !btnRight) return;
        const maxScroll = Number.isFinite(env.seedCarouselMaxScroll)
            ? env.seedCarouselMaxScroll
            : Math.max(0, w.scrollWidth - w.clientWidth);
        if (w.scrollLeft <= 5) btnLeft.classList.add('disabled'); else btnLeft.classList.remove('disabled');
        if (w.scrollLeft >= maxScroll - 5) btnRight.classList.add('disabled'); else btnRight.classList.remove('disabled');
    }

    function selectAction(tool) {
        const abandonedFood = selectedReadyCropId() !== null;
        clearHarvestSelection();
        if (abandonedFood) setGardenSlimeFoodReaction('missed', 950);
        if (tool === 'shop') {
            toggleShop();
            return;
        }
        currentTool = currentTool === tool ? null : tool;
        decorSfx('pop', 'popitClick');
        hidePlantInspectCard();
        document.querySelectorAll('.action-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tool === currentTool));
        renderSeeds();
    }

    function getSeedRenderSignature(keys = getQuickSeedKeys()) {
        return keys.map(key => `${key}:${getSeedOwned(key)}:${currentTool === key ? 1 : 0}:${player.coins >= (PLANTS[key]?.cost || 0) ? 1 : 0}`).join('|');
    }

    function updateSeedPacketDOM(seedId) {
        const container = document.getElementById('seeds-track');
        const packet = container?.querySelector(`.seed-packet[data-seed="${seedId}"]`);
        if (!container || !packet) {
            renderSeeds();
            return;
        }
        const amount = getSeedOwned(seedId);
        packet.classList.toggle('empty', amount <= 0);
        packet.classList.toggle('needs-purchase', amount <= 0);
        packet.querySelector('.seed-stock').textContent = `x${Math.max(0, amount)}`;
        container.dataset.renderSignature = getSeedRenderSignature();
    }

    function clearHarvestSelection(expectedTileId = null) {
        if (expectedTileId !== null && env.harvestSelectedTile !== expectedTileId) return;
        if (env.harvestSelectionTimer) clearTimeout(env.harvestSelectionTimer);
        const selectedTileId = env.harvestSelectedTile;
        env.harvestSelectionTimer = null;
        env.harvestSelectedTile = null;
        if (selectedTileId !== null) document.getElementById(`tile-${selectedTileId}`)?.classList.remove('harvest-selected');
        syncGardenCropActionState();
    }

    function selectHarvestTile(idx) {
        clearHarvestSelection();
        const tileEl = document.getElementById(`tile-${idx}`);
        if (!tileEl) return;
        env.harvestSelectedTile = idx;
        tileEl.classList.add('harvest-selected');
        decorSfx('pop', 'popitClick');
        env.harvestSelectionTimer = setTimeout(() => {
            if (env.harvestSelectedTile !== idx) return;
            clearHarvestSelection(idx);
            setGardenSlimeFoodReaction('missed', 950);
        }, 3000);
        syncGardenCropActionState();
    }

    function selectedReadyCropId() {
        if (env.harvestSelectedTile === null || env.harvestSelectedTile === undefined) return null;
        const idx = Number(env.harvestSelectedTile);
        if (!Number.isInteger(idx)) return null;
        const tile = tiles[idx];
        return tile?.active && tile.growth >= 100 && !tile.hasWeed ? idx : null;
    }

    function syncGardenCropActionState() {
        const hasSelection = selectedReadyCropId() !== null;
        const hasCropInHand = hasSelection || !!env.cropDrag;
        const inventoryCount = Array.isArray(player.cropInventory) ? player.cropInventory.length : 0;
        document.getElementById('garden-sell-target')?.classList.toggle('has-selection', hasSelection);
        const slimeTarget = document.getElementById('garden-slime-target');
        slimeTarget?.classList.toggle('has-selection', hasSelection);
        slimeTarget?.classList.toggle('food-focus', hasCropInHand);
        slimeTarget?.classList.toggle('food-missed', env.slimeFoodReaction === 'missed');
        slimeTarget?.classList.toggle('just-fed', env.slimeFoodReaction === 'fed');
        const inventoryTarget = document.getElementById('garden-inventory-target');
        const capacity = document.getElementById('garden-inventory-capacity');
        const count = document.getElementById('garden-inventory-count');
        inventoryTarget?.classList.toggle('has-selection', hasSelection);
        inventoryTarget?.classList.toggle('is-full', inventoryCount >= CROP_INVENTORY_CAPACITY);
        if (count) count.textContent = inventoryCount;
        if (capacity) capacity.hidden = !hasCropInHand;
    }

    function setGardenSlimeFoodReaction(reaction = '', duration = 0) {
        if (env.slimeFoodReactionTimer) clearTimeout(env.slimeFoodReactionTimer);
        env.slimeFoodReactionTimer = null;
        env.slimeFoodReaction = reaction;
        renderGardenCompanion();
        syncGardenCropActionState();
        if (!reaction || duration <= 0) return;
        env.slimeFoodReactionTimer = setTimeout(() => {
            env.slimeFoodReactionTimer = null;
            env.slimeFoodReaction = '';
            renderGardenCompanion();
            syncGardenCropActionState();
        }, duration);
    }

    function sellSelectedCrop() {
        const idx = selectedReadyCropId();
        if (idx === null) {
            openGardenSaleDialog();
            return;
        }
        harvestPlant(idx);
        setGardenSlimeFoodReaction('missed', 1050);
    }

    function feedSelectedCrop() {
        const idx = selectedReadyCropId();
        if (idx === null) {
            showToast('Выбери готовое растение для слайма', '#72db68');
            return;
        }
        feedCompanion(idx);
    }

    function handleGardenSlimeTap(event = null) {
        if (event?.target?.closest?.('.garden-slime-ability-trigger')) {
            activateGardenSlimeAbility();
            return;
        }
        if (selectedReadyCropId() !== null) {
            feedSelectedCrop();
            return;
        }
        openGardenSlimePanel();
    }

    function activateGardenSlimeAbility() {
        updateCompanionState();
        const pet = player.companion;
        const energy = Math.max(0, Math.min(100, pet.abilityEnergy || 0));
        const cooldownLeft = Math.max(0, (pet.abilityCooldownUntil || 0) - Date.now());
        if (energy < 100 || cooldownLeft > 0) {
            openGardenSlimePanel();
            return;
        }
        useCompanionAbility();
    }

    function openGardenSlimePanel() {
        clearHarvestSelection();
        if (!['profile', 'incubator'].includes(env.gardenSlimePanelTab)) env.gardenSlimePanelTab = 'profile';
        renderGardenSlimePanel();
        const dialog = document.getElementById('garden-slime-dialog');
        if (!dialog) return;
        dialog.classList.add('open');
        dialog.setAttribute('aria-hidden', 'false');
        document.body.classList.add('garden-dialog-open');
    }

    function closeGardenSlimePanel(event = null) {
        const dialog = document.getElementById('garden-slime-dialog');
        if (!dialog || (event && event.target !== dialog)) return;
        dialog.classList.remove('open');
        dialog.setAttribute('aria-hidden', 'true');
        document.getElementById('garden-slime-panel-content')?.replaceChildren();
        if (!document.querySelector('.garden-dialog.open')) document.body.classList.remove('garden-dialog-open');
    }

    function selectGardenSlimePanelTab(tab) {
        if (!['profile', 'incubator'].includes(tab) || env.gardenSlimePanelTab === tab) return;
        env.gardenSlimePanelTab = tab;
        decorSfx('pop', 'popitClick');
        renderGardenSlimePanel();
        const content = document.getElementById('garden-slime-panel-content');
        if (content) content.scrollTop = 0;
    }

    function gardenSlimeBaseDef() {
        return { id: 'basic', name: 'Базовый слайм', shortName: 'Базовый', rarity: 'common', role: 'Создаёт радужные мутации', face: 'happy', slime: { body: '#72db68', shade: '#35a84c', blush: '#ffc1cf', decor: 'none' } };
    }

    function gardenSlimeRarity(def) {
        const fallback = { label: 'Обычный', color: '#58a969', stars: 1 };
        return PET_RARITY_STYLE[def?.rarity || 'common'] || fallback;
    }

    function gardenSlimeVariantButtons(id) {
        ensureSlimeCollection();
        const collection = player.slimeCollection[id] || { owned: false, huge: false, gold: false, rainbow: false };
        const activeVariant = player.companion.skin === id ? (player.companion.variant || 'normal') : 'normal';
        return [['huge', 'H', 'Huge'], ['gold', 'G', 'Gold'], ['rainbow', 'R', 'Rainbow']].map(([variant, label, title]) => {
            const unlocked = !!collection[variant];
            const active = activeVariant === variant;
            return `<button class="garden-slime-variant variant-${variant} ${unlocked ? 'unlocked' : 'locked'} ${active ? 'active' : ''}" type="button" title="${title}" onclick="selectCompanionVariant('${id}','${variant}')" ${unlocked ? '' : 'disabled'}>${label}</button>`;
        }).join('');
    }

    function gardenSlimeSkinIds() {
        const rarityOrder = { common: 0, rare: 1, legendary: 2, secret: 3 };
        ensureSlimeCollection();
        return ['basic', ...Object.keys(PET_DEFS).sort((a, b) => {
            const rankDifference = (rarityOrder[PET_DEFS[a]?.rarity] ?? 99) - (rarityOrder[PET_DEFS[b]?.rarity] ?? 99);
            return rankDifference || (PET_DEFS[a]?.name || '').localeCompare(PET_DEFS[b]?.name || '', 'ru');
        })];
    }

    function renderGardenSlimeSkinCard(id) {
        const baseDef = gardenSlimeBaseDef();
        const def = id === 'basic' ? baseDef : PET_DEFS[id];
        if (!def) return '';
        const selected = player.companion.skin === id;
        const variant = selected ? (player.companion.variant || 'normal') : 'normal';
        const rarity = gardenSlimeRarity(def);
        const state = player.companion.slimeLevels[id] || { level: 1, xp: 0 };
        const owned = id === 'basic' || !!player.slimeCollection[id]?.owned;
        if (!owned) {
            return `<button class="garden-slime-skin-card rarity-${def.rarity || 'common'} locked" style="--skin-rarity:${rarity.color}" type="button" disabled aria-label="Неоткрытый слайм">
                <span class="garden-slime-skin-model locked"><b>?</b></span>
                <span class="garden-slime-skin-copy"><b>???</b><small>НЕ ОТКРЫТ</small></span>
                <i>?</i>
            </button>`;
        }
        return `<button class="garden-slime-skin-card rarity-${def.rarity || 'common'} ${selected ? 'selected' : ''}" style="--skin-color:${def.slime?.body || rarity.color};--skin-dark:${def.slime?.shade || rarity.color};--skin-rarity:${rarity.color}" type="button" onclick="selectCompanionSkin('${id}')" ${selected ? 'disabled aria-current="true"' : ''}>
            <span class="garden-slime-skin-model">${slimeHTML(def, companionVariantPet(variant), 'inventory')}</span>
            <span class="garden-slime-skin-copy"><b>${def.shortName || def.name}</b><small>УРОВЕНЬ <strong>${state.level}</strong></small></span>
            <i>${selected ? '✓' : '›'}</i>
        </button>`;
    }

    function renderGardenSlimeCollection(skins) {
        const groups = [
            { id: 'common', label: 'Обычные', color: '#55aa69' },
            { id: 'rare', label: 'Редкие', color: '#4b9fe8' },
            { id: 'legendary', label: 'Легендарные', color: '#e66a42' },
            { id: 'secret', label: 'Секретные', color: '#8d5bd7' }
        ];
        const baseDef = gardenSlimeBaseDef();
        return groups.map(group => {
            const ids = skins.filter(id => (id === 'basic' ? baseDef : PET_DEFS[id])?.rarity === group.id);
            const opened = ids.filter(id => id === 'basic' || player.slimeCollection[id]?.owned).length;
            return `<section class="garden-slime-rarity-group rarity-${group.id}" style="--group-color:${group.color}">
                <header><b>${group.label}</b><i></i><span>${opened} из ${ids.length}</span></header>
                <div class="garden-slime-skin-grid">${ids.map(renderGardenSlimeSkinCard).join('')}</div>
            </section>`;
        }).join('');
    }

    function gardenSlimeHexRgb(value, fallback = [114, 219, 104]) {
        const hex = `${value || ''}`.trim().replace('#', '');
        if (/^[0-9a-f]{3}$/i.test(hex)) return [...hex].map(channel => parseInt(channel + channel, 16));
        if (/^[0-9a-f]{6}$/i.test(hex)) return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16));
        return [...fallback];
    }

    function gardenSlimeRgbHex(color) {
        return `#${color.map(channel => Math.round(Math.max(0, Math.min(255, channel))).toString(16).padStart(2, '0')).join('')}`;
    }

    function gardenSlimeMixColor(from, to, amount) {
        return from.map((channel, index) => channel + (to[index] - channel) * amount);
    }

    function gardenSlimeColorLuminance(color) {
        const linear = color.map(channel => {
            const value = channel / 255;
            return value <= .04045 ? value / 12.92 : Math.pow((value + .055) / 1.055, 2.4);
        });
        return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
    }

    function gardenSlimeProfilePalette(def, rarity) {
        const body = gardenSlimeHexRgb(def.slime?.body);
        const shade = gardenSlimeHexRgb(def.slime?.shade, body);
        const rarityColor = gardenSlimeHexRgb(rarity.color, shade);
        const darkNeutral = [22, 24, 29];
        const warmWhite = [255, 249, 226];
        const bodyLuminance = gardenSlimeColorLuminance(body);
        const cardTop = gardenSlimeMixColor(shade, darkNeutral, .5);
        const cardBottom = gardenSlimeMixColor(body, darkNeutral, .72);
        const stage = bodyLuminance >= .28
            ? gardenSlimeMixColor(shade, darkNeutral, .72)
            : gardenSlimeMixColor(body, warmWhite, .8);
        const highlight = bodyLuminance >= .56 ? shade : gardenSlimeMixColor(body, warmWhite, .28);
        const mutedInk = gardenSlimeMixColor(body, warmWhite, .76);
        const panel = gardenSlimeMixColor(cardTop, warmWhite, .13);
        const borderBase = gardenSlimeMixColor(rarityColor, shade, .42);
        const border = gardenSlimeMixColor(borderBase, warmWhite, .18);
        const badgeInk = gardenSlimeColorLuminance(rarityColor) >= .46 ? '#2b2118' : '#fffaf0';
        return {
            '--profile-card-top': gardenSlimeRgbHex(cardTop),
            '--profile-card-bottom': gardenSlimeRgbHex(cardBottom),
            '--profile-card-border': gardenSlimeRgbHex(border),
            '--profile-stage': gardenSlimeRgbHex(stage),
            '--profile-stage-edge': gardenSlimeRgbHex(highlight),
            '--profile-panel': gardenSlimeRgbHex(panel),
            '--profile-highlight': gardenSlimeRgbHex(highlight),
            '--profile-muted-ink': gardenSlimeRgbHex(mutedInk),
            '--profile-badge': rarity.color,
            '--profile-badge-ink': badgeInk
        };
    }

    function renderGardenSlimeProfile(def, meta) {
        const pet = player.companion;
        const state = syncCurrentCompanionLevel();
        const level = Math.max(1, Math.min(15, state.level || 1));
        const need = companionXpNeed(level);
        const xpProgress = level >= 15 ? 100 : Math.min(100, state.xp / need * 100);
        const rarity = gardenSlimeRarity(def);
        const rarityLabel = def.id === 'basic' ? 'Базовый' : rarity.label;
        const milestones = companionAbilityMilestones(def.id);
        const tier = companionAbilityTier();
        const tierRoman = ['I', 'II', 'III'];
        const tierUnlockLevels = [1, 8, 15];
        const currentMilestone = milestones[Math.max(0, Math.min(milestones.length - 1, tier - 1))]
            || { range: '1–7', text: 'Особая способность этого слайма.' };
        const currentTierRoman = tierRoman[Math.max(0, Math.min(tierRoman.length - 1, tier - 1))];
        const profilePalette = gardenSlimeProfilePalette(def, rarity);
        const profilePaletteStyle = Object.entries(profilePalette).map(([property, value]) => `${property}:${value}`).join(';');
        const skins = gardenSlimeSkinIds();
        return `<div class="garden-slime-profile-pane" style="--active-slime-color:${def.slime?.body || meta.color};--active-slime-dark:${def.slime?.shade || meta.dark};--active-rarity:${rarity.color}">
            <section class="garden-slime-profile-hero rarity-${def.rarity || 'common'}" style="--profile-color:${def.slime?.body || meta.color};--profile-dark:${def.slime?.shade || meta.dark};--rarity-accent:${rarity.color};${profilePaletteStyle}">
                <div class="garden-slime-portrait-wrap">
                    <button class="garden-slime-edit-name" type="button" onclick="renameCompanion()"><b>${pet.name || 'Слайми'}</b><i>✎</i></button>
                    <div class="garden-slime-portrait" role="button" tabindex="0" aria-label="Погладить слайма" onpointerdown="startGardenSlimeProfilePet(event)" onpointermove="moveGardenSlimeProfilePet(event)" onpointerup="finishGardenSlimeProfilePet(event)" onpointercancel="finishGardenSlimeProfilePet(event)" onkeydown="handleGardenSlimeProfilePetKey(event)"><span class="garden-slime-pet-model">${slimeHTML({ ...def, face: companionFaceForMood(def, companionMood()) }, companionVariantPet(pet.variant || 'normal'), 'featured')}</span></div>
                    <div class="garden-slime-variants" aria-label="Особые версии">${gardenSlimeVariantButtons(def.id)}</div>
                </div>
                <div class="garden-slime-profile-copy">
                    <div class="garden-slime-profile-type"><span class="garden-slime-rarity rarity-${def.rarity || 'common'}">${rarityLabel}</span><small>${def.name || 'Базовый слайм'}</small></div>
                    <p>${def.role || 'Помогает выращивать редкий урожай'}</p>
                    <div class="garden-slime-level-card">
                        <div><span><small>УРОВЕНЬ</small><b>${level}</b></span><strong>${level >= 15 ? 'MAX' : `${Math.floor(state.xp)} / ${need} XP`}</strong></div>
                        <i class="garden-slime-level-meter"><em style="width:${xpProgress}%"></em></i>
                    </div>
                </div>
            </section>
            <section class="garden-slime-ability-card">
                <header class="garden-slime-ability-head">
                    <span aria-hidden="true">${meta.symbol}</span>
                    <div><small>СУПЕРСПОСОБНОСТЬ</small><b>${companionAbilityName()}</b></div>
                    <em>СТУПЕНЬ ${currentTierRoman}</em>
                </header>
                <p>${currentMilestone.text}</p>
                <details class="garden-slime-ability-details">
                    <summary><b>Все ступени способности</b><span>⌄</span></summary>
                    <div>${milestones.map((milestone, index) => {
                        const unlocked = tier >= index + 1;
                        const current = tier === index + 1;
                        const unlockLabel = `${current ? 'ТЕКУЩАЯ' : unlocked ? 'ОТКРЫТО' : 'ОТКРОЕТСЯ'} · С ${tierUnlockLevels[index]} УРОВНЯ СЛАЙМА`;
                        return `<article class="${unlocked ? 'unlocked' : 'locked'} ${tier === index + 1 ? 'current' : ''}">
                            <span class="garden-slime-tier-mark" aria-label="Ступень ${tierRoman[index]}${unlocked ? '' : ', закрыта'}">${tierRoman[index]}${unlocked ? '' : '<i aria-hidden="true"></i>'}</span>
                            <div><strong class="garden-slime-tier-unlock">${unlockLabel}</strong><p>${milestone.text}</p></div>
                        </article>`;
                    }).join('')}</div>
                </details>
            </section>
            <section class="garden-slime-collection">
                <header><div><small>КОЛЛЕКЦИЯ</small><b>Выбрать слайма</b></div><span>${skins.filter(id => id === 'basic' || player.slimeCollection[id]?.owned).length} из ${skins.length}</span></header>
                <div class="garden-slime-rarity-list">${renderGardenSlimeCollection(skins)}</div>
            </section>
        </div>`;
    }

    function emitGardenSlimeProfileHeart(portrait, clientX, clientY) {
        if (!portrait?.isConnected) return;
        const rect = portrait.getBoundingClientRect();
        const heart = document.createElement('span');
        const x = Number.isFinite(clientX) ? clientX - rect.left : rect.width / 2;
        const y = Number.isFinite(clientY) ? clientY - rect.top : rect.height * .48;
        heart.className = 'garden-slime-pet-heart';
        heart.textContent = '♥';
        heart.style.left = `${Math.max(18, Math.min(rect.width - 18, x))}px`;
        heart.style.top = `${Math.max(20, Math.min(rect.height - 18, y))}px`;
        heart.style.setProperty('--pet-heart-x', `${Math.round((Math.random() - .5) * 54)}px`);
        heart.style.setProperty('--pet-heart-y', `${Math.round(-38 - Math.random() * 27)}px`);
        heart.style.setProperty('--pet-heart-rotate', `${Math.round((Math.random() - .5) * 36)}deg`);
        portrait.appendChild(heart);
        setTimeout(() => heart.remove(), 760);
    }

    function startGardenSlimeProfilePet(event) {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        const portrait = event.currentTarget;
        if (portrait._petGesture) return;
        event.preventDefault();
        event.stopPropagation();
        portrait.setPointerCapture?.(event.pointerId);
        portrait._petGesture = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            lastX: event.clientX,
            lastY: event.clientY,
            distance: 0,
            active: false,
            lastHeartAt: 0,
            holdTimer: setTimeout(() => {
                const gesture = portrait._petGesture;
                if (!gesture || gesture.pointerId !== event.pointerId) return;
                activateGardenSlimeProfilePetting(portrait, gesture);
            }, 180)
        };
    }

    function activateGardenSlimeProfilePetting(portrait, gesture) {
        if (gesture.active) return;
        gesture.active = true;
        if (portrait._petTapTimer) clearTimeout(portrait._petTapTimer);
        portrait._petTapTimer = null;
        portrait.classList.remove('is-tapped');
        portrait.classList.add('is-petting');
        gesture.lastHeartAt = performance.now();
        emitGardenSlimeProfileHeart(portrait, gesture.lastX, gesture.lastY);
    }

    function moveGardenSlimeProfilePet(event) {
        const portrait = event.currentTarget;
        const gesture = portrait._petGesture;
        if (!gesture || gesture.pointerId !== event.pointerId) return;
        event.preventDefault();
        const step = Math.hypot(event.clientX - gesture.lastX, event.clientY - gesture.lastY);
        gesture.distance += step;
        gesture.lastX = event.clientX;
        gesture.lastY = event.clientY;
        if (gesture.distance < 7) return;
        activateGardenSlimeProfilePetting(portrait, gesture);
        const now = performance.now();
        if (now - gesture.lastHeartAt >= 170) {
            gesture.lastHeartAt = now;
            emitGardenSlimeProfileHeart(portrait, event.clientX, event.clientY);
        }
    }

    function finishGardenSlimeProfilePet(event) {
        const portrait = event.currentTarget;
        const gesture = portrait._petGesture;
        if (!gesture || gesture.pointerId !== event.pointerId) return;
        event.preventDefault();
        event.stopPropagation();
        clearTimeout(gesture.holdTimer);
        if (portrait.hasPointerCapture?.(event.pointerId)) portrait.releasePointerCapture(event.pointerId);
        portrait._petGesture = null;
        portrait.classList.remove('is-petting');
        if (event.type === 'pointercancel') return;
        if (gesture.active) {
            emitGardenSlimeProfileHeart(portrait, gesture.lastX, gesture.lastY);
            sfx.play('pop', 'garden-slime-profile-pet');
            return;
        }
        triggerGardenSlimeProfileTap(portrait);
    }

    function triggerGardenSlimeProfileTap(portrait) {
        if (!portrait?.isConnected) return;
        if (portrait._petTapTimer) clearTimeout(portrait._petTapTimer);
        portrait.classList.remove('is-tapped');
        void portrait.offsetWidth;
        portrait.classList.add('is-tapped');
        sfx.play('blop', 'garden-slime-profile-tap');
        portrait._petTapTimer = setTimeout(() => {
            portrait._petTapTimer = null;
            if (portrait.isConnected) portrait.classList.remove('is-tapped');
        }, 390);
    }

    function handleGardenSlimeProfilePetKey(event) {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        triggerGardenSlimeProfileTap(event.currentTarget);
    }

    function renderGardenSlimePanel() {
        const dialog = document.getElementById('garden-slime-dialog');
        const card = document.getElementById('garden-slime-card');
        const content = document.getElementById('garden-slime-panel-content');
        if (!dialog || !card || !content) return;
        updateCompanionState();
        if (env.gardenSlimePanelTab === 'incubator') ensureSeedAndShopState();
        const def = companionSkinDef() || gardenSlimeBaseDef();
        const meta = companionAbilityMeta();
        card.className = 'garden-dialog-card garden-slime-card';
        card.removeAttribute('style');
        const profileTab = document.getElementById('garden-slime-tab-profile');
        const incubatorTab = document.getElementById('garden-slime-tab-incubator');
        profileTab?.classList.toggle('active', env.gardenSlimePanelTab === 'profile');
        incubatorTab?.classList.toggle('active', env.gardenSlimePanelTab === 'incubator');
        profileTab?.setAttribute('aria-selected', env.gardenSlimePanelTab === 'profile' ? 'true' : 'false');
        incubatorTab?.setAttribute('aria-selected', env.gardenSlimePanelTab === 'incubator' ? 'true' : 'false');
        syncGardenSlimeIncubatorAlert();
        content.classList.toggle('show-incubator', env.gardenSlimePanelTab === 'incubator');
        content.innerHTML = env.gardenSlimePanelTab === 'incubator'
            ? `<div class="garden-slime-incubator-pane">${renderSlimeShop()}</div>`
            : renderGardenSlimeProfile(def, meta);
    }

    function rerenderGardenSlimePanelPreservingScroll() {
        const content = document.getElementById('garden-slime-panel-content');
        const scrollTop = content?.scrollTop || 0;
        renderGardenSlimePanel();
        const updatedContent = document.getElementById('garden-slime-panel-content');
        if (updatedContent) updatedContent.scrollTop = scrollTop;
    }

    function updateGardenSlimePanelLive() {
        const dialog = document.getElementById('garden-slime-dialog');
        if (!dialog?.classList.contains('open')) return;
        syncGardenSlimeIncubatorAlert();
        if (env.gardenSlimePanelTab === 'incubator') {
            updateIncubatorTimerElements(document.getElementById('garden-slime-panel-content'));
        }
    }

    function syncGardenSlimeIncubatorAlert() {
        const tab = document.getElementById('garden-slime-tab-incubator');
        if (!tab) return;
        const now = Date.now();
        const hasReadyEgg = Array.isArray(player.incubator) && player.incubator.some(item =>
            item && !item.hatching && (TEST_HATCH_INSTANT || Number(item.readyAt) <= now)
        );
        tab.classList.toggle('has-ready-egg', hasReadyEgg);
        tab.setAttribute('aria-label', hasReadyEgg ? 'Инкубатор: яйцо готово' : 'Инкубатор');
    }

    function readyGardenCropIds() {
        return tiles.reduce((ids, tile, idx) => {
            if (tile?.active && tile.growth >= 100 && !tile.hasWeed && isPlotUnlocked(idx)) ids.push(idx);
            return ids;
        }, []);
    }

    function openGardenSaleDialog() {
        const cropIds = readyGardenCropIds();
        if (!cropIds.length) {
            showToast('В огороде пока нет готового урожая', '#f1c40f');
            return;
        }
        const total = cropIds.reduce((sum, idx) => sum + (cropSnapshotFromTile(idx)?.value || 0), 0);
        const dialog = document.getElementById('garden-sale-dialog');
        const summary = document.getElementById('garden-sale-summary');
        if (!dialog || !summary) return;
        summary.textContent = `${cropIds.length} растений · примерно ${compactNumber(total)}$`;
        dialog.classList.add('open');
        dialog.setAttribute('aria-hidden', 'false');
        document.body.classList.add('garden-dialog-open');
    }

    function closeGardenSaleDialog(event = null) {
        const dialog = document.getElementById('garden-sale-dialog');
        if (!dialog || (event && event.target !== dialog)) return;
        dialog.classList.remove('open');
        dialog.setAttribute('aria-hidden', 'true');
        if (!document.querySelector('.garden-dialog.open')) document.body.classList.remove('garden-dialog-open');
    }

    function confirmSellAllGarden() {
        const cropIds = readyGardenCropIds();
        closeGardenSaleDialog();
        if (!cropIds.length) return;
        clearHarvestSelection();
        let total = 0;
        cropIds.forEach(idx => { total += harvestPlant(idx, { deferUI: true, quiet: true }); });
        updateUI();
        decorSfx('coin', 'popitHarvest');
        showToast(`Продано ${cropIds.length} растений: +${compactNumber(total)}$`, '#f1c40f');
        saveGame();
    }

    function useGardenInventory() {
        const idx = selectedReadyCropId();
        if (idx !== null) {
            if (storeCropInInventory(idx)) setGardenSlimeFoodReaction('missed', 1050);
            return;
        }
        openGardenInventory();
    }

    function storeCropInInventory(idx) {
        ensureCropInventoryState();
        if (player.cropInventory.length >= CROP_INVENTORY_CAPACITY) {
            showToast('Инвентарь заполнен', '#ff7675');
            sfx.play('error');
            return false;
        }
        const crop = cropSnapshotFromTile(idx);
        if (!crop) {
            showToast('Это растение ещё нельзя убрать', '#ff7675');
            return false;
        }
        crop.uid = `crop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        player.cropInventory.push(crop);
        clearTile(idx);
        decorSfx('pop', 'popitClick');
        showToast(`${PLANTS[crop.plantId].name} в инвентаре`, '#74b9ff');
        updateUI();
        saveGame();
        return true;
    }

    function openGardenInventory() {
        ensureCropInventoryState();
        clearHarvestSelection();
        renderGardenInventory();
        const dialog = document.getElementById('garden-inventory-dialog');
        if (!dialog) return;
        dialog.classList.add('open');
        dialog.setAttribute('aria-hidden', 'false');
        document.body.classList.add('garden-dialog-open');
    }

    function closeGardenInventory(event = null) {
        const dialog = document.getElementById('garden-inventory-dialog');
        if (!dialog || (event && event.target !== dialog)) return;
        dialog.classList.remove('open');
        dialog.setAttribute('aria-hidden', 'true');
        closeGardenCropMenu();
        document.getElementById('garden-inventory-list')?.replaceChildren();
        if (!document.querySelector('.garden-dialog.open')) document.body.classList.remove('garden-dialog-open');
    }

    function renderGardenInventory() {
        ensureCropInventoryState();
        const title = document.getElementById('garden-inventory-title');
        if (title) title.textContent = 'Инвентарь';
        renderGardenInventoryStorage();
    }

    function gardenCropSizeLabel(crop) {
        return ({ small: 'Маленький', normal: 'Обычный', big: 'Большой', huge: 'Огромный', titanic: 'Титанический' })[crop?.sizeTier] || 'Обычный';
    }

    function renderGardenInventoryStorage() {
        const list = document.getElementById('garden-inventory-list');
        if (!list) return;
        const overviewCount = document.getElementById('garden-inventory-overview-count');
        const overviewFill = document.getElementById('garden-inventory-overview-fill');
        if (overviewCount) overviewCount.textContent = `${player.cropInventory.length}/${CROP_INVENTORY_CAPACITY}`;
        if (overviewFill) overviewFill.style.width = `${Math.min(100, player.cropInventory.length / CROP_INVENTORY_CAPACITY * 100)}%`;
        const visibleSlots = Math.max(CROP_INVENTORY_CAPACITY, player.cropInventory.length);
        list.innerHTML = Array.from({ length: visibleSlots }, (_, index) => {
            const crop = player.cropInventory[index];
            if (!crop) return `<div class="garden-inventory-item empty"><span class="garden-inventory-empty-mark">+</span><small>Свободное место</small></div>`;
            const plant = PLANTS[crop.plantId];
            const sizeLabel = gardenCropSizeLabel(crop);
            return `<button class="garden-inventory-item filled size-${crop.sizeTier || 'normal'}" type="button" onclick="openGardenCropMenu('inventory', ${index})" aria-label="${plant.name}, ${sizeLabel}">
                <div class="garden-inventory-bed">${gardenInventoryCropHTML(crop)}</div>
                <div class="garden-inventory-info">
                    <div><b>${plant.name}</b><em>↗ ${sizeLabel}</em></div>
                    <span><small class="garden-inventory-weight">${formatInspectWeight(crop.weight)}</small><strong class="garden-inventory-price">${compactNumber(crop.value)}$</strong></span>
                </div>
            </button>`;
        }).join('');
        syncShowcasePreviewVisuals(list);
    }

    function gardenInventoryCropHTML(crop) {
        const sizeScales = { small: .86, normal: .96, big: 1.05, huge: 1.13, titanic: 1.2 };
        return showcaseCropHTML(crop, { modelScale: sizeScales[crop?.sizeTier] || 1, stageScale: .72 });
    }

    // inactive-showcase: saved showcase data and helpers stay intact for a future return.
    function renderGardenInventoryShowcase() {
        const slots = document.getElementById('garden-showcase-slots');
        const rate = document.getElementById('garden-showcase-rate');
        const bank = document.getElementById('garden-showcase-bank');
        const claim = document.getElementById('garden-showcase-claim');
        if (!slots || !rate || !bank || !claim) return;
        updateGardenShowcaseStatus();
        slots.innerHTML = player.showcase.map((crop, slot) => {
            if (!isShowcaseUnlocked(slot)) {
                return `<div class="garden-showcase-slot locked"><span class="showcase-lock-icon small"></span><b>Слот ${slot + 1}</b><small>ур. ${getShowcaseUnlockLevel(slot)}</small></div>`;
            }
            if (!crop || !PLANTS[crop.plantId]) {
                const selected = env.gardenShowcaseTargetSlot === slot;
                return `<button class="garden-showcase-slot empty${selected ? ' selected' : ''}" type="button" onclick="chooseGardenShowcaseCrop(${slot})"><span>${selected ? '✓' : '+'}</span><small>${selected ? 'Выбери растение ниже' : 'Свободное место'}</small></button>`;
            }
            const plant = PLANTS[crop.plantId];
            return `<button class="garden-showcase-slot filled" type="button" onclick="openGardenCropMenu('showcase', ${slot})" aria-label="${plant.name} на витрине">
                <div class="garden-inventory-bed">${gardenInventoryCropHTML(crop)}</div>
                <div class="garden-showcase-info"><b>${plant.name}</b><small>${formatWeightLabel(crop.weight)} · +${compactNumber(showcaseIncome(crop))}/ч</small></div>
            </button>`;
        }).join('');
        syncShowcasePreviewVisuals(slots);
    }

    function updateGardenShowcaseStatus() {
        const rate = document.getElementById('garden-showcase-rate');
        const bank = document.getElementById('garden-showcase-bank');
        const claim = document.getElementById('garden-showcase-claim');
        if (rate) rate.textContent = `+${compactNumber(totalShowcaseIncome())}/ч`;
        if (bank) bank.textContent = `${compactNumber(player.bank || 0)}$`;
        if (claim) {
            claim.disabled = (player.bank || 0) <= 0;
            claim.textContent = (player.bank || 0) > 0 ? `Забрать ${compactNumber(player.bank)}$` : 'Копится...';
        }
    }

    function chooseGardenShowcaseCrop(slot) {
        if (!isShowcaseUnlocked(slot)) return;
        env.gardenShowcaseTargetSlot = env.gardenShowcaseTargetSlot === slot ? null : slot;
        renderGardenInventoryShowcase();
        if (env.gardenShowcaseTargetSlot !== null) showToast(`Теперь выбери растение для слота ${slot + 1}`, '#f1c40f');
    }

    function openGardenCropMenu(source, index) {
        ensureCropInventoryState();
        const crop = player.cropInventory[index];
        const plant = crop && PLANTS[crop.plantId];
        const menu = document.getElementById('garden-crop-menu');
        if (!crop || !plant || !menu) return;
        env.gardenCropMenu = { source: 'inventory', index };
        const mutationCount = crop.mutations?.length || 0;
        document.getElementById('garden-crop-menu-icon').textContent = plant.icon || '🌱';
        document.getElementById('garden-crop-menu-title').textContent = plant.name;
        document.getElementById('garden-crop-menu-details').textContent = `${gardenCropSizeLabel(crop)} · ${formatInspectWeight(crop.weight)} · ${mutationCount ? `${mutationCount} мут.` : 'без мутаций'}`;
        const sellButton = document.getElementById('garden-crop-menu-sell');
        if (sellButton) sellButton.textContent = `💰 Продать за ${compactNumber(crop.value)}$`;
        menu.classList.add('open');
        menu.setAttribute('aria-hidden', 'false');
    }

    function closeGardenCropMenu(event = null) {
        const menu = document.getElementById('garden-crop-menu');
        if (!menu || (event && event.target !== menu)) return;
        menu.classList.remove('open');
        menu.setAttribute('aria-hidden', 'true');
        env.gardenCropMenu = null;
    }

    function useGardenCropMenuPrimary() {
        const action = env.gardenCropMenu ? { ...env.gardenCropMenu } : null;
        if (!action) return;
        closeGardenCropMenu();
        if (action.source === 'showcase') moveShowcaseCropToInventory(action.index);
        else moveInventoryCropToShowcase(action.index);
    }

    function keepGardenCropMenuPlant() {
        closeGardenCropMenu();
    }

    function sellGardenCropMenuPlant() {
        const action = env.gardenCropMenu ? { ...env.gardenCropMenu } : null;
        if (!action) return;
        closeGardenCropMenu();
        sellInventoryCrop(action.index);
    }

    function moveInventoryCropToShowcase(index) {
        ensureCropInventoryState();
        if (!isShowcaseUnlocked()) {
            showToast(`Витрина откроется на ${getShowcaseUnlockLevel()} уровне`, '#a29bfe');
            return;
        }
        const crop = player.cropInventory[index];
        if (!crop) return;
        const preferred = Number.isInteger(env.gardenShowcaseTargetSlot) ? env.gardenShowcaseTargetSlot : -1;
        const slot = preferred >= 0 && isShowcaseUnlocked(preferred) && !player.showcase[preferred]
            ? preferred
            : player.showcase.findIndex((item, slotIndex) => !item && isShowcaseUnlocked(slotIndex));
        if (slot < 0) {
            showToast('В открытых слотах витрины нет места', '#ff7675');
            return;
        }
        player.cropInventory.splice(index, 1);
        if (!crop.traitsRecorded) recordCropStats(crop, 0, true);
        crop.traitsRecorded = true;
        player.showcase[slot] = crop;
        env.gardenShowcaseTargetSlot = null;
        sfx.play('coin');
        showToast(`Растение поставлено в слот ${slot + 1}`, '#f1c40f');
        updateUI();
        renderGardenInventory();
        saveGame();
    }

    function moveShowcaseCropToInventory(slot) {
        ensureCropInventoryState();
        const crop = player.showcase?.[slot];
        if (!crop) return;
        if (player.cropInventory.length >= CROP_INVENTORY_CAPACITY) {
            showToast('В инвентаре нет свободного места', '#ff7675');
            return;
        }
        crop.uid = crop.uid || `crop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        crop.traitsRecorded = true;
        player.cropInventory.push(crop);
        player.showcase[slot] = null;
        decorSfx('pop', 'popitClick');
        showToast('Растение возвращено в инвентарь', '#74b9ff');
        updateUI();
        renderGardenInventory();
        saveGame();
    }

    function sellGardenShowcaseCrop(slot) {
        sellShowcaseCrop(slot);
        renderGardenInventory();
    }

    function claimGardenShowcaseBank() {
        claimBank();
        renderGardenInventory();
    }

    function grantInventoryCropSale(crop, quiet = false) {
        if (!crop || !PLANTS[crop.plantId]) return 0;
        const plant = PLANTS[crop.plantId];
        const reward = Math.max(1, Math.floor(Number(crop.value) || 0));
        const xp = Math.floor(reward * BALANCE.xpRewardRate);
        const questOptions = { quiet, deferUI: quiet };
        (crop.mutations || []).forEach(id => {
            updateQuest('find_mut', 1, questOptions);
            if (id === 'gold') updateQuest('find_gold', 1, questOptions);
        });
        if (crop.traitsRecorded) {
            ensureStats();
            player.stats.totalEarned += reward;
            player.stats.bestSale = Math.max(player.stats.bestSale, reward);
            player.stats.maxWeight = Math.max(player.stats.maxWeight, Number(crop.weight) || 0);
        } else {
            recordCropStats(crop, reward, true, { quiet });
        }
        player.coins += reward;
        player.xp += xp;
        while (player.xp >= player.xpNeed) {
            player.lvl++;
            player.xp -= player.xpNeed;
            player.xpNeed = Math.floor(player.xpNeed * (BALANCE.xpNeedMult || 1.5));
            if (!quiet) showToast(`УРОВЕНЬ ${player.lvl}! 🎉`, '#a29bfe');
            if (!quiet && Object.values(PLOT_UNLOCK_LEVELS).includes(player.lvl)) showToast('Доступна новая грядка!', '#55efc4');
        }
        if (plant.id === 'carrot') updateQuest('grow_carrot', 1, questOptions);
        updateQuest('harvest_any', 1, questOptions);
        updateQuest('earn_coins', reward, questOptions);
        updateQuest('earn_big', reward, questOptions);
        if ((plant.lvl || 0) >= 7) updateQuest('harvest_rare', 1, questOptions);
        return reward;
    }

    function sellInventoryCrop(index) {
        ensureCropInventoryState();
        const crop = player.cropInventory[index];
        if (!crop) return;
        const reward = grantInventoryCropSale(crop);
        player.cropInventory.splice(index, 1);
        decorSfx('coin', 'popitHarvest');
        showToast(`+${compactNumber(reward)}$`, '#f1c40f');
        renderGardenInventory();
        updateUI();
        saveGame();
    }

    function sellAllInventoryCrops() {
        ensureCropInventoryState();
        const crops = player.cropInventory.splice(0);
        if (!crops.length) return;
        const total = crops.reduce((sum, crop) => sum + grantInventoryCropSale(crop, true), 0);
        decorSfx('coin', 'popitHarvest');
        showToast(`Инвентарь продан: +${compactNumber(total)}$`, '#f1c40f');
        renderGardenInventory();
        updateUI();
        saveGame();
    }

    function renderGardenCompanion() {
        const stage = document.getElementById('garden-slime-model');
        const target = document.getElementById('garden-slime-target');
        if (!stage || !target) return;
        updateCompanionState();
        const baseDef = { id: 'basic', rarity: 'common', face: 'happy', slime: { body: '#72db68', shade: '#35a84c', blush: '#ffc1cf', decor: 'none' } };
        const def = companionSkinDef() || baseDef;
        const mood = companionMood();
        const face = companionFaceForMood(def, mood);
        const variant = player.companion.variant || 'normal';
        const energy = Math.round(Math.max(0, Math.min(100, player.companion.abilityEnergy || 0)));
        const cooldownLeft = Math.max(0, (player.companion.abilityCooldownUntil || 0) - Date.now());
        const abilityReady = energy >= 100 && cooldownLeft <= 0;
        const abilityMeta = companionAbilityMeta();
        const foodFocus = selectedReadyCropId() !== null || !!env.cropDrag;
        const signature = `${def.id}|${mood}|${face}|${variant}|${env.companionAbilitySpecial || ''}`;
        if (stage.dataset.renderSignature !== signature) {
            stage.innerHTML = slimeHTML({ ...def, face }, companionVariantPet(variant), 'medium');
            stage.dataset.renderSignature = signature;
        }
        const targetClassName = `garden-slime-target garden-crop-action skin-${def.id} mood-${mood} variant-${variant}${target.classList.contains('has-selection') ? ' has-selection' : ''}${target.classList.contains('is-drop-active') ? ' is-drop-active' : ''}${foodFocus ? ' food-focus' : ''}${env.slimeFoodReaction === 'missed' ? ' food-missed' : ''}${env.slimeFoodReaction === 'fed' ? ' just-fed' : ''}${env.companionAbilitySpecial ? ` ability-active ability-${env.companionAbilitySpecial}` : ''}${abilityReady ? ' is-ability-ready' : ''}`;
        if (target.className !== targetClassName) target.className = targetClassName;
        target.style.setProperty('--garden-ability-color', abilityMeta.color);
        target.style.setProperty('--garden-ability-dark', abilityMeta.dark);
        const chargeFill = document.getElementById('garden-slime-charge-fill');
        if (chargeFill) chargeFill.style.strokeDashoffset = `${100 - energy}`;
        const chargeValue = document.getElementById('garden-slime-charge-value');
        const chargeLabel = document.getElementById('garden-slime-charge-label');
        const quickIcon = document.getElementById('garden-slime-quick-icon');
        if (quickIcon) quickIcon.textContent = abilityMeta.symbol;
        if (chargeValue) chargeValue.textContent = cooldownLeft > 0
            ? formatCompanionAbilityCooldown(Math.ceil(cooldownLeft / 1000))
            : (abilityReady ? 'ГОТОВО' : `${energy}%`);
        if (chargeLabel) chargeLabel.textContent = cooldownLeft > 0 ? 'ПЕРЕЗАРЯДКА' : (abilityReady ? 'НАЖМИ' : 'ЗАРЯД');
        const displayName = player.companion.name || 'Слайми';
        target.setAttribute('aria-label', target.classList.contains('has-selection')
            ? 'Покормить слайма выбранным растением'
            : `${displayName}: ${abilityReady ? 'способность готова' : `заряд ${energy}%`}`);
        const name = document.getElementById('garden-slime-name');
        if (name && name.textContent !== displayName) name.textContent = displayName;
    }

    function isReadyCropDragCandidate(idx) {
        const tile = tiles[idx];
        return !!(tile?.active && tile.growth >= 100 && !tile.hasWeed && isPlotUnlocked(idx));
    }

    function stripDragGhostChrome(ghost) {
        ghost.removeAttribute('id');
        ghost.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
        ghost.querySelectorAll('.tile-lock,.tile-soil-detail,.planting-feedback,.tile-progress,.mutations-container,.harvest-select-shade,.harvest-select-frame,.harvest-select-money,.tile-bee,.weed-model,.floating-text').forEach(node => node.remove());
        TILE_TRANSIENT_EFFECT_CLASSES.forEach(className => ghost.classList.remove(className));
        ghost.classList.remove('harvest-selected');
        ghost.classList.add('crop-drag-ghost');
        ghost.setAttribute('aria-hidden', 'true');
    }

    function cropDragTransform(state, x, y, scale = 1.04) {
        return `translate3d(${x - state.width / 2}px, ${y - state.height / 2}px, 0) scale(${scale})`;
    }

    function resolveCropDropTarget(x, y) {
        const element = document.elementFromPoint(x, y);
        return element?.closest('#garden-sell-target,#garden-slime-target,#garden-inventory-target') || null;
    }

    function setCropDropTarget(target) {
        const state = env.cropDrag;
        if (!state || state.dropTarget === target) return;
        state.dropTarget?.classList.remove('is-drop-active');
        state.dropTarget = target;
        state.dropTarget?.classList.add('is-drop-active');
    }

    function flushCropDragFrame() {
        const state = env.cropDrag;
        if (!state || state.finishing) return;
        state.frame = null;
        state.ghost.style.transform = cropDragTransform(state, state.x, state.y);
        setCropDropTarget(resolveCropDropTarget(state.x, state.y));
    }

    function moveCropDrag(x, y) {
        const state = env.cropDrag;
        if (!state || state.finishing) return;
        state.x = x;
        state.y = y;
        if (!state.frame) state.frame = requestAnimationFrame(flushCropDragFrame);
    }

    function startCropDrag(idx, event) {
        if (env.cropDrag || !isReadyCropDragCandidate(idx)) return false;
        const source = document.getElementById(`tile-${idx}`);
        if (!source) return false;
        clearHarvestSelection();
        const rect = source.getBoundingClientRect();
        const ghost = source.cloneNode(true);
        stripDragGhostChrome(ghost);
        ghost.style.width = `${rect.width}px`;
        ghost.style.height = `${rect.height}px`;
        document.body.appendChild(ghost);
        source.classList.add('crop-drag-source');
        const state = {
            idx,
            pointerId: event.pointerId,
            source,
            ghost,
            sourceRect: rect,
            width: rect.width,
            height: rect.height,
            x: event.clientX,
            y: event.clientY,
            frame: null,
            dropTarget: null,
            finishing: false
        };
        env.cropDrag = state;
        document.body.classList.add('crop-dragging');
        syncGardenCropActionState();
        ghost.style.transform = cropDragTransform(state, state.x, state.y, 0.94);
        requestAnimationFrame(() => {
            if (env.cropDrag === state) ghost.style.transform = cropDragTransform(state, state.x, state.y);
        });
        if (navigator.vibrate) navigator.vibrate(9);
        return true;
    }

    function cleanupCropDrag(state) {
        if (!state) return;
        if (state.frame) cancelAnimationFrame(state.frame);
        state.dropTarget?.classList.remove('is-drop-active');
        state.source?.classList.remove('crop-drag-source');
        state.ghost?.remove();
        document.body.classList.remove('crop-dragging');
        if (env.cropDrag === state) env.cropDrag = null;
        syncGardenCropActionState();
    }

    function animateCropDragTo(state, rect, scale) {
        const destinationX = rect.left + rect.width / 2;
        const destinationY = rect.top + rect.height / 2;
        const from = cropDragTransform(state, state.x, state.y);
        const to = cropDragTransform(state, destinationX, destinationY, scale);
        if (!state.ghost.animate) {
            state.ghost.style.transform = to;
            return new Promise(resolve => setTimeout(resolve, 170));
        }
        const animation = state.ghost.animate([{ transform: from, opacity: 1 }, { transform: to, opacity: scale < 0.8 ? 0.2 : 1 }], {
            duration: 190,
            easing: 'cubic-bezier(.2,.78,.22,1)',
            fill: 'forwards'
        });
        if (animation.finished) return animation.finished.catch(() => undefined);
        return new Promise(resolve => {
            animation.onfinish = resolve;
            animation.oncancel = resolve;
            setTimeout(resolve, 230);
        });
    }

    async function finishCropDrag(cancelled = false) {
        const state = env.cropDrag;
        if (!state || state.finishing) return;
        state.finishing = true;
        if (state.frame) {
            cancelAnimationFrame(state.frame);
            state.frame = null;
        }
        const dropTarget = cancelled ? null : resolveCropDropTarget(state.x, state.y);
        setCropDropTarget(dropTarget);
        let action = '';
        if (dropTarget?.id === 'garden-sell-target') action = 'sell';
        if (dropTarget?.id === 'garden-slime-target') action = 'feed';
        if (dropTarget?.id === 'garden-inventory-target') {
            ensureCropInventoryState();
            if (player.cropInventory.length >= CROP_INVENTORY_CAPACITY) showToast('Инвентарь заполнен', '#ff7675');
            else action = 'store';
        }
        const destination = action ? dropTarget.getBoundingClientRect() : state.sourceRect;
        await animateCropDragTo(state, destination, action ? 0.62 : 1);
        cleanupCropDrag(state);
        if (!cancelled && action !== 'feed') setGardenSlimeFoodReaction('missed', 950);
        if (!tiles[state.idx]?.active || tiles[state.idx].growth < 100) return;
        if (action === 'sell') harvestPlant(state.idx);
        else if (action === 'feed') feedCompanion(state.idx);
        else if (action === 'store') storeCropInInventory(state.idx);
    }

    function bindTilePointerInteractions(tileElement, idx) {
        let gesture = null;
        tileElement.addEventListener('dragstart', event => event.preventDefault());
        tileElement.addEventListener('pointerdown', event => {
            if (event.pointerType === 'mouse' && event.button !== 0) return;
            gesture = {
                pointerId: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                dragCandidate: isReadyCropDragCandidate(idx),
                dragging: false
            };
            tileElement.setPointerCapture?.(event.pointerId);
            event.preventDefault();
        });
        tileElement.addEventListener('pointermove', event => {
            if (!gesture || gesture.pointerId !== event.pointerId) return;
            const dragThreshold = event.pointerType === 'mouse' ? 5 : 8;
            if (!gesture.dragging && gesture.dragCandidate && Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) >= dragThreshold) {
                gesture.dragging = startCropDrag(idx, event);
            }
            if (gesture.dragging) {
                moveCropDrag(event.clientX, event.clientY);
                event.preventDefault();
            }
        });
        tileElement.addEventListener('pointerup', event => {
            if (!gesture || gesture.pointerId !== event.pointerId) return;
            const wasDragging = gesture.dragging;
            gesture = null;
            if (tileElement.hasPointerCapture?.(event.pointerId)) tileElement.releasePointerCapture(event.pointerId);
            if (wasDragging) {
                moveCropDrag(event.clientX, event.clientY);
                finishCropDrag(false);
            } else handleInteract(idx);
            event.preventDefault();
        });
        tileElement.addEventListener('pointercancel', event => {
            if (!gesture || gesture.pointerId !== event.pointerId) return;
            const wasDragging = gesture.dragging;
            gesture = null;
            if (tileElement.hasPointerCapture?.(event.pointerId)) tileElement.releasePointerCapture(event.pointerId);
            if (wasDragging) finishCropDrag(true);
        });
    }

    function handleInteract(idx) {
        const t = tiles[idx];
        const canUseHarvestSelection = !currentTool || currentTool === 'harvest' || !!PLANTS[currentTool];
        if (env.harvestSelectedTile !== null && env.harvestSelectedTile !== idx) {
            const keepsFoodSelected = canUseHarvestSelection && t.active && t.growth >= 100 && !t.hasWeed;
            clearHarvestSelection();
            if (!keepsFoodSelected) setGardenSlimeFoodReaction('missed', 950);
        }
        if (!canUseHarvestSelection) clearHarvestSelection();
        if (!isPlotLevelUnlocked(idx)) {
            showToast(`Нужен уровень ${getPlotUnlockLevel(idx)}`, '#a29bfe');
            sfx.play('error');
            return;
        }
        if (!isPlotUnlocked(idx)) {
            openPlotBuyModal(idx);
            return;
        }
        if (t.hasWeed) {
            t.hasWeed = false;
            const weedReward = grantCoinsReward(getWeedReward());
            sfx.play('coinSoft');
            floatText(idx, `+${compactNumber(weedReward)}$`, '#55efc4');
            showToast("🐛 Паразит изгнан!", "#00b894");
            updateTileDOM(idx);
            updateQuest('clear_weeds', 1);
            updateQuest('earn_coins', weedReward);
            updateQuest('earn_big', weedReward);
            return;
        }
        if (canUseHarvestSelection && t.active && t.growth >= 100) {
            if (env.harvestSelectedTile === idx) {
                clearHarvestSelection(idx);
                setGardenSlimeFoodReaction('missed', 950);
            } else {
                selectHarvestTile(idx);
            }
            return;
        }
        if (!currentTool) {
            return;
        }
        if (currentTool === 'inspect') { showPlantInspectCard(idx); decorSfx('pop', 'popitClick'); return; }
        if (currentTool === 'shovel') { if (t.active) { clearTile(idx); decorSfx('error', 'popitClick'); floatText(idx, "Очищено", "gray"); } else decorSfx('pop', 'popitClick'); return; }
        if (currentTool === 'water') {
            t.water = WATER_DURATION;
            decorSfx('pop', 'popitWater');
            floatText(idx, "💧", "#74b9ff");
            updateTileWaterDOM(idx);
            updateQuest('water_plants', 1);
            return;
        }
        if (currentTool === 'harvest') {
            if (!t.active || t.growth < 100) {
                clearHarvestSelection();
                decorSfx('pop', 'popitClick');
                return;
            }
            if (env.harvestSelectedTile === idx) {
                clearHarvestSelection(idx);
                harvestPlant(idx);
            } else {
                selectHarvestTile(idx);
            }
            return;
        }

        if (PLANTS[currentTool]) {
            if (t.active) { decorSfx('pop', 'popitClick'); return; }
            const p = PLANTS[currentTool];
            if (getSeedOwned(p.id) <= 0) { showToast('Семена закончились', '#ff7675'); sfx.play('error'); renderSeeds(); return; }
            player.seedInventory[p.id] = Math.max(0, getSeedOwned(p.id) - 1);
            const cropWeight = rollCropWeight();
            t.active = true; t.plantId = p.id; t.growth = 0; t.water = 0; t.hasWeed = false; t.mutations = []; t.beeLock = 0;
            t.weight = cropWeight.weight; t.weightMult = cropWeight.weightMult; t.sizeTier = cropWeight.tier; t.scale = cropWeight.scale;
            const starterMutation = rollPlantingMaterialMutation();
            if (starterMutation) commitTileMutation(idx, starterMutation);
            ensureSelectedSeedAvailable();
            decorSfx('pop', 'popitClick'); floatText(idx, `-1 ${p.name}`, "#74b9ff");
            if (getSeedOwned(p.id) <= 0 || currentTool !== p.id) renderSeeds();
            else updateSeedPacketDOM(p.id);
            updateTileDOM(idx);
            const plantedTile = document.getElementById(`tile-${idx}`);
            plantedTile.classList.add('planting');
            setTimeout(() => plantedTile.classList.remove('planting'), 760);
        }
    }

    function updateTileWaterDOM(idx) {
        const tile = tiles[idx];
        const element = document.getElementById(`tile-${idx}`);
        if (!tile || !element) return;
        element.classList.toggle('wet', tile.water > 0);
        element.classList.toggle('slime-watered', tile.slimeWater > 0);
    }

    function harvestPlant(idx, options = {}) {
        const { deferUI = false, quiet = false } = options;
        const questOptions = { deferUI, quiet };
        clearHarvestSelection(idx);
        const t = tiles[idx];
        const p = t && PLANTS[t.plantId];
        if (!t?.active || t.growth < 100 || !p) return 0;
        let buffs = getBuffs();

        let totalMult = 1; 
        let highestColor = "#f1c40f"; 
        
        if (t.mutations.length > 0) {
            t.mutations.forEach(mId => {
                const m = MUTATIONS[mId];
                if (!m) return;
                totalMult *= m.mult;
                highestColor = m.color;
                updateQuest('find_mut', 1, questOptions);
                if (mId === 'gold') updateQuest('find_gold', 1, questOptions);
            });
        }

        const resolved = resolveTileWeightState(t, p, buffs);
        const actualWeight = resolved.actualWeight;
        const sizeTier = resolved.sizeTier;
        const isGhostEchoSale = !!t.ghostEcho;
        // A ghost echo keeps the exact visual tier it inherited from the original crop.
        const harvestSizeTier = t.ghostEcho ? (t.sizeTier || sizeTier) : sizeTier;
        const weightMult = resolved.weightMult;
        let finalReward = t.ghostValue > 0 ? Math.floor(t.ghostValue) : Math.floor(p.reward * totalMult * (1 + buffs.coinMult) * weightMult);
        let xp = Math.floor(finalReward * BALANCE.xpRewardRate);
        const legacyGhostEchoPercent = t.ghostEchoPercent || 0;
        const isGhostMarked = !!t.ghostMarked && t.ghostValue <= 0;
        const retainedMutationCount = isGhostMarked
            ? Math.max(0, Math.min(3, Math.floor(Number(t.ghostCopyMutationCount) || 0)))
            : (legacyGhostEchoPercent >= .85 ? 3 : (legacyGhostEchoPercent >= .55 ? 1 : 0));
        const shouldCreateGhostEcho = (isGhostMarked || legacyGhostEchoPercent > 0) && t.ghostValue <= 0;
        const ghostMutations = shouldCreateGhostEcho ? ghostCopyMutations(t.mutations, retainedMutationCount) : [];
        const cropRecord = {
            plantId: p.id,
            mutations: [...(t.mutations || [])],
            weight: Math.round(actualWeight * 10) / 10,
            weightMult,
            sizeTier: harvestSizeTier,
            value: finalReward
        };

        recordCropStats(cropRecord, finalReward, true, { quiet });
        player.coins += finalReward; player.xp += xp;
        while (player.xp >= player.xpNeed) {
            player.lvl++; player.xp -= player.xpNeed; player.xpNeed = Math.floor(player.xpNeed * (BALANCE.xpNeedMult || 1.5));
            if (!quiet) showToast(`УРОВЕНЬ ${player.lvl}! 🎉`, "#a29bfe");
            if (!quiet && Object.values(PLOT_UNLOCK_LEVELS).includes(player.lvl)) {
                showToast('Доступна новая грядка!', '#55efc4');
            }
            if (!deferUI) {
                renderSeeds();
                tiles.forEach((_, tileIdx) => updateTileDOM(tileIdx));
            }
        }

        if (!quiet && !isGhostEchoSale) {
            playHarvestSfx(harvestSizeTier);
            showHarvestSizeEffect(idx, harvestSizeTier);
        }
        if (!quiet) floatText(idx, `+${compactNumber(finalReward)}$`, highestColor);
        if (p.id === 'carrot') updateQuest('grow_carrot', 1, questOptions);
        updateQuest('harvest_any', 1, questOptions);
        updateQuest('earn_coins', finalReward, questOptions);
        updateQuest('earn_big', finalReward, questOptions);
        if ((p.lvl || 0) >= 7) updateQuest('harvest_rare', 1, questOptions);
        clearTile(idx, { deferDOM: deferUI });
        if (!deferUI) updateUI();
        if (!quiet && isGhostEchoSale) {
            spawnGhostMarkFX(idx);
            sfx.play('ghostEcho', 'ghost-echo-sale');
        }
        if (shouldCreateGhostEcho) {
            if (!quiet) spawnGhostDepartureFX(idx);
            Object.assign(tiles[idx], {
                id: idx,
                active: true,
                plantId: p.id,
                growth: 100,
                water: 0,
                slimeWater: 0,
                slimeWaterMult: 1,
                hasWeed: false,
                mutations: ghostMutations,
                scale: resolved.scale,
                weight: Math.round(actualWeight * 10) / 10,
                weightMult,
                sizeTier,
                beeLock: 0,
                ghostEchoPercent: 0,
                ghostMarked: false,
                ghostCopyMutationCount: 0,
                ghostEcho: true,
                ghostValue: 0
            });
            if (!deferUI) updateTileDOM(idx);
            if (!quiet) {
                spawnGhostMarkFX(idx);
                sfx.play('ghostEcho', 'ghost-echo-copy');
                floatText(idx, ghostMutations.length ? `копия: ${ghostMutations.length} мут.` : 'серая копия', '#cfd6df');
            }
        }
        return finalReward;
    }

    function playHarvestSfx(sizeTier) {
        if (sizeTier === 'titanic') sfx.play('titanicHarvest');
        else if (sizeTier === 'huge') sfx.play('hugeHarvest');
        else if (sizeTier === 'big') sfx.play('bigHarvest');
        else decorSfx('coin', 'popitHarvest');
    }

    function showHarvestSizeEffect(idx, sizeTier) {
        if (sizeTier !== 'huge' && sizeTier !== 'titanic') return;
        const tileEl = document.getElementById(`tile-${idx}`);
        if (!tileEl) return;
        const rect = tileEl.getBoundingClientRect();
        const burst = document.createElement('div');
        burst.className = `harvest-size-burst ${sizeTier}`;
        if (sizeTier === 'titanic') {
            burst.innerHTML = 'ТИТАНИЧЕСКИЙ!'.split('').map((ch, index) => `<span style="--glyph-index:${index}">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');
        } else burst.textContent = 'ОГРОМНЫЙ!';
        burst.style.left = `${rect.left + rect.width / 2}px`;
        burst.style.top = `${rect.top + rect.height / 2}px`;
        document.body.appendChild(burst);
        if (sizeTier === 'huge' || sizeTier === 'titanic') {
            document.body.classList.toggle('titanic-harvest-flash', sizeTier === 'titanic');
            document.body.classList.add('huge-harvest-flash');
            setTimeout(() => {
                document.body.classList.remove('huge-harvest-flash');
                document.body.classList.remove('titanic-harvest-flash');
            }, sizeTier === 'titanic' ? 760 : 520);
        }
        setTimeout(() => burst.remove(), sizeTier === 'titanic' ? 1650 : (sizeTier === 'huge' ? 1100 : 850));
    }

    function clearTile(idx, options = {}) {
        clearHarvestSelection(idx);
        tiles[idx].active = false; tiles[idx].plantId = null; tiles[idx].growth = 0; tiles[idx].water = 0; tiles[idx].slimeWater = 0; tiles[idx].slimeWaterMult = 1; tiles[idx].hasWeed = false; tiles[idx].mutations = []; tiles[idx].scale = .4; tiles[idx].weight = 1; tiles[idx].weightMult = 1; tiles[idx].sizeTier = 'small'; tiles[idx].beeLock = 0; tiles[idx].ghostEchoPercent = 0; tiles[idx].ghostMarked = false; tiles[idx].ghostCopyMutationCount = 0; tiles[idx].ghostEcho = false; tiles[idx].ghostValue = 0;
        if (!options.deferDOM) updateTileDOM(idx);
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
        if (type === 'night') return '☾ Ночь';
        if (type === 'cosmic') return '● Космос';
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

    function hasActiveEventFinale() {
        return (env.currentEvent === 'hell' && env.embergooMagmaFinale)
            || (env.currentEvent === 'starfall' && env.stargumCometFinale)
            || (env.currentEvent === 'night' && (env.moonmeltLunarFinale || env.nightDawnActive));
    }

    function pauseNextEventCountdownForCompanion() {
        const remaining = Math.max(0, Number(env.nextEventTimer) || 0);
        if (remaining <= 10) env.nextEventTimer = remaining + 10;
    }

    function updateStateIndicator() {
        const indicator = document.getElementById('state-indicator');
        if (!indicator) return;
        let signature = '';
        let markup = '';
        if (env.currentEvent === 'day' || (env.eventTimer <= 0 && !hasActiveEventFinale())) {
            const nextTimer = Math.max(0, Math.ceil(Number(env.nextEventTimer) || 0));
            const time = nextTimer > 0 ? formatEventTimer(nextTimer) : '0с';
            signature = `timer:${time}`;
            markup = `<span class="state-timer">${time}</span>`;
        } else {
            const label = getEventIndicatorLabel(env.currentEvent);
            signature = `event:${label}`;
            markup = `<span class="state-label">${label}</span>`;
        }
        if (indicator.dataset.renderSignature === signature) return;
        indicator.dataset.renderSignature = signature;
        indicator.innerHTML = markup;
    }

    function clearSunpuddingEclipsePhase() {
        if (env.sunpuddingEclipseTimer) clearTimeout(env.sunpuddingEclipseTimer);
        if (env.sunpuddingEclipseDarkTimer) clearTimeout(env.sunpuddingEclipseDarkTimer);
        env.sunpuddingEclipseTimer = null;
        env.sunpuddingEclipseDarkTimer = null;
        document.body.classList.remove('sunpudding-eclipse-fade', 'sunpudding-eclipse-dark');
        document.getElementById('event-ambience')?.classList.remove('sunpudding-eclipse-fade', 'sunpudding-eclipse-dark');
    }

    function saveInlineStyle(element, property) {
        return { value: element.style.getPropertyValue(property), priority: element.style.getPropertyPriority(property) };
    }

    function restoreInlineStyle(element, property, saved) {
        if (saved.value) element.style.setProperty(property, saved.value, saved.priority);
        else element.style.removeProperty(property);
    }

    function cssColorToRgb(value) {
        const parts = `${value || ''}`.match(/[\d.]+/g);
        if (!parts || parts.length < 3) return null;
        // Gradients often report a transparent fallback as rgba(0, 0, 0, 0).
        // It is not a real black garden color and must use the known base instead.
        if (parts.length > 3 && Number(parts[3]) === 0) return null;
        return parts.slice(0, 3).map(part => Math.max(0, Math.min(255, Number(part))));
    }

    function blendRgb(from, to, progress) {
        return from.map((channel, index) => Math.round(channel + (to[index] - channel) * progress));
    }

    function rgbCss(color) {
        return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    }

    function nightPaletteEase(progress) {
        return progress < .5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    }

    function stopNightGardenPalette(restore = true) {
        if (env.nightPaletteFrame) cancelAnimationFrame(env.nightPaletteFrame);
        env.nightPaletteFrame = null;
        if (restore && env.nightPalette) {
            const { garden, gardenStyles, tiles } = env.nightPalette;
            if (garden?.isConnected) {
                Object.entries(gardenStyles).forEach(([property, saved]) => restoreInlineStyle(garden, property, saved));
            }
            tiles.forEach(({ element, styles }) => {
                if (element.isConnected) restoreInlineStyle(element, 'border-color', styles['border-color']);
            });
        }
        if (restore) {
            env.nightPalette = null;
            env.nightPalettePhase = 'day';
        }
    }

    function captureNightGardenPalette() {
        const garden = document.getElementById('garden');
        if (!garden) return null;
        const gardenComputed = getComputedStyle(garden);
        const tilesSnapshot = Array.from(garden.querySelectorAll('.tile')).map(element => ({
            element,
            from: cssColorToRgb(getComputedStyle(element).borderTopColor) || [62, 27, 4],
            styles: { 'border-color': saveInlineStyle(element, 'border-color') }
        }));
        return {
            garden,
            gardenStyles: {
                background: saveInlineStyle(garden, 'background'),
                'border-color': saveInlineStyle(garden, 'border-color')
            },
            gardenFrom: cssColorToRgb(gardenComputed.backgroundColor) || [106, 176, 76],
            borderFrom: cssColorToRgb(gardenComputed.borderTopColor) || [139, 69, 19],
            tiles: tilesSnapshot
        };
    }

    function animateNightGardenPalette(phase) {
        stopNightGardenPalette(false);
        if (!env.nightPalette) env.nightPalette = captureNightGardenPalette();
        const palette = env.nightPalette;
        if (!palette) return;

        const paletteColors = {
            night: { garden: [185, 190, 200], border: [73, 52, 94], tile: [80, 59, 103] },
            bloodmoon: { garden: [218, 140, 146], border: [118, 40, 59], tile: [145, 54, 67] }
        };
        const targetPhase = phase === 'bloodmoon' ? 'bloodmoon' : (phase === 'night' ? 'night' : 'day');
        const sourcePhase = env.nightPalettePhase || 'day';
        const sourceColors = paletteColors[sourcePhase] || null;
        const targetColors = paletteColors[targetPhase] || null;
        const duration = targetPhase === 'night'
            ? NIGHT_AMBIENCE_ENTER_MS
            : (targetPhase === 'bloodmoon' ? BLOODMOON_AMBIENCE_ENTER_MS : NIGHT_AMBIENCE_EXIT_MS);
        const gardenTo = targetColors ? targetColors.garden : palette.gardenFrom;
        const borderTo = targetColors ? targetColors.border : palette.borderFrom;
        const tileTo = targetColors ? targetColors.tile : null;
        // Dawn must start at the color currently rendered on the garden, never at a stale phase preset.
        const currentGarden = cssColorToRgb(getComputedStyle(palette.garden).backgroundColor);
        const currentBorder = cssColorToRgb(getComputedStyle(palette.garden).borderTopColor);
        const currentTiles = new Map(palette.tiles.map(tile => [
            tile.element,
            cssColorToRgb(getComputedStyle(tile.element).borderTopColor)
        ]));
        const startedAt = performance.now();
        const mobilePaintInterval = matchMedia('(max-width:720px), (pointer:coarse)').matches ? 32 : 0;
        let lastPaintAt = -Infinity;

        const frame = now => {
            const progress = Math.min(1, (now - startedAt) / duration);
            if (progress < 1 && now - lastPaintAt < mobilePaintInterval) {
                env.nightPaletteFrame = requestAnimationFrame(frame);
                return;
            }
            lastPaintAt = now;
            const eased = nightPaletteEase(progress);
            const gardenStart = targetPhase === 'day' ? (currentGarden || palette.gardenFrom) : (sourceColors ? sourceColors.garden : palette.gardenFrom);
            const borderStart = targetPhase === 'day' ? (currentBorder || palette.borderFrom) : (sourceColors ? sourceColors.border : palette.borderFrom);

            palette.garden.style.setProperty('background', rgbCss(blendRgb(gardenStart, gardenTo, eased)), 'important');
            palette.garden.style.setProperty('border-color', rgbCss(blendRgb(borderStart, borderTo, eased)), 'important');
            palette.tiles.forEach(tile => {
                if (!tile.element.isConnected) return;
                const tileStart = targetPhase === 'day' ? (currentTiles.get(tile.element) || tile.from) : (sourceColors ? sourceColors.tile : tile.from);
                const tileEnd = targetColors ? tileTo : tile.from;
                tile.element.style.setProperty('border-color', rgbCss(blendRgb(tileStart, tileEnd, eased)), 'important');
            });

            if (progress < 1) {
                env.nightPaletteFrame = requestAnimationFrame(frame);
                return;
            }
            env.nightPaletteFrame = null;
            if (targetPhase === 'day') stopNightGardenPalette(true);
            else env.nightPalettePhase = targetPhase;
        };
        env.nightPaletteFrame = requestAnimationFrame(frame);
    }

    function clearNightAmbience() {
        if (env.nightDawnTimer) clearTimeout(env.nightDawnTimer);
        env.nightDawnTimer = null;
        env.nightDawnActive = false;
        document.body.classList.remove('night-fading');
        document.body.classList.remove('bloodmoon-phase');
        document.getElementById('garden')?.classList.remove('bloodmoon-dawn');
        stopNightGardenPalette(true);
    }

    function startNightAmbience() {
        clearNightAmbience();
        requestAnimationFrame(() => {
            if (env.currentEvent !== 'night') return;
            animateNightGardenPalette('night');
            requestAnimationFrame(() => {
                if (env.currentEvent === 'night') document.body.classList.add('night-fading');
            });
        });
    }

    function restoreBloodmoonPaletteWithoutBlend() {
        const garden = env.nightPalette?.garden;
        // Disable only the garden transition while restoring literal day colors.
        garden?.classList.add('bloodmoon-dawn');
        stopNightGardenPalette(true);
        requestAnimationFrame(() => garden?.classList.remove('bloodmoon-dawn'));
    }

    function beginNightDawn() {
        if (env.currentEvent !== 'night' || env.nightDawnActive) return;
        env.nightDawnActive = true;
        const wasBloodmoon = document.body.classList.contains('bloodmoon-phase');
        document.body.classList.remove('night-fading');
        document.body.classList.remove('bloodmoon-phase');
        if (wasBloodmoon) restoreBloodmoonPaletteWithoutBlend();
        else animateNightGardenPalette('day');
        env.nightDawnTimer = setTimeout(() => {
            if (env.currentEvent !== 'night' || !env.nightDawnActive) return;
            env.nightDawnActive = false;
            env.nightDawnTimer = null;
            startEvent('day');
        }, NIGHT_AMBIENCE_EXIT_MS);
        updateStateIndicator();
    }

    function startBloodmoonAmbience() {
        if (env.currentEvent !== 'night') return;
        document.body.classList.add('bloodmoon-phase');
        animateNightGardenPalette('bloodmoon');
    }

    function scheduleSunpuddingEclipsePhase(tier) {
        clearSunpuddingEclipsePhase();
        if (tier < 2) return false;
        const shouldTrigger = tier >= 3 || Math.random() < 0.35;
        if (!shouldTrigger) return false;
        const eventDurationMs = Math.max(5000, (Number(env.eventTimer) || BALANCE.eventDuration || 15) * 1000);
        const phaseLeadMs = 1800;
        const phaseDelayMs = Math.max(3500, eventDurationMs - phaseLeadMs);
        env.sunpuddingEclipseTimer = setTimeout(() => {
            if (env.currentEvent !== 'holy') {
                clearSunpuddingEclipsePhase();
                return;
            }
            document.body.classList.add('sunpudding-eclipse-fade');
            document.getElementById('event-ambience')?.classList.add('sunpudding-eclipse-fade');
            env.sunpuddingEclipseDarkTimer = setTimeout(() => {
                if (env.currentEvent !== 'holy') {
                    clearSunpuddingEclipsePhase();
                    return;
                }
                document.body.classList.add('sunpudding-eclipse-dark');
                document.getElementById('event-ambience')?.classList.add('sunpudding-eclipse-dark');
                const eclipseCount = tier >= 3 ? (1 + (Math.random() < 0.15 ? 1 : 0)) : 1;
                const added = addMutationToRandomTiles('eclipse', eclipseCount);
                if (added > 0) {
                    sfx.play('mut');
                    showToast('Затмение!', '#7b68ee');
                }
            }, 420);
        }, phaseDelayMs);
        return true;
    }

    function startEvent(type, customDuration = null) {
        const previousEvent = env.currentEvent || 'day';
        clearSunpuddingEclipsePhase();
        clearEmbergooMagmaTimers();
        clearStargumCometFinale();
        clearMoonmeltLunarFinale();
        clearNightAmbience();
        if (env.eventVisualFrame) cancelAnimationFrame(env.eventVisualFrame);
        env.eventVisualFrame = null;
        env.currentEvent = type;
        setBodyEventClass(type);
        const emitters = document.getElementById('bg-emitters');
        // Particle cleanup is deliberately moved off the same frame as the palette switch.
        // Combining DOM removal, style invalidation and new particle creation caused event-start spikes.
        requestAnimationFrame(() => requestAnimationFrame(() => emitters?.replaceChildren()));
        recordPerformanceEvent('event-transition', { from: previousEvent, to: type }, 0);

        if (type === 'starfall') { showToast("Магия звезд!", "#a29bfe"); scheduleEventBackgroundParticles(type); }
        else if (type === 'toxic') { showToast("Токсичные осадки!", "#c9ff4c"); scheduleEventBackgroundParticles(type); }
        else if (type === 'holy') { showToast("Солнечный луч!", "#f5f6fa"); }
        else if (type === 'hell') { showToast("Теплый вихрь!", "#e84118"); scheduleEventBackgroundParticles(type); }
        else if (type === 'candy') { showToast("Конфетный дождь!", "#ff9ff3"); scheduleEventBackgroundParticles(type); }
        else if (type === 'bee') { showToast("Жужжание повсюду!", "#f9ca24"); scheduleEventBackgroundParticles(type); }
        else if (type === 'alien') { showToast("Инопланетное вторжение!", "#40ffd2"); scheduleEventBackgroundParticles(type); }
        else if (type === 'night') {
            showToast("Ночь слайма", "#c4d4ff");
            startNightAmbience();
        }
        else if (type === 'cosmic') { showToast("Космический ивент!", "#7b4dff"); scheduleEventBackgroundParticles(type); }

        if (type === 'day') {
            env.eventTimer = 0;
            if (env.nextEventTimer <= 0) queueNextEvent();
            eventActions = [];
            updateStateIndicator();
            return;
        }
        
        env.eventTimer = customDuration || BALANCE.eventDuration || 15;
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
        else if (type === 'night') { targetCount = 0; mutType = 'lunar'; }
        else if (type === 'cosmic') { targetCount = Math.floor(Math.random() * 4) + 3; mutType = Math.random() < 0.5 ? 'meteor' : 'alien'; }

        if (targetCount > 0) {
            const effectiveMutType = resolveEventMutationType(mutType);
            let available = tiles
                .filter(t => canTileReceiveMutation(t, effectiveMutType))
                .map(t => t.id);
            available.sort(() => Math.random() - 0.5);
            for(let i=0; i < targetCount && available.length > 0; i++) {
                let tId = available.pop();
                eventActions.push({ time: Math.floor(Math.random() * 12) + 2, tileId: tId, mut: mutType, done: false });
            }
        }
    }

    function scheduleEventBackgroundParticles(type) {
        env.eventVisualFrame = requestAnimationFrame(() => {
            env.eventVisualFrame = requestAnimationFrame(() => {
                env.eventVisualFrame = null;
                if (env.currentEvent !== type) return;
                if (type === 'toxic') createToxicSlimeRain();
                else if (type === 'starfall') createBgParticles(['⭐'], 'bgFlyStar');
                else if (type === 'hell') createBgParticles(['■'], 'bgFlyAsh');
                else if (type === 'candy') createBgParticles(['🍬','🍭','🍩','🍪'], 'bgFlyCandy');
                else if (type === 'bee') createBgParticles(['🐝'], 'bgFlyBee');
                else if (type === 'alien') createBgParticles(['🛸'], 'bgFlyUfo');
                else if (type === 'cosmic') createBgParticles(['●','☄','✦'], 'bgFlyStar');
            });
        });
    }

    function createBgParticles(chars, animName) {
        const container = document.getElementById('bg-emitters');
        if (!container) return;
        const fragment = document.createDocumentFragment();
        const count = prefersCompactEffects() ? 6 : 15;
        for(let i=0; i<count; i++) {
            const p = document.createElement('div');
            p.innerText = chars[Math.floor(Math.random()*chars.length)];
            p.className = `bg-particle ${animName}`;
            p.style.setProperty('--x', `${Math.random() * 100}vw`);
            p.style.setProperty('--y', `${Math.random() * 100}vh`);
            p.style.setProperty('--delay', `${Math.random() * -6}s`);
            p.style.setProperty('--dur', `${Math.random() * 4 + 5}s`);
            p.style.setProperty('--size', `${Math.random() * 14 + 16}px`);
            fragment.appendChild(p);
        }
        container.appendChild(fragment);
    }

    function createToxicSlimeRain() {
        const container = document.getElementById('bg-emitters');
        if (!container) return;
        const fragment = document.createDocumentFragment();
        const count = prefersCompactEffects() ? 7 : 18;
        for (let i = 0; i < count; i++) {
            const blob = document.createElement('i');
            const size = Math.round(9 + Math.random() * 12);
            blob.className = 'bg-toxic-slime';
            blob.style.setProperty('--x', `${Math.round(Math.random() * 100)}vw`);
            blob.style.setProperty('--size', `${size}px`);
            blob.style.setProperty('--delay', `${-(Math.random() * 5.8).toFixed(2)}s`);
            blob.style.setProperty('--dur', `${(4.6 + Math.random() * 2.4).toFixed(2)}s`);
            blob.style.setProperty('--drift', `${Math.round(-12 + Math.random() * 24)}px`);
            fragment.appendChild(blob);
        }
        container.appendChild(fragment);
    }

    function prefersCompactEffects() {
        return window.matchMedia?.('(max-width: 700px)').matches || (navigator.deviceMemory && navigator.deviceMemory <= 4);
    }

    function triggerToxicSlimeMutation(idx) {
        const tile = tiles[idx];
        const tileEl = document.getElementById(`tile-${idx}`);
        if (!tileEl || !canTileReceiveMutation(tile, 'toxic')) return;

        const drop = document.createElement('i');
        drop.className = 'toxic-event-drop';
        drop.setAttribute('aria-hidden', 'true');
        tileEl.appendChild(drop);
        requestAnimationFrame(() => drop.classList.add('falling'));

        setTimeout(() => {
            if (!canTileReceiveMutation(tiles[idx], 'toxic')) return;
            sfx.play('mut');
            tileEl.classList.add('toxic-hit');
            const impact = document.createElement('i');
            impact.className = 'toxic-impact-puddle';
            impact.setAttribute('aria-hidden', 'true');
            impact.innerHTML = '<i class="toxic-impact-spray spray-left"></i><i class="toxic-impact-spray spray-center"></i><i class="toxic-impact-spray spray-right"></i>';
            tileEl.appendChild(impact);
        }, 760);
        setTimeout(() => {
            if (commitTileMutation(idx, 'toxic')) updateTileDOM(idx);
        }, 900);
        setTimeout(() => {
            tileEl.classList.remove('toxic-hit');
            drop.remove();
            tileEl.querySelectorAll('.toxic-impact-puddle').forEach(effect => effect.remove());
        }, 1280);
    }

    function applyEventMutation(idx, mutType) {
        const t = tiles[idx];
        const effectiveMutType = resolveEventMutationType(mutType);
        if (!canTileReceiveMutation(t, effectiveMutType)) return;

        // Hidden screens keep game state current without building disposable effects behind them.
        if (!isGardenSurfaceActive()) {
            commitMutationWithoutVisual(idx, effectiveMutType);
            return;
        }

        const tileEl = document.getElementById(`tile-${idx}`);

        // Визуальные эффекты ударов
        if (mutType === 'electric') { sfx.play('thunder'); tileEl.classList.add('strike'); setTimeout(() => tileEl.classList.remove('strike'), 300); }
        else if (mutType === 'stellar') {
            sfx.play('mut');
            tileEl.classList.add('star-hit');
            setTimeout(() => {
                tileEl.classList.remove('star-hit');
                if (commitTileMutation(idx, mutType)) updateTileDOM(idx);
            }, 950);
            return;
        }
        else if (mutType === 'candy') { sfx.play('candy'); tileEl.classList.add('candy-hit'); setTimeout(() => tileEl.classList.remove('candy-hit'), 1000); }
        else if (mutType === 'toxic') {
            triggerToxicSlimeMutation(idx);
            return;
        }
        else if (mutType === 'holy') {
            sfx.play('holy');
            if (t.growth < 100) {
                tileEl.classList.add('sprout-mut-hit');
                setTimeout(() => tileEl.classList.remove('sprout-mut-hit'), 900);
            }
            tileEl.classList.add('holy-hit');
            setTimeout(() => {
                tileEl.classList.remove('holy-hit');
                if (commitTileMutation(idx, mutType)) updateTileDOM(idx);
            }, 850);
            return;
        }
        else if (mutType === 'eclipse') {
            tileEl.classList.add('eclipse-hit');
            setTimeout(() => {
                tileEl.classList.remove('eclipse-hit');
                if (commitTileMutation(idx, mutType)) updateTileDOM(idx);
            }, 820);
            return;
        }
        else if (mutType === 'hell') {
            sfx.play('hell');
            tileEl.classList.add('hell-hit');
            setTimeout(() => {
                tileEl.classList.remove('hell-hit');
                if (commitTileMutation(idx, mutType)) updateTileDOM(idx);
            }, 850);
            return;
        }
        else if (mutType === 'alien') {
            sfx.play('mut');
            tileEl.classList.add('alien-hit');
            setTimeout(() => {
                tileEl.classList.remove('alien-hit');
                if (commitTileMutation(idx, mutType)) updateTileDOM(idx);
            }, 1100);
            return;
        }
        else if (mutType === 'lava') {
            triggerLavaMutationOnTile(idx, 0, true);
            return;
        }
        else if (mutType === 'bee') {
            sfx.play('bee'); tileEl.classList.add('bee-arrived'); t.beeLock = 3;
            setTimeout(() => {
                tileEl.classList.remove('bee-arrived');
                if (commitTileMutation(idx, 'honey')) updateTileDOM(idx);
            }, 2500);
            return;
        }

        if (commitTileMutation(idx, mutType)) updateTileDOM(idx);
    }

    function randomInt(min, max) {
        const a = Math.ceil(min);
        const b = Math.floor(max);
        return Math.floor(Math.random() * (b - a + 1)) + a;
    }

    function shuffleList(list) {
        return [...list].sort(() => Math.random() - 0.5);
    }

    function activePlantTileIds(options = {}) {
        return tiles
            .filter(t => t.active
                && (!options.growingOnly || t.growth < 100)
                && (!options.withoutWeeds || !t.hasWeed)
                && (!options.mutationRoom || ((t.mutations || []).length < 3)))
            .map(t => t.id);
    }

    function pickRandomTileIds(count, options = {}) {
        const pool = activePlantTileIds(options);
        return shuffleList(pool).slice(0, Math.max(0, count));
    }

    function pickValuableTileIds(count, options = {}) {
        return activePlantTileIds(options)
            .filter(id => !options.readyOnly || tiles[id]?.growth >= 100)
            .filter(id => !options.excludeTitanic || tiles[id]?.sizeTier !== 'titanic')
            .map(id => ({ id, value: inspectCropValue(tiles[id]) }))
            .sort((a, b) => b.value - a.value)
            .slice(0, Math.max(0, count))
            .map(item => item.id);
    }

    function companionAbilityTier() {
        const lvl = Math.max(1, Math.floor(Number(companionLevelState().level) || 1));
        if (lvl >= 15) return 3;
        if (lvl >= 8) return 2;
        return 1;
    }

    function ghostCopyMutations(sourceMutations, count) {
        if (count <= 0) return [];
        return shuffleList([...new Set((sourceMutations || []).filter(mId => MUTATIONS[mId]))]).slice(0, count);
    }

    function pickGhostAbilityTargets(tier) {
        const eligible = activePlantTileIds().filter(idx => {
            const tile = tiles[idx];
            return tile && tile.ghostValue <= 0 && !tile.ghostEcho && !tile.ghostMarked;
        });
        if (tier >= 3) {
            return eligible
                .map(idx => ({ idx, value: inspectCropValue(tiles[idx]) }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 1)
                .map(entry => entry.idx);
        }
        return shuffleList(eligible).slice(0, tier === 2 ? 2 : 1);
    }

    function spawnGhostDepartureFX(idx) {
        const tileEl = document.getElementById(`tile-${idx}`);
        if (!tileEl) return;
        const departure = document.createElement('i');
        departure.className = 'ghost-departure-fx';
        departure.setAttribute('aria-hidden', 'true');
        departure.innerHTML = '<i class="ghost-departure-eyes"></i><i class="ghost-departure-pop"></i>';
        tileEl.appendChild(departure);
        setTimeout(() => departure.remove(), 780);
    }

    function spawnGhostMarkFX(idx) {
        const tileEl = document.getElementById(`tile-${idx}`);
        if (!tileEl) return;
        const impact = document.createElement('i');
        impact.className = 'ghost-mark-impact';
        impact.setAttribute('aria-hidden', 'true');
        impact.innerHTML = '<i class="ghost-impact-ring"></i><i class="ghost-impact-wisp wisp-left"></i><i class="ghost-impact-wisp wisp-right"></i><i class="ghost-impact-wisp wisp-top"></i>';
        tileEl.appendChild(impact);
        setTimeout(() => impact.remove(), 980);
    }

    function canTileReceiveMutation(tile, mutType) {
        if (!tile || !tile.active || !MUTATIONS[mutType]) return false;
        const current = Array.isArray(tile.mutations) ? tile.mutations : [];
        if (current.includes(mutType)) return false;
        // These mutations are one state: Blood Moon upgrades Lunar and never occupies another slot.
        if (mutType === 'lunar' && current.includes('bloodmoon')) return false;
        if (mutType === 'bloodmoon') return current.includes('lunar');
        if (current.length >= 3) return false;
        if (MATERIAL_MUTATIONS.has(mutType) && current.some(existing => MATERIAL_MUTATIONS.has(existing))) return false;
        return true;
    }

    function commitTileMutation(idx, mutType) {
        const tile = tiles[idx];
        if (!canTileReceiveMutation(tile, mutType)) return false;
        if (mutType === 'bloodmoon') return replaceTileMutation(idx, 'lunar', 'bloodmoon');
        tile.mutations.push(mutType);
        return true;
    }

    function commitMutationWithoutVisual(idx, mutType) {
        return commitTileMutation(idx, resolveEventMutationType(mutType));
    }

    function resolveEventMutationType(mutType) {
        return mutType === 'bee' ? 'honey' : mutType;
    }

    function rollPlantingMaterialMutation() {
        const mChance = 1 + (getBuffs().mutChance || 0);
        const rainbowChance = 0.01 * mChance;
        const goldChance = 0.15 * mChance;
        const r = Math.random();
        if (r < rainbowChance) return 'rainbow';
        if (r < rainbowChance + goldChance) return 'gold';
        return null;
    }

    function addTileMutation(idx, mutType) {
        const t = tiles[idx];
        if (!canTileReceiveMutation(t, mutType)) return false;
        applyEventMutation(idx, mutType);
        return true;
    }

    function addMutationToRandomTiles(mutType, count, options = {}) {
        let added = 0;
        pickRandomTileIds(count + 4, { mutationRoom: true }).some(idx => {
            if (addTileMutation(idx, mutType)) added++;
            return added >= count;
        });
        return added;
    }

    function triggerBasicRainbowMutation(idx, delay = 0) {
        const tile = tiles[idx];
        const tileEl = document.getElementById(`tile-${idx}`);
        if (!tile?.active || !tileEl || !canTileReceiveMutation(tile, 'rainbow')) return false;
        setTimeout(() => {
            const liveTile = tiles[idx];
            const liveTileEl = document.getElementById(`tile-${idx}`);
            if (!liveTile?.active || !liveTileEl || !canTileReceiveMutation(liveTile, 'rainbow')) return;
            if (!isGardenSurfaceActive()) {
                commitMutationWithoutVisual(idx, 'rainbow');
                return;
            }
            const flare = document.createElement('i');
            flare.className = 'basic-rainbow-mutation-flash';
            flare.setAttribute('aria-hidden', 'true');
            liveTileEl.appendChild(flare);
            liveTileEl.classList.add('basic-rainbow-hit');
            sfx.play('mut');
            setTimeout(() => {
                if (commitTileMutation(idx, 'rainbow')) updateTileDOM(idx);
            }, 380);
            setTimeout(() => {
                liveTileEl.classList.remove('basic-rainbow-hit');
                flare.remove();
            }, 920);
        }, delay);
        return true;
    }

    function pickTileIdsForMutation(mutType, count, options = {}) {
        const excluded = new Set(options.excludeIds || []);
        return shuffleList(activePlantTileIds({ mutationRoom: true }))
            .filter(idx => !excluded.has(idx) && canTileReceiveMutation(tiles[idx], mutType))
            .slice(0, Math.max(0, count));
    }

    function triggerMidasTileDrop(idx, type = 'coin', delay = 0) {
        const el = document.getElementById(`tile-${idx}`);
        if (!el) return;
        setTimeout(() => {
            const mutType = type === 'diamond' ? 'diamond' : 'gold';
            if (!canTileReceiveMutation(tiles[idx], mutType)) return;
            if (!isGardenSurfaceActive()) {
                commitMutationWithoutVisual(idx, mutType);
                return;
            }
            const className = type === 'diamond' ? 'midas-diamond-hit' : 'midas-coin-hit';
            el.classList.add(className);
            setTimeout(() => {
                if (commitTileMutation(idx, mutType)) updateTileDOM(idx);
            }, 620);
            setTimeout(() => document.getElementById(`tile-${idx}`)?.classList.remove(className), 950);
        }, delay);
    }

    function triggerLavaMutationOnTile(idx, delay = 0, playSound = false) {
        const el = document.getElementById(`tile-${idx}`);
        if (!el) return false;
        queueEmbergooMagmaTimer(() => {
            const live = tiles[idx];
            if (!canTileReceiveMutation(live, 'lava')) return;
            if (!isGardenSurfaceActive()) {
                commitMutationWithoutVisual(idx, 'lava');
                return;
            }
            if (el.classList.contains('lava-hit')) return;
            if (playSound) sfx.play('lavaRise');
            el.classList.add('lava-hit');
            queueEmbergooMagmaTimer(() => {
                const current = tiles[idx];
                if (!canTileReceiveMutation(current, 'lava')) return;
                if (commitTileMutation(idx, 'lava')) {
                    if (isGardenSurfaceActive()) {
                        sfx.play('magmaMutation');
                        sfx.play('lavaBubble');
                        syncTileMutationPresentation(idx);
                    }
                }
            }, LAVA_MUTATION_COMMIT_DELAY_MS);
            queueEmbergooMagmaTimer(() => {
                const liveEl = document.getElementById(`tile-${idx}`);
                liveEl?.classList.remove('lava-hit');
                if (liveEl) sfx.play('lavaCool');
            }, LAVA_MUTATION_REMOVE_DELAY_MS);
        }, delay);
        return true;
    }

    function clearEmbergooMagmaTimers() {
        (env.embergooMagmaTimers || []).forEach(timerId => clearTimeout(timerId));
        env.embergooMagmaTimers = [];
        env.embergooMagmaFinale = false;
        document.body.classList.remove('embergoo-magma-finale');
        document.getElementById('event-ambience')?.classList.remove('embergoo-magma-finale');
        document.querySelectorAll('.tile.lava-hit').forEach(tile => tile.classList.remove('lava-hit'));
    }

    function stargumCometFrameSet() {
        if (!(env.stargumCometFrames instanceof Set)) env.stargumCometFrames = new Set(env.stargumCometFrames || []);
        return env.stargumCometFrames;
    }

    function clearStargumCometFinale() {
        (env.stargumCometTimers || []).forEach(timerId => clearTimeout(timerId));
        stargumCometFrameSet().forEach(frameId => cancelAnimationFrame(frameId));
        env.stargumCometTimers = [];
        env.stargumCometFrames = new Set();
        env.stargumCometFinale = false;
        document.querySelectorAll('.stargum-background-comet, .stargum-comet-shadow, .stargum-comet-projectile, .stargum-comet-fragment').forEach(effect => effect.remove());
        document.querySelectorAll('.tile.comet-hit').forEach(tile => tile.classList.remove('comet-hit'));
    }

    function queueStargumCometTimer(callback, delay) {
        const timerId = setTimeout(() => {
            env.stargumCometTimers = (env.stargumCometTimers || []).filter(id => id !== timerId);
            callback();
        }, delay);
        if (!Array.isArray(env.stargumCometTimers)) env.stargumCometTimers = [];
        env.stargumCometTimers.push(timerId);
        return timerId;
    }

    function stargumCometEaseIn(t) {
        return t * t * t;
    }

    function stargumCometEaseOut(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function stargumCometEaseInOut(t) {
        return t * t * (3 - 2 * t);
    }

    function spawnStargumCometFragments(garden, centerX, centerY) {
        const fragmentCount = prefersCompactEffects() ? 6 : 9;
        const batch = document.createDocumentFragment();
        for (let index = 0; index < fragmentCount; index++) {
            const fragment = document.createElement('span');
            const angle = (Math.PI * 2 * index) / fragmentCount + (Math.random() - .5) * .26;
            const distance = 38 + Math.random() * 44;
            fragment.className = 'stargum-comet-fragment';
            fragment.style.left = `${centerX}px`;
            fragment.style.top = `${centerY}px`;
            fragment.style.setProperty('--fragment-x', `${Math.cos(angle) * distance}px`);
            fragment.style.setProperty('--fragment-y', `${Math.sin(angle) * distance}px`);
            fragment.style.setProperty('--fragment-delay', `${Math.round(Math.random() * 45)}ms`);
            fragment.style.setProperty('--fragment-size', `${5 + Math.random() * 6}px`);
            batch.appendChild(fragment);
            queueStargumCometTimer(() => fragment.remove(), 980);
        }
        garden.appendChild(batch);
    }

    function playStargumBackgroundComet() {
        const container = document.getElementById('bg-emitters');
        const garden = document.getElementById('garden');
        if (!container || !garden) return;
        const comet = document.createElement('span');
        comet.className = 'stargum-background-comet';
        container.appendChild(comet);
        const gardenRect = garden.getBoundingClientRect();
        // A fast diagonal pass across the garden reads as a distant comet, not a UI streak.
        const startX = gardenRect.right + 120;
        const startY = gardenRect.top - 120;
        const endX = gardenRect.left - 120;
        const endY = gardenRect.bottom + 120;
        const startedAt = performance.now();
        let currentFrameId = null;
        const frame = now => {
            if (currentFrameId !== null) {
                stargumCometFrameSet().delete(currentFrameId);
                currentFrameId = null;
            }
            if (env.currentEvent !== 'starfall' || !isGardenSurfaceActive()) {
                comet.remove();
                return;
            }
            const progress = Math.min(1, (now - startedAt) / (STARGUM_COMET_PRELUDE_MS - 70));
            const eased = stargumCometEaseInOut(progress);
            const x = startX + (endX - startX) * eased;
            const y = startY + (endY - startY) * eased;
            const scale = .76 + Math.sin(progress * Math.PI) * .4;
            const opacity = Math.min(1, Math.sin(progress * Math.PI) * 1.15);
            comet.style.opacity = `${opacity}`;
            comet.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(-45deg) scale(${scale})`;
            if (progress < 1) {
                currentFrameId = requestAnimationFrame(frame);
                stargumCometFrameSet().add(currentFrameId);
                return;
            }
            comet.remove();
        };
        currentFrameId = requestAnimationFrame(frame);
        stargumCometFrameSet().add(currentFrameId);
    }

    function animateStargumCometLanding({ garden, idx, shadow, comet, centerX, centerY }) {
        const startedAt = performance.now();
        let currentFrameId = null;
        const frame = now => {
            if (currentFrameId !== null) {
                stargumCometFrameSet().delete(currentFrameId);
                currentFrameId = null;
            }
            if (env.currentEvent !== 'starfall') return;
            if (!isGardenSurfaceActive()) {
                shadow.remove();
                comet.remove();
                commitMutationWithoutVisual(idx, 'meteor');
                return;
            }
            const progress = Math.min(1, (now - startedAt) / STARGUM_COMET_IMPACT_DELAY_MS);

            const shadowProgress = progress < .68
                ? stargumCometEaseOut(progress / .68) * .48
                : .48 + stargumCometEaseIn((progress - .68) / .32) * .52;
            const shadowScale = 1.16 - shadowProgress * 1.06;
            const shadowOpacity = Math.sin(Math.min(1, progress * 1.2) * Math.PI * .5) * .72;
            shadow.style.opacity = `${Math.max(0, shadowOpacity * (1 - Math.max(0, progress - .94) / .06))}`;
            shadow.style.transform = `translate(-50%, -50%) scale(${shadowScale})`;

            const flightProgress = Math.max(0, (progress - .34) / .66);
            const flightEase = stargumCometEaseIn(Math.min(1, flightProgress));
            const flightY = -440 * (1 - flightEase);
            const flightScale = .42 + flightEase * .72;
            comet.style.opacity = `${Math.min(1, flightProgress * 3.4)}`;
            comet.style.transform = `translate(-50%, -50%) translateY(${flightY}px) scale(${flightScale})`;

            if (progress < 1) {
                currentFrameId = requestAnimationFrame(frame);
                stargumCometFrameSet().add(currentFrameId);
                return;
            }

            const liveTile = tiles[idx];
            const liveTileEl = document.getElementById(`tile-${idx}`);
            if (!liveTileEl || !canTileReceiveMutation(liveTile, 'meteor')) return;
            comet.classList.add('is-impact');
            liveTileEl.classList.add('comet-hit');
            spawnStargumCometFragments(garden, centerX, centerY);
            if (commitTileMutation(idx, 'meteor')) {
                sfx.play('cometImpact');
                syncTileMutationPresentation(idx);
            }
        };
        currentFrameId = requestAnimationFrame(frame);
        stargumCometFrameSet().add(currentFrameId);
    }

    function triggerStargumCometMutation(idx, delay = 0) {
        queueStargumCometTimer(() => {
            if (env.currentEvent !== 'starfall') return;
            const tile = tiles[idx];
            const tileEl = document.getElementById(`tile-${idx}`);
            const garden = document.getElementById('garden');
            if (!tileEl || !garden || !canTileReceiveMutation(tile, 'meteor')) return;
            if (!isGardenSurfaceActive()) {
                queueStargumCometTimer(() => {
                    if (env.currentEvent === 'starfall') commitMutationWithoutVisual(idx, 'meteor');
                }, STARGUM_COMET_PRELUDE_MS + STARGUM_COMET_IMPACT_DELAY_MS);
                return;
            }

            playStargumBackgroundComet();
            queueStargumCometTimer(() => {
                if (env.currentEvent !== 'starfall') return;
                if (!isGardenSurfaceActive()) {
                    commitMutationWithoutVisual(idx, 'meteor');
                    return;
                }

                const gardenRect = garden.getBoundingClientRect();
                const tileRect = tileEl.getBoundingClientRect();
                const centerX = tileRect.left - gardenRect.left + tileRect.width / 2;
                const centerY = tileRect.top - gardenRect.top + tileRect.height / 2;
                const shadowSize = Math.round(Math.min(gardenRect.width, gardenRect.height) * .92);
                const shadow = document.createElement('span');
                const comet = document.createElement('span');
                shadow.className = 'stargum-comet-shadow';
                comet.className = 'stargum-comet-projectile';
                [shadow, comet].forEach(effect => {
                    effect.style.setProperty('--comet-x', `${centerX}px`);
                    effect.style.setProperty('--comet-y', `${centerY}px`);
                    effect.style.setProperty('--comet-shadow-size', `${shadowSize}px`);
                    garden.appendChild(effect);
                });

                animateStargumCometLanding({ garden, idx, shadow, comet, centerX, centerY });

                queueStargumCometTimer(() => {
                    tileEl.classList.remove('comet-hit');
                    shadow.remove();
                    comet.remove();
                }, STARGUM_COMET_CLEANUP_DELAY_MS);
            }, STARGUM_COMET_PRELUDE_MS);
        }, delay);
    }

    function scheduleStargumCometFinale(cometCount) {
        if (cometCount <= 0) return 0;
        clearStargumCometFinale();
        env.stargumCometFinale = true;
        const eventDurationMs = Math.max(8000, (Number(env.eventTimer) || BALANCE.eventDuration || 15) * 1000);
        const stellarActions = eventActions.filter(action => action.mut === 'stellar');
        const finalStellarMutationMs = stellarActions.length
            ? Math.max(...stellarActions.map(action => Math.max(0, eventDurationMs - action.time * 1000) + 1020))
            : 0;
        const finaleStartMs = finalStellarMutationMs + 520;
        const cometSequenceMs = STARGUM_COMET_PRELUDE_MS + STARGUM_COMET_CLEANUP_DELAY_MS;
        const finaleSpanMs = cometCount * cometSequenceMs + Math.max(0, cometCount - 1) * STARGUM_COMET_GAP_MS;

        queueStargumCometTimer(() => {
            if (env.currentEvent !== 'starfall') return;
            const targets = pickTileIdsForMutation('meteor', cometCount);
            if (!targets.length) {
                clearStargumCometFinale();
                startEvent('day');
                return;
            }
            targets.forEach((idx, order) => triggerStargumCometMutation(idx, order * (cometSequenceMs + STARGUM_COMET_GAP_MS)));
        }, finaleStartMs);

        queueStargumCometTimer(() => {
            if (env.currentEvent !== 'starfall') return;
            env.stargumCometFinale = false;
            startEvent('day');
        }, finaleStartMs + finaleSpanMs + 260);
        return finaleStartMs + finaleSpanMs + 260;
    }

    function clearMoonmeltLunarFinale() {
        (env.moonmeltLunarTimers || []).forEach(timerId => clearTimeout(timerId));
        env.moonmeltLunarTimers = [];
        env.moonmeltLunarFinale = false;
        document.body.classList.remove('moonmelt-night-deep');
        document.body.classList.remove('bloodmoon-phase');
        document.getElementById('garden')?.classList.remove('moonmelt-moonlit');
        document.querySelectorAll('.lunar-mutation-beam').forEach(effect => effect.remove());
        document.querySelectorAll('.bloodmoon-mutation-beam').forEach(effect => effect.remove());
        document.querySelectorAll('.tile.lunar-hit').forEach(tile => tile.classList.remove('lunar-hit'));
        document.querySelectorAll('.tile.bloodmoon-hit').forEach(tile => tile.classList.remove('bloodmoon-hit'));
    }

    function queueMoonmeltLunarTimer(callback, delay) {
        const timerId = setTimeout(() => {
            env.moonmeltLunarTimers = (env.moonmeltLunarTimers || []).filter(id => id !== timerId);
            callback();
        }, delay);
        if (!Array.isArray(env.moonmeltLunarTimers)) env.moonmeltLunarTimers = [];
        env.moonmeltLunarTimers.push(timerId);
        return timerId;
    }

    function animateMoonmeltVisual(element, durationMs, renderFrame) {
        const startedAt = performance.now();
        const frame = now => {
            if (!element.isConnected) return;
            if (!isElementSurfaceActive(element)) {
                renderFrame(1);
                return;
            }
            const progress = Math.min(1, Math.max(0, (now - startedAt) / durationMs));
            renderFrame(progress);
            if (progress < 1) requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
    }

    function smoothProgress(progress) {
        const clamped = Math.max(0, Math.min(1, progress));
        return clamped * clamped * (3 - 2 * clamped);
    }

    function animateMoonmeltLunarBeam(beam) {
        animateMoonmeltVisual(beam, MOONMELT_LUNAR_BEAM_REMOVE_DELAY_MS, progress => {
            const arrival = smoothProgress(Math.min(1, progress / .72));
            const fade = progress <= .76 ? 1 : 1 - smoothProgress((progress - .76) / .24);
            const flash = Math.sin(Math.PI * Math.max(0, Math.min(1, (progress - .62) / .22)));
            beam.style.setProperty('--lunar-receive-opacity', (Math.min(1, progress / .26) * .96 * fade).toFixed(3));
            beam.style.setProperty('--lunar-receive-y', `${(-23 + arrival * 25).toFixed(2)}px`);
            beam.style.setProperty('--lunar-receive-scale-x', (.74 + arrival * .28).toFixed(3));
            beam.style.setProperty('--lunar-receive-scale-y', (.96 + arrival * .065).toFixed(3));
            beam.style.setProperty('--lunar-receive-flash-opacity', (flash * .92).toFixed(3));
            beam.style.setProperty('--lunar-receive-flash-scale', (.22 + flash * 2.8).toFixed(3));
        });
    }

    function animateMoonmeltBloodmoonMoon(moon) {
        animateMoonmeltVisual(moon, MOONMELT_BLOODMOON_BEAM_REMOVE_DELAY_MS, progress => {
            const settle = smoothProgress(Math.min(1, progress / .5));
            const burst = smoothProgress(Math.max(0, Math.min(1, (progress - .7) / .1)));
            const flare = Math.sin(Math.PI * Math.max(0, Math.min(1, (progress - .64) / .16)));
            const scale = 1.55 - settle * .55;
            moon.style.setProperty('--bloodmoon-moon-opacity', (settle * (1 - burst)).toFixed(3));
            moon.style.setProperty('--bloodmoon-moon-y', '0px');
            moon.style.setProperty('--bloodmoon-moon-scale', scale.toFixed(3));
            moon.style.setProperty('--bloodmoon-moon-scale-y', (scale * .93).toFixed(3));
            moon.style.setProperty('--bloodmoon-flash-opacity', (flare * .96).toFixed(3));
            moon.style.setProperty('--bloodmoon-flash-scale', (.42 + flare * 2.5).toFixed(3));
        });
    }

    function triggerMoonmeltLunarMutation(idx, delay = 0) {
        queueMoonmeltLunarTimer(() => {
            if (env.currentEvent !== 'night') return;
            const tile = tiles[idx];
            const tileEl = document.getElementById(`tile-${idx}`);
            if (!tileEl || !canTileReceiveMutation(tile, 'lunar') || tileEl.classList.contains('lunar-hit')) return;
            if (!isGardenSurfaceActive()) {
                queueMoonmeltLunarTimer(() => {
                    if (env.currentEvent === 'night') commitMutationWithoutVisual(idx, 'lunar');
                }, MOONMELT_LUNAR_BEAM_COMMIT_DELAY_MS);
                return;
            }

            const beam = document.createElement('span');
            beam.className = 'lunar-mutation-beam';
            tileEl.appendChild(beam);
            tileEl.classList.add('lunar-hit');
            animateMoonmeltLunarBeam(beam);

            queueMoonmeltLunarTimer(() => {
                const liveTile = tiles[idx];
                if (!canTileReceiveMutation(liveTile, 'lunar')) return;
                if (commitTileMutation(idx, 'lunar')) {
                    if (isGardenSurfaceActive()) {
                        sfx.play('mut');
                        syncTileMutationPresentation(idx);
                    }
                }
            }, MOONMELT_LUNAR_BEAM_COMMIT_DELAY_MS);

            queueMoonmeltLunarTimer(() => {
                tileEl.classList.remove('lunar-hit');
                beam.remove();
            }, MOONMELT_LUNAR_BEAM_REMOVE_DELAY_MS);
        }, delay);
    }

    function replaceTileMutation(idx, fromMutation, toMutation) {
        const tile = tiles[idx];
        if (!tile || !MUTATIONS[toMutation]) return false;
        const mutationIndex = (tile.mutations || []).indexOf(fromMutation);
        if (mutationIndex < 0 || tile.mutations.includes(toMutation)) return false;
        tile.mutations[mutationIndex] = toMutation;
        return true;
    }

    function triggerMoonmeltBloodmoonMutation(idx, delay = 0) {
        queueMoonmeltLunarTimer(() => {
            if (env.currentEvent !== 'night') return;
            const tile = tiles[idx];
            const tileEl = document.getElementById(`tile-${idx}`);
            if (!tileEl || !tile?.mutations.includes('lunar') || tileEl.classList.contains('bloodmoon-hit')) return;
            if (!isGardenSurfaceActive()) {
                queueMoonmeltLunarTimer(() => {
                    if (env.currentEvent === 'night') commitMutationWithoutVisual(idx, 'bloodmoon');
                }, MOONMELT_BLOODMOON_BEAM_COMMIT_DELAY_MS);
                return;
            }

            const beam = document.createElement('span');
            beam.className = 'bloodmoon-mutation-beam';
            tileEl.appendChild(beam);
            tileEl.classList.add('bloodmoon-hit');
            animateMoonmeltBloodmoonMoon(beam);

            queueMoonmeltLunarTimer(() => {
                if (!tiles[idx]?.mutations.includes('lunar')) return;
                if (replaceTileMutation(idx, 'lunar', 'bloodmoon')) {
                    if (isGardenSurfaceActive()) {
                        sfx.play('mut');
                        syncTileMutationPresentation(idx);
                    }
                }
            }, MOONMELT_BLOODMOON_BEAM_COMMIT_DELAY_MS);

            queueMoonmeltLunarTimer(() => {
                tileEl.classList.remove('bloodmoon-hit');
                beam.remove();
            }, MOONMELT_BLOODMOON_BEAM_REMOVE_DELAY_MS);
        }, delay);
    }

    function scheduleMoonmeltLunarFinale(lunarTiles, bloodmoonTiles = []) {
        if (!lunarTiles.length) return 0;
        clearMoonmeltLunarFinale();
        env.moonmeltLunarFinale = true;
        const gatheringMs = 3600;
        const lunarSequenceMs = MOONMELT_LUNAR_BEAM_REMOVE_DELAY_MS
            + Math.max(0, lunarTiles.length - 1) * MOONMELT_LUNAR_BEAM_GAP_MS;
        const bloodmoonPhaseStartMs = gatheringMs + lunarSequenceMs + 360;
        const bloodmoonStartMs = bloodmoonPhaseStartMs + BLOODMOON_AMBIENCE_ENTER_MS;
        const bloodmoonSequenceMs = bloodmoonTiles.length
            ? MOONMELT_BLOODMOON_BEAM_REMOVE_DELAY_MS + Math.max(0, bloodmoonTiles.length - 1) * MOONMELT_BLOODMOON_BEAM_GAP_MS
            : 0;
        const totalMs = bloodmoonTiles.length
            ? bloodmoonStartMs + bloodmoonSequenceMs + 760
            : gatheringMs + lunarSequenceMs + 1100;

        queueMoonmeltLunarTimer(() => {
            if (env.currentEvent !== 'night') return;
            lunarTiles.forEach((idx, order) => triggerMoonmeltLunarMutation(idx, order * MOONMELT_LUNAR_BEAM_GAP_MS));
        }, gatheringMs);
        if (bloodmoonTiles.length) {
            queueMoonmeltLunarTimer(() => {
                if (env.currentEvent !== 'night') return;
                startBloodmoonAmbience();
            }, bloodmoonPhaseStartMs);
            queueMoonmeltLunarTimer(() => {
                if (env.currentEvent !== 'night') return;
                bloodmoonTiles.forEach((idx, order) => triggerMoonmeltBloodmoonMutation(idx, order * MOONMELT_BLOODMOON_BEAM_GAP_MS));
            }, bloodmoonStartMs);
        }
        queueMoonmeltLunarTimer(() => {
            if (env.currentEvent !== 'night') return;
            env.moonmeltLunarFinale = false;
            document.body.classList.remove('moonmelt-night-deep');
            beginNightDawn();
        }, totalMs);
        return totalMs;
    }

    function queueEmbergooMagmaTimer(callback, delay) {
        const timerId = setTimeout(() => {
            env.embergooMagmaTimers = (env.embergooMagmaTimers || []).filter(id => id !== timerId);
            callback();
        }, delay);
        if (!Array.isArray(env.embergooMagmaTimers)) env.embergooMagmaTimers = [];
        env.embergooMagmaTimers.push(timerId);
        return timerId;
    }

    function setEmbergooAbilityPhase(phase) {
        if (env.companionAbilitySpecial !== 'embergoo') return;
        env.companionAbilityPayload = {
            ...(env.companionAbilityPayload || {}),
            embergoo: {
                ...(env.companionAbilityPayload?.embergoo || {}),
                phase
            }
        };
        syncCompanionSpecialClasses();
    }

    function stopPendingHellMutationActions() {
        eventActions.forEach(action => {
            if (action.mut === 'hell') action.done = true;
        });
    }

    function scheduleEmbergooMagmaFinale(tier, lavaTiles) {
        if (!lavaTiles.length) return;
        clearEmbergooMagmaTimers();
        env.embergooMagmaFinale = true;
        const eventDurationMs = Math.max(8000, (Number(env.eventTimer) || BALANCE.eventDuration || 20) * 1000);
        const lavaSpanMs = LAVA_MUTATION_REMOVE_DELAY_MS + Math.max(0, lavaTiles.length - 1) * 240;
        const surgeDelayMs = Math.max(3500, eventDurationMs - EMBERGOO_MAGMA_SURGE_LEAD_MS - lavaSpanMs);
        const magmaStartDelayMs = surgeDelayMs + EMBERGOO_MAGMA_SURGE_LEAD_MS + (tier >= 3 ? 0 : 120);
        const lastLavaFadeMs = magmaStartDelayMs + Math.max(0, lavaTiles.length - 1) * 240 + LAVA_MUTATION_REMOVE_DELAY_MS;
        queueEmbergooMagmaTimer(() => {
            stopPendingHellMutationActions();
            setEmbergooAbilityPhase('surge');
            sfx.play('magmaRumble', 'embergoo-magma-rumble');
        }, surgeDelayMs);
        queueEmbergooMagmaTimer(() => {
            setEmbergooAbilityPhase('mutating');
            sfx.play('lavaFlow', 'embergoo-lava-flow');
            lavaTiles.forEach((idx, order) => triggerLavaMutationOnTile(idx, order * 240, order === 0));
        }, magmaStartDelayMs);
        queueEmbergooMagmaTimer(() => {
            setEmbergooAbilityPhase('cooling');
        }, lastLavaFadeMs);
        queueEmbergooMagmaTimer(() => {
            if (env.currentEvent !== 'hell') return;
            env.embergooMagmaFinale = false;
            startEvent('day');
            syncCompanionSpecialClasses();
        }, lastLavaFadeMs + EMBERGOO_MAGMA_COOLDOWN_MS);
    }

    function setTileSizeTier(idx, tier) {
        const t = tiles[idx];
        if (!t || !t.active) return false;
        if (tier === 'big') {
            if (t.sizeTier === 'big' || t.sizeTier === 'huge' || t.sizeTier === 'titanic') return false;
            t.weight = Math.max(BIG_WEIGHT_MIN, Math.min(BIG_WEIGHT_MAX, Math.max(t.weight || 5, BIG_WEIGHT_MIN + Math.random() * (BIG_WEIGHT_MAX - BIG_WEIGHT_MIN))));
            t.sizeTier = 'big';
        } else if (tier === 'huge') {
            if (t.sizeTier === 'huge' || t.sizeTier === 'titanic') return false;
            t.weight = Math.max(HUGE_WEIGHT_MIN, Math.min(HUGE_WEIGHT_MAX, Math.max(t.weight || 5, HUGE_WEIGHT_MIN + Math.random() * (HUGE_WEIGHT_MAX - HUGE_WEIGHT_MIN))));
            t.sizeTier = 'huge';
        } else if (tier === 'titanic') {
            t.weight = Math.max(TITANIC_WEIGHT_MIN, Math.min(TITANIC_WEIGHT_MAX, t.weight || TITANIC_WEIGHT_MIN));
            t.sizeTier = 'titanic';
        }
        t.scale = visualScaleForWeight(t.weight, t.sizeTier);
        const el = document.getElementById(`tile-${idx}`);
        if (el) {
            el.classList.add('ability-grow-pop');
            setTimeout(() => el.classList.remove('ability-grow-pop'), 850);
        }
        updateTileDOM(idx);
        trackModelBoundMutationGeometry(el, 900);
        return true;
    }

    function grantRandomSeedsFromPool(pool, amount) {
        const valid = pool.filter(id => PLANTS[id]);
        const granted = [];
        for (let i = 0; i < amount && valid.length; i++) {
            const id = valid[Math.floor(Math.random() * valid.length)];
            grantSeedReward(id, 1);
            granted.push(id);
        }
        renderSeeds();
        return granted;
    }

    function sproutGiftPool(tier) {
        if (tier >= 3) return ['pomegranate', 'dragonfruit', 'starfruit', 'fig'];
        if (tier >= 2) return ['pumpkin', 'corn', 'mushroom', 'watermelon', 'melon', 'pineapple'];
        return ['carrot', 'cucumber', 'pepper', 'tomato', 'eggplant', 'strawberry'];
    }

    function rollSproutSeedGift(tier) {
        const pool = shuffleList(sproutGiftPool(tier).filter(id => PLANTS[id]));
        const target = randomInt(8, 15);
        const grants = [];
        let total = 0;
        for (let index = 0; index < pool.length && total < target; index++) {
            const remainingKinds = pool.length - index - 1;
            const remainingNeed = target - total;
            const minForThis = Math.max(1, remainingNeed - remainingKinds * 4);
            const maxForThis = Math.min(4, remainingNeed);
            const amount = randomInt(minForThis, maxForThis);
            total += amount;
            grants.push({ seedId: pool[index], amount });
        }
        return grants;
    }

    function grantSproutSeedGift(tier) {
        const grants = rollSproutSeedGift(tier);
        grants.forEach(item => grantSeedReward(item.seedId, item.amount));
        renderSeeds();
        return grants;
    }

    function triggerAbilityFlood(intensity = 'normal') {
        const garden = document.getElementById('garden');
        if (!garden) return;
        garden.classList.add('ability-flood');
        garden.classList.toggle('ability-flood-big', intensity === 'big');
        if (env.abilityFloodTimer) clearTimeout(env.abilityFloodTimer);
        env.abilityFloodTimer = setTimeout(() => {
            garden.classList.remove('ability-flood');
            garden.classList.remove('ability-flood-big');
            env.abilityFloodTimer = null;
        }, intensity === 'big' ? 1700 : 1100);
    }

    function triggerWaveGrowthOnTile(idx, delay = 0) {
        const el = document.getElementById(`tile-${idx}`);
        if (!el) return;
        setTimeout(() => {
            el.classList.add('wave-rise-hit');
            setTimeout(() => {
                const tile = tiles[idx];
                if (!tile || !tile.active || tile.hasWeed) return;
                tile.growth = 100;
                updateTileDOM(idx);
            }, 250);
            setTimeout(() => document.getElementById(`tile-${idx}`)?.classList.remove('wave-rise-hit'), 820);
        }, delay);
    }

    function triggerWaveGardenFlood(tileIds) {
        const picked = Array.isArray(tileIds) ? tileIds : [];
        if (!picked.length) return;
        triggerAbilityFlood('big');
        picked.forEach((idx, order) => {
            const el = document.getElementById(`tile-${idx}`);
            el?.classList.add('ability-flooded');
            setTimeout(() => {
                const tile = tiles[idx];
                if (tile && tile.active && !tile.hasWeed) {
                    tile.growth = 100;
                    updateTileDOM(idx);
                }
            }, 840 + order * 22);
            setTimeout(() => document.getElementById(`tile-${idx}`)?.classList.remove('ability-flooded'), 1550);
        });
    }

    function triggerCompanionEvent(type, duration = null) {
        pauseNextEventCountdownForCompanion();
        startEvent(type, duration);
        updateStateIndicator();
    }

    function triggerTileSlimeWaterFade(idx) {
        const el = document.getElementById(`tile-${idx}`);
        if (!el) return;
        el.classList.add('slime-water-fade');
        setTimeout(() => document.getElementById(`tile-${idx}`)?.classList.remove('slime-water-fade'), 950);
    }

    function spawnNectarDropFX(tileEl, delay = 0, size = 'normal') {
        if (!tileEl) return;
        setTimeout(() => {
            const drop = document.createElement('span');
            drop.className = `nectar-drop-cast ${size === 'titanic' ? 'titanic' : ''}`;
            drop.style.left = `${50 + (Math.random() * 16 - 8)}%`;
            tileEl.appendChild(drop);
            setTimeout(() => drop.remove(), size === 'titanic' ? 1250 : 900);
        }, delay);
    }

    function triggerNectarGrowthOnTile(idx, targetTier, delay = 0) {
        const tier = targetTier === 'huge' ? 'huge' : 'big';
        const el = document.getElementById(`tile-${idx}`);
        if (!el) return;
        setTimeout(() => {
            const tile = tiles[idx];
            if (!tile || !tile.active) return;
            el.classList.add('nectar-grow-hit');
            spawnNectarDropFX(el, 0, tier);
            setTimeout(() => {
                const live = tiles[idx];
                if (!live || !live.active) return;
                live.growth = 100;
                setTileSizeTier(idx, tier);
            }, 320);
            setTimeout(() => document.getElementById(`tile-${idx}`)?.classList.remove('nectar-grow-hit'), 980);
        }, delay);
    }

    function triggerTitanicNectarGrowthOnTile(idx, delay = 0) {
        const el = document.getElementById(`tile-${idx}`);
        if (!el) return;
        setTimeout(() => {
            const tile = tiles[idx];
            if (!tile || !tile.active || tile.growth < 100) return;
            el.classList.add('nectar-titanic-charge');
            spawnNectarDropFX(el, 0, 'titanic');
            spawnNectarDropFX(el, 260, 'titanic');
            spawnNectarDropFX(el, 520, 'titanic');
            setTimeout(() => {
                document.getElementById(`tile-${idx}`)?.classList.add('nectar-grow-hit');
            }, 780);
            setTimeout(() => {
                const live = tiles[idx];
                if (!live || !live.active || live.growth < 100) return;
                const startScale = Math.max(0.5, Number(live.scale) || 1);
                live.weight = randomInt(TITANIC_WEIGHT_MIN, TITANIC_WEIGHT_MAX);
                live.sizeTier = 'titanic';
                const finalScale = visualScaleForWeight(live.weight, 'titanic');
                live.scale = parseFloat(startScale.toFixed(3));
                el.classList.add('nectar-titanic-growing');
                updateTileDOM(idx);
                setTimeout(() => {
                    const current = tiles[idx];
                    if (!current || !current.active || current.growth < 100) return;
                    current.scale = parseFloat(finalScale.toFixed(3));
                    updateTileDOM(idx);
                    trackModelBoundMutationGeometry(document.getElementById(`tile-${idx}`), 1050);
                    document.body.classList.add('titanic-growth-darken');
                    setTimeout(() => document.body.classList.remove('titanic-growth-darken'), 180);
                }, 50);
                const tileNode = document.getElementById(`tile-${idx}`);
                tileNode?.classList.add('nectar-titanic-flash');
                document.body.classList.add('titanic-harvest-flash');
                setTimeout(() => document.body.classList.remove('titanic-harvest-flash'), 780);
            }, 1080);
            setTimeout(() => document.getElementById(`tile-${idx}`)?.classList.remove('nectar-grow-hit'), 1580);
            setTimeout(() => document.getElementById(`tile-${idx}`)?.classList.remove('nectar-titanic-charge'), 1760);
            setTimeout(() => document.getElementById(`tile-${idx}`)?.classList.remove('nectar-titanic-flash'), 1760);
            setTimeout(() => document.getElementById(`tile-${idx}`)?.classList.remove('nectar-titanic-growing'), 1760);
        }, delay);
    }

    function applyCompanionAbilityEffect(id, tier) {
        if (id === 'basic') {
            const count = tier === 3 ? randomInt(3, 6) : (tier === 2 ? randomInt(2, 3) : 1);
            const targets = pickTileIdsForMutation('rainbow', count);
            targets.forEach((idx, order) => triggerBasicRainbowMutation(idx, order * 180));
            return {
                ok: targets.length > 0,
                message: targets.length > 1 ? `Радужный всплеск: ${targets.length} растений` : 'Радужная мутация!',
                specialDurationMs: Math.max(1100, targets.length * 180 + 920)
            };
        }
        if (id === 'dewdrop') {
            const count = tier === 3 ? activePlantTileIds().length : randomInt(tier === 2 ? 3 : 2, tier === 2 ? 5 : 3);
            const mult = tier === 3 ? 3 : (tier === 2 ? 2.5 : 2);
            const picked = tier === 3 ? activePlantTileIds() : pickRandomTileIds(count);
            picked.forEach(idx => {
                const t = tiles[idx];
                t.water = Math.max(t.water || 0, 10);
                t.slimeWater = 10;
                t.slimeWaterMult = mult;
                document.getElementById(`tile-${idx}`)?.classList.add('slime-water-hit');
                setTimeout(() => document.getElementById(`tile-${idx}`)?.classList.remove('slime-water-hit'), 650);
                updateTileDOM(idx);
            });
            return { ok: picked.length > 0, message: `Слайм полил грядки x${mult}` };
        }
        if (id === 'sproutslime') {
            const grants = grantSproutSeedGift(tier);
            showSproutSeedGiftPop(grants);
            return { ok: grants.length > 0, message: 'Дары природы!' };
        }
        if (id === 'coinblob') {
            const goldCount = tier === 1 ? 1 : randomInt(2, 3);
            const diamondTiles = tier === 3 ? pickTileIdsForMutation('diamond', 1) : [];
            const goldTiles = pickTileIdsForMutation('gold', goldCount, { excludeIds: diamondTiles });
            diamondTiles.forEach((idx, order) => triggerMidasTileDrop(idx, 'diamond', 520 + order * 180));
            goldTiles.forEach((idx, order) => triggerMidasTileDrop(idx, 'coin', 700 + (diamondTiles.length + order) * 180));
            return {
                ok: goldTiles.length + diamondTiles.length > 0,
                message: diamondTiles.length ? 'Рука Мидаса!' : 'Золотая мутация!',
                effect: { midas: { goldTiles, diamondTiles } }
            };
        }
        if (id === 'sparkjelly') {
            const count = tier === 1 ? 1 : (tier === 2 ? 2 : 3);
            const added = addMutationToRandomTiles('electric', count);
            return { ok: added > 0, refund: tier === 3 ? 15 : 0, message: tier === 3 ? 'Искры вернули 15% заряда' : 'Электрическая мутация!' };
        }
        if (id === 'wavegum') {
            const allChance = tier === 3 && Math.random() < 0.15;
            const picked = allChance
                ? activePlantTileIds({ growingOnly: true, withoutWeeds: true })
                : pickRandomTileIds(tier, { growingOnly: true, withoutWeeds: true });
            if (allChance) triggerWaveGardenFlood(picked);
            else picked.forEach((idx, order) => triggerWaveGrowthOnTile(idx, order * 120));
            return {
                ok: picked.length > 0,
                message: allChance ? 'Большой прилив!' : 'Прилив вырастил растения',
                effect: { wavegum: { flood: allChance } }
            };
        }
        if (id === 'nectar') {
            if (tier === 3) {
                const picked = pickValuableTileIds(1, { readyOnly: true, excludeTitanic: true });
                picked.forEach(idx => triggerTitanicNectarGrowthOnTile(idx));
                return { ok: picked.length > 0, message: 'Титанический рост!' };
            }
            const targetTier = tier === 2 ? 'huge' : 'big';
            let changed = 0;
            let order = 0;
            shuffleList(activePlantTileIds()).some(idx => {
                const t = tiles[idx];
                if (!t || !t.active) return false;
                if ((targetTier === 'big' && (t.sizeTier === 'big' || t.sizeTier === 'huge' || t.sizeTier === 'titanic')) ||
                    (targetTier === 'huge' && (t.sizeTier === 'huge' || t.sizeTier === 'titanic'))) return false;
                changed++;
                triggerNectarGrowthOnTile(idx, targetTier, order * 180);
                order++;
                return changed >= 3;
            });
            return { ok: changed > 0, message: tier === 2 ? 'Огромный нектар!' : 'Большой нектар!' };
        }
        if (id === 'sunpudding') {
            triggerCompanionEvent('holy');
            scheduleSunpuddingEclipsePhase(tier);
            return { ok: true, message: tier >= 2 ? 'Солнечный ивент начался' : 'Солнечный ивент!' };
        }
        if (id === 'embergoo') {
            const lavaCount = tier >= 3 ? 1 + (Math.random() < 0.15 ? 1 : 0) : (tier >= 2 ? 1 : 0);
            const lavaTiles = lavaCount > 0 ? pickTileIdsForMutation('lava', lavaCount) : [];
            const magmaFinale = lavaTiles.length > 0 && (tier >= 3 || (tier === 2 && Math.random() < EMBERGOO_MAGMA_FINALE_TIER2_CHANCE));
            clearEmbergooMagmaTimers();
            if (magmaFinale) {
                triggerCompanionEvent('hell');
                scheduleEmbergooMagmaFinale(tier, lavaTiles);
            } else {
                triggerCompanionEvent('hell');
            }
            const eventDurationMs = Math.max(8000, (Number(env.eventTimer) || BALANCE.eventDuration || 20) * 1000);
            return {
                ok: true,
                message: 'Огненный ивент!',
                effect: { embergoo: { magmaFinale, phase: 'rage' } },
                specialDurationMs: magmaFinale ? eventDurationMs + EMBERGOO_MAGMA_COOLDOWN_MS + 250 : 3200
            };
        }
        if (id === 'stargum') {
            triggerCompanionEvent('starfall');
            const cometCount = tier === 3 ? (1 + (Math.random() < 0.15 ? 1 : 0)) : (tier === 2 && Math.random() < 0.15 ? 1 : 0);
            const finaleDurationMs = scheduleStargumCometFinale(cometCount);
            return {
                ok: true,
                message: cometCount ? 'Комета приближается!' : 'Звездопад!',
                specialDurationMs: finaleDurationMs ? finaleDurationMs + 450 : 3200
            };
        }
        if (id === 'moonmelt') {
            triggerCompanionEvent('night', 15);
            const count = tier === 1 ? randomInt(1, 3) : (tier === 2 ? randomInt(2, 5) : randomInt(3, 6));
            const lunarTiles = pickTileIdsForMutation('lunar', count);
            // At level 15, the crimson phase upgrades existing Lunar mutations in-place.
            const bloodmoonTiles = tier === 3 && lunarTiles.length && Math.random() < 0.5
                ? shuffleList([...lunarTiles]).slice(0, Math.min(randomInt(1, 2), lunarTiles.length))
                : [];
            const finaleDurationMs = scheduleMoonmeltLunarFinale(lunarTiles, bloodmoonTiles);
            return {
                ok: true,
                message: bloodmoonTiles.length ? 'Багровая луна взошла' : (lunarTiles.length ? 'Лунный свет разлился по грядкам' : 'Ночь пришла'),
                specialDurationMs: finaleDurationMs ? finaleDurationMs + 260 : 3200
            };
        }
        if (id === 'phantooze') {
            const retainedMutationCount = tier === 1 ? 0 : (tier === 2 ? 1 : 3);
            const picked = pickGhostAbilityTargets(tier).filter(idx => {
                const t = tiles[idx];
                if (!t || !t.active) return false;
                t.ghostEchoPercent = 0;
                t.ghostMarked = true;
                t.ghostCopyMutationCount = retainedMutationCount;
                updateTileDOM(idx);
                spawnGhostMarkFX(idx);
                return true;
            });
            const message = tier === 3
                ? 'Призрак отметил самый дорогой урожай'
                : (tier === 2 ? 'Призраки отметили два растения' : 'Призрак отметил растение');
            if (picked.length) sfx.play('ghostEcho', 'ghost-cast');
            return { ok: picked.length > 0, message };
        }
        if (id === 'voidpuddle') {
            if (tier === 1) triggerCompanionEvent('starfall');
            else if (tier === 2) triggerCompanionEvent('alien');
            else triggerCompanionEvent('cosmic');
            return { ok: true, message: tier === 3 ? 'Космический ивент!' : 'Космос проснулся' };
        }
        return { ok: false, message: 'Способность не найдена' };
    }

    function gameTick() {
        env.ticks++;
        const gardenActive = isGardenSurfaceActive();
        const menuActive = activeSurface() === 'menu';
        const shopStateBefore = `${player.shop?.refreshAt || 0}|${player.shop?.merchantArrivesAt || 0}|${player.shop?.merchantLeavesAt || 0}`;
        updateShopState();
        const shopStateChanged = shopStateBefore !== `${player.shop.refreshAt}|${player.shop.merchantArrivesAt}|${player.shop.merchantLeavesAt}`;
        ensureRewardsState();
        updateCompanionState();
        processShowcasePayout();
        if (env.currentEvent !== 'day') {
            if (env.eventTimer > 0) {
                env.eventTimer--;
                eventActions.forEach(act => {
                    if (env.eventTimer <= act.time && !act.done) {
                        act.done = true; applyEventMutation(act.tileId, act.mut);
                    }
                });
            }
            updateStateIndicator();
            if (env.eventTimer <= 0 && !hasActiveEventFinale()) {
                if (env.currentEvent === 'night') beginNightDawn();
                else startEvent('day');
            }
        } else {
            if (env.nextEventTimer > 0) {
                env.nextEventTimer--;
                updateStateIndicator();
            }
            if (env.nextEventTimer <= 0) {
                triggerRandomDayEvent();
            }
        }

        if (menuActive && env.openMenuSections?.rewards) updateOpenRewardsTimers();
        const shopOpen = document.getElementById('shop-modal')?.classList.contains('open');
        const hatchPresentationOpen = !!document.querySelector('.egg-hatch-moment') || document.getElementById('pet-reveal')?.classList.contains('active');
        if (shopOpen && !hatchPresentationOpen && (env.shopTab !== 'slimes' || !TEST_HATCH_INSTANT)) {
            if (shopStateChanged) renderShop();
            else updateOpenShopTimer();
        }
        if (menuActive) renderActiveStatusStrip();
        const menuBadge = document.getElementById('menu-badge');
        if (menuBadge) {
            const hasDoneQuests = player.quests.some(q => q.current >= q.target && !q.claimed);
            menuBadge.style.display = (hasDoneQuests || hasClaimableRewards()) ? 'block' : 'none';
        }
        if (menuActive) updateMenuMarkers();

        let buffs = getBuffs();

        tiles.forEach((t, idx) => {
            const wasWet = t.water > 0;
            const hadSlimeWater = t.slimeWater > 0;

            if (!t.active || t.growth >= 100) {
                if (wasWet) {
                    t.water = Math.max(0, t.water - 1);
                    if (gardenActive && t.water === 0) updateTileWaterDOM(idx);
                }
                if (hadSlimeWater) {
                    t.slimeWater = Math.max(0, t.slimeWater - 1);
                    if (t.slimeWater === 0) {
                        if (gardenActive) {
                            triggerTileSlimeWaterFade(idx);
                            updateTileWaterDOM(idx);
                        }
                    }
                }
                return;
            }

            if (t.beeLock > 0) { t.beeLock--; return; }
            if (!t.hasWeed && env.currentEvent === 'day' && Math.random() < BALANCE.weedChance) {
                t.hasWeed = true;
                if (gardenActive) updateTileDOM(idx);
                return;
            }
            if (t.hasWeed) return;

            const p = PLANTS[t.plantId];
            let speed = 1 + buffs.speedMult;
            if (hadSlimeWater) speed *= Math.max(1, Number(t.slimeWaterMult) || 1);
            else if (wasWet) speed *= 2;
            if (env.currentEvent === 'rain' || env.currentEvent === 'storm') speed *= 3;

            const previousGrowth = t.growth;
            t.growth = Math.min(100, t.growth + (100 / p.time) * speed);
            if (wasWet) t.water = Math.max(0, t.water - 1);
            if (hadSlimeWater) {
                t.slimeWater = Math.max(0, t.slimeWater - 1);
                if (gardenActive && t.slimeWater === 0) triggerTileSlimeWaterFade(idx);
            }
            let mutationAdded = false;
            if (t.growth >= 100 && t.mutations.length < 3) {
                let r = Math.random(); let mChance = 1 + buffs.mutChance;
                if (r < MUTATIONS.rainbow.chance * mChance && canTileReceiveMutation(t, 'rainbow')) mutationAdded = commitTileMutation(idx, 'rainbow');
                else if (r < MUTATIONS.gold.chance * mChance && canTileReceiveMutation(t, 'gold')) mutationAdded = commitTileMutation(idx, 'gold');
            }
            if (!gardenActive) return;
            const stageChanged = (previousGrowth < 30 && t.growth >= 30) || (previousGrowth < 100 && t.growth >= 100);
            const waterStateChanged = (wasWet && t.water === 0) || (hadSlimeWater && t.slimeWater === 0);
            if (stageChanged || mutationAdded) queueTileVisualRefresh(idx);
            else {
                if (waterStateChanged) updateTileWaterDOM(idx);
                updateGrowingTileDOM(idx);
            }
        });
    }

    function queueTileVisualRefresh(idx) {
        if (!env.pendingTileVisuals) env.pendingTileVisuals = new Set();
        env.pendingTileVisuals.add(idx);
        if (env.tileVisualFrame) return;
        const flush = frameStartedAt => {
            env.tileVisualFrame = null;
            if (!isGardenSurfaceActive()) {
                env.pendingTileVisuals.clear();
                return;
            }
            const queue = env.pendingTileVisuals;
            // Keep stage swaps under a small frame budget instead of rebuilding every
            // simultaneously matured crop in the same frame.
            let processed = 0;
            while (queue.size && processed < 3 && performance.now() - frameStartedAt < 4.5) {
                const next = queue.values().next().value;
                queue.delete(next);
                updateTileDOM(next);
                processed++;
            }
            if (queue.size) env.tileVisualFrame = requestAnimationFrame(flush);
        };
        env.tileVisualFrame = requestAnimationFrame(flush);
    }

    function updateGrowingTileDOM(idx) {
        const t = tiles[idx];
        const fill = document.getElementById(`grow-${idx}`);
        const wrapper = document.getElementById(`tile-${idx}`)?.querySelector('.plant-wrapper');
        if (!t || !fill || !wrapper) return;
        const growthWidth = `${Math.max(0, Math.min(100, t.growth)).toFixed(2)}%`;
        if (fill.dataset.width !== growthWidth) {
            fill.style.width = growthWidth;
            fill.dataset.width = growthWidth;
        }
        if (t.growth < 30 || t.growth >= 100) return;
        const sproutRatio = Math.max(0, Math.min(1, (t.growth - 30) / 70));
        const plantScale = ((0.58 + Math.sqrt(sproutRatio) * 0.42) * (t.scale || 1)).toFixed(3);
        if (wrapper.dataset.plantScale !== plantScale) {
            wrapper.style.setProperty('--plant-scale', plantScale);
            wrapper.dataset.plantScale = plantScale;
        }
    }

    function updateTileDOM(idx) {
        const t = tiles[idx]; const el = document.getElementById(`tile-${idx}`);
        const model = document.getElementById(`model-${idx}`); const fill = document.getElementById(`grow-${idx}`);
        const wrapper = el.querySelector('.plant-wrapper');
        const mutContainer = document.getElementById(`mut-container-${idx}`);
        const aura = document.getElementById(`aura-${idx}`);
        const candyAura = document.getElementById(`candy-aura-${idx}`);
        const lock = document.getElementById(`lock-${idx}`);
        const lockLevel = document.getElementById(`lock-level-${idx}`);
        const lockPrice = document.getElementById(`lock-price-${idx}`);
        const unlocked = isPlotUnlocked(idx);
        const levelUnlocked = isPlotLevelUnlocked(idx);
        const plotCost = getPlotPurchaseCost(idx);
        const previousGrowthStage = el.dataset.growthStage || 'empty';
        const nextGrowthStage = !t.active ? 'empty' : (t.growth < 30 ? 'seed' : (t.growth < 100 ? 'sprout' : 'ready'));
        const shouldPlaySproutEmerge = previousGrowthStage === 'seed' && nextGrowthStage === 'sprout';
        const mutSig = t.mutations.join('|');

        const tileLayer = `${computeTileLayer(t, idx)}`;
        if (el.dataset.tileLayer !== tileLayer) {
            el.style.setProperty('--tile-layer', tileLayer);
            el.dataset.tileLayer = tileLayer;
        }

        const growthWidth = `${Math.max(0, Math.min(100, t.growth)).toFixed(2)}%`;
        if (fill.dataset.width !== growthWidth) {
            fill.style.width = growthWidth;
            fill.dataset.width = growthWidth;
        }

        const persistentClasses = ['tile'];
        if (!unlocked) persistentClasses.push('locked');
        if (levelUnlocked && !unlocked) persistentClasses.push('plot-buyable');
        if (t.active) persistentClasses.push('occupied');
        if (t.active && t.growth < 30) persistentClasses.push('seed-stage');
        else if (t.active && t.growth < 100) persistentClasses.push('sprout-stage');
        if (t.water > 0) persistentClasses.push('wet');
        if (t.slimeWater > 0) persistentClasses.push('slime-watered');
        if (t.hasWeed) persistentClasses.push('has-weed');
        if (t.growth >= 100) persistentClasses.push('ready');
        if (t.beeLock > 0) persistentClasses.push('bee-arrived');
        if (t.active && t.sizeTier) persistentClasses.push(`crop-${t.sizeTier}`);
        if (t.ghostEcho || t.ghostValue > 0) persistentClasses.push('ghost-echo');
        if (t.ghostMarked) persistentClasses.push('ghost-marked');
        if (env.harvestSelectedTile === idx && (!currentTool || currentTool === 'harvest' || PLANTS[currentTool]) && t.active && t.growth >= 100) persistentClasses.push('harvest-selected');
        t.mutations.forEach(mId => persistentClasses.push(`mut-${mId}`));
        if (t.mutations.length > 0) persistentClasses.push(`primary-${t.mutations[0]}`);
        const persistentClassSig = persistentClasses.join(' ');
        if (el.dataset.persistentClassSig !== persistentClassSig) {
            const transientClasses = [...el.classList].filter(cls => TILE_TRANSIENT_EFFECT_CLASSES.has(cls));
            el.className = persistentClassSig;
            transientClasses.forEach(cls => el.classList.add(cls));
            el.dataset.persistentClassSig = persistentClassSig;
        }
        if (shouldPlaySproutEmerge) {
            el.classList.add('sprout-emerge');
            setTimeout(() => el.classList.remove('sprout-emerge'), 680);
        }
        el.dataset.growthStage = nextGrowthStage;

        const lockSig = `${unlocked}|${levelUnlocked}|${plotCost}`;
        if (lock && lockLevel && lockPrice && el.dataset.lockSig !== lockSig) {
            lock.style.display = unlocked ? 'none' : 'flex';
            lockLevel.textContent = levelUnlocked ? '' : `ур. ${getPlotUnlockLevel(idx)}`;
            lockLevel.style.display = levelUnlocked ? 'none' : 'inline-flex';
            lockPrice.textContent = levelUnlocked && plotCost > 0 ? `${plotCost}$` : '';
            lockPrice.style.display = levelUnlocked && plotCost > 0 ? 'inline-flex' : 'none';
            el.dataset.lockSig = lockSig;
        }

        const sproutRatio = t.active ? Math.max(0, Math.min(1, (t.growth - 30) / 70)) : 0;
        let visualPlantScale = 1;
        if (t.active && t.growth >= 30 && t.growth < 100) {
            const easedSproutRatio = Math.sqrt(sproutRatio);
            visualPlantScale = (0.58 + easedSproutRatio * 0.42) * (t.scale || 1);
        }
        else if (t.active && t.growth >= 100) visualPlantScale = t.scale || 1;
        const plantScale = visualPlantScale.toFixed(3);
        if (wrapper.dataset.plantScale !== plantScale) {
            wrapper.style.setProperty('--plant-scale', plantScale);
            wrapper.dataset.plantScale = plantScale;
        }

        const prevMutSig = aura.dataset.mutSig || '';

        if (prevMutSig !== mutSig) {
            renderMutationPresentation(t.mutations, aura, candyAura, mutContainer);
            aura.dataset.mutSig = mutSig;
        }

        const hasToxicMutation = t.mutations.includes('toxic');
        if (el.dataset.toxicPuddle !== `${hasToxicMutation}`) {
            syncToxicPuddleMarkup(el, hasToxicMutation);
            el.dataset.toxicPuddle = `${hasToxicMutation}`;
        }

        // Капли мёда зависят от размера, но не должны перезапускать всю аурную анимацию.
        const honeyAccessorySig = `${t.mutations.includes('honey')}|${t.sizeTier || 'normal'}|${t.plantId || ''}`;
        if (wrapper.dataset.honeyAccessorySig !== honeyAccessorySig && t.mutations.includes('honey')) {
            const honeyDrops = wrapper.querySelectorAll('.honey-drop');
            if (honeyDrops.length !== 3 || honeyDrops[0].dataset.sizeTier !== (t.sizeTier || 'normal')) {
                honeyDrops.forEach(d => d.remove());
                const honeyDropOffsets = {
                    small: [-9, 0, 9],
                    normal: [-12, 0, 12],
                    big: [-11, 0, 11],
                    huge: [-13, 0, 13],
                    titanic: [-15, 0, 15]
                };
                const offsets = honeyDropOffsets[t.sizeTier] || honeyDropOffsets.normal;
                for(let d=0; d<3; d++) {
                    const drop = document.createElement('div'); drop.className='honey-drop';
                    drop.dataset.sizeTier = t.sizeTier || 'normal';
                    drop.style.left = `calc(50% + ${offsets[d]}px)`;
                    drop.style.animationDelay = `${d*0.5}s`;
                    wrapper.appendChild(drop);
                }
            }
            wrapper.dataset.honeyAccessorySig = honeyAccessorySig;
        } else if (wrapper.dataset.honeyAccessorySig !== honeyAccessorySig) {
            wrapper.querySelectorAll('.honey-drop').forEach(d => d.remove());
            wrapper.dataset.honeyAccessorySig = honeyAccessorySig;
        }

        const ghostVisualActive = t.ghostMarked && t.active && t.ghostValue <= 0;
        if (el.dataset.ghostVisual !== `${ghostVisualActive}`) {
            const ghostMarker = el.querySelector(':scope > .ghost-plant-marker');
            const ghostTileBreath = el.querySelector(':scope > .ghost-tile-breath');
            if (ghostVisualActive) {
                if (!ghostMarker) el.insertAdjacentHTML('beforeend', '<i class="ghost-plant-marker" aria-hidden="true"><i class="ghost-plant-eyes"></i></i>');
                if (!ghostTileBreath) el.insertAdjacentHTML('afterbegin', '<i class="ghost-tile-breath" aria-hidden="true"></i>');
            } else {
                ghostMarker?.remove();
                ghostTileBreath?.remove();
            }
            el.dataset.ghostVisual = `${ghostVisualActive}`;
        }

        const needsHoneyCap = shouldUseHoneyCap(t.plantId, t.mutations);
        const honeyCapSig = `${needsHoneyCap}|${t.plantId || ''}`;
        if (model.dataset.honeyCapSig !== honeyCapSig) {
            const honeyCap = model.querySelector('.honey-cap');
            if (needsHoneyCap) {
                if (!honeyCap) model.insertAdjacentHTML('beforeend', honeyCapHTML(t.plantId, t.mutations));
            } else honeyCap?.remove();
            model.dataset.honeyCapSig = honeyCapSig;
        }

        if (!unlocked) {
            aura.innerHTML = '';
            candyAura.innerHTML = '';
            mutContainer.innerHTML = '';
            if (model.className !== 'model') model.className = 'model';
            wrapper.querySelectorAll('.honey-drop').forEach(d => d.remove());
            delete el.dataset.fxGeometrySig;
            return;
        }

        let nextModelClass = 'model';
        if (t.active) {
            let stateClass = '';
            if (t.growth < 30) stateClass = 'model-seed growing'; 
            else if (t.growth < 100) stateClass = `sprout-${t.plantId} growing`; 
            else stateClass = `model-${t.plantId} ready`;
            nextModelClass = `model visible ${stateClass}`;
        }
        if (model.className !== nextModelClass) model.className = nextModelClass;

        const needsModelGeometry = t.mutations.length > 0 || t.hasWeed;
        const fxGeometrySig = `${nextModelClass}|${plantScale}|${mutSig}|${t.hasWeed}|${t.sizeTier || 'normal'}`;
        if (needsModelGeometry && el.dataset.fxGeometrySig !== fxGeometrySig) {
            el.dataset.fxGeometrySig = fxGeometrySig;
            queueModelBoundMutationGeometry(el, model);
        } else if (!needsModelGeometry) {
            delete el.dataset.fxGeometrySig;
        }

        // The wrapper finishes scaling after this DOM update. Re-measure active mutation visuals
        // through stage changes so effects from a seed never retain the seed-sized geometry.
        if (t.mutations.length > 0 && previousGrowthStage !== nextGrowthStage) {
            trackModelBoundMutationGeometry(el, 460);
        }
    }

    function queueModelBoundMutationGeometry(tileEl, model) {
        if (!tileEl || tileEl.dataset.fxGeometryQueued === '1') return;
        tileEl.dataset.fxGeometryQueued = '1';
        requestAnimationFrame(() => {
            delete tileEl.dataset.fxGeometryQueued;
            if (!isElementSurfaceActive(tileEl)) return;
            updateModelBoundMutationGeometry(tileEl, model);
        });
    }

    function updateModelBoundMutationGeometry(tileEl, model) {
        if (!tileEl?.isConnected || !model?.classList.contains('visible')) return;
        const tileRect = tileEl.getBoundingClientRect();
        const modelRect = model.getBoundingClientRect();
        if (!tileRect.width || !modelRect.width || !modelRect.height) return;
        const isShowcasePreview = tileEl.classList.contains('showcase-tile-preview');
        const showcaseStageScale = isShowcasePreview
            ? Math.max(.1, Number.parseFloat(getComputedStyle(tileEl).getPropertyValue('--showcase-stage-scale')) || 1)
            : 1;

        // External effects use the tile axis; model offsets can mix border and padding coordinates.
        const centerX = (tileEl.clientWidth || tileRect.width) / 2;
        const modelTop = (modelRect.top - tileRect.top) / showcaseStageScale;
        const modelBottom = (modelRect.bottom - tileRect.top) / showcaseStageScale;
        const modelWidth = modelRect.width / showcaseStageScale;
        const modelHeight = modelRect.height / showcaseStageScale;
        const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
        const haloWidth = clamp(modelWidth * .72, 22, 44);
        const fireWidth = clamp(modelWidth * 1.16, 25, 74);
        const fireHeight = clamp(modelHeight * .7, 22, 62);
        const puddleWidth = clamp(modelWidth * 1.08, 52, 108);
        const puddleHeight = clamp(puddleWidth * .3, 16, 30);
        // The parasite is a tile-level marker: always 40% of the plot, regardless of crop shape.
        const weedSize = clamp((tileEl.clientWidth || tileRect.width) * .4, 18, 48);
        // Lunar and Blood Moon pools always stay narrower than Toxic's puddle at every crop size.
        const lunarWidth = clamp(puddleWidth * .93, 40, 101);
        const lunarHeight = clamp(modelHeight * 1.48, 72, 156);
        const puddleBottom = modelBottom + puddleHeight * .55;
        const bubbleLayout = [
            [-.41, -.12], [-.22, -.56], [.06, -.3], [.33, -.64],
            [.48, -.2], [-.05, -.76], [-.33, -.43]
        ];

        tileEl.style.setProperty('--model-fx-center-x', `${centerX.toFixed(1)}px`);
        tileEl.style.setProperty('--model-fx-top', `${modelTop.toFixed(1)}px`);
        tileEl.style.setProperty('--model-fx-bottom', `${modelBottom.toFixed(1)}px`);
        tileEl.style.setProperty('--model-fx-halo-width', `${haloWidth.toFixed(1)}px`);
        tileEl.style.setProperty('--model-fx-halo-height', `${Math.max(11, haloWidth * .48).toFixed(1)}px`);
        tileEl.style.setProperty('--model-fx-fire-width', `${fireWidth.toFixed(1)}px`);
        tileEl.style.setProperty('--model-fx-fire-height', `${fireHeight.toFixed(1)}px`);
        tileEl.style.setProperty('--model-fx-fire-offset', `${(-fireWidth / 2).toFixed(1)}px`);
        tileEl.style.setProperty('--model-fx-lunar-width', `${lunarWidth.toFixed(1)}px`);
        tileEl.style.setProperty('--model-fx-lunar-height', `${lunarHeight.toFixed(1)}px`);
        tileEl.style.setProperty('--model-fx-lunar-offset', `${(-lunarWidth / 2).toFixed(1)}px`);
        // The lunar pool shares the puddle's baseline while remaining deliberately more compact.
        tileEl.style.setProperty('--model-fx-lunar-top', `${(puddleBottom - lunarHeight).toFixed(1)}px`);
        tileEl.style.setProperty('--model-fx-puddle-width', `${puddleWidth.toFixed(1)}px`);
        tileEl.style.setProperty('--model-fx-puddle-height', `${puddleHeight.toFixed(1)}px`);
        tileEl.style.setProperty('--model-fx-puddle-offset', `${(-puddleWidth / 2).toFixed(1)}px`);
        tileEl.style.setProperty('--model-fx-puddle-top', `${(modelBottom - puddleHeight * .45).toFixed(1)}px`);
        tileEl.style.setProperty('--model-fx-weed-size', `${weedSize.toFixed(1)}px`);
        bubbleLayout.forEach(([xRatio, yRatio], index) => {
            tileEl.style.setProperty(`--model-fx-bubble-${index + 1}-left`, `${(centerX + puddleWidth * xRatio).toFixed(1)}px`);
            tileEl.style.setProperty(`--model-fx-bubble-${index + 1}-top`, `${(modelBottom + puddleHeight * yRatio).toFixed(1)}px`);
        });
    }

    function trackModelBoundMutationGeometry(tileEl, durationMs = 850) {
        if (!tileEl?.isConnected) return;
        queueModelBoundMutationGeometry(tileEl, tileEl.querySelector('.model.visible'));
        clearTimeout(tileEl._mutationGeometryFinishTimer);
        tileEl._mutationGeometryFinishTimer = setTimeout(() => {
            delete tileEl._mutationGeometryFinishTimer;
            if (!tileEl.isConnected || !isElementSurfaceActive(tileEl)) return;
            const model = tileEl.querySelector('.model.visible');
            if (model) queueModelBoundMutationGeometry(tileEl, model);
        }, Math.max(80, durationMs));
    }

    function scheduleMutationGeometryRefresh() {
        if (!isGardenSurfaceActive()) return;
        if (env.mutationGeometryRefreshFrame) return;
        env.mutationGeometryRefreshFrame = requestAnimationFrame(() => {
            env.mutationGeometryRefreshFrame = null;
            if (!isGardenSurfaceActive()) return;
            document.querySelectorAll('#garden .tile').forEach(tileEl => {
                const model = tileEl.querySelector('.model.visible');
                if (!model || (!tileEl.className.includes('mut-') && !tileEl.classList.contains('has-weed'))) return;
                delete tileEl.dataset.fxGeometrySig;
                updateModelBoundMutationGeometry(tileEl, model);
            });
        });
    }

    function setupMutationPerformanceObservers() {
        const garden = document.getElementById('garden');
        env.mutationGeometryObserver?.disconnect?.();
        if (garden && window.ResizeObserver) {
            env.mutationGeometryObserver = new ResizeObserver(scheduleMutationGeometryRefresh);
            env.mutationGeometryObserver.observe(garden);
        } else if (!env.mutationResizeFallbackBound) {
            window.addEventListener('resize', scheduleMutationGeometryRefresh, { passive: true });
            env.mutationResizeFallbackBound = true;
        }
        const syncVisibility = () => document.documentElement.classList.toggle('app-effects-paused', document.hidden);
        if (!env.mutationVisibilityBound) {
            document.addEventListener('visibilitychange', syncVisibility, { passive: true });
            document.addEventListener('visibilitychange', syncActiveSurfaceState, { passive: true });
            env.mutationVisibilityBound = true;
        }
        syncVisibility();
    }

    function syncTileMutationPresentation(idx) {
        const t = tiles[idx];
        const el = document.getElementById(`tile-${idx}`);
        const mutContainer = document.getElementById(`mut-container-${idx}`);
        const aura = document.getElementById(`aura-${idx}`);
        const candyAura = document.getElementById(`candy-aura-${idx}`);
        if (!t || !el || !mutContainer || !aura || !candyAura) return;

        Object.keys(MUTATIONS).forEach(mId => {
            el.classList.remove(`mut-${mId}`);
            el.classList.remove(`primary-${mId}`);
        });

        if (t.mutations.length > 0) {
            t.mutations.forEach(mId => el.classList.add(`mut-${mId}`));
            el.classList.add(`primary-${t.mutations[0]}`);
        }

        renderMutationPresentation(t.mutations, aura, candyAura, mutContainer);
        syncToxicPuddleMarkup(el, t.mutations.includes('toxic'));
        el.dataset.toxicPuddle = `${t.mutations.includes('toxic')}`;

        aura.dataset.mutSig = t.mutations.join('|');
        delete el.dataset.fxGeometrySig;
        queueModelBoundMutationGeometry(el, document.getElementById(`model-${idx}`));
    }

    function updateHeaderUI() {
        const coins = document.getElementById('ui-coins');
        const level = document.getElementById('ui-lvl');
        const xpFill = document.getElementById('ui-xp-fill');
        const xpWidth = `${Math.min(100, (player.xp / player.xpNeed) * 100).toFixed(2)}%`;
        const coinText = compactNumber(player.coins);
        if (coins.dataset.value !== coinText) {
            coins.innerHTML = compactCoinMarkup(player.coins);
            coins.dataset.value = coinText;
        }
        if (level.textContent !== `${player.lvl}`) level.textContent = player.lvl;
        if (xpFill.dataset.width !== xpWidth) {
            xpFill.style.width = xpWidth;
            xpFill.dataset.width = xpWidth;
        }
        let hasDoneQuests = player.quests.some(q => q.current >= q.target && !q.claimed);
        document.getElementById('menu-badge').style.display = (hasDoneQuests || hasClaimableRewards()) ? 'block' : 'none';
        if (activeSurface() === 'menu') updateMenuMarkers();
    }

    function updateUI() {
        updateHeaderUI();
        const surface = activeSurface();
        if (surface === 'garden') {
            renderSeeds();
            tiles.forEach((_, idx) => updateTileDOM(idx));
            renderGardenCompanion();
            syncGardenCropActionState();
        } else if (surface === 'menu') {
            renderQuests();
            renderActiveStatusStrip();
            if (env.openMenuSections?.showcase) renderShowcase();
            if (env.openMenuSections?.diary) renderDiary();
            if (env.openMenuSections?.rewards) renderRewards();
        } else if (surface === 'shop') {
            renderShop();
        }
        applyDecorStyle();
    }

    function realtimeUiTick() {
        if (document.hidden) return;
        const surface = activeSurface();
        if (surface === 'garden') {
            renderGardenCompanion();
            updateStateIndicator();
            updateGardenSlimePanelLive();
        } else if (surface !== 'menu') {
            updateOpenShopTimer();
        }
    }

    function toggleMenu() {
        toggleShop(false);
        const menu = document.getElementById('side-menu');
        menu.classList.toggle('open');
        if (!menu.classList.contains('open')) releaseInactiveMenuDom();
        syncActiveSurfaceState();
        updateUI();
    }

    function releaseInactiveMenuDom() {
        document.getElementById('showcase-slots')?.replaceChildren();
        document.getElementById('showcase-picker')?.replaceChildren();
        document.getElementById('diary-stats')?.replaceChildren();
        document.getElementById('diary-progress')?.replaceChildren();
        document.getElementById('diary-mutations')?.replaceChildren();
        document.getElementById('rewards-content')?.replaceChildren();
        env.rewardsRenderSignature = '';
    }

    function selectShopTab(tab) {
        env.shopTab = tab;
        renderShop();
    }

    function toggleShop(force) {
        const modal = document.getElementById('shop-modal');
        if (!modal) return;
        const wasOpen = modal.classList.contains('open');
        const shouldOpen = typeof force === 'boolean' ? force : !modal.classList.contains('open');
        modal.classList.toggle('open', shouldOpen);
        if (shouldOpen) {
            const sideMenu = document.getElementById('side-menu');
            if (sideMenu?.classList.contains('open')) {
                sideMenu.classList.remove('open');
                releaseInactiveMenuDom();
            }
            syncActiveSurfaceState();
            renderShop();
        } else if (wasOpen) {
            document.getElementById('shop-content')?.replaceChildren();
            syncActiveSurfaceState();
            updateUI();
        }
    }

    function renderShopSeedCard(id, available, source) {
        const p = PLANTS[id];
        if (!p) return '';
        const soldOut = available <= 0;
        const affordable = !soldOut && player.coins >= p.cost;
        const disabled = soldOut;
        const stateClass = soldOut ? 'soldout' : affordable ? 'affordable' : 'pricey';
        const label = soldOut ? 'Ресток' : affordable ? `${compactNumber(p.cost)}$` : `Нужно ${compactNumber(p.cost)}$`;
        const priceClass = soldOut ? 'soldout' : affordable ? 'can-buy' : 'need-money';
        return `<button class="shop-seed-card ${disabled ? 'disabled' : ''} ${stateClass}" style="--shop-seed-color:${p.color};" type="button" onclick="buySeedFromShop('${source}','${id}', this)">
            <div class="pkt-top"></div>
            <div class="pkt-bg"></div>
            <div class="shop-seed-top">
                <b>${p.name}</b>
                <span>x${available}</span>
            </div>
            <div class="shop-seed-art">${seedIcon(id, 'shop-seed-icon')}</div>
            <div class="shop-seed-bottom">
                <em class="${priceClass}">${label}</em>
            </div>
        </button>`;
    }

    function getShopDisplayOrder(sourceStock) {
        return seedKeys
            .slice()
            .sort((a, b) => (PLANTS[a].cost || 0) - (PLANTS[b].cost || 0));
    }

    function slimeEggModelHTML(rarityId, extraClass = '') {
        return `<span class="slime-shop-egg egg-${rarityId} ${extraClass}" aria-hidden="true"><i></i></span>`;
    }

    function slimeEggCandidates(rarityId) {
        return Object.values(PET_DEFS).filter(def => def.egg === rarityId);
    }

    function isSlimeDiscovered(petId) {
        return slimeCollectionEntry(petId).owned;
    }

    function renderEggCandidate(def) {
        const discovered = isSlimeDiscovered(def.id);
        const collection = slimeCollectionEntry(def.id);
        const marks = [['huge', 'H'], ['gold', 'G'], ['rainbow', 'R']]
            .map(([variant, label]) => `<i class="variant-${variant} ${collection[variant] ? 'unlocked' : 'locked'}" title="${label === 'H' ? 'Huge' : label === 'G' ? 'Gold' : 'Rainbow'}">${label}</i>`)
            .join('');
        return `<span class="egg-candidate rarity-${def.rarity || 'common'} ${discovered ? 'discovered' : 'unknown'}" title="${discovered ? def.name : 'Неизвестный слайм'}">
            <span class="egg-candidate-model">${discovered ? slimeHTML(def, {}, 'inventory') : '<b>?</b>'}</span>
            <span class="egg-variant-marks">${marks}</span>
        </span>`;
    }

    function renderIncubatorSlot(item, slot, now) {
        if (!item || !EGG_RARITIES[item.rarity]) {
            return `<article class="slime-incubator-slot empty" aria-label="Пустой слот инкубатора">
                <span class="incubator-slot-number">${slot + 1}</span>
                <div class="incubator-empty-mark"><i></i></div>
                <b>Свободно</b>
                <small>Купленное яйцо появится здесь</small>
            </article>`;
        }
        const egg = EGG_RARITIES[item.rarity];
        const durationMs = Math.max(1, Number(item.duration || egg.hatchSeconds) * 1000);
        const readyAt = Number(item.readyAt) || now;
        const elapsed = Math.max(0, durationMs - Math.max(0, readyAt - now));
        const progress = Math.min(100, elapsed / durationMs * 100);
        const ready = TEST_HATCH_INSTANT || readyAt <= now;
        return `<button id="incubator-slot-${slot}" class="slime-incubator-slot rarity-${egg.id} ${ready ? 'ready' : ''} ${item.hatching ? 'hatching' : ''}" type="button" onclick="hatchIncubatorEgg(${slot})" ${ready && !item.hatching ? '' : 'disabled'}>
            <span class="incubator-slot-number">${slot + 1}</span>
            ${slimeEggModelHTML(egg.id, 'incubator-egg-model')}
            <b>${ready ? 'Яйцо готово!' : egg.label}</b>
            <small>${ready ? 'Нажми, чтобы открыть' : formatTime(readyAt - now)}</small>
            ${TEST_HATCH_INSTANT ? '' : `<span class="slime-incubator-progress"><i style="width:${progress.toFixed(1)}%"></i></span>`}
        </button>`;
    }

    function renderSlimeEggCard(rarityId) {
        const egg = EGG_RARITIES[rarityId];
        if (!egg) return '';
        const candidates = slimeEggCandidates(rarityId);
        const hasFreeSlot = player.incubator.some(slot => !slot);
        const affordable = player.coins >= egg.cost;
        return `<article class="slime-egg-card rarity-${rarityId}">
            <div class="slime-egg-card-head"><span>${egg.label}</span>${TEST_HATCH_INSTANT ? '<small>Без ожидания</small>' : `<small>${formatTime(egg.hatchSeconds * 1000)}</small>`}</div>
            <div class="slime-egg-stage">${slimeEggModelHTML(rarityId)}</div>
            <div class="egg-candidate-row" aria-label="Возможные слаймы">${candidates.map(renderEggCandidate).join('')}</div>
            <button class="slime-egg-buy ${affordable && hasFreeSlot ? 'can-buy' : ''}" type="button" onclick="buySlimeEgg('${rarityId}')">
                <span>${egg.cost}$</span><small>${hasFreeSlot ? (affordable ? 'Купить' : 'Не хватает монет') : 'Инкубатор заполнен'}</small>
            </button>
        </article>`;
    }

    function renderAdEggCard() {
        const views = player.shop.adEggViews || 0;
        const unlocked = !!player.shop.adEggUnlocked;
        const busy = !!env.rewardedEggAdBusy;
        return `<article class="slime-egg-card rarity-mystery ad-egg-card ${unlocked ? 'unlocked' : ''}">
            <div class="slime-egg-card-head"><span>${unlocked ? 'Таинственное' : 'Секретное яйцо'}</span><small>${unlocked ? 'Открыто' : `${views}/10 рекламы`}</small></div>
            <div class="slime-egg-stage">${slimeEggModelHTML('mystery')}<span class="ad-egg-badge">AD</span></div>
            <div class="egg-candidate-row empty-pool"><span class="egg-candidate unknown"><b>?</b></span><small>Обитатели появятся позже</small></div>
            <span class="ad-egg-progress"><i style="width:${views * 10}%"></i></span>
            <button class="slime-egg-buy ad-watch-button" type="button" onclick="watchMysteryEggAd()" ${unlocked || busy ? 'disabled' : ''}>
                <span>${unlocked ? 'Открыто' : busy ? 'Загрузка...' : 'Смотреть рекламу'}</span><small>${unlocked ? 'Скоро появятся слаймы' : '+1 к открытию'}</small>
            </button>
        </article>`;
    }

    function renderSlimeShop() {
        const now = Date.now();
        return `<div class="shop-pane slime-shop-pane">
            <section class="slime-shop-section incubator-section">
                <div class="slime-shop-section-title"><span><b>Инкубатор</b><small>${TEST_HATCH_INSTANT ? 'Яйца готовы сразу' : 'Яйца вылупляются со временем'}</small></span><em>${player.incubator.filter(Boolean).length}/3</em></div>
                <div class="slime-incubator-grid">${player.incubator.map((item, slot) => renderIncubatorSlot(item, slot, now)).join('')}</div>
            </section>
            <section class="slime-shop-section egg-market-section">
                <div class="slime-shop-section-title"><span><b>Магазин яиц</b><small>Выбери яйцо и свободный слот</small></span></div>
                <div class="slime-egg-grid">${['common', 'rare', 'legendary'].map(renderSlimeEggCard).join('')}${renderAdEggCard()}</div>
            </section>
        </div>`;
    }

    function refreshSlimeCollectionSurfaces() {
        if (document.getElementById('garden-slime-dialog')?.classList.contains('open')) rerenderGardenSlimePanelPreservingScroll();
        if (document.getElementById('shop-modal')?.classList.contains('open') && env.shopTab === 'slimes') renderShop();
    }

    function renderShop() {
        updateShopState();
        const modal = document.getElementById('shop-modal');
        const content = document.getElementById('shop-content');
        const headerTitle = document.getElementById('shop-title');
        const headerMeter = document.getElementById('shop-header-meter');
        const seedsTab = document.getElementById('shop-tab-seeds');
        const slimesTab = document.getElementById('shop-tab-slimes');
        const decorTab = document.getElementById('shop-tab-decor');
        const merchantTab = document.getElementById('shop-tab-merchant');
        if (!modal || !content || !headerTitle || !headerMeter || !seedsTab || !slimesTab || !decorTab || !merchantTab) return;
        modal.classList.toggle('merchant-theme', env.shopTab === 'merchant');
        modal.classList.toggle('room-theme', env.shopTab === 'decor');
        modal.classList.toggle('slime-theme', env.shopTab === 'slimes');
        seedsTab.classList.toggle('active', env.shopTab === 'seeds');
        slimesTab.classList.toggle('active', env.shopTab === 'slimes');
        decorTab.classList.toggle('active', env.shopTab === 'decor');
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

        if (env.shopTab === 'decor') {
            headerTitle.textContent = 'Комната слайма';
            content.innerHTML = renderDecorShop();
            return;
        }

        if (env.shopTab === 'slimes') {
            headerTitle.textContent = 'Слаймы и яйца';
            headerMeter.style.display = 'block';
            headerMeter.innerHTML = `<small>Инкубатор</small><b>${player.incubator.filter(Boolean).length}/3</b>`;
            content.innerHTML = renderSlimeShop();
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
        return { name: 'Слайми', level: 1, xp: 0, slimeLevels: {}, hunger: 82, clean: 88, energy: 92, sleeping: false, skin: 'basic', variant: 'normal', abilityEnergy: 0, abilityCooldownUntil: 0, lastUpdate: Date.now(), hungerClock: 0, cleanClock: 0, energyClock: 0, cleanGraceUntil: 0 };
    }

    function buySlimeEgg(rarityId) {
        const egg = EGG_RARITIES[rarityId];
        if (!egg || egg.locked) return;
        if (!player.incubator.some(slot => !slot)) {
            showToast('Инкубатор заполнен', '#ff7675');
            return;
        }
        if (player.coins < egg.cost) {
            showToast('Не хватает монет', '#ff7675');
            return;
        }
        const result = grantEggReward(rarityId);
        if (result.blocked) {
            showToast(result.message || 'Нет свободного места', '#ff7675');
            return;
        }
        player.coins -= egg.cost;
        if (TEST_HATCH_INSTANT && player.incubator[result.slot]) player.incubator[result.slot].readyAt = Date.now();
        sfx.play('coin');
        showToast(`${egg.label} яйцо в инкубаторе`, egg.color);
        updateUI();
        refreshSlimeCollectionSurfaces();
        saveGame();
    }

    function rollSlimeFromEgg(rarityId) {
        const candidates = slimeEggCandidates(rarityId);
        const regular = candidates.filter(def => !def.secret);
        const secret = candidates.filter(def => def.secret);
        const pool = secret.length && Math.random() < 0.08 ? secret : regular.length ? regular : candidates;
        return pool[Math.floor(Math.random() * pool.length)] || null;
    }

    function playEggHatchMoment(rarityId, onReveal) {
        document.querySelector('.egg-hatch-moment')?.remove();
        const requiredTaps = 5;
        const burstPoints = [
            [-72, -48], [-26, -82], [50, -66], [78, -8],
            [44, 64], [-18, 78], [-70, 34], [4, -72]
        ];
        const particles = burstPoints.map(([x, y], index) =>
            `<i style="--tx:${x}px;--ty:${y}px;--delay:${(index % 3) * 22}ms"></i>`
        ).join('');
        const moment = document.createElement('div');
        moment.className = `egg-hatch-moment rarity-${rarityId}`;
        moment.innerHTML = `<button class="egg-hatch-scene" type="button" aria-label="Нажимай на яйцо, чтобы оно вылупилось">
            <span class="egg-hatch-aura"></span>
            <span class="egg-hatch-ring"></span>
            <span class="egg-hatch-egg">
                ${slimeEggModelHTML(rarityId, 'hatch-hero-egg')}
                <svg class="egg-hatch-cracks" viewBox="0 0 76 98" aria-hidden="true">
                    <path d="M39 18 L34 31 L41 39 L36 51"></path>
                    <path d="M40 39 L52 34 L61 44"></path>
                    <path d="M36 50 L24 57 L16 69"></path>
                    <path d="M36 50 L44 63 L39 77"></path>
                    <path d="M44 63 L57 69 L63 82"></path>
                </svg>
            </span>
            <span class="egg-hatch-flash"></span>
            <span class="egg-hatch-particles">${particles}</span>
            <span class="egg-hatch-hint"><i></i><i></i><i></i><i></i><i></i></span>
        </button>`;
        document.body.appendChild(moment);
        requestAnimationFrame(() => requestAnimationFrame(() => moment.classList.add('play')));
        sfx.play('pop');
        let taps = 0;
        let completed = false;
        const scene = moment.querySelector('.egg-hatch-scene');
        const egg = moment.querySelector('.egg-hatch-egg');
        scene.addEventListener('pointerdown', event => {
            event.preventDefault();
            if (completed) return;
            taps += 1;
            moment.classList.add(`crack-${taps}`);
            egg.classList.remove('tilt-left', 'tilt-right');
            egg.classList.add(taps % 2 ? 'tilt-left' : 'tilt-right');
            navigator.vibrate?.(taps >= requiredTaps ? 30 : 12);
            if (taps < requiredTaps) {
                sfx.play('pop');
                return;
            }
            completed = true;
            scene.disabled = true;
            moment.classList.add('input-locked');
            moment.classList.add('burst');
            sfx.play('mut');
            setTimeout(() => {
                onReveal();
                moment.classList.add('revealed');
            }, 1020);
            setTimeout(() => moment.remove(), 2100);
        });
    }

    function hatchIncubatorEgg(slot) {
        const item = player.incubator[slot];
        if (!item || item.hatching || (!TEST_HATCH_INSTANT && Number(item.readyAt) > Date.now())) return;
        const picked = rollSlimeFromEgg(item.rarity);
        if (!picked) {
            showToast('В этом яйце пока никого нет', '#a29bfe');
            return;
        }
        item.hatching = true;
        syncGardenSlimeIncubatorAlert();
        const slotElement = document.querySelector(`.slime-incubator-slot[onclick="hatchIncubatorEgg(${slot})"]`);
        if (slotElement) {
            slotElement.classList.add('hatching');
            slotElement.disabled = true;
        }
        playEggHatchMoment(item.rarity, () => {
            const pet = unlockSlimeCollectible(picked.id, rollPetVariant());
            player.incubator[slot] = null;
            showPetReveal(pet, true);
            env.pendingSlimeShopRefresh = true;
            refreshSlimeCollectionSurfaces();
            saveGame();
        });
    }

    async function watchMysteryEggAd() {
        ensureSeedAndShopState();
        if (player.shop.adEggUnlocked || env.rewardedEggAdBusy) return;
        env.rewardedEggAdBusy = true;
        refreshSlimeCollectionSurfaces();
        let result = null;
        try {
            result = await window.YandexGames?.showRewardedVideo?.();
        } catch (error) {
            console.warn('Rewarded egg ad failed.', error);
        } finally {
            env.rewardedEggAdBusy = false;
        }
        if (!result?.available) {
            showToast('Реклама доступна на платформе Яндекс Игр', '#a29bfe');
            refreshSlimeCollectionSurfaces();
            return;
        }
        if (!result.rewarded) {
            showToast('Просмотр не был засчитан', '#ff7675');
            refreshSlimeCollectionSurfaces();
            return;
        }
        player.shop.adEggViews = Math.min(10, (player.shop.adEggViews || 0) + 1);
        player.shop.adEggUnlocked = player.shop.adEggViews >= 10;
        sfx.play(player.shop.adEggUnlocked ? 'mut' : 'pop');
        showToast(player.shop.adEggUnlocked ? 'Секретное яйцо открыто!' : `Реклама ${player.shop.adEggViews}/10`, '#a29bfe');
        refreshSlimeCollectionSurfaces();
        saveGame();
    }

    function ensureCompanionState() {
        const defaults = defaultCompanionState();
        if (!player.companion || typeof player.companion !== 'object') player.companion = defaults;
        player.companion = { ...defaults, ...player.companion };
        const savedCompanionName = String(player.companion.name || 'Слайми').trim().slice(0, 12) || 'Слайми';
        player.companion.name = savedCompanionName === 'Лайм' ? 'Слайми' : savedCompanionName;
        if (!player.companion.slimeLevels || typeof player.companion.slimeLevels !== 'object') player.companion.slimeLevels = {};
        ['basic', ...Object.keys(PET_DEFS)].forEach(id => {
            const prev = player.companion.slimeLevels[id] || {};
            player.companion.slimeLevels[id] = {
                level: Math.max(1, Math.min(15, Math.floor(Number(prev.level) || 1))),
                xp: Math.max(0, Number(prev.xp) || 0)
            };
        });
        if (player.companion.slimeLevelVersion !== 1) {
            Object.keys(player.companion.slimeLevels).forEach(id => {
                player.companion.slimeLevels[id] = { level: 1, xp: 0 };
            });
            player.companion.slimeLevelVersion = 1;
        }
        const current = player.companion.slimeLevels[player.companion.skin || 'basic'] || player.companion.slimeLevels.basic;
        player.companion.level = current.level;
        player.companion.xp = current.xp;
        ['hunger', 'clean', 'energy'].forEach(key => {
            player.companion[key] = Math.round(Math.max(0, Math.min(100, Number(player.companion[key]) || 0)));
        });
        player.companion.abilityEnergy = Math.round(Math.max(0, Math.min(100, Number(player.companion.abilityEnergy) || 0)));
        player.companion.abilityCooldownUntil = Math.max(0, Number(player.companion.abilityCooldownUntil) || 0);
        ['hungerClock', 'cleanClock', 'energyClock'].forEach(key => {
            player.companion[key] = Math.max(0, Number(player.companion[key]) || 0);
        });
        player.companion.cleanGraceUntil = Math.max(0, Number(player.companion.cleanGraceUntil) || 0);
        if (player.companion.skin !== 'basic' && !PET_DEFS[player.companion.skin]) player.companion.skin = 'basic';
        if (!['normal', 'huge', 'gold', 'rainbow'].includes(player.companion.variant)) player.companion.variant = 'normal';
        player.companion.sleeping = !!player.companion.sleeping;
        player.companion.lastUpdate = Number(player.companion.lastUpdate) || Date.now();
    }

    function companionSlimeId() {
        return player.companion.skin || 'basic';
    }

    function companionLevelState(id = companionSlimeId()) {
        ensureCompanionState();
        return player.companion.slimeLevels[id] || player.companion.slimeLevels.basic;
    }

    function syncCurrentCompanionLevel() {
        const state = companionLevelState();
        player.companion.level = state.level;
        player.companion.xp = state.xp;
        return state;
    }

    function companionXpNeed(level = companionLevelState().level) {
        return 40 + Math.max(1, level) * 20;
    }

    function grantCompanionProgress(amount) {
        const gain = Math.max(0, Math.round(Number(amount) || 0));
        if (!gain) return 0;
        const levelState = companionLevelState();
        levelState.xp += gain;
        while (levelState.level < 15 && levelState.xp >= companionXpNeed(levelState.level)) {
            levelState.xp -= companionXpNeed(levelState.level);
            levelState.level++;
            showToast(`${player.companion.name}: новый уровень!`, '#72db68');
        }
        if (levelState.level >= 15) levelState.xp = 0;
        syncCurrentCompanionLevel();
        return gain;
    }

    function updateCompanionState() {
        ensureCompanionState();
        // companion-care-v1 inactive: feeding is now the only source of level XP and ability charge.
        player.companion.sleeping = false;
        player.companion.lastUpdate = Date.now();
    }

    function chargeCompanionAbility(amount) {
        ensureCompanionState();
        const gain = Math.max(0, Number(amount) || 0);
        if (!gain) return 0;
        const before = player.companion.abilityEnergy || 0;
        player.companion.abilityEnergy = Math.min(100, before + gain);
        return player.companion.abilityEnergy - before;
    }

    function companionSkinDef() {
        ensureCompanionState();
        return player.companion.skin === 'basic' ? null : PET_DEFS[player.companion.skin];
    }

    function companionMoodScore() {
        return env.slimeFoodReaction === 'missed' ? 15 : 100;
    }

    function companionMood() {
        if (env.slimeFoodReaction === 'missed') return 'sad';
        if (env.slimeFoodReaction === 'fed') return 'joyful';
        if (env.companionAbilitySpecial === 'dewdrop' || env.companionAbilitySpecial === 'sproutslime' || env.companionAbilitySpecial === 'coinblob' || env.companionAbilitySpecial === 'wavegum' || env.companionAbilitySpecial === 'nectar' || env.companionAbilitySpecial === 'sunpudding' || env.companionAbilitySpecial === 'stargum') return 'happy';
        return 'happy';
    }

    const COMPANION_FACE_CLASSES = ['happy', 'smile', 'cute', 'excited', 'angry', 'surprise', 'goofy', 'sleepy', 'blank', 'proud', 'star', 'mystic', 'sad', 'mischief', 'coin', 'relaxed'];

    function companionFaceForMood(def, mood) {
        if ((def?.id || 'basic') === 'basic' && env.companionAbilitySpecial === 'basic') return 'happy';
        if (env.companionAbilitySpecial === 'dewdrop') return 'happy';
        if (env.companionAbilitySpecial === 'sproutslime') return 'mischief';
        if (env.companionAbilitySpecial === 'coinblob') return 'happy';
        if (env.companionAbilitySpecial === 'wavegum') return env.companionAbilityPayload?.wavegum?.flood ? 'surprise' : 'happy';
        if (env.companionAbilitySpecial === 'nectar') return 'happy';
        if (env.companionAbilitySpecial === 'embergoo') return 'angry';
        if (env.companionAbilitySpecial === 'sunpudding') return 'happy';
        if (env.companionAbilitySpecial === 'stargum') return 'happy';
        if (env.companionAbilitySpecial === 'moonmelt') return 'sleepy';
        if (mood === 'sleeping') return 'sleepy';
        if (mood === 'sad') return 'sad';
        const id = def?.id || 'basic';
        const generic = { sad: 'sad', neutral: 'blank', joyful: 'happy', happy: 'cute' };
        const unique = {
            dewdrop: { sad: 'sad', neutral: 'sad', joyful: 'blank', happy: 'happy' },
            sproutslime: { joyful: 'mischief' },
            moonmelt: { neutral: 'sleepy' },
            wavegum: { joyful: 'relaxed', happy: 'relaxed' },
            nectar: { happy: 'cute' },
            phantooze: { sad: 'blank', neutral: 'blank', joyful: 'blank', happy: 'blank' },
            sunpudding: { joyful: 'proud' },
            embergoo: { sad: 'angry' },
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

    function emitCompanionCoinBurst(payload = {}) {
        const stage = document.getElementById('companion-stage');
        const slime = stage?.querySelector('.slime-pet');
        if (!stage || !slime) return;
        const stageRect = stage.getBoundingClientRect();
        const slimeRect = slime.getBoundingClientRect();
        const originX = slimeRect.left + slimeRect.width / 2 - stageRect.left;
        const originY = slimeRect.top + slimeRect.height * .42 - stageRect.top;
        const throws = [
            ...(Array.isArray(payload.diamondTiles) ? payload.diamondTiles.map(() => 'diamond') : []),
            ...(Array.isArray(payload.goldTiles) ? payload.goldTiles.map(() => 'coin') : [])
        ];
        const count = throws.length;
        if (!count) return;
        const directions = Array.from({ length: count }, (_, index) => {
            if (count === 1) return Math.random() < .5 ? -1 : 1;
            const step = count === 1 ? 0 : index / (count - 1);
            return -1 + step * 2 + (Math.random() - .5) * .22;
        }).sort(() => Math.random() - .5);
        for (let index = 0; index < count; index++) {
            setTimeout(() => {
                if (env.companionAbilitySpecial !== 'coinblob') return;
                const coin = document.createElement('span');
                const direction = directions[index];
                const travelX = Math.round(direction * (32 + Math.random() * 36));
                const peakY = Math.round(-82 - Math.random() * 42);
                const type = throws[index] || 'coin';
                coin.className = `companion-flying-coin ${type === 'diamond' ? 'is-diamond' : ''}`;
                coin.textContent = type === 'diamond' ? '◆' : '$';
                coin.style.left = `${originX}px`;
                coin.style.top = `${originY}px`;
                coin.style.setProperty('--coin-x', `${travelX}px`);
                coin.style.setProperty('--coin-quarter-x', `${Math.round(travelX * .24)}px`);
                coin.style.setProperty('--coin-half-x', `${Math.round(travelX * .5)}px`);
                coin.style.setProperty('--coin-three-quarter-x', `${Math.round(travelX * .76)}px`);
                coin.style.setProperty('--coin-peak', `${peakY}px`);
                coin.style.setProperty('--coin-shoulder', `${Math.round(peakY * .72)}px`);
                const rotation = Math.round((Math.random() < .5 ? -1 : 1) * (190 + Math.random() * 220));
                coin.style.setProperty('--coin-mid-rotate', `${Math.round(rotation * .45)}deg`);
                coin.style.setProperty('--coin-rotate', `${rotation}deg`);
                stage.appendChild(coin);
                sfx.play('coinSoft');
                setTimeout(() => coin.remove(), 1250);
            }, index * 360);
        }
    }

    function ensureCompanionRoomAbilityOverlay() {
        const habitat = document.getElementById('companion-habitat');
        if (!habitat) return null;
        let overlay = habitat.querySelector('.companion-room-ability-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'companion-room-ability-overlay';
            habitat.appendChild(overlay);
        }
        return overlay;
    }

    function syncCompanionSpecialClasses() {
        const stage = document.getElementById('companion-stage');
        const habitat = document.getElementById('companion-habitat');
        const panel = document.getElementById('companion-panel');
        const garden = document.getElementById('garden');
        const overlay = ensureCompanionRoomAbilityOverlay();
        if (!stage) return;
        const embergooPayload = env.companionAbilitySpecial === 'embergoo' ? (env.companionAbilityPayload?.embergoo || null) : null;
        const embergooFinale = !!embergooPayload?.magmaFinale;
        const embergooSurge = embergooFinale && ['surge', 'mutating', 'cooling'].includes(embergooPayload.phase);
        ['materialized', 'levitating', 'landing'].forEach(name => {
            const active = name === 'materialized'
                ? env.companionAbilitySpecial === 'phantooze'
                : env.companionSpecial === name;
            stage.classList.toggle(`special-${name}`, active);
        });
        stage.classList.toggle('special-sun-glow', env.companionAbilitySpecial === 'sunpudding');
        ['dewdrop', 'sproutslime', 'coinblob', 'moonmelt', 'wavegum', 'nectar', 'phantooze', 'sunpudding', 'embergoo', 'stargum'].forEach(name => stage.classList.toggle(`ability-${name}`, env.companionAbilitySpecial === name));
        stage.classList.toggle('ability-embergoo-finale', embergooSurge);
        habitat?.classList.toggle('ability-wavegum-cast', env.companionAbilitySpecial === 'wavegum' && !env.companionAbilityPayload?.wavegum?.flood);
        habitat?.classList.toggle('ability-wavegum-flood', env.companionAbilitySpecial === 'wavegum' && !!env.companionAbilityPayload?.wavegum?.flood);
        panel?.classList.toggle('ability-embergoo-rage', env.companionAbilitySpecial === 'embergoo');
        panel?.classList.toggle('ability-embergoo-finale', embergooSurge);
        habitat?.classList.toggle('ability-embergoo-rage', env.companionAbilitySpecial === 'embergoo');
        habitat?.classList.toggle('ability-embergoo-finale', embergooSurge);
        overlay?.classList.toggle('show-wave-cast', env.companionAbilitySpecial === 'wavegum' && !env.companionAbilityPayload?.wavegum?.flood);
        overlay?.classList.toggle('show-wave-flood', env.companionAbilitySpecial === 'wavegum' && !!env.companionAbilityPayload?.wavegum?.flood);
        overlay?.classList.toggle('show-embergoo-rage', env.companionAbilitySpecial === 'embergoo');
        overlay?.classList.toggle('show-embergoo-finale', embergooSurge);
        overlay?.classList.toggle('show-moonmelt-cast', env.companionAbilitySpecial === 'moonmelt');
        habitat?.classList.toggle('cosmic-shadow', env.companionSpecial === 'levitating' || env.companionSpecial === 'landing');
        document.body.classList.toggle('embergoo-magma-finale', embergooSurge && env.currentEvent === 'hell');
        document.getElementById('event-ambience')?.classList.toggle('embergoo-magma-finale', embergooSurge && env.currentEvent === 'hell');
        garden?.classList.toggle('embergoo-magma-heat', embergooSurge && env.currentEvent === 'hell');
        garden?.classList.toggle('embergoo-magma-cooling', embergooPayload?.phase === 'cooling' && env.currentEvent === 'hell');
        garden?.classList.toggle('moonmelt-moonlit', env.companionAbilitySpecial === 'moonmelt' && env.currentEvent === 'night');
        applyCompanionFace(stage, companionSkinDef(), companionMood());
    }

    function startCompanionAbilitySpecial(type, duration = 3000, payload = {}) {
        if (env.companionAbilitySpecialTimer) clearTimeout(env.companionAbilitySpecialTimer);
        if (type === 'phantooze') clearCompanionSpecial(false);
        env.companionAbilitySpecial = type;
        env.companionAbilityPayload = payload || null;
        syncCompanionSpecialClasses();
        renderGardenCompanion();
        if (type === 'coinblob') emitCompanionCoinBurst(payload.midas || {});
        env.companionAbilitySpecialTimer = setTimeout(() => {
            clearEmbergooMagmaTimers();
            env.companionAbilitySpecial = '';
            env.companionAbilityPayload = null;
            env.companionAbilitySpecialTimer = null;
            syncCompanionSpecialClasses();
            renderGardenCompanion();
        }, duration);
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
        env.companionSpecialTimer = null;
    }

    function companionStatHTML(type, label, value, color, symbol, actionLabel, actionIcon, actionFn, actionId = '') {
        const safe = Math.round(Math.max(0, Math.min(100, value)));
        const tone = safe <= 15 ? 'is-critical' : (safe <= 35 ? 'is-low' : '');
        const idAttr = actionId ? ` id="${actionId}"` : '';
        return `<div class="companion-stat ${type} ${tone}">
            <button class="companion-stat-action ${type}" type="button" onclick="${actionFn}"${idAttr}><span>${actionIcon}</span><b>${actionLabel}</b></button>
            <div><b>${label}</b><i><em style="width:${safe}%; --meter-color:${color}"></em></i></div>
            <strong>${safe}%</strong>
        </div>`;
    }

    function companionAbilityName() {
        const id = player.companion.skin || 'basic';
        const names = {
            basic: 'Радужный всплеск',
            dewdrop: 'Живой дождик',
            sproutslime: 'Дары природы',
            coinblob: 'Рука Мидаса',
            moonmelt: 'Тихая ночь',
            sparkjelly: 'Искровая цепь',
            wavegum: 'Прилив',
            nectar: 'Нектарный рывок',
            phantooze: 'Призрачное эхо',
            sunpudding: 'Солнечный луч',
            embergoo: 'Вспышка пламени',
            stargum: 'Падающая звезда',
            voidpuddle: 'Космический сбой'
        };
        return names[id] || 'Суперспособность';
    }

    function companionAbilityMeta() {
        const id = player.companion.skin || 'basic';
        const meta = {
            basic: { symbol: '🌈', color: '#72db68', dark: '#35a84c' },
            dewdrop: { symbol: '💧', color: '#5ed7ff', dark: '#1686c2' },
            sproutslime: { symbol: '🌱', color: '#72df65', dark: '#2a9a43' },
            coinblob: { symbol: '$', color: '#ffd44d', dark: '#b78311' },
            moonmelt: { symbol: '🌙', color: '#9f9bff', dark: '#403a9f' },
            sparkjelly: { symbol: '⚡', color: '#74d7ff', dark: '#2076cf' },
            wavegum: { symbol: '🌊', color: '#55efc4', dark: '#008f82' },
            nectar: { symbol: '🍯', color: '#ffbf5b', dark: '#c86d13' },
            phantooze: { symbol: '👻', color: '#dce6ff', dark: '#7887c7' },
            sunpudding: { symbol: '☀', color: '#ffe66d', dark: '#d09b00' },
            embergoo: { symbol: '🔥', color: '#ff705c', dark: '#c01f1f' },
            stargum: { symbol: '⭐', color: '#b8adff', dark: '#6255d6' },
            voidpuddle: { symbol: '●', color: '#4b3cff', dark: '#17124f' }
        };
        return meta[id] || meta.basic;
    }

    function companionAbilityCooldownMs(id = player.companion.skin || 'basic') {
        const cooldowns = {
            dewdrop: 3 * 60 * 1000,
            sproutslime: 3 * 60 * 1000,
            coinblob: 5 * 60 * 1000,
            wavegum: 3 * 60 * 1000,
            nectar: 5 * 60 * 1000
        };
        return cooldowns[id] || COMPANION_ABILITY_DEFAULT_COOLDOWN_MS;
    }

    function formatCompanionAbilityCooldown(seconds) {
        const safe = Math.max(0, Math.ceil(Number(seconds) || 0));
        if (safe < 60) return `${safe}с`;
        const minutes = Math.floor(safe / 60);
        const rest = String(safe % 60).padStart(2, '0');
        return `${minutes}:${rest}`;
    }

    function renderCompanionAbility() {
        const root = document.getElementById('companion-ability');
        const quickButton = document.getElementById('companion-quick-ability');
        if (!root && !quickButton) return;
        ensureCompanionState();
        const pet = player.companion;
        const hasAbility = true;
        const energy = hasAbility ? Math.round(Math.max(0, Math.min(100, pet.abilityEnergy || 0))) : 0;
        const now = Date.now();
        const cooldownLeft = Math.max(0, Math.ceil(((pet.abilityCooldownUntil || 0) - now) / 1000));
        const ready = hasAbility && energy >= 100 && cooldownLeft <= 0;
        const meta = companionAbilityMeta();
        const menuOpen = document.getElementById('side-menu')?.classList.contains('open');
        const rootSignature = `${player.companion.skin}|${energy}|${cooldownLeft}|${ready ? 1 : 0}|${meta.symbol}`;
        if (root && menuOpen && root.dataset.renderSignature !== rootSignature) {
            root.dataset.renderSignature = rootSignature;
            root.style.setProperty('--ability-color', meta.color);
            root.style.setProperty('--ability-dark', meta.dark);
            const segments = root.querySelectorAll('.companion-ability-meter i');
            const filledSegments = Math.ceil(energy / 10);
            segments.forEach((segment, index) => segment.classList.toggle('filled', index < filledSegments));
            root.classList.toggle('is-ready', ready);
            root.classList.toggle('is-cooling', cooldownLeft > 0);
            root.classList.toggle('no-ability', !hasAbility);
            const name = document.getElementById('companion-ability-name');
            const percent = document.getElementById('companion-ability-percent');
            const cooldown = document.getElementById('companion-ability-cooldown');
            const button = document.getElementById('companion-ability-button');
            if (name) name.textContent = companionAbilityName();
            if (percent) percent.textContent = `${energy}%`;
            if (cooldown) cooldown.textContent = cooldownLeft > 0 ? `КД: ${formatCompanionAbilityCooldown(cooldownLeft)}` : (ready ? 'Готова' : 'КД: нет');
            if (button) {
                button.disabled = !ready;
                const icon = button.querySelector('span');
                if (icon) icon.textContent = meta.symbol;
            }
        }
        const quickSignature = `${player.companion.skin}|${energy}|${cooldownLeft}|${ready ? 1 : 0}|${meta.symbol}`;
        if (quickButton && quickButton.dataset.renderSignature !== quickSignature) {
            quickButton.dataset.renderSignature = quickSignature;
            quickButton.disabled = !ready;
            quickButton.style.setProperty('--quick-ability-color', meta.color);
            quickButton.style.setProperty('--quick-ability-dark', meta.dark);
            quickButton.style.setProperty('--quick-ability-fill', `${energy}%`);
            quickButton.classList.toggle('is-ready', ready);
            quickButton.classList.toggle('is-cooling', cooldownLeft > 0);
            const quickIcon = quickButton.querySelector('span');
            if (quickIcon) quickIcon.textContent = meta.symbol;
            const stateLabel = ready ? 'готова' : (cooldownLeft > 0 ? `перезарядка ${formatCompanionAbilityCooldown(cooldownLeft)}` : `${energy}% заряда`);
            quickButton.setAttribute('aria-label', `${companionAbilityName()}: ${stateLabel}`);
        }
    }

    function useCompanionAbility() {
        ensureCompanionState();
        const cooldownLeft = Math.max(0, Math.ceil(((player.companion.abilityCooldownUntil || 0) - Date.now()) / 1000));
        if (cooldownLeft > 0) {
            showToast(`Способность: ${formatCompanionAbilityCooldown(cooldownLeft)}`, '#72db68');
            return;
        }
        if ((player.companion.abilityEnergy || 0) < 100) {
            showToast('Способность еще заряжается', '#72db68');
            return;
        }
        const result = applyCompanionAbilityEffect(player.companion.skin || 'basic', companionAbilityTier());
        if (!result.ok) {
            showToast(result.message || 'Нет подходящих целей', '#ff7675');
            return;
        }
        player.companion.abilityEnergy = Math.max(0, Math.min(100, Number(result.refund) || 0));
        player.companion.abilityCooldownUntil = Date.now() + companionAbilityCooldownMs(player.companion.skin || 'basic');
        startCompanionAbilitySpecial(player.companion.skin || 'basic', result.specialDurationMs || 3000, result.effect || {});
        showToast(result.message || 'Суперспособность!', companionAbilityMeta().color);
        updateUI();
        renderCompanionAbility();
        saveGame();
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
        ['normal', 'huge', 'gold', 'rainbow'].forEach(variant => root.classList.remove(`companion-variant-${variant}`));
        root.classList.add(`companion-variant-${player.companion.variant || 'normal'}`);
        applyCompanionRoomStyle(root);
        applyCompanionDirt(root, pet.clean);
        const sleepBtn = document.getElementById('companion-sleep-btn');
        if (sleepBtn) sleepBtn.querySelector('b').textContent = 'Спать';
        const feedBtn = root.querySelector('.companion-stat-action.satiety');
        const washBtn = root.querySelector('.companion-stat-action.clean');
        if (feedBtn) feedBtn.disabled = pet.sleeping;
        if (washBtn) washBtn.disabled = pet.sleeping;
        const sleepNote = document.getElementById('companion-sleep-note');
        if (sleepNote) sleepNote.style.display = pet.sleeping ? 'block' : 'none';
        renderCompanionAbility();
    }

    function companionFoodValue(crop) {
        if (!crop) return 0;
            const value = Math.max(1, Number(crop.value) || cropSaleValue(crop.plantId, crop.mutations, crop.weight, 0, crop.sizeTier || 'normal'));
        return Math.max(8, Math.min(65, Math.round(5 + Math.log10(value + 10) * 10)));
    }

    function companionSkinStars(def) {
        const rarity = def?.rarity || 'common';
        const count = (PET_RARITY_STYLE[rarity] || PET_RARITY_STYLE.common).stars || 1;
        return `<span class="companion-skin-stars" aria-label="${count} звезд">${'★'.repeat(count)}</span>`;
    }

    function applyCompanionRoomStyle(root) {
        if (!root) return;
        Array.from(root.classList)
            .filter(cls => cls.startsWith('room-style-'))
            .forEach(cls => root.classList.remove(cls));
        root.classList.add(`room-style-${player.roomStyle || 'cozy'}`);
    }

    function renderCompanion(renderDrawer = true) {
        const root = document.getElementById('companion-panel');
        if (!root) return;
        updateCompanionState();
        const pet = player.companion;
        const levelState = syncCurrentCompanionLevel();
        const def = companionSkinDef();
        const basicDef = { id: 'basic', rarity: 'common', face: 'happy', slime: { body: '#72db68', shade: '#35a84c', blush: '#ffc1cf', decor: 'none' } };
        const mood = companionMood();
        const renderedDef = { ...(def || basicDef), face: companionFaceForMood(def || basicDef, mood) };
        const activeVariant = companionVariantPet();
        const growth = 0.45 * 1.3;
        const need = companionXpNeed(levelState.level);
        const xpPercent = levelState.level >= 15 ? 100 : Math.min(100, levelState.xp / need * 100);
        root.classList.toggle('is-sleeping', pet.sleeping);
        root.classList.toggle('is-dirty', pet.clean < 35);
        applyCompanionDirt(root, pet.clean);
        root.classList.toggle('is-shower-mode', !!env.companionShower);
        ['normal', 'huge', 'gold', 'rainbow'].forEach(variant => root.classList.remove(`companion-variant-${variant}`));
        root.classList.add(`companion-variant-${player.companion.variant || 'normal'}`);
        const nameButton = document.getElementById('companion-name');
        if (nameButton.dataset.name !== pet.name) {
            const editMark = document.createElement('span');
            editMark.setAttribute('aria-hidden', 'true');
            editMark.textContent = '✎';
            nameButton.replaceChildren(document.createTextNode(`${pet.name} `), editMark);
            nameButton.dataset.name = pet.name;
        }
        document.getElementById('companion-level').textContent = levelState.level;
        const stage = document.getElementById('companion-stage');
        stage.style.setProperty('--companion-growth', (growth * (player.companion.variant === 'huge' ? 1.65 : 1)).toFixed(3));
        stage.className = `companion-stage skin-${def?.id || 'basic'} mood-${mood} variant-${player.companion.variant || 'normal'}`;
        stage.classList.toggle('is-tapped', !!env.companionTapTimer);
        stage.classList.toggle('is-petting', !!env.companionPetting);
        if ((env.companionPointerId === null && !env.companionTapTimer) || !stage.querySelector('.slime-pet')) {
            stage.innerHTML = `<span class="companion-mood-aura" aria-hidden="true"></span>${slimeHTML(renderedDef, activeVariant, 'featured')}`;
        }
        applyCompanionFace(stage, def || basicDef, mood);
        syncCompanionSpecialClasses();
        document.getElementById('companion-level-mini-fill').style.width = `${xpPercent}%`;
        document.getElementById('companion-skin-name').textContent = def ? (def.shortName || def.name) : 'Базовый';
        // The room name is now shown in the shop; older markup may still provide this optional label.
        const companionRoomName = document.getElementById('companion-room-name');
        if (companionRoomName) companionRoomName.textContent = ROOM_DECOR_STYLES[player.roomStyle || 'cozy']?.name || 'Уют';
        const statsRoot = document.getElementById('companion-stats');
        const statsSignature = `${Math.round(pet.hunger)}|${Math.round(pet.clean)}|${Math.round(pet.energy)}|${pet.sleeping ? 1 : 0}`;
        if (statsRoot.dataset.renderSignature !== statsSignature) {
            statsRoot.dataset.renderSignature = statsSignature;
            statsRoot.innerHTML = [
                companionStatHTML('satiety', 'Сытость', pet.hunger, '#ef9c39', '●', 'Корм', '🥕', 'toggleCompanionFeed()'),
                companionStatHTML('clean', 'Чистота', pet.clean, '#42bde9', '◆', 'Мыть', '🚿', 'toggleCompanionShower()', 'companion-wash-btn'),
                companionStatHTML('energy', 'Бодрость', pet.energy, '#8a73df', '◐', 'Спать', '🌙', 'toggleCompanionSleep()', 'companion-sleep-btn')
            ].join('');
        }
        const sleepActionBtn = document.getElementById('companion-sleep-btn');
        if (sleepActionBtn) sleepActionBtn.querySelector('b').textContent = 'Спать';
        const feedBtn = root.querySelector('.companion-stat-action.satiety');
        const washBtn = root.querySelector('.companion-stat-action.clean');
        if (feedBtn) feedBtn.disabled = pet.sleeping;
        if (washBtn) washBtn.disabled = pet.sleeping;
        document.getElementById('companion-wash-btn').classList.toggle('active', !!env.companionShower);
        renderCompanionAbility();
        if (renderDrawer) renderCompanionDrawer();
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
        const skinIds = ['basic', ...Object.keys(PET_DEFS).filter(id => slimeCollectionEntry(id).owned).sort((a, b) => {
            const rankA = rarityOrder[PET_DEFS[a]?.rarity] ?? 99;
            const rankB = rarityOrder[PET_DEFS[b]?.rarity] ?? 99;
            return rankA - rankB;
        })];
        if (env.companionDrawer === 'rooms') {
            const roomIds = ['cozy', ...Object.keys(ROOM_DECOR_STYLES).filter(id => id !== 'cozy')];
            drawer.innerHTML = `<div class="companion-drawer-head"><span><b>Комнаты</b><small>Выберите купленный стиль комнаты</small></span><button type="button" onclick="closeCompanionDrawer()">×</button></div><div class="companion-skin-list">${roomIds.filter(id => player.ownedRoomDecor.includes(id)).map(id => {
                const style = ROOM_DECOR_STYLES[id];
                const selected = (player.roomStyle || 'cozy') === id;
                return `<article class="companion-skin-card rarity-common ${selected ? 'selected' : ''}">
                    <div class="companion-skin-preview room-preview room-preview-${id}"><span></span></div>
                    <div class="companion-skin-copy"><b>${style.name}</b><small>Комната</small></div>
                    <button type="button" onclick="selectCompanionRoom('${id}')" ${selected ? 'disabled' : ''}>${selected ? 'Выбрана' : 'Выбрать'}</button>
                </article>`;
            }).join('')}</div>`;
            return;
        }
        drawer.innerHTML = `<div class="companion-drawer-head"><span><b>Слаймы</b><small>Выберите слайма</small></span><button type="button" onclick="closeCompanionDrawer()">×</button></div><div class="companion-skin-list">${skinIds.map(id => {
            const def = PET_DEFS[id];
            const selected = player.companion.skin === id;
            const collection = slimeCollectionEntry(id);
            const owned = id === 'basic' || collection.owned;
            const selectedVariant = selected ? (player.companion.variant || 'normal') : 'normal';
            const previewDef = def || { rarity: 'common', face: 'happy', slime: { body: '#72db68', shade: '#35a84c', blush: '#ffc1cf', decor: 'none' } };
            const rarity = def?.rarity || 'common';
            const state = companionLevelState(id);
            const variantButtons = [['huge', 'H', 'Huge'], ['gold', 'G', 'Gold'], ['rainbow', 'R', 'Rainbow']].map(([variant, label, title]) => {
                const unlocked = !!collection[variant];
                const active = selected && selectedVariant === variant;
                return `<button class="companion-variant-btn variant-${variant} ${active ? 'active' : ''} ${unlocked ? 'unlocked' : 'locked'}" type="button" title="${title}" onclick="selectCompanionVariant('${id}','${variant}')" ${unlocked ? '' : 'disabled'}>${label}</button>`;
            }).join('');
            return `<article class="companion-skin-card rarity-${rarity} ${selected ? 'selected' : ''} ${owned ? 'owned' : 'locked'}" data-slime-id="${id}">
                <div class="companion-skin-preview">${owned ? slimeHTML(previewDef, companionVariantPet(selectedVariant), 'inventory') : '<span class="companion-skin-locked">?</span>'}</div>
                <div class="companion-skin-copy"><b>${def ? def.name : 'Базовый слайм'}</b>${companionSkinStars(previewDef)}<small>${owned ? `Уровень ${state.level}` : 'Не открыт'}</small></div>
                <button type="button" onclick="selectCompanionSkin('${id}')" ${!owned || selected ? 'disabled' : ''}>${selected ? 'Выбран' : owned ? 'Выбрать' : 'Закрыт'}</button>
                <div class="companion-variant-row" aria-label="Открытые версии">${variantButtons}</div>
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

    function toggleCompanionRooms() {
        env.companionDrawer = env.companionDrawer === 'rooms' ? '' : 'rooms';
        renderCompanion();
    }

    function toggleCompanionLevelCard() {
        const modal = document.getElementById('companion-level-modal');
        if (!modal) return;
        if (modal.classList.contains('open')) {
            closeCompanionLevelModal();
            return;
        }
        env.companionDrawer = '';
        renderCompanionDrawer();
        renderCompanionLevelModal();
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
    }

    function companionAbilityMilestones(id) {
        const plans = {
            basic: [
                { range: '1–7', text: 'Накладывает радужную мутацию на 1 растение.' },
                { range: '8–14', text: 'Накладывает радужную мутацию на 2–3 растения.' },
                { range: '15', text: 'Накладывает радужную мутацию на 3–6 растений.' }
            ],
            dewdrop: [
                { range: '1–7', text: 'Поливает 2–3 растения и ускоряет их рост в 2 раза.' },
                { range: '8–14', text: 'Поливает 3–5 растений и ускоряет рост в 2,5 раза.' },
                { range: '15', text: 'Поливает все растения и ускоряет их рост в 3 раза.' }
            ],
            sproutslime: [
                { range: '1–7', text: 'Дарит набор семян ранних растений.' },
                { range: '8–14', text: 'Дарит набор семян растений среднего уровня.' },
                { range: '15', text: 'Дарит набор семян самых дорогих растений.' }
            ],
            coinblob: [
                { range: '1–7', text: 'Накладывает золотую мутацию на 1 растение.' },
                { range: '8–14', text: 'Накладывает золотую мутацию на 2–3 растения.' },
                { range: '15', text: 'Даёт золотые мутации и 1 бриллиантовую.' }
            ],
            sparkjelly: [
                { range: '1–7', text: 'Даёт электрическую мутацию 1 растению.' },
                { range: '8–14', text: 'Даёт электрическую мутацию 2 растениям.' },
                { range: '15', text: 'Даёт электрическую мутацию 3 растениям и возвращает 15% заряда.' }
            ],
            wavegum: [
                { range: '1–7', text: 'Волна мгновенно выращивает 1 растение.' },
                { range: '8–14', text: 'Волна мгновенно выращивает 2 растения.' },
                { range: '15', text: 'Выращивает 3 растения или с шансом 15% затапливает и выращивает все.' }
            ],
            nectar: [
                { range: '1–7', text: 'Выращивает до 3 растений до большого размера.' },
                { range: '8–14', text: 'Выращивает до 3 растений до огромного размера.' },
                { range: '15', text: 'Превращает самое дорогое готовое растение в титаническое.' }
            ],
            phantooze: [
                { range: '1–7', text: 'Отмечает 1 растение. После продажи остаётся его серая копия.' },
                { range: '8–14', text: 'Отмечает 2 растения. Копии сохраняют по 1 случайной мутации.' },
                { range: '15', text: 'Отмечает самое дорогое растение. Его копия сохраняет 3 мутации.' }
            ],
            sunpudding: [
                { range: '1–7', text: 'Запускает солнечный ивент с солнечными мутациями.' },
                { range: '8–14', text: 'Запускает солнечный ивент; с шансом 35% наступает фаза затмения.' },
                { range: '15', text: 'Запускает солнечный ивент с гарантированной фазой затмения.' }
            ],
            embergoo: [
                { range: '1–7', text: 'Запускает огненный ивент с огненными мутациями.' },
                { range: '8–14', text: 'С шансом 35% в финале ивента появляется 1 магмовая мутация.' },
                { range: '15', text: 'В финале ивента гарантированно появляются 1–2 магмовые мутации.' }
            ],
            stargum: [
                { range: '1–7', text: 'Запускает звездопад со звёздными мутациями.' },
                { range: '8–14', text: 'Запускает звездопад; с шансом 15% в финале прилетает комета.' },
                { range: '15', text: 'В финале прилетает 1 комета, с шансом 15% — вторая.' }
            ],
            moonmelt: [
                { range: '1–7', text: 'Запускает Ночь и даёт 1–3 лунные мутации.' },
                { range: '8–14', text: 'Запускает Ночь и даёт 2–5 лунных мутаций.' },
                { range: '15', text: 'Даёт 3–6 лунных мутаций; с шансом 50% начинается Багровая фаза с 1–2 багровыми.' }
            ],
            voidpuddle: [
                { range: '1–7', text: 'Запускает звёздное событие.' },
                { range: '8–14', text: 'Запускает инопланетное событие.' },
                { range: '15', text: 'Запускает редкое космическое событие.' }
            ]
        };
        return plans[id] || plans.basic;
    }

    function renderCompanionLevelModal() {
        const card = document.getElementById('companion-level-modal-card');
        if (!card) return;
        const id = companionSlimeId();
        const def = PET_DEFS[id];
        const state = syncCurrentCompanionLevel();
        const level = Math.max(1, Math.min(15, state.level || 1));
        const need = companionXpNeed(level);
        const progress = level >= 15 ? 100 : Math.min(100, state.xp / need * 100);
        const meta = companionAbilityMeta();
        const tier = companionAbilityTier();
        const rarity = PET_RARITY_STYLE[def?.rarity] || { label: 'Базовый' };
        const slimeName = (def?.shortName || def?.name || player.companion.name || 'Слайми').toUpperCase();
        const nextText = level >= 15
            ? 'Максимальный уровень достигнут'
            : `${Math.floor(state.xp)} / ${need} XP до уровня ${level + 1}`;
        const milestones = companionAbilityMilestones(id);
        card.style.setProperty('--level-card-accent', meta.color);
        card.style.setProperty('--level-card-dark', meta.dark);
        card.innerHTML = `
            <div class="companion-level-modal-head">
                <span class="companion-level-modal-icon" aria-hidden="true">${meta.symbol}</span>
                <div>
                    <small>${rarity.label.toUpperCase()}</small>
                    <b>${slimeName}</b>
                </div>
                <strong>Ур. ${level}</strong>
            </div>
            <section class="companion-level-modal-progress" aria-label="Прогресс уровня">
                <div><span>Текущий уровень</span><b>${nextText}</b></div>
                <i><em style="width:${progress}%"></em></i>
            </section>
            <section class="companion-level-modal-ability">
                <div class="companion-level-modal-label"><span>Суперспособность</span><b>${companionAbilityName()}</b></div>
                <div class="companion-level-milestones">
                    ${milestones.map((milestone, index) => {
                        const unlocked = tier >= index + 1;
                        const current = tier === index + 1;
                        return `<article class="companion-level-milestone ${unlocked ? 'unlocked' : 'locked'} ${current ? 'current' : ''}">
                            <span>${unlocked ? '✓' : '🔒'}</span>
                            <div><b>Уровни ${milestone.range}</b><small>${milestone.text}</small></div>
                        </article>`;
                    }).join('')}
                </div>
            </section>
            <small class="companion-level-modal-close">Нажмите в любом месте, чтобы закрыть</small>
        `;
    }

    function updateIncubatorTimerElements(root) {
        if (!root) return;
        const now = Date.now();
        player.incubator.forEach((item, slot) => {
            const slotEl = root.querySelector(`#incubator-slot-${slot}`);
            if (!item || !slotEl || !EGG_RARITIES[item.rarity]) return;
            const egg = EGG_RARITIES[item.rarity];
            const durationMs = Math.max(1, Number(item.duration || egg.hatchSeconds) * 1000);
            const readyAt = Number(item.readyAt) || now;
            const ready = TEST_HATCH_INSTANT || readyAt <= now;
            if (ready !== slotEl.classList.contains('ready')) {
                slotEl.outerHTML = renderIncubatorSlot(item, slot, now);
                return;
            }
            if (ready) return;
            const timer = slotEl.querySelector('small');
            const fill = slotEl.querySelector('.slime-incubator-progress i');
            const remaining = Math.max(0, readyAt - now);
            const progress = Math.min(100, ((durationMs - remaining) / durationMs) * 100);
            const label = formatTime(remaining);
            if (timer && timer.textContent !== label) timer.textContent = label;
            if (fill) fill.style.width = `${progress.toFixed(1)}%`;
        });
    }

    function updateOpenShopTimer() {
        if (env.shopTab === 'slimes') {
            updateIncubatorTimerElements(document.getElementById('shop-content'));
            return;
        }
        if (env.shopTab !== 'seeds' && env.shopTab !== 'merchant') return;
        const timer = document.querySelector('#shop-content .shop-info-banner.with-timer b');
        if (!timer) return;
        const now = Date.now();
        const seconds = env.shopTab === 'seeds'
            ? Math.max(0, Math.ceil((player.shop.refreshAt - now) / 1000))
            : Math.max(0, Math.ceil(((player.shop.merchantLeavesAt || player.shop.merchantArrivesAt) - now) / 1000));
        const label = formatEventTimer(seconds);
        if (timer.textContent !== label) timer.textContent = label;
    }

    function closeCompanionLevelModal() {
        const modal = document.getElementById('companion-level-modal');
        if (!modal) return;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    }

    function closeCompanionDrawer() {
        env.companionDrawer = '';
        renderCompanionDrawer();
    }

    function feedCompanion(tileId) {
        updateCompanionState();
        const crop = cropSnapshotFromTile(tileId);
        if (!crop) {
            showToast('Этот урожай уже недоступен', '#ff7675');
            return;
        }
        const quality = Math.log10((crop.value || 0) + 10);
        const xpGain = Math.max(8, Math.min(42, Math.round(quality * 11)));
        const chargeGain = chargeCompanionAbility(Math.max(12, Math.min(28, Math.round(8 + quality * 6))));
        grantCompanionProgress(xpGain);
        recordCropStats(crop, 0, true);
        clearTile(tileId);
        env.companionDrawer = '';
        sfx.play('pop');
        updateUI();
        setGardenSlimeFoodReaction('fed', 850);
        showToast(`+${xpGain} XP · заряд +${Math.round(chargeGain)}%`, '#72db68');
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
        const modal = document.getElementById('companion-name-modal');
        const input = document.getElementById('companion-name-input');
        if (!modal || !input) return;
        input.value = player.companion.name || '';
        modal.classList.add('active');
        setTimeout(() => {
            input.focus();
            input.select();
        }, 30);
    }

    function closeCompanionRename(event) {
        if (event && event.target !== event.currentTarget) return;
        document.getElementById('companion-name-modal')?.classList.remove('active');
    }

    function handleCompanionRenameKey(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            submitCompanionRename();
            return;
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            closeCompanionRename();
        }
    }

    function submitCompanionRename() {
        const input = document.getElementById('companion-name-input');
        if (!input) return;
        const name = input.value.trim().slice(0, 12);
        if (!name) {
            showToast('Введите имя', '#ff7675');
            input.focus();
            return;
        }
        player.companion.name = name;
        closeCompanionRename();
        sfx.play('pop');
        renderGardenCompanion();
        if (document.getElementById('garden-slime-dialog')?.classList.contains('open')) rerenderGardenSlimePanelPreservingScroll();
        saveGame();
    }

    function selectCompanionSkin(id) {
        if (id !== 'basic' && !PET_DEFS[id]) return;
        if (id !== 'basic' && !slimeCollectionEntry(id).owned) return;
        clearCompanionSpecial(false);
        player.companion.skin = id;
        player.companion.variant = 'normal';
        syncCurrentCompanionLevel();
        sfx.play('pop');
        renderGardenCompanion();
        if (document.getElementById('garden-slime-dialog')?.classList.contains('open')) rerenderGardenSlimePanelPreservingScroll();
        scheduleCompanionSpecial();
        saveGame();
    }

    function selectCompanionVariant(id, variant) {
        if ((id !== 'basic' && !PET_DEFS[id]) || !['huge', 'gold', 'rainbow'].includes(variant)) return;
        const collection = slimeCollectionEntry(id);
        if (!collection.owned || !collection[variant]) return;
        clearCompanionSpecial(false);
        const alreadyActive = player.companion.skin === id && player.companion.variant === variant;
        player.companion.skin = id;
        player.companion.variant = alreadyActive ? 'normal' : variant;
        syncCurrentCompanionLevel();
        sfx.play('pop');
        renderGardenCompanion();
        if (document.getElementById('garden-slime-dialog')?.classList.contains('open')) rerenderGardenSlimePanelPreservingScroll();
        scheduleCompanionSpecial();
        saveGame();
    }

    function updateCompanionVariantCards() {
        const list = document.querySelector('.companion-skin-list');
        if (!list) return;
        list.querySelectorAll('.companion-skin-card[data-slime-id]').forEach(card => {
            const id = card.dataset.slimeId;
            const selected = player.companion.skin === id;
            const activeVariant = selected ? (player.companion.variant || 'normal') : 'normal';
            const def = PET_DEFS[id] || { rarity: 'common', face: 'happy', slime: { body: '#72db68', shade: '#35a84c', blush: '#ffc1cf', decor: 'none' } };
            card.classList.toggle('selected', selected);
            const preview = card.querySelector('.companion-skin-preview');
            if (preview) preview.innerHTML = slimeHTML(def, companionVariantPet(activeVariant), 'inventory');
            const selectButton = card.querySelector(':scope > button');
            if (selectButton) {
                selectButton.disabled = selected;
                selectButton.textContent = selected ? 'Выбран' : 'Выбрать';
            }
            card.querySelectorAll('.companion-variant-btn').forEach(button => {
                button.classList.toggle('active', selected && button.classList.contains(`variant-${activeVariant}`));
            });
        });
    }

    function selectCompanionRoom(id) {
        if (!ROOM_DECOR_STYLES[id]) return;
        if (!player.ownedRoomDecor.includes(id)) return;
        player.roomStyle = id;
        env.companionDrawer = '';
        sfx.play('pop');
        renderCompanion();
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
            const weight = formatWeightLabel(crop.weight || 5);
            return `<div class="showcase-slot filled ${crop.sizeTier || 'normal'}">
                ${showcaseCropHTML(crop)}
                <div class="showcase-crop-name">${p.name}</div>
                <div class="showcase-crop-weight">${weight}</div>
                <div class="showcase-crop-income">+${compactNumber(showcaseIncome(crop))}/ч</div>
                <button class="showcase-sell" type="button" onclick="sellShowcaseCrop(${slot})">Продать</button>
            </div>`;
        }).join('');

        syncShowcasePreviewVisuals(slots);

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
                        <span><b>${p.name}</b><small>${formatWeightLabel(item.crop.weight)} · +${compactNumber(showcaseIncome(item.crop))}/ч</small></span>
                    </button>`;
                }).join('')}
            </div>
        </div>`;
        syncShowcasePreviewVisuals(picker);
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
        crop.traitsRecorded = true;
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
        if (section === 'diary') {
            if (env.openMenuSections[section]) renderDiary();
            else {
                document.getElementById('diary-stats')?.replaceChildren();
                document.getElementById('diary-progress')?.replaceChildren();
                document.getElementById('diary-mutations')?.replaceChildren();
            }
        }
        if (section === 'showcase') {
            if (env.openMenuSections[section]) renderShowcase();
            else {
                document.getElementById('showcase-slots')?.replaceChildren();
                document.getElementById('showcase-picker')?.replaceChildren();
            }
        }
        if (section === 'decor' && env.openMenuSections[section]) renderDecorShop();
        if (section === 'rewards') {
            if (env.openMenuSections[section]) renderRewards();
            else {
                document.getElementById('rewards-content')?.replaceChildren();
                env.rewardsRenderSignature = '';
            }
        }
    }

    function renderRewards() {
        ensureRewardsState();
        normalizeTimedRewards();
        const root = document.getElementById('rewards-content');
        if (!root) return;
        const timedHeadText = player.rewards.timedCooldownUntil
            ? `Новая серия через ${formatRewardCountdown(player.rewards.timedCooldownUntil - Date.now())}`
            : 'Новый подарок каждые 5 минут';

        root.innerHTML = `
            <div class="reward-block timed-block">
                <div class="reward-block-head">
                    <div><b>Подарки за время</b><small id="timed-reward-countdown">${timedHeadText}</small></div>
                    <span class="reward-streak">Серия из 4</span>
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
        env.rewardsRenderSignature = rewardsAvailabilitySignature();
    }

    function rewardsAvailabilitySignature() {
        return [
            ...(player.rewards.timedClaimed || []).map(Boolean),
            player.rewards.timedCooldownUntil > Date.now() ? 1 : 0,
            ...TIMED_REWARDS.map((_, index) => canClaimTimedReward(index) ? 1 : 0)
        ].join('|');
    }

    function updateOpenRewardsTimers() {
        ensureRewardsState();
        normalizeTimedRewards();
        const root = document.getElementById('rewards-content');
        if (!root) return;
        const signature = rewardsAvailabilitySignature();
        if (!root.childElementCount || signature !== env.rewardsRenderSignature) {
            renderRewards();
            return;
        }
        const timedCountdown = document.getElementById('timed-reward-countdown');
        if (timedCountdown) {
            timedCountdown.textContent = player.rewards.timedCooldownUntil
                ? `Новая серия через ${formatRewardCountdown(player.rewards.timedCooldownUntil - Date.now())}`
                : 'Новый подарок каждые 5 минут';
        }
        root.querySelectorAll('.timed-reward-card .timed-copy small').forEach((label, index) => {
            const claimed = !!player.rewards.timedClaimed[index];
            label.textContent = claimed ? 'Открыт' : canClaimTimedReward(index) ? 'Открыть' : formatRewardCountdown(getTimedRewardUnlockMs(index));
        });
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
            SIZE_DIARY_ENTRIES.huge,
            SIZE_DIARY_ENTRIES.titanic
        ];
    }

    function renderDiary() {
        ensureStats();
        const statsEl = document.getElementById('diary-stats');
        const progressEl = document.getElementById('diary-progress');
        const mutsEl = document.getElementById('diary-mutations');
        if (!statsEl || !progressEl || !mutsEl) return;

        statsEl.innerHTML = `
            <div class="diary-stat tone-coins"><span>$</span><strong>${compactNumber(player.stats.totalEarned)}</strong><small>Всего заработано</small></div>
            <div class="diary-stat tone-weight"><span>⚖</span><strong>${formatWeightLabel(player.stats.maxWeight)}</strong><small>Лучший вес</small></div>
            <div class="diary-stat tone-sale"><span>★</span><strong>${compactNumber(player.stats.bestSale)}$</strong><small>Лучшая продажа</small></div>
            <div class="diary-stat tone-harvest"><span>✓</span><strong>${compactNumber(player.stats.harvested)}</strong><small>Всего растений</small></div>
        `;

        const mutations = Object.values(MUTATIONS);
        const unlockedMutations = new Set(player.unlockedMutations || []);
        const discovered = mutations.filter(m => unlockedMutations.has(m.id) || (player.rares[m.id] || 0) > 0).length;
        const total = mutations.length;
        const progress = total ? Math.round((discovered / total) * 100) : 0;
        const complete = discovered === total;
        progressEl.innerHTML = `
            <div class="diary-progress-head">
                <span>Коллекция мутаций</span>
                <b>${discovered}/${total}</b>
            </div>
            <div class="diary-progress-track" role="progressbar" aria-label="Открытые мутации" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${discovered}">
                <i style="width:${progress}%"></i>
            </div>
            <div class="diary-progress-footer">
                <small>${progress}% открыто</small>
                <button class="diary-progress-claim" type="button" ${complete ? '' : 'disabled'}>${complete ? 'Забрать награду' : 'Награда за 100%'}</button>
            </div>
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
            const decorSignature = `${player.plotStyle || 'default'}|${player.decorPaintColor || DECOR_PAINT_COLORS[0]}`;
            if (garden.dataset.decorSignature !== decorSignature) {
                garden.dataset.decorSignature = decorSignature;
                applyDecorVars(garden);
                renderPaintPalette(garden);
            }
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

    function renderDecorCards(styles, ownedList, activeId, actionName) {
        return Object.values(styles).map(style => {
            const bought = ownedList.includes(style.id);
            const active = activeId === style.id;
            const locked = player.lvl < (style.lvl || 1);
            const canBuy = !bought && !locked && ((style.cost || 0) <= 0 || player.coins >= style.cost);
            const pricey = style.cost > 0 && !bought && !locked && !canBuy;
            const stateClass = locked ? 'locked' : active ? 'active' : bought ? 'owned' : canBuy ? 'can-buy' : pricey ? 'pricey' : '';
            const actionText = locked ? `Ур. ${style.lvl}` : active ? 'Выбран' : bought ? 'Выбрать' : canBuy ? 'Купить' : 'Не хватает';
            return `<div class="decor-card ${stateClass} style-${style.id}" data-lock-label="${locked ? `Уровень ${style.lvl}` : ''}">
                <div class="decor-preview"></div>
                <b>${style.name}</b>
                <small>${style.desc || ''}</small>
                ${style.cost > 0 && !bought && !locked ? `<em class="${canBuy ? 'can-buy' : 'need-money'}">${compactNumber(style.cost)}$</em>` : '<em></em>'}
                <button type="button" class="decor-buy ${active ? 'selected' : ''} ${pricey ? 'need-money' : ''}" onclick="${actionName}('${style.id}')">${actionText}</button>
            </div>`;
        }).join('');
    }

    function renderDecorShop() {
        const roomOwned = Array.isArray(player.ownedRoomDecor) ? player.ownedRoomDecor : ['cozy'];
        return `<div class="shop-pane decor-pane room-shop-pane">
            <div class="shop-info-banner room-shop-banner">
                <span>Уютная комната</span>
                <b>Выберите стиль для слайма</b>
            </div>
            <div class="decor-shop room-decor-shop">${renderDecorCards(ROOM_DECOR_STYLES, roomOwned, player.roomStyle || 'cozy', 'buyOrSelectRoomDecor')}</div>
        </div>`;
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
    }

    function buyOrSelectRoomDecor(styleId) {
        const style = ROOM_DECOR_STYLES[styleId];
        if (!style) return;
        if (player.lvl < (style.lvl || 1)) { showToast(`Нужен уровень ${style.lvl}`, "#ff7675"); return; }
        if (!Array.isArray(player.ownedRoomDecor)) player.ownedRoomDecor = ['cozy'];
        const bought = player.ownedRoomDecor.includes(styleId);
        if (!bought) {
            if (player.coins < style.cost) { showToast(`Нужно ${compactNumber(style.cost)} монет`, "#ff7675"); return; }
            player.coins -= style.cost;
            player.ownedRoomDecor.push(styleId);
            sfx.play('coin');
        } else {
            sfx.play('pop');
        }
        player.roomStyle = styleId;
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

    function setTestLevel30() {
        while (player.lvl < 30) {
            player.lvl++;
            player.xpNeed = Math.floor(player.xpNeed * (BALANCE.xpNeedMult || 1.5));
        }
        player.xp = 0;
        sfx.play('pop');
        showToast('Уровень повышен до 30', '#a29bfe');
        updateUI();
        saveGame();
    }

    function setTestSlimeAbility() {
        ensureCompanionState();
        const state = companionLevelState();
        state.level = 15;
        state.xp = 0;
        syncCurrentCompanionLevel();
        player.companion.abilityEnergy = 100;
        player.companion.abilityCooldownUntil = 0;
        showToast('Слайм: уровень 15, заряд 100%', '#72db68');
        renderGardenCompanion();
        if (document.getElementById('garden-slime-dialog')?.classList.contains('open')) rerenderGardenSlimePanelPreservingScroll();
        saveGame();
    }

    function setTestSlimeLevel8() {
        ensureCompanionState();
        const state = companionLevelState();
        state.level = 8;
        state.xp = 0;
        syncCurrentCompanionLevel();
        sfx.play('pop');
        showToast('Слайм: уровень сброшен до 8', '#72db68');
        renderGardenCompanion();
        if (document.getElementById('garden-slime-dialog')?.classList.contains('open')) rerenderGardenSlimePanelPreservingScroll();
        saveGame();
    }

    function activePlantedTileIds() {
        return tiles.filter(t => t.active).map(t => t.id);
    }

    function nextTestMutationIndex() {
        const raw = Number(env.testMutationCycleIndex) || 0;
        return ((raw % TEST_MUTATION_SEQUENCE.length) + TEST_MUTATION_SEQUENCE.length) % TEST_MUTATION_SEQUENCE.length;
    }

    function updateAdminMutationCycleButton() {
        const btn = document.getElementById('admin-mut-cycle-btn');
        if (!btn) return;
        const mutId = TEST_MUTATION_SEQUENCE[nextTestMutationIndex()];
        const mut = MUTATIONS[mutId];
        btn.title = mut ? `Тест: ${mut.name} на все посаженные растения` : 'Тест мутаций';
    }

    function clearPlantedMutationsForTest({ silent = false } = {}) {
        let changed = 0;
        activePlantedTileIds().forEach(idx => {
            const t = tiles[idx];
            if (!t) return;
            const hadMutation = Array.isArray(t.mutations) && t.mutations.length > 0;
            const hadBeeLock = t.beeLock > 0;
            t.mutations = [];
            t.beeLock = 0;
            if (hadMutation || hadBeeLock) changed++;
            updateTileDOM(idx);
        });
        if (!silent) {
            if (changed > 0) {
                sfx.play('pop');
                showToast(`Мутации сняты: ${changed}`, '#74b9ff');
            } else {
                showToast('На посаженных растениях мутаций нет', '#b2bec3');
            }
        }
        saveGame();
        return changed;
    }

    function resetPlantedMutations() {
        env.testMutationSweepToken = (Number(env.testMutationSweepToken) || 0) + 1;
        clearPlantedMutationsForTest();
    }

    function applyTestMutationWithAnimation(idx, mutId, token) {
        const t = tiles[idx];
        if (!canTileReceiveMutation(t, mutId)) return false;
        const tileEl = document.getElementById(`tile-${idx}`);
        if (!tileEl) return false;
        const hit = TEST_MUTATION_HITS[mutId] || TEST_MUTATION_HITS.default;
        if (hit.sound) sfx.play(hit.sound);
        hit.classes.forEach(className => tileEl.classList.add(className));
        if (mutId === 'honey') t.beeLock = 3;

        setTimeout(() => {
            if (env.testMutationSweepToken !== token) return;
            if (mutId === 'lava') {
                if (commitTileMutation(idx, mutId)) {
                    sfx.play('magmaMutation');
                    sfx.play('lavaBubble');
                    syncTileMutationPresentation(idx);
                }
                return;
            }
            if (commitTileMutation(idx, mutId)) updateTileDOM(idx);
        }, hit.commitDelay);

        setTimeout(() => {
            const liveEl = document.getElementById(`tile-${idx}`);
            if (!liveEl) return;
            hit.classes.forEach(className => liveEl.classList.remove(className));
            if (mutId === 'honey') {
                const liveTile = tiles[idx];
                if (liveTile) liveTile.beeLock = 0;
                if (env.testMutationSweepToken === token) updateTileDOM(idx);
            }
        }, hit.removeDelay);

        return true;
    }

    function applyTestBloodmoonMutationWithAnimation(idx, token) {
        const tile = tiles[idx];
        if (!tile?.active) return false;

        // The test follows the real gameplay chain: Lunar exists only until Blood Moon replaces it.
        tile.mutations = ['lunar'];
        updateTileDOM(idx);

        setTimeout(() => {
            if (env.testMutationSweepToken !== token || !tiles[idx]?.mutations.includes('lunar')) return;
            const tileEl = document.getElementById(`tile-${idx}`);
            if (!tileEl) return;
            const beam = document.createElement('span');
            beam.className = 'bloodmoon-mutation-beam';
            tileEl.appendChild(beam);
            tileEl.classList.add('bloodmoon-hit');
            animateMoonmeltBloodmoonMoon(beam);

            setTimeout(() => {
                if (env.testMutationSweepToken !== token) return;
                if (commitTileMutation(idx, 'bloodmoon')) {
                    sfx.play('mut');
                    syncTileMutationPresentation(idx);
                }
            }, MOONMELT_BLOODMOON_BEAM_COMMIT_DELAY_MS);

            setTimeout(() => {
                tileEl.classList.remove('bloodmoon-hit');
                beam.remove();
            }, MOONMELT_BLOODMOON_BEAM_REMOVE_DELAY_MS);
        }, 220);
        return true;
    }

    function applyNextTestMutationToPlanted() {
        const ids = activePlantedTileIds();
        if (!ids.length) {
            showToast('Нет посаженных растений для теста', '#ff7675');
            sfx.play('error');
            return;
        }

        const index = nextTestMutationIndex();
        const mutId = TEST_MUTATION_SEQUENCE[index];
        const mut = MUTATIONS[mutId];
        if (!mut) return;

        const token = (Number(env.testMutationSweepToken) || 0) + 1;
        env.testMutationSweepToken = token;
        env.testMutationCycleIndex = (index + 1) % TEST_MUTATION_SEQUENCE.length;
        clearPlantedMutationsForTest({ silent: true });
        updateAdminMutationCycleButton();

        const stepMs = 170;
        ids.forEach((idx, order) => {
            setTimeout(() => {
                if (env.testMutationSweepToken !== token) return;
                if (mutId === 'bloodmoon') applyTestBloodmoonMutationWithAnimation(idx, token);
                else applyTestMutationWithAnimation(idx, mutId, token);
            }, order * stepMs);
        });

        const hit = TEST_MUTATION_HITS[mutId] || TEST_MUTATION_HITS.default;
        setTimeout(() => {
            if (env.testMutationSweepToken !== token) return;
            saveGame();
        }, Math.max(0, ids.length - 1) * stepMs + (mutId === 'bloodmoon' ? 220 + MOONMELT_BLOODMOON_BEAM_COMMIT_DELAY_MS : hit.commitDelay) + 120);

        showToast(`Тест: ${mut.name} на ${ids.length} растений`, mut.color);
    }

    function resetProgress() {
        if (env.eventVisualFrame) cancelAnimationFrame(env.eventVisualFrame);
        if (env.companionSpecialTimer) clearTimeout(env.companionSpecialTimer);
        if (env.companionSpecialEndTimer) clearTimeout(env.companionSpecialEndTimer);
        if (env.companionAbilitySpecialTimer) clearTimeout(env.companionAbilitySpecialTimer);
        if (env.slimeFoodReactionTimer) clearTimeout(env.slimeFoodReactionTimer);
        clearEmbergooMagmaTimers();
        clearStargumCometFinale();
        clearMoonmeltLunarFinale();
        clearNightAmbience();
        clearCompanionGiftTimers();
        player = {
            coins: BALANCE.startCoins || 50, lvl: 1, xp: 0, xpNeed: BALANCE.xpNeedStart || 100,
            rares: {}, unlockedMutations: [],
            pets: [], petLevels: {}, petInventory: [], equippedPets: [null, null, null], unlockedPetSlots: 1, slimeCollection: {},
            incubator: [null, null, null], quests: [], lastSaved: Date.now(), bank: 0, showcasePayoutAt: Date.now() + SHOWCASE_PAYOUT_INTERVAL, showcasePayoutRemainder: 0,
            plotStyle: 'default', ownedDecor: ['default'], decorPaintColor: '#ff7675', roomStyle: 'cozy', ownedRoomDecor: ['cozy'], purchasedPlots: defaultPurchasedPlots(),
            seedInventory: defaultSeedInventory(), cropInventory: [],
            shop: defaultShopState(),
            showcase: [null, null, null],
            companion: defaultCompanionState(),
            stats: { totalEarned: 0, maxWeight: 0, bestSale: 0, harvested: 0 },
            rewards: defaultRewardsState()
        };
        resetTilesState();
        const persistentPerformanceRuntime = {
            fpsMeterFrame: env.fpsMeterFrame || null,
            perfTelemetry: env.perfTelemetry || null,
            perfLongTaskObserver: env.perfLongTaskObserver || null,
            eventStyleCache: env.eventStyleCache || {},
            eventBackgroundLayer: env.eventBackgroundLayer || 0
        };
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
            companionAbilitySpecial: '', companionAbilitySpecialTimer: null, companionAbilityPayload: null, companionGiftTimers: [], embergooMagmaTimers: [], stargumCometTimers: [], stargumCometFrames: [], stargumCometFinale: false, moonmeltLunarTimers: [], moonmeltLunarFinale: false, nightDawnTimer: null, nightDawnActive: false, nightPaletteFrame: null, nightPalette: null, nightPalettePhase: 'day',
            companionSpecialAnchorX: 0, companionSpecialAnchorY: 0,
            companionCoinBurstAt: 0,
            gardenSlimePanelTab: 'profile', slimeFoodReaction: '', slimeFoodReactionTimer: null,
            openMenuSections: { showcase: false, diary: false, decor: false, rewards: false, admin: false },
            backroomsLampTimer: null, backroomsLampEndTimer: null, shopTab: 'seeds', decorShopTab: 'room', pendingPlotPurchase: null, abilityFloodTimer: null, sunpuddingEclipseTimer: null, sunpuddingEclipseDarkTimer: null,
            lastCompanionVitalsAt: 0, rewardsRenderSignature: '', eventVisualFrame: null,
            ...persistentPerformanceRuntime
        };
        eventActions = [];
        currentTool = null;
        startEvent('day');
        document.getElementById('side-menu').classList.remove('open');
        document.getElementById('shop-modal').classList.remove('open');
        syncActiveSurfaceState();
        document.getElementById('plot-buy-modal')?.classList.remove('active');
        document.getElementById('pet-reveal').classList.remove('active');
        document.querySelectorAll('.action-btn').forEach(btn => btn.classList.remove('active'));
        localStorage.removeItem('FarmMobileV2');
        renderGarden();
        renderSeeds();
        generateQuestsIfNeeded();
        updateUI();
        updateAdminMutationCycleButton();
        scheduleCompanionSpecial();
        saveGame();
        showToast('Прогресс сброшен', '#f1c40f');
    }
    
    function floatText(tileIdx, text, color) {
        const el = document.getElementById(`tile-${tileIdx}`);
        if (!el) return;
        const existing = el.querySelectorAll(':scope > .floating-text');
        if (existing.length >= 2) existing[0].remove();
        const f = document.createElement('div'); f.className = 'floating-text';
        f.style.left = '50%'; f.style.top = '20%'; f.style.marginLeft = '-32px'; f.style.width = '64px';
        f.style.color = color; f.textContent = text; el.appendChild(f);
        setTimeout(() => f.remove(), 1200);
    }

    function showToast(msg, color) {
        const c = document.getElementById('toasts'); const t = document.createElement('div');
        t.className = 'toast'; t.style.border = `2px solid ${color}`; t.innerText = msg;
        c.appendChild(t); setTimeout(() => { t.style.opacity=0; setTimeout(()=>t.remove(),300) }, 2000);
    }

    function openPlotBuyModal(idx) {
        const price = getPlotPurchaseCost(idx);
        if (!price) return;
        env.pendingPlotPurchase = idx;
        const modal = document.getElementById('plot-buy-modal');
        const title = document.getElementById('plot-buy-title');
        const priceEl = document.getElementById('plot-buy-price');
        if (!modal || !title || !priceEl) return;
        title.textContent = 'Купить';
        priceEl.textContent = `${compactNumber(price)}$`;
        if (env.plotBuyOpenTimer) clearTimeout(env.plotBuyOpenTimer);
        modal.classList.add('active', 'opening');
        // The click synthesized after a short touch must not immediately hit
        // the newly opened backdrop and close the purchase window.
        env.plotBuyIgnoreUntil = performance.now() + 260;
        env.plotBuyOpenTimer = setTimeout(() => {
            modal.classList.remove('opening');
            env.plotBuyOpenTimer = null;
        }, 260);
        sfx.play('pop');
    }

    function closePlotBuyModal(event) {
        if (event && performance.now() < (env.plotBuyIgnoreUntil || 0)) return;
        if (event && event.target && event.target !== event.currentTarget) return;
        env.pendingPlotPurchase = null;
        if (env.plotBuyOpenTimer) clearTimeout(env.plotBuyOpenTimer);
        env.plotBuyOpenTimer = null;
        env.plotBuyIgnoreUntil = 0;
        document.getElementById('plot-buy-modal')?.classList.remove('active', 'opening');
    }

    function confirmPlotPurchase() {
        const idx = Number(env.pendingPlotPurchase);
        const price = getPlotPurchaseCost(idx);
        if (!Number.isInteger(idx) || !price) {
            closePlotBuyModal();
            return;
        }
        if (player.coins < price) {
            showToast('Не хватает монет', '#ff7675');
            sfx.play('error');
            return;
        }
        player.coins -= price;
        if (!player.purchasedPlots.includes(idx)) player.purchasedPlots.push(idx);
        player.purchasedPlots.sort((a, b) => a - b);
        closePlotBuyModal();
        sfx.play('coin');
        showToast('Грядка куплена!', '#55efc4');
        updateUI();
        saveGame();
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
    
    function updateQuest(type, amount, options = {}) {
        let q = player.quests.find(x => x.id === type && !x.claimed);
        if (q && q.current < q.target) {
            q.current += amount;
            if (q.current >= q.target && !options.quiet) { sfx.play('pop'); showToast("Задание выполнено!", "#f1c40f"); }
            if (!options.deferUI) {
                updateHeaderUI();
                if (activeSurface() === 'menu') renderQuests();
            }
        }
    }

    function renderQuests() {
        const c = document.getElementById('quests-container');
        if (!c) return;
        const signature = player.quests.map(q => `${q.id}:${q.current}:${q.target}:${q.claimed ? 1 : 0}`).join('|');
        if (c.dataset.renderSignature === signature) return;
        c.dataset.renderSignature = signature;
        c.innerHTML = player.quests.map((q, i) => {
            let pct = Math.min(100, (q.current / q.target) * 100); let done = q.current >= q.target;
            return `<div class="quest-card ${done ? 'done' : ''} ${q.claimed ? 'claimed' : ''}"><div class="quest-title">${q.desc}</div><div class="quest-progress"><div class="quest-fill" style="width:${pct}%"></div></div><div class="quest-reward"><span>Награда: ${q.reward}$</span>${!q.claimed ? `<button class="btn-claim" onclick="claimQuest(${i})">Забрать</button>` : '<span>✓</span>'}</div></div>`;
        }).join('');
    }

    function claimQuest(idx) {
        let q = player.quests[idx];
        if (q.current >= q.target && !q.claimed) {
            q.claimed = true; player.coins += q.reward; ensureStats(); player.stats.totalEarned += Math.max(0, q.reward || 0); sfx.play('coin'); updateUI();
            if (player.quests.every(x => x.claimed)) setTimeout(() => { player.quests = []; generateQuestsIfNeeded(); updateUI(); }, 2000);
        }
    }

    function showPetReveal(pet, fromEgg = false) {
        const def = PET_DEFS[pet.id]; const style = PET_RARITY_STYLE[def.rarity] || PET_RARITY_STYLE.common;
        const revealVariant = pet.shiny === 'rainbow' ? 'rainbow' : pet.shiny === 'gold' ? 'gold' : pet.size === 'huge' ? 'huge' : 'normal';
        const overlay = document.getElementById('pet-reveal');
        const card = document.getElementById('pet-reveal-card');
        const revealPoints = [[-122,-82],[-42,-138],[62,-126],[132,-46],[108,82],[28,138],[-76,118],[-136,18]];
        const revealEffect = fromEgg ? `<div class="pet-reveal-effects" aria-hidden="true">
            <b></b><b></b>
            ${revealPoints.map(([x, y], index) => `<i style="--fx:${x}px;--fy:${y}px;--fx-delay:${(index % 4) * 45}ms"></i>`).join('')}
        </div>` : '';
        overlay.style.setProperty('--rarity-color', style.color);
        card.style.setProperty('--rarity-color', style.color);
        overlay.className = `pet-reveal${fromEgg ? ` egg-reveal rarity-${def.rarity}` : ''}`;
        card.className = `pet-reveal-card rarity-${def.rarity} ${fromEgg ? 'egg-card-arrival' : ''} ${pet.shiny === 'gold' ? 'card-gold' : ''} ${pet.shiny === 'rainbow' ? 'card-rainbow' : ''} ${pet.size === 'huge' ? 'card-huge' : ''}`;
        card.innerHTML = `
            ${revealEffect}
            <div class="pet-reveal-sprite"><span class="pet-reveal-material variant-${revealVariant}">${slimeHTML(def, pet, 'reveal')}</span></div>
            <div class="pet-reveal-rarity">${petRarityHTML(pet, def)}</div>
            <div class="pet-reveal-name">${petDisplayName(pet)}</div>
            <div class="pet-reveal-role">Новый слайм<br><b>${def.name}</b></div>
            <button class="pot-btn" onclick="closePetReveal()">Забрать</button>`;
        overlay.classList.add('active');
    }

    function closePetReveal() {
        const overlay = document.getElementById('pet-reveal');
        overlay.classList.remove('active', 'egg-reveal', 'rarity-common', 'rarity-rare', 'rarity-legendary', 'rarity-secret');
        if (env.pendingSlimeShopRefresh) {
            env.pendingSlimeShopRefresh = false;
            if (document.getElementById('shop-modal')?.classList.contains('open')) renderShop();
        }
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
                showToast('Доступна новая грядка!', '#55efc4');
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
            readyAt: TEST_HATCH_INSTANT ? now : now + egg.hatchSeconds * 1000,
            hatching: false,
            ready: false
        };
        return { rarityId, slot };
    }

    function grantSecretSlimeReward() {
        const pool = Object.values(PET_DEFS).filter(def => def.secret);
        if (!pool.length) return { blocked: true, message: 'Слаймы пока недоступны' };
        const picked = pool[Math.floor(Math.random() * pool.length)];
        const pet = unlockSlimeCollectible(picked.id, rollPetVariant());
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
            const hasDailyLeft = DAILY_REWARDS_ENABLED && (player.rewards.dailyTestClaimed || []).some(claimed => !claimed);
            const hasTimedLeft = (player.rewards.timedClaimed || []).some(claimed => !claimed);
            return hasDailyLeft || hasTimedLeft;
        }
        return (DAILY_REWARDS_ENABLED && canClaimDailyReward()) || TIMED_REWARDS.some((_, index) => canClaimTimedReward(index));
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
        const signature = statuses.map(status => `${status.id}:${status.time}`).join('|');
        if (panel.dataset.renderSignature === signature) return;
        panel.dataset.renderSignature = signature;
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

    function updateMenuMarkers() {
        const rewardsMarker = document.getElementById('rewards-ready-marker');
        if (rewardsMarker) rewardsMarker.classList.toggle('visible', hasClaimableRewards());
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

    function clearCompanionGiftTimers() {
        (env.companionGiftTimers || []).forEach(timer => clearTimeout(timer));
        env.companionGiftTimers = [];
    }

    function sproutGiftItemHTML(item) {
        const seed = PLANTS[item.seedId];
        if (!seed) return '';
        return rewardLootItemHTML({
            type: 'seed',
            html: seedIcon(seed.id, 'reward-seed-mini'),
            value: `${seed.name} x${item.amount}`,
            accent: seed.color
        });
    }

    function animateSproutGiftPop(items) {
        clearCompanionGiftTimers();
        const row = document.getElementById('sprout-gift-row');
        const total = document.getElementById('sprout-gift-total');
        if (!row || !Array.isArray(items)) return;
        let seedCount = 0;
        items.forEach((item, index) => {
            const timer = setTimeout(() => {
                row.insertAdjacentHTML('beforeend', sproutGiftItemHTML(item));
                seedCount += item.amount || 0;
                if (total) total.textContent = `+${seedCount} семян`;
                sfx.play('pop');
            }, 260 + index * 230);
            env.companionGiftTimers.push(timer);
        });
    }

    function showSproutSeedGiftPop(grants) {
        const safeGrants = (Array.isArray(grants) ? grants : []).filter(item => PLANTS[item.seedId] && item.amount > 0);
        showRewardPop({
            title: 'Дары природы',
            subtitle: 'Росток нашел семена',
            accent: '#72df65',
            glow: 'default',
            iconHtml: '<span class="reward-loot reward-loot-sprout">🌱</span>',
            sproutGiftItems: safeGrants,
            closeAnywhere: true
        });
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
        card.className = `reward-pop-card glow-${view.glow || 'default'} ${view.ultra ? 'is-ultra' : ''} ${Array.isArray(view.sproutGiftItems) ? 'is-sprout-gift' : ''}`;
        card.innerHTML = `
            <div class="reward-pop-icon-shell">
                <div class="reward-pop-burst"></div>
                <div class="reward-pop-icon">${view.iconHtml || view.icon || '🎁'}</div>
            </div>
            <b>${view.title || 'Награда'}</b>
            ${view.subtitle ? `<small>${view.subtitle}</small>` : ''}
            ${Array.isArray(view.lootItems) && view.lootItems.length && !view.compact ? `<div class="reward-pop-loot-row">${view.lootItems.map(rewardLootItemHTML).join('')}</div>` : ''}
            ${Array.isArray(view.sproutGiftItems) ? '<div class="reward-pop-loot-row sprout-gift-row" id="sprout-gift-row"></div><div class="sprout-gift-total" id="sprout-gift-total">+0 семян</div>' : ''}
            <div class="reward-pop-hint">Нажмите на экран</div>
        `;
        overlay.onclick = (event) => {
            if (view.closeAnywhere || event.target === overlay) {
                overlay.classList.remove('active');
                clearCompanionGiftTimers();
            }
        };
        overlay.classList.remove('active');
        void overlay.offsetWidth;
        overlay.classList.add('active');
        if (Array.isArray(view.sproutGiftItems)) animateSproutGiftPop(view.sproutGiftItems);
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
        '.slime-egg-buy',
        '.slime-incubator-slot',
        '.companion-stat-action',
        '.companion-name',
        '.companion-stage',
        '.companion-skin-trigger',
        '.companion-feed-list > button',
        '.companion-skin-list > button',
        '.decor-buy',
        '.daily-reward-card',
        '.timed-reward-card',
        '.reward-mini-card',
        '.showcase-actions button'
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

    function calcOfflineBank() {
        let diffSec = Math.floor((Date.now() - player.lastSaved) / 1000);
        const maxCycles = Math.max(1, Math.floor((BALANCE.offlineBankCapSeconds || 0) / (SHOWCASE_PAYOUT_INTERVAL / 1000)));
        if (diffSec >= SHOWCASE_PAYOUT_INTERVAL / 1000) processShowcasePayout(maxCycles);
        player.lastSaved = Date.now();
        if (env.openMenuSections?.showcase) renderShowcase();
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
    }

    function normalizePetState() {
        ensureStats();
        ensureSeedAndShopState();
        ensureCropInventoryState();
        ensurePlotPurchaseState();
        ensureRewardsState();
        ensureCompanionState();
        player.unlockedMutations = Array.isArray(player.unlockedMutations)
            ? player.unlockedMutations.filter(mId => MUTATIONS[mId])
            : [];
        if (player.rares && typeof player.rares === 'object') {
            REMOVED_MUTATION_IDS.forEach(mId => delete player.rares[mId]);
        }
        if (!player.pets) player.pets = [];
        if (!player.petLevels) player.petLevels = {};
        if (!Array.isArray(player.petInventory)) player.petInventory = [];
        if (!Array.isArray(player.equippedPets)) player.equippedPets = [null, null, null];
        player.equippedPets = [player.equippedPets[0] || null, player.equippedPets[1] || null, player.equippedPets[2] || null];
        if (!player.unlockedPetSlots) player.unlockedPetSlots = 1;
        if (!Array.isArray(player.incubator)) player.incubator = [null, null, null];
        player.incubator = [player.incubator[0] || null, player.incubator[1] || null, player.incubator[2] || null].map(item => {
            if (!item || !EGG_RARITIES[item.rarity] || item.rarity === 'mystery') return null;
            const egg = EGG_RARITIES[item.rarity];
            const duration = egg.hatchSeconds;
            const startedAt = Math.max(0, Number(item.startedAt) || Date.now());
            return {
                ...item,
                duration,
                startedAt,
                readyAt: TEST_HATCH_INSTANT ? startedAt : startedAt + duration * 1000,
                hatching: false
            };
        });
        if (!Array.isArray(player.ownedDecor)) player.ownedDecor = ['default'];
        player.ownedDecor = player.ownedDecor.filter(id => DECOR_STYLES[id]);
        if (!player.ownedDecor.includes('default')) player.ownedDecor.unshift('default');
        if (!Array.isArray(player.ownedRoomDecor)) player.ownedRoomDecor = ['cozy'];
        player.ownedRoomDecor = player.ownedRoomDecor.filter(id => ROOM_DECOR_STYLES[id]);
        if (!player.ownedRoomDecor.includes('cozy')) player.ownedRoomDecor.unshift('cozy');
        if (!Array.isArray(player.showcase)) player.showcase = [null, null, null];
        player.showcase = [player.showcase[0] || null, player.showcase[1] || null, player.showcase[2] || null].map(crop => {
            if (!crop || !PLANTS[crop.plantId]) return null;
            const weight = clampTileWeight(crop);
            const mutations = Array.isArray(crop.mutations) ? crop.mutations.filter(mId => MUTATIONS[mId]) : [];
            const sizeTier = sizeTierFromWeight(weight, crop.sizeTier === 'titanic');
            const value = Number(crop.value) || cropSaleValue(crop.plantId, mutations, weight, 0, sizeTier);
            return {...crop, mutations, weight, sizeTier, value, weightMult: Number(crop.weightMult) || parseFloat(getWeightMultiplier(weight, sizeTier).toFixed(1)), income: showcaseIncome({value})};
        });
        if (player.decorPaintColor === '#ff9ff3') player.decorPaintColor = '#2ecc71';
        if (!DECOR_PAINT_COLORS.includes(player.decorPaintColor)) player.decorPaintColor = DECOR_PAINT_COLORS[0];
        if (!DECOR_STYLES[player.plotStyle]) player.plotStyle = 'default';
        if (!player.ownedDecor.includes(player.plotStyle)) player.plotStyle = 'default';
        if (!ROOM_DECOR_STYLES[player.roomStyle]) player.roomStyle = 'cozy';
        if (!player.ownedRoomDecor.includes(player.roomStyle)) player.roomStyle = 'cozy';

        const oldPetMap = { dog: 'dewdrop', cat: 'coinblob', dragon: 'sparkjelly', drop: 'dewdrop', dew: 'dewdrop', sun: 'coinblob', bun: 'coinblob', spark: 'sparkjelly', glimmer: 'sparkjelly', clover: 'sproutslime', sprig: 'sproutslime' };
        ensureSlimeCollection();
        player.pets.forEach(id => {
            const mapped = oldPetMap[id] || id;
            if (PET_DEFS[mapped]) slimeCollectionEntry(mapped).owned = true;
        });
        player.petInventory = player.petInventory.map(p => {
            const mappedId = oldPetMap[p.id] || p.id;
            return {...p, id: mappedId};
        }).filter(p => p && PET_DEFS[p.id]).map(p => ({...p, hunger: Math.max(0, Math.min(100, p.hunger ?? 100)), level: Math.max(1, Math.min(BALANCE.helperMaxLevel, p.level || 1)), size: p.size || 'normal', shiny: p.shiny || 'normal', happy: !!p.happy }));
        player.petInventory.forEach(pet => {
            const entry = slimeCollectionEntry(pet.id);
            entry.owned = true;
            if (pet.size === 'huge') entry.huge = true;
            if (pet.shiny === 'gold') entry.gold = true;
            if (pet.shiny === 'rainbow') entry.rainbow = true;
        });
        if (player.companion.skin !== 'basic' && PET_DEFS[player.companion.skin]) slimeCollectionEntry(player.companion.skin).owned = true;
        const selectedCollection = slimeCollectionEntry(player.companion.skin || 'basic');
        if (player.companion.variant !== 'normal' && !selectedCollection[player.companion.variant]) player.companion.variant = 'normal';
        // Save migration: slimeCollection is canonical, while old slot arrays remain empty.
        player.petInventory = [];
        player.equippedPets = [null, null, null];
        tiles = tiles.map((tile, index) => {
            const safe = { id: index, active: false, plantId: null, growth: 0, water: 0, slimeWater: 0, slimeWaterMult: 1, hasWeed: false, mutations: [], scale: .4, weight: 1, weightMult: 1, sizeTier: 'small', beeLock: 0, ghostEchoPercent: 0, ghostMarked: false, ghostCopyMutationCount: 0, ghostEcho: false, ghostValue: 0, ...tile };
            safe.id = index;
            safe.active = !!safe.active;
            safe.plantId = PLANTS[safe.plantId] ? safe.plantId : null;
            safe.growth = Math.max(0, Math.min(100, Number(safe.growth) || 0));
            safe.water = Math.max(0, Math.floor(Number(safe.water) || 0));
            safe.slimeWater = Math.max(0, Math.floor(Number(safe.slimeWater) || 0));
            safe.slimeWaterMult = Math.max(1, Number(safe.slimeWaterMult) || 1);
            safe.hasWeed = !!safe.hasWeed;
            safe.mutations = Array.isArray(safe.mutations) ? safe.mutations.filter(mId => MUTATIONS[mId]).slice(0, 3) : [];
            safe.weight = clampTileWeight(safe);
            safe.weightMult = Math.max(0.5, Number(safe.weightMult) || 1);
            safe.sizeTier = ['small', 'normal', 'big', 'huge', 'titanic'].includes(safe.sizeTier)
                ? sizeTierFromWeight(safe.weight, safe.sizeTier === 'titanic')
                : sizeTierFromWeight(safe.weight);
            // Older saves stored the previous oversized scale, so always derive it from the new size table.
            safe.scale = visualScaleForWeight(safe.weight, safe.sizeTier);
            safe.beeLock = Math.max(0, Math.floor(Number(safe.beeLock) || 0));
            safe.ghostEchoPercent = Math.max(0, Math.min(1, Number(safe.ghostEchoPercent) || 0));
            safe.ghostMarked = !!safe.ghostMarked;
            safe.ghostCopyMutationCount = Math.max(0, Math.min(3, Math.floor(Number(safe.ghostCopyMutationCount) || 0)));
            safe.ghostEcho = !!safe.ghostEcho || safe.ghostValue > 0;
            safe.ghostValue = Math.max(0, Math.floor(Number(safe.ghostValue) || 0));
            return safe;
        });
    }

    window.addEventListener('load', init);
