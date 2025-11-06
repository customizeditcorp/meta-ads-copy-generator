# 🚀 Guía Paso a Paso - Push Manual a GitHub

## Método Más Simple (GitHub Web) - 10 minutos

### Paso 1: Ir a tu repositorio en GitHub
Abre en tu navegador:
```
https://github.com/customizeditcorp/meta-ads-copy-generator
```

### Paso 2: Crear nueva rama
1. Click en el botón que dice "main" (arriba a la izquierda)
2. En el campo de texto, escribe: `feature/bannerbear-integration`
3. Click en "Create branch: feature/bannerbear-integration from main"

### Paso 3: Subir archivos
1. Click en "Add file" → "Upload files"
2. Arrastra TODOS los archivos de la carpeta `meta-ads-copy-generator` (excepto `.git`, `node_modules`, `dist`)
3. En "Commit message" escribe: `feat: Complete Bannerbear integration`
4. Click en "Commit changes"

### Paso 4: Crear Pull Request
1. GitHub te mostrará un banner amarillo que dice "Compare & pull request"
2. Click en ese botón
3. Revisa los cambios
4. Click en "Create pull request"

### Paso 5: Merge a main
1. Click en "Merge pull request"
2. Click en "Confirm merge"

### ✅ ¡Listo! Tu código está en GitHub

---

## Método Alternativo (Terminal Local) - 5 minutos

Si tienes Git instalado en tu computadora:

### Paso 1: Abrir terminal

### Paso 2: Ejecutar estos comandos

```bash
# 1. Clonar el repo (si no lo tienes)
git clone https://github.com/customizeditcorp/meta-ads-copy-generator.git
cd meta-ads-copy-generator

# 2. Descargar el patch que te envié
# Coloca el archivo "bannerbear-integration.patch" en esta carpeta

# 3. Crear rama y aplicar cambios
git checkout main
git pull origin main
git checkout -b feature/bannerbear-integration
git am < bannerbear-integration.patch

# 4. Push a GitHub
git push origin feature/bannerbear-integration

# 5. Crear PR (opcional)
gh pr create --title "Bannerbear Integration" --fill
```

### ✅ ¡Listo!

---

## Método con Script Automático - 3 minutos

### Paso 1: Descargar archivos
Descarga estos 2 archivos que te envié:
- `PUSH_TO_GITHUB.sh`
- `bannerbear-integration.patch`

### Paso 2: Ejecutar script
```bash
chmod +x PUSH_TO_GITHUB.sh
./PUSH_TO_GITHUB.sh
```

El script te guiará paso a paso.

### ✅ ¡Listo!

---

## 📋 Después del Push

Una vez que hayas hecho el push y merge a `main`, tu webapp en Manus se actualizará automáticamente.

**Pero necesitas hacer estos 2 pasos finales:**

### 1. Correr Migraciones en Base de Datos

Conectar a tu TiDB y ejecutar:

```bash
mysql -h tu_tidb_host -u tu_user -p tu_database < drizzle/migrations/0001_add_bannerbear_tables.sql
mysql -h tu_tidb_host -u tu_user -p tu_database < drizzle/seeds/001_jv_roofing_bannerbear.sql
```

O desde el panel de TiDB, ejecutar el contenido de esos archivos.

### 2. Agregar Variable de Entorno en Manus

En tu proyecto de Manus, agregar esta variable:

```
BANNERBEAR_API_KEY=bb_pr_68c446c743c4b27916126868d25fa3
```

### 3. Verificar que funciona

1. Ir a tu webapp: `https://tu-webapp.manus.im`
2. Navegar a: `/images?campaignId=1`
3. Probar el flujo completo:
   - Seleccionar ángulo
   - Seleccionar foto
   - Generar imágenes (30-90 segundos)
   - Descargar imágenes

---

## 🆘 Si tienes problemas

### Problema: No puedo clonar el repositorio
**Solución:** Usa el Método 1 (GitHub Web), no requiere terminal.

### Problema: Error al aplicar el patch
**Solución:** Usa el Método 1 (GitHub Web), sube los archivos directamente.

### Problema: No tengo Git instalado
**Solución:** Usa el Método 1 (GitHub Web), funciona desde el navegador.

### Problema: La webapp no se actualiza después del merge
**Solución:** 
1. Verifica que el merge a `main` se completó
2. Espera 1-2 minutos para que Manus redespliegue
3. Refresca la página con Ctrl+F5

### Problema: Error "Table doesn't exist"
**Solución:** Correr las migraciones de base de datos (Paso 1 de "Después del Push")

---

## 📊 Resumen

**Archivos que necesitas:**
- `bannerbear-integration.patch` (para Método 2 o 3)
- `PUSH_TO_GITHUB.sh` (para Método 3)
- `0001_add_bannerbear_tables.sql` (para migraciones)
- `001_jv_roofing_bannerbear.sql` (para datos de prueba)

**Tiempo estimado:**
- Método 1 (GitHub Web): 10 minutos
- Método 2 (Terminal): 5 minutos
- Método 3 (Script): 3 minutos

**Dificultad:**
- Método 1: ⭐ Fácil (no requiere conocimientos técnicos)
- Método 2: ⭐⭐ Medio (requiere terminal)
- Método 3: ⭐⭐⭐ Avanzado (requiere terminal y Git)

---

## 🎯 Recomendación

**Si no tienes experiencia con Git:** Usa Método 1 (GitHub Web)

**Si tienes Git instalado:** Usa Método 2 (Terminal)

**Si quieres automatización:** Usa Método 3 (Script)

---

**¿Necesitas ayuda con algún paso específico? Avísame y te guío.**
