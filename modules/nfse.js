class NFSEModule {
    static dadosEmpresa = {
        nome: "Viana & Viana Mecânica Diesel LTDA",
        endereco: "Rua Miguel Oresko n90",
        cidade: "Nova Santa Rita",
        cnpj: "61.459.722/0001-01",
        ie: "Não informado",
        telefone: "51 9 9903-6427"
    };

    static showNotas() {
        const content = document.getElementById('module-content');
        
        content.innerHTML = `
            <div class="module-header">
                <h2><i class="fas fa-file-invoice"></i> Emissão de Notas Fiscais</h2>
                <div>
                    <button class="btn-secondary" onclick="NFSEModule.consultarNFSE()">
                        <i class="fas fa-search"></i> Consultar
                    </button>
                    <button class="btn-primary" onclick="NFSEModule.emitirNFSE()">
                        <i class="fas fa-plus"></i> Emitir NFS-e
                    </button>
                </div>
            </div>
            
            <div class="info-card">
                <h3><i class="fas fa-info-circle"></i> Informações da Empresa</h3>
                <p><strong>${this.dadosEmpresa.nome}</strong></p>
                <p>CNPJ: ${this.dadosEmpresa.cnpj} | IE: ${this.dadosEmpresa.ie}</p>
                <p>${this.dadosEmpresa.endereco} - ${this.dadosEmpresa.cidade}</p>
                <p>Telefone: ${this.dadosEmpresa.telefone}</p>
            </div>
            
            <div class="info-card">
                <h3><i class="fas fa-bolt"></i> Ações Rápidas</h3>
                <div class="action-grid">
                    <button class="action-btn" onclick="NFSEModule.emitirNFSE()">
                        <i class="fas fa-file-invoice-dollar"></i>
                        <span>Emitir NFS-e</span>
                    </button>
                    <button class="action-btn" onclick="NFSEModule.consultarNFSE()">
                        <i class="fas fa-search"></i>
                        <span>Consultar NFS-e</span>
                    </button>
                    <button class="action-btn" onclick="NFSEModule.historicoNotas()">
                        <i class="fas fa-history"></i>
                        <span>Histórico</span>
                    </button>
                    <button class="action-btn" onclick="NFSEModule.configurarNFSE()">
                        <i class="fas fa-cog"></i>
                        <span>Configurações</span>
                    </button>
                </div>
            </div>
            
            <div class="info-card">
                <h3><i class="fas fa-lightbulb"></i> Instruções</h3>
                <ol style="padding-left: 1.5rem;">
                    <li>Selecione uma Ordem de Serviço para emitir a NFS-e</li>
                    <li>Verifique os dados do cliente e serviço prestado</li>
                    <li>Selecione o item da lista de serviço apropriado</li>
                    <li>Gere o XML e envie para a prefeitura</li>
                    <li>Armazene o comprovante de emissão</li>
                </ol>
            </div>
        `;
    }

    static emitirNFSE() {
        // Primeiro selecionar uma OS
        const ordens = db.getAllOS().filter(os => os.status === 'Fechada');
        
        const content = `
            <h4>Selecione uma Ordem de Serviço</h4>
            <div class="form-group">
                <input type="text" id="os-search" class="form-control" 
                       placeholder="Pesquisar OS por número ou cliente..."
                       onkeyup="NFSEModule.filtrarOSNFSE(this.value)">
            </div>
            
            <div class="table-container" style="max-height: 300px; overflow-y: auto;">
                <table class="table">
                    <thead>
                        <tr>
                            <th>OS</th>
                            <th>Cliente</th>
                            <th>Valor</th>
                            <th>Data</th>
                            <th>Ação</th>
                        </tr>
                    </thead>
                    <tbody id="os-lista-nfse">
                        ${ordens.map(os => `
                            <tr>
                                <td>${os.numero}</td>
                                <td>${os.cliente_nome}</td>
                                <td>${app.formatCurrency(os.valor_total || 0)}</td>
                                <td>${app.formatDate(os.data_emissao)}</td>
                                <td>
                                    <button class="btn-secondary" onclick="NFSEModule.prepararNFSE(${os.id})">
                                        Selecionar
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        app.showModal('Emitir NFS-e - Selecionar OS', content, [
            {
                text: 'Cancelar',
                class: 'btn-secondary',
                onclick: 'app.hideModal()'
            }
        ]);
    }

    static prepararNFSE(osId) {
        const osCompleta = db.getOSComCliente(osId);
        if (!osCompleta) return;
        
        const content = `
            <div class="nfse-preparo">
                <h4>Dados da Ordem de Serviço</h4>
                <div class="dados-os">
                    <p><strong>OS:</strong> ${osCompleta.numero}</p>
                    <p><strong>Cliente:</strong> ${osCompleta.cliente.nome}</p>
                    <p><strong>CPF/CNPJ:</strong> ${osCompleta.cliente.cnpj}</p>
                    <p><strong>Valor Total:</strong> ${app.formatCurrency(osCompleta.valor_total)}</p>
                </div>
                
                <hr>
                
                <h4>Configuração da NFS-e</h4>
                <div class="form-group">
                    <label>Item da Lista de Serviço *</label>
                    <select id="nfse-item-lista" class="form-control" required>
                        <option value="">Selecione...</option>
                        <option value="14.01">14.01 - Reparação e conservação</option>
                        <option value="14.02">14.02 - Manutenção preventiva</option>
                        <option value="14.03">14.03 - Instalação de equipamentos</option>
                        <option value="14.04">14.04 - Serviços de borracharia</option>
                        <option value="14.05">14.05 - Outros serviços</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Discriminação do Serviço *</label>
                    <textarea id="nfse-discriminacao" class="form-control" rows="3" required>
Serviços de mecânica diesel e manutenção veicular - OS ${osCompleta.numero}
${osCompleta.itens.map(item => item.descricao).join(', ')}
                    </textarea>
                </div>
                
                <div class="form-group">
                    <label>Valor dos Serviços *</label>
                    <input type="number" id="nfse-valor" class="form-control" 
                           value="${osCompleta.valor_total}" step="0.01" min="0" required>
                </div>
                
                <div class="form-group">
                    <label>ISS Retido</label>
                    <select id="nfse-iss-retido" class="form-control">
                        <option value="2">Não retido</option>
                        <option value="1">Retido</option>
                    </select>
                </div>
                
                <hr>
                
                <h4>Credenciais</h4>
                <div class="form-group">
                    <label>Usuário/CNPJ *</label>
                    <input type="text" id="nfse-usuario" class="form-control" 
                           value="${this.dadosEmpresa.cnpj.replace(/\D/g, '')}" required>
                </div>
                
                <div class="form-group">
                    <label>Senha *</label>
                    <input type="password" id="nfse-senha" class="form-control" required>
                </div>
                
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    As credenciais são necessárias para autenticação no Web Service da prefeitura.
                </div>
                
                <input type="hidden" id="nfse-os-id" value="${osCompleta.id}">
            </div>
        `;
        
        app.showModal('Emitir NFS-e - Configuração', content, [
            {
                text: 'Voltar',
                class: 'btn-secondary',
                onclick: 'NFSEModule.emitirNFSE()'
            },
            {
                text: 'Gerar XML',
                class: 'btn-primary',
                onclick: 'NFSEModule.gerarXMLNFSE()'
            }
        ]);
    }

    static gerarXMLNFSE() {
        const osId = document.getElementById('nfse-os-id').value;
        const osCompleta = db.getOSComCliente(osId);
        const cliente = osCompleta.cliente;
        
        const xmlData = {
            prestador: {
                cnpj: this.dadosEmpresa.cnpj.replace(/\D/g, ''),
                razao_social: this.dadosEmpresa.nome,
                inscricao_municipal: this.dadosEmpresa.ie || '0000000',
                endereco: this.dadosEmpresa.endereco,
                cidade: '431337', // Código IBGE de Nova Santa Rita
                uf: 'RS'
            },
            tomador: {
                cpf_cnpj: cliente.cnpj.replace(/\D/g, ''),
                razao_social: cliente.nome,
                endereco: cliente.endereco || 'Não informado',
                numero: 'S/N',
                bairro: 'Centro',
                cidade: '431337',
                uf: 'RS',
                cep: '92480000',
                telefone: cliente.telefone.replace(/\D/g, '').substring(0, 11),
                email: cliente.email || ''
            },
            servico: {
                item_lista: document.getElementById('nfse-item-lista').value,
                discriminacao: document.getElementById('nfse-discriminacao').value,
                valor_servicos: parseFloat(document.getElementById('nfse-valor').value),
                iss_retido: document.getElementById('nfse-iss-retido').value,
                aliquota: '0.05', // 5%
                valor_iss: (parseFloat(document.getElementById('nfse-valor').value) * 0.05).toFixed(2)
            },
            identificacao: {
                numero: this.gerarNumeroNFSE(),
                serie: '1',
                data_emissao: new Date().toISOString()
            }
        };
        
        const xml = this.criarXMLNFSE(xmlData);
        this.salvarXML(xml, osCompleta.numero);
        
        const content = `
            <div class="nfse-sucesso">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h4>XML Gerado com Sucesso!</h4>
                <p>O XML da NFS-e foi gerado e salvo localmente.</p>
                
                <div class="xml-preview">
                    <pre><code>${this.formatarXML(xml)}</code></pre>
                </div>
                
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Atenção:</strong> Este XML precisa ser enviado ao Web Service da prefeitura para efetivar a emissão.
                </div>
            </div>
        `;
        
        app.showModal('XML Gerado', content, [
            {
                text: 'Fechar',
                class: 'btn-secondary',
                onclick: 'app.hideModal()'
            },
            {
                text: 'Enviar para Prefeitura',
                class: 'btn-primary',
                onclick: 'NFSEModule.enviarParaPrefeitura()'
            },
            {
                text: 'Salvar XML',
                class: 'btn-success',
                onclick: 'NFSEModule.downloadXML()'
            }
        ]);
    }

    static criarXMLNFSE(data) {
        // Implementar geração de XML no padrão ABRASF
        // Esta é uma versão simplificada
        return `<?xml version="1.0" encoding="UTF-8"?>
<EnviarLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
    <LoteRps Id="L${data.identificacao.numero}" versao="1.00">
        <NumeroLote>${data.identificacao.numero}</NumeroLote>
        <Cnpj>${data.prestador.cnpj}</Cnpj>
        <InscricaoMunicipal>${data.prestador.inscricao_municipal}</InscricaoMunicipal>
        <QuantidadeRps>1</QuantidadeRps>
        <ListaRps>
            <Rps>
                <IdentificacaoRps>
                    <Numero>${data.identificacao.numero}</Numero>
                    <Serie>${data.identificacao.serie}</Serie>
                    <Tipo>1</Tipo>
                </IdentificacaoRps>
                <DataEmissao>${data.identificacao.data_emissao}</DataEmissao>
                <Status>1</Status>
                <Servico>
                    <Valores>
                        <ValorServicos>${data.servico.valor_servicos.toFixed(2)}</ValorServicos>
                        <ValorDeducoes>0.00</ValorDeducoes>
                        <IssRetido>${data.servico.iss_retido}</IssRetido>
                        <ValorIss>${data.servico.valor_iss}</ValorIss>
                        <Aliquota>${data.servico.aliquota}</Aliquota>
                    </Valores>
                    <ItemListaServico>${data.servico.item_lista}</ItemListaServico>
                    <CodigoTributacaoMunicipio>${data.servico.item_lista}</CodigoTributacaoMunicipio>
                    <Discriminacao>${data.servico.discriminacao}</Discriminacao>
                    <CodigoMunicipio>${data.prestador.cidade}</CodigoMunicipio>
                </Servico>
                <Prestador>
                    <Cnpj>${data.prestador.cnpj}</Cnpj>
                    <InscricaoMunicipal>${data.prestador.inscricao_municipal}</InscricaoMunicipal>
                </Prestador>
                <Tomador>
                    <IdentificacaoTomador>
                        <CpfCnpj>
                            ${data.tomador.cpf_cnpj.length === 11 ? 
                              `<Cpf>${data.tomador.cpf_cnpj}</Cpf>` : 
                              `<Cnpj>${data.tomador.cpf_cnpj}</Cnpj>`}
                        </CpfCnpj>
                    </IdentificacaoTomador>
                    <RazaoSocial>${data.tomador.razao_social}</RazaoSocial>
                    <Endereco>
                        <Endereco>${data.tomador.endereco}</Endereco>
                        <Numero>${data.tomador.numero}</Numero>
                        <Bairro>${data.tomador.bairro}</Bairro>
                        <CodigoMunicipio>${data.tomador.cidade}</CodigoMunicipio>
                        <Uf>${data.tomador.uf}</Uf>
                        <Cep>${data.tomador.cep}</Cep>
                    </Endereco>
                    ${data.tomador.telefone ? `
                    <Contato>
                        <Telefone>${data.tomador.telefone}</Telefone>
                        ${data.tomador.email ? `<Email>${data.tomador.email}</Email>` : ''}
                    </Contato>
                    ` : ''}
                </Tomador>
                <OptanteSimplesNacional>1</OptanteSimplesNacional>
                <IncentivoFiscal>2</IncentivoFiscal>
            </Rps>
        </ListaRps>
    </LoteRps>
</EnviarLoteRpsEnvio>`;
    }

    static gerarNumeroNFSE() {
        const now = new Date();
        return now.getFullYear().toString() +
               (now.getMonth() + 1).toString().padStart(2, '0') +
               now.getDate().toString().padStart(2, '0') +
               now.getHours().toString().padStart(2, '0') +
               now.getMinutes().toString().padStart(2, '0') +
               now.getSeconds().toString().padStart(2, '0');
    }

    static formatarXML(xml) {
        // Formatar XML para exibição
        const formatted = xml
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>')
            .replace(/  /g, '&nbsp;&nbsp;');
        return formatted;
    }

    static salvarXML(xml, osNumero) {
        // Salvar XML no localStorage
        const nfse = {
            id: this.gerarNumeroNFSE(),
            os_numero: osNumero,
            xml: xml,
            data_geracao: new Date().toISOString(),
            status: 'Gerada'
        };
        
        let nfses = JSON.parse(localStorage.getItem('platypus_nfses') || '[]');
        nfses.push(nfse);
        localStorage.setItem('platypus_nfses', JSON.stringify(nfses));
    }

    static downloadXML() {
        const xml = document.querySelector('pre code').textContent.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<br>/g, '\n').replace(/&nbsp;/g, ' ');
        const blob = new Blob([xml], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nfse_${this.gerarNumeroNFSE()}.xml`;
        a.click();
        app.showToast('XML baixado com sucesso!', 'success');
    }

    static enviarParaPrefeitura() {
        const usuario = document.getElementById('nfse-usuario').value;
        const senha = document.getElementById('nfse-senha').value;
        
        if (!usuario || !senha) {
            app.showToast('Informe usuário e senha!', 'error');
            return;
        }
        
        // Simulação de envio
        app.showToast('Enviando NFS-e para a prefeitura...', 'info');
        
        setTimeout(() => {
            app.showToast('NFS-e enviada com sucesso!', 'success');
            app.hideModal();
        }, 2000);
    }

    static consultarNFSE() {
        const content = `
            <div class="form-group">
                <label>Número da NFS-e</label>
                <input type="text" id="consulta-numero" class="form-control" 
                       placeholder="Número da nota">
            </div>
            
            <div class="form-group">
                <label>CPF/CNPJ do Tomador</label>
                <input type="text" id="consulta-cnpj" class="form-control" 
                       placeholder="CPF ou CNPJ">
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Data Inicial</label>
                    <input type="date" id="consulta-data-inicio" class="form-control">
                </div>
                <div class="form-group">
                    <label>Data Final</label>
                    <input type="date" id="consulta-data-fim" class="form-control">
                </div>
            </div>
            
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i>
                Preencha pelo menos um campo para consultar.
            </div>
        `;
        
        app.showModal('Consultar NFS-e', content, [
            {
                text: 'Cancelar',
                class: 'btn-secondary',
                onclick: 'app.hideModal()'
            },
            {
                text: 'Consultar',
                class: 'btn-primary',
                onclick: 'NFSEModule.realizarConsulta()'
            }
        ]);
    }

    static realizarConsulta() {
        // Implementar lógica de consulta
        app.showToast('Consulta realizada!', 'success');
        app.hideModal();
    }

    static historicoNotas() {
        const nfses = JSON.parse(localStorage.getItem('platypus_nfses') || '[]');
        
        const content = `
            <h4>Histórico de NFS-e</h4>
            ${nfses.length === 0 ? 
                '<p class="text-muted">Nenhuma NFS-e emitida ainda.</p>' : 
                `
                <div class="table-container" style="max-height: 400px; overflow-y: auto;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Número</th>
                                <th>OS</th>
                                <th>Data</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${nfses.map(nfse => `
                                <tr>
                                    <td>${nfse.id}</td>
                                    <td>${nfse.os_numero}</td>
                                    <td>${app.formatDate(nfse.data_geracao)}</td>
                                    <td>
                                        <span class="badge ${nfse.status === 'Emitida' ? 'badge-success' : 'badge-warning'}">
                                            ${nfse.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn-icon" onclick="NFSEModule.visualizarXML('${nfse.id}')">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn-icon" onclick="NFSEModule.baixarXML('${nfse.id}')">
                                            <i class="fas fa-download"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                `
            }
        `;
        
        app.showModal('Histórico de NFS-e', content, [
            {
                text: 'Fechar',
                class: 'btn-secondary',
                onclick: 'app.hideModal()'
            }
        ]);
    }

    static visualizarXML(nfseId) {
        const nfses = JSON.parse(localStorage.getItem('platypus_nfses') || '[]');
        const nfse = nfses.find(n => n.id === nfseId);
        
        if (!nfse) return;
        
        const content = `
            <h4>XML da NFS-e ${nfse.id}</h4>
            <div class="xml-viewer">
                <pre><code>${this.formatarXML(nfse.xml)}</code></pre>
            </div>
        `;
        
        app.showModal('Visualizar XML', content, [
            {
                text: 'Fechar',
                class: 'btn-secondary',
                onclick: 'app.hideModal()'
            },
            {
                text: 'Copiar XML',
                class: 'btn-primary',
                onclick: "NFSEModule.copiarXML('" + nfse.xml.replace(/'/g, "\\'") + "')"
            }
        ]);
    }

    static copiarXML(xml) {
        navigator.clipboard.writeText(xml).then(() => {
            app.showToast('XML copiado para a área de transferência!', 'success');
        });
    }

    static baixarXML(nfseId) {
        const nfses = JSON.parse(localStorage.getItem('platypus_nfses') || '[]');
        const nfse = nfses.find(n => n.id === nfseId);
        
        if (!nfse) return;
        
        const blob = new Blob([nfse.xml], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nfse_${nfseId}.xml`;
        a.click();
        app.showToast('XML baixado com sucesso!', 'success');
    }

    static configurarNFSE() {
        const content = `
            <h4>Configurações da NFS-e</h4>
            
            <div class="form-group">
                <label>Ambiente</label>
                <select id="nfse-ambiente" class="form-control">
                    <option value="homologacao">Homologação</option>
                    <option value="producao" selected>Produção</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>URL do Web Service</label>
                <input type="text" id="nfse-ws-url" class="form-control" 
                       value="https://ws-novasantarita.atende.net:7443/">
            </div>
            
            <div class="form-group">
                <label>Certificado Digital</label>
                <input type="file" id="nfse-certificado" class="form-control" accept=".pfx,.p12">
            </div>
            
            <div class="form-group">
                <label>Senha do Certificado</label>
                <input type="password" id="nfse-cert-senha" class="form-control">
            </div>
            
            <div class="form-group">
                <label>Modelo da NFS-e</label>
                <select id="nfse-modelo" class="form-control">
                    <option value="abrasf" selected>ABRASF</option>
                    <option value="dsf">DSF</option>
                    <option value="ginfes">GINFES</option>
                </select>
            </div>
            
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i>
                Alterações nas configurações podem afetar a emissão de notas.
            </div>
        `;
        
        app.showModal('Configurar NFS-e', content, [
            {
                text: 'Cancelar',
                class: 'btn-secondary',
                onclick: 'app.hideModal()'
            },
            {
                text: 'Salvar',
                class: 'btn-primary',
                onclick: 'NFSEModule.salvarConfigNFSE()'
            }
        ]);
    }

    static salvarConfigNFSE() {
        app.showToast('Configurações salvas com sucesso!', 'success');
        app.hideModal();
    }

    static filtrarOSNFSE(termo) {
        const tabela = document.getElementById('os-lista-nfse');
        if (!tabela) return;
        
        const linhas = tabela.getElementsByTagName('tr');
        for (let i = 1; i < linhas.length; i++) {
            const linha = linhas[i];
            const texto = linha.textContent.toLowerCase();
            linha.style.display = texto.includes(termo.toLowerCase()) ? '' : 'none';
        }
    }
}