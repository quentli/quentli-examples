"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createPaymentSession } from "../createPaymentSession";

type PaymentMethodType = "CUSTOMER_PORTAL" | "EMBEDDED" | "CUSTOM";

const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

type PaymentSessionResponse = {
  success: boolean;
  url?: string;
  session?: {
    accessToken: string;
    csrfToken: string;
    expiresAt: string;
  };
  paymentSession?: {
    id: string;
    customer: Record<string, unknown>;
    metadata: Array<{ key: string; value: string }>;
    [key: string]: unknown;
  };
  error?: string;
};

export default function Home() {
  const [amount, setAmount] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerIdEdited, setCustomerIdEdited] = useState(false);
  const [displayMode, setDisplayMode] = useState<PaymentMethodType>("CUSTOMER_PORTAL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [popupClosed, setPopupClosed] = useState(false);
  const popupWindowRef = useRef<Window | null>(null);
  const [showIframe, setShowIframe] = useState(false);
  const [iframeUrl, setIframeUrl] = useState("");
  const [paymentSession, setPaymentSession] = useState<PaymentSessionResponse | null>(null);
  const messageChannelRef = useRef<MessageChannel | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<"COMPLETE" | "CANCELED" | null>(null);

  // Update customerId when customerName changes and id hasn't been manually edited
  useEffect(() => {
    if (!customerIdEdited && customerName.trim()) {
      setCustomerId(slugify(customerName));
    }
  }, [customerName, customerIdEdited]);

  // Listen for messages from iframe and popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Handle READY event - send credentials via MessageChannel
      if (event.data && event.data.type === "READY") {
        const targetWindow = popupWindowRef.current || iframeRef.current?.contentWindow;

        if (targetWindow && paymentSession?.session && paymentSession?.paymentSession) {
          // Create a new MessageChannel for secure communication
          const channel = new MessageChannel();
          messageChannelRef.current = channel;

          // Listen for messages on port1
          channel.port1.onmessage = (e) => {

            console.log("e.data", e.data);
            if (e.data && e.data.type === "PAYMENT_COMPLETED") {
              // Hide iframe/popup and show result inline
              setShowIframe(false);

              if (popupWindowRef.current) {
                popupWindowRef.current.close();
                popupWindowRef.current = null;
              }

              if (
                e.data.status === "COMPLETE" ||
                e.data.status === "DECLINED"
              ) {
                setPaymentStatus(e.data.status);
              }
            }
          };

          // Send credentials and port2 to the payment window
          targetWindow.postMessage(
            {
              type: "INIT",
              accessToken: paymentSession.session.accessToken,
              csrfToken: paymentSession.session.csrfToken,
            },
            "*", // In production, replace with specific origin
            [channel.port2]
          );
        }
      }

      // Fallback: Handle PAYMENT_COMPLETED without MessageChannel (legacy)
      if (event.data && event.data.type === "PAYMENT_COMPLETED") {
        setShowIframe(false);

        if (popupWindowRef.current) {
          popupWindowRef.current.close();
          popupWindowRef.current = null;
        }

        if (
          event.data.status === "COMPLETE"
        ) {
          setPaymentStatus(event.data.status);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      // Clean up MessageChannel
      if (messageChannelRef.current) {
        messageChannelRef.current.port1.close();
        messageChannelRef.current = null;
      }
    };
  }, [paymentSession]);

  function resetDemo() {
    setAmount("");
    setCustomerName("");
    setCustomerId("");
    setCustomerIdEdited(false);
    setLoading(false);
    setError("");
    setPopupClosed(false);
    setShowIframe(false);
    setIframeUrl("");
    setPaymentSession(null);
    setPaymentStatus(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPopupClosed(false);

    try {
      // If customerId is still empty, derive it from the name
      const finalCustomerId = customerId.trim() || slugify(customerName);

      const result = await createPaymentSession({
        amount: Number(amount),
        customerExternalId: finalCustomerId,
        customerName,
        displayMode: displayMode
      });

      // Save the whole response in state
      setPaymentSession(result);

      if (result.success && result.url) {
        if (displayMode === "EMBEDDED") {
          // Open in popup window
          const popupWidth = 500;
          const popupHeight = 700;
          const left = window.innerWidth / 2 - popupWidth / 2;
          const top = window.innerHeight / 2 - popupHeight / 2;

          popupWindowRef.current = window.open(
            result.url,
            "quentli_payment_session",
            `width=${popupWidth},height=${popupHeight},top=${top},left=${left}`
          );

          const checkPopupInterval = setInterval(() => {
            if (popupWindowRef.current && popupWindowRef.current.closed) {
              clearInterval(checkPopupInterval);
              setPopupClosed(true);
              popupWindowRef.current = null;
            }
          }, 500);

          setLoading(false);
        } else if (displayMode === "CUSTOM") {
          // Show payment in iframe
          setIframeUrl(result.url);
          setShowIframe(true);
          setIframeLoading(true);
          setLoading(false);
        } else {
          // Redirect to Quentli payment page
          window.location.href = result.url;
        }
      } else {
        setError(result.error || "Error al crear la sesión de pago");
        setLoading(false);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error inesperado"
      );
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-10 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Sesiones de pago</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Este ejemplo muestra cómo crear una sesión de pago y presentarle al
          usuario el checkout de Quentli.
        </p>
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
          <p className="text-xs text-amber-700 dark:text-amber-300">
            ⚠️ Esta es la implementación manual. Para ver la versión con el SDK oficial,{" "}
            <Link href="/" className="underline font-semibold hover:text-amber-900 dark:hover:text-amber-100">
              visita esta página
            </Link>
          </p>
        </div>
      </header>

      <main className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Modo</label>
            <div className="flex rounded-lg p-1 bg-gray-100 dark:bg-gray-800">
              <button
                type="button"
                onClick={() => setDisplayMode("CUSTOMER_PORTAL")}
                disabled={!!paymentStatus}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${displayMode === "CUSTOMER_PORTAL"
                  ? "bg-primary text-background shadow-sm"
                  : "bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Redirección
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode("EMBEDDED")}
                disabled={!!paymentStatus}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${displayMode === "EMBEDDED"
                  ? "bg-primary text-background shadow-sm"
                  : "bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Popup
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode("CUSTOM")}
                disabled={!!paymentStatus}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${displayMode === "CUSTOM"
                  ? "bg-primary text-background shadow-sm"
                  : "bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Iframe
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="amount" className="text-sm font-medium">
              Monto (MXN)
            </label>
            <input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!!paymentStatus}
              className="rounded border border-gray-300 dark:border-gray-700 px-3 py-2 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="$0.00"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="customerName" className="text-sm font-medium">
              Nombre del Cliente
            </label>
            <input
              id="customerName"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              disabled={!!paymentStatus}
              className="rounded border border-gray-300 dark:border-gray-700 px-3 py-2 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="ej. Alicia Ríos"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="customerId" className="text-sm font-medium">
              ID Externo (opcional)
            </label>
            <input
              id="customerId"
              type="text"
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                setCustomerIdEdited(true);
              }}
              disabled={!!paymentStatus}
              className="rounded border border-gray-300 dark:border-gray-700 px-3 py-2 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="ej. 12345"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !!paymentStatus}
            className={`rounded-full mt-2 border border-solid border-transparent transition-colors flex items-center justify-center gap-2 font-medium h-12 px-5 disabled:cursor-not-allowed ${paymentStatus === "COMPLETE"
              ? "bg-green-600 dark:bg-green-700 text-white"
              : "bg-primary text-background hover:bg-primary/80 dark:hover:bg-[#ccc] disabled:opacity-50"
              }`}
          >
            {loading ? (
              "Creando sesión de pago..."
            ) : paymentStatus === "COMPLETE" ? (
              <>
                Pago exitoso
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </>
            ) : (
              <>
                Pagar con Quentli
                {displayMode === "CUSTOMER_PORTAL" && !paymentStatus && (
                  <span className="flex items-center justify-center gap-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="inline-block"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </span>
                )}
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded text-sm mt-3 border border-red-300 dark:border-red-700">
              <div className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-shrink-0 mt-0.5"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <div>
                  <p className="font-semibold mb-1">Error</p>
                  <p className="text-xs">{error}</p>
                </div>
              </div>
            </div>
          )}

          {paymentStatus === "COMPLETE" && (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded text-sm mt-3 border border-green-300 dark:border-green-700">
              <div className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-shrink-0 mt-0.5"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <div>
                  <p className="font-semibold mb-1">¡Pago completado exitosamente!</p>
                  <p className="text-xs">La transacción se ha procesado correctamente.</p>
                </div>
              </div>
            </div>
          )}

          {paymentStatus && (
            <button
              type="button"
              onClick={resetDemo}
              className="rounded-full mt-2 border border-solid border-gray-300 dark:border-gray-600 transition-colors bg-transparent flex items-center justify-center text-gray-700 dark:text-gray-300 gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium h-12 px-5"
            >
              Reiniciar demo
            </button>
          )}

          {(popupClosed || paymentStatus === "CANCELED") && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 p-3 rounded text-sm mt-3 border border-yellow-300 dark:border-yellow-700">
              La sesión de pago ha sido cancelada por el usuario.
            </div>
          )}
        </form>

        {/* Payment iframe inline */}
        {showIframe && (
          <div className="mt-6 w-full">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full h-[600px] flex flex-col border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-end items-center">
                <button
                  onClick={() => {
                    setShowIframe(false);
                    setPopupClosed(true);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
              <div className="flex-1 w-full relative">
                {iframeLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-700 border-t-primary rounded-full animate-spin"></div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Cargando...</p>
                    </div>
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  src={iframeUrl}
                  className="w-full h-full border-0"
                  allow="payment"
                  onLoad={() => setIframeLoading(false)}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
