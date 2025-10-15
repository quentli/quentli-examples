"use server";

// Environment variables with fallbacks
const QUENTLI_API_URL =
  process.env.NEXT_PUBLIC_QUENTLI_API_URL || "https://api.demo.quentli.com/v1";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

export async function createSetupSession({
  customerExternalId,
  customerName,
  displayMode,
}: {
  customerExternalId: string;
  customerName: string;
  displayMode: "CUSTOMER_PORTAL" | "EMBEDDED" | "CUSTOM";
}) {
  try {
    const response = await fetch(`${QUENTLI_API_URL}/setup-sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.QUENTLI_API_KEY}`,
        "User-Agent": "Quentli-NextJS-Demo",
      },
      body: JSON.stringify({
        input: {
          returnUrl: displayMode === "CUSTOMER_PORTAL" ? `${APP_URL}/success` : undefined,
          cancelUrl: displayMode === "CUSTOMER_PORTAL" ? `${APP_URL}` : undefined,
          customer: {
            name: customerName,
            externalId: customerExternalId,
            email: `${customerExternalId}@example.com`,
          },
          displayMode,
        },
      }),
    });

    if (!response.ok) {
      console.error("Error al crear la sesión de configuración");
      console.log(`Status: ${response.status}`);
      console.log(`Status Text: ${response.statusText}`);

      // Check if the response is JSON before parsing
      const contentType = response.headers.get("content-type");
      const isJson = contentType?.includes("application/json");

      if (isJson) {
        const errorData = await response.json();
        throw new Error(
          `Error al crear la sesión de configuración: ${JSON.stringify(errorData)}`
        );
      }
      throw new Error(
        `Error al crear la sesión de configuración: ${response.statusText}`
      );
    }

    const data = await response.json();
    return {
      success: true,
      url: data.url,
      session: {
        accessToken: data.session.accessToken,
        csrfToken: data.session.csrfToken,
        expiresAt: data.session.expiresAt,
      },
    };
  } catch (error) {
    console.error("Error creando sesión de configuración:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

