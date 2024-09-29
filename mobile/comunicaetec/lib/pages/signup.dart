import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart' as firebase_storage;
import 'package:firebase_database/firebase_database.dart';
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
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;
  String? _errorMessage;

  Future<void> _saveUserDataToDatabase(UserCredential userCredential, File? image) async {
    final FirebaseDatabase database = FirebaseDatabase.instance;
    final String userId = userCredential.user!.uid;

    // Crie um mapa com os dados do usuário
    Map<String, dynamic> userData = {
      'name': _nameController.text,
      'email': _emailController.text,
      // Adicione outros campos do usuário, se necessário
    };

    // Se a imagem foi carregada, adicione a URL da imagem aos dados do usuário
    if (image != null) {

      final String fileName = 'profile_image_$userId.jpg';
      final String imageUrl = 'gs://comunicaetec-731e5.appspot.com/images/$fileName'; // Substitua pelo URL correto do seu Storage
      userData['imageUrl'] = imageUrl;
    }

    // Salve os dados do usuário no Realtime Database
    await database.ref().child('users').child(userId).set(userData);

  }

  Future<void> pickImage() async {
    final pickedImage = await ImagePicker().pickImage(source: ImageSource.gallery);
    if (pickedImage == null) return;
    setState(() {
      image = File(pickedImage.path);
    });
  }

  Future<void> _uploadImage(File image, String userId) async {
    final String fileName = 'profile_image_$userId.jpg'; // Nome do arquivo no Storage
    final firebase_storage.Reference ref = firebase_storage.FirebaseStorage.instance.ref().child('images').child(fileName);

    // Faz o upload da imagem para o Firebase Storage
    await ref.putFile(image);

    // Obtenha a URL da imagem carregada
    final String imageUrl = await ref.getDownloadURL();


  }

  Future<void> register(BuildContext context) async {
    try {
      final UserCredential userCredential = await _firebaseAuth.createUserWithEmailAndPassword(
        email: _emailController.text,
        password: _passwordController.text,
      );

      // Upload da imagem para o Firebase Storage
      if (image != null) {
        final String userId = userCredential.user!.uid; // ID do usuário recém-criado
        await _uploadImage(image!, userId);
      }

      // Salve os dados do usuário no Realtime Database
      await _saveUserDataToDatabase(userCredential, image);

      print("Usuário registrado com sucesso!");

      // Navega para a página de verificação
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => EmailVerificationScreen()),
      );

    } catch (e) {
      print(e);
      String errorMessage = 'Ocorreu um erro ao registrar.';

      if (e is FirebaseAuthException) {
        if (e.code == 'email-already-in-use') {
          errorMessage = 'O endereço de e-mail já está sendo usado por outra conta.';
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
