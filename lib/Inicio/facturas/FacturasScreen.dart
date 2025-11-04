import 'package:flutter/material.dart';
import 'CrearFacturaScreen.dart';
import 'DetalleFacturaScreen.dart';

class FacturasScreen extends StatefulWidget {
  const FacturasScreen({super.key});

  @override
  State<FacturasScreen> createState() => _FacturasScreenState();
}

class _FacturasScreenState extends State<FacturasScreen> {
  // Lista de ejemplo de facturas
  final List<Map<String, dynamic>> _facturas = [
    {
      'id': '1',
      'titulo': 'Gasolina Regular',
      'costoTotal': 45.50,
      'fecha': '2024-01-15',
      'hora': '14:30',
      'descripcion': 'Llenado de tanque completo',
    },
    {
      'id': '2',
      'titulo': 'Aceite Motor',
      'costoTotal': 25.00,
      'fecha': '2024-01-10',
      'hora': '10:15',
      'descripcion': 'Cambio de aceite sintético',
    },
  ];

  void _navegarACrearFactura() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const CrearFacturaScreen()),
    );

    if (result != null && result is Map<String, dynamic>) {
      setState(() {
        _facturas.add(result);
      });
    }
  }

  void _verDetalleFactura(Map<String, dynamic> factura) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => DetalleFacturaScreen(factura: factura),
      ),
    );
  }

  void _eliminarFactura(String id) {
    setState(() {
      _facturas.removeWhere((factura) => factura['id'] == id);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFFE8DA),
      appBar: AppBar(
        title: const Text(
          'Mis Facturas',
          style: TextStyle(
            color: Color(0xFF492714),
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back,
            color: Color(0xFF492714),
          ),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: _facturas.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.receipt_long,
                    size: 80,
                    color: Color(0xFFFF9350),
                  ),
                  SizedBox(height: 20),
                  Text(
                    'No hay facturas',
                    style: TextStyle(
                      fontSize: 18,
                      color: Color(0xFF492714),
                    ),
                  ),
                  SizedBox(height: 10),
                  Text(
                    'Presiona el botón + para agregar una factura',
                    style: TextStyle(
                      color: Color(0xFF492714),
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _facturas.length,
              itemBuilder: (context, index) {
                final factura = _facturas[index];
                return Card(
                  color: const Color(0xFFFFCFB0),
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(16),
                    leading: Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        color: const Color(0xFFFF9955),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.receipt,
                        color: Color(0xFF492714),
                      ),
                    ),
                    title: Text(
                      factura['titulo'],
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF492714),
                      ),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text(
                          '€${factura['costoTotal'].toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF492714),
                          ),
                        ),
                        Text(
                          '${factura['fecha']} - ${factura['hora']}',
                          style: const TextStyle(
                            color: Color(0xFF492714),
                          ),
                        ),
                      ],
                    ),
                    trailing: IconButton(
                      icon: const Icon(
                        Icons.delete,
                        color: Color(0xFF492714),
                      ),
                      onPressed: () => _eliminarFactura(factura['id']),
                    ),
                    onTap: () => _verDetalleFactura(factura),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _navegarACrearFactura,
        backgroundColor: const Color(0xFFFF9350),
        foregroundColor: const Color(0xFF492714),
        child: const Icon(Icons.add),
      ),
    );
  }
}