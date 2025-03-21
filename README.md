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

### Progress on Phase 3:
✅ Defined Pipeline, Stage, Lead, and LeadTag models in database schema
✅ Created frontend TypeScript interfaces for pipeline-related entities
✅ Implemented backend services for pipeline management:
  - ✅ Added CRUD operations for pipelines
  - ✅ Created stage management with reordering capabilities
  - ✅ Implemented lead management with filtering and tagging
✅ Developed controllers for pipeline and lead operations
✅ Set up API routes for pipeline and lead endpoints
✅ Created frontend pipeline service with comprehensive API methods:
  - ✅ Implemented pipeline CRUD operations
  - ✅ Added stage management functions
  - ✅ Created lead manipulation endpoints
  - ✅ Built tag management functionality
✅ Developed pipeline management pages:
  - ✅ Created PipelinesPage to list all pipelines
  - ✅ Built PipelinePage for individual pipeline view
✅ Implemented modal components for pipeline management:
  - ✅ CreatePipelineModal for new pipeline creation
  - ✅ PipelineSettingsModal for editing and deleting pipelines
  - ✅ CreateStageModal for adding stages to pipelines
✅ Built Kanban board UI with drag-and-drop:
  - ✅ Implemented KanbanBoard component with DragDropContext
  - ✅ Created KanbanColumn component for pipeline stages
  - ✅ Developed KanbanCard component for lead visualization
  - ✅ Added LeadDetailModal for viewing lead details
✅ Implemented drag-and-drop functionality:
  - ✅ Added stage reordering capability
  - ✅ Implemented lead movement between stages
  - ✅ Created visual feedback for drag operations
✅ Added responsive design for pipeline views
✅ Implemented error handling and loading states
✅ Completed lead management modals:
  - ✅ EditLeadModal for modifying lead details
  - ✅ DeleteLeadConfirmation for lead removal
  - ✅ CreateLeadModal for adding new leads
✅ Finished stage management modals:
  - ✅ EditStageModal for updating stage properties
  - ✅ DeleteStageModal for removing stages
✅ Implemented custom fields for leads:
  - ✅ Added support for creating custom fields in CreateLeadModal
  - ✅ Implemented editing functionality for custom fields in EditLeadModal
  - ✅ Created persistence for custom field data

### Current Status:
Phase 3 is now complete. The project has:
- Full pipeline management functionality
- Interactive Kanban board with drag-and-drop capabilities
- Complete lead management system with CRUD operations
- Custom fields support for flexible lead data structure
- Comprehensive tagging system for lead categorization
- Responsive UI with loading states and proper error handling
- Stage management including creating, editing, and deleting stages
- Proper error handling and user feedback throughout the pipeline system

### Next Steps:
1. Implement pipeline analytics:
   - Create conversion rate visualizations
   - Build funnel analysis components
   - Add time-based metrics for pipeline efficiency
   - Implement team performance comparisons

2. Enhance lead management with additional features:
   - Implement lead activity history tracking
   - Add advanced filtering and search functionality
   - Create bulk operations for lead management
   - Develop lead import/export functionality

3. Prepare for Phase 4 (WhatsApp integration):
   - Research Evolution API requirements and limitations
   - Design communication architecture for message handling
   - Plan message storage system for chat history
   - Prepare webhooks for real-time messaging events
   - Design UI components for chat interface
   - Create message templating system

4. Improve UX with additional enhancements:
   - Add keyboard shortcuts for common operations
   - Implement tour/onboarding for new users
   - Create comprehensive help documentation
   - Add customizable dashboard for pipeline metrics

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

**Recomendações Técnicas:**

- Iniciar com arquitetura monolítica bem estruturada
- Utilizar Docker para ambientes de desenvolvimento consistentes
- Implementar CI/CD básico com GitHub Actions
- Garantir cobertura de testes para funcionalidades críticas
- Utilizar serviços gerenciados (banco de dados, armazenamento) quando possível

### Progress on Phase 4 (WhatsApp & Chat Integration):
✅ Defined database models in Prisma schema:
  - ✅ Created Contact model for storing WhatsApp contacts
  - ✅ Created Chat model for conversation management
  - ✅ Created Message model for message history
  - ✅ Created QuickReply model for predefined messages
  - ✅ Added proper relationships between models
✅ Implemented backend services for chat functionality:
  - ✅ Created ChatService with CRUD operations for contacts, chats, and messages
  - ✅ Added methods for managing message history and statuses
  - ✅ Implemented QuickReply management
✅ Built WhatsApp integration service with Evolution API:
  - ✅ Added connection handling and initialization
  - ✅ Implemented text and media message sending
  - ✅ Created webhook processor for incoming messages
  - ✅ Added automatic contact and chat creation
  - ✅ Implemented connection status monitoring with auto-reconnect
✅ Developed controllers and routes:
  - ✅ Created ChatController with endpoints for all chat operations
  - ✅ Built WhatsAppController for Evolution API interaction
  - ✅ Added authentication middleware to protect routes
  - ✅ Created webhook endpoint for receiving messages
