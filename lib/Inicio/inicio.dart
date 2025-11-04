import 'package:flutter/material.dart';
import 'package:my_gasolinera/Inicio/crear_cuenta/crear.dart';
import 'login/login.dart';

class Inicio extends StatelessWidget {
  const Inicio({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFFFE8DA),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Título en formato h1
            const Text(
              'MyGasolinera',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Color(0xFF492714), // Agregando 0xFF al inicio
              ),
            ),

            Container(
              margin: const EdgeInsets.only(bottom: 30.0),
              child: Image.asset(
                'lib/assets/logo.png',
                height: 100,
                width: 100,
                fit: BoxFit.contain,
              ),
            ),

            const SizedBox(height: 20), // Espacio entre el título y el primer botón
            ElevatedButton(
              onPressed: () {
                // Navegar a la pantalla de login
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const LoginScreen(),
                  ),
                );
              },
              //Configuración Estilo Boton
              style: ElevatedButton.styleFrom(
                backgroundColor: Color(0xFFFF9350), //Color boton
                foregroundColor: Color(0xFF492714), //Color del texto
                padding: EdgeInsets.symmetric(horizontal: 100, vertical: 35),
                side: BorderSide(
                  color: Color(0xFF492714),
                  width: 2.0
                ),
                textStyle: TextStyle(
                  fontSize: 18,
                  wordSpacing: 2.0
                )
              ),
              child: const Text('Iniciar Sesión'),
            ),
            const SizedBox(height: 10), // Espacio entre botones
            ElevatedButton(
              onPressed: () {
                // Navegar a la pantalla de registro (RegisterScreen)
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => const CrearScreen(),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor:  Color(0xFFFFCFB0),
                foregroundColor:  Color(0xFF492714),
                padding: EdgeInsets.symmetric(horizontal: 100, vertical: 35),
                side: BorderSide(
                  color: Color(0xFFFF9350),
                  width: 2.0
                ),
                textStyle: TextStyle(
                  fontSize: 18,
                  wordSpacing: 2.0
                )
              ),
              child: const Text('Crear Cuenta'),
            ),
          ],
        ),
      ),
    );
  }
}
