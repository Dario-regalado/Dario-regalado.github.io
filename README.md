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

Despliegue rapido en Raspberry (nginx)

1. Instalar nginx:

   sudo apt update
   sudo apt install -y nginx

2. Copiar el proyecto:

   sudo mkdir -p /var/www/pelu
   sudo cp -r ./* /var/www/pelu/

3. Crear configuracion con dominio real:

   sudo cp /var/www/pelu/deploy/nginx/pelu.conf /etc/nginx/sites-available/pelu
   sudo nano /etc/nginx/sites-available/pelu

   Cambia:
   - pelu.tu-dominio.com
   - www.pelu.tu-dominio.com

4. Activar sitio:

   sudo ln -s /etc/nginx/sites-available/pelu /etc/nginx/sites-enabled/pelu
   sudo rm -f /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl restart nginx

5. Probar en red local:

   hostname -I

   Abre desde cualquier dispositivo en tu red:
   http://IP_DE_TU_RASPBERRY

HTTPS y acceso desde Internet

1. En el router, fija IP local para la Raspberry.
2. Redirige puertos 80 y 443 a la Raspberry.
3. Configura tu dominio para apuntar a tu IP publica (A record o DDNS).
4. Instala certificado SSL:

   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d pelu.tu-dominio.com -d www.pelu.tu-dominio.com

5. Si certbot no activa redireccion automaticamente, en /etc/nginx/sites-available/pelu habilita redirect a HTTPS.

PWA y modo offline

- manifest.webmanifest define metadatos instalables.
- sw.js cachea la shell de la app para carga rapida.
- offline.html se muestra cuando no hay conexion.

Comprobaciones utiles

- Estado de nginx:

  sudo systemctl status nginx

- Prueba local desde Raspberry:

  curl -I http://localhost

- Prueba de service worker:

  abre DevTools > Application > Service Workers

Notas

- El sitio esta preparado para navegacion por teclado y menu movil accesible.
- Si cambias archivos estaticos, incrementa CACHE_NAME en sw.js para forzar actualizacion de cache.

Seguridad gratis (anti-DoS basico)

Puedes proteger esta web sin coste con una estrategia por capas:

1) Cloudflare Free (recomendado)

- Activa el proxy (nube naranja) para tu dominio.
- En Security > WAF, usa reglas gestionadas gratuitas.
- En Security > Bots, activa Bot Fight Mode.
- En Security > DDoS, deja proteccion automatica activa.
- En Rules > Rate Limiting, crea una regla basica para `/*`.

2) Nginx (ya preparado en deploy/nginx/pelu.conf)

- Limite de peticiones por IP (`limit_req_zone`, `limit_req`).
- Limite de conexiones simultaneas por IP (`limit_conn_zone`, `limit_conn`).
- Timeouts cortos para cortar conexiones lentas.
- Respuesta `429` al exceder limites.

3) Firewall UFW (gratis)

```
sudo apt update
sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose
```

4) Fail2ban (gratis)

```
sudo apt install -y fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
```

Anade un jail sencillo para Nginx:

```
[nginx-http-auth]
enabled = true

[nginx-botsearch]
enabled = true

[nginx-limit-req]
enabled = true
port = http,https
filter = nginx-limit-req
logpath = /var/log/nginx/*error*.log
maxretry = 20
findtime = 60
bantime = 600
```

Crea el filtro si no existe:

```
sudo tee /etc/fail2ban/filter.d/nginx-limit-req.conf > /dev/null <<'EOF'
[Definition]
failregex = limiting requests, excess:.* by zone.*client: <HOST>
ignoreregex =
EOF
```

Reinicia y verifica:

```
sudo systemctl restart fail2ban
sudo fail2ban-client status
```

5) Verificacion rapida

```
sudo nginx -t
sudo systemctl reload nginx
ab -n 500 -c 50 http://TU_DOMINIO/
```

Nota: si no tienes `ab`, instala `apache2-utils` (`sudo apt install -y apache2-utils`).
