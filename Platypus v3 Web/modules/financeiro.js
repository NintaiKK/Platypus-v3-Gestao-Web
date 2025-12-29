class FinanceiroModule {
    static showListaFinanceiro() {
        const content = document.getElementById('module-content');
        const transacoes = db.getAll('financeiro');
        
        // Calcular totais
        const totalEntradas = transacoes
            .filter(t => t.tipo === 'Entrada')
            .reduce((sum, t) => sum + (parseFloat(t.vlr) || 0), 0);
        
        const totalSaidas = transacoes
            .filter(t => t.tipo === 'Saída')
            .reduce((sum, t) => sum + (parseFloat(t.vlr) || 0), 0);
        
        const saldo = totalEntradas - totalSaidas;
        
        content.innerHTML = `
            <div class="module-header">
                <h2><i class="fas fa-money-bill-wave"></i> Financeiro</h2>
                <div class="financeiro-resumo">
                    <div class="resumo-card success">
                        <i class="fas fa-arrow-down"></i>
                        <div>
                            <h3>${app.formatCurrency(totalEntradas)}</h3>
                            <p>Total Entradas</p>
                        </div>
                    </div>
                    <div class="resumo-card danger">
                        <i class="fas fa-arrow-up"></i>
                        <div>
                            <h3>${app.formatCurrency(totalSaidas)}</h3>
                            <p>Total Saídas</p>
                        </div>
                    </div>
                    <div class="resumo-card ${saldo >= 0 ? 'primary' : 'danger'}">
                        <i class="fas fa-balance-scale"></i>
                        <div>
                            <h3>${app.formatCurrency(saldo)}</h3>
                            <p>Saldo</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <button class="btn-secondary" onclick="FinanceiroModule.showPesquisa()">
                    <i class="fas fa-search"></i> Pesquisar
                </button>
                <button class="btn-primary" onclick="FinanceiroModule.showNovaTransacao()">
                    <i class="fas fa-plus"></i> Nova Transação
                </button>
                <button class="btn-secondary" onclick="FinanceiroModule.gerarRelatorio()">
                    <i class="fas fa-chart-bar"></i> Relatório
                </button>
            </div>
            
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Tipo</th>
                            <th>Descrição</th>
                            <th>Fonte</th>
                            <th>Forma Pgto</th>
                            <th>Valor</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transacoes.map(transacao => `
                            <tr class="${transacao.tipo === 'Entrada' ? 'table-success' : 'table-danger'}">
                                <td>${app.formatDate(transacao.data)}</td>
                                <td>
                                    <span class="badge ${transacao.tipo === 'Entrada' ? 'badge-success' : 'badge-danger'}">
                                        ${transacao.tipo}
                                    </span>
                                </td>
                                <td>${transacao.descr}</td>
                                <td>${transacao.fonte}</td>
                                <td>${transacao.forma_pgto}</td>
                                <td>${app.formatCurrency(transacao.vlr || 0)}</td>
                                <td class="table-actions">
                                    <button class="btn-icon" onclick="FinanceiroModule.editarTransacao(${transacao.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon" onclick="FinanceiroModule.excluirTransacao(${transacao.id})">
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

    static showNovaTransacao() {
        const content = `
            <div class="form-group">
                <label>Data *</label>
                <input type="date" id="transacao-data" class="form-control" 
                       value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            
            <div class="form-group">
                <label>Tipo *</label>
                <select id="transacao-tipo" class="form-control" required>
                    <option value="">Selecione...</option>
                    <option value="Entrada">Entrada</option>
                    <option value="Saída">Saída</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Descrição</label>
                <input type="text" id="transacao-descr" class="form-control">
            </div>
            
            <div class="form-group">
                <label>Fonte *</label>
                <input type="text" id="transacao-fonte" class="form-control" required>
            </div>
            
            <div class="form-group">
                <label>Forma de Pagamento</label>
                <select id="transacao-forma-pgto" class="form-control">
                    <option value="">Selecione...</option>
                    <option value="Pix">Pix</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão">Cartão</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Transferência">Transferência</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Valor *</label>
                <input type="number" id="transacao-valor" class="form-control" 
                       step="0.01" min="0" required>
            </div>
        `;
        
        app.showModal('Nova Transação', content, [
            {
                text: 'Cancelar',
                class: 'btn-secondary',
                onclick: 'app.hideModal()'
            },
            {
                text: 'Salvar',
                class: 'btn-primary',
                onclick: 'FinanceiroModule.salvarTransacao()'
            }
        ]);
    }

    static salvarTransacao() {
        const transacao = {
            data: document.getElementById('transacao-data').value,
            tipo: document.getElementById('transacao-tipo').value,
            descr: document.getElementById('transacao-descr').value,
            fonte: document.getElementById('transacao-fonte').value,
            forma_pgto: document.getElementById('transacao-forma-pgto').value,
            vlr: parseFloat(document.getElementById('transacao-valor').value) || 0
        };
        
        if (!transacao.data || !transacao.tipo || !transacao.fonte || !transacao.vlr) {
            app.showToast('Preencha todos os campos obrigatórios!', 'error');
            return;
        }
        
        db.save('financeiro', transacao);
        app.showToast('Transação salva com sucesso!', 'success');
        app.hideModal();
        this.showListaFinanceiro();
    }

    static editarTransacao(id) {
        const transacao = db.getById('financeiro', id);
        if (!transacao) return;
        
        const content = `
            <div class="form-group">
                <label>Data *</label>
                <input type="date" id="transacao-data" class="form-control" 
                       value="${transacao.data.split('T')[0]}" required>
            </div>
            
            <div class="form-group">
                <label>Tipo *</label>
                <select id="transacao-tipo" class="form-control" required>
                    <option value="Entrada" ${transacao.tipo === 'Entrada' ? 'selected' : ''}>Entrada</option>
                    <option value="Saída" ${transacao.tipo === 'Saída' ? 'selected' : ''}>Saída</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Descrição</label>
                <input type="text" id="transacao-descr" class="form-control" 
                       value="${transacao.descr || ''}">
            </div>
            
            <div class="form-group">
                <label>Fonte *</label>
                <input type="text" id="transacao-fonte" class="form-control" 
                       value="${transacao.fonte}" required>
            </div>
            
            <div class="form-group">
                <label>Forma de Pagamento</label>
                <select id="transacao-forma-pgto" class="form-control">
                    <option value="">Selecione...</option>
                    <option value="Pix" ${transacao.forma_pgto === 'Pix' ? 'selected' : ''}>Pix</option>
                    <option value="Dinheiro" ${transacao.forma_pgto === 'Dinheiro' ? 'selected' : ''}>Dinheiro</option>
                    <option value="Cartão" ${transacao.forma_pgto === 'Cartão' ? 'selected' : ''}>Cartão</option>
                    <option value="Boleto" ${transacao.forma_pgto === 'Boleto' ? 'selected' : ''}>Boleto</option>
                    <option value="Transferência" ${transacao.forma_pgto === 'Transferência' ? 'selected' : ''}>Transferência</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Valor *</label>
                <input type="number" id="transacao-valor" class="form-control" 
                       value="${transacao.vlr || 0}" step="0.01" min="0" required>
            </div>
            
            <input type="hidden" id="transacao-id" value="${transacao.id}">
        `;
        
        app.showModal('Editar Transação', content, [
            {
                text: 'Cancelar',
                class: 'btn-secondary',
                onclick: 'app.hideModal()'
            },
            {
                text: 'Salvar Alterações',
                class: 'btn-primary',
                onclick: 'FinanceiroModule.atualizarTransacao()'
            }
        ]);
    }

    static atualizarTransacao() {
        const transacao = {
            id: parseInt(document.getElementById('transacao-id').value),
            data: document.getElementById('transacao-data').value,
            tipo: document.getElementById('transacao-tipo').value,
            descr: document.getElementById('transacao-descr').value,
            fonte: document.getElementById('transacao-fonte').value,
            forma_pgto: document.getElementById('transacao-forma-pgto').value,
            vlr: parseFloat(document.getElementById('transacao-valor').value) || 0
        };
        
        db.save('financeiro', transacao);
        app.showToast('Transação atualizada com sucesso!', 'success');
        app.hideModal();
        this.showListaFinanceiro();
    }

    static excluirTransacao(id) {
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            db.delete('financeiro', id);
            app.showToast('Transação excluída com sucesso!', 'success');
            this.showListaFinanceiro();
        }
    }

    static showPesquisa() {
        const content = `
            <div class="form-row">
                <div class="form-group">
                    <label>Data Inicial</label>
                    <input type="date" id="filtro-data-inicio" class="form-control">
                </div>
                <div class="form-group">
                    <label>Data Final</label>
                    <input type="date" id="filtro-data-fim" class="form-control">
                </div>
            </div>
            
            <div class="form-group">
                <label>Tipo</label>
                <select id="filtro-tipo" class="form-control">
                    <option value="">Todos</option>
                    <option value="Entrada">Entradas</option>
                    <option value="Saída">Saídas</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Fonte</label>
                <input type="text" id="filtro-fonte" class="form-control" placeholder="Filtrar por fonte...">
            </div>
        `;
        
        app.showModal('Pesquisar Transações', content, [
            {
                text: 'Cancelar',
                class: 'btn-secondary',
                onclick: 'app.hideModal()'
            },
            {
                text: 'Pesquisar',
                class: 'btn-primary',
                onclick: 'FinanceiroModule.aplicarPesquisa()'
            }
        ]);
    }

    static aplicarPesquisa() {
        // Implementar lógica de filtro
        const dataInicio = document.getElementById('filtro-data-inicio').value;
        const dataFim = document.getElementById('filtro-data-fim').value;
        const tipo = document.getElementById('filtro-tipo').value;
        const fonte = document.getElementById('filtro-fonte').value;
        
        // Aplicar filtros e atualizar lista
        app.hideModal();
    }

    static gerarRelatorio() {
        const transacoes = db.getAll('financeiro');
        
        // Agrupar por mês
        const porMes = {};
        transacoes.forEach(t => {
            const data = new Date(t.data);
            const mesAno = `${data.getFullYear()}-${(data.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (!porMes[mesAno]) {
                porMes[mesAno] = { entradas: 0, saidas: 0 };
            }
            
            if (t.tipo === 'Entrada') {
                porMes[mesAno].entradas += parseFloat(t.vlr) || 0;
            } else {
                porMes[mesAno].saidas += parseFloat(t.vlr) || 0;
            }
        });
        
        // Gerar PDF do relatório
        PDFGenerator.gerarRelatorioFinanceiro(porMes);
        app.showToast('Relatório gerado com sucesso!', 'success');
    }
}