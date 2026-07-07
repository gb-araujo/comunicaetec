import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../services/auth_service.dart';
import 'email-confirmation.dart';

class Signup extends StatefulWidget {
  Signup({Key? key}) : super(key: key);

  @override
  _SignupState createState() => _SignupState();
}

class _SignupState extends State<Signup> {
  File? image;
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final AuthService _authService = AuthService();
  String? _errorMessage;

  Future<void> pickImage() async {
    final pickedImage = await ImagePicker().pickImage(source: ImageSource.gallery);
    if (pickedImage == null) return;
    setState(() {
      image = File(pickedImage.path);
    });
  }

  Future<void> register(BuildContext context) async {
    try {
      // Cria a conta e grava users/{uid} no mesmo formato do web
      // (displayName, email e imageUrl com a URL de download real).
      await _authService.registrar(
        nome: _nameController.text,
        email: _emailController.text,
        senha: _passwordController.text,
        imagem: image,
      );

      // Navega para a página de verificação
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => EmailVerificationScreen()),
      );

    } catch (e) {
      String errorMessage = 'Ocorreu um erro ao registrar.';

      if (e is FirebaseAuthException) {
        if (e.code == 'email-already-in-use') {
          errorMessage = 'O endereço de e-mail já está sendo usado por outra conta.';
        } else if (e.code == 'weak-password') {
          errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
        } else if (e.code == 'invalid-email') {
          errorMessage = 'O e-mail informado é inválido.';
        } else {
          errorMessage = 'Erro desconhecido: ${e.message}';
        }
      }

      showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: Text('Erro'),
            content: Text(errorMessage),
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
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        padding: EdgeInsets.only(top: 10, left: 40, right: 40),
        color: Colors.white,
        child: ListView(
          children: <Widget>[
            Container(
              width: 200,
              height: 200,
              alignment: const Alignment(0.02, 1.10),
              child: Stack(
                children: [
                  Container(
                    width: 200,
                    height: 200,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(width: 4.0, color: Colors.white),
                      image: image != null
                          ? DecorationImage(
                          image: FileImage(image!), fit: BoxFit.cover)
                          : const DecorationImage(
                        image: AssetImage("assets/profile-signup.png"),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      height: 46,
                      width: 46,
                      alignment: Alignment.center,
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          stops: [0.3, 1.0],
                          colors: [Color(0xFF656ED3), Color(0xFF656ED3)],
                        ),
                        shape: BoxShape.circle,
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.add, color: Colors.white),
                        onPressed: () {
                          pickImage();
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(
              height: 20,
            ),
            TextFormField(
              controller: _nameController,
              keyboardType: TextInputType.text,
              decoration: const InputDecoration(
                labelText: "Nome",
                labelStyle: TextStyle(
                  color: Colors.black38,
                  fontWeight: FontWeight.w400,
                  fontSize: 20,
                ),
              ),
              style: const TextStyle(
                fontSize: 20,
              ),
            ),
            SizedBox(
              height: 10,
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
              style: const TextStyle(
                fontSize: 20,
              ),
            ),
            SizedBox(
              height: 10,
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
              style: TextStyle(fontSize: 20),
            ),
            if (_errorMessage != null) // Mostra o erro apenas se existir
              SizedBox(
                height: 40,
                child: Text(
                  _errorMessage!,
                  style: TextStyle(color: Colors.red),
                ),
              ),
            SizedBox(
              height: 50,
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
                    "Cadastrar",
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      fontSize: 20,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  onPressed: () {
                    register(context);
                  },
                ),
              ),
            ),
            SizedBox(
              height: 10,
            ),
            Container(
              height: 40,
              alignment: Alignment.center,
              child: TextButton(
                child: const Text(
                  "Cancelar",
                  textAlign: TextAlign.center,
                ),
                onPressed: () => Navigator.pop(context, false),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
