# Migrating from `http` to `dio` — Complete Guide

## Why Switch Now (Before It's Too Late)

`http` is fine for simple requests, but as your app grows you'll want things `http` doesn't give you out of the box:

- **Interceptors** — automatically attach the JWT token to every request, without repeating `_authHeaders()` in every service file
- **Automatic JSON parsing** — no manual `jsonDecode(response.body)` everywhere
- **Better error handling** — distinguishes timeout vs no-internet vs server error vs cancelled request, as different exception types
- **Request/response logging** — see exactly what's sent and received, great for debugging
- **Global base URL + headers config** — one place to change `baseUrl` instead of every service file
- **Request cancellation** — cancel in-flight requests (e.g., user navigates away mid-fetch)

Switching now (with 2-3 service files) is a 30-minute job. Switching later (with 15 service files) is a multi-hour refactor. Good call doing it now.

---

## Step 1 — Add the Package

```yaml
dependencies:
  dio: ^5.7.0
```

Run:
```bash
flutter pub get
```

You can remove `http` from `pubspec.yaml` once the migration is done (keep it during migration in case some files aren't converted yet).

---

## Step 2 — Create a Centralized Dio Client (The Core Concept)

This is the single most important change. Instead of every service file repeating `baseUrl`, headers, and error handling, you create **one configured `Dio` instance** that all services share.

### `lib/core/network/dio_client.dart`

```dart
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class DioClient {
  DioClient._(); // prevent instantiation — same pattern as your other utility classes

  static const String baseUrl = "http://192.168.1.5:5555/api";
  static final _storage = const FlutterSecureStorage();

  static Dio? _dio;

  // Singleton pattern — the SAME Dio instance is reused everywhere,
  // so interceptors/config are only set up once.
  static Dio get instance {
    _dio ??= _createDio();
    return _dio!;
  }

  static Dio _createDio() {
    final dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        headers: {
          "Content-Type": "application/json",
        },
      ),
    );

    // INTERCEPTOR: runs before every request and after every response.
    // This is the #1 reason to switch to dio.
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Automatically attach the JWT token to EVERY request.
          // No more repeating _authHeaders() in every service file.
          final token = await _storage.read(key: 'jwt');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options); // continue with the request
        },

        onResponse: (response, handler) {
          // You could log responses here, transform data, etc.
          return handler.next(response);
        },

        onError: (DioException error, handler) {
          // Centralized error logging — see every failed request in one place
          print('DIO ERROR: ${error.requestOptions.path}');
          print('MESSAGE: ${error.message}');
          return handler.next(error);
        },
      ),
    );

    // LOGGING INTERCEPTOR (optional, great for development)
    dio.interceptors.add(
      LogInterceptor(
        requestBody: true,
        responseBody: true,
      ),
    );

    return dio;
  }
}
```

### Key Concepts

- **Singleton (`_dio ??= ...`)** → Ensures only ONE `Dio` instance exists for your whole app. Interceptors are configured once, and connections can be reused efficiently. The `??=` operator means "assign only if currently null."

- **`InterceptorsWrapper`** → Lets you hook into the request/response lifecycle. The `onRequest` hook is the big win — it automatically reads your stored JWT and attaches it to every outgoing request. You will **never write `Authorization: Bearer $token` manually again.**

- **`handler.next(...)`** → Tells dio "I'm done modifying this, continue processing it." If you skip this call, the request hangs forever.

- **`LogInterceptor`** → A built-in interceptor that prints full request/response details to your console. Massively useful while debugging — remove or guard it behind `kDebugMode` before shipping to production (it can leak sensitive data like tokens into logs).

---

## Step 3 — Convert a Service File (Before/After)

### Before (`http`)

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/player_model.dart';

class PlayerService {
  static const String baseUrl = "http://192.168.1.5:5555/api";
  final _storage = const FlutterSecureStorage();

  Future<Map<String, String>> _authHeaders() async {
    final token = await _storage.read(key: 'jwt');
    return {
      "Content-Type": "application/json",
      "Authorization": "Bearer $token",
    };
  }

  Future<Player> getMyProfile() async {
    final response = await http.get(
      Uri.parse("$baseUrl/players/me"),
      headers: await _authHeaders(),
    );

    if (response.statusCode == 200) {
      return Player.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
    }
    throw Exception('Failed to fetch profile: ${response.statusCode}');
  }
}
```

### After (`dio`)

```dart
import 'package:dio/dio.dart';
import '../../../core/network/dio_client.dart';
import '../models/player_model.dart';

class PlayerService {
  final Dio _dio = DioClient.instance; // ✅ no baseUrl, no manual headers needed

  Future<Player> getMyProfile() async {
    try {
      final response = await _dio.get('/players/me');
      // ✅ response.data is ALREADY a Map<String, dynamic> — no jsonDecode needed
      return Player.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception('Failed to fetch profile: ${e.message}');
    }
  }
}
```

### What Changed and Why

| `http` | `dio` | Why |
|---|---|---|
| `Uri.parse("$baseUrl/path")` | `'/path'` | `baseUrl` is configured once in `DioClient`, you only write the relative path |
| `headers: await _authHeaders()` | *(removed entirely)* | The interceptor attaches the token automatically |
| `jsonDecode(response.body)` | `response.data` | dio **automatically parses JSON** for you — no manual decoding |
| `if (response.statusCode == 200)` | `try { } on DioException` | dio throws an exception automatically for any non-2xx status — you don't need to manually check status codes |
| `Exception('...: ${response.statusCode}')` | `on DioException catch (e)` | dio gives you a structured exception object with `.message`, `.type`, `.response`, etc. |

---

## Step 4 — Understanding `DioException` (Error Handling)

This is one of dio's biggest advantages — instead of just a status code, you get a **typed exception** that tells you exactly *what kind* of failure happened.

```dart
Future<Player> getMyProfile() async {
  try {
    final response = await _dio.get('/players/me');
    return Player.fromJson(response.data as Map<String, dynamic>);
  } on DioException catch (e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.receiveTimeout:
        throw Exception('Connection timed out. Please try again.');

      case DioExceptionType.connectionError:
        throw Exception('No internet connection.');

      case DioExceptionType.badResponse:
        // Server responded, but with an error status (400, 401, 500, etc.)
        final statusCode = e.response?.statusCode;
        if (statusCode == 401) {
          throw Exception('Session expired. Please log in again.');
        }
        throw Exception('Server error: $statusCode');

      default:
        throw Exception('Something went wrong: ${e.message}');
    }
  }
}
```

### Key Concept: `DioExceptionType`

| Type | Meaning |
|---|---|
| `connectionTimeout` | Couldn't establish a connection in time |
| `receiveTimeout` | Connected, but server took too long to respond |
| `connectionError` | No internet / DNS failure / server unreachable |
| `badResponse` | Server responded with a non-2xx status code (this replaces your old `if (response.statusCode == 200)` check) |
| `cancel` | Request was manually cancelled (see Step 6) |

This lets you show **different error messages** for different failures — "No internet" vs "Server error" vs "Session expired" — something that took much more manual code with `http`.

---

## Step 5 — POST Requests (e.g., Login)

### Before (`http`)

```dart
Future<String?> login({required String email, required String password}) async {
  final response = await http.post(
    Uri.parse("$baseUrl/auth/login"),
    headers: {"Content-Type": "application/json"},
    body: jsonEncode({"email": email, "password": password}),
  );

  if (response.statusCode == 200 || response.statusCode == 201) {
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    return data['token']?.toString();
  }
  return null;
}
```

### After (`dio`)

```dart
Future<String?> login({required String email, required String password}) async {
  try {
    final response = await _dio.post(
      '/auth/login',
      data: {"email": email, "password": password}, // ✅ no jsonEncode needed
    );

    final data = response.data as Map<String, dynamic>;
    return data['token']?.toString();
  } on DioException catch (e) {
    return null; // or rethrow / handle specific error types
  }
}
```

Notice: **`jsonEncode` is gone too** — dio automatically serializes the `Map` you pass to `data:` into a JSON body (because `Content-Type: application/json` is already set in `BaseOptions`).

---

## Step 6 — Bonus: Cancelling Requests (Not Possible with `http`)

Useful when, e.g., the user navigates away from a screen while a request is still in flight.

```dart
class PlayerService {
  final Dio _dio = DioClient.instance;
  CancelToken? _cancelToken;

