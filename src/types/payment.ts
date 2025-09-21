export interface PaymentProof {
  $id?: string // Appwrite document ID
  imageUrl: string // URL da imagem do comprovante
  amount: number // Valor do pagamento
  customerName?: string // Nome do cliente (opcional)
  paymentDate?: string // Data do pagamento (opcional)
  status: 'pending' | 'approved' | 'rejected' // Status do comprovante
  $createdAt?: string // Appwrite created timestamp
  $updatedAt?: string // Appwrite updated timestamp
}
