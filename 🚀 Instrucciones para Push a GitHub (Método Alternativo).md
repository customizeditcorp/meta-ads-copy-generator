# 🚀 Instrucciones para Push a GitHub (Método Alternativo)

Ya que la autenticación automática no funcionó, aquí tienes **3 métodos** para hacer el push:

---

## Método 1: GitHub Web UI (Más Fácil) ⭐

### Paso 1: Descargar el archivo patch
Descarga este archivo: `bannerbear-integration.patch` (adjunto en este chat)

### Paso 2: Ir a tu repositorio en GitHub
https://github.com/customizeditcorp/meta-ads-copy-generator

### Paso 3: Crear nueva rama
1. Click en el dropdown de ramas (dice "main")
2. Escribe: `feature/bannerbear-integration`
3. Click en "Create branch: feature/bannerbear-integration"

### Paso 4: Subir archivos
1. Click en "Add file" → "Upload files"
2. Arrastra todos los archivos del proyecto actualizado
3. Commit message: "feat: Complete Bannerbear integration"
4. Click en "Commit changes"

### Paso 5: Crear Pull Request
1. GitHub te mostrará un banner "Compare & pull request"
2. Click en ese botón
3. Revisa los cambios
4. Click en "Create pull request"
5. Click en "Merge pull request"

---

## Método 2: Usando Git Localmente (Si tienes Git instalado)

### Opción A: Clonar y aplicar patch

```bash
# 1. Clonar el repo
git clone https://github.com/customizeditcorp/meta-ads-copy-generator.git
cd meta-ads-copy-generator

# 2. Aplicar el patch
git am < /path/to/bannerbear-integration.patch

# 3. Push
git push origin feature/bannerbear-integration

# 4. Crear PR y merge
gh pr create --title "Bannerbear Integration" --fill
gh pr merge --merge
```

### Opción B: Descargar ZIP y subir

```bash
# 1. Descargar el ZIP del proyecto actualizado (adjunto)
# 2. Extraer
# 3. Ir a GitHub Web
# 4. Upload files
```

---

## Método 3: Usar GitHub Desktop

### Paso 1: Instalar GitHub Desktop
https://desktop.github.com/

### Paso 2: Clonar el repositorio
1. File → Clone repository
2. Seleccionar: customizeditcorp/meta-ads-copy-generator
3. Clone

### Paso 3: Crear rama
1. Branch → New branch
2. Nombre: feature/bannerbear-integration
3. Create branch

### Paso 4: Copiar archivos actualizados
1. Copiar todos los archivos del proyecto actualizado
2. Pegar en la carpeta clonada
3. GitHub Desktop detectará los cambios

### Paso 5: Commit y Push
1. Escribir commit message: "feat: Complete Bannerbear integration"
2. Click en "Commit to feature/bannerbear-integration"
3. Click en "Push origin"

### Paso 6: Crear Pull Request
1. Click en "Create Pull Request"
2. Revisar cambios
3. Merge

---

## 📦 Archivos que necesitas

Te he preparado estos archivos:

1. **bannerbear-integration.patch** - Patch con todos los cambios
2. **bannerbear-integration-complete.zip** - ZIP con el proyecto completo
3. **DEPLOYMENT_INSTRUCTIONS.md** - Instrucciones post-deploy

Todos están adjuntos en este mensaje.

---

## ✅ Después del Push

Una vez que hagas el push y merge a `main`, tu webapp en Manus se actualizará automáticamente.

**Pero necesitas hacer estos pasos finales:**

### 1. Correr Migraciones en Base de Datos

Conectar a tu TiDB y ejecutar:

```sql
-- Archivo: drizzle/migrations/0001_add_bannerbear_tables.sql
CREATE TABLE IF NOT EXISTS client_photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  clientKnowledgeBaseId INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  url MEDIUMTEXT NOT NULL,
  thumbnailUrl MEDIUMTEXT,
  description TEXT,
  category VARCHAR(50),
  isActive BOOLEAN DEFAULT TRUE,
  uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (clientKnowledgeBaseId) REFERENCES knowledgeBase(id) ON DELETE CASCADE,
  INDEX idx_client_active (clientKnowledgeBaseId, isActive)
);

-- ... (resto del SQL en el archivo)
```

O simplemente ejecutar:
```bash
mysql -h tu_tidb_host -u tu_user -p tu_database < drizzle/migrations/0001_add_bannerbear_tables.sql
mysql -h tu_tidb_host -u tu_user -p tu_database < drizzle/seeds/001_jv_roofing_bannerbear.sql
```

### 2. Agregar Variable de Entorno en Manus

En tu proyecto de Manus, agregar:
```
BANNERBEAR_API_KEY=bb_pr_68c446c743c4b27916126868d25fa3
```

### 3. Verificar que funciona

1. Ir a tu webapp: https://tu-webapp.manus.im
2. Navegar a: `/images?campaignId=1`
3. Probar el flujo completo

---

## 🆘 Si tienes problemas

1. **Error al aplicar patch:**
   - Usar Método 1 (GitHub Web UI)
   - Es el más fácil y no requiere comandos

2. **No puedes acceder a la base de datos:**
   - Contactar a soporte de Manus
   - O usar el panel de control de TiDB

3. **La webapp no se actualiza:**
   - Verificar que el merge a `main` se completó
   - Manus puede tardar 1-2 minutos en redesplegar

---

## 📊 Resumen

**Archivos creados:** 19  
**Líneas de código:** ~2,720  
**Tablas de BD:** 3  
**Endpoints API:** 7  
**Componentes React:** 5  

**Estado:** ✅ Código completo y listo  
**Falta:** Push a GitHub + Migraciones de BD  

---

**¿Cuál método prefieres usar?**
- Método 1: GitHub Web (más fácil)
- Método 2: Git local
- Método 3: GitHub Desktop

Avísame y te ayudo con el que elijas.