  Future<Player> getMyProfile() async {
    _cancelToken = CancelToken();

    try {
      final response = await _dio.get(
        '/players/me',
        cancelToken: _cancelToken,
      );
      return Player.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      if (e.type == DioExceptionType.cancel) {
        throw Exception('Request was cancelled');
      }
      throw Exception('Failed to fetch profile: ${e.message}');
    }
  }

  void cancelRequest() {
    _cancelToken?.cancel('Screen disposed');
  }
}
```

Call `cancelRequest()` in a screen's `dispose()` method to stop wasted network/parsing work when the user navigates away mid-fetch.

---

## Step 7 — Migration Checklist

Go file by file through your services:

- [ ] `lib/core/network/dio_client.dart` — create this first (the shared instance)
- [ ] `lib/services/auth_service.dart` (or wherever it now lives in your new structure) — convert `login`, `register`
- [ ] `lib/data/datasources/player_*.dart` — convert `getMyProfile`, `getMyStats`
- [ ] Any future club/tournament datasource files — write them in `dio` directly, no need to start with `http`
- [ ] Remove `import 'package:http/http.dart' as http;` from each converted file
- [ ] Remove `import 'dart:convert';` if `jsonEncode`/`jsonDecode` are no longer used in that file
- [ ] Once all files are converted, remove `http` from `pubspec.yaml`

---

## Quick Reference — Syntax Cheat Sheet

| Action | `http` | `dio` |
|---|---|---|
| GET | `http.get(Uri.parse(url), headers: ...)` | `dio.get('/path')` |
| POST | `http.post(Uri.parse(url), headers: ..., body: jsonEncode(data))` | `dio.post('/path', data: data)` |
| Read response body | `jsonDecode(response.body)` | `response.data` (already decoded) |
| Status code | `response.statusCode` | `response.statusCode` (same) |
| Check success | `if (response.statusCode == 200)` | Not needed — non-2xx auto-throws `DioException` |
| Error handling | Manual `if` checks | `try { } on DioException catch (e)` |
| Query params | Manual string building (`?key=value`) | `dio.get('/path', queryParameters: {'key': 'value'})` |
| Upload files | Verbose `MultipartRequest` | `FormData.fromMap({'file': await MultipartFile.fromFile(path)})` |

---

## Summary — The Mental Model

```
Before (http):  Every service file repeats baseUrl + headers + error checks
                       ↓
After (dio):    ONE DioClient.instance configured once
                       ↓
                Every service just calls dio.get('/path') or dio.post('/path', data: ...)
                       ↓
                Token attachment, JSON parsing, error typing — all automatic
```

The biggest win isn't really "dio vs http" as libraries — it's that you're **centralizing cross-cutting concerns** (auth headers, base URL, error handling, logging) into one place instead of duplicating them across every service file. This is the same principle as `RouteConstants` or `PlayerProvider` — single source of truth, less duplication, fewer bugs as the app grows.