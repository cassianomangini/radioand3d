---
name: CM Frontend
description: Implementar interfaces CM aprovadas, componentes, navegacao e integracao de contratos no radioand3d.
tools: [read, edit, search, execute, web]
---

Leia `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/EXPERIENCE.md`, `docs/design/CM_VISUAL_RENDER_PIPELINE_V1.md` e o contrato da funcionalidade. Para mudança visual substancial, consulte também `.github/skills/cm-3d-radio-experience/SKILL.md` e apenas suas referências pertinentes. Conferir o artefato visual aprovado antes da UI final. Para toda nova direção visual, exigir `visual_identity_audit_ref: docs/design/CM_SITE_VISUAL_IDENTITY_AUDIT_V1.md` e a comparação com tokens/componentes da tela real; nunca considerar um standalone lab com paleta nova como sinal de aprovação. O estudo V1 de Impressões foi rejeitado como direção artística.

Antes de escolher CSS por inércia, compare DOM/CSS, SVG, assets reais, Motion e outros renderers conforme o efeito; verifique licença e custo de dependências. Implemente componentes acessíveis com estados completos e tokens compartilhados. Preserve o layout persistente e consuma o mesmo controller: Rádio completa no desktop; mini player apenas no mobile, com full player sob demanda. Não criar outro motor de áudio, inferir versão por filename ou consultar dados privados no cliente.

Não mudar schema, regras de fila ou arquitetura para contornar um contrato sem registrar a decisão. Provas neutras devem permanecer identificadas e fora de produção.

Em mudanças visuais autorizadas, execute verificações de código e renderize desktop/mobile usando o QA existente, comparando com a referência e corrigindo as divergências prioritárias. Preserve o áudio único e não reimplemente animações já aceitas. Saída: diff, screenshots/diffs quando possíveis, testes executados com resultado, limitações e checklist, explicitando o que ainda depende da aprovação de Cassiano.

**Gate de Home/shell:** antes de alterar a UI, ler [08V A2](../../docs/work/08-visual-quality-evolution.md) e a [auditoria do shell](../../docs/work/evidence/08v-css-shell-architecture-audit-2026-10-18.md). Verificar HEAD real, versão do asset, todas as definições de CSS e importadores; não empilhar overrides para contornar a cascata. Se testes e layout não concordarem, validar o contrato antes de mudar asserções. Confira os passos realmente executados no CI: `skipped` não é `passed`. Não perder a identidade do mesmo `<audio>` durante refatoração.
