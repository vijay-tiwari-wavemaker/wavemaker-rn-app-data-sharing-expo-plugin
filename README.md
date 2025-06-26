# @wavemaker/react-native-app-data-sharing-expo-plugin

Expo plugin for [react-native-app-data-sharing](https://github.com/SimformSolutionsPvtLtd/react-native-app-data-sharing) that enables seamless and secure data sharing between React Native applications on the same device.

## Installation

### 1. Install the plugin

```bash
npm install @wavemaker/react-native-app-data-sharing-expo-plugin
```

### 2. Add the plugin to your Expo configuration

Add the plugin to your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.example.yourapp",
      "entitlements": {
        "com.apple.security.application-groups": [
          "group.com.example.shared"
        ],
        "keychain-access-groups": [
          "$(TeamIdentifierPrefix)group.com.example.shared"
        ]
      }
    },
    "plugins": [
      [
        "@wavemaker/react-native-app-data-sharing-expo-plugin",
        {
          "appsBundleIds": ["com.example.app2"]
        }
      ]
    ]
  }
}
```
### 3. Generate native code

```bash
npx expo prebuild --clean
```

## Usage

After configuring the plugin, you can use the `react-native-app-data-sharing` library in your application:

```javascript
import { saveData, getData, initializeStore } from 'react-native-app-data-sharing';

// Initialize the store
initializeStore({
  android: {
    appsBundleIds: ['com.example.app2', 'com.example.app3'] // Bundle IDs of other apps
  },
  ios: {
    accessGroup: 'group.com.example.shared', // App Group identifier
    serviceName: 'com.example.shared', // Service name for Keychain
  },
});

// Save data that other apps can access
await saveData('username', 'john_doe');

// Read data from other apps
const sharedData = await getData('shared_config');

// Get all shared data
const allData = await getAllSyncData();
```

## License

MIT
