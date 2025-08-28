'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Sun, Moon, Coffee } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const DailyMotivation = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Actualizar cada minuto

    return () => clearInterval(timer);
  }, []);

  const getTimeOfDayMessage = () => {
    const hour = currentTime.getHours();
    
    if (hour >= 6 && hour < 12) {
      return {
        icon: <Sun className="w-5 h-5 text-yellow-500" />,
        greeting: "¡Buenos días, PokeBim! ☀️",
        message: "Es un gran día para crear contenido épico. ¿Qué video vas a hacer hoy?",
        color: "from-yellow-50 to-orange-50 border-yellow-200"
      };
    } else if (hour >= 12 && hour < 18) {
      return {
        icon: <Coffee className="w-5 h-5 text-amber-600" />,
        greeting: "¡Buenas tardes! ☕",
        message: "Hora perfecta para grabar o editar. ¡Tus fans están esperando!",
        color: "from-amber-50 to-yellow-50 border-amber-200"
      };
    } else if (hour >= 18 && hour < 22) {
      return {
        icon: <Bell className="w-5 h-5 text-orange-500" />,
        greeting: "¡Buenas tardes! 🌅",
        message: "¿Ya planificaste el video de mañana? ¡La preparación es clave!",
        color: "from-orange-50 to-red-50 border-orange-200"
      };
    } else {
      return {
        icon: <Moon className="w-5 h-5 text-indigo-500" />,
        greeting: "¡Buenas noches! 🌙",
        message: "Hora de descansar. Sueña con ideas para videos increíbles.",
        color: "from-indigo-50 to-purple-50 border-indigo-200"
      };
    }
  };

  const getDailyTips = () => {
    const tips = [
      "💡 Los videos de 8-12 minutos tienen mejor retención en YouTube",
      "🎯 Usa títulos llamativos con emojis para más clics",
      "📈 Sube videos entre martes y jueves para mejor alcance",
      "🔥 Interactúa con tus comentarios en la primera hora",
      "✨ Haz thumbnails coloridos con tu expresión facial visible",
      "⚡ Los primeros 15 segundos son cruciales para retener audiencia",
      "🎪 Cuenta historias en tus videos para más engagement",
      "🌟 Usa hashtags relevantes pero no más de 3-4",
    ];

    const today = new Date().getDate();
    return tips[today % tips.length];
  };

  const getMotivationalQuote = () => {
    const quotes = [
      "El éxito es la suma de pequeños esfuerzos repetidos día tras día. 💪",
      "Tu único límite eres tú mismo. ¡Rompe tus propias barreras! 🚀",
      "Los grandes YouTubers no nacieron así, se hicieron con constancia. ⭐",
      "Cada video que no subes es una oportunidad perdida. ¡Actúa hoy! 🎬",
      "Tu audiencia está esperando tu próxima obra maestra. 🎭",
      "La constancia es más poderosa que la perfección. 🔥",
      "Hoy es el día perfecto para crear algo épico. ✨",
    ];

    const today = new Date().getDate();
    return quotes[today % quotes.length];
  };

  const timeMessage = getTimeOfDayMessage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${timeMessage.color} rounded-xl p-6 border-2`}
    >
      {/* Header con saludo */}
      <div className="flex items-center gap-3 mb-4">
        {timeMessage.icon}
        <div>
          <h2 className="font-bold text-gray-800">{timeMessage.greeting}</h2>
          <p className="text-sm text-gray-600">{format(currentTime, "EEEE, d 'de' MMMM", { locale: es })}</p>
        </div>
      </div>

      {/* Mensaje motivacional principal */}
      <motion.div
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="bg-white rounded-lg p-4 mb-4 border-l-4 border-blue-500"
      >
        <p className="font-medium text-gray-800 text-center">
          {timeMessage.message}
        </p>
      </motion.div>

      {/* Tip del día */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span>💡</span>
          <h3 className="font-semibold text-gray-800">Tip del día</h3>
        </div>
        <p className="text-sm text-gray-700">{getDailyTips()}</p>
      </div>

      {/* Frase motivacional */}
      <motion.div
        animate={{ 
          background: ['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)'],
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="rounded-lg p-4 text-center"
      >
        <p className="text-sm font-medium text-gray-700 italic">
&ldquo;{getMotivationalQuote()}&rdquo;
        </p>
      </motion.div>

      {/* Recordatorio de acción */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 text-center cursor-pointer"
        onClick={() => setShowNotification(!showNotification)}
      >
        <div className="flex items-center justify-center gap-2">
          <Bell className="w-4 h-4" />
          <span className="font-medium">¡Tengo que hacer esto hoy!</span>
        </div>
      </motion.div>

      {/* Lista de recordatorios rápidos */}
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 space-y-2"
        >
          <div className="text-sm font-medium text-gray-700 mb-2">Recordatorios útiles:</div>
          <div className="space-y-1 text-xs text-gray-600">
            <div>📹 Planificar próximos videos basados en tendencias</div>
            <div>💬 Responder a comentarios para aumentar engagement</div>
            <div>📊 Revisar métricas de rendimiento de videos recientes</div>
            <div>🎨 Crear thumbnails llamativos con buen contraste</div>
            <div>📱 Promover contenido en otras plataformas</div>
            <div>🔍 Investigar palabras clave para mejor SEO</div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};