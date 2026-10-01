import React, { useState } from 'react';
import {
  Terminal,
  CheckCircle2,
  Copy,
  Check,
  FolderTree,
  Flame,
  Smartphone,
  BookOpen,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Package,
  Layers,
  ArrowRight,
  Download,
} from 'lucide-react';

export const SetupGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      step: '01',
      title: 'Install Flutter SDK, Java JDK & VS Code',
      badge: 'Prerequisites',
      description:
        'You need Flutter (Google’s mobile app toolkit) and VS Code (free lightweight code editor). Even with zero prior coding experience, this takes about 10 minutes.',
      instructions: [
        '1. Download Flutter SDK for your OS (Windows / macOS / Linux) from https://docs.flutter.dev/get-started/install and extract it.',
        '2. Install VS Code from https://code.visualstudio.com.',
        '3. Inside VS Code, open the Extensions tab (Ctrl+Shift+X or Cmd+Shift+X) and search for "Flutter". Click Install (this automatically installs Dart too).',
        '4. Install Android Studio (or Android Command Line Tools) to provide the Android SDK.',
        '5. Open Terminal or Command Prompt and verify everything is ready:',
      ],
      command: 'flutter doctor',
    },
    {
      step: '02',
      title: 'Create the Himalayan POS Project & Dependencies',
      badge: 'Project Setup',
      description:
        'Create the Flutter application and add Provider for reactive state management, Firebase Firestore, and utility libraries.',
      instructions: [
        'Run these commands in your terminal to create the project and install all required packages:',
      ],
      command: `flutter create himalayan_pos
cd himalayan_pos
flutter pub add provider firebase_core cloud_firestore intl`,
    },
    {
      step: '03',
      title: 'File Placement & Exact Project Folder Tree',
      badge: 'Folder Architecture',
      description:
        'Open the "himalayan_pos" folder in VS Code. Inside the "lib/" folder, create the subfolders and copy-paste each file from the "Flutter Code" tab:',
      instructions: [
        'Place each file in its corresponding directory exactly as shown in this tree:',
      ],
      command: `himalayan_pos/
├── pubspec.yaml
├── firestore.rules
├── assets/
│   └── data/
│       └── initial_pos_data.json
└── lib/
    ├── main.dart
    ├── models/
    │   ├── menu_item.dart
    │   ├── table_model.dart
    │   ├── order_model.dart
    │   └── daily_sales_report.dart
    ├── services/
    │   └── pos_firestore_service.dart
    ├── providers/
    │   └── pos_provider.dart
    ├── screens/
    │   ├── table_selection_screen.dart
    │   ├── menu_ordering_screen.dart
    │   ├── order_review_screen.dart
    │   ├── kitchen_display_screen.dart
    │   ├── billing_checkout_screen.dart
    │   └── sales_report_screen.dart
    └── widgets/
        ├── kot_slip_dialog.dart
        └── thermal_receipt_dialog.dart`,
    },
    {
      step: '04',
      title: 'Connect Firebase Cloud Firestore (No Coding Required)',
      badge: 'Backend Linking',
      description:
        'Connect your project to Google Firebase so your orders, menu items, and tables sync in real-time across tablets, kitchen screens, and manager phones.',
      instructions: [
        'Method A (Automatic with FlutterFire CLI - Recommended):',
        'Run these three commands to link your Google account:',
        'Method B (Manual):',
        'Go to https://console.firebase.google.com -> Create Project -> Add Android App -> Download google-services.json and drop it inside himalayan_pos/android/app/',
      ],
      command: `npm install -g firebase-tools
firebase login
dart pub global activate flutterfire_cli
flutterfire configure`,
    },
    {
      step: '05',
      title: 'Build the Standalone Android APK (.apk)',
      badge: 'Production Build',
      description:
        'Compile the complete Flutter code into a self-contained, high-performance release APK that can be installed on any Android phone or POS tablet without developer mode.',
      instructions: [
        '1. Ensure your terminal is inside the himalayan_pos directory.',
        '2. Run the release build command:',
        '3. Once compilation finishes (usually 1-2 minutes), your APK will be generated at:',
        '   build/app/outputs/flutter-apk/app-release.apk',
      ],
      command: 'flutter build apk --release',
    },
    {
      step: '06',
      title: 'Install Directly on Any Android Phone or Tablet',
      badge: 'Deployment',
      description:
        'Install the generated APK onto your restaurant hardware (Samsung Tab, Lenovo Tab, Sunmi POS, or personal Android phone).',
      instructions: [
        'Option 1 (Direct USB install): Connect phone/tablet via USB cable and run:',
        '   flutter install',
        'Option 2 (File Share): Send "app-release.apk" to your device via WhatsApp, Google Drive, Bluetooth, or USB flash drive.',
        'Tap the APK file on your Android device. If prompted, allow "Install unknown apps" from Settings, then tap Install.',
        'Launch "Himalayan POS" from your device home screen and start billing immediately!',
      ],
      command: 'flutter install',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-5xl mx-auto w-full text-slate-100 space-y-8 pb-16">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
          <Smartphone className="w-4 h-4" />
          <span>Zero-Experience Deployment Guide</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          How to Build & Run the Android APK
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
          Follow these 6 simple steps to convert this codebase into a fully working, installable Android APK file (<code className="text-amber-400 bg-slate-950 px-1 py-0.5 rounded">.apk</code>) ready to run on any tablet or smartphone.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-6">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl hover:border-slate-700 transition-all"
          >
            {/* Step Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 font-black text-xs flex items-center justify-center">
                  {step.step}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {step.title}
                  </h3>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {step.badge}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
              {step.description}
            </p>

            {/* Sub-instructions list */}
            <div className="space-y-1.5 mb-4 text-xs text-slate-400">
              {step.instructions.map((inst, iIdx) => (
                <div key={iIdx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold shrink-0">•</span>
                  <span>{inst}</span>
                </div>
              ))}
            </div>

            {/* Code / Command Snippet Box */}
            <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-200">
              <button
                onClick={() => copyToClipboard(step.command, idx)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
                title="Copy Command"
              >
                {copiedIndex === idx ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <pre className="overflow-x-auto pr-10 whitespace-pre-wrap leading-relaxed">
                <code>{step.command}</code>
              </pre>
            </div>
          </div>
        ))}
      </div>

      {/* Troubleshooting & FAQ Box */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <span>Troubleshooting & Beginner FAQ</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
            <h4 className="font-bold text-amber-400 mb-1">
              Q: What if "flutter doctor" says Android toolchain missing?
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Open Android Studio → Tools → SDK Manager → SDK Tools tab → Check "Android SDK Command-line Tools (latest)" → Click Apply. Then run <code className="text-slate-300">flutter doctor --android-licenses</code> and press 'y' to accept.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
            <h4 className="font-bold text-amber-400 mb-1">
              Q: Can I test on my phone without building an APK first?
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Yes! Enable "Developer Options" and "USB Debugging" on your Android phone, plug it into your computer via USB cable, and run <code className="text-slate-300">flutter run</code>. The app will launch directly on your phone with live reload.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
            <h4 className="font-bold text-amber-400 mb-1">
              Q: Does the APK work offline if WiFi disconnects?
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Yes! Cloud Firestore includes automatic offline persistence on Android and iOS. Orders placed offline are queued locally on the tablet and automatically sync to the kitchen when connection returns.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
            <h4 className="font-bold text-amber-400 mb-1">
              Q: How do I connect an 80mm ESC/POS Thermal Printer?
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Connect your printer via LAN Ethernet or Bluetooth. Use the standard ESC/POS raw socket connection on port 9100. Both the Customer Tax Bill and Kitchen KOT slips are pre-formatted for thermal printing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
