class PlatypusApp {
    constructor() {
        this.currentModule = 'dashboard';
        this.init();
    }

    init() {
        this.updateDate();
        this.loadStats();
        this.loadRecentActivity();
        this.setupEventListeners();
        this.setupModal();
    }

    updateDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('current-date').textContent = 
            now.toLocaleDateString('pt-BR', options);
    }

    loadStats() {
        document.getElementById('os-count').textContent = 
            db.getAll('ordens_servico').length;
        document.getElementById('clientes-count').textContent = 
            db.getAll('clientes').length;
        document.getElementById('veiculos-count').textContent = 
            db.getAll('veiculos').length;
        document.getElementById('pecas-count').textContent = 
            db.getAll('pecas').length;
    }

    loadRecentActivity() {
        const recentList = document.getElementById('recent-list');
        const ordens = db.getAll('ordens_servico').slice(-5).reverse();
        
        recentList.innerHTML = ordens.map(os => `
            <div class="activity-item">
                <strong>OS ${os.numero}</strong> - ${os.status}
                <small>${new Date(os.data_emissao).toLocaleDateString('pt-BR')}</small>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Menu lateral
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                const module = e.currentTarget.dataset.module;
                this.loadModule(module);
            });
        });

        // Botões de ação rápida
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const module = e.currentTarget.dataset.module;
                const action = e.currentTarget.dataset.action;
                this.loadModule(module, action);
            });
        });

        // Fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
            }
        });
    }

    setupModal() {
        const modal = document.getElementById('modal');
        const closeBtn = document.getElementById('modal-close');
        
        closeBtn.addEventListener('click', () => this.hideModal());
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal();
            }
        });
    }

    showModal(title, content, buttons = []) {
        const modal = document.getElementById('modal');
        const titleEl = document.getElementById('modal-title');
        const bodyEl = document.getElementById('modal-body');
        const footerEl = document.getElementById('modal-footer');
        
        titleEl.textContent = title;
        bodyEl.innerHTML = content;
        
        footerEl.innerHTML = buttons.map(btn => 
            `<button class="${btn.class}" onclick="${btn.onclick}">${btn.text}</button>`
        ).join('');
        
        modal.classList.add('show');
    }

    hideModal() {
        document.getElementById('modal').classList.remove('show');
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    loadModule(module, action = null) {
        this.currentModule = module;
        
        switch(module) {
            case 'dashboard':
                this.showDashboard();
                break;
            case 'os':
                this.showOSModule(action);
                break;
            case 'clientes':
                this.showClientesModule(action);
                break;
            case 'veiculos':
                this.showVeiculosModule(action);
                break;
            case 'pecas':
                this.showPecasModule(action);
                break;
            case 'estoque':
                this.showEstoqueModule();
                break;
            case 'financeiro':
                this.showFinanceiroModule();
                break;
            case 'notas':
                this.showNotasModule();
                break;
            default:
                this.showDashboard();
        }
    }

    showDashboard() {
        const content = document.getElementById('module-content');
        content.innerHTML = `
            <div class="welcome-screen">
                <div class="welcome-card">
                    <h2><i class="fas fa-tools"></i> Bem-vindo ao Platypus v2</h2>
                    <p>Sistema completo para gestão de oficina mecânica</p>
                    
                    <div class="quick-stats">
                        <div class="stat-card">
                            <i class="fas fa-file-alt"></i>
                            <h3 id="os-count">0</h3>
                            <p>Ordens de Serviço</p>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-users"></i>
                            <h3 id="clientes-count">0</h3>
                            <p>Clientes</p>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-car"></i>
                            <h3 id="veiculos-count">0</h3>
                            <p>Veículos</p>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-boxes"></i>
                            <h3 id="pecas-count">0</h3>
                            <p>Peças em Estoque</p>
                        </div>
                    </div>

                    <div class="quick-actions">
                        <h3>Ações Rápidas</h3>
                        <div class="action-buttons">
                            <button class="btn-primary" data-module="os" data-action="nova">
                                <i class="fas fa-plus"></i> Nova OS
                            </button>
                            <button class="btn-secondary" data-module="clientes" data-action="novo">
                                <i class="fas fa-user-plus"></i> Novo Cliente
                            </button>
                            <button class="btn-secondary" data-module="veiculos" data-action="novo">
                                <i class="fas fa-car-side"></i> Novo Veículo
                            </button>
                            <button class="btn-secondary" data-module="pecas" data-action="nova">
                                <i class="fas fa-cog"></i> Nova Peça
                            </button>
                        </div>
                    </div>

                    <div class="recent-activity">
                        <h3>Atividade Recente</h3>
                        <div id="recent-list" class="activity-list"></div>
                    </div>
                </div>
            </div>
        `;
        
        this.loadStats();
        this.loadRecentActivity();
        
        // Reatachar event listeners
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const module = e.currentTarget.dataset.module;
                const action = e.currentTarget.dataset.action;
                this.loadModule(module, action);
            });
        });
    }

    showOSModule(action) {
        if (action === 'nova') {
            OSModule.showNovaOS();
        } else {
            OSModule.showListaOS();
        }
    }

    showClientesModule(action) {
        if (action === 'novo') {
            ClientesModule.showNovoCliente();
        } else {
            ClientesModule.showListaClientes();
        }
    }

    showVeiculosModule(action) {
        if (action === 'novo') {
            VeiculosModule.showNovoVeiculo();
        } else {
            VeiculosModule.showListaVeiculos();
        }
    }

    showPecasModule(action) {
        if (action === 'nova') {
            PecasModule.showNovaPeca();
        } else {
            PecasModule.showListaPecas();
        }
    }

    showEstoqueModule() {
        PecasModule.showEstoque();
    }

    showFinanceiroModule() {
        FinanceiroModule.showListaFinanceiro();
    }

    showNotasModule() {
        NFSEModule.showNotas();
    }

    // Utilitários
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR');
    }
}

// Módulo de Clientes
class ClientesModule {
    static showListaClientes() {
        const content = document.getElementById('module-content');
        const clientes = db.getAll('clientes');
        
        content.innerHTML = `
            <div class="module-header">
                <h2><i class="fas fa-users"></i> Clientes</h2>
                <div>
                    <button class="btn-secondary" onclick="ClientesModule.showPesquisa()">
                        <i class="fas fa-search"></i> Pesquisar
                    </button>
                    <button class="btn-primary" onclick="ClientesModule.showNovoCliente()">
                        <i class="fas fa-plus"></i> Novo Cliente
                    </button>
                </div>
            </div>
            
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome/Razão Social</th>
                            <th>CPF/CNPJ</th>
                            <th>Telefone</th>
                            <th>Cidade</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="clientes-list">
                        ${clientes.map(cliente => `
                            <tr>
                                <td>${cliente.id}</td>
                                <td>${cliente.nome}</td>
                                <td>${cliente.cnpj}</td>
                                <td>${cliente.telefone}</td>
                                <td>${cliente.cidade}</td>
                                <td class="table-actions">
                                    <button class="btn-icon" onclick="ClientesModule.editarCliente(${cliente.id})" title="Editar">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon" onclick="ClientesModule.excluirCliente(${cliente.id})" title="Excluir">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                    <button class="btn-icon" onclick="ClientesModule.selecionarCliente(${cliente.id})" title="Selecionar">
                                        <i class="fas fa-check"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    static showNovoCliente() {
        const content = `
            <div class="form-row">
                <div class="form-group">
                    <label>CPF/CNPJ</label>
                    <input type="text" id="cliente-cnpj" class="form-control" placeholder="00.000.000/0000-00">
                </div>
                <div class="form-group">
                    <label>Nome/Razão Social *</label>
                    <input type="text" id="cliente-nome" class="form-control" required>
                </div>
            </div>
            
            <div class="form-group">
                <label>Endereço</label>
                <input type="text" id="cliente-endereco" class="form-control">
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Cidade/UF</label>
                    <input type="text" id="cliente-cidade" class="form-control">
                </div>
                <div class="form-group">
                    <label>Telefone</label>
                    <input type="text" id="cliente-telefone" class="form-control" placeholder="(51) 99999-9999">
                </div>
            </div>
            
            <div class="form-group">
                <label>E-mail</label>
                <input type="email" id="cliente-email" class="form-control">
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Responsável</label>
                    <input type="text" id="cliente-responsavel" class="form-control">
                </div>
                <div class="form-group">
                    <label>CPF Responsável</label>
                    <input type="text" id="cliente-cpf-resp" class="form-control">
                </div>
            </div>
            
            <div class="form-group">
                <label>Data de Nascimento</label>
                <input type="date" id="cliente-dt-nascimento" class="form-control">
            </div>
        `;
        
        app.showModal('Novo Cliente', content, [
            {
                text: 'Cancelar',
                class: 'btn-secondary',
                onclick: 'app.hideModal()'
            },
            {
                text: 'Salvar',
                class: 'btn-primary',
                onclick: 'ClientesModule.salvarCliente()'
            }
        ]);
    }

    static salvarCliente() {
        const cliente = {
            cnpj: document.getElementById('cliente-cnpj').value,
            nome: document.getElementById('cliente-nome').value,
            endereco: document.getElementById('cliente-endereco').value,
            cidade: document.getElementById('cliente-cidade').value,
            telefone: document.getElementById('cliente-telefone').value,
            email: document.getElementById('cliente-email').value,
            responsavel: document.getElementById('cliente-responsavel').value,
            cpf_responsavel: document.getElementById('cliente-cpf-resp').value,
            dt_nascimento: document.getElementById('cliente-dt-nascimento').value
        };
        
        if (!cliente.nome) {
            app.showToast('O campo nome é obrigatório!', 'error');
            return;
        }
        
        db.save('clientes', cliente);
        app.showToast('Cliente salvo com sucesso!', 'success');
        app.hideModal();
        ClientesModule.showListaClientes();
    }

    static editarCliente(id) {
        const cliente = db.getById('clientes', id);
        if (!cliente) return;
        
        const content = `
            <div class="form-row">
                <div class="form-group">
                    <label>CPF/CNPJ</label>
                    <input type="text" id="cliente-cnpj" class="form-control" value="${cliente.cnpj || ''}">
                </div>
                <div class="form-group">
                    <label>Nome/Razão Social *</label>
                    <input type="text" id="cliente-nome" class="form-control" value="${cliente.nome}" required>
                </div>
            </div>
            
            <div class="form-group">
                <label>Endereço</label>
                <input type="text" id="cliente-endereco" class="form-control" value="${cliente.endereco || ''}">
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Cidade/UF</label>
                    <input type="text" id="cliente-cidade" class="form-control" value="${cliente.cidade || ''}">
                </div>
                <div class="form-group">
                    <label>Telefone</label>
                    <input type="text" id="cliente-telefone" class="form-control" value="${cliente.telefone || ''}">
                </div>
            </div>
            
            <div class="form-group">
                <label>E-mail</label>
                <input type="email" id="cliente-email" class="form-control" value="${cliente.email || ''}">
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Responsável</label>
                    <input type="text" id="cliente-responsavel" class="form-control" value="${cliente.responsavel || ''}">
                </div>
                <div class="form-group">
                    <label>CPF Responsável</label>
                    <input type="text" id="cliente-cpf-resp" class="form-control" value="${cliente.cpf_responsavel || ''}">
                </div>
            </div>
            
            <div class="form-group">
                <label>Data de Nascimento</label>
                <input type="date" id="cliente-dt-nascimento" class="form-control" value="${cliente.dt_nascimento || ''}">
            </div>
            
            <input type="hidden" id="cliente-id" value="${cliente.id}">
        `;
        
        app.showModal('Editar Cliente', content, [
            {
                text: 'Cancelar',
                class: 'btn-secondary',
                onclick: 'app.hideModal()'
            },
            {
                text: 'Salvar Alterações',
                class: 'btn-primary',
                onclick: 'ClientesModule.atualizarCliente()'
            }
        ]);
    }

    static atualizarCliente() {
        const cliente = {
            id: parseInt(document.getElementById('cliente-id').value),
            cnpj: document.getElementById('cliente-cnpj').value,
            nome: document.getElementById('cliente-nome').value,
            endereco: document.getElementById('cliente-endereco').value,
            cidade: document.getElementById('cliente-cidade').value,
            telefone: document.getElementById('cliente-telefone').value,
            email: document.getElementById('cliente-email').value,
            responsavel: document.getElementById('cliente-responsavel').value,
            cpf_responsavel: document.getElementById('cliente-cpf-resp').value,
            dt_nascimento: document.getElementById('cliente-dt-nascimento').value
        };
        
        db.save('clientes', cliente);
        app.showToast('Cliente atualizado com sucesso!', 'success');
        app.hideModal();
        ClientesModule.showListaClientes();
    }

    static excluirCliente(id) {
        if (confirm('Tem certeza que deseja excluir este cliente?')) {
            // Verificar se existem OS vinculadas
            const ordens = db.getAll('ordens_servico');
            const temOS = ordens.some(os => os.cliente_id === id);
            
            if (temOS) {
                app.showToast('Este cliente possui ordens de serviço vinculadas!', 'error');
                return;
            }
            
            db.delete('clientes', id);
            app.showToast('Cliente excluído com sucesso!', 'success');
            ClientesModule.showListaClientes();
        }
    }

    static selecionarCliente(id) {
        const cliente = db.getById('clientes', id);
        // Implementar lógica de seleção para OS
        app.showToast(`Cliente ${cliente.nome} selecionado!`, 'success');
    }

    static showPesquisa() {
        const content = `
            <div class="form-group">
                <label>Termo de Pesquisa</label>
                <input type="text" id="pesquisa-termo" class="form-control" placeholder="Nome, CPF/CNPJ ou telefone">
            </div>
            
            <div id="pesquisa-resultados" class="table-container" style="max-height: 400px; overflow-y: auto; margin-top: 1rem;">
                <!-- Resultados serão carregados aqui -->
            </div>
        `;
        
        app.showModal('Pesquisar Clientes', content, [
            {
                text: 'Fechar',
                class: 'btn-secondary',
                onclick: 'app.hideModal()'
            }
        ]);
        
        // Adicionar evento de pesquisa em tempo real
        document.getElementById('pesquisa-termo').addEventListener('input', (e) => {
            const termo = e.target.value;
            const resultados = db.searchClientes(termo);
            
            const resultadosHTML = `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>CPF/CNPJ</th>
                            <th>Telefone</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${resultados.map(cliente => `
                            <tr>
                                <td>${cliente.nome}</td>
                                <td>${cliente.cnpj}</td>
                                <td>${cliente.telefone}</td>
                                <td class="table-actions">
                                    <button class="btn-icon" onclick="ClientesModule.editarCliente(${cliente.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon" onclick="ClientesModule.selecionarCliente(${cliente.id})">
                                        <i class="fas fa-check"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            
            document.getElementById('pesquisa-resultados').innerHTML = resultadosHTML;
        });
    }
}

// Módulo de Veículos
class VeiculosModule {
    static showListaVeiculos() {
        const content = document.getElementById('module-content');
        const veiculos = db.getAll('veiculos');
        
        content.innerHTML = `
            <div class="module-header">
                <h2><i class="fas fa-car"></i> Veículos</h2>
                <div>
                    <button class="btn-secondary" onclick="VeiculosModule.showPesquisa()">
                        <i class="fas fa-search"></i> Pesquisar
                    </button>
                    <button class="btn-primary" onclick="VeiculosModule.showNovoVeiculo()">
                        <i class="fas fa-plus"></i> Novo Veículo
                    </button>
                </div>
            </div>
            
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Responsável</th>
                            <th>Placa</th>
                            <th>Modelo</th>
                            <th>Ano</th>
                            <th>KM</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${veiculos.map(veiculo => `
                            <tr>
                                <td>${veiculo.id}</td>
                                <td>${veiculo.resp_veiculo}</td>
                                <td>${veiculo.placa}</td>
                                <td>${veiculo.modelo}</td>
                                <td>${veiculo.ano}</td>
                                <td>${veiculo.km}</td>
                                <td class="table-actions">
                                    <button class="btn-icon" onclick="VeiculosModule.editarVeiculo(${veiculo.id})" title="Editar">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon" onclick="VeiculosModule.excluirVeiculo(${veiculo.id})" title="Excluir">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    static showNovoVeiculo() {
        const content = `
            <div class="form-group">
                <label>Responsável *</label>
                <input type="text" id="veiculo-responsavel" class="form-control" required>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Placa *</label>
                    <input type="text" id="veiculo-placa" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>KM</label>
                    <input type="text" id="veiculo-km" class="form-control">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Ano</label>
                    <input type="text" id="veiculo-ano" class="form-control">
                </div>
                <div class="form-group">
                    <label>Modelo</label>
                    <input type="text" id="veiculo-modelo" class="form-control">
                </div>
            </div>
        `;
        
        app.showModal('Novo Veículo', content, [
            {
                text: 'Cancelar',
                class: 'btn-secondary',
                onclick: 'app.hideModal()'
            },
            {
                text: 'Salvar',
                class: 'btn-primary',
                onclick: 'VeiculosModule.salvarVeiculo()'
            }
        ]);
    }

    static salvarVeiculo() {
        const veiculo = {
            resp_veiculo: document.getElementById('veiculo-responsavel').value,
            placa: document.getElementById('veiculo-placa').value,
            km: document.getElementById('veiculo-km').value,
            ano: document.getElementById('veiculo-ano').value,
            modelo: document.getElementById('veiculo-modelo').value
        };
        
        if (!veiculo.resp_veiculo || !veiculo.placa) {
            app.showToast('Responsável e placa são obrigatórios!', 'error');
            return;
        }
        
        db.save('veiculos', veiculo);
        app.showToast('Veículo salvo com sucesso!', 'success');
        app.hideModal();
        VeiculosModule.showListaVeiculos();
    }

    static editarVeiculo(id) {
        const veiculo = db.getById('veiculos', id);
        if (!veiculo) return;
        
        const content = `
            <div class="form-group">
                <label>Responsável *</label>
                <input type="text" id="veiculo-responsavel" class="form-control" value="${veiculo.resp_veiculo}" required>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Placa *</label>
                    <input type="text" id="veiculo-placa" class="form-control" value="${veiculo.placa}" required>
                </div>
                <div class="form-group">
                    <label>KM</label>
                    <input type="text" id="veiculo-km" class="form-control" value="${veiculo.km || ''}">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Ano</label>
                    <input type="text" id="veiculo-ano" class="form-control" value="${veiculo.ano || ''}">
                </div>
                <div class="form-group">
                    <label>Modelo</label>
                    <input type="text" id="veiculo-modelo" class="form-control" value="${veiculo.modelo || ''}">
                </div>
            </div>
            
            <input type="hidden" id="veiculo-id" value="${veiculo.id}">
        `;
        
        app.showModal('Editar Veículo', content, [
            {
                text: 'Cancelar',
                class: 'btn-secondary',
                onclick: 'app.hideModal()'
            },
            {
                text: 'Salvar Alterações',
                class: 'btn-primary',
                onclick: 'VeiculosModule.atualizarVeiculo()'
            }
        ]);
    }

    static atualizarVeiculo() {
        const veiculo = {
            id: parseInt(document.getElementById('veiculo-id').value),
            resp_veiculo: document.getElementById('veiculo-responsavel').value,
            placa: document.getElementById('veiculo-placa').value,
            km: document.getElementById('veiculo-km').value,
            ano: document.getElementById('veiculo-ano').value,
            modelo: document.getElementById('veiculo-modelo').value
        };
        
        db.save('veiculos', veiculo);
        app.showToast('Veículo atualizado com sucesso!', 'success');
        app.hideModal();
        VeiculosModule.showListaVeiculos();
    }

    static excluirVeiculo(id) {
        if (confirm('Tem certeza que deseja excluir este veículo?')) {
            // Verificar se existem OS vinculadas
            const ordens = db.getAll('ordens_servico');
            const temOS = ordens.some(os => os.veiculo_id === id);
            
            if (temOS) {
                app.showToast('Este veículo possui ordens de serviço vinculadas!', 'error');
                return;
            }
            
            db.delete('veiculos', id);
            app.showToast('Veículo excluído com sucesso!', 'success');
            VeiculosModule.showListaVeiculos();
        }
    }

    static showPesquisa() {
        const content = `
            <div class="form-group">
                <label>Termo de Pesquisa</label>
                <input type="text" id="pesquisa-termo" class="form-control" placeholder="Placa, modelo ou responsável">
            </div>
            
            <div id="pesquisa-resultados" class="table-container" style="max-height: 400px; overflow-y: auto; margin-top: 1rem;"></div>
        `;
        
        app.showModal('Pesquisar Veículos', content, [
            {
                text: 'Fechar',
                class: 'btn-secondary',
                onclick: 'app.hideModal()'
            }
        ]);
        
        document.getElementById('pesquisa-termo').addEventListener('input', (e) => {
            const termo = e.target.value;
            const resultados = db.searchVeiculos(termo);
            
            const resultadosHTML = `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Placa</th>
                            <th>Modelo</th>
                            <th>Responsável</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${resultados.map(veiculo => `
                            <tr>
                                <td>${veiculo.placa}</td>
                                <td>${veiculo.modelo}</td>
                                <td>${veiculo.resp_veiculo}</td>
                                <td class="table-actions">
                                    <button class="btn-icon" onclick="VeiculosModule.editarVeiculo(${veiculo.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            
            document.getElementById('pesquisa-resultados').innerHTML = resultadosHTML;
        });
    }
}

// Inicializar a aplicação
const app = new PlatypusApp();

// Tornar funções disponíveis globalmente
window.app = app;
window.db = db;
window.ClientesModule = ClientesModule;
window.VeiculosModule = VeiculosModule;