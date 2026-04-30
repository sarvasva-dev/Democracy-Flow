import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";
import { getPerformance } from "firebase/performance";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

const requiredKeys = ["apiKey", "projectId", "appId"];
let appInstance = null;
let analyticsInstance = null;
let initPromise = null;

const hasRequiredConfig = () => requiredKeys.every((key) => Boolean(firebaseConfig[key]));

export const initGoogleServices = async () => {
    if (initPromise) return initPromise;

    initPromise = (async () => {
        if (!hasRequiredConfig() || typeof window === "undefined") {
            return { enabled: false, reason: "Missing Firebase web config" };
        }

        appInstance = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

        try {
            getPerformance(appInstance);
        } catch (error) {
            console.info("Firebase Performance unavailable in this environment.", error);
        }

        if (firebaseConfig.measurementId && await isSupported()) {
            analyticsInstance = getAnalytics(appInstance);
            logEvent(analyticsInstance, "app_open", {
                project: "democracy_flow",
                experience: "prompt_wars",
            });
        }

        return { enabled: true, analytics: Boolean(analyticsInstance) };
    })();

    return initPromise;
};

export const trackEvent = async (name, params = {}) => {
    await initGoogleServices();
    if (!analyticsInstance) return false;

    logEvent(analyticsInstance, name, {
        project: "democracy_flow",
        ...params,
    });
    return true;
};
