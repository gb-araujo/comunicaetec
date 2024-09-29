import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'reset-password.page.dart';
import 'pages-logged/home-page.dart'; // Importe a página HomePage
import 'signup.dart';
import 'email-confirmation.dart'; // Importe a página de confirmação de e-mail

class LoginPage extends StatelessWidget {
  LoginPage({Key? key}) : super(key: key);

  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        padding: const EdgeInsets.only(
          top: 60,
          left: 40,
          right: 40,
        ),
        color: Colors.white54,
        child: ListView(
          children: <Widget>[
            Container(
              alignment: Alignment.topRight,
              child: SizedBox(
                width: 175,
                height: 170,
                child: Image.asset("assets/school-bag.png"),
              ),
            ),
            const SizedBox(
              height: 20,
            ),
            TextFormField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(
                labelText: "E-mail",
                labelStyle: TextStyle(
                  color: Colors.black38,
                  fontWeight: FontWeight.w400,
                  fontSize: 20,
                ),
              ),
              style: const TextStyle(fontSize: 20),
            ),
            const SizedBox(
              height: 20,
            ),
            TextFormField(
              controller: _passwordController,
              keyboardType: TextInputType.text,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: "Senha",
                labelStyle: TextStyle(
                  color: Colors.black38,
                  fontWeight: FontWeight.w400,
                  fontSize: 20,
                ),
              ),
              style: const TextStyle(fontSize: 20),
            ),
            Container(
              height: 40,
              alignment: Alignment.centerRight,
              child: TextButton(
                child: const Text(
                  "Recuperar Senha",
                  textAlign: TextAlign.right,
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => ResetPasswordPage(),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(
              height: 40,
            ),
            Container(
              height: 40,
              alignment: Alignment.centerLeft,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  stops: [0.3, 1],
                  colors: [
                    Color(0xFF656ED3),
                    Color(0xFF656ED3),
                  ],
                ),
                borderRadius: BorderRadius.all(
                  Radius.circular(5),
                ),
              ),
              child: SizedBox.expand(
                child: TextButton(
                  child: const Text(
                    "Login",
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      fontSize: 20,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  onPressed: () {
                    login(context);
                  },
                ),
              ),
            ),
            const SizedBox(
              height: 20,
            ),

            Container(
              child: TextButton.icon(
                onPressed: () async {
                  await _signInWithGoogle(context);
                },
                icon: Icon(Icons.account_circle, color: Colors.white), // Ícone do Google
                label: const Text("Login com Google", style: TextStyle(color: Colors.white)),
                style: ButtonStyle(
                  backgroundColor: MaterialStateProperty.all<Color>(Colors.red), // Cor de fundo do botão
                ),
              ),
            ),

            const SizedBox(
              height: 20,
            ),

            Container(
              child: TextButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => Signup(), // Navega para a página de cadastro
                    ),
                  );
                },
                child: const Text("Cadastre-se"),
              ),
            ),

            Container(
              alignment: Alignment.bottomLeft,
              child: SizedBox(
                width: 160,
                height: 140,
                child: Image.asset("assets/blood-report.png"),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void login(BuildContext context) async {
    try {
      final email = _emailController.text.trim();
      final password = _passwordController.text.trim();

      if (email.isEmpty || password.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Digite seu e-mail e senha.'),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }

      final UserCredential userCredential = await _firebaseAuth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      if (userCredential.user != null) {
        if (userCredential.user!.emailVerified) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => HomePage()),
          );
        } else {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => EmailVerificationScreen()),
          );
        }
      }
    } on FirebaseAuthException catch (e) {
      String message = '';
      if (e.code == 'user-not-found') {
        message = 'Usuário não encontrado.';
      } else if (e.code == 'wrong-password') {
        message = 'E-mail ou senha incorreta'; // Consider a more generic message for security
      } else if (e.code == 'user-disabled') {
        message = 'Conta desativada';
      } else if(e.code == 'invalid-credential'){
        message = 'E-mail ou senha incorreta';
      } else {
        message = 'Um erro ocorreu, tente novamente mais tarde';
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _signInWithGoogle(BuildContext context) async {
    try {
      // Initialize GoogleSignIn
      final GoogleSignIn googleSignIn = GoogleSignIn();

      // Sign in
      final GoogleSignInAccount? googleSignInAccount = await googleSignIn.signIn();

      // Check if user cancelled the sign-in process
      if (googleSignInAccount == null) return;

      // Obtain the authentication details
      final GoogleSignInAuthentication googleAuth = await googleSignInAccount.authentication;

      // Create a new credential
      final AuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      // Sign in to Firebase with the credential
      final UserCredential userCredential = await _firebaseAuth.signInWithCredential(credential);

      // Check if user is signed in
      if (userCredential.user != null) {
        // Navigate to the HomePage
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => HomePage()),
        );
      }
    } catch (e) {
      print("Error signing in with Google: $e");
      showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: Text("Erro de Login"),
            content: Text("Erro ao fazer login com o Google."),
            actions: <Widget>[
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop();
                },
                child: Text("OK"),
              ),
            ],
          );
        },
      );
    }
  }
}
