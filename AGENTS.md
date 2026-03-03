# AGENTS.md instructions for \\chearapi\sdcd\

## Objetivo
Este arquivo define quando usar cada agente, skill, workflow e regra da pasta `.agent`.
A ideia e reduzir ambiguidade e garantir roteamento consistente por tipo de tarefa.

## Descoberta
- Agentes: `.agent/agents/*.md`
- Skills: `.agent/skills/*/SKILL.md`
- Workflows: `.agent/workflows/*.md`
- Regras globais: `.agent/rules/*.md`
- Scripts de validacao: `.agent/scripts/*.py` e `scripts/` dentro das skills

## Regras de ativacao
1. Se o usuario mencionar explicitamente o nome (`$agent`, `$skill` ou `/workflow`), usar exatamente o item pedido.
2. Se nao houver mencao explicita, selecionar por melhor correspondencia semantica da descricao.
3. Para tarefas grandes com multiplos dominios (frontend + backend + db + testes + seguranca), iniciar com `orchestrator`.
4. Para tarefas pequenas e diretas, usar apenas 1 agente especialista.
5. Sempre acoplar skills relevantes ao agente escolhido.
6. Em caso de conflito, priorizar: seguranca > corretude funcional > testes > performance > UX/SEO.

## Uso por agente
- `orchestrator`: usar em tarefas multi-dominio, multi-etapa, ou quando 3+ especialistas forem necessarios.
- `project-planner`: usar para quebrar escopo, gerar plano, milestones e estimativas antes de codar.
- `explorer-agent`: usar para mapear codebase, dependencias, fluxos e arquitetura legada.
- `frontend-specialist`: usar para React/Next, UI, UX, CSS, acessibilidade e interacao web.
- `backend-specialist`: usar para API, regras de negocio, servicos Node/Python e integracoes.
- `database-architect`: usar para modelagem, indices, migracoes, queries e tuning SQL/NoSQL.
- `security-auditor`: usar para auditoria defensiva, hardening, auth/authz, OWASP e compliance.
- `penetration-tester`: usar para teste ofensivo, simulacao de ataque e validacao de explorabilidade.
- `test-engineer`: usar para estrategia de testes, piramide, unit/integration/e2e e cobertura.
- `qa-automation-engineer`: usar para pipeline de automacao QA e testes E2E em CI.
- `debugger`: usar para analise de causa raiz, reproducao, isolamento e correcao de bugs.
- `devops-engineer`: usar para CI/CD, containers, deploy, observabilidade e operacao.
- `performance-optimizer`: usar para latencia, throughput, Web Vitals, profiling e caching.
- `seo-specialist`: usar para SEO tecnico, metadata, schema, discoverability e GEO.
- `documentation-writer`: usar para README, guias de uso, ADRs e documentacao tecnica.
- `product-manager`: usar para requisitos, user stories, priorizacao e alinhamento de valor.
- `product-owner`: usar para estrategia, backlog, definicao de MVP e decisao de escopo.
- `mobile-developer`: usar para React Native/Flutter, UX mobile e recursos de plataforma.
- `game-developer`: usar para mecanicas, loop de jogo, engine e arquitetura de jogos.
- `code-archaeologist`: usar para codigo legado, refatoracao incremental e reducao de divida tecnica.

## Uso por skill
- `intelligent-routing`: usar quando houver duvida sobre qual agente/skill selecionar.
- `parallel-agents`: usar para dividir tarefa em trilhas paralelas coordenadas.
- `behavioral-modes`: usar para escolher modo de trabalho (brainstorm, plan, debug, execution).

- `architecture`: usar para decisoes arquiteturais e trade-offs.
- `plan-writing`: usar para planos faseados com entregaveis claros.
- `brainstorming`: usar para descoberta de ideias e levantamento de alternativas.
- `app-builder`: usar para scaffolding de app e setup inicial de projeto.

