import 'dart:io';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:google_sign_in/google_sign_in.dart';

/// Autenticação alinhada com o frontend web: os dados do usuário vivem em
/// `users/{uid}` com os campos displayName, email e imageUrl (download URL).
class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseDatabase _db = FirebaseDatabase.instance;

  Future<User> registrar({
    required String nome,
    required String email,
    required String senha,
    File? imagem,
  }) async {
    final credential = await _auth.createUserWithEmailAndPassword(
      email: email,
      password: senha,
    );
    final user = credential.user!;

    // Mesmo caminho de storage usado pelo web (UserPage):
    // images/profile_image_{uid}.jpg, gravando a URL de download real.
    String? imageUrl;
    if (imagem != null) {
      final ref =
          FirebaseStorage.instance.ref('images/profile_image_${user.uid}.jpg');
      await ref.putFile(imagem);
      imageUrl = await ref.getDownloadURL();
      await user.updatePhotoURL(imageUrl);
    }

    await user.updateDisplayName(nome.trim());

    await _db.ref('users/${user.uid}').set({
      'displayName': nome.trim(),
      'email': email,
      if (imageUrl != null) 'imageUrl': imageUrl,
    });

    return user;
  }

  Future<User> entrarComEmail(String email, String senha) async {
    final credential = await _auth.signInWithEmailAndPassword(
      email: email,
      password: senha,
    );
    return credential.user!;
  }

  Future<User?> entrarComGoogle() async {
    final googleAccount = await GoogleSignIn().signIn();
    if (googleAccount == null) return null; // usuário cancelou

    final googleAuth = await googleAccount.authentication;
    final credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );

    final userCredential = await _auth.signInWithCredential(credential);
    final user = userCredential.user!;

    // O web atualiza users/{uid} no login com Google; sem isso o perfil
    // de quem entra pelo Google só existe no Auth e some das telas.
    await _db.ref('users/${user.uid}').update({
      'displayName': user.displayName,
      'email': user.email,
      if (user.photoURL != null) 'imageUrl': user.photoURL,
    });

    return user;
  }

  Future<void> sair() async {
    await GoogleSignIn().signOut();
    await _auth.signOut();
  }
}
