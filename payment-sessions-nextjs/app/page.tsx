"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { createPaymentSession } from "./createPaymentSession";

type PaymentMethodType = "CUSTOMER_PORTAL" | "EMBEDDED" | "CUSTOM";

// Function to slugify a string
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

export default function Home() {
  const [amount, setAmount] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerIdEdited, setCustomerIdEdited] = useState(false);
  const [mode, setMode] = useState<PaymentMethodType>("CUSTOMER_PORTAL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentClosed, setPaymentClosed] = useState(false);
  const popupWindowRef = useRef<Window | null>(null);
  const [showIframe, setShowIframe] = useState(false);
  const [iframeUrl, setIframeUrl] = useState("");

  // Update customerId when customerName changes and id hasn't been manually edited
  useEffect(() => {
    if (!customerIdEdited && customerName.trim()) {
      setCustomerId(slugify(customerName));
    }
  }, [customerName, customerIdEdited]);

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "PAYMENT_COMPLETED") {
        // Hide iframe and redirect based on payment status
        setShowIframe(false);
        setPaymentClosed(true);
        if (
          event.data.status === "SUCCESS" ||
          event.data.status === "DECLINED"
        ) {
          window.location.href = `/resultado?outcome=${event.data.status}`;
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPaymentClosed(false);

    try {
      // If customerId is still empty, derive it from the name
      const finalCustomerId = customerId.trim() || slugify(customerName);

      const result = await createPaymentSession({
        amount: Number(amount),
        customerExternalId: finalCustomerId,
        customerName,
        mode
      });

      if (result.success && result.url) {
        if (mode === "EMBEDDED") {
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
            console.log("checkPopupInterval", checkPopupInterval);
            if (popupWindowRef.current && popupWindowRef.current.closed) {
              console.log(
                "popupWindowRef.current.closed",
                popupWindowRef.current.closed
              );
              clearInterval(checkPopupInterval);
              setPaymentClosed(true);
              popupWindowRef.current = null;
            }
          }, 500);

          setLoading(false);
        } else if (mode === "CUSTOM") {
          // Show payment in iframe
          setIframeUrl(result.url);
          setShowIframe(true);
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
        <h1 className="text-2xl font-bold mb-2">Demo de Quentli</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Este ejemplo muestra cómo crear una sesión de pago y presentarle al
          usuario el checkout de Quentli.
        </p>
      </header>

      <main className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Modo</label>
            <div className="flex rounded-lg p-1 bg-gray-100 dark:bg-gray-800">
              <button
                type="button"
                onClick={() => setMode("CUSTOMER_PORTAL")}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                  mode === "CUSTOMER_PORTAL"
                    ? "bg-primary text-background shadow-sm"
                    : "bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                Redirección
              </button>
              <button
                type="button"
                onClick={() => setMode("EMBEDDED")}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                  mode === "EMBEDDED"
                    ? "bg-primary text-background shadow-sm"
                    : "bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                Popup
              </button>
              <button
                type="button"
                onClick={() => setMode("CUSTOM")}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                  mode === "CUSTOM"
                    ? "bg-primary text-background shadow-sm"
                    : "bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
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
              className="rounded border border-gray-300 dark:border-gray-700 px-3 py-2 bg-transparent"
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
              className="rounded border border-gray-300 dark:border-gray-700 px-3 py-2 bg-transparent"
              placeholder="ej. Mariana López"
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
              className="rounded border border-gray-300 dark:border-gray-700 px-3 py-2 bg-transparent"
              placeholder="ej. 0001273896"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full mt-2 border border-solid border-transparent transition-colors bg-primary flex items-center justify-center text-background gap-2 hover:bg-primary/80 dark:hover:bg-[#ccc] font-medium h-12 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creando sesión de pago..." : "Pagar con Quentli"}

            {mode === "CUSTOMER_PORTAL" && (
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
          </button>

          {paymentClosed && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 p-3 rounded text-sm mt-3 border border-yellow-300 dark:border-yellow-700">
              La sesión de pago ha sido cancelada.
            </div>
          )}
        </form>
      </main>

      {/* Payment iframe modal */}
      {showIframe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full h-[600px] flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-medium">Pago con Quentli</h3>
              <button
                onClick={() => {
                  setShowIframe(false);
                  setPaymentClosed(true);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Cerrar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="flex-1 w-full">
              <iframe
                src={iframeUrl}
                className="w-full h-full border-0"
                allow="payment"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
