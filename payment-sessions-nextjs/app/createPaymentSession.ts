"use server";

// Environment variables with fallbacks
const QUENTLI_API_URL =
  process.env.NEXT_PUBLIC_QUENTLI_API_URL || "https://api.demo.quentli.com/v1";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function createPaymentSession({
  amount,
  customerExternalId,
  customerName,
  displayMode,
}: {
  amount: number;
  customerExternalId: string;
  customerName: string;
  displayMode: "CUSTOMER_PORTAL" | "EMBEDDED" | "CUSTOM";
}) {
  // Set up the payload for the Quentli API
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour from now

  try {
    const response = await fetch(`${QUENTLI_API_URL}/payment-sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.QUENTLI_API_KEY}`,
        "User-Agent": "Quentli-NextJS-Demo",
      },
      body: JSON.stringify({
        input: {
          returnUrl: displayMode === "CUSTOMER_PORTAL" ? `${APP_URL}/resultado?outcome=SUCCESS` : undefined,
          cancelUrl: displayMode === "CUSTOMER_PORTAL" ? `${APP_URL}/resultado?outcome=DECLINED` : undefined,
          customer: {
            name: customerName,
            externalId: customerExternalId,
            email: `${customerExternalId}@example.com`,
          },
          amount: amount * 100, // Convert to minimum unit of currency
          currency: "MXN",
          description: `Pago por ${amount.toLocaleString("es-MX", {
            style: "currency",
            currency: "MXN",
          })}`,
          expiresAt,
          displayMode,
        },
      }),
    });

    if (!response.ok) {
      console.error("Error al crear la sesión de pago");
      console.log(`Status: ${response.status}`);
      console.log(`Status Text: ${response.statusText}`);

      // Check if the response is JSON before parsing
      const contentType = response.headers.get("content-type");
      const isJson = contentType?.includes("application/json");

      if (isJson) {
        const errorData = await response.json();
        throw new Error(
          `Error al crear la sesión de pago: ${JSON.stringify(errorData)}`
        );
      }
      throw new Error(
        `Error al crear la sesión de pago: ${response.statusText}`
      );
    }

    const data = await response.json();
    return { success: true, url: data.url };
  } catch (error) {
    console.error("Error creando sesión de pago:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
