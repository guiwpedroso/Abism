# Abismo — Descida à Fossa das Marianas (~11.000 m)

Uma experiência imersiva de *scrollytelling* interativo que transporta o visitante desde a superfície rasa do mar até o ponto mais profundo da crosta terrestre: a depressão Challenger Deep na Fossa das Marianas (~10.994 metros). Conforme o usuário rola a página, a profundidade aumenta, a luz solar se extingue, a pressão se eleva e o cursor se transforma em uma lanterna subaquática para explorar criaturas bioluminescentes.

---

## 🌊 Visão Geral do Projeto

- **Sem imagens externas**: Todo o universo visual é composto por **SVGs inline desenhados à mão**, gradientes contínuos em **CSS** e animações dinâmicas em **Canvas**.
- **Profundímetro em Tempo Real**: Régua lateral fixa que calcula e anima em tempo real:
  - Profundidade: `0 m` até `10.994 m`
  - Pressão hidrostática: $1 + \text{profundidade}/10$ (`1,0 atm` até `1.100,4 atm`)
  - Temperatura da água: `26,0 °C` até `1,2 °C`
  - Luz solar restante: `100%` até `0%`
- **Lanterna do Mergulhador**: A partir dos 200 m (Zona Mesopelágica), a tela escurece e o cursor vira um feixe de luz com amortecimento físico e inércia suave (`radial-gradient` dinâmico). Em celulares, segue o toque ou se move sutilmente com o giroscópio.
- **Cardume Reativo (Boids)**: Cardume de peixes no Canvas que reage com reflexo de fuga ao cursor do visitante.
- **Áudio Ambiente Sintetizado (Web Audio API)**: Sem arquivos de áudio externos; síntese analógica com ruído rosa e filtro passa-baixa ressonante modulado por LFO reproduzindo o som abafado das correntes marinhas profundas.
- **Criaturas Interativas**: Cada criatura pode ser inspecionada via clique ou teclado (`Tab` + `Enter`), abrindo um modal acessível com dados taxonômicos e adaptações extremas.
- **Acessibilidade**:
  - Contraste de texto validado (padrão WCAG AA).
  - Suporte completo a `prefers-reduced-motion` (desliga oscilações contínuas e animações da lanterna).
  - Responsivo de 360px a 1920px (o profundímetro converte-se em barra compacta em telas móveis).

---

## 🗺️ As 5 Zonas do Oceano

1. **Epipelágica (0 – 200 m)**: Luz turquesa solar, ondas no topo, raios de sol (*god rays*) animados em CSS, cardume dinâmico reativo e peixes de superfície (*Sardinella aurita*).
2. **Mesopelágica (200 – 1.000 m)**: Zona do crepúsculo. A luz enfraquece, neblina de partículas, água-viva translúcida pulsante (*Aequorea victoria*) e peixe-lanterna bioluminescente (*Myctophum punctatum*).
3. **Batipelágica (1.000 – 4.000 m)**: Meia-noite eterna. Escuridão total iluminada apenas pela lanterna e bioluminescência química. Peixe-pescador abissal (*Melanocetus johnsonii*), lula-vampira (*Vampyroteuthis infernalis*) e neve marinha contínua.
4. **Abissopelágica (4.000 – 6.000 m)**: Planície abissal. Silêncio visual e pausa de ritmo. Água-viva fantasma gigante solitária (*Stygiomedusa gigantea*) com braços orais em fita de mais de 10 metros.
5. **Hadal (6.000 – 10.994 m)**: Fossa das Marianas. Fendas hidrotermais com plumas minerais e brilho térmico alaranjado, pequeno submersível científico (*DSV*) e chamada para embarque na expedição.

---

## 🚀 Como Executar Localmente

### Opção 1: Com Vite (Recomendado)

```bash
# Instalar dependências
npm install

# Rodar servidor local de desenvolvimento
npm run dev

# Gerar build de produção
npm run build
```

Abra no navegador em `http://localhost:5173/`.

### Opção 2: Sem Build (HTML Direto)

Basta abrir o arquivo `index.html` em qualquer navegador web moderno, pois o projeto utiliza HTML5, CSS3, ES Modules e CDN fixa do GSAP.

---

## 🛠️ Stack Tecnológica

- **HTML5 Semântico** (`header`, `main`, `section`, `aside`, `footer`, `role="dialog"`)
- **CSS3 Puro** (Custom Properties, Flexbox, CSS Grid, Math Functions, SVG Filters)
- **JavaScript Moderno (ES6+)** (Vanilla JS, Canvas API, Web Audio API, Device Orientation)
- **GSAP 3.12.5 + ScrollTrigger** (Controle do scroll, telemetria contínua e parallax)
- **Vite** (Build e ambiente de desenvolvimento)

---

## 🧪 Testes Automatizados

O projeto inclui um script de teste end-to-end com Chrome Headless (`node test-e2e.js`) que valida:
- Ausência total de erros no console (`0 console errors`).
- Sincronização do profundímetro e seus cálculos hidrostáticos.
- Modal de criaturas e navegação por teclado (`ESC` para fechar).
- Ativação do áudio ambiente e formulário front-end.
- Responsividade visual em 1440px (Desktop) e 360px (Mobile).
