"use client";

import { useState, FormEvent } from "react";
import { createPaymentSession } from "./actions";

export default function Home() {
  const [amount, setAmount] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await createPaymentSession({
        amount: Number(amount),
        customerExternalId: customerId,
        customerName,
      });

      if (result.success && result.url) {
        // Redirect to Quentli payment page
        window.location.href = result.url;
      } else {
        setError(result.error || "Error al crear la sesión de pago");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Demostración de Pago con Quentli</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Crea una sesión de pago y redirecciona a la página de pago de Quentli</p>
      </header>

      <main className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              placeholder="2,390.00"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="customerId" className="text-sm font-medium">
              ID Externo del Cliente
            </label>
            <input
              id="customerId"
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="rounded border border-gray-300 dark:border-gray-700 px-3 py-2 bg-transparent"
              placeholder="1337"
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
              placeholder="Mariana López"
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
            className="rounded-full mt-2 border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium h-12 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creando sesión de pago..." : "Pagar con Quentli"}
          </button>
        </form>
      </main>

      <footer className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
        <span>© {new Date().getFullYear()} Demostración Quentli</span>
      </footer>
    </div>
  );
}
