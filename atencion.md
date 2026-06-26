
---

# Proyecto

Crear una aplicación web para una peluquería.

## Tecnologías

* Frontend:

  * HTML
  * CSS
  * JavaScript (sin frameworks)

* Hosting:

  * Cloudflare Pages

* Base de datos:

  * Supabase

* Autenticación:

  * Supabase Auth (solo administrador)

---

# Objetivo

La web tiene dos partes:

## Parte pública

Los clientes pueden:

* Ver la página principal.
* Ver los servicios.
* Ver los horarios disponibles.
* Elegir un hueco libre.
* Pulsar un botón para reservar mediante WhatsApp.

Los clientes **NO** crean reservas directamente en la base de datos.

---

## Parte privada (/admin)

Solo la peluquera puede acceder mediante login.

Desde aquí puede:

* Ver las reservas.
* Crear una reserva.
* Editar una reserva.
* Eliminar una reserva.
* Ver el calendario.
* Gestionar los horarios disponibles.

---

# Base de datos

## Tabla servicios

```text
id (PK)
nombre
duracion
precio
activo
```

---

## Tabla reservas

```text
id (UUID PK)

nombre_cliente

telefono

servicio_id (FK -> servicios.id)

fecha

hora_inicio

observaciones

created_at
```

Relación:

```
servicios (1)
      │
      │
      ▼
reservas (N)
```

---

# Funcionamiento

La duración depende del servicio.

Ejemplo:

```
Corte hombre -> 30 min

Corte mujer -> 45 min

Uñas -> 60 min

Color -> 120 min
```

Los huecos disponibles se calculan automáticamente leyendo las reservas existentes.

---

# Calendario

Los clientes solo ven:

```
09:00 Libre

09:30 Ocupado

10:00 Libre
```

La peluquera ve:

```
09:00 María
Servicio: Uñas

10:00 Ana
Servicio: Corte

11:00 Libre
```

---

# Reservas

Las reservas solo las crea el administrador.

Los clientes envían un WhatsApp indicando:

* Nombre
* Día
* Hora deseada
* Servicio

La peluquera confirma la cita y la introduce desde el panel.

---

# Arquitectura

```
Cliente

↓

Cloudflare Pages

↓

Supabase
```

No existe backend propio.

Toda la lógica se realiza con JavaScript y Supabase.

---


# Objetivo del desarrollo

El código debe ser:

* Modular.
* Fácil de mantener.
* Sin frameworks.
* Preparado para crecer en el futuro.
* Compatible con Cloudflare Pages.
* Utilizando Supabase como único backend.

---

**Una recomendación adicional:** pídele expresamente al agente que construya el proyecto **por fases**, no todo de una vez. Por ejemplo:

1. Configurar la conexión con Supabase.
2. Implementar el login del administrador.
3. Crear el CRUD de servicios.
4. Crear el CRUD de reservas.
5. Mostrar el calendario de disponibilidad.
6. Integrar el botón de WhatsApp.
7. Mejorar la interfaz y añadir validaciones.
