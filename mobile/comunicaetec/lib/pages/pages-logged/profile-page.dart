import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../../services/user_service.dart';

/// Perfil do usuário lendo `users/{uid}` no mesmo formato do web
/// (displayName, email, imageUrl com URL de download).
class ProfilePage extends StatelessWidget {
  ProfilePage({Key? key}) : super(key: key);

  final UserService _userService = UserService();

  Future<PerfilUsuario?> _carregarPerfil() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return null;

    final perfil = await _userService.carregarPerfil(user.uid);
    if (perfil != null && perfil.displayName.isNotEmpty) return perfil;

    // Contas antigas (ex.: Google antes da sincronização com users/{uid})
    // caem para os dados do Firebase Auth.
    return PerfilUsuario(
      displayName: user.displayName ?? 'Nome não encontrado',
      email: user.email ?? 'Email não encontrado',
      imageUrl: user.photoURL,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Meu Perfil')),
      body: FutureBuilder<PerfilUsuario?>(
        future: _carregarPerfil(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          final perfil = snapshot.data;
          if (snapshot.hasError || perfil == null) {
            return const Center(
              child: Text('Erro ao carregar dados do usuário'),
            );
          }

          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircleAvatar(
                  radius: 80,
                  backgroundImage: (perfil.imageUrl != null &&
                          perfil.imageUrl!.isNotEmpty)
                      ? NetworkImage(perfil.imageUrl!)
                      : null,
                  child: (perfil.imageUrl == null || perfil.imageUrl!.isEmpty)
                      ? const Icon(Icons.person, size: 80)
                      : null,
                ),
                const SizedBox(height: 20),
                Text(
                  perfil.displayName,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  perfil.email,
                  style: TextStyle(fontSize: 18, color: Colors.grey[600]),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
