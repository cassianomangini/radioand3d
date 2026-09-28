# Plano do Projeto - CM 3D and Radio

## 1. Visao

Construir um site autoral que una:

- pecas impressas em 3D;
- trabalhos personalizados para clientes;
- catalogo de cores e materiais disponiveis;
- referencias de acabamentos e possibilidades de producao;
- CM Radio / Music;
- uma experiencia visual forte, interativa e com muitas animacoes.

A proposta nao e fazer apenas uma loja ou apenas um player. O site deve funcionar como uma vitrine criativa unica, onde 3D e musica convivem sem parecer duas aplicacoes coladas.

## 2. Experiencia central

O primeiro marco precisa provar esta jornada:

1. a pessoa entra no site;
2. da play em uma musica;
3. continua navegando sem interromper o audio;
4. abre uma peca;
5. explora fotos, medidas, materiais e cores;
6. entende o que pode ser personalizado;
7. consegue partir para contato, orcamento ou compra quando aplicavel.

A radio precisa ser persistente na navegacao e tratada como parte estrutural do produto desde o inicio.

## 3. Areas do site

### Home

Apresenta rapidamente os dois universos:

- 3D;
- Radio / Music.

A home deve ser visual, viva e com pouco texto desperdicado. As animacoes precisam ajudar a contar o que existe no projeto.

### Pecas 3D

Catalogo de pecas produzidas ou oferecidas.

Cada peca pode ter:

- nome;
- categoria;
- descricao curta;
- fotos;
- medidas;
- materiais permitidos;
- cores permitidas;
- acabamento;
- status;
- disponibilidade;
- personalizacao;
- tempo medio de producao, se fizer sentido publicar;
- link de compra, contato ou orcamento.

### Cores e materiais

O site precisa separar corretamente:

- cor/material que existe no estoque ou repertorio;
- cor/material que pode ser usada em determinada peca;
- peca que esta pronta;
- peca que precisa ser produzida.

Ter um filamento nao significa ter uma peca pronta naquela cor.

### Trabalhos para clientes

Portfolio de projetos personalizados.

Cada caso pode mostrar:

- problema ou pedido;
- resultado;
- fotos;
- materiais;
- detalhes relevantes;
- possibilidade de pedir algo parecido.

### CM Radio / Music

Experiencia propria de audio.

Direcao:

- inspiracao Winamp;
- nostalgia sem copiar uma interface antiga literalmente;
- visual retrofuturista;
- controles modernos;
- desktop e mobile pensados separadamente;
- player persistente;
- playlist;
- progresso;
- volume;
- shuffle;
- repeat;
- capas;
- visualizador que reage ao audio.

Possiveis evolucoes:

- skins;
- equalizador;
- presets;
- favoritos;
- visualizadores diferentes;
- transicoes;
- historico;
- playlists tematicas;
- modo tela cheia.

## 4. Direcao visual

Princípios:

- visual forte, mas nao pesado;
- evitar estetica generica de "logo/site feito por IA";
- movimentos com proposito;
- bastante profundidade e dinamismo, sem poluir;
- 3D real quando ele agregar;
- interface da radio com personalidade;
- excelente leitura e navegacao;
- mobile nao pode ser uma versao espremida do desktop.

Animacoes podem incluir:

- entrada por camadas;
- mudanca de cor em pecas;
- rotacao de modelos;
- hover com resposta fisica;
- transicoes de secao;
- waveform e espectro;
- player expandindo e recolhendo;
- elementos reagindo a musica.

## 5. Reaproveitamento do artesopolis-landing

Existe codigo aproveitavel no repositorio `cassianomangini/artesopolis-landing`, principalmente no motor da radio.

A estrategia e **migracao seletiva**, nunca copiar o site inteiro.

Reaproveitar como base tecnica:

- `PlayerProvider`;
- utilitarios de audio;
- tipos do player;
- integracao atual com R2;
- analise com Meyda;
- logica de shuffle, historico, retry e falha de faixa;
- padrao de provider persistente no layout;
- controles neutros que fizerem sentido.

Redesenhar para CM:

- toda a camada visual do player;
- capa/arte;
- tipografia;
- cores finais;
- composicao;
- estados visuais;
- linguagem de motion.

Nao migrar identidade Artesopolis:

- astronauta;
- logos;
- favicon;
- copy;
- elementos criados apenas para acomodar o mascote.

A area atual de `impressoes` do Artesopolis e somente um placeholder visual. Portanto, o catalogo 3D do novo site sera construido como produto novo.

Auditoria detalhada: [REUSE_AUDIT_ARTESOPOLIS_LANDING.md](REUSE_AUDIT_ARTESOPOLIS_LANDING.md).

## 6. Arquitetura proposta

Esta e uma proposta inicial, nao uma decisao irreversivel.

### Frontend

- Next.js;
- React;
- TypeScript;
- App Router;
- componentes reutilizaveis;
- design tokens proprios;
- Motion para motion UI;
- React Three Fiber / Three.js somente onde o 3D real trouxer valor.

