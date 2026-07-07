import 'dart:io';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../services/auth_service.dart';
import '../../services/post_service.dart';
import '../../services/user_service.dart';
import '../login.page.dart';

/// Fórum de dúvidas, alinhado com o frontend web: mesmos dados
/// (`posts` filtrado por schoolID) e mesmas regras de postagem.
class HomePage extends StatefulWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final AuthService _authService = AuthService();
  final UserService _userService = UserService();
  final PostService _postService = PostService();

  PerfilUsuario? _perfil;
  List<CursoUsuario> _cursos = [];
  List<EscolaUsuario> _escolas = [];
  String? _escolaSelecionada;
  bool _carregando = true;

  bool get _isAdm => (_perfil?.adm ?? '').isNotEmpty;

  @override
  void initState() {
    super.initState();
    _carregarDados();
  }

  Future<void> _carregarDados() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    final perfil = await _userService.carregarPerfil(user.uid);
    final cursos = await _userService.cursosAprovados(user.uid);
    var escolas = _userService.escolasDosCursos(cursos);
    String? escolaSelecionada = escolas.isNotEmpty ? escolas.first.id : null;

    // Administrador posta na própria escola, como no fórum web
    // (seleção travada na escola do adm).
    final adm = perfil?.adm ?? '';
    if (adm.isNotEmpty) {
      final nomeEscola = await _nomeDaEscola(adm);
      escolas = [EscolaUsuario(id: adm, nome: nomeEscola)];
      escolaSelecionada = adm;
    }

    if (!mounted) return;
    setState(() {
      _perfil = perfil;
      _cursos = cursos;
      _escolas = escolas;
      _escolaSelecionada = escolaSelecionada;
      _carregando = false;
    });
  }

  /// Nome da escola no Firestore (`escolas/{id}.nome`), como o web usa
  /// para preencher schoolName ao postar.
  Future<String> _nomeDaEscola(String escolaID) async {
    final doc = await FirebaseFirestore.instance
        .collection('escolas')
        .doc(escolaID)
        .get();
    return (doc.data()?['nome'] ?? '') as String;
  }

  Future<void> _sair() async {
    await _authService.sair();
    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => LoginPage()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Fórum de Dúvidas')),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            const DrawerHeader(
              decoration: BoxDecoration(color: Color(0xFF656ED3)),
              child: Text(
                'Menu',
                style: TextStyle(color: Colors.white, fontSize: 24),
              ),
            ),
            ListTile(
              title: const Text('Calendário'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/calendario');
              },
            ),
            ListTile(
              title: const Text('Perfil'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/profile');
              },
            ),
            ListTile(
              title: const Text('Sair'),
              onTap: _sair,
            ),
          ],
        ),
      ),
      floatingActionButton: _escolaSelecionada == null
          ? null
          : FloatingActionButton(
              backgroundColor: const Color(0xFF656ED3),
              onPressed: _mostrarDialogoNovoPost,
              child: const Icon(Icons.add, color: Colors.white),
            ),
      body: _carregando
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                if (_escolas.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: DropdownButtonFormField<String>(
                      value: _escolaSelecionada,
                      decoration: const InputDecoration(
                        labelText: 'Escola',
                        border: OutlineInputBorder(),
                      ),
                      items: _escolas
                          .map((escola) => DropdownMenuItem(
                                value: escola.id,
                                child: Text(escola.nome),
                              ))
                          .toList(),
                      // Adm fica travado na própria escola, como no web.
                      onChanged: _isAdm
                          ? null
                          : (value) =>
                              setState(() => _escolaSelecionada = value),
                    ),
                  ),
                Expanded(child: _buildListaDePosts()),
              ],
            ),
    );
  }

  Widget _buildListaDePosts() {
    final escola = _escolaSelecionada;
    if (escola == null) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Text(
            'Você não tem nenhum curso aprovado.\n'
            'Cadastre um curso pelo aplicativo web para ver o fórum da sua escola.',
            textAlign: TextAlign.center,
          ),
        ),
      );
    }

    return StreamBuilder<List<Post>>(
      stream: _postService.postsDaEscola(escola),
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return Center(
            child: Text('Erro ao carregar as postagens: ${snapshot.error}'),
          );
        }
        if (!snapshot.hasData) {
          return const Center(child: CircularProgressIndicator());
        }

        final posts = snapshot.data!;
        if (posts.isEmpty) {
          return const Center(child: Text('Nenhuma postagem dessa escola.'));
        }

        return ListView.builder(
          itemCount: posts.length,
          itemBuilder: (context, index) => _buildPost(posts[index]),
        );
      },
    );
  }

  Widget _buildPost(Post post) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundImage: (post.userImage != null &&
                          post.userImage!.isNotEmpty)
                      ? NetworkImage(post.userImage!)
                      : null,
                  child: (post.userImage == null || post.userImage!.isEmpty)
                      ? const Icon(Icons.person)
                      : null,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    post.userName,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (post.adm.isNotEmpty)
                  const Icon(Icons.verified,
                      size: 18, color: Color(0xFF656ED3)),
              ],
            ),
            const SizedBox(height: 8),
            if (post.content.isNotEmpty)
              Text(post.content, style: const TextStyle(fontSize: 16)),
            if (post.imgURL != null && post.imgURL!.isNotEmpty) ...[
              const SizedBox(height: 8),
              ClipRRect(
                borderRadius: BorderRadius.circular(5),
                child: Image.network(
                  post.imgURL!,
                  width: 250,
                  fit: BoxFit.cover,
                ),
              ),
            ],
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Chip(
                  label: Text(post.tag, style: const TextStyle(fontSize: 12)),
                  visualDensity: VisualDensity.compact,
                ),
                Text(
                  post.dataFormatada,
                  style: TextStyle(color: Colors.grey[600], fontSize: 12),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _mostrarDialogoNovoPost() {
    final contentController = TextEditingController();
    XFile? imagemSelecionada;
    String cursoSelecionado = 'todos';

    final cursosDaEscola = _cursos
        .where((curso) => curso.idEscola == _escolaSelecionada)
        .toList();

    showDialog(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (dialogContext, setDialogState) {
            return AlertDialog(
              title: const Text('Nova Postagem'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TextField(
                      controller: contentController,
                      decoration:
                          const InputDecoration(labelText: 'Escreva aqui'),
                      maxLines: 5,
                      minLines: 1,
                    ),
                    const SizedBox(height: 16),
                    // Curso define a tag do post ("nome-periodo" ou "todos"),
                    // igual ao fórum web. Adm posta sempre para todos.
                    if (!_isAdm && cursosDaEscola.isNotEmpty)
                      DropdownButtonFormField<String>(
                        value: cursoSelecionado,
                        decoration: const InputDecoration(labelText: 'Curso'),
                        items: [
                          const DropdownMenuItem(
                            value: 'todos',
                            child: Text('todos'),
                          ),
                          ...cursosDaEscola.map((curso) => DropdownMenuItem(
                                value: curso.id,
                                child: Text(curso.tag),
                              )),
                        ],
                        onChanged: (value) => setDialogState(
                            () => cursoSelecionado = value ?? 'todos'),
                      ),
                    const SizedBox(height: 16),
                    OutlinedButton.icon(
                      icon: const Icon(Icons.add_a_photo),
                      label: Text(imagemSelecionada == null
                          ? 'Adicionar imagem (opcional)'
                          : 'Imagem selecionada'),
                      onPressed: () async {
                        final imagem = await ImagePicker()
                            .pickImage(source: ImageSource.gallery);
                        if (imagem != null) {
                          setDialogState(() => imagemSelecionada = imagem);
                        }
                      },
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(dialogContext).pop(),
                  child: const Text('Cancelar'),
                ),
                ElevatedButton(
                  onPressed: () async {
                    Navigator.of(dialogContext).pop();
                    await _publicarPost(
                      content: contentController.text.trim(),
                      imagem: imagemSelecionada,
                      cursoID: cursoSelecionado,
                      cursosDaEscola: cursosDaEscola,
                    );
                  },
                  child: const Text('Postar'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Future<void> _publicarPost({
    required String content,
    XFile? imagem,
    required String cursoID,
    required List<CursoUsuario> cursosDaEscola,
  }) async {
    final user = FirebaseAuth.instance.currentUser;
    final escolaID = _escolaSelecionada;
    if (user == null || escolaID == null) return;

    // Mesma regra do web: precisa de conteúdo ou imagem.
    if (content.isEmpty && imagem == null) {
      _mostrarMensagem('Escreva algo ou selecione uma imagem.');
      return;
    }

    String tag = 'todos';
    if (cursoID != 'todos') {
      final curso = cursosDaEscola.where((c) => c.id == cursoID).toList();
      if (curso.isNotEmpty) tag = curso.first.tag;
    }

    try {
      await _postService.criarPost(
        content: content,
        imagem: imagem != null ? File(imagem.path) : null,
        schoolID: escolaID,
        schoolName: await _nomeDaEscola(escolaID),
        tag: tag,
        userID: user.uid,
        userName: _perfil?.displayName ?? user.displayName ?? '',
        userImage: _perfil?.imageUrl,
        adm: _perfil?.adm ?? '',
      );
      _mostrarMensagem('Postagem publicada!');
    } catch (error) {
      _mostrarMensagem('Erro ao publicar: $error');
    }
  }

  void _mostrarMensagem(String texto) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(texto)));
  }
}
