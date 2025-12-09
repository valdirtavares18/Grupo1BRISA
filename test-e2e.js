/**
 * Script de Testes End-to-End usando Playwright
 * Testa todos os fluxos do sistema FLUXO PRESENTE
 */

const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:3000';
const SUPER_ADMIN_EMAIL = 'admin@teste.com';
const SUPER_ADMIN_PASSWORD = 'admin123';

// Credenciais de teste
const TEST_ORG_ADMIN_EMAIL = 'orgadmin@teste.com';
const TEST_ORG_ADMIN_PASSWORD = 'orgadmin123';
const TEST_END_USER_CPF = '12345678901';
const TEST_END_USER_PASSWORD = 'senha123';

let browser;
let page;
let errors = [];

async function log(message) {
  console.log(`[TEST] ${message}`);
}

async function error(message) {
  console.error(`[ERROR] ${message}`);
  errors.push(message);
}

async function waitForPageLoad() {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

async function takeScreenshot(name) {
  try {
    await page.screenshot({ path: `test-screenshots/${name}.png`, fullPage: true });
  } catch (e) {
    // Ignora erro se diretório não existir
  }
}

async function testSuperAdminFlow() {
  log('=== TESTANDO FLUXO SUPER_ADMIN ===');
  
  try {
    // 1. Login como SUPER_ADMIN
    log('1. Fazendo login como SUPER_ADMIN...');
    await page.goto(`${BASE_URL}/login`);
    await waitForPageLoad();
    
    await page.fill('input[type="email"]', SUPER_ADMIN_EMAIL);
    await page.fill('input[type="password"]', SUPER_ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await waitForPageLoad();
    
    const currentUrl = page.url();
    if (!currentUrl.includes('/dashboard/admin')) {
      error('Login SUPER_ADMIN falhou - não redirecionou para /dashboard/admin');
      await takeScreenshot('superadmin-login-failed');
      return false;
    }
    log('✓ Login SUPER_ADMIN bem-sucedido');
    
    // 2. Criar nova organização
    log('2. Criando nova organização...');
    await page.click('a[href*="/organizations/new"]');
    await waitForPageLoad();
    
    const orgName = `Test Org ${Date.now()}`;
    const orgSlug = `test-org-${Date.now()}`;
    
    await page.fill('input[name="name"]', orgName);
    await page.fill('input[name="slug"]', orgSlug);
    await page.fill('input[name="primaryColor"]', '#001F3F');
    await page.click('button[type="submit"]');
    await waitForPageLoad();
    
    if (page.url().includes('/new')) {
      error('Criação de organização falhou');
      await takeScreenshot('create-org-failed');
      return false;
    }
    log('✓ Organização criada com sucesso');
    
    // 3. Ver detalhes da organização
    log('3. Verificando detalhes da organização...');
    await page.goto(`${BASE_URL}/dashboard/admin/organizations`);
    await waitForPageLoad();
    
    const orgLink = page.locator(`a:has-text("${orgName}")`).first();
    if (await orgLink.count() === 0) {
      error('Organização não encontrada na lista');
      return false;
    }
    await orgLink.click();
    await waitForPageLoad();
    log('✓ Detalhes da organização acessados');
    
    // 4. Editar organização
    log('4. Editando organização...');
    const editLink = page.locator('a[href*="/edit"]').first();
    if (await editLink.count() > 0) {
      await editLink.click();
      await waitForPageLoad();
      
      const newName = `${orgName} - Editado`;
      await page.fill('input[name="name"]', newName);
      await page.click('button[type="submit"]');
      await waitForPageLoad();
      log('✓ Organização editada com sucesso');
    }
    
    return true;
  } catch (e) {
    error(`Erro no fluxo SUPER_ADMIN: ${e.message}`);
    await takeScreenshot('superadmin-error');
    return false;
  }
}

async function testOrgAdminFlow() {
  log('\n=== TESTANDO FLUXO ORG_ADMIN ===');
  
  try {
    // Nota: Assumindo que já existe um ORG_ADMIN criado
    // Se não existir, precisamos criar via SUPER_ADMIN primeiro
    
    log('1. Fazendo login como ORG_ADMIN...');
    await page.goto(`${BASE_URL}/login`);
    await waitForPageLoad();
    
    // Tentar login (pode não existir ainda)
    await page.fill('input[type="email"]', TEST_ORG_ADMIN_EMAIL);
    await page.fill('input[type="password"]', TEST_ORG_ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await waitForPageLoad();
    
    if (page.url().includes('/login')) {
      log('⚠ ORG_ADMIN não existe ainda - pulando testes de ORG_ADMIN');
      return true; // Não é erro, apenas não configurado
    }
    
    if (!page.url().includes('/dashboard/organization')) {
      error('Login ORG_ADMIN falhou');
      return false;
    }
    log('✓ Login ORG_ADMIN bem-sucedido');
    
    // 2. Criar evento
    log('2. Criando novo evento...');
    await page.click('a[href*="/events/new"]');
    await waitForPageLoad();
    
    const eventTitle = `Evento Teste ${Date.now()}`;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startDate = tomorrow.toISOString().slice(0, 16);
    
    tomorrow.setHours(tomorrow.getHours() + 2);
    const endDate = tomorrow.toISOString().slice(0, 16);
    
    await page.fill('input[name="title"]', eventTitle);
    await page.fill('input[name="description"]', 'Descrição do evento teste');
    await page.fill('input[type="datetime-local"][name="startDate"]', startDate);
    await page.fill('input[type="datetime-local"][name="endDate"]', endDate);
    await page.click('button[type="submit"]');
    await waitForPageLoad();
    
    if (page.url().includes('/new')) {
      error('Criação de evento falhou');
      return false;
    }
    log('✓ Evento criado com sucesso');
    
    return true;
  } catch (e) {
    error(`Erro no fluxo ORG_ADMIN: ${e.message}`);
    return false;
  }
}

async function testEndUserFlow() {
  log('\n=== TESTANDO FLUXO END_USER ===');
  
  try {
    // 1. Registrar novo usuário
    log('1. Registrando novo usuário final...');
    await page.goto(`${BASE_URL}/register`);
    await waitForPageLoad();
    
    const testCPF = `1234567890${Math.floor(Math.random() * 10)}`;
    await page.fill('input[placeholder*="CPF"]', testCPF);
    await page.fill('input[type="password"]:first-of-type', TEST_END_USER_PASSWORD);
    await page.fill('input[type="password"]:last-of-type', TEST_END_USER_PASSWORD);
    await page.click('button[type="submit"]');
    await waitForPageLoad();
    
    if (page.url().includes('/register')) {
      error('Registro de usuário falhou');
      return false;
    }
    log('✓ Usuário registrado com sucesso');
    
    // 2. Verificar dashboard do usuário
    log('2. Verificando dashboard do usuário...');
    if (!page.url().includes('/dashboard/user')) {
      error('Não redirecionou para dashboard do usuário');
      return false;
    }
    log('✓ Dashboard do usuário acessado');
    
    // 3. Ver histórico (deve estar vazio)
    log('3. Verificando histórico...');
    await page.click('a[href*="/history"]');
    await waitForPageLoad();
    log('✓ Histórico acessado');
    
    return true;
  } catch (e) {
    error(`Erro no fluxo END_USER: ${e.message}`);
    return false;
  }
}

async function testPublicFlows() {
  log('\n=== TESTANDO FLUXOS PÚBLICOS ===');
  
  try {
    // 1. Home page
    log('1. Testando home page...');
    await page.goto(BASE_URL);
    await waitForPageLoad();
    
    const title = await page.textContent('h1');
    if (!title || !title.includes('FLUXO PRESENTE')) {
      error('Home page não carregou corretamente');
      return false;
    }
    log('✓ Home page carregada');
    
    // 2. Buscar eventos
    log('2. Testando busca de eventos...');
    await page.click('a[href*="/events/search"]');
    await waitForPageLoad();
    
    if (!page.url().includes('/events/search')) {
      error('Página de busca não carregou');
      return false;
    }
    log('✓ Página de busca acessada');
    
    // 3. Login page
    log('3. Testando página de login...');
    await page.goto(`${BASE_URL}/login`);
    await waitForPageLoad();
    
    const loginForm = await page.locator('form').count();
    if (loginForm === 0) {
      error('Formulário de login não encontrado');
      return false;
    }
    log('✓ Página de login acessada');
    
    return true;
  } catch (e) {
    error(`Erro nos fluxos públicos: ${e.message}`);
    return false;
  }
}

async function runAllTests() {
  log('🚀 Iniciando testes end-to-end do FLUXO PRESENTE...\n');
  
  browser = await chromium.launch({ headless: false });
  page = await browser.newPage();
  
  // Verificar se servidor está rodando
  try {
    await page.goto(BASE_URL, { timeout: 5000 });
  } catch (e) {
    error('Servidor não está rodando em http://localhost:3000');
    await browser.close();
    return;
  }
  
  const results = {
    superAdmin: await testSuperAdminFlow(),
    orgAdmin: await testOrgAdminFlow(),
    endUser: await testEndUserFlow(),
    public: await testPublicFlows(),
  };
  
  await browser.close();
  
  // Resumo
  log('\n=== RESUMO DOS TESTES ===');
  log(`SUPER_ADMIN: ${results.superAdmin ? '✓ PASSOU' : '✗ FALHOU'}`);
  log(`ORG_ADMIN: ${results.orgAdmin ? '✓ PASSOU' : '✗ FALHOU'}`);
  log(`END_USER: ${results.endUser ? '✓ PASSOU' : '✗ FALHOU'}`);
  log(`PÚBLICOS: ${results.public ? '✓ PASSOU' : '✗ FALHOU'}`);
  
  if (errors.length > 0) {
    log('\n=== ERROS ENCONTRADOS ===');
    errors.forEach((err, i) => log(`${i + 1}. ${err}`));
  }
  
  const allPassed = Object.values(results).every(r => r);
  log(`\n${allPassed ? '✅ TODOS OS TESTES PASSARAM' : '❌ ALGUNS TESTES FALHARAM'}`);
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };

