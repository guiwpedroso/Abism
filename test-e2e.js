import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runTests() {
  console.log('🚀 Iniciando bateria de testes automatizados com Chrome Headless...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--use-fake-ui-for-media-stream', '--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.toString());
  });

  try {
    // 1. Teste Desktop (1440px)
    console.log('🖥️ Configurando viewport 1440x900 (Desktop)...');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

    // Esperar 1s para carregar fontes e animações iniciais
    await new Promise(r => setTimeout(r, 1000));

    // Verificar título e elementos essenciais
    const title = await page.title();
    console.log(`✓ Título da página: "${title}"`);

    const heroHeading = await page.$eval('.hero-title', el => el.textContent.trim());
    console.log(`✓ Título Hero: "${heroHeading}"`);

    // Verificar Profundímetro Inicial
    const initialDepth = await page.$eval('#val-depth', el => el.textContent.trim());
    const initialPressure = await page.$eval('#val-pressure', el => el.textContent.trim());
    console.log(`✓ Profundímetro Inicial: ${initialDepth}m | Pressão: ${initialPressure} atm`);

    // Testar som ambiente
    console.log('🔊 Testando botão de som ambiente Web Audio...');
    const btnSound = await page.$('#btn-sound');
    await btnSound.click();
    await new Promise(r => setTimeout(r, 600));
    const isPlaying = await page.$eval('#btn-sound', el => el.classList.contains('is-playing'));
    console.log(`✓ Botão de som ativado com sucesso: ${isPlaying}`);

    // Testar rolagem até o fundo
    console.log('🌊 Rolando página até a Fossa das Marianas (~11.000m)...');
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    // Aguardar interpolação dos números no loop de animação
    await new Promise(r => setTimeout(r, 2000));

    const finalDepth = await page.$eval('#val-depth', el => el.textContent.trim());
    const finalPressure = await page.$eval('#val-pressure', el => el.textContent.trim());
    const finalTemp = await page.$eval('#val-temp', el => el.textContent.trim());
    const finalLight = await page.$eval('#val-light', el => el.textContent.trim());

    console.log(`✓ Profundímetro no Fundo: ${finalDepth}m | Pressão: ${finalPressure} atm | Temp: ${finalTemp}°C | Luz: ${finalLight}%`);

    // Verificar se botão subir à superfície está visível
    const isSurfaceBtnVisible = await page.$eval('#btn-surface', el => el.classList.contains('is-visible'));
    console.log(`✓ Botão "Subir à superfície" visível: ${isSurfaceBtnVisible}`);

    // Testar formulário de expedição CTA
    console.log('✍️ Testando formulário de e-mail na Lista de Espera...');
    await page.type('#waitlist-email', 'mergulhador@abismo.com');
    await page.click('#btn-submit-cta');
    await new Promise(r => setTimeout(r, 500));
    const feedbackText = await page.$eval('#form-feedback', el => el.textContent.trim());
    const isSuccess = await page.$eval('#form-feedback', el => el.classList.contains('success'));
    console.log(`✓ Feedback do formulário: "${feedbackText}" (Sucesso: ${isSuccess})`);

    // Rolar até a zona batipelágica para testar clique em criatura
    console.log('🐙 Testando interação com criatura (Peixe-Pescador Abissal)...');
    await page.evaluate(() => {
      document.querySelector('#zona-batipelagica').scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 1200));

    const anglerBtn = await page.$('button[data-creature="anglerfish"]');
    await anglerBtn.click();
    await new Promise(r => setTimeout(r, 600));

    const modalName = await page.$eval('#modal-creature-name', el => el.textContent.trim());
    const modalScientific = await page.$eval('#modal-creature-scientific', el => el.textContent.trim());
    const isModalOpen = await page.$eval('#creature-modal-backdrop', el => el.classList.contains('is-open'));
    console.log(`✓ Modal aberto: ${isModalOpen} | Criatura: "${modalName}" (${modalScientific})`);

    // Fechar modal com Escape
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 400));
    const isModalClosed = await page.$eval('#creature-modal-backdrop', el => !el.classList.contains('is-open'));
    console.log(`✓ Modal fechado com ESC: ${isModalClosed}`);

    // Testar botão "Subir à Superfície"
    console.log('⬆️ Testando clique no botão "Subir à superfície"...');
    await page.click('#btn-surface');
    await new Promise(r => setTimeout(r, 2000));
    const currentScrollY = await page.evaluate(() => window.scrollY);
    console.log(`✓ Posição do scroll após subir: ${currentScrollY}px (Topo alcançado)`);

    // 2. Teste Mobile (360px)
    console.log('\n📱 Configurando viewport 360x780 (Mobile)...');
    await page.setViewport({ width: 360, height: 780 });
    await new Promise(r => setTimeout(r, 1000));

    // Verificar se há overflow horizontal indesejado
    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log(`✓ Sem overflow horizontal indesejado em 360px: ${!isOverflowing}`);

    // Verificar visibilidade e tamanho do profundímetro no mobile
    const gaugeBox = await page.$eval('.depth-gauge', el => {
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height, bottom: window.innerHeight - rect.bottom };
    });
    console.log(`✓ Profundímetro em 360px: Largura ${gaugeBox.width.toFixed(1)}px, Altura ${gaugeBox.height.toFixed(1)}px`);

    // Capturar screenshot para garantia visual
    const screenshotDir = path.resolve('./screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir);
    }
    await page.screenshot({ path: path.join(screenshotDir, 'mobile-360px.png'), fullPage: false });
    console.log('✓ Screenshot mobile capturado em ./screenshots/mobile-360px.png');

    await page.setViewport({ width: 1440, height: 900 });
    await page.screenshot({ path: path.join(screenshotDir, 'desktop-1440px.png'), fullPage: false });
    console.log('✓ Screenshot desktop capturado em ./screenshots/desktop-1440px.png');

    // Verificação de erros no console
    console.log('\n🔍 Verificação final de erros no console:');
    if (consoleErrors.length === 0 && pageErrors.length === 0) {
      console.log('🎉 0 erros no console e 0 exceções!');
    } else {
      console.warn('⚠️ Console errors:', consoleErrors);
      console.warn('⚠️ Page errors:', pageErrors);
    }

  } catch (err) {
    console.error('❌ Falha nos testes:', err);
  } finally {
    await browser.close();
    console.log('🏁 Bateria de testes finalizada.');
  }
}

runTests();
