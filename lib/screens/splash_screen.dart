// lib/screens/splash_screen.dart
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'main_navigation_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with TickerProviderStateMixin {
  late AnimationController _mainController;
  late AnimationController _steamController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _mainController = AnimationController(
      duration: const Duration(milliseconds: 1800),
      vsync: this,
    );

    _steamController = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    )..repeat();

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _mainController, curve: const Interval(0.0, 0.6, curve: Curves.easeIn)),
    );

    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _mainController, curve: const Interval(0.2, 1.0, curve: Curves.easeOutBack)),
    );

    _mainController.forward();

    // Navigate to MainNavigationScreen after splash
    Future.delayed(const Duration(milliseconds: 2600), () {
      if (mounted) {
        Navigator.of(context).pushReplacement(
          PageRouteBuilder(
            pageBuilder: (context, animation, secondaryAnimation) => const MainNavigationScreen(),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              return FadeTransition(opacity: animation, child: child);
            },
            transitionDuration: const Duration(milliseconds: 600),
          ),
        );
      }
    });
  }

  @override
  void dispose() {
    _mainController.dispose();
    _steamController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: RadialGradient(
            center: Alignment.center,
            radius: 1.1,
            colors: [Color(0xFF1E293B), Color(0xFF0F172A), Color(0xFF06090F)],
          ),
        ),
        child: Center(
          child: AnimatedBuilder(
            animation: _mainController,
            builder: (context, child) {
              return FadeTransition(
                opacity: _fadeAnimation,
                child: ScaleTransition(
                  scale: _scaleAnimation,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Animated Steaming Plate
                      Stack(
                        alignment: Alignment.center,
                        children: [
                          // Animated Rising Hot Steam
                          Positioned(
                            top: -20,
                            child: AnimatedBuilder(
                              animation: _steamController,
                              builder: (context, child) {
                                return CustomPaint(
                                  size: const Size(120, 70),
                                  painter: SteamPainter(_steamController.value),
                                );
                              },
                            ),
                          ),
                          // Glowing Food Icon Plate
                          Container(
                            margin: const EdgeInsets.only(top: 25),
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: const LinearGradient(
                                colors: [Color(0xFFF59E0B), Color(0xFFD97706)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFFF59E0B).withOpacity(0.45),
                                  blurRadius: 35,
                                  spreadRadius: 8,
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.restaurant_menu_rounded,
                              size: 58,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 30),
                      // Brand Name
                      const Text(
                        'miTHOBITE',
                        style: TextStyle(
                          fontSize: 38,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          letterSpacing: 1.8,
                        ),
                      ),
                      const SizedBox(height: 6),
                      // Tagline in Nepali / English
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          Icon(Icons.local_fire_department_rounded, size: 16, color: Color(0xFFF59E0B)),
                          SizedBox(width: 4),
                          Text(
                            'तातो तातो स्वाद र डिजिटल बिलिङ POS',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFFFDE68A),
                              letterSpacing: 0.5,
                            ),
                          ),
                          SizedBox(width: 4),
                          Icon(Icons.local_fire_department_rounded, size: 16, color: Color(0xFFF59E0B)),
                        ],
                      ),
                      const SizedBox(height: 48),
                      // Spinner
                      const SizedBox(
                        width: 28,
                        height: 28,
                        child: CircularProgressIndicator(
                          valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFF59E0B)),
                          strokeWidth: 2.8,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}

// Custom Painter for Rising Hot Steam Particles
class SteamPainter extends CustomPainter {
  final double animationValue;

  SteamPainter(this.animationValue);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final steamOffsets = [-25.0, 0.0, 25.0];

    for (int i = 0; i < steamOffsets.length; i++) {
      final xOffset = size.width / 2 + steamOffsets[i];
      final waveOffset = (animationValue + (i * 0.33)) % 1.0;
      final opacity = (math.sin(waveOffset * math.pi)).clamp(0.0, 0.85);

      paint.color = Colors.white.withOpacity(opacity * 0.75);
      paint.strokeWidth = 3.5 - (waveOffset * 1.5);

      final path = Path();
      final startY = size.height;
      final endY = size.height - (waveOffset * size.height * 1.1);

      path.moveTo(xOffset, startY);
      path.cubicTo(
        xOffset + (math.sin(waveOffset * math.pi * 2) * 12),
        startY - (size.height * 0.4),
        xOffset - (math.sin(waveOffset * math.pi * 2) * 12),
        startY - (size.height * 0.8),
        xOffset,
        endY,
      );

      canvas.drawPath(path, paint);
    }
  }

  @override
  bool shouldRepaint(covariant SteamPainter oldDelegate) => true;
}
