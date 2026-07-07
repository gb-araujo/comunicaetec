import 'package:firebase_database/firebase_database.dart';

/// Perfil do usuário em `users/{uid}`, no mesmo formato gravado pelo
/// frontend web: displayName, email, imageUrl (download URL) e adm.
class PerfilUsuario {
  final String displayName;
  final String email;
  final String? imageUrl;
  final String adm;

  PerfilUsuario({
    required this.displayName,
    required this.email,
    this.imageUrl,
    this.adm = '',
  });

  factory PerfilUsuario.fromMap(Map<dynamic, dynamic> map) {
    return PerfilUsuario(
      // 'name' é o campo legado gravado por versões antigas do app mobile.
      displayName: (map['displayName'] ?? map['name'] ?? '') as String,
      email: (map['email'] ?? '') as String,
      imageUrl: map['imageUrl'] as String?,
      adm: (map['adm'] ?? '') as String,
    );
  }
}

/// Curso cadastrado em `users/{uid}/curso/{cursoID}`, como o web grava
/// no CursoForm: idEscola, schoolName, name, periodo, status.
class CursoUsuario {
  final String id;
  final String nome;
  final String periodo;
  final String idEscola;
  final String nomeEscola;
  final String status;

  CursoUsuario({
    required this.id,
    required this.nome,
    required this.periodo,
    required this.idEscola,
    required this.nomeEscola,
    required this.status,
  });

  /// Tag no mesmo formato do fórum web: "nome-periodo".
  String get tag => '$nome-$periodo';
}

class EscolaUsuario {
  final String id;
  final String nome;

  EscolaUsuario({required this.id, required this.nome});
}

class UserService {
  final FirebaseDatabase _db = FirebaseDatabase.instance;

  Future<PerfilUsuario?> carregarPerfil(String uid) async {
    final snapshot = await _db.ref('users/$uid').get();
    final value = snapshot.value;
    if (value is! Map) return null;
    return PerfilUsuario.fromMap(value);
  }

  /// Cursos com status "aprovado", igual ao filtro do web
  /// (AvisoUser/ForumDuvidas só consideram cursos aprovados).
  Future<List<CursoUsuario>> cursosAprovados(String uid) async {
    final snapshot = await _db.ref('users/$uid/curso').get();
    final value = snapshot.value;
    if (value is! Map) return [];

    final cursos = <CursoUsuario>[];
    value.forEach((cursoID, dados) {
      if (dados is! Map) return;
      final curso = CursoUsuario(
        id: cursoID.toString(),
        nome: (dados['name'] ?? '') as String,
        periodo: (dados['periodo'] ?? '') as String,
        idEscola: (dados['idEscola'] ?? '') as String,
        nomeEscola: (dados['schoolName'] ?? '') as String,
        status: (dados['status'] ?? '') as String,
      );
      if (curso.status == 'aprovado') {
        cursos.add(curso);
      }
    });
    return cursos;
  }

  /// Reduz os cursos aprovados às escolas únicas, como o web faz para
  /// montar o seletor de escola.
  List<EscolaUsuario> escolasDosCursos(List<CursoUsuario> cursos) {
    final porEscola = <String, EscolaUsuario>{};
    for (final curso in cursos) {
      porEscola.putIfAbsent(
        curso.idEscola,
        () => EscolaUsuario(id: curso.idEscola, nome: curso.nomeEscola),
      );
    }
    return porEscola.values.toList();
  }
}
