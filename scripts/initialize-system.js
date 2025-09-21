#!/usr/bin/env node

/**
 * Script de inicialização do sistema
 * Executa a inicialização manual do sistema Wasabi
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Inicializando sistema Alex 2.0...\n');

// Verificar se as variáveis de ambiente estão configuradas
const requiredEnvVars = [
  'WASABI_ACCESS_KEY_ID',
  'WASABI_SECRET_ACCESS_KEY', 
  'WASABI_BUCKET_NAME',
  'WASABI_METADATA_BUCKET_NAME'
];

console.log('📋 Verificando variáveis de ambiente...');

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variáveis de ambiente obrigatórias não encontradas:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n💡 Configure as variáveis no arquivo .env.local');
  process.exit(1);
}

console.log('✅ Variáveis de ambiente configuradas\n');

// Verificar se o projeto foi buildado
console.log('🔨 Verificando build do projeto...');
try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Build concluído com sucesso\n');
} catch (error) {
  console.error('❌ Erro no build do projeto:');
  console.error(error.message);
  process.exit(1);
}

console.log('🎉 Sistema inicializado com sucesso!');
console.log('\n📝 Próximos passos:');
console.log('1. Execute: npm run dev');
console.log('2. Acesse: http://localhost:3000');
console.log('3. Faça login com: admin@gmail.com / admin123');
console.log('\n🔧 O sistema criará automaticamente:');
console.log('- Usuário administrador padrão');
console.log('- Configurações iniciais do site');
console.log('- Estrutura de metadados no Wasabi');

