class PDFGenerator {
    static dadosEmpresa = {
        nome: "Viana & Viana Mecânica Diesel LTDA",
        endereco: "Rua Miguel Oresko n90",
        cidade: "Nova Santa Rita",
        cnpj: "61.459.722/0001-01",
        ie: "Não informado",
        telefone: "51 9 9903-6427"
    };

    static gerarOSPDF(os) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        
        // Configurações
        pdf.setFont("helvetica");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 20;
        
        // Cabeçalho
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text(this.dadosEmpresa.nome, pageWidth / 2, 15, { align: "center" });
        
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.text(`${this.dadosEmpresa.endereco} - ${this.dadosEmpresa.cidade}`, pageWidth / 2, 22, { align: "center" });
        pdf.text(`CNPJ: ${this.dadosEmpresa.cnpj} - IE: ${this.dadosEmpresa.ie} - Tel: ${this.dadosEmpresa.telefone}`, pageWidth / 2, 28, { align: "center" });
        
        // Linha divisória
        pdf.setDrawColor(0, 0, 0);
        pdf.line(margin, 35, pageWidth - margin, 35);
        
        // Título OS
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text(`Ordem de Serviço Nº: ${os.numero}`, margin, 45);
        
        pdf.setFontSize(10);
        pdf.text(`Data: ${new Date(os.data_emissao).toLocaleDateString('pt-BR')}`, pageWidth - margin, 45, { align: "right" });
        
        // Dados do Cliente
        pdf.setFontSize(12);
        pdf.text("Dados do Cliente", margin, 55);
        
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        let y = 62;
        pdf.text(`Nome/Razão Social: ${os.cliente.nome}`, margin, y);
        y += 6;
        pdf.text(`CPF/CNPJ: ${os.cliente.cnpj}`, margin, y);
        y += 6;
        pdf.text(`Endereço: ${os.cliente.endereco}`, margin, y);
        y += 6;
        pdf.text(`Cidade/UF: ${os.cliente.cidade}`, margin, y);
        y += 6;
        pdf.text(`Telefone: ${os.cliente.telefone}`, margin, y);
        y += 6;
        pdf.text(`E-mail: ${os.cliente.email || 'Não informado'}`, margin, y);
        
        // Dados do Veículo
        if (os.veiculo) {
            y += 10;
            pdf.setFontSize(12);
            pdf.setFont("helvetica", "bold");
            pdf.text("Dados do Veículo", margin, y);
            
            y += 7;
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            pdf.text(`Modelo: ${os.veiculo.modelo}`, margin, y);
            y += 6;
            pdf.text(`Placa: ${os.veiculo.placa}`, margin, y);
            y += 6;
            pdf.text(`KM: ${os.veiculo.km}`, margin, y);
            y += 6;
            pdf.text(`Ano: ${os.veiculo.ano}`, margin, y);
        }
        
        // Serviço Solicitado
        if (os.servico_solicitado) {
            y += 10;
            pdf.setFontSize(12);
            pdf.setFont("helvetica", "bold");
            pdf.text("Serviço Solicitado", margin, y);
            
            y += 7;
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            const servicoLines = pdf.splitTextToSize(os.servico_solicitado, pageWidth - 2 * margin);
            servicoLines.forEach(line => {
                pdf.text(line, margin, y);
                y += 6;
            });
        }
        
        // Itens da OS
        y += 10;
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text("Itens da Ordem de Serviço", margin, y);
        
        y += 10;
        // Cabeçalho da tabela
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text("Descrição", margin, y);
        pdf.text("Quantidade", 130, y);
        pdf.text("Valor Unit.", 150, y);
        pdf.text("Valor Total", 170, y);
        
        y += 6;
        pdf.setDrawColor(0, 0, 0);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 3;
        