✅ Set up type definitions for frontend:
  - ✅ Created interfaces for all chat related entities
  - ✅ Added DTOs for API operations
  - ✅ Defined enums for message statuses and types
✅ Created frontend services and hooks:
  - ✅ Implemented chat and WhatsApp API services
  - ✅ Created socket.io hook for real-time communication
  - ✅ Added typing indicator functionality
  - ✅ Built message status tracking system
  - ✅ Implemented notification system with browser notifications and sound
✅ Developed UI components for chat interface:
  - ✅ Created ChatList component with unread indicators
  - ✅ Built ChatWindow component for message history display
  - ✅ Implemented ChatInput component with emoji support
  - ✅ Added file attachment and media preview functionality
  - ✅ Implemented connection status indicators
✅ Implemented advanced backend functionality:
  - ✅ Created queue system for reliable message processing with Bull
  - ✅ Implemented file upload service with Multer
  - ✅ Added S3 integration for media file storage
  - ✅ Completed Socket.io server implementation for real-time messaging
  - ✅ Implemented typing indicators and message status updates
  - ✅ Created message retry mechanism for failed messages
  - ✅ Enhanced ChatInput component with proper TypeScript typing and file handling
  - ✅ Improved useSocket hook with robust connection handling and automatic reconnection
  - ✅ Added connection status indicators and notifications in the UI
  - ✅ Implemented fallback mechanisms for offline message sending
  - ✅ Created reconnection modal for manual connection recovery
✅ Enhanced media and connection handling:
  - ✅ Fixed TypeScript issues related to User type definition (companyId property)
  - ✅ Added client-side media compression for image uploads
  - ✅ Enhanced media preview functionality with better type support and UI
  - ✅ Added progress indicators for file uploads
  - ✅ Improved ChatWindow with network status indicators
  - ✅ Addressed null safety in message retry functionality
  - ✅ Implemented better file type detection and icon display

### Current Status:
Phase 4 is now complete. The chat and WhatsApp integration includes all core features with significant enhancements for robustness and UX. The system now features a fully responsive interface with real-time messaging, file sharing capabilities, and comprehensive WhatsApp integration. Connection management has been strengthened with automatic reconnection mechanisms featuring exponential backoff, clear visual status indicators, and offline operation support. Media handling now includes client-side compression, upload progress indicators, and enhanced file previews. Message delivery reliability has been improved with proper queuing, status tracking, and error handling.

### Next Steps:
1. Start Phase 5

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

### Progress on Phase 5 (API, Webhooks, and Reports):
✅ Enhanced database schema:
  - ✅ Created ApiKey model for API authentication
  - ✅ Added Webhook model for external integrations
  - ✅ Implemented Report model for saved reports
  - ✅ Created necessary enum types for report categories
✅ Implemented backend services:
  - ✅ Developed ApiKeyService with generation and validation capabilities
  - ✅ Created WebhookService with signature generation and validation
  - ✅ Implemented ReportService with comprehensive metrics generation
  - ✅ Added real-time webhook delivery with error handling and retry logic
✅ Enhanced API capabilities:
  - ✅ Implemented pipeline performance metrics calculations
  - ✅ Created team performance analysis functionality
  - ✅ Added conversion rate and deal time metrics
  - ✅ Built lead value aggregation by stage
✅ Created controller layer:
  - ✅ Developed ApiController with endpoints for all service operations
  - ✅ Implemented validation for all API requests
  - ✅ Added proper error handling and logging
✅ Implemented API routes and security:
  - ✅ Created internal API routes with JWT authentication
  - ✅ Implemented public API routes with API key authentication
  - ✅ Added rate limiting for external API access
  - ✅ Created API documentation endpoint
  - ✅ Secured endpoints with proper role-based access control
✅ Developed frontend services:
  - ✅ Created ReportService for interacting with report endpoints
  - ✅ Implemented ApiManagementService for API key and webhook management
  - ✅ Added TypeScript interfaces for all API resources
✅ Built visualization components:
  - ✅ Implemented PipelinePerformanceChart with multiple visualization options
  - ✅ Created TeamPerformanceChart with bar and pie chart views
  - ✅ Added data filtering capabilities for all charts
  - ✅ Implemented responsive design for all visualizations
✅ Created report management UI:
  - ✅ Developed ReportBuilder component for creating custom reports
  - ✅ Implemented ReportsPage with comprehensive filtering and viewing options
  - ✅ Added report export functionality with CSV support
  - ✅ Implemented print functionality for reports
✅ Built API management interface:
  - ✅ Created ApiManagementPage for managing API keys and webhooks
  - ✅ Implemented ApiKeysList component for viewing and revoking API keys
  - ✅ Created CreateApiKeyModal for generating new API keys
  - ✅ Developed WebhooksList component for managing webhook endpoints
