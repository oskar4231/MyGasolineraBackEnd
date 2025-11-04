import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'package:permission_handler/permission_handler.dart';


class CrearFacturaScreen extends StatefulWidget {
  const CrearFacturaScreen({super.key});

  @override
  State<CrearFacturaScreen> createState() => _CrearFacturaScreenState();
}

class _CrearFacturaScreenState extends State<CrearFacturaScreen> {
  final _formKey = GlobalKey<FormState>();
  final _tituloController = TextEditingController();
  final _costoController = TextEditingController();
  final _fechaController = TextEditingController();
  final _horaController = TextEditingController();
  final _descripcionController = TextEditingController();
  
  File? _imagenFactura;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    // Establecer fecha y hora actual por defecto
    final now = DateTime.now();
    _fechaController.text = _formatDate(now);
    _horaController.text = _formatTime(now);
  }

  String _formatDate(DateTime date) {
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  }

  String _formatTime(DateTime time) {
    return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
  }

  Future<void> _seleccionarImagen() async {
  // Solicitar permiso
  final status = await Permission.photos.request();
  
  if (status.isGranted) {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      setState(() {
        _imagenFactura = File(image.path);
      });
    }
  } else {
    // Mostrar mensaje si no se concedió el permiso
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Se necesita permiso para acceder a la galería')),
    );
  }
}

void _tomarFoto() async {
  // Solicitar permiso de cámara
  final status = await Permission.camera.request();
  
  if (status.isGranted) {
    final XFile? image = await _picker.pickImage(source: ImageSource.camera);
    if (image != null) {
      setState(() {
        _imagenFactura = File(image.path);
      });
    }
  } else {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Se necesita permiso para usar la cámara')),
    );
  }
}

  void _mostrarOpcionesImagen() {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        color: const Color(0xFFFFE8DA),
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.photo_library, color: Color(0xFF492714)),
              title: const Text('Galería', style: TextStyle(color: Color(0xFF492714))),
              onTap: () {
                Navigator.pop(context);
                _seleccionarImagen();
              },
            ),
            ListTile(
              leading: const Icon(Icons.camera_alt, color: Color(0xFF492714)),
              title: const Text('Cámara', style: TextStyle(color: Color(0xFF492714))),
              onTap: () {
                Navigator.pop(context);
                _tomarFoto();
              },
            ),
          ],
        ),
      ),
    );
  }

  void _guardarFactura() {
    if (_formKey.currentState!.validate()) {
      final nuevaFactura = {
        'id': DateTime.now().millisecondsSinceEpoch.toString(),
        'titulo': _tituloController.text,
        'costoTotal': double.parse(_costoController.text),
        'fecha': _fechaController.text,
        'hora': _horaController.text,
        'descripcion': _descripcionController.text,
        'imagenPath': _imagenFactura?.path,
      };

      Navigator.pop(context, nuevaFactura);
    }
  }

  @override
  void dispose() {
    _tituloController.dispose();
    _costoController.dispose();
    _fechaController.dispose();
    _horaController.dispose();
    _descripcionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFFE8DA),
      appBar: AppBar(
        title: const Text(
          'Nueva Factura',
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
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              // Campo Título
              TextFormField(
                controller: _tituloController,
                decoration: InputDecoration(
                  labelText: 'Título',
                  labelStyle: const TextStyle(color: Color(0xFF492714)),
                  filled: true,
                  fillColor: const Color(0xFFFFCFB0),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Por favor ingresa un título';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Campo Coste Total
              TextFormField(
                controller: _costoController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  labelText: 'Coste Total (€)',
                  labelStyle: const TextStyle(color: Color(0xFF492714)),
                  filled: true,
                  fillColor: const Color(0xFFFFCFB0),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Por favor ingresa el coste total';
                  }
                  if (double.tryParse(value) == null) {
                    return 'Por favor ingresa un número válido';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Campos Fecha y Hora en fila
              Row(
                children: [
                  // Campo Fecha
                  Expanded(
                    child: TextFormField(
                      controller: _fechaController,
                      decoration: InputDecoration(
                        labelText: 'Fecha',
                        labelStyle: const TextStyle(color: Color(0xFF492714)),
                        filled: true,
                        fillColor: const Color(0xFFFFCFB0),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                      ),
                      readOnly: true,
                      onTap: () async {
                        final DateTime? picked = await showDatePicker(
                          context: context,
                          initialDate: DateTime.now(),
                          firstDate: DateTime(2000),
                          lastDate: DateTime(2100),
                        );
                        if (picked != null) {
                          _fechaController.text = _formatDate(picked);
                        }
                      },
                    ),
                  ),
                  const SizedBox(width: 16),

                  // Campo Hora
                  Expanded(
                    child: TextFormField(
                      controller: _horaController,
                      decoration: InputDecoration(
                        labelText: 'Hora',
                        labelStyle: const TextStyle(color: Color(0xFF492714)),
                        filled: true,
                        fillColor: const Color(0xFFFFCFB0),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                      ),
                      readOnly: true,
                      onTap: () async {
                        final TimeOfDay? picked = await showTimePicker(
                          context: context,
                          initialTime: TimeOfDay.now(),
                        );
                        if (picked != null) {
                          _horaController.text =
                              '${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}';
                        }
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Botón para agregar imagen
              Container(
                width: double.infinity,
                height: 120,
                decoration: BoxDecoration(
                  color: const Color(0xFFFFCFB0),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: _imagenFactura == null
                    ? TextButton(
                        onPressed: _mostrarOpcionesImagen,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Icon(
                              Icons.add_photo_alternate,
                              size: 40,
                              color: Color(0xFF492714),
                            ),
                            SizedBox(height: 8),
                            Text(
                              'Agregar Imagen de Factura',
                              style: TextStyle(
                                color: Color(0xFF492714),
                              ),
                            ),
                          ],
                        ),
                      )
                    : Stack(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: Image.file(
                              _imagenFactura!,
                              width: double.infinity,
                              height: double.infinity,
                              fit: BoxFit.cover,
                            ),
                          ),
                          Positioned(
                            top: 8,
                            right: 8,
                            child: CircleAvatar(
                              backgroundColor: Colors.black54,
                              child: IconButton(
                                icon: const Icon(Icons.close, color: Colors.white),
                                onPressed: () {
                                  setState(() {
                                    _imagenFactura = null;
                                  });
                                },
                              ),
                            ),
                          ),
                        ],
                      ),
              ),
              const SizedBox(height: 16),

              // Campo Descripción
              TextFormField(
                controller: _descripcionController,
                maxLines: 4,
                decoration: InputDecoration(
                  labelText: 'Descripción',
                  labelStyle: const TextStyle(color: Color(0xFF492714)),
                  filled: true,
                  fillColor: const Color(0xFFFFCFB0),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Botón Guardar
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _guardarFactura,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFF9350),
                    foregroundColor: const Color(0xFF492714),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: const Text(
                    'Guardar Factura',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}