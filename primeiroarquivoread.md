# Roadmap do MVP de CRM com Pipeline e Integração WhatsApp

## FASE 1: Fundação do Projeto

### Visão Geral do Projeto

Este projeto é um CRM (Customer Relationship Management) com foco em pipeline de vendas e integração com WhatsApp. A aplicação é construída com uma arquitetura moderna utilizando:

**Backend:**
- Node.js com Express para API RESTful
- TypeScript para tipagem estática
- PostgreSQL como banco de dados relacional
- Prisma como ORM para interação com o banco
- JWT para autenticação e controle de acesso
- Testes automatizados com Jest e Supertest

**Frontend:**
- React 18 com TypeScript
- Chakra UI para componentes de interface
- React Router para navegação
- Axios para requisições HTTP
- React Hook Form para formulários
- Abordagem componentizada e responsiva

A estrutura do projeto segue padrões de arquitetura escalável, com separação clara de responsabilidades e organização modular do código, permitindo a fácil manutenção e adição de novas funcionalidades conforme o sistema evolui.

### Frontend - Setup Inicial

**Objetivos:**

- Estabelecer base da aplicação frontend
- Configurar ambiente de desenvolvimento
- Definir componentes e estrutura visual base

**Tarefas:**

- Inicializar projeto React com Vite
- Configurar TypeScript, ESLint e Prettier
- Estruturar sistema de roteamento
- Implementar sistema de tema/componentes base
- Criar layouts responsivos principais

**Bibliotecas e Tecnologias:**

- React 18+ com TypeScript
- React Router para navegação
- Chakra UI ou Material UI para sistema de componentes
- Vite como bundler
- Axios para requisições HTTP
- Prettier/ESLint para padrões de código

**Observações:**

- Priorizar abordagem mobile-first desde o início
- Estabelecer padrão de componentes reutilizáveis
- Implementar estrutura de pastas escalável (features, components, hooks, utils)

## Phase 1 Progress Report

### Completed (Backend):
✅ Created directory structure following scalable architecture
✅ Initialized Node.js project with TypeScript configuration
✅ Installed core dependencies (Express, Prisma, JWT, bcrypt, Winston)
✅ Set up environment configuration (.env files)
✅ Created basic Express server with middleware setup
✅ Implemented logging system with Winston
✅ Defined database schema with Prisma (User, Company, RefreshToken models)
✅ Created database client utility with logging
✅ Generated Prisma client for type-safe database access
✅ Implemented authentication service with JWT token management
✅ Created user model and service for CRUD operations
✅ Developed authentication middleware for route protection
✅ Implemented role-based authorization system
✅ Developed API routes for authentication (login, register, refresh token, logout)
✅ Implemented input validation middleware
✅ Created company service implementation
✅ Added proper error handling for API endpoints
✅ Set up test environment with Jest and Supertest
✅ Created initial authentication tests
✅ Configured database migration scripts for production use
✅ Expanded test coverage for user management endpoints
✅ Implemented test coverage for company-related endpoints
✅ Set up database cleanup for tests

### Completed (Frontend):
✅ Initialized React project with Vite
✅ Configured TypeScript
✅ Set up project directory structure (components, pages, hooks, etc.)
✅ Installed core dependencies (React Router, Chakra UI, Axios)
✅ Configured ESLint and Prettier
✅ Implemented authentication pages and forms (Login, Register)
✅ Set up routing with React Router
✅ Created layout components (Navbar, Sidebar)
✅ Set up protected routes
✅ Created basic dashboard structure
✅ Implemented responsive layouts for core pages
✅ Created API service layer with Axios for data fetching
✅ Implemented token storage and management
✅ Added authentication context for state management
✅ Created a custom form hook for validation
✅ Set up environment variables
✅ Fixed Chakra UI component compatibility issues - downgraded to React 18
✅ Updated Login and Register components to use the form hook
✅ Added comprehensive form validation
✅ Implemented proper error handling for API requests
✅ Added loading states and UI feedback
✅ Fixed icon component issues in Login form
✅ Created dashboard UI components (Activity feed, Stats overview, Quick action buttons)
✅ Implemented user profile management UI (Profile edit form, Password change functionality)
✅ Created company settings page and component
✅ Created company form with logo preview
✅ Implemented API service for company operations

