'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, ExternalLink, CheckCircle, Copy, Eye, EyeOff } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  completed?: boolean;
}

export const ConfigurationGuide = () => {
  const [expandedStep, setExpandedStep] = useState<string | null>('step1');
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const steps: Step[] = [
    {
      id: 'step1',
      title: '1. Ir a Google Cloud Console',
      description: 'Accede a la consola de desarrollo de Google',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Primero necesitas acceder a Google Cloud Console para crear las credenciales necesarias.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ExternalLink className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Google Cloud Console</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="bg-blue-100 px-2 py-1 rounded text-sm">
                https://console.cloud.google.com/
              </code>
              <button
                onClick={() => copyToClipboard('https://console.cloud.google.com/', 'URL')}
                className="p-1 hover:bg-blue-200 rounded transition-colors"
              >
                <Copy className="w-3 h-3" />
              </button>
              {copiedText === 'URL' && (
                <span className="text-xs text-green-600">¡Copiado!</span>
              )}
            </div>
          </div>
          <a
            href="https://console.cloud.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir Google Cloud Console
          </a>
        </div>
      )
    },
    {
      id: 'step2',
      title: '2. Crear o Seleccionar Proyecto',
      description: 'Configura un proyecto para tu aplicación',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Puedes crear un nuevo proyecto o usar uno existente.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Nuevo Proyecto</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Haz clic en "Nuevo Proyecto"</li>
                <li>• Dale un nombre descriptivo</li>
                <li>• Ej: "PokeBim Motivator"</li>
              </ul>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Proyecto Existente</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Selecciona de la lista</li>
                <li>• Asegúrate de tener permisos</li>
                <li>• Debe tener billing habilitado</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'step3',
      title: '3. Habilitar YouTube Data API v3',
      description: 'Activa la API necesaria para obtener datos de YouTube',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Necesitas habilitar la YouTube Data API v3 en tu proyecto.
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-800 mb-3">Pasos a seguir:</h4>
            <ol className="text-sm text-purple-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="bg-purple-200 text-purple-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                <span>Ve a "APIs y Servicios" → "Biblioteca"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-purple-200 text-purple-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                <span>Busca "YouTube Data API v3"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-purple-200 text-purple-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                <span>Haz clic en "Habilitar"</span>
              </li>
            </ol>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-700">
              <strong>💡 Tip:</strong> La API de YouTube es gratuita hasta 10,000 unidades por día, 
              más que suficiente para uso personal.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'step4',
      title: '4. Crear API Key',
      description: 'Genera las credenciales para acceder a la API',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Ahora necesitas crear una API Key para autenticarte.
          </p>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h4 className="font-medium text-indigo-800 mb-3">Crear API Key:</h4>
            <ol className="text-sm text-indigo-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="bg-indigo-200 text-indigo-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                <span>Ve a "APIs y Servicios" → "Credenciales"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-indigo-200 text-indigo-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                <span>Haz clic en "+ CREAR CREDENCIALES"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-indigo-200 text-indigo-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                <span>Selecciona "Clave de API"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-indigo-200 text-indigo-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                <span>Copia la clave generada</span>
              </li>
            </ol>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">
              <strong>⚠️ Importante:</strong> Mantén tu API Key segura. No la compartas públicamente 
              ni la subas a repositorios de código.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'step5',
      title: '5. Obtener Channel ID',
      description: 'Encuentra el ID único de tu canal de YouTube',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Necesitas el Channel ID de tu canal de YouTube.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <h4 className="font-medium text-teal-800 mb-2">Método 1: URL del Canal</h4>
              <p className="text-sm text-teal-700 mb-2">
                Si tu URL es como: <code>youtube.com/channel/UCxxxxxx</code>
              </p>
              <p className="text-sm text-teal-700">
                El Channel ID es la parte después de <code>/channel/</code>
              </p>
            </div>
            
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
              <h4 className="font-medium text-cyan-800 mb-2">Método 2: YouTube Studio</h4>
              <ul className="text-sm text-cyan-700 space-y-1">
                <li>• Ve a YouTube Studio</li>
                <li>• Configuración → Canal</li>
                <li>• Información básica</li>
                <li>• Copia el ID del canal</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">Ejemplo para PokeBim:</h4>
            <div className="flex items-center gap-2">
              <code className="bg-green-100 px-2 py-1 rounded text-sm">
                UCi22Ce1p-tDw6e7_WfsjPFg
              </code>
              <button
                onClick={() => copyToClipboard('UCi22Ce1p-tDw6e7_WfsjPFg', 'Channel ID')}
                className="p-1 hover:bg-green-200 rounded transition-colors"
              >
                <Copy className="w-3 h-3" />
              </button>
              {copiedText === 'Channel ID' && (
                <span className="text-xs text-green-600">¡Copiado!</span>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'step6',
      title: '6. Configurar en la Aplicación',
      description: 'Ingresa las credenciales en PokeBim Motivator',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Finalmente, agrega tus credenciales en la aplicación.
          </p>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-800 mb-3">En la aplicación:</h4>
            <ol className="text-sm text-purple-700 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Ve a la pestaña "Configuración"</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Selecciona "Canal YouTube"</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Pega tu API Key</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Pega tu Channel ID</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Guarda la configuración</span>
              </li>
            </ol>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">¡Listo!</span>
            </div>
            <p className="text-sm text-green-700">
              Ahora verás tus estadísticas reales de YouTube actualizándose automáticamente 
              cada 15 minutos.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🔧 Guía de Configuración YouTube API
        </h2>
        <p className="text-gray-600">
          Sigue estos pasos para conectar tu canal de YouTube y obtener datos reales.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${step.completed 
                    ? 'bg-green-500 text-white' 
                    : expandedStep === step.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {step.completed ? <CheckCircle className="w-5 h-5" /> : index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
              
              {expandedStep === step.id ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            <AnimatePresence>
              {expandedStep === step.id && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 border-t border-gray-100">
                    {step.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">💡 ¿Necesitas ayuda?</h3>
        <p className="text-sm text-blue-700 mb-2">
          Si tienes problemas con la configuración, verifica:
        </p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Que la YouTube Data API v3 esté habilitada</li>
          <li>• Que tu API Key tenga los permisos correctos</li>
          <li>• Que el Channel ID sea correcto (empieza con UC)</li>
          <li>• Que tu proyecto de Google Cloud tenga billing habilitado</li>
        </ul>
      </div>
    </div>
  );
};