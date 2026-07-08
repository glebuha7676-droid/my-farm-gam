(function () {
    'use strict';

    const state = {
        status: 'idle',
        available: false,
        gameReady: false,
        gameplayActive: false,
        error: null
    };

    let sdk = null;
    let initPromise = null;
    let scriptPromise = null;

    function callFeature(featureName, methodName) {
        const method = sdk?.features?.[featureName]?.[methodName];
        if (typeof method !== 'function') return false;

        try {
            method.call(sdk.features[featureName]);
            return true;
        } catch (error) {
            console.warn(`[YandexGames] ${featureName}.${methodName} failed.`, error);
            return false;
        }
    }

    function loadSdkScript() {
        if (window.YaGames) return Promise.resolve();
        if (scriptPromise) return scriptPromise;

        scriptPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = window.YANDEX_GAMES_SDK_SRC || '/sdk.js';
            script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error('Yandex Games SDK script failed to load'));
            document.head.appendChild(script);
        });

        return scriptPromise;
    }

    async function init() {
        if (initPromise) return initPromise;

        initPromise = (async () => {
            if (window.location.protocol === 'file:') {
                state.status = 'local';
                return null;
            }

            state.status = 'loading';

            try {
                await loadSdkScript();
                if (!window.YaGames?.init) throw new Error('YaGames.init is unavailable');

                sdk = await window.YaGames.init();
                window.ysdk = sdk;
                state.available = true;
                state.status = 'ready';
                window.dispatchEvent(new CustomEvent('yandexgamesready', { detail: { sdk } }));
                return sdk;
            } catch (error) {
                state.status = 'unavailable';
                state.error = error;
                console.warn('[YandexGames] SDK is unavailable; local game mode remains active.', error);
                return null;
            }
        })();

        return initPromise;
    }

    async function gameplayStart() {
        const currentSdk = await init();
        if (!currentSdk || state.gameplayActive || document.hidden) return;

        state.gameplayActive = callFeature('GameplayAPI', 'start');
    }

    async function gameplayStop() {
        const currentSdk = await init();
        if (!currentSdk || !state.gameplayActive) return;

        callFeature('GameplayAPI', 'stop');
        state.gameplayActive = false;
    }

    async function gameReady() {
        if (state.gameReady) return;

        const currentSdk = await init();
        if (!currentSdk || state.gameReady) return;

        callFeature('LoadingAPI', 'ready');
        state.gameReady = true;
        await gameplayStart();
    }

    document.addEventListener('visibilitychange', () => {
        if (!state.gameReady) return;
        if (document.hidden) gameplayStop();
        else gameplayStart();
    });

    window.YandexGames = Object.freeze({
        init,
        gameReady,
        gameplayStart,
        gameplayStop,
        getSdk: () => sdk,
        getState: () => ({ ...state })
    });

    init();
})();
