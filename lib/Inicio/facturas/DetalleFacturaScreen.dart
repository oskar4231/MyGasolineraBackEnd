import 'package:flutter/material.dart';
import 'dart:io';

class DetalleFacturaScreen extends StatelessWidget {
  final Map<String, dynamic> factura;

  const DetalleFacturaScreen({super.key, required this.factura});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFFE8DA),
      appBar: AppBar(
        title: const Text(
          'Detalle Factura',
          style: TextStyle(
            color: Color(0xFF492714),
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF492714)),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Imagen de la factura
            if (factura['imagenPath'] != null)
              Container(
                width: double.infinity,
                height: 200,
                margin: const EdgeInsets.only(bottom: 20),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.file(
                    File(factura['imagenPath']),
                    fit: BoxFit.cover,
                  ),
                ),
              ),

            // Información de la factura
            Card(
              color: const Color(0xFFFFCFB0),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Título
                    _buildInfoRow('Título', factura['titulo']),
                    const SizedBox(height: 12),
                    
                    // Costo Total
                    _buildInfoRow(
                      'Coste Total',
                      '€${factura['costoTotal'].toStringAsFixed(2)}',
                      isAmount: true,
                    ),
                    const SizedBox(height: 12),
                    
                    // Fecha y Hora
                    Row(
                      children: [
                        Expanded(
                          child: _buildInfoRow('Fecha', factura['fecha']),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: _buildInfoRow('Hora', factura['hora']),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    
                    // Descripción
                    if (factura['descripcion'] != null && factura['descripcion'].isNotEmpty)
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildInfoRow('Descripción', factura['descripcion']),
                        ],
                      ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {bool isAmount = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: Color(0xFF492714),
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: isAmount ? 20 : 16,
            color: const Color(0xFF492714),
            fontWeight: isAmount ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }
}