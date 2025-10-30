// Para compilar (Windows):
// javac -cp ".;mariadb-java-client-3.5.6.jar;json-20250517.jar" BBDD.java
// Para ejecutar (Windows):
// java -cp ".;mariadb-java-client-3.5.6.jar;json-20250517.jar" BBDD

import java.io.*;
import java.net.InetSocketAddress;
import java.sql.*;
import com.sun.net.httpserver.*;
import org.json.JSONObject;

public class BBDD {

    public static void main(String[] args) throws Exception {

        // Crear servidor HTTP en puerto 8081
        HttpServer server = HttpServer.create(new InetSocketAddress(8081), 0);
        System.out.println("Servidor iniciado en http://localhost:50968");

        server.createContext("/register", (exchange -> {

            if ("POST".equals(exchange.getRequestMethod())) {
                InputStreamReader isr = new InputStreamReader(exchange.getRequestBody(), "utf-8");
                BufferedReader br = new BufferedReader(isr);
                StringBuilder body = new StringBuilder();
                String line;
                while ((line = br.readLine()) != null) {
                    body.append(line);
                }

                Connection miConexion = null;
                PreparedStatement meterDatos = null;

                try {
                    JSONObject json = new JSONObject(body.toString());
                    String email = json.getString("email");
                    String password = json.getString("password");

                    // Conectar a la base de datos
                    miConexion = DriverManager.getConnection(
                            "jdbc:mariadb://127.0.0.1:3306/mygasolinera",
                            "root", "");

                    // Insertar datos - ASUNCIÓN: la tabla se llama 'usuarios' y tiene columnas
                    // 'email' y 'password_hash'
                    String sql = "INSERT INTO usuarios (email, password_hash) VALUES (?, ?)";
                    meterDatos = miConexion.prepareStatement(sql);
                    meterDatos.setString(1, email);
                    meterDatos.setString(2, password); // Guardamos en texto plano por ahora

                    int filasAfectadas = meterDatos.executeUpdate();

                    if (filasAfectadas > 0) {
                        System.out.println("Usuario registrado: " + email);
                    }

                    // Responder éxito al cliente
                    JSONObject responseJson = new JSONObject();
                    responseJson.put("status", "success");
                    responseJson.put("message", "Usuario creado correctamente");
                    String responseText = responseJson.toString();

                    exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
                    exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
                    exchange.sendResponseHeaders(200, responseText.getBytes("UTF-8").length);

                    OutputStream os = exchange.getResponseBody();
                    os.write(responseText.getBytes("UTF-8"));
                    os.close();

                } catch (SQLException e) {
                    System.err.println("Error SQL: " + e.getMessage());

                    JSONObject errorJson = new JSONObject();
                    errorJson.put("status", "error");

                    // Verificar si es error de duplicado
                    if (e.getMessage().contains("Duplicate") || e.getMessage().contains("duplicate")) {
                        errorJson.put("message", "El email ya está registrado");
                        exchange.sendResponseHeaders(409, -1); // Conflict
                    } else {
                        errorJson.put("message", "Error en la base de datos: " + e.getMessage());
                        exchange.sendResponseHeaders(500, -1);
                    }

                    String responseText = errorJson.toString();
                    exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
                    exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
                    exchange.sendResponseHeaders(500, responseText.getBytes("UTF-8").length);
                    OutputStream os = exchange.getResponseBody();
                    os.write(responseText.getBytes("UTF-8"));
                    os.close();

                } catch (Exception e) {
                    System.err.println("Error general: " + e.getMessage());

                    JSONObject errorJson = new JSONObject();
                    errorJson.put("status", "error");
                    errorJson.put("message", "Error del servidor: " + e.getMessage());
                    String responseText = errorJson.toString();

                    exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
                    exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
                    exchange.sendResponseHeaders(500, responseText.getBytes("UTF-8").length);
                    OutputStream os = exchange.getResponseBody();
                    os.write(responseText.getBytes("UTF-8"));
                    os.close();
                } finally {
                    // Cerrar recursos en el finally
                    try {
                        if (meterDatos != null)
                            meterDatos.close();
                        if (miConexion != null)
                            miConexion.close();
                    } catch (SQLException e) {
                        System.err.println("Error cerrando recursos: " + e.getMessage());
                    }
                }

            } else if ("OPTIONS".equals(exchange.getRequestMethod())) {
                // CORS preflight
                exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
                exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "POST, OPTIONS");
                exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
                exchange.sendResponseHeaders(204, -1);
            } else {
                exchange.sendResponseHeaders(405, -1); // Method Not Allowed
            }

        }));

        server.setExecutor(null);
        server.start();
    }
}