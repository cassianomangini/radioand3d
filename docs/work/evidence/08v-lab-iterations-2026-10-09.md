# 08V — Diário de QA visual do laboratório (09/10/2026)

**Escopo:** apenas `/dev/visual-lab`, scripts Playwright e documentação. Nenhum arquivo de página pública foi modificado.

## Iteração 1 — screenshot revela defeito que lint não vê

**Execução:** [37939747234](https://github.com/cassianomangini/radioand3d/actions/runs/37939747234) — CI completo verde. O protótipo apresentou três composições com mídia neutra e Motion para seleção. Ao abrir as imagens reais de desktop/mobile, foi identificado um defeito: no estudo **Mostruário** desktop, o título “Impressões.” invadia o parágrafo da coluna vizinha.

**Correção aplicada:** reequilibradas as colunas e reduzida a escala máxima do título da variação Mostruário; inserido teste Playwright que mede as caixas **dos glifos** do H2 e do parágrafo, em vez de confiar apenas em scrollWidth ou na caixa do elemento. O teste registra falha para colisão real.

## Iteração 2 — teste expõe corrida de hidratação

**Execução:** [37940392229](https://github.com/cassianomangini/radioand3d/actions/runs/37940392229) — CI reportou sucesso, porém o teste `Mostruário desktop 1440` **falhou na primeira tentativa** e passou no retry. A causa observada foi que o Playwright clicou no botão SSR antes de os handlers React estarem ativos (`aria-pressed` permaneceu `false`).

**Correção aplicada:** rota cliente expõe `data-lab-ready="true"` em `useEffect`, após a hidratação; os testes esperam esse marcador antes de clicar; para o conjunto de laboratório, retries foram desativados (`retries: 0`) para impedir falso verde por segunda tentativa. O ícone nativo do Next dev foi ocultado **somente nas capturas de QA**. Ampliada a matriz do laboratório para 1440/1024/390/360; o comparativo `comparativo.html` reúne as quatro configurações.

## Gate final desta rodada

- [x] Laboratório protegido com HTTP 404 em produção nas execuções observadas.
- [x] Três composições isoladas funcionam e estão acessíveis em desenvolvimento.
- [x] A CI captura desktop/mobile e gera comparativo; o arquivo é diagnóstico e **não** baseline aprovado.
- [ ] Comprovar ausência de regressão e **nenhum retry** após o marcador de hidratação (aguarda CI de revisão).
- [ ] Obter avaliação visual de Cassiano e selecionar uma direção.
- [ ] Receber mídia real aprovada E3 antes de qualquer finalização da página Impressões.

**Artefatos:** [capturas da segunda iteração](https://github.com/cassianomangini/radioand3d/actions/runs/37940392229/artifacts/11620553430). A existência de imagens e contato visual não implica aprovação estética.
