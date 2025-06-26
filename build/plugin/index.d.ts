import { ConfigPlugin } from 'expo/config-plugins';
/**
 * Plugin configuration options for react-native-app-data-sharing
 */
export interface AppDataSharingPluginProps {
    /**
     * Array of bundle IDs for Android apps to share data with except the current app
     * @example ['com.example.app2']
     */
    appsBundleIds?: string[];
}
/**
 * Android manifest types for better type safety
 */
export interface AndroidManifestPermission {
    $: {
        'android:name': string;
        'android:protectionLevel'?: string;
    };
}
export interface AndroidManifestUsesPermission {
    $: {
        'android:name': string;
    };
}
export interface AndroidManifestProvider {
    $: {
        'android:name': string;
        'android:authorities': string;
        'android:permission': string;
        'android:enabled': string;
        'android:exported': string;
    };
}
export interface AndroidManifestPackage {
    $: {
        'android:name': string;
    };
}
export interface AndroidManifestQueries {
    package?: AndroidManifestPackage[];
}
/**
 * Extended ManifestApplication type to include provider
 */
export interface ExtendedManifestApplication {
    provider?: AndroidManifestProvider[];
    [key: string]: any;
}
/**
 * Plugin function to modify the AndroidManifest.xml for app data sharing.
 */
declare const withAppDataSharingAndroid: ConfigPlugin<AppDataSharingPluginProps>;
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
declare const withAppDataSharing: ConfigPlugin<AppDataSharingPluginProps>;
export default withAppDataSharing;
export { withAppDataSharing, withAppDataSharingAndroid };
