let player = {
        coins: 50, lvl: 1, xp: 0, xpNeed: 100,
        rares: {}, unlockedMutations: [],
        pets: [], petLevels: {}, petInventory: [], equippedPets: [null, null, null], unlockedPetSlots: 1,
        incubator: [null, null, null], quests: [], lastSaved: Date.now(), bank: 0,
        plotStyle: 'default', ownedDecor: ['default'], decorPaintColor: '#ff7675',
        showcase: [null, null, null],
        stats: { totalEarned: 0, maxWeight: 0, bestSale: 0, harvested: 0 }
    };

    let env = { ticks: 0, currentEvent: 'day', eventTimer: 0, potTimer: 0, potActive: false, activeNest: 0, activeEquip: 0, petPatCooldowns: {}, openMenuSections: { diary: false, pets: false, decor: false }, backroomsLampTimer: null, backroomsLampEndTimer: null };
    let eventActions = []; 
    let tiles = Array(12).fill().map((_, i) => ({ id: i, active: false, plantId: null, growth: 0, water: 0, hasWeed: false, mutations: [], scale: 1, weight: 5, weightMult: 1, sizeTier: 'normal', beeLock: 0 }));
    let currentTool = 'water';
    const TEST_HATCH_INSTANT = true;
    const BIG_CROP_CHANCE = 0.08;
    const HUGE_CROP_CHANCE = 0.01;
    
    const seedKeys = Object.keys(PLANTS);
    const DECOR_PAINT_COLORS = ['#ff7675', '#fdcb6e', '#55efc4', '#74b9ff', '#a29bfe', '#2ecc71'];
    const SIZE_DIARY_ENTRIES = {
        big: { id: 'big', name: 'Большой', icon: 'B', mult: 'x1.5+' },
        huge: { id: 'huge', name: 'Огромный', icon: '!', mult: 'x3.5+' }
    };

    function getHelperCost() {
        const ownedCount = player.petInventory ? player.petInventory.length : player.pets.length;
        return BALANCE.magicSeedCost + ownedCount * BALANCE.helperCostStep;
    }

    function getBuffs() {
        const buffs = { speedMult: 0, coinMult: 0, mutChance: 0, weightMult: 0 };
        (player.equippedPets || []).forEach(uid => {
            const pet = getPetInstance(uid);
            if (!pet) return;
            const def = PET_DEFS[pet.id];
            if (def) applyPetBuff(buffs, def, getPetPowerMult(pet));
        });
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
        const mutationMult = (mutations || []).reduce((sum, mId) => {
            const m = MUTATIONS[mId];
            return sum + (m ? m.mult - 1 : 0);
        }, 1);
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
        return `
            <div class="showcase-crop-art showcase-plant-preview tile occupied ready crop-${crop.sizeTier || 'normal'} ${mutClasses} ${primary}" style="--plant-scale:${scale}; --crop-color:${p.color};">
                <span class="showcase-glow"></span>
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
        renderGarden();
        renderSeeds();
        generateQuestsIfNeeded();
        calcOfflineBank();
        updateUI();
        document.getElementById('seeds-window').addEventListener('scroll', updateCarouselArrows);
        document.getElementById('garden').addEventListener('pointerdown', handleGardenDecorTap);
        setInterval(gameTick, 1000);
        setInterval(saveGame, 5000);
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
        container.innerHTML = '';
        seedKeys.forEach(key => {
            const p = PLANTS[key];
            const locked = player.lvl < p.lvl;
            const el = document.createElement('div');
            el.className = `seed-packet ${locked ? 'locked' : ''} ${currentTool === p.id ? 'active' : ''}`;
            el.style.setProperty('--pkt-color', p.color);
            el.onclick = () => { if(locked) { showToast(`Нужен уровень ${p.lvl}`, 'gray'); return; } selectAction(p.id); };
            el.innerHTML = `<div class="pkt-top"></div><div class="pkt-bg"></div><div class="seed-name">${p.name}</div><div class="seed-icon">${seedIcon(p.id)}</div><div class="seed-price">${p.cost}$</div>`;
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
        currentTool = tool; decorSfx('pop', 'popitClick');
        document.querySelectorAll('.action-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tool === tool));
        renderSeeds();
    }

    function handleInteract(idx) {
        const t = tiles[idx];
        if (t.hasWeed) { t.hasWeed = false; decorSfx('pop', 'popitClick'); showToast("🐛 Паразит изгнан!", "#00b894"); updateTileDOM(idx); updateQuest('clear_weeds', 1); return; }
        if (currentTool === 'shovel') { if (t.active) { clearTile(idx); decorSfx('error', 'popitClick'); floatText(idx, "Очищено", "gray"); } else decorSfx('pop', 'popitClick'); return; }
        if (currentTool === 'water') { if (t.active && t.growth < 100) { t.water = 100; decorSfx('pop', 'popitWater'); floatText(idx, "💧", "#74b9ff"); updateTileDOM(idx); updateQuest('water_plants', 1); } else decorSfx('pop', 'popitClick'); return; }
        if (currentTool === 'harvest') { if (t.active && t.growth >= 100) harvestPlant(idx); else decorSfx('pop', 'popitClick'); return; }

        if (PLANTS[currentTool]) {
            if (t.active) { decorSfx('pop', 'popitClick'); return; }
            const p = PLANTS[currentTool];
            if (player.coins < p.cost) { showToast("Нет монет!", "#ff7675"); sfx.play('error'); return; }
            player.coins -= p.cost;
            const cropWeight = rollCropWeight();
            t.active = true; t.plantId = p.id; t.growth = 0; t.water = 0; t.hasWeed = false; t.mutations = []; t.beeLock = 0;
            t.weight = cropWeight.weight; t.weightMult = cropWeight.weightMult; t.sizeTier = cropWeight.tier; t.scale = cropWeight.scale;
            decorSfx('pop', 'popitClick'); floatText(idx, `-${p.cost}$`, "#ff7675");
            updateUI(); updateTileDOM(idx);
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
                totalMult += (m.mult - 1); 
                highestColor = m.color;
                updateQuest('find_mut', 1);
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
            player.lvl++; player.xp -= player.xpNeed; player.xpNeed = Math.floor(player.xpNeed * 1.5);
            showToast(`УРОВЕНЬ ${player.lvl}! 🎉`, "#a29bfe"); renderSeeds();
        }

        playHarvestSfx(sizeTier);
        showHarvestSizeEffect(idx, sizeTier);
        let multText = totalMult > 1 ? `<span style="font-size:16px; color:${highestColor}">x${totalMult.toFixed(1)}</span><br>` : '';
        floatText(idx, `${multText}+${finalReward}$<br><span style="font-size:14px">⚖️ ${formatWeight(actualWeight)}кг · x${weightMult}</span>`, highestColor);
        if (p.id === 'carrot') updateQuest('grow_carrot', 1);
        updateQuest('earn_coins', finalReward);
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
        tiles[idx].active = false; tiles[idx].plantId = null; tiles[idx].growth = 0; tiles[idx].hasWeed = false; tiles[idx].mutations = []; tiles[idx].scale = 1; tiles[idx].weight = 5; tiles[idx].weightMult = 1; tiles[idx].sizeTier = 'normal'; tiles[idx].beeLock = 0;
        updateTileDOM(idx);
    }

    function startEvent(type) {
        env.currentEvent = type;
        document.body.className = type === 'day' ? '' : `event-${type}`;
        const emitters = document.getElementById('bg-emitters'); emitters.innerHTML = '';

        let indicator = document.getElementById('state-indicator');
        if (type === 'day') indicator.innerHTML = '☀️ День';
        else if (type === 'rain') indicator.innerHTML = '🌧️ Дождь';
        else if (type === 'storm') indicator.innerHTML = '⚡ Буря';
        else if (type === 'toxic') indicator.innerHTML = '☣️ Токсины';
        else if (type === 'starfall') { indicator.innerHTML = '🌠 Звездопад'; showToast("Магия звезд!", "#a29bfe"); createBgParticles(['⭐'], 'bgFlyStar'); }
        else if (type === 'holy') { indicator.innerHTML = '🔆 Солнце'; showToast("Солнечный луч!", "#f5f6fa"); }
        else if (type === 'hell') { indicator.innerHTML = '🔥 Жар'; showToast("Теплый вихрь!", "#e84118"); createBgParticles(['■'], 'bgFlyAsh'); }
        else if (type === 'candy') { indicator.innerHTML = '🍬 Сладости'; showToast("Конфетный дождь!", "#ff9ff3"); createBgParticles(['🍬','🍭','🍩','🍪'], 'bgFlyCandy'); }
        else if (type === 'bee') { indicator.innerHTML = '🐝 Пчелы'; showToast("Жужжание повсюду!", "#f9ca24"); createBgParticles(['🐝'], 'bgFlyBee'); }
        else if (type === 'alien') { indicator.innerHTML = '🛸 Вторжение'; showToast("Инопланетное вторжение!", "#40ffd2"); createBgParticles(['🛸'], 'bgFlyUfo'); }

        if (type === 'day') { env.eventTimer = 0; eventActions = []; return; }
        
        env.eventTimer = 15; eventActions = [];
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
        
        if (env.eventTimer > 0) {
            env.eventTimer--;
            eventActions.forEach(act => {
                if (env.eventTimer <= act.time && !act.done) {
                    act.done = true; applyEventMutation(act.tileId, act.mut);
                }
            });
            if (env.eventTimer <= 0) startEvent('day');
        } else {
            if (Math.random() < BALANCE.autoEventChance && env.ticks % 10 === 0) {
                let r = Math.random();
                if (r < 0.3) Math.random() < 0.35 ? startEvent('storm') : startEvent('rain');
                else if (r < 0.5) startEvent('toxic');
                else if (r < 0.65) startEvent('starfall');
        else if (r < 0.8) startEvent('holy');
        else if (r < 0.9) startEvent('hell');
        else if (r < 0.95) startEvent('candy');
                else if (r < 0.985) startEvent('bee');
                else startEvent('alien');
            }
        }

        updateIncubatorAndPets();

        let buffs = getBuffs();

        tiles.forEach((t, idx) => {
            if (!t.active || t.growth >= 100) return;
            if (t.beeLock > 0) { t.beeLock--; return; }
            if (!t.hasWeed && env.currentEvent === 'day' && Math.random() < BALANCE.weedChance) { t.hasWeed = true; updateTileDOM(idx); return; }
            if (t.hasWeed) return;

            const p = PLANTS[t.plantId];
            let speed = 1 + buffs.speedMult;
            if (t.water > 0) speed *= 2;
            if (env.currentEvent === 'rain' || env.currentEvent === 'storm') speed *= 3;

            t.growth = Math.min(100, t.growth + (100 / p.time) * speed);
            t.water = Math.max(0, t.water - 5);

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
        
        fill.style.width = `${t.growth}%`;
        
        // Пересобираем классы
        el.className = 'tile';
        if (t.active) el.classList.add('occupied');
        if (t.water > 0) el.classList.add('wet');
        if (t.hasWeed) el.classList.add('has-weed');
        if (t.growth >= 100) el.classList.add('ready');
        if (t.beeLock > 0) el.classList.add('bee-arrived'); 
        if (t.active && t.sizeTier) el.classList.add(`crop-${t.sizeTier}`);

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
        document.getElementById('menu-badge').style.display = hasDoneQuests ? 'block' : 'none';
        renderQuests();
        renderPets();
        renderDecorShop();
        renderShowcase();
        renderDiary();
        applyDecorStyle();
    }

    function toggleMenu() { document.getElementById('side-menu').classList.toggle('open'); updateUI(); }

    function renderShowcase() {
        if (!Array.isArray(player.showcase)) player.showcase = [null, null, null];
        player.showcase = [player.showcase[0] || null, player.showcase[1] || null, player.showcase[2] || null];
        const slots = document.getElementById('showcase-slots');
        const rate = document.getElementById('showcase-rate');
        const bank = document.getElementById('bank-coins');
        if (!slots || !rate || !bank) return;

        slots.innerHTML = player.showcase.map((crop, slot) => {
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
        if (section === 'pets' && env.openMenuSections[section]) renderPets();
        if (section === 'decor' && env.openMenuSections[section]) renderDecorShop();
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
            <div class="diary-stat"><span>$</span><strong>${compactNumber(player.stats.totalEarned)}</strong><small>заработано всего</small></div>
            <div class="diary-stat"><span>⚖</span><strong>${formatWeight(player.stats.maxWeight)}кг</strong><small>самый большой вес</small></div>
            <div class="diary-stat"><span>★</span><strong>${compactNumber(player.stats.bestSale)}$</strong><small>самая дорогая продажа</small></div>
            <div class="diary-stat"><span>✓</span><strong>${compactNumber(player.stats.harvested)}</strong><small>собрано растений</small></div>
        `;

        mutsEl.innerHTML = diaryEntries().map(entry => {
            const count = player.rares[entry.id] || 0;
            const unlocked = count > 0;
            return `<div class="diary-mut-card ${unlocked ? 'unlocked' : 'locked'}" style="--mut-color:${MUTATIONS[entry.id]?.color || '#ffd166'}">
                <div class="diary-mut-icon">${unlocked ? entry.icon : '?'}</div>
                <div class="diary-mut-info">
                    <b>${unlocked ? entry.name : '???'}</b>
                    <span>${unlocked ? entry.mult : 'x?'}</span>
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
            return `<div class="decor-card ${active ? 'active' : ''} style-${style.id}">
                <div class="decor-preview"></div>
                <b>${style.name}</b>
                <small>${style.desc}</small>
                ${style.cost > 0 && !bought ? `<em>${style.cost}$</em>` : ''}
                <button type="button" class="decor-buy ${active ? 'selected' : ''}" onclick="buyOrSelectDecor('${style.id}')">${active ? 'Выбран' : bought ? 'Выбрать' : 'Купить'}</button>
            </div>`;
        }).join('');
    }

    function buyOrSelectDecor(styleId) {
        const style = DECOR_STYLES[styleId];
        if (!style) return;
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
        document.getElementById('mut-text').innerHTML = `${m.name}! <br><span style="font-size:20px; color:${m.color};">x${m.mult} Доход</span>`;
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
        if (player.petInventory.length >= 8) { showToast("Освободи место в инвентаре", "#ff7675"); return; }
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
        const costs = [0, 2500, 12000];
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
        if (!list || !shop || !nestView || !dots || !equipSlots) return;

        shop.innerHTML = Object.values(EGG_RARITIES).map(egg => `
            <button class="egg-buy rarity-${egg.id} ${egg.locked ? 'locked' : ''}" ${egg.locked ? 'disabled' : ''} onclick="startEgg('${egg.id}')">
                <span class="egg-model egg-${egg.id}"></span><b>${egg.label}</b><small>${egg.locked ? 'Скоро' : `${egg.cost}$ • ${Math.floor(egg.hatchSeconds / 60)} мин`}</small>
            </button>`).join('');

        const activeSlotUnlocked = env.activeEquip < player.unlockedPetSlots;
        const activeUid = player.equippedPets[env.activeEquip];
        const activePet = activeUid ? getPetInstance(activeUid) : null;
        const activeDef = activePet ? PET_DEFS[activePet.id] : null;
        if (!activeSlotUnlocked) {
            const costs = [0, 2500, 12000];
            nestView.innerHTML = `<div class="slime-showcase locked"><div class="big-lock">🔒</div><div class="nest-info"><b>Слот ${env.activeEquip + 1} закрыт</b><span>Открыть за ${costs[env.activeEquip]}$</span></div><button class="pot-btn" onclick="unlockPetSlot(${env.activeEquip})">Открыть</button></div>`;
        } else if (!activePet || !activeDef) {
            nestView.innerHTML = `<div class="slime-showcase empty"><div class="big-egg empty">＋</div><div class="nest-info"><b>СЛОТ ${env.activeEquip + 1}</b><span>Нажми галочку у слайма</span></div></div>`;
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

        const inventory = player.petInventory.slice(0, 8);
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
        const emptySlotsHtml = Array.from({ length: Math.max(0, 8 - inventory.length) }, (_, i) => `<div class="pet-card mini-pet-card inventory-empty"><div class="mini-pet-portrait">＋</div><span>Место ${inventory.length + i + 1}</span></div>`).join('');
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
        if (player.bank > 0) {
            player.coins += player.bank; ensureStats(); player.stats.totalEarned += Math.max(0, player.bank || 0); sfx.play('coin'); showToast(`Собрано ${player.bank} монет!`, "#f1c40f");
            player.bank = 0; updateUI();
        }
    }

    function saveGame() {
        try {
            player.lastSaved = Date.now();
            localStorage.setItem('FarmMobileV2', JSON.stringify({ player }));
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
                if (!player.rares) player.rares = {};
                if (!player.quests) player.quests = [];
                if (!player.unlockedMutations) player.unlockedMutations = [];
                if (!player.stats) player.stats = { totalEarned: 0, maxWeight: 0, bestSale: 0, harvested: 0 };
                if (!player.xpNeed) player.xpNeed = 100;
            }
        } catch (error) {
            console.warn('Не удалось загрузить сохранение', error);
        }
        normalizePetState();
        renderPets();
    }

    function normalizePetState() {
        ensureStats();
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
        player.petInventory = player.petInventory.slice(0, 8);
        player.equippedPets = player.equippedPets.map((uid, i) => i < player.unlockedPetSlots && player.petInventory.some(p => p.uid === uid) ? uid : null);
        if (!player.equippedPets[0] && player.petInventory[0]) player.equippedPets[0] = player.petInventory[0].uid;
    }

    window.addEventListener('load', init);
