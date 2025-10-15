"use client";

import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-6 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-md">
        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-6 rounded-lg text-center border border-green-300 dark:border-green-700">
          <div className="flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">
            ¡Método de pago guardado!
          </h1>
          
          <p className="text-sm mb-6">
            Tu método de pago ha sido agregado correctamente y está listo para usar.
          </p>
          
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-solid border-transparent transition-colors bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-800 font-medium h-10 px-6"
          >
            Volver al inicio
          </Link>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            💡 Tu método de pago está guardado de forma segura y puede ser usado para pagos futuros o suscripciones.
          </p>
        </div>
      </div>
    </div>
  );
}
