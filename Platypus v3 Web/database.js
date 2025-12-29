class Database {
    constructor() {
        this.initializeDatabase();
    }

    initializeDatabase() {
        // Inicializar tabelas se não existirem
        const tables = ['clientes', 'veiculos', 'pecas', 'financeiro', 'ordens_servico', 'itens_os'];
        
        tables.forEach(table => {
            if (!localStorage.getItem(`platypus_${table}`)) {
                localStorage.setItem(`platypus_${table}`, JSON.stringify([]));
            }
        });
    }

    // Métodos genéricos
    getAll(table) {
        const data = localStorage.getItem(`platypus_${table}`);
        return data ? JSON.parse(data) : [];
    }

    getById(table, id) {
        const items = this.getAll(table);
        return items.find(item => item.id === parseInt(id));
    }

    save(table, data) {
        const items = this.getAll(table);
        if (data.id) {
            // Update
            const index = items.findIndex(item => item.id === data.id);
            if (index !== -1) {
                items[index] = { ...items[index], ...data };
            }
        } else {
            // Insert
            data.id = this.getNextId(table);
            data.data_cadastro = new Date().toISOString();
            items.push(data);
        }
        
        localStorage.setItem(`platypus_${table}`, JSON.stringify(items));
        return data.id ? data : { ...data, id: data.id };
    }

    delete(table, id) {
        const items = this.getAll(table);
        const filteredItems = items.filter(item => item.id !== parseInt(id));
        localStorage.setItem(`platypus_${table}`, JSON.stringify(filteredItems));
        return true;
    }

    getNextId(table) {
        const items = this.getAll(table);
        if (items.length === 0) return 1;
        return Math.max(...items.map(item => item.id)) + 1;
    }

    // Métodos específicos
    searchClientes(termo) {
        const clientes = this.getAll('clientes');
        return clientes.filter(cliente =>
            cliente.nome.toLowerCase().includes(termo.toLowerCase()) ||
            cliente.cnpj.includes(termo) ||
            cliente.telefone.includes(termo)
        );
    }

    searchVeiculos(termo) {
        const veiculos = this.getAll('veiculos');
        return veiculos.filter(veiculo =>
            veiculo.placa.toLowerCase().includes(termo.toLowerCase()) ||
            veiculo.modelo.toLowerCase().includes(termo.toLowerCase()) ||
            veiculo.resp_veiculo.toLowerCase().includes(termo.toLowerCase())
        );
    }

    searchPecas(termo) {
        const pecas = this.getAll('pecas');
        return pecas.filter(peca =>
            peca.descr.toLowerCase().includes(termo.toLowerCase()) ||
            peca.cod_pec.includes(termo) ||
            peca.fabric.toLowerCase().includes(termo.toLowerCase())
        );
    }

    getOSComCliente(id) {
        const os = this.getById('ordens_servico', id);
        if (!os) return null;
        
        const cliente = this.getById('clientes', os.cliente_id);
        const veiculo = os.veiculo_id ? this.getById('veiculos', os.veiculo_id) : null;
        const itens = this.getAll('itens_os').filter(item => item.os_id === parseInt(id));
        
        return { ...os, cliente, veiculo, itens };
    }

    getAllOS() {
        const ordens = this.getAll('ordens_servico');
        return ordens.map(os => {
            const cliente = this.getById('clientes', os.cliente_id);
            return { ...os, cliente_nome: cliente ? cliente.nome : 'Cliente não encontrado' };
        });
    }

    // Backup e Restauração
    backup() {
        const backup = {};
        const tables = ['clientes', 'veiculos', 'pecas', 'financeiro', 'ordens_servico', 'itens_os'];
        
        tables.forEach(table => {
            backup[table] = this.getAll(table);
        });
        
        return JSON.stringify(backup);
    }

    restore(backupData) {
        try {
            const backup = JSON.parse(backupData);
            Object.keys(backup).forEach(table => {
                localStorage.setItem(`platypus_${table}`, JSON.stringify(backup[table]));
            });
            return true;
        } catch (error) {
            console.error('Erro ao restaurar backup:', error);
            return false;
        }
    }

    exportToCSV(table) {
        const items = this.getAll(table);
        if (items.length === 0) return '';
        
        const headers = Object.keys(items[0]);
        const csvRows = [
            headers.join(','),
            ...items.map(item => 
                headers.map(header => 
                    JSON.stringify(item[header] || '')
                ).join(',')
            )
        ];
        
        return csvRows.join('\n');
    }

    importFromCSV(table, csvText) {
        try {
            const lines = csvText.split('\n');
            const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
            
            const items = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.replace(/"/g, ''));
                const item = {};
                headers.forEach((header, index) => {
                    item[header] = values[index];
                });
                return item;
            });
            
            localStorage.setItem(`platypus_${table}`, JSON.stringify(items));
            return true;
        } catch (error) {
            console.error('Erro ao importar CSV:', error);
            return false;
        }
    }
}

// Instância global do banco de dados
const db = new Database();