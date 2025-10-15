# Sesiones de Configuración - Ejemplo con Next.js

Este ejemplo demuestra cómo usar las Sesiones de Configuración de Quentli para permitir a los clientes guardar métodos de pago sin realizar un cobro inmediato. Esto es útil para:

- Configurar suscripciones
- Guardar métodos de pago para uso futuro
- Gestión de métodos de pago

## Características

- **Tres modos de visualización:**
  - **Customer Portal (Redirección)**: Redirección completa a la página hospedada de Quentli
  - **Embedded (Popup)**: Se abre en una ventana popup con integración perfecta
  - **Custom (Iframe)**: Se incrusta directamente en tu página para una experiencia totalmente integrada
- **Soporte TypeScript**: Completamente tipado para mejor experiencia de desarrollo
- **Actualizaciones en tiempo real**: Recibe notificaciones cuando se agregan métodos de pago

## Configuración

1. Instala las dependencias:
   ```bash
   pnpm install
   ```

2. Crea un archivo `.env.local` con tu API key de Quentli:
   ```bash
   QUENTLI_API_KEY=tu_api_key_aqui
   NEXT_PUBLIC_APP_URL=http://localhost:3001
   ```

3. Ejecuta el servidor de desarrollo:
   ```bash
   pnpm dev
   ```

4. Abre [http://localhost:3001](http://localhost:3001) en tu navegador

## Cómo Funciona

### 1. Crear una Sesión de Configuración

La acción del servidor `createSetupSession.ts` llama a la API de Quentli para crear una sesión de configuración:

```typescript
const result = await createSetupSession({
  customerExternalId: "customer-123",
  customerName: "Juan Pérez",
  displayMode: "CUSTOMER_PORTAL",
});
```

### 2. Mostrar la Sesión de Configuración

Usa el SDK de Quentli JS para mostrar la sesión de configuración en tu modo preferido:

#### Customer Portal (Redirección)
```typescript
quentli.setupSessions.displayPage({
  url: result.url,
});
```

#### Embedded (Popup)
```typescript
await quentli.setupSessions.displayPopup({
  url: result.url,
  session: {
    accessToken: result.session.accessToken,
    csrfToken: result.session.csrfToken,
  },
  onPaymentMethodAdded: (data) => {
    console.log("Payment method added:", data.paymentMethod);
  },
  onCancel: () => console.log("Setup canceled"),
  onError: (error) => console.error("Error:", error),
});
```

#### Custom (Iframe)
```typescript
await quentli.setupSessions.displayEmbedded({
  url: result.url,
  session: {
    accessToken: result.session.accessToken,
    csrfToken: result.session.csrfToken,
  },
  target: document.getElementById("setup-container"),
  onPaymentMethodAdded: (data) => {
    console.log("Payment method added:", data.paymentMethod);
  },
});
```

## Comparación de Modos de Visualización

| Modo | Caso de Uso | UX | Complejidad de Integración |
|------|-------------|----|-----------------------------|
| **Customer Portal** | Flujo simple y confiable | Redirige fuera de tu sitio | Baja |
| **Popup** | Balance entre integración y simplicidad | Se abre en nueva ventana | Media |
| **Iframe** | Experiencia totalmente integrada | Permanece en tu página | Media |

## Referencia de la API

Consulta la [documentación de @quentli/js](../../../quentli-js/README.md) para referencia detallada de la API.

## Aprende Más

- [Documentación de Quentli](https://docs.quentli.com)
- [Guía de Sesiones de Configuración](https://docs.quentli.com/setup-sessions)
- [Documentación de Next.js](https://nextjs.org/docs)

