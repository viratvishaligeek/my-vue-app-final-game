Vue + Capacitor 8 Android Build Guide
Ye guide Vue project ko build karke existing Capacitor 8 Android project mein latest changes sync karne, App Icon/Splash Screen configure karne aur APK generate karne ke liye hai.

📋 Prerequisites
Ensure karein ki project root folder mein required dependencies already installed hain.

Project structure roughly is tarah hona chahiye:

my-vue-app/
├── src/
├── android/
├── dist/
├── package.json
└── capacitor.config.json

Important: Existing android/ folder ko delete na karein aur npx cap add android dobara run na karein.

1. Vue Project Build Karein
   Project ke root folder mein terminal open karein aur run karein:

npm install

Uske baad Vue project ko build karein:

npm run build

Build complete hone ke baad latest Vue code ke saath dist/ folder generate/update hoga.

Example:

my-vue-app/
├── src/
├── android/
├── dist/ ← Latest Vue build
├── package.json
└── capacitor.config.json

2. Latest Code Android Project Mein Sync Karein
   Vue build ke baad latest web assets ko Android project mein bhejne ke liye:

npx cap sync android

sync vs copy
Agar sirf web assets copy karne hain:

npx cap copy android

Lekin generally sync recommended hai, kyunki ye:

Web assets copy karta hai

Capacitor plugins synchronize karta hai

Capacitor configuration synchronize karta hai

Isliye normal workflow mein:

npx cap sync android

use karein.

3. App Icon & Splash Screen
   Capacitor 8 project ke liye App Icon aur Splash Screen generate karne ke liye @capacitor/assets use kiya ja sakta hai.

Install @capacitor/assets
Project root mein run karein:

npm install -D @capacitor/assets

Assets Folder Banayein
Project root mein assets/ folder create karein:

my-vue-app/
├── assets/
│ ├── icon-only.png
│ └── splash.png
├── src/
├── android/
├── dist/
├── package.json
└── capacitor.config.json

App Icon
App icon ke liye:

assets/icon-only.png

Recommended:

Format: PNG

Size: 1024 × 1024 px

High-resolution image use karein

Icon ke around unnecessary transparent/empty margins avoid karein

Splash Screen
Splash screen ke liye:

assets/splash.png

Recommended:

Format: PNG

High-resolution image

Portrait-oriented artwork preferred

Important content ko edges ke bahut close na rakhein

Assets Generate Karein
Assets folder ready hone ke baad run karein:

npx capacitor-assets generate

Ye Android ke required App Icon aur Splash Screen resources generate karega.

Note: App Icon aur Splash Screen ko initially configure/generate karne ke baad, normal Vue code changes ke liye har baar npx capacitor-assets generate run karne ki zarurat nahi hoti.

4. Existing Android Project Ko Delete Na Karein
   Agar project mein android/ folder already present hai aur Android project working hai, to:

Ye command dobara run na karein:

npx cap add android

Aur:

android/

folder ko manually delete bhi na karein.

Normal workflow
Existing project ke liye workflow simply:

npm run build
npx cap sync android

hona chahiye.

5. Android Studio Mein Project Open Karein
   Android project ko Android Studio mein open karne ke liye:

npx cap open android

Ye existing Android project ko Android Studio mein open karega.

Alternative
Android Studio se manually project ka:

android/

folder open kar sakte hain.

Android Studio open hone ke baad Gradle Sync complete hone dein.

6. APK Build Karein
   Android Studio mein:

Build
→ Generate App Bundles or APKs
→ Generate APKs

Phir:

APK

select karein.

Debug APK
Debug APK ke liye generally:

Build
→ Build APK(s)

APK build hone ke baad file normally yahan milegi:

android/app/build/outputs/apk/debug/app-debug.apk

7. Release APK
   Agar production/release APK banana hai:

Build
→ Generate Signed App Bundle / APK

Phir:

APK

select karein.

Uske baad apni keystore/signing configuration use karein.

Release APK distribute karne se pehle proper signing configuration ensure karein.

🔄 Complete Development Workflow
Har baar Vue application mein changes karne ke baad:

Step 1 — Vue Build
npm run build

Step 2 — Android Sync
npx cap sync android

Step 3 — Android Studio Open
npx cap open android

Step 4 — APK Build
Android Studio mein:

Build → Build APK(s)

⚡ Quick Workflow
Agar sirf quick reference chahiye:

npm install
npm run build
npx cap sync android
npx cap open android

Phir Android Studio se APK build karein.

📁 Recommended Project Structure
Final project structure kuch is tarah ho sakta hai:

my-vue-app/
│
├── assets/
│ ├── icon-only.png
│ └── splash.png
│
├── src/
│ └── ...
│
├── android/
│ └── ...
│
├── dist/
│ └── ...
│
├── package.json
├── capacitor.config.json
└── ...

⚠️ Important Notes

1. android/ folder delete na karein
   Agar Android project already configured hai, to use preserve karein.

2. npx cap add android dobara na chalayein
   Existing Android project ke liye is command ki zarurat nahi hai.

3. Normal Vue changes ke liye assets regenerate na karein
   Agar sirf Vue/JavaScript/CSS code change hua hai, to:

npm run build
npx cap sync android

sufficient hai.

4. App Icon/Splash change karne par
   Agar App Icon ya Splash Screen ki source image change karte hain, tab:

npx capacitor-assets generate

dobara run karein.

Uske baad:

npx cap sync android

run karna recommended hai.

🛠️ Capacitor Configuration
Agar Splash Screen ka behavior customize karna hai — jaise:

Splash Screen duration

Background color

Auto hide

Splash Screen visibility

Android-specific configuration

— to project ki actual:

capacitor.config.json

ya:

capacitor.config.ts

configuration check karni hogi.

🚀 Summary
Existing Capacitor 8 Android project ke liye basic workflow:

# Install dependencies

npm install

# Build Vue app

npm run build

# Sync latest Vue build with Android

npx cap sync android

# Open Android Studio

npx cap open android

Phir Android Studio se:

Build → Build APK(s)

Debug APK normally:

android/app/build/outputs/apk/debug/app-debug.apk

📌 Important
Agar aap App Icon aur Splash Screen configure kar rahe hain, to project root mein assets/ folder ke andar required images rakhein:

assets/
├── icon-only.png
└── splash.png

Phir:

npx capacitor-assets generate
npx cap sync android

run karein.
