import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';
import 'providers/pos_provider.dart';
import 'screens/table_selection_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // NOTE: Ensure you ran 'flutterfire configure' for real Firebase init.
  // In development/test mode, this connects to your Firebase project.
  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint('Firebase already initialized or running in mock mode: $e');
  }

  runApp(const HimalayanPosApp());
}

class HimalayanPosApp extends StatelessWidget {
  const HimalayanPosApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => PosProvider()..initializeRealtimeData()),
      ],
      child: MaterialApp(
        title: 'Himalayan POS',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFFE65100), // Himalayan Warm Amber/Spice
            primary: const Color(0xFFD84315),
            surface: const Color(0xFFF9FAFB),
            brightness: Brightness.light,
          ),
          appBarTheme: const AppBarTheme(
            elevation: 0,
            centerTitle: false,
            backgroundColor: Color(0xFF1E293B),
            foregroundColor: Colors.white,
          ),
          cardTheme: CardTheme(
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
        ),
        home: const TableSelectionScreen(),
      ),
    );
  }
}
