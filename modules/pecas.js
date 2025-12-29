class PecasModule {
    static showListaPecas() {
        const content = document.getElementById('module-content');
        const pecas = db.getAll('pecas');
        
        content.innerHTML = `
            <div class="module-header">
                <h2><i class="fas fa-cogs"></i> Peças</h2>
                <div>
                    <button class="btn-secondary" onclick="PecasModule.showPesquisa()">
                        <i class="fas fa-search"></i> Pesquisar
                    </button>
                    <button class="btn-primary" onclick="PecasModule.showNovaPeca()">
                        <i class="fas fa-plus"></i> Nova Peça
                    </button>
                </div>
            </div>
            
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Descrição</th>
                            <th>Fabricante</th>
                            <th>Código OEM</th>
                            <th>Valor Custo</th>
                            <th>Valor Venda</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pecas.map(peca => `
                            <tr>
                                <td>${peca.cod_in}</td>
                                <td>${peca.descr}</td>
                                <td>${peca.fabric}</td>
                                <td>${peca.cod_pec}</td>
                                <td>${app.formatCurrency(peca.vlr_cust || 0)}</td>
                                <td>${app.formatCurrency(peca.vlr_venda || 0)}</td>
                                <td class="table-actions">
                                    <button class="btn-icon" onclick="PecasModule.editarPeca(${peca.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon" onclick="PecasModule.excluirPeca(${peca.id})">
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

    static showNovaPeca() {
        const content = `
            <div class="form-row">
                <div class="form-group">
                    <label>Código NF</label>
                    <input type="text" id="peca-cod-nf" class="form-control">
                </div>
                <div class="form-group">
                    <label>Código Interno *</label>
                    <input type="text" id="peca-cod-in" class="form-control" required>
                </div>
            </div>
            
            <div class="form-group">
                <label>Descrição</label>
                <input type="text" id="peca-descr" class="form-control">
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Fabricante</label>
                    <input type="text" id="peca-fabric" class="form-control">
                </div>
                <div class="form-group">
                    <label>Código Peça (OEM)</label>
                    <input type="text" id="peca-cod-pec" class="form-control">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Valor Custo</label>
                    <input type="number" id="peca-vlr-cust" class="form-control" step="0.01" min="0">
                </div>
                <div class="form-group">
                    <label>Valor Venda</label>
                    <input type="number" id="peca-vlr-venda" class="form-control" step="0.01" min="0">
                </div>
            </div>
        `;
        
        app.showModal('Nova Peça', content, [
            {
                text: 'Cancelar',
                class: 'btn-secondary',
                onclick: 'app.hideModal()'
            },
            {
                text: 'Salvar',
                class: 'btn-primary',
                onclick: 'PecasModule.salvarPeca()'
            }
        ]);
    }

    static salvarPeca() {
        const peca = {
            cod_nf: document.getElementById('peca-cod-nf').value,
            cod_in: document.getElementById('peca-cod-in').value,
            descr: document.getElementById('peca-descr').value,
            fabric: document.getElementById('peca-fabric').value,
            cod_pec: document.getElementById('peca-cod-pec').value,
            vlr_cust: parseFloat(document.getElementById('peca-vlr-cust').value) || 0,
            vlr_venda: parseFloat(document.getElementById('peca-vlr-venda').value) || 0
        };
        
        if (!peca.cod_in) {
            app.showToast('Código interno é obrigatório!', 'error');
            return;
        }
        
        db.save('pecas', peca);
        app.showToast('Peça salva com sucesso!', 'success');
        app.hideModal();
        this.showListaPecas();
    }

    static editarPeca(id) {
        const peca = db.getById('pecas', id);
        if (!peca) return;
        
        const content = `
            <div class="form-row">
                <div class="form-group">
                    <label>Código NF</label>
                    <input type="text" id="peca-cod-nf" class="form-control" value="${peca.cod_nf || ''}">
                </div>
                <div class="form-group">
                    <label>Código Interno *</label>
                    <input type="text" id="peca-cod-in" class="form-control" value="${peca.cod_in}" required>
                </div>
            </div>
            
            <div class="form-group">
                <label>Descrição</label>
                    <input type="text" id="peca-descr" class="form-control" value="${peca.descr || ''}">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Fabricante</label>
                        <input type="text" id="peca-fabric" class="form-control" value="${peca.fabric || ''}">
                    </div>
                    <div class="form-group">
                        <label>Código Peça (OEM)</label>
                        <input type="text" id="peca-cod-pec" class="form-control" value="${peca.cod_pec || ''}">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Valor Custo</label>
                        <input type="number" id="peca-vlr-cust" class="form-control" 
                               value="${peca.vlr_cust || 0}" step="0.01" min="0">
                    </div>
                    <div class="form-group">
                        <label>Valor Venda</label>
                        <input type="number" id="peca-vlr-venda" class="form-control" 
                               value="${peca.vlr_venda || 0}" step="0.01" min="0">
                    </div>
                </div>
                
                <input type="hidden" id="peca-id" value="${peca.id}">
            `;
            
            app.showModal('Editar Peça', content, [
                {
                    text: 'Cancelar',
                    class: 'btn-secondary',
                    onclick: 'app.hideModal()'
                },
                {
                    text: 'Salvar Alterações',
                    class: 'btn-primary',
                    onclick: 'PecasModule.atualizarPeca()'
                }
            ]);
        }

        static atualizarPeca() {
            const peca = {
                id: parseInt(document.getElementById('peca-id').value),
                cod_nf: document.getElementById('peca-cod-nf').value,
                cod_in: document.getElementById('peca-cod-in').value,
                descr: document.getElementById('peca-descr').value,
                fabric: document.getElementById('peca-fabric').value,
                cod_pec: document.getElementById('peca-cod-pec').value,
                vlr_cust: parseFloat(document.getElementById('peca-vlr-cust').value) || 0,
                vlr_venda: parseFloat(document.getElementById('peca-vlr-venda').value) || 0
            };
            
            db.save('pecas', peca);
            app.showToast('Peça atualizada com sucesso!', 'success');
            app.hideModal();
            this.showListaPecas();
        }

        static excluirPeca(id) {
            if (confirm('Tem certeza que deseja excluir esta peça?')) {
                db.delete('pecas', id);
                app.showToast('Peça excluída com sucesso!', 'success');
                this.showListaPecas();
            }
        }

        static showEstoque() {
            const content = document.getElementById('module-content');
            const pecas = db.getAll('pecas');
            
            // Calcular valor total do estoque
            const valorTotal = pecas.reduce((total, peca) => {
                return total + (parseFloat(peca.vlr_cust) || 0);
            }, 0);
            
            content.innerHTML = `
                <div class="module-header">
                    <h2><i class="fas fa-boxes"></i> Estoque</h2>
                    <div class="estoque-resumo">
                        <div class="resumo-card">
                            <i class="fas fa-box"></i>
                            <div>
                                <h3>${pecas.length}</h3>
                                <p>Itens no Estoque</p>
                            </div>
                        </div>
                        <div class="resumo-card">
                            <i class="fas fa-money-bill-wave"></i>
                            <div>
                                <h3>${app.formatCurrency(valorTotal)}</h3>
                                <p>Valor Total</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Descrição</th>
                                <th>Fabricante</th>
                                <th>Código OEM</th>
                                <th>Custo</th>
                                <th>Venda</th>
                                <th>Margem</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pecas.map(peca => {
                                const custo = parseFloat(peca.vlr_cust) || 0;
                                const venda = parseFloat(peca.vlr_venda) || 0;
                                const margem = custo > 0 ? ((venda - custo) / custo * 100).toFixed(1) : 0;
                                
                                return `
                                    <tr>
                                        <td>${peca.cod_in}</td>
                                        <td>${peca.descr}</td>
                                        <td>${peca.fabric}</td>
                                        <td>${peca.cod_pec}</td>
                                        <td>${app.formatCurrency(custo)}</td>
                                        <td>${app.formatCurrency(venda)}</td>
                                        <td class="${margem >= 0 ? 'text-success' : 'text-danger'}">
                                            ${margem}%
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div style="margin-top: 2rem;">
                    <button class="btn-secondary" onclick="PecasModule.exportarEstoque()">
                        <i class="fas fa-file-export"></i> Exportar Estoque
                    </button>
                    <button class="btn-secondary" onclick="PecasModule.importarEstoque()">
                        <i class="fas fa-file-import"></i> Importar Estoque
                    </button>
                </div>
            `;
        }

        static showPesquisa() {
            const content = `
                <div class="form-group">
                    <label>Termo de Pesquisa</label>
                    <input type="text" id="pesquisa-termo" class="form-control" 
                           placeholder="Descrição, código ou fabricante"
                           onkeyup="PecasModule.realizarPesquisa(this.value)">
                </div>
                
                <div id="pesquisa-resultados" class="table-container" 
                     style="max-height: 400px; overflow-y: auto; margin-top: 1rem;"></div>
            `;
            
            app.showModal('Pesquisar Peças', content, [
                {
                    text: 'Fechar',
                    class: 'btn-secondary',
                    onclick: 'app.hideModal()'
                }
            ]);
        }

        static realizarPesquisa(termo) {
            const resultados = db.searchPecas(termo);
            const container = document.getElementById('pesquisa-resultados');
            
            if (!container) return;
            
            const html = `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Descrição</th>
                            <th>Fabricante</th>
                            <th>Valor Venda</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${resultados.map(peca => `
                            <tr>
                                <td>${peca.cod_in}</td>
                                <td>${peca.descr}</td>
                                <td>${peca.fabric}</td>
                                <td>${app.formatCurrency(peca.vlr_venda || 0)}</td>
                                <td>
                                    <button class="btn-icon" onclick="PecasModule.editarPeca(${peca.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon" onclick="PecasModule.adicionarAOS(${peca.id})">
                                        <i class="fas fa-plus-circle"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            
            container.innerHTML = html;
        }

        static adicionarAOS(pecaId) {
            // Implementar lógica para adicionar peça à OS atual
            app.showToast('Funcionalidade em desenvolvimento', 'info');
        }

        static exportarEstoque() {
            const csv = db.exportToCSV('pecas');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `estoque_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            app.showToast('Estoque exportado com sucesso!', 'success');
        }

        static importarEstoque() {
            const content = `
                <div class="form-group">
                    <label>Selecionar arquivo CSV</label>
                    <input type="file" id="arquivo-csv" class="form-control" accept=".csv">
                </div>
                <div class="form-group">
                    <label>Delimitador</label>
                    <input type="text" id="csv-delimitador" class="form-control" value=",">
                </div>
                <div class="form-group">
                    <div class="form-check">
                        <input type="checkbox" id="csv-cabecalho" class="form-check-input" checked>
                        <label class="form-check-label">Arquivo possui cabeçalho</label>
                    </div>
                </div>
            `;
            
            app.showModal('Importar Estoque', content, [
                {
                    text: 'Cancelar',
                    class: 'btn-secondary',
                    onclick: 'app.hideModal()'
                },
                {
                    text: 'Importar',
                    class: 'btn-primary',
                    onclick: 'PecasModule.processarImportacao()'
                }
            ]);
        }

        static processarImportacao() {
            const fileInput = document.getElementById('arquivo-csv');
            if (!fileInput.files.length) {
                app.showToast('Selecione um arquivo!', 'error');
                return;
            }
            
            const file = fileInput.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const csvText = e.target.result;
                const success = db.importFromCSV('pecas', csvText);
                
                if (success) {
                    app.showToast('Estoque importado com sucesso!', 'success');
                    app.hideModal();
                    PecasModule.showEstoque();
                } else {
                    app.showToast('Erro ao importar estoque!', 'error');
                }
            };
            
            reader.readAsText(file);
        }
    }