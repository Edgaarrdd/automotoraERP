import React, { useState, useEffect, useCallback } from 'react';
import { ONBOARDING_STEPS } from '../config/onboardingSteps';
import { X, ChevronLeft, ChevronRight, CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';

export default function OnboardingTour({
  role = 'ADMIN',
  activeTab,
  setActiveTab,
  activeSubTab,
  setActiveSubTab,
  isOpen,
  onClose,
  onComplete
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const [arrowClass, setArrowClass] = useState('');

  const steps = ONBOARDING_STEPS[role] || ONBOARDING_STEPS.ADMIN;
  const totalSteps = steps.length;
  const currentStep = steps[currentStepIndex];

  // Reset step index when tour opens or role changes
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen, role]);

  // Ensure current tab and subTab match the step requirements
  useEffect(() => {
    if (!isOpen || !currentStep) return;

    if (currentStep.tab && activeTab !== currentStep.tab) {
      setActiveTab(currentStep.tab);
    }
    if (currentStep.subTab && setActiveSubTab && activeSubTab !== currentStep.subTab) {
      setActiveSubTab(currentStep.subTab);
    }
  }, [isOpen, currentStepIndex, currentStep, activeTab, setActiveTab, activeSubTab, setActiveSubTab]);

  // Update target element coordinates & calculate popup position
  const updatePositions = useCallback(() => {
    if (!isOpen || !currentStep) return;

    const targetEl = document.querySelector(currentStep.target);
    if (!targetEl) {
      setTargetRect(null);
      // Fallback center position if element is not in DOM
      setTooltipStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '440px',
        width: '90vw',
        zIndex: 60
      });
      setArrowClass('');
      return;
    }

    const rect = targetEl.getBoundingClientRect();
    setTargetRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    });

    const padding = 16;
    const tooltipWidth = 380;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = 0;
    let left = 0;
    let placement = currentStep.placement || 'bottom';
    let computedArrow = '';

    // Calculate best position based on placement request and viewport bounds
    if (placement === 'bottom' && rect.bottom + 220 < viewportHeight) {
      top = rect.bottom + padding;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
      computedArrow = 'top-pointing';
    } else if (placement === 'top' && rect.top - 220 > 0) {
      top = rect.top - 220 - padding;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
      computedArrow = 'bottom-pointing';
    } else if (placement === 'right' && rect.right + tooltipWidth + padding < viewportWidth) {
      top = rect.top + rect.height / 2 - 90;
      left = rect.right + padding;
      computedArrow = 'left-pointing';
    } else if (placement === 'left' && rect.left - tooltipWidth - padding > 0) {
      top = rect.top + rect.height / 2 - 90;
      left = rect.left - tooltipWidth - padding;
      computedArrow = 'right-pointing';
    } else {
      // Default center-bottom fallback
      top = Math.min(rect.bottom + padding, viewportHeight - 230);
      left = Math.max(16, Math.min(rect.left, viewportWidth - tooltipWidth - 16));
    }

    // Keep left within viewport margins
    left = Math.max(16, Math.min(left, viewportWidth - tooltipWidth - 16));
    top = Math.max(16, Math.min(top, viewportHeight - 240));

    setTooltipStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
      zIndex: 60
    });
    setArrowClass(computedArrow);
  }, [isOpen, currentStep]);

  // Recalculate on scroll, resize, or step change
  useEffect(() => {
    if (!isOpen) return;

    // Small delay to allow CSS transitions / DOM tab changes to finish
    const timer = setTimeout(updatePositions, 100);
    window.addEventListener('resize', updatePositions);
    window.addEventListener('scroll', updatePositions, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions, true);
    };
  }, [isOpen, currentStepIndex, updatePositions, activeTab]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, totalSteps]);

  if (!isOpen || !currentStep) return null;

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const roleNameMap = {
    ADMIN: 'Administrador Superuser',
    GERENTE: 'Gerente Comercial',
    VENDEDOR: 'Asesor Comercial',
    F_AND_I: 'Ejecutivo F&I',
    BDC: 'Recepción & BDC',
    MARKETING: 'Equipo Marketing',
    TALLER: 'Taller & Servicios'
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Target element spotlight highlight */}
      {targetRect && (
        <div
          className="fixed transition-all duration-300 ease-out pointer-events-none rounded-xl ring-4 ring-sky-400/90 animate-pulse shadow-[0_0_35px_rgba(56,189,248,0.6)] bg-sky-500/10 z-55"
          style={{
            top: `${targetRect.top - 4}px`,
            left: `${targetRect.left - 4}px`,
            width: `${targetRect.width + 8}px`,
            height: `${targetRect.height + 8}px`
          }}
        />
      )}

      {/* Tooltip Card */}
      <div
        style={tooltipStyle}
        className="bg-slate-900/95 border border-sky-500/40 text-white rounded-2xl p-5 shadow-2xl shadow-sky-500/20 backdrop-blur-xl transition-all duration-300 animate-in fade-in zoom-in-95"
      >
        {/* Step Header */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Paso {currentStepIndex + 1} de {totalSteps}
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              {roleNameMap[role] || role}
            </span>
          </div>

          <button
            onClick={onClose}
            title="Omitir Onboarding"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Title & Body */}
        <div className="space-y-2 mb-5">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            {currentStep.title}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            {currentStep.content}
          </p>
        </div>

        {/* Progress dots bar */}
        <div className="flex justify-center gap-1.5 mb-4">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStepIndex
                  ? 'w-6 bg-sky-400'
                  : idx < currentStepIndex
                  ? 'w-2 bg-sky-600/60'
                  : 'w-2 bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium underline-offset-4 hover:underline"
          >
            Omitir Tour
          </button>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Anterior
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/25 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              {currentStepIndex === totalSteps - 1 ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Entendido
                </>
              ) : (
                <>
                  Siguiente <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
