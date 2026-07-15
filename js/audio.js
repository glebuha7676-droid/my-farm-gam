const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const activeSfx = new Map();
    const fileSfx = {
        magmaMutation: 'assets/bcd218f4af76d0e.mp3'
    };
    const sfx = {
        play: (type, restartKey = '') => {
            if (fileSfx[type]) {
                const clip = new Audio(fileSfx[type]);
                clip.preload = 'auto';
                clip.volume = 0.78;
                clip.play().catch(() => {});
                return;
            }
            if (audioCtx.state === 'suspended') audioCtx.resume();
            if (restartKey && activeSfx.has(restartKey)) {
                const previous = activeSfx.get(restartKey);
                try { previous.stop(); } catch (_) {}
                activeSfx.delete(restartKey);
            }
            const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination); const now = audioCtx.currentTime;
            if (restartKey) {
                activeSfx.set(restartKey, osc);
                osc.addEventListener('ended', () => {
                    if (activeSfx.get(restartKey) === osc) activeSfx.delete(restartKey);
                }, { once: true });
            }
            
            if (type === 'pop') { osc.type = 'sine'; osc.frequency.setValueAtTime(400, now); osc.frequency.exponentialRampToValueAtTime(600, now+0.1); gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.1); osc.start(now); osc.stop(now+0.1); }
            else if (type === 'coin') { osc.type = 'sine'; osc.frequency.setValueAtTime(1200, now); osc.frequency.setValueAtTime(1600, now+0.05); gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.2); osc.start(now); osc.stop(now+0.2); }
            else if (type === 'coinSoft') { osc.type = 'sine'; osc.frequency.setValueAtTime(1050, now); osc.frequency.exponentialRampToValueAtTime(1550, now+0.06); gain.gain.setValueAtTime(0.035, now); gain.gain.exponentialRampToValueAtTime(0.005, now+0.16); osc.start(now); osc.stop(now+0.17); }
            else if (type === 'mut') { osc.type = 'square'; osc.frequency.setValueAtTime(400, now); osc.frequency.linearRampToValueAtTime(1200, now+0.4); gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.4); osc.start(now); osc.stop(now+0.4); }
            else if (type === 'error') { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(100, now+0.2); gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.2); osc.start(now); osc.stop(now+0.2); }
            else if (type === 'thunder') { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, now); osc.frequency.exponentialRampToValueAtTime(10, now+0.8); gain.gain.setValueAtTime(0.4, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.8); osc.start(now); osc.stop(now+0.8); }
            else if (type === 'holy') { osc.type = 'sine'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(1600, now+1); gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.2, now+0.2); gain.gain.linearRampToValueAtTime(0, now+1); osc.start(now); osc.stop(now+1); }
            else if (type === 'hell') { osc.type = 'square'; osc.frequency.setValueAtTime(60, now); osc.frequency.exponentialRampToValueAtTime(20, now+1.5); gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now+1.5); osc.start(now); osc.stop(now+1.5); }
            else if (type === 'magmaRumble') {
                osc.type = 'sawtooth'; osc.frequency.setValueAtTime(54, now); osc.frequency.exponentialRampToValueAtTime(31, now + 1.8);
                gain.gain.setValueAtTime(.09, now); gain.gain.exponentialRampToValueAtTime(.008, now + 1.8);
                const undertone = audioCtx.createOscillator(); const undertoneGain = audioCtx.createGain();
                undertone.type = 'sine'; undertone.frequency.setValueAtTime(82, now); undertone.frequency.exponentialRampToValueAtTime(48, now + 1.75);
                undertoneGain.gain.setValueAtTime(.035, now); undertoneGain.gain.exponentialRampToValueAtTime(.003, now + 1.75);
                undertone.connect(undertoneGain); undertoneGain.connect(audioCtx.destination);
                osc.start(now); undertone.start(now); osc.stop(now + 1.8); undertone.stop(now + 1.8);
            }
            else if (type === 'lavaFlow') {
                osc.type = 'triangle'; osc.frequency.setValueAtTime(132, now); osc.frequency.exponentialRampToValueAtTime(54, now + 1.35);
                gain.gain.setValueAtTime(.075, now); gain.gain.linearRampToValueAtTime(.1, now + .22); gain.gain.exponentialRampToValueAtTime(.006, now + 1.35);
                osc.start(now); osc.stop(now + 1.35);
            }
            else if (type === 'lavaRise') { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(74, now); osc.frequency.exponentialRampToValueAtTime(142, now + .48); gain.gain.setValueAtTime(.06, now); gain.gain.exponentialRampToValueAtTime(.006, now + .56); osc.start(now); osc.stop(now + .56); }
            else if (type === 'lavaBubble') { osc.type = 'sine'; osc.frequency.setValueAtTime(116, now); osc.frequency.exponentialRampToValueAtTime(188, now + .08); osc.frequency.exponentialRampToValueAtTime(78, now + .34); gain.gain.setValueAtTime(.08, now); gain.gain.exponentialRampToValueAtTime(.006, now + .38); osc.start(now); osc.stop(now + .4); }
            else if (type === 'lavaCool') { osc.type = 'triangle'; osc.frequency.setValueAtTime(164, now); osc.frequency.exponentialRampToValueAtTime(68, now + .6); gain.gain.setValueAtTime(.045, now); gain.gain.exponentialRampToValueAtTime(.003, now + .62); osc.start(now); osc.stop(now + .64); }
            else if (type === 'cometImpact') {
                osc.type = 'sine'; osc.frequency.setValueAtTime(420, now); osc.frequency.exponentialRampToValueAtTime(1180, now + .08); osc.frequency.exponentialRampToValueAtTime(260, now + .5);
                gain.gain.setValueAtTime(.14, now); gain.gain.exponentialRampToValueAtTime(.005, now + .58);
                const shimmer = audioCtx.createOscillator(); const shimmerGain = audioCtx.createGain();
                shimmer.type = 'triangle'; shimmer.frequency.setValueAtTime(980, now); shimmer.frequency.exponentialRampToValueAtTime(1680, now + .13); shimmer.frequency.exponentialRampToValueAtTime(700, now + .46);
                shimmerGain.gain.setValueAtTime(.055, now); shimmerGain.gain.exponentialRampToValueAtTime(.003, now + .5);
                shimmer.connect(shimmerGain); shimmerGain.connect(audioCtx.destination);
                osc.start(now); shimmer.start(now); osc.stop(now + .6); shimmer.stop(now + .52);
            }
            else if (type === 'bee') { osc.type = 'triangle'; osc.frequency.setValueAtTime(200, now); osc.frequency.setValueAtTime(220, now+0.1); gain.gain.setValueAtTime(0.1, now); osc.frequency.exponentialRampToValueAtTime(200, now+0.2); osc.start(now); osc.stop(now+0.2); gain.gain.linearRampToValueAtTime(0, now+0.2);}
            else if (type === 'candy') { osc.type = 'sine'; osc.frequency.setValueAtTime(1000, now); osc.frequency.exponentialRampToValueAtTime(2000, now+0.1); gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.1); osc.start(now); osc.stop(now+0.1); }
            else if (type === 'popit') { osc.type = 'triangle'; osc.frequency.setValueAtTime(180, now); osc.frequency.exponentialRampToValueAtTime(520, now+0.045); osc.frequency.exponentialRampToValueAtTime(120, now+0.13); gain.gain.setValueAtTime(0.16, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.14); osc.start(now); osc.stop(now+0.14); }
            else if (type === 'popitClick') { osc.type = 'triangle'; osc.frequency.setValueAtTime(190, now); osc.frequency.exponentialRampToValueAtTime(560, now+0.04); osc.frequency.exponentialRampToValueAtTime(130, now+0.12); gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.13); osc.start(now); osc.stop(now+0.13); }
            else if (type === 'popitWater') { osc.type = 'sine'; osc.frequency.setValueAtTime(240, now); osc.frequency.exponentialRampToValueAtTime(720, now+0.05); osc.frequency.exponentialRampToValueAtTime(180, now+0.17); gain.gain.setValueAtTime(0.13, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.18); osc.start(now); osc.stop(now+0.18); }
            else if (type === 'popitHarvest') { osc.type = 'triangle'; osc.frequency.setValueAtTime(260, now); osc.frequency.exponentialRampToValueAtTime(920, now+0.06); osc.frequency.exponentialRampToValueAtTime(210, now+0.2); gain.gain.setValueAtTime(0.16, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.22); osc.start(now); osc.stop(now+0.22); }
            else if (type === 'bigHarvest') { osc.type = 'triangle'; osc.frequency.setValueAtTime(360, now); osc.frequency.exponentialRampToValueAtTime(1050, now+0.08); osc.frequency.exponentialRampToValueAtTime(520, now+0.24); gain.gain.setValueAtTime(0.18, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.28); osc.start(now); osc.stop(now+0.28); }
            else if (type === 'hugeHarvest') { osc.type = 'square'; osc.frequency.setValueAtTime(180, now); osc.frequency.exponentialRampToValueAtTime(1280, now+0.16); osc.frequency.exponentialRampToValueAtTime(420, now+0.45); gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.5); osc.start(now); osc.stop(now+0.5); }
            else if (type === 'titanicHarvest') { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(110, now); osc.frequency.exponentialRampToValueAtTime(1500, now+0.18); osc.frequency.exponentialRampToValueAtTime(280, now+0.62); gain.gain.setValueAtTime(0.24, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.68); osc.start(now); osc.stop(now+0.68); }
            else if (type === 'blop') { osc.type = 'sine'; osc.frequency.setValueAtTime(170, now); osc.frequency.exponentialRampToValueAtTime(430, now+0.07); osc.frequency.exponentialRampToValueAtTime(210, now+0.18); gain.gain.setValueAtTime(0.18, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.2); osc.start(now); osc.stop(now+0.2); }
            else if (type === 'slime') { osc.type = 'sine'; osc.frequency.setValueAtTime(260, now); osc.frequency.exponentialRampToValueAtTime(520, now+0.08); osc.frequency.exponentialRampToValueAtTime(330, now+0.2); gain.gain.setValueAtTime(0.13, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.22); osc.start(now); osc.stop(now+0.22); }
        }
    };
