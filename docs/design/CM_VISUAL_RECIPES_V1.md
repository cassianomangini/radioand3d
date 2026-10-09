# Receitas visuais CM V1 — candidatos testáveis, não componentes prontos

**Condição:** referências e especificações de experimentos. A implementação final de uma receita exige `artifact_ref`, render real e aprovação de Cassiano quando representar mudança de design. Ver [pipeline](CM_VISUAL_RENDER_PIPELINE_V1.md).

## R1 — Superfície editorial do Estúdio (consumidor: Impressões)

**Objetivo:** valorizar peças realmente produzidas com enquadramento, luz, material e legibilidade — não uma grade SaaS.

- **Composição:** fotografia/asset de uma peça real como elemento de maior peso; texto curto e funcional; respiro intencional; CTA para ver a peça ou pedir orçamento. Evitar repetição de texto 3D e ícones de benefícios.
- **Renderer:** HTML semântico/Next Image com dimensões e recorte controlados; CSS para grid, sobreposição mínima e hover leve; SVG somente para diagrama técnico se houver necessidade real.
- **Estados:** sem foto aprovada → placeholder neutro identificado; imagem carregando; erro de mídia; desktop largo/curto e 390/360 mobile; hover/focus/touch.
- **Rejeitar:** máquina inventada, mock apresentado como foto, gradiente substituindo peça, quatro cards iguais, recorte que corta informação, fonte comprimida.
- **Aceite:** peça legível e contextualizada, mobile com composição própria e mídia real aprovada. A seleção de fotos depende de E3.

## R2 — Galeria informativa (consumidor: Produtos; somente se houver evolução autorizada)

**Objetivo:** foto principal, alternativas e variações reais mais legíveis que no marketplace.

- **Renderer:** DOM/Next Image/HTML, navegação acessível e vídeo real quando houver. Motion pode coordenar transição de layout e foco **apenas** quando houver ganho demonstrável; nenhum WebGL com produto sintético.
- **Estados:** variação selecionada, indisponível, sem mídia, imagem alta/larga, vídeo opcional, zoom quando aprovado.
- **Contratos imutáveis:** CTA único **Comprar na Shopee**, sem carrinho/checkout; dimensões honestas e ficha próxima da decisão; preço/estoque somente com fonte confiável.
- **Rejeitar:** animação prejudicando seleção, thumbnail insuficiente, informações repetidas, variação simulada apresentada como fotografada.

## R3 — Material/color de apoio

**Objetivo:** demonstrar acabamento real de filamentos sem transformar Materiais & Cores em quarto pilar do hub.

- **Renderer:** amostras reais, fotos e labels; CSS semântico e seleção visível. Usar SVG apenas para controle/diagrama.
- **Estados:** variação sem imagem, código/material ausente, mobile com toque, contraste independente da própria cor.
- **Rejeitar:** hex inventado como foto do filamento, ícones genéricos, gradiente ornamental para substituir objeto físico.

## R4 — Motion de transição da Rádio (SOMENTE QA)

**Objetivo:** preservar a experiência de player **já aceita**, incluindo split/focus/fullscreen e retorno.

- **Renderer existente:** WAAPI/FLIP, dados de áudio verdadeiros, CDP de captura atual; não migrar para Motion/GSAP sem pedido próprio e prova de paridade.
- **Estados de regressão:** abrir/fechar/interromper, divider drag, mini/full mobile, título longo, reduced motion, seek, playlist, único `audio` persistente.
- **Rejeitar:** segundo áudio, remount, barra de visualizer fake, movimento órfão, scroll indevido, captura de apenas um estado.

## R5 — Cenário artístico estático

**Objetivo:** permitir profundidade visual quando a composição aprovada realmente pede arte, sem simular pintura com dezenas de sombras.

- **Renderer:** imagem de fundo com enquadramento desktop/mobile próprio, exportada em WebP/AVIF e com fallback; elementos clicáveis/textuais continuam DOM; SVG multicamada apenas se animação/interação de luz for requisito.
- **Rejeitar:** céu galáctico e glow genéricos, fundo concorrendo com CTA, imagem promovida como foto real da produção, crop que aumenta a seção indevidamente.

## Inventário inicial para QA

| Recurso | Local | Uso permitido |
| --- | --- | --- |
| Logo CM | `public/images/cm-3d-radio-logo.png` | Original fornecido pelo usuário; não redesenhar |
| Hero X1 | `public/images/x1_fundo_2.png` | Arte da Home aceita; preservar crop aprovado |
| Rádio preview | `public/images/cm-radio-preview-art.png` | Identidade de Rádio; não presumir capa oficial |
| Screenshots de Rádio históricos | `docs/work/evidence/03b-*.png` | Referência histórica; não assumir baseline atual aprovada sem revisão |
| Screenshots de CI | artefatos `studio-radio-visual-review` | Evidência de captura por commit e viewport, não aprovação |
| Mock aprovado de hub e produto | descrito em `STUDIO_COMMERCE_EXPERIENCE_V1.md` e `STUDIO_PRODUCT_PAGE_VISUAL_V1.md` | Imagens originais precisam estar disponíveis explicitamente para comparação pixel a pixel; ausência é lacuna de evidência, não permissão para inventar |

**Próxima atividade:** após instalação do QA e auditoria renderizada, completar referências realmente disponíveis e construir protótipo R1 somente com media aprovada ou placeholder explicitamente neutro em laboratório, antes de qualquer página pública.
