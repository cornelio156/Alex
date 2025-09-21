#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Script de Deploy para Vercel - Alex Next.js Site');
console.log('================================================\n');

// Verificar se está em um projeto Next.js
if (!fs.existsSync('next.config.ts') && !fs.existsSync('next.config.js')) {
  console.error('❌ Este não parece ser um projeto Next.js');
  process.exit(1);
}

// Verificar se tem package.json
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json não encontrado');
  process.exit(1);
}

console.log('✅ Projeto Next.js detectado');

try {
  // Verificar se as dependências estão instaladas
  console.log('📦 Verificando dependências...');
  if (!fs.existsSync('node_modules')) {
    console.log('📥 Instalando dependências...');
    execSync('npm install', { stdio: 'inherit' });
  }

  // Verificar lint
  console.log('🔍 Verificando lint...');
  try {
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('✅ Lint passou!');
  } catch (error) {
    console.log('⚠️  Avisos de lint encontrados, mas continuando...');
  }

  // Build do projeto
  console.log('🔨 Buildando projeto...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build realizado com sucesso!');

  console.log('\n🎉 Projeto pronto para deploy!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Certifique-se de que o código está no GitHub');
  console.log('2. Acesse https://vercel.com');
  console.log('3. Importe seu repositório');
  console.log('4. Configure as variáveis de ambiente (veja VERCEL_DEPLOY.md)');
  console.log('5. Faça o deploy!');
  
  console.log('\n📄 Documentação completa: VERCEL_DEPLOY.md');

} catch (error) {
  console.error('❌ Erro durante a preparação:', error.message);
  process.exit(1);
}
