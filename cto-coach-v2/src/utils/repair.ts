// Repair System - Hata türlerine göre otomatik düzeltme stratejileri
export interface RepairPlan {
  type: 'retry' | 'alternative' | 'fallback' | 'rollback' | 'featureToggle';
  command: string;
  args: string[];
  timeout?: number;
  description: string;
  rollbackRequired?: boolean;
  snapshotId?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  featureToggle?: string;
  retryCount?: number;
  maxRetries?: number;
}

export function validateError(error: Error): { errorType: string; details: any } {
  const message = error.message.toLowerCase();

  if (message.includes('timeout') || message.includes('etimedout')) {
    return { errorType: 'timeout', details: { message } };
  }

  if (message.includes('exit') && message.includes('code')) {
    const match = message.match(/exit (\d+)/);
    return {
      errorType: 'exitCode',
      details: { code: match ? parseInt(match[1]) : 0, message }
    };
  }

  if (message.includes('enoent') || message.includes('not found')) {
    return { errorType: 'fileNotFound', details: { message } };
  }

  if (message.includes('permission') || message.includes('eacces')) {
    return { errorType: 'permission', details: { message } };
  }

  if (message.includes('network') || message.includes('connection')) {
    return { errorType: 'network', details: { message } };
  }

  return { errorType: 'unknown', details: { message } };
}

export function repair(errorType: string, plan: any, details: any): RepairPlan | null {
  // Retry limiti kontrolü
  const retryCount = plan._retryCount || 0;
  const maxRetries = plan.maxRetries || 3;

  if (retryCount >= maxRetries) {
    // Maksimum deneme sayısına ulaşıldı, rollback dene
    return {
      type: 'rollback',
      command: 'rollback',
      args: ['--force'],
      description: `Maksimum deneme sayısına ulaşıldı (${retryCount}/${maxRetries}) - rollback gerekli`,
      rollbackRequired: true,
      riskLevel: 'high',
      retryCount,
      maxRetries
    };
  }

  switch (errorType) {
    case 'timeout':
      return {
        type: 'retry',
        command: plan.command,
        args: plan.args,
        timeout: 30000, // 30 saniye timeout
        description: `Timeout hatası - daha uzun süre ile tekrar dene (${retryCount + 1}/3)`
      };

    case 'exitCode':
      if (details.code === 1) {
        // Exit code 1 - genellikle parametre hatası
        return {
          type: 'alternative',
          command: plan.command,
          args: ['--help'], // Yardım komutunu dene
          description: 'Exit code 1 - yardım komutu ile alternatif dene'
        };
      }
      break;

    case 'fileNotFound':
      if (plan.command === 'hazirla') {
        return {
          type: 'fallback',
          command: 'audit', // Hazırla yerine audit dene
          args: [],
          description: 'Dosya bulunamadı - audit komutu ile fallback'
        };
      }
      break;

    case 'permission':
      return {
        type: 'retry',
        command: plan.command,
        args: [...plan.args, '--force'], // Force flag ekle
        description: 'İzin hatası - force flag ile tekrar dene'
      };

    case 'network':
      return {
        type: 'retry',
        command: plan.command,
        args: plan.args,
        timeout: 10000, // Daha kısa timeout
        description: 'Ağ hatası - kısa timeout ile tekrar dene'
      };
  }

  return null;
}

export function adjustTimeout(plan: any, newTimeout: number = 30000): RepairPlan {
  return {
    type: 'retry',
    command: plan.command,
    args: plan.args,
    timeout: newTimeout,
    description: `Timeout ${newTimeout}ms ile tekrar dene`
  };
}

export function alternateParams(plan: any): RepairPlan {
  return {
    type: 'alternative',
    command: plan.command,
    args: ['--verbose', ...plan.args], // Verbose mode ekle
    description: 'Verbose mode ile alternatif parametreler dene',
    riskLevel: 'low',
    retryCount: plan._retryCount || 0,
    maxRetries: plan.maxRetries || 3
  };
}

// Feature Toggle System
export interface FeatureToggle {
  name: string;
  enabled: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
}

class FeatureToggleManager {
  private toggles: Map<string, FeatureToggle> = new Map();

  constructor() {
    // Initialize default feature toggles
    this.initializeDefaultToggles();
  }

  private initializeDefaultToggles(): void {
    this.toggles.set('auto-fix', {
      name: 'auto-fix',
      enabled: true,
      riskLevel: 'medium',
      description: 'Otomatik düzeltme sistemi'
    });

    this.toggles.set('rollback', {
      name: 'rollback',
      enabled: true,
      riskLevel: 'high',
      description: 'Rollback sistemi'
    });

    this.toggles.set('plugin-system', {
      name: 'plugin-system',
      enabled: false,
      riskLevel: 'high',
      description: 'Plugin sistemi'
    });

    this.toggles.set('llm-cache', {
      name: 'llm-cache',
      enabled: true,
      riskLevel: 'low',
      description: 'LLM cache sistemi'
    });
  }

  isEnabled(featureName: string): boolean {
    const toggle = this.toggles.get(featureName);
    return toggle ? toggle.enabled : false;
  }

  setEnabled(featureName: string, enabled: boolean): void {
    const toggle = this.toggles.get(featureName);
    if (toggle) {
      toggle.enabled = enabled;
      this.toggles.set(featureName, toggle);
    }
  }

  getToggle(featureName: string): FeatureToggle | null {
    return this.toggles.get(featureName) || null;
  }

  listToggles(): FeatureToggle[] {
    return Array.from(this.toggles.values());
  }

  createToggle(name: string, enabled: boolean, riskLevel: 'low' | 'medium' | 'high', description: string): void {
    this.toggles.set(name, {
      name,
      enabled,
      riskLevel,
      description
    });
  }
}

// Singleton instance
export const featureToggleManager = new FeatureToggleManager();

// Enhanced repair function with feature toggles
export function repairWithToggles(errorType: string, plan: any, details: any): RepairPlan | null {
  // Check if auto-fix is enabled
  if (!featureToggleManager.isEnabled('auto-fix')) {
    return {
      type: 'featureToggle',
      command: 'manual-fix',
      args: [],
      description: 'Auto-fix devre dışı - manuel müdahale gerekli',
      featureToggle: 'auto-fix',
      riskLevel: 'medium'
    };
  }

  // Check if rollback is enabled for high-risk operations
  if (errorType === 'critical' && !featureToggleManager.isEnabled('rollback')) {
    return {
      type: 'featureToggle',
      command: 'safe-mode',
      args: [],
      description: 'Rollback devre dışı - güvenli mod aktif',
      featureToggle: 'rollback',
      riskLevel: 'high'
    };
  }

  // Use standard repair logic
  return repair(errorType, plan, details);
}

// Self-healing with rollback support
export function selfHealWithRollback(error: Error, plan: any, snapshotId?: string): RepairPlan | null {
  const { errorType, details } = validateError(error);

  // Create repair plan with rollback support
  const repairPlan = repairWithToggles(errorType, plan, details);

  if (repairPlan && snapshotId) {
    repairPlan.snapshotId = snapshotId;
    repairPlan.rollbackRequired = true;
  }

  return repairPlan;
}
