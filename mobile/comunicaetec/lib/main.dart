import 'package:Comunicaetec/pages/login.page.dart';
import 'package:Comunicaetec/pages/pages-logged/calendar-page.dart';
import 'package:Comunicaetec/pages/pages-logged/profile-page.dart';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized(); // Adicionado para garantir que o Flutter esteja inicializado
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "Comunicaetec",
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),

      routes: {
        '/': (context) => LoginPage(),
        '/profile': (context) => ProfilePage(),
        '/calendario': (context) => CalendarioEscolarPage(),
      },

    );

  }
}