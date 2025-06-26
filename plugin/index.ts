import { ConfigPlugin, withAndroidManifest, AndroidConfig } from 'expo/config-plugins';

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
 * Adds custom `<queries>` entries to the AndroidManifest.xml.
 * This function ensures that a `<package>` array exists within `<queries>`.
 * It adds specified package names to the `<queries>` section, avoiding duplicates.
 */
const addCustomQueries = (
  androidManifest: AndroidConfig.Manifest.AndroidManifest,
  packages: string[]
): AndroidConfig.Manifest.AndroidManifest => {
  if (!androidManifest.manifest.queries) {
    androidManifest.manifest.queries = [];
  }

  // Ensure `package` array exists inside `queries`
  const packageQueryIndex = androidManifest.manifest.queries.findIndex(
    (q: AndroidManifestQueries) => q.package
  );

  if (packageQueryIndex === -1) {
    androidManifest.manifest.queries.push({ package: [] });
  }

  const defaultPackages = ['${applicationId}'];
  const allPackages = [...new Set([...defaultPackages, ...packages])];

  const packageQuery = androidManifest.manifest.queries.find(
    (q: AndroidManifestQueries) => q.package
  ) as AndroidManifestQueries;

  const existingPackageNames = packageQuery?.package?.map((pkg: AndroidManifestPackage) => pkg.$?.['android:name']) || [];
  const existingPackages = new Set(existingPackageNames);

  const newPackages: AndroidManifestPackage[] = allPackages
    .filter((pkg: string) => !Array.from(existingPackages).includes(pkg))
    .map((pkg: string) => ({ $: { 'android:name': pkg } }));

  if (packageQuery?.package) {
    packageQuery.package.push(...newPackages);
  }

  return androidManifest;
};

/**
 * Helper function to add permissions dynamically.
 */
const addUsesPermissions = (
  androidManifest: AndroidConfig.Manifest.AndroidManifest,
  permissions: string[],
  permissionTemplate: string = '.permission.READ_SHARED_PREFS'
): AndroidConfig.Manifest.AndroidManifest => {
  if (!androidManifest.manifest['uses-permission']) {
    androidManifest.manifest['uses-permission'] = [];
  }

  // Check if the permission already exists
  const existingUsesPermissions = (androidManifest.manifest['uses-permission'] as AndroidManifestUsesPermission[])
    .map((p: AndroidManifestUsesPermission) => p.$['android:name']);

  // Add the permission if it doesn't exist
  permissions.forEach((permission: string) => {
    const permissionName = `${permission}${permissionTemplate}`;
    if (!existingUsesPermissions.includes(permissionName)) {
      (androidManifest.manifest['uses-permission'] as AndroidManifestUsesPermission[]).push({
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
const addCustomEntriesToManifest = (
  androidManifest: AndroidConfig.Manifest.AndroidManifest,
  options: {
    permissionName?: string;
    providerAuthority?: string;
  } = {}
): AndroidConfig.Manifest.AndroidManifest => {
  const appIdPlaceholder = '${applicationId}';
  const manifestApplication = androidManifest.manifest.application;

  const permissionName = options.permissionName || `${appIdPlaceholder}.permission.READ_SHARED_PREFS`;
  const providerAuthority = options.providerAuthority || `${appIdPlaceholder}.sharedpreferencesprovider`;

  // Define the custom permission
  const permission: AndroidManifestPermission = {
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
  const existingPermissions = (androidManifest.manifest.permission as AndroidManifestPermission[])
    .map((p: AndroidManifestPermission) => p.$['android:name']);

  // Add the permission if it doesn't exist
  if (!existingPermissions.includes(permission.$['android:name'])) {
    (androidManifest.manifest.permission as AndroidManifestPermission[]).push(permission);
  }

  // Add the provider entry to <application>
  const provider: AndroidManifestProvider = {
    $: {
      'android:name': 'com.data.SharedPreferencesProvider',
      'android:authorities': providerAuthority,
      'android:permission': permissionName,
      'android:enabled': 'true',
      'android:exported': 'true',
    },
  };

  // Add the provider to <application>
  const appWithProvider = manifestApplication?.[0] as ExtendedManifestApplication;
  if (!appWithProvider?.provider) {
    if (appWithProvider) {
      appWithProvider.provider = [];
    }
  }

  // Check if the provider already exists
  const existingProviders = appWithProvider?.provider
    ?.map((p: AndroidManifestProvider) => p.$['android:name']) || [];

  // Add the provider if it doesn't exist
  if (!existingProviders.includes(provider.$['android:name'])) {
    appWithProvider?.provider?.push(provider);
  }

  return androidManifest;
};

/**
 * Plugin function to modify the AndroidManifest.xml for app data sharing.
 */
const withAppDataSharingAndroid: ConfigPlugin<AppDataSharingPluginProps> = (
  config,
  props = {}
) => {
  const { 
    appsBundleIds = []
  } = props;

  const bundleIds = [...new Set(appsBundleIds)];

  return withAndroidManifest(config, (androidConfig) => {
    androidConfig.modResults = addUsesPermissions(
      androidConfig.modResults, 
      bundleIds
    );
    
    androidConfig.modResults = addCustomEntriesToManifest(
      androidConfig.modResults
    );
    
    androidConfig.modResults = addCustomQueries(
      androidConfig.modResults, 
      bundleIds
    );
    
    return androidConfig;
  });
};

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
const withAppDataSharing: ConfigPlugin<AppDataSharingPluginProps> = (config, props = {}) => {
  // Apply Android configuration
  config = withAppDataSharingAndroid(config, props);
  
  return config;
};

export default withAppDataSharing;
export { withAppDataSharing, withAppDataSharingAndroid };
