/**
 * Utilitários para detecção automática do ambiente PayPal
 */

export interface PayPalEnvironmentInfo {
  environment: 'sandbox' | 'live'
  confidence: 'high' | 'medium' | 'low'
  reason: string
}

/**
 * Detecta o ambiente do PayPal baseado no Client ID
 * @param clientId - Client ID do PayPal
 * @returns Informações sobre o ambiente detectado
 */
export function detectPayPalEnvironment(clientId: string): PayPalEnvironmentInfo {
  if (!clientId || clientId.trim() === '') {
    return {
      environment: 'sandbox',
      confidence: 'high',
      reason: 'Client ID vazio - usando sandbox como padrão'
    }
  }

  const cleanClientId = clientId.trim()

  // Padrões de alta confiança para sandbox
  const sandboxHighConfidence = [
    /^test_/i,
    /sandbox/i,
    /^sb-/i,
    /^A[0-9A-Z]{20}$/ // Padrão específico do sandbox
  ]

  // Padrões de alta confiança para live
  const liveHighConfidence = [
    /^live_/i,
    /production/i,
    /^prod-/i,
    /^A[0-9A-Z]{30,}$/ // Padrão específico do live (mais longo)
  ]

  // Verificar padrões de alta confiança
  for (const pattern of sandboxHighConfidence) {
    if (pattern.test(cleanClientId)) {
      return {
        environment: 'sandbox',
        confidence: 'high',
        reason: `Padrão sandbox detectado: ${pattern.source}`
      }
    }
  }

  for (const pattern of liveHighConfidence) {
    if (pattern.test(cleanClientId)) {
      return {
        environment: 'live',
        confidence: 'high',
        reason: `Padrão live detectado: ${pattern.source}`
      }
    }
  }

  // Verificações de média confiança
  if (cleanClientId.length <= 25) {
    return {
      environment: 'sandbox',
      confidence: 'medium',
      reason: 'Client ID curto - provavelmente sandbox'
    }
  }

  if (cleanClientId.length >= 30) {
    return {
      environment: 'live',
      confidence: 'medium',
      reason: 'Client ID longo - provavelmente live'
    }
  }

  // Verificações de baixa confiança
  if (cleanClientId.startsWith('A')) {
    return {
      environment: 'live',
      confidence: 'low',
      reason: 'Client ID começa com A - assumindo live'
    }
  }

  // Padrão desconhecido
  return {
    environment: 'sandbox',
    confidence: 'low',
    reason: 'Padrão desconhecido - usando sandbox como padrão seguro'
  }
}

/**
 * Obtém a URL correta do SDK do PayPal baseado no ambiente
 * @param clientId - Client ID do PayPal
 * @returns URL do SDK
 */
export function getPayPalSDKUrl(clientId: string): string {
  const envInfo = detectPayPalEnvironment(clientId)
  const baseUrl = envInfo.environment === 'sandbox' 
    ? 'https://www.paypal.com/sdk/js'
    : 'https://www.paypal.com/sdk/js'
  
  return baseUrl
}

/**
 * Valida se um Client ID do PayPal é válido
 * @param clientId - Client ID para validar
 * @returns true se válido, false caso contrário
 */
export function isValidPayPalClientId(clientId: string): boolean {
  if (!clientId || clientId.trim() === '') {
    return false
  }

  const cleanClientId = clientId.trim()
  
  // Verificar se tem pelo menos 20 caracteres
  if (cleanClientId.length < 20) {
    return false
  }

  // Verificar se contém apenas caracteres válidos
  if (!/^[A-Z0-9_-]+$/i.test(cleanClientId)) {
    return false
  }

  return true
}

/**
 * Obtém informações de debug sobre o Client ID
 * @param clientId - Client ID do PayPal
 * @returns Informações de debug
 */
export function getPayPalClientIdDebugInfo(clientId: string) {
  const envInfo = detectPayPalEnvironment(clientId)
  const isValid = isValidPayPalClientId(clientId)
  
  return {
    clientId: clientId ? `${clientId.substring(0, 10)}...` : 'vazio',
    length: clientId?.length || 0,
    isValid,
    environment: envInfo.environment,
    confidence: envInfo.confidence,
    reason: envInfo.reason,
    sdkUrl: getPayPalSDKUrl(clientId)
  }
}