        // Itens
        pdf.setFont("helvetica", "normal");
        os.itens.forEach(item => {
            if (y > 250) { // Verificar se precisa de nova página
                pdf.addPage();
                y = 20;
            }
            
            // Descrição (com quebra de linha se necessário)
            const descLines = pdf.splitTextToSize(item.descricao, 80);
            descLines.forEach((line, index) => {
                pdf.text(line, margin, y + (index * 6));
            });
            
            const descHeight = Math.max(descLines.length * 6, 12);
            
            // Demais colunas
            pdf.text(item.quantidade.toString(), 130, y);
            pdf.text(this.formatCurrencyPDF(item.valor_unitario), 150, y);
            pdf.text(this.formatCurrencyPDF(item.valor_total), 170, y);
            
            y += descHeight;
            pdf.line(margin, y, pageWidth - margin, y);
            y += 3;
        });
        
        // Total
        y += 10;
        pdf.setFont("helvetica", "bold");
        pdf.text("TOTAL:", 140, y);
        pdf.text(this.formatCurrencyPDF(os.valor_total), 170, y);
        
        // Observações
        if (os.observacoes) {
            y += 20;
            pdf.setFontSize(12);
            pdf.text("Observações", margin, y);
            
            y += 7;
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            const obsLines = pdf.splitTextToSize(os.observacoes, pageWidth - 2 * margin);
            obsLines.forEach(line => {
                pdf.text(line, margin, y);
                y += 6;
            });
        }
        
        // Status
        y += 10;
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(`Status: ${os.status}`, margin, y);
        
        // Rodapé
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text("Emitido por Platypus v2 - Sistema de Gestão", pageWidth / 2, 290, { align: "center" });
        pdf.text(new Date().toLocaleString('pt-BR'), pageWidth / 2, 295, { align: "center" });
        
        // Salvar PDF
        pdf.save(`OS_${os.numero}.pdf`);
    }

    static formatCurrencyPDF(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    static gerarRelatorioOS(ordens, periodo) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        
        // Configurações similares à OS individual
        pdf.setFont("helvetica");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 20;
        
        // Cabeçalho do relatório
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text(this.dadosEmpresa.nome, pageWidth / 2, 15, { align: "center" });
        
        pdf.setFontSize(12);
        pdf.text("Relatório de Ordens de Serviço", pageWidth / 2, 25, { align: "center" });
        
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Período: ${periodo}`, pageWidth / 2, 32, { align: "center" });
        
        // Tabela de OS
        let y = 45;
        
        // Cabeçalho da tabela
        pdf.setFont("helvetica", "bold");
        pdf.text("Número", margin, y);
        pdf.text("Cliente", margin + 30, y);
        pdf.text("Data", margin + 100, y);
        pdf.text("Valor", margin + 130, y);
        pdf.text("Status", margin + 160, y);
        
        y += 6;
        pdf.line(margin, y, pageWidth - margin, y);
        y += 3;
        
        // Dados
        pdf.setFont("helvetica", "normal");
        let totalGeral = 0;
        
        ordens.forEach(os => {
            if (y > 270) {
                pdf.addPage();
                y = 20;
            }
            
            pdf.text(os.numero, margin, y);
            pdf.text(os.cliente_nome.substring(0, 30), margin + 30, y);
            pdf.text(new Date(os.data_emissao).toLocaleDateString('pt-BR'), margin + 100, y);
            pdf.text(this.formatCurrencyPDF(os.valor_total), margin + 130, y);
            pdf.text(os.status, margin + 160, y);
            
            totalGeral += os.valor_total;
            y += 10;
        });
        
        // Total
        y += 10;
        pdf.setFont("helvetica", "bold");
        pdf.text("TOTAL GERAL:", margin + 100, y);
        pdf.text(this.formatCurrencyPDF(totalGeral), margin + 160, y);
        
        // Salvar PDF
        pdf.save(`Relatorio_OS_${new Date().toISOString().slice(0, 10)}.pdf`);
    }
}