# Salio

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)
![Status](https://img.shields.io/badge/Status-Active_Development-success)

**Salio** is a robust mobile financial application designed to streamline personal finance management, track spending and maintain accurate digital financial records. Built with **React Native** and **Expo**, it offers a seamless cross-platform experience with a focus on data integrity and automated insights.

## Key Features
* **Automated Financial Tracking:** Leverages native device capabilities (such as SMS parsing via the `READ_SMS` permission) to automatically categorize and log mobile money transactions, significantly reducing manual data entry
* **Architecture:** Developed using React Native(TypeScript) and Expo, ensuring high performance on mobile devices
* **Secure Digital Record-Keeping:** Employs localized secure storage to ensure user financial data remains private and untampered with
* **Scalable Design:** Architected with future backend integration in mind, perfectly aligning with robust enterprise-level system design principles

## System Requirements
To run Salio locally, you will need:
* **Node.js** (v24.x or higher)
* **npm** (v11.x or higher)
* **Expo CLI** installed globally (`npm install -g expo-cli`)
* **Android Studio** (for emulator) or a physical Android device for testing native permissions (specifically SMS)

## Installation & Setup

1. **Clone the repository:**
```bash
   git clone [https://github.com/Jim-03/Salio.git](https://github.com/Jim-03/Salio.git)
   cd Salio
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run the app:**
```bash
npx expo run:android
```

## Important Note: Sideloading and Google Play Protect
Because Salio requires the `READ_SMS` permission to provide its core automated transaction logging functionality, Google Play Protect may flag the unverified APK during manual installation (sideloading) or development.
To successfully install and test the raw APK on your physical Android device, you may need to temporarily bypass Google Play Protect:
1. Open the Google Play Store app on your Android device.
2. Tap your Profile icon in the top right corner.
3. Tap on Play Protect.
4. Tap the Settings (gear icon) in the top right corner.
5. Toggle off Scan apps with Play Protect.
6. Proceed to install the Salio.apk file on your device.
7. (Optional but Recommended) Once the installation is complete, you can return to the Play Protect settings and turn the scanning feature back on. If prompted about the app later, select "Install anyway" or "Keep app".

## Live preview
The UI component documentation and project roadmap are currently being finalized. A static showcase of the UI will be available on GitHub Pages soon