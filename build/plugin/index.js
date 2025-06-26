"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withAppDataSharingAndroid = exports.withAppDataSharing = void 0;
const config_plugins_1 = require("expo/config-plugins");
/**
 * Adds custom `<queries>` entries to the AndroidManifest.xml.
 * This function ensures that a `<package>` array exists within `<queries>`.
 * It adds specified package names to the `<queries>` section, avoiding duplicates.
 */
const addCustomQueries = (androidManifest, packages) => {
    var _a;
    if (!androidManifest.manifest.queries) {
        androidManifest.manifest.queries = [];
    }
    // Ensure `package` array exists inside `queries`
    const packageQueryIndex = androidManifest.manifest.queries.findIndex((q) => q.package);
    if (packageQueryIndex === -1) {
        androidManifest.manifest.queries.push({ package: [] });
    }
    const defaultPackages = ['${applicationId}'];
    const allPackages = [...new Set([...defaultPackages, ...packages])];
    const packageQuery = androidManifest.manifest.queries.find((q) => q.package);
    const existingPackageNames = ((_a = packageQuery === null || packageQuery === void 0 ? void 0 : packageQuery.package) === null || _a === void 0 ? void 0 : _a.map((pkg) => { var _a; return (_a = pkg.$) === null || _a === void 0 ? void 0 : _a['android:name']; })) || [];
    const existingPackages = new Set(existingPackageNames);
    const newPackages = allPackages
        .filter((pkg) => !Array.from(existingPackages).includes(pkg))
        .map((pkg) => ({ $: { 'android:name': pkg } }));
    if (packageQuery === null || packageQuery === void 0 ? void 0 : packageQuery.package) {
        packageQuery.package.push(...newPackages);
    }
    return androidManifest;
};
/**
 * Helper function to add permissions dynamically.
 */
const addUsesPermissions = (androidManifest, permissions, permissionTemplate = '.permission.READ_SHARED_PREFS') => {
    if (!androidManifest.manifest['uses-permission']) {
        androidManifest.manifest['uses-permission'] = [];
    }
    // Check if the permission already exists
    const existingUsesPermissions = androidManifest.manifest['uses-permission']
        .map((p) => p.$['android:name']);
    // Add the permission if it doesn't exist
    permissions.forEach((permission) => {
        const permissionName = `${permission}${permissionTemplate}`;
        if (!existingUsesPermissions.includes(permissionName)) {
            androidManifest.manifest['uses-permission'].push({
                $: {
                    'android:name': permissionName,
                },
            });
        }
    });
    return androidManifest;
};
/**
 * Helper function to add custom `<permission>` and `<provider>` entries.
 */
const addCustomEntriesToManifest = (androidManifest, options = {}) => {
    var _a, _b;
    const appIdPlaceholder = '${applicationId}';
    const manifestApplication = androidManifest.manifest.application;
    const permissionName = options.permissionName || `${appIdPlaceholder}.permission.READ_SHARED_PREFS`;
    const providerAuthority = options.providerAuthority || `${appIdPlaceholder}.sharedpreferencesprovider`;
    // Define the custom permission
    const permission = {
        $: {
            'android:name': permissionName,
            'android:protectionLevel': 'normal',
        },
    };
    // Add the permission to <manifest>
    if (!androidManifest.manifest.permission) {
        androidManifest.manifest.permission = [];
    }
    // Check if the permission already exists
    const existingPermissions = androidManifest.manifest.permission
        .map((p) => p.$['android:name']);
    // Add the permission if it doesn't exist
    if (!existingPermissions.includes(permission.$['android:name'])) {
        androidManifest.manifest.permission.push(permission);
    }
    // Add the provider entry to <application>
    const provider = {
        $: {
            'android:name': 'com.data.SharedPreferencesProvider',
            'android:authorities': providerAuthority,
            'android:permission': permissionName,
            'android:enabled': 'true',
            'android:exported': 'true',
        },
    };
    // Add the provider to <application>
    const appWithProvider = manifestApplication === null || manifestApplication === void 0 ? void 0 : manifestApplication[0];
    if (!(appWithProvider === null || appWithProvider === void 0 ? void 0 : appWithProvider.provider)) {
        if (appWithProvider) {
            appWithProvider.provider = [];
        }
    }
    // Check if the provider already exists
    const existingProviders = ((_a = appWithProvider === null || appWithProvider === void 0 ? void 0 : appWithProvider.provider) === null || _a === void 0 ? void 0 : _a.map((p) => p.$['android:name'])) || [];
    // Add the provider if it doesn't exist
    if (!existingProviders.includes(provider.$['android:name'])) {
        (_b = appWithProvider === null || appWithProvider === void 0 ? void 0 : appWithProvider.provider) === null || _b === void 0 ? void 0 : _b.push(provider);
    }
    return androidManifest;
};
/**
 * Plugin function to modify the AndroidManifest.xml for app data sharing.
 */
const withAppDataSharingAndroid = (config, props = {}) => {
    const { appsBundleIds = [] } = props;
    const bundleIds = [...new Set(appsBundleIds)];
    return (0, config_plugins_1.withAndroidManifest)(config, (androidConfig) => {
        androidConfig.modResults = addUsesPermissions(androidConfig.modResults, bundleIds);
        androidConfig.modResults = addCustomEntriesToManifest(androidConfig.modResults);
        androidConfig.modResults = addCustomQueries(androidConfig.modResults, bundleIds);
        return androidConfig;
    });
};
exports.withAppDataSharingAndroid = withAppDataSharingAndroid;
/**
 * Main plugin function that applies all platform modifications for app data sharing.
 *
 * This plugin configures:
 * - Android: SharedPreferences provider, permissions, and queries for cross-app data sharing
 *
 * @param config - The Expo app configuration
 * @param props - Plugin configuration properties
 * @returns Modified configuration with app data sharing capabilities
 *
 * @example
 * ```json
 * {
 *   "plugins": [
 *     [
 *       "react-native-app-data-sharing",
 *       {
 *         "appsBundleIds": ["com.example.app2"]
 *       }
 *     ]
 *   ]
 * }
 * ```
 */
const withAppDataSharing = (config, props = {}) => {
    // Apply Android configuration
    config = withAppDataSharingAndroid(config, props);
    return config;
};
exports.withAppDataSharing = withAppDataSharing;
exports.default = withAppDataSharing;
