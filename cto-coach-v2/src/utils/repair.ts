// Repair System - Hata türlerine göre otomatik düzeltme stratejileri
export interface RepairPlan {
  type: 'retry' | 'alternative' | 'fallback';
  command: string;
  args: string[];
  timeout?: number;
  description: string;
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
  if (retryCount >= 3) {
    return null; // Maksimum 3 deneme
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
    description: 'Verbose mode ile alternatif parametreler dene'
  };
}
