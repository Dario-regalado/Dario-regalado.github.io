Vanesa's Peluqueria - Sitio Estatico para Raspberry Pi

Este proyecto ya no usa WordPress ni PHP.
Es una web estatica, ligera y responsive para desplegar en Raspberry Pi y abrir desde movil, tablet y ordenador.

Estructura

- index.html
- css/styles.css
- js/main.js
- sw.js
- manifest.webmanifest
- offline.html
- deploy/nginx/pelu.conf



PWA y modo offline

- manifest.webmanifest define metadatos instalables.
- sw.js cachea la shell de la app para carga rapida.
- offline.html se muestra cuando no hay conexion.


Notas

- El sitio esta preparado para navegacion por teclado y menu movil accesible.
- Si cambias archivos estaticos, incrementa CACHE_NAME en sw.js para forzar actualizacion de cache.


Despliegue rapido en Clouflare pages

1) Cloudflare Free (recomendado)

- Activa el proxy (nube naranja) para tu dominio.
- En Security > WAF, usa reglas gestionadas gratuitas.
- En Security > Bots, activa Bot Fight Mode.
- En Security > DDoS, deja proteccion automatica activa.
- En Rules > Rate Limiting, crea una regla basica para `/*`.


```


falta por decidir:
```
- los servicio, duracion y eso (cambiar codigo y supabase)

```