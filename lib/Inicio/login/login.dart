import 'package:flutter/material.dart';
import 'package:my_gasolinera/Inicio/inicio.dart';
import 'package:my_gasolinera/Inicio/login/recuperar.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _rememberMe = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFFFE8DA),
      appBar: AppBar(
        title: const Text('Volver'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back,
            color: Color(0xFF492714),
          ),
          onPressed: (){
            Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const Inicio(),
                  ),
                );
          },
        ),
      ),
      body: Stack(
        children: [
          Center(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo
                  Image.asset(
                    'assets/images/logo-mygasolinera.png',
                    width: 200,
                    fit: BoxFit.contain,
                  ),
                  const SizedBox(height: 20),
                  // Título
                  const Text(
                    'MyGasolinera',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF492714),
                    ),
                  ),
                  const SizedBox(height: 40),
                  
                  // Campo de email
                  SizedBox(
                    width: 1000,
                    child: TextFormField(
                      decoration: InputDecoration(
                        labelText: 'e-mail',
                        labelStyle: TextStyle(color: Color(0xFF492714)),
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: BorderSide(color: Color(0xFF492714)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: BorderSide(color: Color(0xFF492714), width: 2),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  
                  // Campo de contraseña
                  SizedBox(
                    width: 1000,
                    child: TextFormField(
                      obscureText: true,
                      decoration: InputDecoration(
                        labelText: 'contraseña',
                        labelStyle: TextStyle(color: Color(0xFF492714)),
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: BorderSide(color: Color(0xFF492714)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: BorderSide(color: Color(0xFF492714), width: 2),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 15),
                  
                  // Checkbox "Recuérdame"
                  SizedBox(
                    width: 1000,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        Checkbox(
                          value: _rememberMe,
                          onChanged: (bool? value) {
                            setState(() {
                              _rememberMe = value ?? false;
                            });
                          },
                          activeColor: Color(0xFFFF9350),
                          checkColor: Color(0xFF492714),
                        ),
                        Text(
                          'Recuérdame',
                          style: TextStyle(
                            color: Color(0xFF492714),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  
                  // Botón Iniciar sesión
                  ElevatedButton(
                    onPressed: () {
                      // Acción para iniciar sesión
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Color(0xFFFF9350),
                      foregroundColor: Color(0xFF492714),
                      padding: EdgeInsets.symmetric(horizontal: 100, vertical: 15),
                      side: BorderSide(
                        color: Color(0xFF492714),
                        width: 2.0
                      ),
                      textStyle: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: const Text('Iniciar sesión'),
                  ),
                  const SizedBox(height: 15),
                  
                  // Enlace "¿Has olvidado la contraseña?"
                  TextButton(
                    onPressed: () {
                      // Acción para recuperar contraseña
                      Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => const RecuperarPassword(),
                  ),
                );
                    },
                    child: Text(
                      '¿Has olvidado la contraseña?',
                      style: TextStyle(
                        color: Color(0xFF492714),
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}