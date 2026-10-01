// lib/main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'providers/pos_provider.dart';
import 'screens/splash_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase in the background without blocking UI startup
  Firebase.initializeApp().then((_) {
    debugPrint('Firebase initialized successfully in background');
  }).catchError((e) {
    debugPrint('Firebase init error (running offline): $e');
  });

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => PosProvider()..initFirestoreStreams(),
        ),
      ],
      child: const MithoBiteApp(),
    ),
  );
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
        fontFamily: 'Roboto',
      ),
      home: const SplashScreen(),
    );
  }
}
