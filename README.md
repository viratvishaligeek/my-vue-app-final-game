Capacitor 8 ke liye project root se ye package install kar sakte ho:

bash
npm install -D @capacitor/assets
Phir project mein assets ke liye ye structure tayyar karo:

text
my-vue-app/
├── assets/
│ ├── icon-only.png
│ ├── splash.png
│ └── splash-dark.png
├── capacitor.config.json
└── android/
icon-only.png — app icon ke liye, preferably 1024 × 1024 PNG.

splash.png — splash screen ke liye, high-resolution portrait PNG.

splash-dark.png — optional dark-mode splash image.

Agar tumhare paas pehle se original icon aur splash images hain, unhi ko use karna behtar hoga.

Resources generate karne ke liye:

bash
npx capacitor-assets generate
Uske baad:

bash
npm run build
npx cap sync android
Dhyan do: npx cap sync android tabhi chalao jab Android platform project properly configured ho. Ye command app icon aur splash screen ki har problem ko automatically fix nahi karti; native theme aur manifest bhi sahi hone chahiye.