- `frontend-design`: usar para design system, UX, cor, tipografia e componentes.
- `web-design-guidelines`: usar para auditoria UI web (acessibilidade, legibilidade, UX).
- `tailwind-patterns`: usar quando houver Tailwind CSS no stack.
- `react-best-practices` (pasta `nextjs-react-expert`): usar para performance e boas praticas React/Next.
- `mobile-design`: usar para padroes de interface e experiencia mobile.
- `game-development`: usar para fluxos e padroes especificos de jogos.

- `api-patterns`: usar para estilo de API (REST/GraphQL/tRPC), versao e resposta.
- `nodejs-best-practices`: usar para Node.js (concorrencia, robustez, estrutura).
- `python-patterns`: usar para Python/FastAPI e padroes idiomaticos.
- `rust-pro`: usar para desenvolvimento e performance em Rust.
- `mcp-builder`: usar para construir/integrar servidores e ferramentas MCP.

- `database-design`: usar para schema, normalizacao, indexacao e migracoes.

- `testing-patterns`: usar para estrategia de testes e padroes de implementacao.
- `tdd-workflow`: usar quando a solicitacao pedir TDD ou ciclo red-green-refactor.
- `webapp-testing`: usar para testes web com Playwright e fluxos E2E.
- `lint-and-validate`: usar para lint/typecheck/quality gates automaveis.
- `code-review-checklist`: usar em revisao de PR/codigo.
- `clean-code`: usar como baseline de legibilidade, simplicidade e manutencao.

- `vulnerability-scanner`: usar para varredura de vulnerabilidades e riscos OWASP.
- `red-team-tactics`: usar para perspectiva ofensiva e teste de resiliencia.

- `deployment-procedures`: usar para publicacao e checklist de release.
- `server-management`: usar para operacao de servidor, tuning e manutencao.
- `performance-profiling`: usar para perfilamento e otimizacao de performance.

- `seo-fundamentals`: usar para SEO on-page, tecnico e Core Web Vitals.
- `geo-fundamentals`: usar para GEO (otimizacao para mecanismos generativos).
- `i18n-localization`: usar para internacionalizacao, locale e traducao.

- `bash-linux`: usar para automacao shell Linux/macOS.
- `powershell-windows`: usar para automacao shell em Windows.
- `documentation-templates`: usar para gerar docs em formato padrao.

## Uso por workflow
- `/brainstorm`: usar no inicio de produto/feature para explorar opcoes.
- `/plan`: usar para produzir plano sem escrever codigo imediatamente.
- `/create`: usar para criar app/feature nova do zero.
- `/enhance`: usar para evoluir feature existente sem reescrever tudo.
- `/debug`: usar para incidentes, falhas e regressao funcional.
- `/test`: usar para criar/executar testes e reportar cobertura.
- `/deploy`: usar para release, pre-flight e publicacao.
- `/preview`: usar para subir preview local e verificar mudancas.
- `/status`: usar para status de progresso, bloqueios e saude do projeto.
- `/orchestrate`: usar para coordenar multiplos agentes numa entrega complexa.
- `/ui-ux-pro-max`: usar para planejamento e implementacao de UI mais elaborada.

## Regras globais
- Carregar `.agent/rules/GEMINI.md` como regra global quando aplicavel ao contexto de desenvolvimento.
- Se houver instrucoes conflitantes entre skill e regra global, priorizar regra global de seguranca e qualidade.

## Scripts recomendados
- Validacao rapida durante desenvolvimento:
  - `python .agent/scripts/checklist.py .`
- Verificacao completa antes de deploy/release:
  - `python .agent/scripts/verify_all.py . --url http://localhost:3000`

## Ordem de decisao recomendada
1. Identificar dominio principal da solicitacao.
2. Escolher 1 agente especialista (ou `orchestrator` se multi-dominio).
3. Acoplar 1-3 skills diretamente relacionadas.
4. Selecionar workflow (`/plan`, `/debug`, `/deploy`, etc.) se a tarefa pedir rito fechado.
5. Executar scripts de validacao proporcionais ao risco da mudanca.

## Fallback
- Se um agente/skill citado nao existir, informar rapidamente e usar o equivalente mais proximo por descricao.
- Se faltar contexto, iniciar com `explorer-agent` + `project-planner`, depois seguir para especialista.