### DevOps & CI/CD:
✅ Set up CI/CD workflow with GitHub Actions
✅ Configured automated testing for backend
✅ Set up database integration testing with PostgreSQL in CI
✅ Implemented frontend build and lint checking in CI
✅ Added test environment configuration

### Completed Tasks:
✅ Expanded test coverage for critical backend endpoints
✅ Set up CI/CD workflow for automated testing
✅ Configured company settings UI
✅ Implemented RBAC (Role-Based Access Control) in the frontend
✅ Enhanced dashboard with real-time metrics and visualization
✅ Added loading skeletons for better UX
✅ Improved error handling with more descriptive messages
✅ Implemented role-based route protection
✅ Created permission utilities for frontend access control
✅ Added user data persistence with local storage

### Current Status:
Phase 1 is now complete. The project has a solid foundation with:
- Robust authentication system with JWT tokens
- Role-based access control on both frontend and backend
- Company management functionality
- Enhanced dashboard with real-time metrics and loading states
- Improved UI/UX with loading skeletons and responsive design

### Progress on Phase 2:
✅ Defined Team and TeamMember models in database schema
✅ Implemented team management service with CRUD operations
✅ Created role-based access control middleware
✅ Developed team controller with RESTful endpoints
✅ Set up team routes with proper authorization
✅ Created team types for frontend integration
✅ Implemented team service for frontend API communication
✅ Created TeamList component for displaying teams
✅ Developed TeamFormModal for creating and editing teams
✅ Built TeamMemberList component for managing team members
✅ Added Teams page with proper navigation
✅ Integrated teams routing in the application
✅ Installed required Chakra UI Icons dependency
✅ Fixed TypeScript errors in team components
✅ Implemented team invitation system:
  - ✅ Created TeamInvitation types and interfaces
  - ✅ Added team invitation API services
  - ✅ Built TeamInvitationList component for team management
  - ✅ Implemented UserInvitationsPage for users to manage received invitations
  - ✅ Added notification badges for pending invitations in navigation
✅ Integrated tabbed interface for team members and invitations
✅ Added role-based access controls for invitation management
✅ Implemented team dashboard visualizations and metrics:
  - ✅ Created TeamPerformanceMetrics component for team statistics
  - ✅ Developed TeamActivityFeed component for activity tracking
  - ✅ Integrated team metrics service with mock data generation
  - ✅ Added team performance overview with comparative metrics
  - ✅ Implemented team-specific activity feeds and unified activity view
✅ Optimized API calls for team data with Promise.all for parallel processing
✅ Enhanced dashboard with team insights and tab-based navigation
✅ Added comprehensive type safety across all team-related components

### Current Status:
Phase 2 is complete. The project now has:
- Team management functionality with CRUD operations
- Role-based team member management
- Comprehensive team invitation system with notifications
- Type-safe interfaces across all team-related components
- Responsive UI with loading states and proper error handling
- Team dashboard visualizations with performance metrics
- Team activity feed with unified view for all teams
- Optimized data loading patterns for team information

### Next Steps:
1. Begin implementation of Phase 3 features:
   - Develop Pipeline and Kanban board features
   - Create Lead management system and data models
   - Implement drag-and-drop functionality for pipeline stages
   - Build lead detail views and forms

2. Implementation plan for Pipeline and Kanban board:
   - Create database models for Pipeline, Stage, and Lead entities
   - Develop backend API endpoints for lead management
   - Build Kanban board UI with drag-and-drop functionality
   - Implement lead filtering and sorting capabilities
   - Add pipeline analytics and conversion tracking

3. Prepare for WhatsApp integration (Phase 4):
   - Research Evolution API requirements and limitations
   - Design communication architecture for message handling
   - Create message storage system for chat history
   - Plan webhooks for real-time messaging events

4. Continue enhancing the dashboard:
   - Add pipeline-specific visualizations
   - Implement lead conversion metrics
   - Create team performance comparisons
   - Add time-based filtering for metrics

### Backend - Arquitetura Base

**Objetivos:**

- Configurar estrutura do servidor
- Estabelecer conexão com banco de dados
- Implementar autenticação básica

**Tarefas:**

