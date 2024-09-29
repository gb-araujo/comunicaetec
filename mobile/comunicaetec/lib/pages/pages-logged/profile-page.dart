import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter/material.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(MaterialApp(home: ProfilePage()));
}

class ProfilePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Meu Perfil'),
      ),
      body: FutureBuilder<UserData?>(
        future: getUserData(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError || snapshot.data == null) {
            return Center(child: Text('Erro ao carregar dados do usuário'));
          } else {
            UserData userData = snapshot.data!;
            return ProfileWidget(userData: userData);
          }
        },
      ),
    );
  }

  Future<UserData?> getUserData() async {
    try {
      User? user = FirebaseAuth.instance.currentUser;
      if (user != null) {
        if (user.providerData.any((info) => info.providerId == 'google.com')) {
          return UserData(
            displayName: user.displayName ?? 'Nome não encontrado',
            email: user.email ?? 'Email não encontrado',
            photoURL: user.photoURL ?? '',
          );
        } else {
          DatabaseReference userRef = FirebaseDatabase.instance.ref().child('users').child(user.uid);
          DataSnapshot snapshot = await userRef.once().then((event) => event.snapshot);
          Map<dynamic, dynamic>? userDataMap = snapshot.value as Map<dynamic, dynamic>?;
          if (userDataMap != null) {
            String displayName = userDataMap['name'] ?? 'Nome não encontrado';
            String email = userDataMap['email'] ?? 'Email não encontrado';
            String photoURL = userDataMap['imageUrl'] ?? '';
            return UserData(displayName: displayName, email: email, photoURL: photoURL);
          } else {
            throw Exception('Dados do usuário não encontrados no Realtime Database');
          }
        }
      } else {
        throw Exception('Usuário não logado');
      }
    } catch (e) {
      print('Erro ao obter dados do usuário: $e');
      return null;
    }
  }
}

class UserData {
  final String displayName;
  final String email;
  final String photoURL;

  UserData({required this.displayName, required this.email, required this.photoURL});
}

class ProfileWidget extends StatelessWidget {
  final UserData userData;

  ProfileWidget({required this.userData});

  @override
  Widget build(BuildContext context) {
    return Center( // Wrapping the Column with Center
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center, // Aligning children in the center vertically
        children: [
          SizedBox(height: 20),
          FutureBuilder<ImageProvider<Object>>(
            future: _getImageProvider(userData.photoURL),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return CircularProgressIndicator();
              } else if (snapshot.hasError) {
                return Icon(Icons.error); // Handle error case appropriately
              } else {
                return CircleAvatar(
                  radius: 80,
                  backgroundImage: snapshot.data,
                );
              }
            },
          ),
          SizedBox(height: 20),
          Text(
            userData.displayName,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 10),
          Text(
            userData.email,
            style: TextStyle(
              fontSize: 18,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  Future<ImageProvider<Object>> _getImageProvider(String photoURL) async {
    if (photoURL.startsWith('gs://')) {
      // Load image from Google Cloud Storage
      final ref = FirebaseStorage.instance.refFromURL(photoURL);
      final url = await ref.getDownloadURL();
      return NetworkImage(url);
    } else {
      // Load image from other sources (like network or assets)
      return NetworkImage(photoURL);
    }
  }
}