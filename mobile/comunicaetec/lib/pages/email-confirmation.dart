import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';

import 'login.page.dart';

Future<void> sendEmailVerification(BuildContext context) async {
  try {
    User? user = FirebaseAuth.instance.currentUser;
    if (user != null && !user.emailVerified) {
      await user.sendEmailVerification();
      _showAlertDialog(context, 'Email enviado com sucesso!');
    } else {
      _showAlertDialog(context, 'O email já foi verificado.');
    }
  } catch (e) {
    _showAlertDialog(context, 'Erro ao enviar email de verificação: $e');
  }
}

void _showAlertDialog(BuildContext context, String message) {
  showDialog(
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(
        title: Text('Email Verification'),
        content: Text(message),
        actions: <Widget>[
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: Text('OK'),
          ),
        ],
      );
    },
  );
}

class EmailVerificationScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Email Verification'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            const Text(
              'Confirme seu e-mail.',
              textAlign: TextAlign.center,
            ),
            ElevatedButton(
              onPressed: () {
                sendEmailVerification(context);
              },
              child: const Text('Enviar Email de Verificação'),
            ),
            ElevatedButton(
              onPressed: () {
                FirebaseAuth.instance.signOut();
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (context) => LoginPage()),
                );
              },
              child: const Text('Sair'),
            ),
          ],
        ),
      ),
    );
  }
}