- Inicializar projeto Node.js com estrutura modular
- Configurar TypeScript e estrutura de pastas
- Implementar conexão com banco de dados
- Criar modelos de dados iniciais (usuário, empresa)
- Configurar sistema de autenticação JWT
- Implementar middlewares essenciais (CORS, logging, error handling)

**Bibliotecas e Tecnologias:**

- Node.js com Express ou NestJS
- TypeScript
- PostgreSQL para dados relacionais
- Prisma como ORM
- JWT para autenticação
- bcrypt para hash de senhas
- Winston para logging

**Observações:**

- Estruturar seguindo princípios SOLID
- Implementar tratamento de erros padronizado
- Preparar para escalabilidade futura


## FASE 2: Funcionalidades Core de CRM

### Frontend - Autenticação e Dashboard

**Objetivos:**

- Implementar fluxo completo de autenticação
- Desenvolver dashboard básico
- Criar navegação principal

**Tarefas:**

- Desenvolver páginas de login/registro/recuperação de senha
- Implementar gestão de tokens JWT no frontend
- Criar layout principal com sidebar/navbar
- Desenvolver dashboard com widgets básicos
- Implementar sistema de notificações

**Bibliotecas Adicionais:**

- Redux Toolkit ou Zustand para gerenciamento de estado
- React Hook Form para formulários
- Yup para validação
- React-Toastify para notificações
- jwt-decode para manipulação de tokens


### Backend - Gestão de Usuários e Permissões

**Objetivos:**

- Implementar sistema robusto de usuários
- Desenvolver controle de acesso baseado em funções (RBAC)
- Criar APIs para gestão de perfil

**Tarefas:**

- Desenvolver endpoints completos de autenticação
- Implementar refresh tokens
- Criar sistema de funções e permissões
- Desenvolver gestão de equipes básica
- Implementar configurações de perfil

**Bibliotecas Adicionais:**

- jsonwebtoken para JWT
- nodemailer para emails de recuperação
- Redis para armazenamento de tokens (opcional)


## FASE 3: Pipeline e Visualização Kanban

### Frontend - Implementação do Kanban

**Objetivos:**

- Desenvolver interface Kanban interativa
- Implementar gestão visual de leads
- Criar funcionalidades de filtro e busca

**Tarefas:**

- Desenvolver componente Kanban com drag-and-drop
- Criar modais para adicionar/editar leads
- Implementar funcionalidade de mudança de estágio
- Desenvolver filtros e buscas de leads
- Criar visualização detalhada de leads
- Implementar funcionalidade para campos personalizados

**Bibliotecas Adicionais:**

- React Beautiful DnD para drag-and-drop
- React Query para gerenciamento de dados do servidor
- date-fns para manipulação de datas
- Lodash para utilitários

**Observações:**

- Focar em performance com carregamento otimizado
- Implementar UX intuitiva para operações frequentes
- Garantir feedback visual para todas as ações


### Backend - APIs para Pipeline e Leads

**Objetivos:**

- Desenvolver modelo de dados para pipeline
- Implementar APIs para gestão de leads
- Criar sistema para campos personalizados

**Tarefas:**

- Criar modelos para pipelines, estágios e leads
- Desenvolver endpoints CRUD completos
- Implementar sistema de campos personalizáveis
- Criar endpoints para movimentação entre estágios
- Desenvolver sistema de etiquetas/tags
- Implementar filtros e buscas avançadas

**Bibliotecas Adicionais:**

- Joi para validação de dados
- Mongoose ou Prisma para modelagem flexível
- Bull para processamentos assíncronos (opcional)


## FASE 4: Integração com WhatsApp e Chat

### Frontend - Interface de Chat

**Objetivos:**

- Desenvolver interface unificada de chat
- Implementar visualização de histórico de conversas
- Criar sistema de respostas rápidas

**Tarefas:**

- Criar interface de lista de conversas
- Desenvolver chat com histórico de mensagens
- Implementar indicadores de status (enviado, lido)
- Criar sistema de respostas predefinidas
- Desenvolver integração com websockets
- Implementar upload e visualização de mídia

**Bibliotecas Adicionais:**

- Socket.io-client para comunicação em tempo real
- emoji-picker-react para suporte a emojis
- react-dropzone para upload de arquivos

**Observações:**

