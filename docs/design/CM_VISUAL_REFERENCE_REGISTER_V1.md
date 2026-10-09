# Registro de referências visuais — 08V V1

**Status:** inventário e política operacionais; **nenhuma baseline estética foi aprovada ou promovida**.  
**Fonte da execução:** [08V](../work/08-visual-quality-evolution.md) · [pipeline render-first](CM_VISUAL_RENDER_PIPELINE_V1.md).

## O que é considerado referência

Uma referência válida precisa indicar **a mesma rota/superfície, estado de UI, viewport, conteúdo e origem da aprovação**. Distinguir quatro categorias:

- **Aprovado em contrato:** direção/comportamento aprovado por Cassiano e documentado, mesmo sem PNG original disponível para comparação de pixel.
- **Referência visual original:** imagem/mock enviado ou explicitamente aprovado; exige arquivo verificável, viewport e data para comparar.
- **Captura de implementação:** screenshot produzido pelo CI. Prova o que o navegador renderizou; não prova que o resultado é o correto.
- **Baseline de regressão:** captura determinística e explicitamente selecionada/validada; somente essa categoria pode ser usada pelo `toHaveScreenshot` como critério automático.

**Regra:** jamais promover automaticamente uma captura só porque todos os testes passaram, e nunca chamar de "aprovada" uma baseline retirada de CI sem revisão de Cassiano.

## Inventário disponível

| Superfície | Fonte de contrato | Capturas verificáveis | Estado |
| --- | --- | --- | --- |
| Home desktop/mobile | [Experiência](../EXPERIENCE.md), aprovação de 05/10 | [CI 37936816995](https://github.com/cassianomangini/radioand3d/actions/runs/37936816995) — PNGs Home em cinco viewports | Comportamento aceito; **capturas são observação**, não baseline |
| Hub `/studio` (3 entradas) | [Handoff comercial](STUDIO_COMMERCE_EXPERIENCE_V1.md) e [wireframes](STUDIO_COMMERCE_WIREFRAMES_V1.md), hub aprovado | [CI 37936816995](https://github.com/cassianomangini/radioand3d/actions/runs/37936816995) — PNGs hub em cinco viewports | Contrato aprovado; mídia E3 pendente; **PNG original do mock não versionado** |
| Produto individual | [Produto V1](STUDIO_PRODUCT_PAGE_VISUAL_V1.md), direção aprovada em 05/10 | [CI 37936816995](https://github.com/cassianomangini/radioand3d/actions/runs/37936816995) — rota real de produto | Contrato aprovado; **sem baseline validada** |
| Rádio, focus/fullscreen/retorno | [Rádio](../RADIO.md) e [pacote aprovado](STUDIO_RADIO_APPROVAL_PACKAGE_V1.md) | [Capturas CDP](https://github.com/cassianomangini/radioand3d/actions/runs/37936816995/artifacts/11618995570) e `docs/work/evidence/03b-*.png` | Aceita funcionalmente; arte dos estados reais e dados de R2 exigem distinção |
| Orçamento | [Contrato de fluxo](../STUDIO_QUOTE_FLOW_V1.md), estrutura avançada | [CI 37936816995](https://github.com/cassianomangini/radioand3d/actions/runs/37936816995) | **Direção visual final de uma etapa ainda não aprovada** |
| Impressões | [Receita R1](CM_VISUAL_RECIPES_V1.md) | Ainda sem fotografia autorizada | **Não existe baseline de produto real** |
| `/dev/visual-lab` | [Brief 08V](CM_VISUAL_LAB_V1.md) | Geração pelo CI de desenvolvimento, após teste | **Apenas estudos; nenhuma opção aprovada** |

## Referências novas da auditoria da marca (09/10/2026)

Cassiano anexou seis referências nesta conversa: **Rádio em foco**, **Home em split**, **banner CMANGINI 3D + X1**, **selo circular CMANGINI 3D**, **X1 vertical** e **apresentação de Placa Personalizada/Mano Jotta**. Elas foram comparadas aos assets e à implementação. **Não estão versionadas no Git como arquivos nesta rodada.** Ver [análise completa](CM_SITE_VISUAL_IDENTITY_AUDIT_V1.md).

O [CI 37942413229](https://github.com/cassianomangini/radioand3d/actions/runs/37942413229) possui render do shell atual de Home, hub, Produto e Orçamento em desktop/mobile. É referência de **implementação observada**, não mock criativo ou baseline homologada. Os três estudos de Impressões do laboratório V1 estão **rejeitados como candidatos estéticos**, preservados só para QA.

## Protocolo para comparação antes/depois

1. Conferir se a tela possui mock aprovado com arquivo e condições de reprodução. Se não houver, manter a comparação descritiva e solicitar a referência; não inventar pixel parity.
2. Capturar antes e depois no **mesmo** projeto Playwright: rota, viewport, DPR, nível de motion, tempo, fonte e estado de dados. Para elementos dinâmicos, usar fixture explicitamente rotulada ou máscara seletiva **apenas em teste de regressão**, sem esconder bugs funcionais.
3. Registrar os cinco maiores desvios com evidência de estado, localização e impacto, especialmente enquadramento, hierarquia, controle, scroll e mídia.
4. Rodar prova de navegação, botões, teclado, mobile e acessibilidade em paralelo ao screenshot; pixel-diff sozinho não prova boa UX.
5. **Somente após escolha/aprovação:** salvar PNG em `tests/visual/__screenshots__` ou caminho próprio estável, conferir hash e ativar `expect(page).toHaveScreenshot` com threshold deliberado por superfície. Revisar qualquer atualização de baseline como mudança de produto, sem `--update-snapshots` automático em CI.

## Bloqueios objetivos

- Mocks originais aprovados do hub/produto não estão versionados aqui; não converter capturas atuais em "mock oficial".
- Catálogo da Rádio é dinâmico; os screenshots vazios da CI não são referência de reprodução real.
- Imagens reais de Impressões/Placas/Caixas dependem de autorização E3.
- Nenhuma opção do laboratório foi selecionada pelo usuário.

**Próxima ação:** usar capturas isoladas do laboratório para avaliação comparativa; preservar todas as variantes no artefato CI e registrar uma vencedora **apenas depois** da revisão.
