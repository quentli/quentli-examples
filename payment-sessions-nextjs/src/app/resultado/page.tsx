"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ResultadoPage() {
  const searchParams = useSearchParams();
  const outcome = searchParams.get("outcome");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only render content when we're on the client to avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  const isSuccess = outcome === "SUCCESS";

  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Resultado del Pago</h1>
      </header>

      <main className="w-full max-w-md flex flex-col items-center justify-center">
        <div className={`flex flex-col items-center justify-center p-8 rounded-lg border ${
          isSuccess 
            ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20" 
            : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20"
        }`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            isSuccess 
              ? "bg-green-100 dark:bg-green-900/30" 
              : "bg-red-100 dark:bg-red-900/30"
          }`}>
            {isSuccess ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400" />
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400" />
              </svg>
            )}
          </div>
          
          <h2 className={`text-xl font-bold mb-2 ${
            isSuccess 
              ? "text-green-700 dark:text-green-400" 
              : "text-red-700 dark:text-red-400"
          }`}>
            {isSuccess ? "¡Pago Exitoso!" : "Pago Rechazado"}
          </h2>
          
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            {isSuccess 
              ? "Tu pago ha sido procesado correctamente. Gracias por tu compra." 
              : "Lo sentimos, tu pago no pudo ser procesado. Por favor intenta de nuevo."
            }
          </p>
          
          <Link 
            href="/"
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium h-10 px-5"
          >
            Volver al inicio
          </Link>
        </div>
      </main>

      <footer className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
        <span>© {new Date().getFullYear()} Demostración Quentli</span>
      </footer>
    </div>
  );
} 