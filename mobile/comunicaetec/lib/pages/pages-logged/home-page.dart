import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart' as firebase_storage;
import 'package:firebase_database/firebase_database.dart';
import '../login.page.dart';

class HomePage extends StatefulWidget {
  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {

  XFile? _selectedImage;
  File? image;

  Future<void> pickImage() async {
    final pickedImage = await ImagePicker().pickImage(
        source: ImageSource.gallery);
    if (pickedImage == null) return;
    setState(() {
      _selectedImage = XFile(pickedImage.path);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Home'),
        actions: [
          PopupMenuButton(
            itemBuilder: (BuildContext context) {
              return [
                const PopupMenuItem(
                  child: Text("Nova Postagem"),
                  value: "nova_postagem",
                ),
              ];
            },
            onSelected: (value) {
              if (value == "nova_postagem") {
                _showNewPostDialog(context);
              }
            },
          ),
        ],
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            const DrawerHeader(
              decoration: BoxDecoration(
                color: Colors.blue,
              ),
              child: Text(
                'Menu',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                ),
              ),
            ),
            ListTile(
              title: Text('Avisos'),
              onTap: () {
                Navigator.pop(context);
                // Add navigation to notices page
              },
            ),
            ListTile(
              title: Text('Forum de Dúvidas'),
              onTap: () {
                Navigator.pop(context);
                // Add navigation to forum page
              },
            ),
            ListTile(
              title: Text('Calendário'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/calendario');
              },
            ),
            ListTile(
              title: Text('Perfil'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/profile');
              },
            ),
            ListTile(
              title: Text('Sair'),
              onTap: () async {
                await FirebaseAuth.instance.signOut();
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (context) => LoginPage()),
                );
              },
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: _buildPostsList(),
          ),
        ],
      ),
    );
  }

  // Method to show the new post dialog
  void _showNewPostDialog(BuildContext context) {
    String title = '';
    String content = '';
    XFile? selectedImage;

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (BuildContext context, setState) {
            return AlertDialog(
              title: const Text('Nova Postagem'),
              content: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TextField(
                      decoration: const InputDecoration(labelText: 'Título'),
                      onChanged: (value) {
                        title = value;
                      },
                    ),
                    TextField(
                      decoration: const InputDecoration(labelText: 'Conteúdo'),
                      onChanged: (value) {
                        content = value;
                      },
                    ),
                    SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () async {
                        XFile? image = await ImagePicker().pickImage(
                          source: ImageSource.gallery,
                        );
                        if (image != null) {
                          setState(() {
                            selectedImage = image;
                          });
                        }
                      },
                      child: const Text('Selecionar Imagem'),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: const Text('Cancelar'),
                ),
                ElevatedButton(
                  onPressed: selectedImage != null
                      ? () {
                    Navigator.of(context).pop();
                    _addNewPost(title, content, selectedImage);
                  }
                      : null,
                  // Disable the button if no image is selected
                  child: const Text('Postar'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Future<void> _addNewPost(String title, String content,
      XFile? imageFile) async {
    try {
      String imagePath = '';
      if (imageFile != null) {
        firebase_storage.Reference ref = firebase_storage.FirebaseStorage
            .instance
            .ref()
            .child('post_images')
            .child('${DateTime
            .now()
            .millisecondsSinceEpoch}');
        await ref.putFile(File(imageFile.path));
        imagePath = await ref.getDownloadURL();
      }

      DatabaseReference newPostRef = FirebaseDatabase.instance.ref().child(
          'posts').push();
      newPostRef.set({
        'title': title,
        'content': content,
        'imagePath': imagePath,
      });
    } catch (error) {
      print('Erro ao adicionar nova postagem: $error');
    }
  }

  // Widget to build the list of posts
  Widget _buildPostsList() {
    return StreamBuilder<DataSnapshot>(
      stream: FirebaseDatabase.instance
          .ref()
          .child('posts')
          .onValue
          .map((event) => event.snapshot),
      builder: (BuildContext context, AsyncSnapshot<DataSnapshot> snapshot) {
        if (snapshot.hasData && snapshot.data!.value != null) {
          DataSnapshot data = snapshot.data!;
          // Cast data.value to Map<dynamic, dynamic> assuming it's a map
          Map<dynamic, dynamic> posts = data.value as Map<dynamic, dynamic>;

          if (posts.isEmpty) {
            return const Center(
              child: Text('Nenhuma postagem disponível.'),
            );
          }

          return ListView.builder(
            itemCount: posts.length,
            itemBuilder: (BuildContext context, int index) {
              String postId = posts.keys.elementAt(index);
              Map<dynamic, dynamic> postData = posts.values.elementAt(index);

              // Passando todos os argumentos necessários para _buildPost
              return _buildPost(
                postData['title'],
                postData['content'],
                postData['imagePath'],
                postId,
                postData['likes'] ??
                    0, // Se o campo likes não estiver presente, use 0 como valor padrão
              );
            },
          );
        } else if (snapshot.hasError) {
          return Center(
            child: Text('Erro ao carregar as postagens: ${snapshot.error}'),
          );
        } else {
          return const Center(
            child: CircularProgressIndicator(),
          );
        }
      },
    );
  }

  // construir um item de postagem

  Widget _buildPost(String title, String content, String? imagePath, String postId, int likes) {
    bool isLiked = false; // Tracks the like status for the current user
    bool isProcessing = false; // Tracks if the like operation is in progress

    // Get the current user reference
    final currentUser = FirebaseAuth.instance.currentUser;

    // Check if the current user has already liked the post
    Future<void> checkLikedByCurrentUser() async {
      if (currentUser != null) {
        DatabaseReference likedByRef = FirebaseDatabase.instance.ref().child('posts').child(postId).child('likedBy').child(currentUser.uid);
        DataSnapshot snapshot = await likedByRef.once().then((event) => event.snapshot);
        isLiked = snapshot.value != null; // Update isLiked based on the current user's like status
      }
    }

    return FutureBuilder<void>(
      future: checkLikedByCurrentUser(),
      builder: (BuildContext context, AsyncSnapshot<void> snapshot) {
        return Card(
          margin: EdgeInsets.all(8.0),
          child: Padding(
            padding: EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  content,
                  style: TextStyle(fontSize: 16),
                ),
                SizedBox(height: 8),
                if (imagePath != null && imagePath.isNotEmpty)
                  Container(
                    width: 250, // Definindo a largura desejada para a imagem
                    height: 250, // Definindo a altura desejada para a imagem
                    child: Image.network(
                      imagePath,
                      fit: BoxFit.cover, // Ajustando a imagem para cobrir todo o espaço disponível
                    ),
                  ),
                SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    IconButton(
                      icon: Icon(isLiked ? Icons.thumb_up : Icons.thumb_up_outlined), // Change the icon based on like status
                      color: isLiked ? Colors.blue : Colors.grey,
                      onPressed: isProcessing
                          ? null
                          : () async {
                        try {
                          setState(() {
                            isProcessing = true; // Set processing flag
                          });

                          DatabaseReference postRef = FirebaseDatabase.instance.ref().child('posts').child(postId);
                          if (isLiked) {
                            // Remove the like
                            await postRef.update({'likes': likes - 1});
                            if (currentUser != null) {
                              postRef.child('likedBy').child(currentUser.uid).remove();
                            }
                          } else {
                            // Like the post
                            await postRef.update({'likes': likes + 1});
                            if (currentUser != null) {
                              postRef.child('likedBy').child(currentUser.uid).set(true);
                            }
                          }

                          // Update local state
                          setState(() {
                            isLiked = !isLiked; // Toggle like status
                            likes = isLiked ? likes + 1 : likes - 1; // Update like count
                          });
                        } catch (error) {
                          print('Erro ao atualizar as curtidas: $error');
                        } finally {
                          setState(() {
                            isProcessing = false; // Reset processing flag
                          });
                        }
                      },
                    ),
                    SizedBox(width: 8),
                    Text(likes.toString()), // Display like count
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

}