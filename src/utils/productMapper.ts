/**
 * Utility to map real product names to generic ebook names for PayPal
 * This ensures privacy and compliance with payment processors
 */

interface ProductMapping {
  realName: string
  genericName: string
  category: string
}

// Mapeamento de produtos para nomes genéricos de ebooks
const PRODUCT_MAPPINGS: ProductMapping[] = [
  // Categorias de conteúdo adulto
  { realName: 'video', genericName: 'Premium Digital Content', category: 'Digital Media' },
  { realName: 'content', genericName: 'Exclusive Digital Material', category: 'Digital Media' },
  { realName: 'material', genericName: 'Premium Digital Collection', category: 'Digital Media' },
  
  // Nomes específicos que podem aparecer
  { realName: 'alex', genericName: 'Premium Digital Guide', category: 'Digital Media' },
  { realName: 'vip', genericName: 'VIP Digital Access', category: 'Digital Media' },
  { realName: 'exclusive', genericName: 'Exclusive Digital Content', category: 'Digital Media' },
  { realName: 'premium', genericName: 'Premium Digital Package', category: 'Digital Media' },
  
  // Palavras relacionadas a vídeos
  { realName: 'video', genericName: 'Digital Video Collection', category: 'Digital Media' },
  { realName: 'film', genericName: 'Digital Film Package', category: 'Digital Media' },
  { realName: 'movie', genericName: 'Digital Movie Collection', category: 'Digital Media' },
  
  // Conteúdo educacional (para compliance)
  { realName: 'guide', genericName: 'Digital Learning Guide', category: 'Education' },
  { realName: 'tutorial', genericName: 'Digital Tutorial Package', category: 'Education' },
  { realName: 'course', genericName: 'Digital Course Material', category: 'Education' },
  { realName: 'training', genericName: 'Digital Training Package', category: 'Education' },
  
  // Conteúdo premium
  { realName: 'premium', genericName: 'Premium Digital Package', category: 'Digital Media' },
  { realName: 'exclusive', genericName: 'Exclusive Digital Collection', category: 'Digital Media' },
  { realName: 'vip', genericName: 'VIP Digital Access', category: 'Digital Media' },
  { realName: 'special', genericName: 'Special Digital Edition', category: 'Digital Media' },
  
  // Conteúdo digital
  { realName: 'digital', genericName: 'Digital Content Package', category: 'Digital Media' },
  { realName: 'online', genericName: 'Online Digital Access', category: 'Digital Media' },
  { realName: 'web', genericName: 'Web Digital Content', category: 'Digital Media' },
  
  // Conteúdo adulto (mapeado para genérico)
  { realName: 'adult', genericName: 'Mature Digital Content', category: 'Digital Media' },
  { realName: 'mature', genericName: 'Mature Digital Collection', category: 'Digital Media' },
  { realName: '18+', genericName: 'Age-Restricted Digital Content', category: 'Digital Media' },
  { realName: 'explicit', genericName: 'Explicit Digital Material', category: 'Digital Media' },
  
  // Conteúdo sensual (mapeado para genérico)
  { realName: 'sensual', genericName: 'Sensual Digital Content', category: 'Digital Media' },
  { realName: 'erotic', genericName: 'Erotic Digital Collection', category: 'Digital Media' },
  { realName: 'romantic', genericName: 'Romantic Digital Content', category: 'Digital Media' },
  { realName: 'intimate', genericName: 'Intimate Digital Material', category: 'Digital Media' }
]

/**
 * Get generic product name for PayPal
 * @param realName - Real product name
 * @returns Generic name suitable for payment processors
 */
export function getGenericProductName(realName: string): string {
  const normalizedName = realName.toLowerCase().trim()
  
  // Procurar por mapeamento específico
  for (const mapping of PRODUCT_MAPPINGS) {
    if (normalizedName.includes(mapping.realName.toLowerCase())) {
      return mapping.genericName
    }
  }
  
  // Mapeamento padrão baseado no comprimento e conteúdo
  if (normalizedName.length > 20) {
    return 'Premium Digital Content Package'
  } else if (normalizedName.includes('video') || normalizedName.includes('film')) {
    return 'Digital Video Collection'
  } else if (normalizedName.includes('photo') || normalizedName.includes('image')) {
    return 'Digital Photo Collection'
  } else if (normalizedName.includes('audio') || normalizedName.includes('music')) {
    return 'Digital Audio Collection'
  } else {
    return 'Premium Digital Content'
  }
}

/**
 * Get generic category for PayPal
 * @param realName - Real product name
 * @returns Generic category suitable for payment processors
 */
export function getGenericCategory(realName: string): string {
  const normalizedName = realName.toLowerCase().trim()
  
  // Procurar por mapeamento específico
  for (const mapping of PRODUCT_MAPPINGS) {
    if (normalizedName.includes(mapping.realName.toLowerCase())) {
      return mapping.category
    }
  }
  
  // Categoria padrão
  return 'Digital Media'
}

/**
 * Generate a generic description for PayPal
 * @param realName - Real product name
 * @param price - Product price
 * @returns Generic description suitable for payment processors
 */
export function getGenericDescription(realName: string, _price: number): string {
  const genericName = getGenericProductName(realName)
  const category = getGenericCategory(realName)
  
  return `${genericName} - ${category} Package`
}

/**
 * Check if a product name contains sensitive content
 * @param productName - Product name to check
 * @returns True if contains sensitive content
 */
export function containsSensitiveContent(productName: string): boolean {
  const sensitiveKeywords = [
    'adult', 'mature', '18+', 'explicit', 'porn', 'xxx', 'nsfw',
    'nude', 'naked', 'sex', 'sexual', 'erotic', 'sensual',
    'intimate', 'private', 'personal', 'real', 'authentic'
  ]
  
  const normalizedName = productName.toLowerCase()
  return sensitiveKeywords.some(keyword => normalizedName.includes(keyword))
}

/**
 * Sanitize product name for display in payment systems
 * @param productName - Original product name
 * @returns Sanitized name safe for payment processors
 */
export function sanitizeProductName(productName: string): string {
  if (containsSensitiveContent(productName)) {
    return getGenericProductName(productName)
  }
  
  // Remover caracteres especiais e limitar comprimento
  return productName
    .replace(/[^\w\s-]/g, '')
    .substring(0, 50)
    .trim()
}