- Garantir experiência de chat semelhante a aplicativos populares
- Implementar indicadores claros de status de mensagem
- Otimizar para dispositivos móveis


### Backend - Integração com WhatsApp

**Objetivos:**

- Implementar conexão com Evolution API
- Desenvolver sistema de mensagens
- Criar mecanismo de webhooks

**Tarefas:**

- Desenvolver conectores para Evolution API
- Criar endpoints para envio/recebimento de mensagens
- Implementar sistema de armazenamento de conversas
- Desenvolver mecanismo de webhook para eventos de mensagens
- Criar sistema de filas para processamento de mensagens
- Implementar tratamento de diferentes tipos de mídia

**Bibliotecas e Tecnologias:**

- Socket.io para comunicação em tempo real
- Axios para requisições à Evolution API
- Multer para processamento de arquivos
- Bull para filas de mensagens
- Webhooks para integração bidirecional

**Observações:**

- Implementar mecanismos de retry para mensagens falhas
- Criar sistema robusto para lidar com quedas de conexão
- Garantir conformidade com limitações do WhatsApp não oficial


## FASE 5: API, Webhooks e Relatórios

### Frontend - Dashboards e Relatórios

**Objetivos:**

- Criar visualizações de dados e métricas
- Implementar filtros e exportações
- Desenvolver insights de pipeline

**Tarefas:**

- Desenvolver dashboard com métricas de conversão
- Criar visualizações do funil de vendas
- Implementar gráficos de desempenho
- Desenvolver sistema de filtros por período
- Criar funcionalidade de exportação de relatórios
- Implementar alertas e notificações baseados em metas

**Bibliotecas Adicionais:**

- Recharts ou Chart.js para visualizações
- react-csv para exportação de dados
- react-to-print para impressão de relatórios
- react-pdf para geração de PDFs


### Backend - API Pública e Sistema de Relatórios

**Objetivos:**

- Desenvolver API para integrações externas
- Implementar sistema de webhooks
- Criar endpoints para métricas e relatórios

**Tarefas:**

- Desenvolver sistema de API keys
- Criar documentação interativa da API
- Implementar registro e configuração de webhooks
- Desenvolver endpoints para métricas do pipeline
- Criar sistema de agregação de dados para relatórios
- Implementar cache para consultas frequentes

**Bibliotecas e Tecnologias:**

- Swagger/OpenAPI para documentação
- Bull para processamento de relatórios pesados
- Redis para cache de resultados
- xlsx ou json2csv para exportação

**Observações:**

- Implementar rate limiting para API pública
- Garantir segurança em endpoints sensíveis
- Otimizar queries de relatórios para grande volume de dados


## Considerações Finais para MVP

**Recomendações Técnicas:**

- Iniciar com arquitetura monolítica bem estruturada
- Utilizar Docker para ambientes de desenvolvimento consistentes
- Implementar CI/CD básico com GitHub Actions
- Garantir cobertura de testes para funcionalidades críticas
- Utilizar serviços gerenciados (banco de dados, armazenamento) quando possível

**Prioridades para MVP:**

- Focar primeiro na experiência de gerenciamento de leads (pipeline/kanban)
- Garantir que a integração com WhatsApp seja robusta mesmo com API não oficial
- Priorizar UX intuitiva sobre funcionalidades avançadas
- Implementar métricas básicas antes de relatórios complexos
- Garantir segurança e performance desde o início

**Estratégia de Deploy:**

- Utilizar serviços como Vercel/Netlify para frontend
- Deploy de backend em plataformas como Digital Ocean, Render ou Railway
- Considerar serverless para algumas funcionalidades (como webhooks)
- Implementar monitoramento básico com Sentry ou similar

Este roadmap proporciona uma visão clara para desenvolvimento do MVP, priorizando as funcionalidades essenciais enquanto estabelece uma base sólida para expansões futuras. O foco está em criar um CRM funcional com pipeline Kanban e comunicação via WhatsApp que entregue valor imediato aos empresários enquanto mantém a porta aberta para crescimento.


### Next Steps:
1. Consider future enhancements:
   - Implement data export/import functionality
   - Add advanced filtering and search capabilities
   - Create a mobile app for on-the-go access
   - Implement AI-assisted insights and recommendations