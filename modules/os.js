class OSModule {
    static osAtual = {
        id: null,
        numero: null,
        cliente_id: null,
        veiculo_id: null,
        itens: [],
        valor_total: 0
    };

    static showListaOS() {
        const content = document.getElementById('module-content');
        const ordens = db.getAllOS();
        
        content.innerHTML = `
            <div class="module-header">
                <h2><i class="fas fa-file-alt"></i> Ordens de Serviço</h2>
                <div>
                    <button class="btn-secondary" onclick="OSModule.filtrarOS()">
                        <i class="fas fa-filter"></i> Filtrar
                    </button>
                    <button class="btn-primary" onclick="OSModule.showNovaOS()">
                        <i class="fas fa-plus"></i> Nova OS
                    </button>
                </div>
            </div>
            
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Número</th>
                            <th>Cliente</th>
                            <th>Data</th>
                            <th>Valor</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ordens.map(os => `
                            <tr>
                                <td>${os.numero}</td>
                                <td>${os.cliente_nome}</td>
                                <td>${app.formatDate(os.data_emissao)}</td>
                                <td>${app.formatCurrency(os.valor_total || 0)}</td>
                                <td>
                                    <span class="status-badge ${os.status}">
                                        ${os.status}
                                    </span>
                                </td>
                                <td class="table-actions">
                                    <button class="btn-icon" onclick="OSModule.abrirOS(${os.id})" title="Abrir">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn-icon" onclick="OSModule.editarOS(${os.id})" title="Editar">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon" onclick="OSModule.gerarPDFOS(${os.id})" title="PDF">
                                        <i class="fas fa-file-pdf"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    static showNovaOS() {
        this.osAtual = {
            id: null,
            numero: this.gerarNumeroOS(),
            cliente_id: null,
            veiculo_id: null,
            itens: [],
            valor_total: 0
        };

        const content = document.getElementById('module-content');
        content.innerHTML = `
            <div class="os-container">
                <div class="os-header">
                    <div>
                        <h2><i class="fas fa-file-alt"></i> Nova Ordem de Serviço</h2>
                        <p>OS Nº: <strong>${this.osAtual.numero}</strong> | 
                           Data: <strong>${new Date().toLocaleDateString('pt-BR')}</strong></p>
                    </div>
                    <div>
                        <button class="btn-secondary" onclick="OSModule.selecionarCliente()">
                            <i class="fas fa-user"></i> Selecionar Cliente
                        </button>
                        <button class="btn-secondary" onclick="OSModule.selecionarVeiculo()">
                            <i class="fas fa-car"></i> Selecionar Veículo
                        </button>
                    </div>
                </div>

                <div class="os-info-card">
                    <h3>Dados do Cliente e Veículo</h3>
                    <div id="os-cliente-info">
                        <p class="placeholder-text">Nenhum cliente selecionado</p>
                    </div>
                    <div id="os-veiculo-info">
                        <p class="placeholder-text">Nenhum veículo selecionado</p>
                    </div>
                </div>

                <div class="os-info-card">
                    <h3>Serviço Solicitado</h3>
                    <div class="form-group">
                        <textarea id="os-servico" class="form-control" rows="3" 
                                  placeholder="Descreva o serviço solicitado..."></textarea>
                    </div>
                </div>

                <div class="os-info-card">
                    <h3>Itens da OS</h3>
                    <div class="os-item-row">
                        <input type="text" id="item-descricao" class="form-control" placeholder="Descrição do item">
                        <input type="number" id="item-quantidade" class="form-control" placeholder="Qtd" step="0.01" min="0">
                        <input type="number" id="item-valor" class="form-control" placeholder="Valor Unit." step="0.01" min="0">
                        <button class="btn-primary" onclick="OSModule.adicionarItem()">
                            <i class="fas fa-plus"></i> Adicionar
                        </button>
                    </div>
                    
                    <div class="table-container" style="margin-top: 1rem;">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Descrição</th>
                                    <th>Quantidade</th>
                                    <th>Valor Unit.</th>
                                    <th>Valor Total</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="os-itens-list">
                                <!-- Itens serão adicionados aqui -->
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="os-total">
                        <span>Total:</span>
                        <span id="os-total-valor">R$ 0,00</span>
                    </div>
                </div>

                <div class="os-info-card">
                    <h3>Observações</h3>
                    <div class="form-group">
                        <textarea id="os-observacoes" class="form-control" rows="3" 
                                  placeholder="Observações adicionais..."></textarea>
                    </div>
                </div>

                <div class="form-row" style="margin-top: 2rem; gap: 1rem;">
                    <button class="btn-primary" onclick="OSModule.salvarOS()">
                        <i class="fas fa-save"></i> Salvar OS
                    </button>
                    <button class="btn-secondary" onclick="OSModule.limparOS()">
                        <i class="fas fa-broom"></i> Limpar
                    </button>
                    <button class="btn-success" onclick="OSModule.gerarPDF()">
                        <i class="fas fa-file-pdf"></i> Gerar PDF
                    </button>
                    <button class="btn-danger" onclick="OSModule.fecharOS()">
                        <i class="fas fa-lock"></i> Fechar OS
                    </button>
                </div>
            </div>
        `;
        
        this.atualizarListaItens();
    }

    static gerarNumeroOS() {
        const now = new Date();
        return now.getFullYear().toString() + 
               (now.getMonth() + 1).toString().padStart(2, '0') +
               now.getDate().toString().padStart(2, '0') +
               now.getHours().toString().padStart(2, '0') +
               now.getMinutes().toString().padStart(2, '0');
    }

    static selecionarCliente() {
        const clientes = db.getAll('clientes');
        
        const content = `
            <div class="form-group">
                <input type="text" id="cliente-search" class="form-control" 
                       placeholder="Pesquisar cliente..." 
                       onkeyup="OSModule.filtrarClientesLista(this.value)">
            </div>
            
            <div class="table-container" style="max-height: 400px; overflow-y: auto;">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>CPF/CNPJ</th>
                            <th>Telefone</th>
                            <th>Ação</th>
                        </tr>
                    </thead>
                    <tbody id="clientes-lista">
                        ${clientes.map(cliente => `
                            <tr>
                                <td>${cliente.nome}</td>
                                <td>${cliente.cnpj}</td>
                                <td>${cliente.telefone}</td>
                                <td>
                                    <button class="btn-secondary" onclick="OSModule.setCliente(${cliente.id})">
                                        Selecionar
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        app.showModal('Selecionar Cliente', content, [
            {
                text: 'Cancelar',
                class: 'btn-secondary',
                onclick: 'app.hideModal()'
            }
        ]);
    }

    static setCliente(clienteId) {
        const cliente = db.getById('clientes', clienteId);
        if (!cliente) return;
        
        this.osAtual.cliente_id = clienteId;
        
        const clienteInfo = document.getElementById('os-cliente-info');
        clienteInfo.innerHTML = `
            <div class="cliente-info">
                <strong>${cliente.nome}</strong><br>
                CPF/CNPJ: ${cliente.cnpj}<br>
                Telefone: ${cliente.telefone}<br>
                Endereço: ${cliente.endereco}, ${cliente.cidade}
            </div>
        `;
        
        app.hideModal();
        app.showToast('Cliente selecionado com sucesso!', 'success');
    }

    static selecionarVeiculo() {
        if (!this.osAtual.cliente_id) {
            app.showToast('Selecione um cliente primeiro!', 'error');
            return;
        }
        
        const veiculos = db.getAll('veiculos');
        
        const content = `
            <div class="form-group">
                <input type="text" id="veiculo-search" class="form-control" 
                       placeholder="Pesquisar veículo..." 
                       onkeyup="OSModule.filtrarVeiculosLista(this.value)">
            </div>
            
            <div class="table-container" style="max-height: 400px; overflow-y: auto;">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Placa</th>
                            <th>Modelo</th>
                            <th>Responsável</th>
                            <th>Ação</th>
                        </tr>
                    </thead>
                    <tbody id="veiculos-lista">
                        ${veiculos.map(veiculo => `
                            <tr>
                                <td>${veiculo.placa}</td>
                                <td>${veiculo.modelo}</td>
                                <td>${veiculo.resp_veiculo}</td>
                                <td>
                                    <button class="btn-secondary" onclick="OSModule.setVeiculo(${veiculo.id})">
                                        Selecionar
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        app.showModal('Selecionar Veículo', content, [
            {
                text: 'Cancelar',
                class: 'btn-secondary',
                onclick: 'app.hideModal()'
            }
        ]);
    }

    static setVeiculo(veiculoId) {
        const veiculo = db.getById('veiculos', veiculoId);
        if (!veiculo) return;
        
        this.osAtual.veiculo_id = veiculoId;
        
        const veiculoInfo = document.getElementById('os-veiculo-info');
        veiculoInfo.innerHTML = `
            <div class="veiculo-info">
                <strong>${veiculo.modelo}</strong><br>
                Placa: ${veiculo.placa}<br>
                Ano: ${veiculo.ano} | KM: ${veiculo.km}<br>
                Responsável: ${veiculo.resp_veiculo}
            </div>
        `;
        
        app.hideModal();
        app.showToast('Veículo selecionado com sucesso!', 'success');
    }

    static adicionarItem() {
        const descricao = document.getElementById('item-descricao').value;
        const quantidade = parseFloat(document.getElementById('item-quantidade').value);
        const valor = parseFloat(document.getElementById('item-valor').value);
        
        if (!descricao || !quantidade || !valor) {
            app.showToast('Preencha todos os campos do item!', 'error');
            return;
        }
        
        const item = {
            descricao,
            quantidade,
            valor_unitario: valor,
            valor_total: quantidade * valor
        };
        
        this.osAtual.itens.push(item);
        
        // Limpar campos
        document.getElementById('item-descricao').value = '';
        document.getElementById('item-quantidade').value = '';
        document.getElementById('item-valor').value = '';
        
        this.atualizarListaItens();
        this.calcularTotal();
    }

    static removerItem(index) {
        this.osAtual.itens.splice(index, 1);
        this.atualizarListaItens();
        this.calcularTotal();
    }

    static atualizarListaItens() {
        const tbody = document.getElementById('os-itens-list');
        if (!tbody) return;
        
        tbody.innerHTML = this.osAtual.itens.map((item, index) => `
            <tr>
                <td>${item.descricao}</td>
                <td>${item.quantidade}</td>
                <td>${app.formatCurrency(item.valor_unitario)}</td>
                <td>${app.formatCurrency(item.valor_total)}</td>
                <td>
                    <button class="btn-icon" onclick="OSModule.removerItem(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    static calcularTotal() {
        const total = this.osAtual.itens.reduce((sum, item) => sum + item.valor_total, 0);
        this.osAtual.valor_total = total;
        
        const totalElement = document.getElementById('os-total-valor');
        if (totalElement) {
            totalElement.textContent = app.formatCurrency(total);
        }
    }

    static salvarOS() {
        if (!this.osAtual.cliente_id) {
            app.showToast('Selecione um cliente!', 'error');
            return;
        }
        
        if (this.osAtual.itens.length === 0) {
            app.showToast('Adicione pelo menos um item!', 'error');
            return;
        }
        
        const osData = {
            numero: this.osAtual.numero,
            cliente_id: this.osAtual.cliente_id,
            veiculo_id: this.osAtual.veiculo_id,
            data_emissao: new Date().toISOString(),
            servico_solicitado: document.getElementById('os-servico').value,
            observacoes: document.getElementById('os-observacoes').value,
            valor_total: this.osAtual.valor_total,
            status: 'Aberta'
        };
        
        // Salvar OS
        const savedOS = db.save('ordens_servico', osData);
        
        // Salvar itens
        this.osAtual.itens.forEach(item => {
            item.os_id = savedOS.id;
            db.save('itens_os', item);
        });
        
        app.showToast('Ordem de Serviço salva com sucesso!', 'success');
        this.showListaOS();
    }

    static abrirOS(osId) {
        const osCompleta = db.getOSComCliente(osId);
        if (!osCompleta) return;
        
        this.osAtual = {
            id: osCompleta.id,
            numero: osCompleta.numero,
            cliente_id: osCompleta.cliente_id,
            veiculo_id: osCompleta.veiculo_id,
            itens: osCompleta.itens,
            valor_total: osCompleta.valor_total
        };
        
        const content = document.getElementById('module-content');
        content.innerHTML = `
            <div class="os-container">
                <div class="os-header">
                    <div>
                        <h2><i class="fas fa-file-alt"></i> OS Nº ${osCompleta.numero}</h2>
                        <p>Data: <strong>${app.formatDate(osCompleta.data_emissao)}</strong> | 
                           Status: <strong>${osCompleta.status}</strong></p>
                    </div>
                    <div>
                        <button class="btn-primary" onclick="OSModule.gerarPDF()">
                            <i class="fas fa-file-pdf"></i> Gerar PDF
                        </button>
                        ${osCompleta.status === 'Aberta' ? `
                            <button class="btn-danger" onclick="OSModule.fecharOS()">
                                <i class="fas fa-lock"></i> Fechar OS
                            </button>
                        ` : ''}
                    </div>
                </div>

                <div class="os-info-card">
                    <h3>Dados do Cliente</h3>
                    <div class="cliente-info">
                        <strong>${osCompleta.cliente.nome}</strong><br>
                        CPF/CNPJ: ${osCompleta.cliente.cnpj}<br>
                        Telefone: ${osCompleta.cliente.telefone}<br>
                        Endereço: ${osCompleta.cliente.endereco}, ${osCompleta.cliente.cidade}
                    </div>
                </div>

                ${osCompleta.veiculo ? `
                <div class="os-info-card">
                    <h3>Dados do Veículo</h3>
                    <div class="veiculo-info">
                        <strong>${osCompleta.veiculo.modelo}</strong><br>
                        Placa: ${osCompleta.veiculo.placa}<br>
                        Ano: ${osCompleta.veiculo.ano} | KM: ${osCompleta.veiculo.km}<br>
                        Responsável: ${osCompleta.veiculo.resp_veiculo}
                    </div>
                </div>
                ` : ''}

                ${osCompleta.servico_solicitado ? `
                <div class="os-info-card">
                    <h3>Serviço Solicitado</h3>
                    <p>${osCompleta.servico_solicitado}</p>
                </div>
                ` : ''}

                <div class="os-info-card">
                    <h3>Itens da OS</h3>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Descrição</th>
                                    <th>Quantidade</th>
                                    <th>Valor Unit.</th>
                                    <th>Valor Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${osCompleta.itens.map(item => `
                                    <tr>
                                        <td>${item.descricao}</td>
                                        <td>${item.quantidade}</td>
                                        <td>${app.formatCurrency(item.valor_unitario)}</td>
                                        <td>${app.formatCurrency(item.valor_total)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="os-total">
                        <span>Total:</span>
                        <span>${app.formatCurrency(osCompleta.valor_total)}</span>
                    </div>
                </div>

                ${osCompleta.observacoes ? `
                <div class="os-info-card">
                    <h3>Observações</h3>
                    <p>${osCompleta.observacoes}</p>
                </div>
                ` : ''}
            </div>
        `;
    }

    static editarOS(osId) {
        // Similar ao abrirOS, mas permite edição
        this.abrirOS(osId);
    }

    static gerarPDF() {
        const osCompleta = db.getOSComCliente(this.osAtual.id || 0);
        if (!osCompleta) {
            app.showToast('OS não encontrada para gerar PDF', 'error');
            return;
        }
        
        // Usar PDFGenerator.js para gerar o PDF
        PDFGenerator.gerarOSPDF(osCompleta);
        app.showToast('PDF gerado com sucesso!', 'success');
    }

    static fecharOS() {
        if (!this.osAtual.id) return;
        
        if (confirm('Deseja realmente fechar esta OS?')) {
            const os = db.getById('ordens_servico', this.osAtual.id);
            if (os) {
                os.status = 'Fechada';
                db.save('ordens_servico', os);
                app.showToast('OS fechada com sucesso!', 'success');
                this.showListaOS();
            }
        }
    }

    static limparOS() {
        if (confirm('Deseja limpar todos os dados da OS?')) {
            this.showNovaOS();
        }
    }

    static filtrarOS() {
        const content = `
            <div class="form-row">
                <div class="form-group">
                    <label>Data Inicial</label>
                    <input type="date" id="filtro-data-inicio" class="form-control" 
                           value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <label>Data Final</label>
                    <input type="date" id="filtro-data-fim" class="form-control" 
                           value="${new Date().toISOString().split('T')[0]}">
                </div>
            </div>
            
            <div class="form-group">
                <label>Status</label>
                <select id="filtro-status" class="form-control">
                    <option value="">Todos</option>
                    <option value="Aberta">Aberta</option>
                    <option value="Fechada">Fechada</option>
                </select>
            </div>
        `;
        
        app.showModal('Filtrar OS', content, [
            {
                text: 'Cancelar',
                class: 'btn-secondary',
                onclick: 'app.hideModal()'
            },
            {
                text: 'Aplicar Filtro',
                class: 'btn-primary',
                onclick: 'OSModule.aplicarFiltro()'
            }
        ]);
    }

    static aplicarFiltro() {
        // Implementar lógica de filtro
        app.hideModal();
    }
}