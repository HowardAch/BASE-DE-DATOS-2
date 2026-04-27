import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.OffsetDateTime;

/**
 * Nota: el navegador NO ejecuta Java.
 * Este archivo es opcional (por tu requisito "Java") y sirve como utilidad:
 * genera un JSON de ejemplo para importar en la web (Importar JSON).
 */
public class ActividadExporter {
  public static void main(String[] args) throws Exception {
    String json = """
      {
        "app": "Base de Datos 2 · Actividades semanales (UPLA)",
        "exportedAt": "%s",
        "items": [
          {
            "id": "java_demo_1",
            "week": 3,
            "date": "2026-04-27",
            "title": "Normalización: 1FN, 2FN, 3FN",
            "description": "Ejercicios de descomposición y dependencias funcionales.",
            "link": ""
          }
        ]
      }
      """.formatted(OffsetDateTime.now().toString());

    Path out = Path.of("bd2_actividades_java_demo.json");
    Files.writeString(out, json, StandardCharsets.UTF_8);
    System.out.println("Archivo generado: " + out.toAbsolutePath());
  }
}

