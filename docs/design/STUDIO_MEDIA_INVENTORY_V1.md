# STUDIO_MEDIA_INVENTORY_V1 — Inventário de mídia do Estúdio

Status: **auditoria inicial concluída; aquisição de mídia pendente**  
Versão: **V1 — 04/10/2026**

Objetivo: separar o que já existe do que ainda precisa ser fotografado, desenhado ou enviado ao repositório antes de implementação visual.

---

## 1. Assets encontrados na main

Diretório auditado: `public/images`.

| Asset | Uso atual/possível | Pode servir como prova comercial? |
| --- | --- | --- |
| `cm-3d-radio-logo.png` | identidade | não |
| `cm-radio-divider.webp` | Rádio/divisor | não |
| `cm-radio-preview-art.png` | Rádio | não |
| `cm-studio-background.webp` | fundo/legado de Estúdio | não como prova de produto |
| `x1_fundo_2.png` | hero/home do Estúdio | não como prova de placa/caixa/produto |
| `public/images/social/*` | ícones/redes | não |

Conclusão: **o repositório ainda não contém o conjunto de fotografia comercial necessário para S1.0B/S1.2+**.

---

## 2. Referências fornecidas na conversa atual

Existem referências visuais enviadas por Cassiano nesta conversa que ainda não estão versionadas como assets públicos do projeto.

### Referência A — placa Mano Jotta física

Classificação proposta:

- **produzido**
- candidato forte para:
  - Hub / Impressões;
  - página de Placas;
  - primeiro caso real;
  - possível thumbnail de orçamento.

Necessário antes do frontend:

- arquivo original em boa resolução;
- confirmação de autorização de exposição;
- idealmente 1–3 fotos adicionais se existirem.

### Referência B — prancha de variações Mano Jotta

Classificação proposta:

- **conceito/estudo**
- pode apoiar página de projeto como processo visual;
- não apresentar como várias peças produzidas.

### Referência C — prancha Cruisin Brasil

Classificação proposta:

- **conceito/estudo**, salvo comprovação de produção;
- candidata a Impressões/Conceitos ou material de processo;
- não usar como prova física sem foto da peça.

---

## 3. Mídia mínima para liberar o Hub

### Impressões

Precisa:

- 1 foto real forte, preferencialmente de placa produzida.

Status: **candidato existe na conversa; falta versionar**.

### Orçamento

Pode começar com:

- detalhe de projeto real;
- ou imagem do mesmo trabalho em enquadramento diferente.

Status: **pode reutilizar o projeto Mano Jotta com crop diferente**, desde que não pareça duplicação preguiçosa.

### Produtos

Precisa:

- 1 foto real de produto que esteja ou vá estar disponível na Shopee.

Status: **não encontrado na main**.

### Placas

Precisa:

- 1 foto principal;
- idealmente 1 detalhe;
- idealmente 1 foto em contexto.

Status: **apenas uma candidata conhecida na conversa**.

### Caixas

Precisa:

- 1 foto externa;
- 1 foto interna/aberta quando aplicável;
- medidas reais.

Status: **não encontrado na main**.

---

## 4. Mídia mínima para página Produto

Por produto, meta inicial:

1. foto principal limpa;
2. segundo ângulo;
3. detalhe de uso/acabamento;
4. escala/contexto quando necessário;
5. foto de variação somente se a variação realmente existir.

Não bloquear o lançamento exigindo cinco fotos perfeitas se houver 2–3 fotos suficientes para explicar o item. O número é meta editorial, não quota artificial.

---

## 5. Diagramas a produzir

### Caixas

Criar um diagrama simples e reutilizável para:

- comprimento;
- largura;
- altura;
- indicação interna/externa;
- tampa;
- furo/passagem.

Formato preferido: SVG sem estética decorativa.

### Placas

Não criar diagrama genérico por padrão. Só se houver necessidade real de explicar:

- espessura;
- base;
- apoio;
- fixação.

---

## 6. Padrão fotográfico

A parte 3D deve parecer um estúdio real.

Preferir:

- fundo neutro;
- luz lateral/superior;
- textura das camadas visível;
- escala compreensível;
- peça inteira sem corte acidental;
- pelo menos uma foto sem excesso de pós-processamento.

Evitar:

- fundo de IA;
- glow artificial;
- HDR agressivo;
- recorte ruim;
- objeto perdido em cenário decorativo;
- mão/rosto quando não acrescenta contexto;
- dados pessoais de cliente.

---

## 7. Nomes e organização futura

Sugestão de estrutura quando os arquivos forem adicionados:

```text
public/images/studio/
  projects/
    mano-jotta/
  services/
    placas/
    caixas/
  products/
    <slug-do-produto>/
  materials/
```

Não mover assets atuais antes de existir necessidade real; isso é convenção para os novos arquivos.

---

## 8. Pendências de mídia

- [ ] receber/versionar foto original da placa Mano Jotta;
- [ ] confirmar autorização de exposição;
- [ ] receber fotos de pelo menos uma caixa real;
- [ ] selecionar 1–3 produtos reais da Shopee para o primeiro catálogo;
- [ ] receber fotos desses produtos;
- [ ] confirmar medidas;
- [ ] decidir se há foto de placa em contexto;
- [ ] desenhar diagrama técnico de caixa depois de escolher um caso real.

---

## 9. Regra de bloqueio

Se uma página depende de mídia que ainda não existe:

- não fabricar o asset em CSS;
- não gerar render que pareça prova real;
- não preencher a seção com produto fictício;
- manter o bloco fora do frontend ou usar placeholder editorial explicitamente identificado em ambiente de design.

