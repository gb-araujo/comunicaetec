import 'dart:io';

import 'package:firebase_database/firebase_database.dart';
import 'package:firebase_storage/firebase_storage.dart';

/// Post do fórum em `posts`, com exatamente os mesmos campos que o
/// frontend web grava no ForumForm: content, imgURL, schoolID, schoolName,
/// tag, userID, userName, userImage, adm e createdAt.
class Post {
  final String id;
  final String content;
  final String? imgURL;
  final String schoolID;
  final String schoolName;
  final String tag;
  final String userID;
  final String userName;
  final String? userImage;
  final String adm;
  final int createdAt;

  Post({
    required this.id,
    required this.content,
    this.imgURL,
    required this.schoolID,
    required this.schoolName,
    required this.tag,
    required this.userID,
    required this.userName,
    this.userImage,
    this.adm = '',
    required this.createdAt,
  });

  factory Post.fromMap(String id, Map<dynamic, dynamic> map) {
    return Post(
      id: id,
      content: (map['content'] ?? '') as String,
      imgURL: map['imgURL'] as String?,
      schoolID: (map['schoolID'] ?? '') as String,
      schoolName: (map['schoolName'] ?? '') as String,
      tag: (map['tag'] ?? '') as String,
      userID: (map['userID'] ?? '') as String,
      userName: (map['userName'] ?? '') as String,
      userImage: map['userImage'] as String?,
      adm: (map['adm'] ?? '') as String,
      createdAt: (map['createdAt'] ?? 0) as int,
    );
  }

  String get dataFormatada {
    final data = DateTime.fromMillisecondsSinceEpoch(createdAt);
    final dia = data.day.toString().padLeft(2, '0');
    final mes = data.month.toString().padLeft(2, '0');
    return '$dia/$mes/${data.year}';
  }
}

class PostService {
  final FirebaseDatabase _db = FirebaseDatabase.instance;

  /// Posts de uma escola, como a query do fórum web:
  /// orderByChild("schoolID") equalTo(escola), mais recentes primeiro.
  Stream<List<Post>> postsDaEscola(String schoolID) {
    final query =
        _db.ref('posts').orderByChild('schoolID').equalTo(schoolID);

    return query.onValue.map((event) {
      final value = event.snapshot.value;
      if (value is! Map) return <Post>[];

      final posts = <Post>[];
      value.forEach((postID, dados) {
        if (dados is Map) {
          posts.add(Post.fromMap(postID.toString(), dados));
        }
      });
      posts.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      return posts;
    });
  }

  Future<void> criarPost({
    required String content,
    File? imagem,
    required String schoolID,
    required String schoolName,
    required String tag,
    required String userID,
    required String userName,
    String? userImage,
    String adm = '',
  }) async {
    // Regra do web: precisa de conteúdo ou imagem, e de uma escola.
    if ((content.isEmpty && imagem == null) || schoolID.isEmpty) {
      throw ArgumentError('Informe um conteúdo ou imagem e selecione a escola.');
    }

    final createdAt = DateTime.now().millisecondsSinceEpoch;

    // Mesmo caminho de storage do fórum web: post_image/image_{ts}.jpg
    String? imgURL;
    if (imagem != null) {
      final ref =
          FirebaseStorage.instance.ref('post_image/image_$createdAt.jpg');
      await ref.putFile(imagem);
      imgURL = await ref.getDownloadURL();
    }

    await _db.ref('posts').push().set({
      'content': content,
      'imgURL': imgURL,
      'schoolID': schoolID,
      'schoolName': schoolName,
      'tag': tag,
      'userID': userID,
      'userName': userName,
      'userImage': userImage,
      'adm': adm,
      'createdAt': createdAt,
    });
  }
}
