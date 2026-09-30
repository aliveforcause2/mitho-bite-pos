// lib/main.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'providers/pos_provider.dart';
import 'screens/table_selection_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase (Requires google-services.json for Android)
  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint('Firebase initialized in offline/demo mode: $e');
  }

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => PosProvider()..initFirestoreStreams(),
        ),
      ],
      child: const HimalayanPosApp(),
    ),
  );
}

class HimalayanPosApp extends StatelessWidget {
  const HimalayanPosApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Himalayan POS',
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
      home: const TableSelectionScreen(),
    );
  }
}
