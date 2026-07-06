export const APP_DOMAIN = 'app.rewardmate.com.au';
export const LANDING_DOMAIN = 'rewardmate.com.au';

export function isAppDomain(): boolean {
    const hostname = window.location.hostname;
    const cleanHostname = hostname.replace(/^www\./, '');

    // Allow testing locally on localhost, 127.0.0.1, or sub-routing
    return cleanHostname === APP_DOMAIN ||
        cleanHostname === 'localhost' ||
        cleanHostname === '127.0.0.1' ||
        cleanHostname === 'app.localhost' ||
        cleanHostname.startsWith('app.') ||
        // Support path-based routing check in local dev so we can easily toggle views
        window.location.search.includes('domain=app') ||
        window.localStorage.getItem('simulate_app_subdomain') === 'true';
}

export function getAppUrl(path: string = '/'): string {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Local simulation path override
        return `${path}?domain=app`;
    }

    return `${protocol}//${APP_DOMAIN}${path}`;
}

export function getLandingUrl(path: string = '/'): string {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return path;
    }

    return `${protocol}//${LANDING_DOMAIN}${path}`;
}
