# Demostración de Sesiones de Pago con Quentli

Este proyecto es una demostración de cómo implementar sesiones de pago utilizando la API de Quentli en una aplicación Next.js. La aplicación permite a los usuarios crear sesiones de pago y presentar el checkout de Quentli de múltiples formas.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fquentli%2Fquentli-examples%2Ftree%2Fmain%2Fpayment-sessions-nextjs&env=QUENTLI_API_KEY&project-name=quentli-payment-sessions&demo-title=Demo%20de%20Quentli&demo-description=Demostraci%C3%B3n%20de%20c%C3%B3mo%20implementar%20sesiones%20de%20pago%20utilizando%20la%20API%20de%20Quentli&demo-url=https%3A%2F%2Fquentli-example-payment-sessions-nextjs.vercel.app%2F)

## Ejemplos Incluidos

Este proyecto incluye dos implementaciones:

### 1. Implementación con SDK (`/`)
- Usa el paquete oficial `@quentli/js` de npm
- Código más limpio y mantenible
- **Recomendado para producción**

### 2. Implementación Manual (`/manual`)
- Muestra cómo implementar la comunicación con Quentli usando MessageChannel directamente
- Útil para entender el protocolo de comunicación subyacente
- Buena referencia educativa

## Características

- **Tres modos de integración:**
  - **Redirección**: Redirige al usuario a la página de checkout de Quentli
  - **Popup**: Abre el checkout en una ventana emergente
  - **Iframe**: Embebe el checkout directamente en tu página
- Formulario simple para capturar datos del cliente y monto del pago
- Creación de sesión de pago en el servidor usando Server Actions de Next.js
- Manejo de estados de pago (exitoso, rechazado, cancelado)

## Tecnologías Utilizadas

- [Next.js](https://nextjs.org) - Framework de React
- API de Quentli para procesar pagos
- [`@quentli/js`](https://www.npmjs.com/package/@quentli/js) - SDK oficial de Quentli (en `/`)
- Server Actions de Next.js para operaciones del lado del servidor
- Tailwind CSS para estilos

## Primeros Pasos

Primero, ejecuta el servidor de desarrollo:

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
# o
bun dev
```

Abre [http://localhost:3000](http://localhost:3000) con tu navegador para ver el resultado.

## Variables de Entorno

Este proyecto utiliza variables de entorno para la configuración. Crea un archivo `.env.local` en el directorio raíz con las siguientes variables:

```
# Variables de entorno

NEXT_PUBLIC_QUENTLI_API_URL=https://api.demo.quentli.com/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
QUENTLI_API_KEY=<tu_clave_api_aquí>

```

Si no se configuran, la aplicación utilizará valores predeterminados.

## Más Información

Para obtener más información sobre Next.js, consulta los siguientes recursos:

- [Documentación de Next.js](https://nextjs.org/docs) - aprende sobre las características y API de Next.js.
- [Aprende Next.js](https://nextjs.org/learn) - un tutorial interactivo de Next.js.

## Implementación en Vercel

La forma más fácil de implementar tu aplicación Next.js es utilizar la [Plataforma Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) de los creadores de Next.js.

Consulta nuestra [documentación de implementación de Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para más detalles.