✅ Implemented webhook configuration UI:
  - ✅ Created WebhooksList component with CRUD operations
  - ✅ Developed CreateWebhookModal for webhook creation and editing
  - ✅ Added webhook testing functionality
  - ✅ Implemented webhook event selection interface
✅ Implemented caching mechanism:
  - ✅ Created Redis-based caching service for reports and metrics
  - ✅ Added cache invalidation when data is updated
  - ✅ Implemented TTL-based caching with automatic expiration
  - ✅ Created fallback mechanisms for when Redis is unavailable
✅ Optimized API security and performance:
  - ✅ Implemented different rate limiting strategies for various endpoints
  - ✅ Added distributed rate limiting with Redis
  - ✅ Created extended request type definitions for improved type safety
  - ✅ Implemented environment-based configuration

### Current Status:
Phase 5 is now complete. The system features comprehensive API capabilities with secure authentication methods and rate limiting for external access. The webhook system enables real-time integration with external applications, complete with a user-friendly configuration interface. Report generation is optimized with Redis caching for improved performance, and the UI provides rich visualization options for data analysis.

### Completed Next Steps:
1. Preparation for deployment:
   - ✅ Set up production environment with proper secrets management
   - ✅ Configure monitoring and logging for production use with Sentry integration
   - ✅ Create comprehensive documentation for API consumers

2. Enhanced existing features:
   - ✅ Added scheduled reports with email delivery using Bull queues
   - ✅ Implemented proper email formatting for reports with HTML and CSV attachments
   - ✅ Added secure environment configuration with environment-specific variables

3. Enhance existing features:
   - ✅ Implement comparative analysis for performance over time
   - ✅ Create a more detailed API documentation interface
   - ✅ Add bulk operations for data management
   - ✅ Update the nreadme.md file to reflect the current status of the project

## Technical Requirements Fulfilled:
- ✅ Database schema extended with new models for API keys, webhooks, and reports
- ✅ Core services implemented with proper error handling
- ✅ Metrics calculation engines developed with caching support
- ✅ Controllers with comprehensive validation
- ✅ API routes with appropriate authentication and authorization
- ✅ Rate limiting with Redis for distributed deployment
- ✅ API documentation endpoint
- ✅ Frontend services for API operations
- ✅ Data visualization components with interactive features
- ✅ Report management UI with filtering and export capabilities
- ✅ API key and webhook management interfaces with security features
- ✅ Comparative analysis for performance over time:
  - ✅ Created ComparativeAnalysisChart component for visualizing period-over-period metrics
  - ✅ Implemented time frame selection with week/month/quarter options
  - ✅ Added performance change calculation and visualization
  - ✅ Integrated with existing reporting functionality
- ✅ Enhanced API documentation interface:
  - ✅ Created comprehensive interactive API documentation component
  - ✅ Added detailed endpoint information with request/response examples
  - ✅ Implemented tabbed interface for better organization
  - ✅ Added code snippets with copy functionality
- ✅ Bulk operations for data management:
  - ✅ Implemented BulkOperationsModal component for lead management
  - ✅ Added backend service for processing bulk updates
  - ✅ Created API endpoint for bulk operations
  - ✅ Implemented proper validation and error handling
- ✅ Installed and configured required packages:
  - ✅ socket.io and socket.io-client for real-time communication
  - ✅ bull for message queue processing
  - ✅ multer for file upload handling
  - ✅ aws-sdk for S3 integration
  - ✅ emoji-picker-react for emoji support
  - ✅ react-dropzone for file uploads
  - ✅ nodemailer for email delivery of reports
  - ✅ sentry for error tracking and monitoring
  - ✅ recharts for data visualization and comparison charts
- ✅ Production environment configuration:
  - ✅ Environment-specific configurations (.env.production)
  - ✅ Secure secrets management with placeholders for sensitive data
  - ✅ Logging and monitoring infrastructure
  - ✅ Graceful application shutdown handling

## Project Status Summary:
The CRM system now includes all core features specified in the original roadmap along with the enhancements requested in Phase 5. The system provides a comprehensive solution for managing customer relationships, pipeline tracking, and team performance analysis with the following highlights:

1. **Complete Pipeline Management**: Kanban-style interface for visualizing and managing leads through the sales process.

2. **Team Management**: Comprehensive team creation, member management, and performance tracking.

3. **WhatsApp Integration**: Full integration with WhatsApp for customer communication with real-time messaging.

4. **Reports and Analytics**: Rich visualization of performance metrics with comparative analysis capabilities.

5. **Public API**: Well-documented API for third-party integration with proper authentication and rate limiting.

6. **Webhooks**: Real-time event notification system for integration with external systems.

The recent enhancements have significantly improved the system's capabilities:

- **Comparative Analysis**: Users can now analyze performance trends over time, comparing current periods with previous ones for better decision-making.

- **Enhanced API Documentation**: Detailed, interactive API documentation makes it easier for developers to integrate with the system.

- **Bulk Operations**: Operations that previously required manual work on each lead can now be performed in batch, saving time for sales teams.

The system is now production-ready with proper environment configurations, monitoring, and error handling.