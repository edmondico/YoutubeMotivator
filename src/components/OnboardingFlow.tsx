'use client';

import { useState } from 'react';
import { OnboardingGoals } from '@/types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface OnboardingFlowProps {
  onComplete: (goals: OnboardingGoals) => void;
}

const steps = [
  {
    id: 'welcome',
    title: '¡Bienvenido a PokeBim Motivator! 🎥',
    description: 'Vamos a configurar tus objetivos para impulsar tu canal de YouTube'
  },
  {
    id: 'subscribers',
    title: 'Objetivos de Suscriptores 📈',
    description: 'Define cuántos suscriptores quieres ganar'
  },
  {
    id: 'content',
    title: 'Creación de Contenido 🎬',
    description: 'Establece tu frecuencia de publicación'
  },
  {
    id: 'engagement',
    title: 'Engagement y Vistas 👀',
    description: 'Define tus metas de visualizaciones'
  },
  {
    id: 'productivity',
    title: 'Productividad Diaria ⚡',
    description: 'Configura tus hábitos de trabajo'
  }
];

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [goals, setGoals] = useState<OnboardingGoals>({
    weeklySubscribers: 10,
    weeklyViews: 1000,
    weeklyVideos: 1,
    dailyTasks: 3,
    streakTarget: 7,
    subscribersTarget: 1000,
    subscribersTargetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      await supabase.from('user_goals').upsert({
        user_id: user.id,
        weekly_subscribers: goals.weeklySubscribers,
        weekly_views: goals.weeklyViews,
        weekly_videos: goals.weeklyVideos,
        daily_tasks: goals.dailyTasks,
        streak_target: goals.streakTarget,
        subscribers_target: goals.subscribersTarget,
        subscribers_target_date: goals.subscribersTargetDate
      });

      onComplete(goals);
    } catch (error) {
      console.error('Error saving goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl">🎯</div>
            <h2 className="text-2xl font-bold">¡Vamos a definir tus objetivos!</h2>
            <p className="text-gray-600">
              Te ayudaremos a establecer metas realistas para hacer crecer tu canal de YouTube
              y mantenerte motivado día a día.
            </p>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-2xl font-bold mb-2">Suscriptores</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  ¿Cuántos suscriptores quieres ganar por semana?
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={goals.weeklySubscribers}
                    onChange={(e) => setGoals({...goals, weeklySubscribers: parseInt(e.target.value)})}
                    className="flex-1"
                  />
                  <span className="text-lg font-bold w-12">{goals.weeklySubscribers}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  ¿Cuál es tu meta de suscriptores total?
                </label>
                <select
                  value={goals.subscribersTarget}
                  onChange={(e) => setGoals({...goals, subscribersTarget: parseInt(e.target.value)})}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value={100}>100 suscriptores</option>
                  <option value={500}>500 suscriptores</option>
                  <option value={1000}>1,000 suscriptores</option>
                  <option value={5000}>5,000 suscriptores</option>
                  <option value={10000}>10,000 suscriptores</option>
                  <option value={50000}>50,000 suscriptores</option>
                  <option value={100000}>100,000 suscriptores</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  ¿Para cuándo quieres alcanzar esta meta?
                </label>
                <input
                  type="date"
                  value={goals.subscribersTargetDate}
                  onChange={(e) => setGoals({...goals, subscribersTargetDate: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🎬</div>
              <h2 className="text-2xl font-bold mb-2">Creación de Contenido</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  ¿Cuántos videos quieres subir por semana?
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => setGoals({...goals, weeklyVideos: num})}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        goals.weeklyVideos === num
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {num} video{num > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">💡 Consejo</h3>
                <p className="text-blue-700 text-sm">
                  Es mejor ser consistente con {goals.weeklyVideos} video{goals.weeklyVideos > 1 ? 's' : ''} por semana 
                  que subir muchos videos de forma irregular.
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-4">👀</div>
              <h2 className="text-2xl font-bold mb-2">Visualizaciones</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  ¿Cuántas visualizaciones quieres obtener por semana?
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    value={goals.weeklyViews}
                    onChange={(e) => setGoals({...goals, weeklyViews: parseInt(e.target.value)})}
                    className="flex-1"
                  />
                  <span className="text-lg font-bold w-20">{goals.weeklyViews.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">📈</span>
                  <h3 className="font-medium text-green-800">Proyección</h3>
                </div>
                <p className="text-green-700 text-sm">
                  Con {goals.weeklyVideos} video{goals.weeklyVideos > 1 ? 's' : ''} por semana, 
                  necesitarías aproximadamente {Math.round(goals.weeklyViews / goals.weeklyVideos)} 
                  visualizaciones por video.
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h2 className="text-2xl font-bold mb-2">Productividad</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  ¿Cuántas tareas quieres completar por día?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[2, 3, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => setGoals({...goals, dailyTasks: num})}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        goals.dailyTasks === num
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {num} tareas
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  ¿Cuántos días seguidos quieres mantener tu racha?
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="3"
                    max="30"
                    value={goals.streakTarget}
                    onChange={(e) => setGoals({...goals, streakTarget: parseInt(e.target.value)})}
                    className="flex-1"
                  />
                  <span className="text-lg font-bold w-12">{goals.streakTarget}</span>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium text-yellow-800 mb-2">🏆 Tu Plan</h3>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• {goals.dailyTasks} tareas diarias</li>
                  <li>• {goals.weeklyVideos} video{goals.weeklyVideos > 1 ? 's' : ''} por semana</li>
                  <li>• Racha de {goals.streakTarget} días</li>
                  <li>• Meta: {goals.subscribersTarget.toLocaleString()} suscriptores</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Paso {currentStep + 1} de {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step content */}
        <div className="min-h-[300px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Atrás
          </button>

          {isLastStep ? (
            <button
              onClick={handleComplete}
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : '🎉 ¡Comenzar!'}
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium"
            >
              Siguiente →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}