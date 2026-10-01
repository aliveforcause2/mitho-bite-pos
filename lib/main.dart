// lib/main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'providers/pos_provider.dart';
import 'screens/splash_screen.dart';

void main() {
  // 1. Initialize Flutter engine bindings synchronously
  WidgetsFlutterBinding.ensureInitialized();

  // 2. Launch UI IMMEDIATELY (Zero delay, Never blocks on network/Firebase)
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => PosProvider(),
        ),
      ],
      child: const MithoBiteApp(),
    ),
  );

  // 3. Initialize Firebase asynchronously in background with safety timeout
  _initFirebaseInBackground();
}

void _initFirebaseInBackground() async {
  try {
    await Firebase.initializeApp().timeout(
      const Duration(seconds: 2),
      onTimeout: () {
        debugPrint('Firebase init timeout - proceeding in high-speed offline mode');
        return Firebase.app();
      },
    );
    debugPrint('Firebase initialized in background');
  } catch (e) {
    debugPrint('Firebase offline fallback active: $e');
  }
}

class MithoBiteApp extends StatelessWidget {
  const MithoBiteApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'miTHOBITE',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        primaryColor: const Color(0xFFF59E0B),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFF59E0B),
          secondary: Color(0xFF10B981),
          surface: Color(0xFF1E293B),
        ),
      ),
      home: const SplashScreen(),
    );
  }
}
