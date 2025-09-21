import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Configurações do Wasabi
export const wasabiConfig = {
  region: process.env.WASABI_REGION || 'us-east-1',
  endpoint: process.env.WASABI_ENDPOINT || 'https://s3.wasabisys.com',
  accessKeyId: process.env.WASABI_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY || '',
  bucketName: process.env.WASABI_BUCKET_NAME || 'alex-site-storage',
  metadataBucketName: process.env.WASABI_METADATA_BUCKET_NAME || 'alex-site-metadata'
}

// Verificar se as configurações estão disponíveis
export const isWasabiConfigured = () => {
  return !!(
    wasabiConfig.accessKeyId && 
    wasabiConfig.secretAccessKey && 
    wasabiConfig.bucketName &&
    wasabiConfig.metadataBucketName
  )
}

// Cliente S3 para Wasabi
const s3Client = isWasabiConfigured() ? new S3Client({
  region: wasabiConfig.region,
  endpoint: wasabiConfig.endpoint,
  credentials: {
    accessKeyId: wasabiConfig.accessKeyId,
    secretAccessKey: wasabiConfig.secretAccessKey
  },
  forcePathStyle: true // Necessário para Wasabi
}) : null

export class WasabiStorage {
  // Upload de arquivo
  static async uploadFile(file: File, key: string, bucketName: string = wasabiConfig.bucketName) {
    if (!s3Client) {
      throw new Error('Wasabi não está configurado. Verifique as variáveis de ambiente.')
    }
    
    try {
      const buffer = await file.arrayBuffer()
      
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: new Uint8Array(buffer),
        ContentType: file.type,
        Metadata: {
          originalName: file.name,
          size: file.size.toString(),
          uploadedAt: new Date().toISOString()
        }
      })

      const response = await s3Client.send(command)
      return {
        $id: key,
        $bucketId: bucketName,
        $createdAt: new Date().toISOString(),
        name: file.name,
        mimeType: file.type,
        sizeOriginal: file.size,
        ...response
      }
    } catch (error) {
      console.error('Erro ao fazer upload para Wasabi:', error)
      throw error
    }
  }

  // Obter URL do arquivo (signed URL válida por 1 hora)
  static async getFileUrl(key: string, bucketName: string = wasabiConfig.bucketName) {
    if (!s3Client) {
      throw new Error('Wasabi não está configurado. Verifique as variáveis de ambiente.')
    }
    
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key
      })

      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
      return url
    } catch (error) {
      console.error('Erro ao obter URL do arquivo:', error)
      throw error
    }
  }

  // Obter URL pública (se o bucket for público)
  static getPublicUrl(key: string, bucketName: string = wasabiConfig.bucketName) {
    return `${wasabiConfig.endpoint}/${bucketName}/${key}`
  }

  // Deletar arquivo
  static async deleteFile(key: string, bucketName: string = wasabiConfig.bucketName) {
    if (!s3Client) {
      throw new Error('Wasabi não está configurado. Verifique as variáveis de ambiente.')
    }
    
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key
      })

      await s3Client.send(command)
      return true
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error)
      throw error
    }
  }

  // Listar arquivos
  static async listFiles(prefix: string = '', bucketName: string = wasabiConfig.bucketName) {
    if (!s3Client) {
      throw new Error('Wasabi não está configurado. Verifique as variáveis de ambiente.')
    }
    
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix
      })

      const response = await s3Client.send(command)
      return {
        files: response.Contents?.map(obj => ({
          $id: obj.Key,
          $bucketId: bucketName,
          $createdAt: obj.LastModified?.toISOString(),
          name: obj.Key?.split('/').pop(),
          sizeOriginal: obj.Size,
          ...obj
        })) || []
      }
    } catch (error) {
      console.error('Erro ao listar arquivos:', error)
      throw error
    }
  }
}

export { s3Client }


