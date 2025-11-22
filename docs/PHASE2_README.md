Phase-2 Native Integration Skeletons
-----------------------------------
Files generated:
- mobile/native/ios/ShyPalMultipeer/ShyPalMultipeer.swift
- mobile/native/android/ShyPalNearby/ShyPalNearby.kt

These are skeletons. To continue Phase-2:
1. Use Expo prebuild or eject to Bare RN.
2. Implement native modules per docs/protocol.md:
   - iOS: MultipeerConnectivity + CoreBluetooth fallback. Store keys in Secure Enclave.
   - Android: Nearby Connections primary; BLE+WiFiDirect fallback. Use Android Keystore.
3. Integrate libsodium/libsignal native bindings and expose via JS bridge.