### Backend e dados

O backend deve suportar:

- catalogo;
- materiais;
- cores;
- pecas;
- combinacoes validas;
- portfolio;
- midia;
- musicas;
- playlists;
- configuracoes publicas.

Se dados do Artesopolis Admin forem reaproveitados, o site deve consumir somente uma camada publica controlada. Nao conectar a vitrine diretamente a toda a operacao interna.

### Midia

Precisaremos tratar separadamente:

- fotos;
- capas;
- audio;
- modelos 3D publicaveis;
- thumbnails;
- possiveis videos.

Definir desde cedo:

- formatos aceitos;
- tamanho maximo;
- compressao;
- cache;
- CDN;
- fallback;
- direitos de uso.

## 7. Estrutura de agentes

Os agentes devem ter papeis claros. Nao queremos varios agentes alterando a mesma area sem criterio.

### Planejamento e arquitetura

Responsavel por:

- escopo;
- sequenciamento;
- dependencias;
- contratos entre areas;
- decisoes estruturais.

### Experience / Motion

Responsavel por:

- identidade visual;
- layout;
- hierarquia;
- motion;
- responsividade;
- acessibilidade;
- comportamento visual.

### Frontend

Responsavel por:

- componentes;
- paginas;
- navegacao;
- integracoes de UI;
- estado do player;
- experiencia no navegador.

### Backend / Data

Responsavel por:

- modelagem;
- APIs;
- acesso a dados;
- seguranca;
- publicacao;
- integridade.

### Audio / Media

Responsavel por:

- motor do player;
- fila;
- estado persistente;
- Media Session;
- Web Audio;
- visualizacao;
- comportamento de audio.

### Infra

Responsavel por:

- ambientes;
- deploy;
- secrets;
- observabilidade;
- performance;
- storage;
- custos;
- recuperacao.

### Review / QA

Responsavel por:

- review tecnico;
- regressao;
- seguranca;
- acessibilidade;
- comportamento real no navegador;
- verificacao visual.

## 8. Padroes de trabalho

Cada entrega deve ter:

- objetivo;
- escopo;
- fora de escopo;
- criterios de aceite;
- dependencias;
- riscos;
- verificacao;
- checklist curto.

Regras:

- uma fonte canonica para cada decisao;
- nao duplicar o mesmo plano em varios arquivos;
- nao criar documentacao enorme sem necessidade;
- nao misturar implementacao com decisao nao aprovada;
- UI visivel precisa ser verificada visualmente;
- player precisa ser testado navegando entre rotas;
- mobile precisa ser validado separadamente;
- codigo novo precisa respeitar os limites entre catalogo, radio e infraestrutura.

## 9. Fases

### Fase 0 - Fundacao

- auditar e portar seletivamente o motor do player do `artesopolis-landing`;
- remover qualquer dependencia de identidade Artesopolis do codigo reaproveitado;
- definir produto;
- fechar naming e identidade;
- definir stack;
- criar estrutura de projeto;
- criar padroes;
- criar agentes;
- configurar ambientes;
- configurar CI basico.

### Fase 1 - Prova da experiencia

Construir uma vertical slice completa:

- home inicial;
- 1 peca real;
- algumas cores;
- fotos reais;
- 3 a 5 musicas;
- player persistente;
- navegacao sem interromper o audio;
- desktop;
- mobile;
- motion inicial.

Essa fase valida o DNA do projeto.

### Fase 2 - Catalogo

- categorias;
- filtros;
- materiais;
- cores;
- variacoes;
- portfolio;
- paginas detalhadas;
- contato/orcamento.

### Fase 3 - Radio completa

- playlist avancada;
- favoritos;
- equalizador;
- visualizadores;
- skins;
- modo expandido;
- historico;
- controles de sistema.

### Fase 4 - Operacao e integracoes

Somente depois de validar necessidade:

- integracao com loja;
- links de compra;
- estoque publico;
- pedidos personalizados;
- eventual checkout;
- analytics;
- automacoes.

## 10. Primeiro milestone

**Milestone 01 - 3D + Radio funcionando como uma experiencia unica**

Aceite:

- existe uma home funcional;
- existe pelo menos uma peca real;
- a peca possui fotos, medidas e cores validas;
- existe uma radio funcional com musicas reais do projeto;
- o audio continua tocando durante a navegacao;
- o player funciona em desktop e mobile;
- existe pelo menos uma animacao de assinatura;
- a pagina nao parece template generico;
- nenhuma area critica depende de mock visual enganoso.

## 11. Proximos passos

1. portar o nucleo de audio reutilizavel do `artesopolis-landing` para uma camada neutra;
2. provar persistencia do audio entre rotas;
3. criar estrutura de diretorios do projeto;
4. definir stack final;
5. fechar identidade visual CM inicial;
6. definir modelo minimo de dados;
7. escolher a primeira peca real;
8. escolher as primeiras musicas;
9. desenhar home + player CM;
10. implementar a vertical slice;
11. validar no navegador;
12. somente depois expandir.
