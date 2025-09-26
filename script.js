// ===============================================================================================
// INSTRUÇÕES PARA CONFIGURAR A INTEGRAÇÃO COM GOOGLE SHEETS
// ===============================================================================================
// Para que a lista de comidas funcione online, siga estes 5 passos:
//
// PASSO 1: CRIE UMA NOVA PLANILHA GOOGLE SHEETS
//    1. Acesse sheets.google.com e crie uma nova planilha em branco.
//    2. Na primeira linha, coloque os títulos das colunas. Na célula A1, escreva "Item". Na célula B1, escreva "Reservado por".
//    3. A partir da célula A2 para baixo, liste todos os itens de comida e bebida que você quer na sua festa.
//    4. Anote o ID da sua planilha. Ele está na URL. Ex: docs.google.com/spreadsheets/d/ID_DA_PLANILHA/edit
//
// PASSO 2: CRIE O GOOGLE APPS SCRIPT
//    1. Na sua planilha, vá em "Extensões" > "Apps Script". Uma nova aba com um editor de código se abrirá.
//    2. Apague todo o código que estiver no arquivo `Code.gs`.
//    3. Copie TODO o código da caixa "CÓDIGO DO GOOGLE APPS SCRIPT" abaixo e cole no editor do Apps Script.
//    4. Encontre a linha `const SPREADSHEET_ID = "COLOQUE_O_ID_DA_SUA_PLANILHA_AQUI";` e substitua pelo ID que você anotou no Passo 1.
//
// PASSO 3: PUBLIQUE O SCRIPT COMO UM APLICATIVO WEB
//    1. No editor do Apps Script, clique no botão "Implantar" (canto superior direito) e depois em "Nova implantação".
//    2. Clique no ícone de engrenagem ao lado de "Selecione o tipo" e escolha "App da Web".
//    3. No campo "Descrição", coloque algo como "Lista de Comidas da Festa".
//    4. Em "Executar como", deixe "Eu (seu e-mail)".
//    5. Em "Quem pode acessar", selecione "Qualquer pessoa". ISSO É MUITO IMPORTANTE para que a página funcione.
//    6. Clique em "Implantar".
//
// PASSO 4: AUTORIZE A EXECUÇÃO
//    1. O Google pedirá autorização. Clique em "Autorizar acesso".
//    2. Escolha sua conta do Google.
//    3. Você pode ver um aviso de "App não verificado". Clique em "Avançado" e depois em "Acessar (nome do seu projeto) (não seguro)". É seguro, pois o código foi feito por você.
//    4. Permita as permissões que o script solicita.
//
// PASSO 5: USE A URL GERADA
//    1. Após a implantação, uma janela aparecerá com a "URL do app da Web". Clique em "Copiar".
//    2. Volte para este arquivo (script.js) e cole a URL copiada na constante `WEB_APP_URL` abaixo, substituindo o texto de exemplo.
//
// Pronto! Sua lista de comidas agora está conectada à sua planilha.
// -----------------------------------------------------------------------------------------------

/*
// ===============================================================================================
// CÓDIGO DO GOOGLE APPS SCRIPT (Para ser colado no arquivo Code.gs - Passo 2)
// ===============================================================================================
//
// // ID da sua planilha
// const SPREADSHEET_ID = "COLOQUE_O_ID_DA_SUA_PLANILHA_AQUI"; 
// // Nome da página/aba da sua planilha (geralmente é 'Página1' ou 'Sheet1')
// const SHEET_NAME = "Página1"; 
// 
// // Função principal para requisições GET (carregar dados)
// function doGet(e) {
//   try {
//     const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
//     const data = sheet.getDataRange().getValues();
//     
//     const response = {
//       success: true,
//       data: data
//     };
//     
//     // Retornar como JSONP para evitar problemas de CORS
//     return ContentService
//       .createTextOutput(e.parameter.callback + '(' + JSON.stringify(response) + ')')
//       .setMimeType(ContentService.MimeType.JAVASCRIPT);
//       
//   } catch (error) {
//     const response = {
//       success: false,
//       error: error.message
//     };
//     
//     return ContentService
//       .createTextOutput(e.parameter.callback + '(' + JSON.stringify(response) + ')')
//       .setMimeType(ContentService.MimeType.JAVASCRIPT);
//   }
// }
// 
// // Função principal para requisições POST (reservar/cancelar)
// function doPost(e) {
//   try {
//     const action = e.parameter.action;
//     const itemName = e.parameter.itemName;
//     
//     if (!action || !itemName) {
//       throw new Error("Ação ou nome do item não especificado.");
//     }
// 
//     const lock = LockService.getScriptLock();
//     lock.waitLock(15000); // Esperar até 15 segundos pelo bloqueio para evitar que duas pessoas reservem ao mesmo tempo
// 
//     let resultMessage = '';
// 
//     try {
//         const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
//         const data = sheet.getDataRange().getValues();
//         let itemRow = -1;
// 
//         // Encontra a linha correspondente ao item
//         for (let i = 0; i < data.length; i++) {
//             if (data[i][0] === itemName) {
//                 itemRow = i + 1; // Linhas da planilha começam em 1
//                 break;
//             }
//         }
//         
//         if (itemRow === -1) {
//           throw new Error("Item não encontrado na lista: " + itemName);
//         }
// 
//         if (action === 'reserve') {
//             const reservedBy = e.parameter.reservedBy;
//             if (!reservedBy) {
//               throw new Error("Nome da pessoa para reserva não foi fornecido.");
//             }
//             // Verifica se a célula de reserva já está preenchida
//             if (sheet.getRange(itemRow, 2).getValue() !== '') {
//                 throw new Error("Este item já foi reservado por outra pessoa.");
//             }
//             sheet.getRange(itemRow, 2).setValue(reservedBy);
//             resultMessage = 'Item reservado com sucesso!';
// 
//         } else if (action === 'cancel') {
//             sheet.getRange(itemRow, 2).setValue('');
//             resultMessage = 'Reserva cancelada com sucesso!';
//         } else {
//             throw new Error("Ação inválida.");
//         }
//     } finally {
//         lock.releaseLock();
//     }
// 
//     // Retorna uma resposta HTML com um script que se comunica com a página principal
//     const response = { success: true, message: resultMessage, type: 'reservationComplete' };
//     return ContentService.createTextOutput(
//       `<script>window.parent.postMessage(${JSON.stringify(response)}, '*');</script>`
//     ).setMimeType(ContentService.MimeType.HTML);
// 
//   } catch (error) {
//     // Retorna uma mensagem de erro para a página
//     const response = { success: false, error: error.message, type: 'reservationComplete' };
//     return ContentService.createTextOutput(
//       `<script>window.parent.postMessage(${JSON.stringify(response)}, '*');</script>`
//     ).setMimeType(ContentService.MimeType.HTML);
//   }
// }
//
*/

// Main JavaScript file

// PASSO 5: COLE A URL DO SEU APLICATIVO WEB AQUI
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzcciwVd0zArOxAF2BWTZfrCRnbsefSj-QIJNFNR5hdWYChW3sPbLHSeeEkE-uxAoXc/exec';

let itens = [];
let reservas = {};

// Funções para Google Sheets via Apps Script
async function carregarDados() {
    mostrarLoading();
    
    if (!WEB_APP_URL || WEB_APP_URL === 'COLOQUE_A_URL_DO_SEU_WEB_APP_AQUI') {
        console.warn("URL do Web App não configurada. Carregando lista de exemplo.");
        carregarListaPadrao();
        esconderLoading();
        return;
    }

    try {
        // Usar JSONP para evitar CORS
        await carregarDadosJSONP();
    } catch (error) {
        console.error('Erro ao carregar dados da planilha. Carregando lista de exemplo.', error);
        carregarListaPadrao();
    } finally {
        esconderLoading();
    }
}

function carregarDadosJSONP() {
    return new Promise((resolve, reject) => {
        // Criar um elemento script para JSONP
        const script = document.createElement('script');
        const callbackName = 'jsonpCallback_' + Date.now();
        
        // Definir a função de callback
        window[callbackName] = function(data) {
            // Limpar
            document.body.removeChild(script);
            delete window[callbackName];
            
            if (data.success) {
                itens = [];
                reservas = {};
                
                // Ignora a primeira linha (cabeçalho)
                const sheetData = data.data.slice(1);

                sheetData.forEach((row, index) => {
                    if (!Array.isArray(row) || row.length === 0) {
                        return; // Pula linhas nulas/vazias
                    }
                    const itemNome = row[0]; // Coluna A - Item
                    const reserva = row[1];  // Coluna B - Reserva
                    
                    if (itemNome) { // Processa apenas se o nome do item existir
                        try {
                            itens.push({
                                nome: itemNome,
                                icone: obterIcone(itemNome)
                            });
                        } catch (e) {
                            console.error(`Falha ao obter ícone para item: ${itemNome} na linha ${index + 2}`, e);
                        }
                        
                        if (reserva) {
                            reservas[itemNome] = reserva;
                        }
                    }
                });
                
                atualizarLista();
                resolve();
            } else {
                reject(new Error(data.error || 'Erro ao carregar dados da planilha'));
            }
        };
        
        // Configurar erro
        script.onerror = function() {
            document.body.removeChild(script);
            delete window[callbackName];
            reject(new Error('Falha ao carregar script de dados. Verifique a URL do Web App e as permissões da planilha.'));
        };
        
        // Adicionar o script à página
        script.src = `${WEB_APP_URL}?action=get&callback=${callbackName}`;
        document.body.appendChild(script);
    });
}

function carregarListaPadrao() {
    itens = [
        // Salgados
        { nome: "Torta de Frango", icone: "🥧" },
        { nome: "Empadão de Palmito", icone: "🥧" },
        { nome: "Quiche de Alho Poró", icone: "🥧" },
        { nome: "Mini Pão de Queijo", icone: "🧀" },
        { nome: "Mini Pizza", icone: "🍕" },
        { nome: "Mini Esfiha de Carne", icone: "🍕" },
        { nome: "Enroladinho de Salsicha", icone: "🌭" },
        { nome: "Cachorro Quente de Forno", icone: "🌭" },
        { nome: "Barquinhas com Maionese", icone: "⛵" },
        { nome: "Canapés", icone: "🥪" },
        { nome: "Patê com Torradas", icone: "🍞" },

        // Pratos Principais
        { nome: "Lasanha à Bolonhesa", icone: "🍝" },
        { nome: "Fricassé de Frango", icone: "🍲" },
        { nome: "Salpicão de Frango", icone: "🥗" },
        { nome: "Arroz de Forno", icone: "🍚" },
        { nome: "Carne Louca", icone: "🥩" },

        // Acompanhamentos
        { nome: "Salada de Maionese", icone: "🥔" },
        { nome: "Salada Tropical", icone: "🥭" },
        { nome: "Farofa", icone: "🥣" },
        { nome: "Arroz Branco", icone: "🍚" },

        // Sobremesas
        { nome: "Bolo de Chocolate com Morango", icone: "🎂" },
        { nome: "Bolo de Cenoura com Chocolate", icone: "🍰" },
        { nome: "Pudim de Leite Condensado", icone: "🍮" },
        { nome: "Mousse de Maracujá", icone: "🍮" },
        { nome: "Torta de Limão", icone: "🍋" },
        { nome: "Pavê de Chocolate", icone: "🍫" },
        { nome: "Salada de Frutas", icone: "🍓" },
        { nome: "Gelatina Colorida", icone: "🌈" },

        // Bebidas
        { nome: "Refrigerante 2L (Coca-Cola)", icone: "🥤" },
        { nome: "Refrigerante 2L (Guaraná)", icone: "🥤" },
        { nome: "Refrigerante 2L (Laranja)", icone: "🍊" },
        { nome: "Suco Natural de Laranja 2L", icone: "🧃" },
        { nome: "Suco Natural de Abacaxi 2L", icone: "🍍" },
        { nome: "Água Mineral com Gás 1.5L", icone: "💧" },
        { nome: "Água Mineral sem Gás 1.5L", icone: "💧" },
        { nome: "Cerveja (Pack com 6)", icone: "🍺" }
    ];
    reservas = {};
    atualizarLista();
}

function reservarItem(itemNome, nomePessoa) {
    console.log('Reservando item:', itemNome, 'para:', nomePessoa);
    
    // Criar um iframe oculto para enviar o formulário
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.name = 'reservationFrame';
    document.body.appendChild(iframe);
    
    // Criar um formulário para enviar os dados
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = WEB_APP_URL;
    form.target = iframe.name;
    
    // Adicionar campos
    const actionField = document.createElement('input');
    actionField.type = 'hidden';
    actionField.name = 'action';
    actionField.value = 'reserve';
    form.appendChild(actionField);
    
    const itemNameField = document.createElement('input');
    itemNameField.type = 'hidden';
    itemNameField.name = 'itemName';
    itemNameField.value = itemNome;
    form.appendChild(itemNameField);
    
    const reservedByField = document.createElement('input');
    reservedByField.type = 'hidden';
    reservedByField.name = 'reservedBy';
    reservedByField.value = nomePessoa;
    form.appendChild(reservedByField);
    
    const timestampField = document.createElement('input');
    timestampField.type = 'hidden';
    timestampField.name = 'timestamp';
    timestampField.value = new Date().toISOString();
    form.appendChild(timestampField);
    
    // Adicionar o formulário à página e submetê-lo
    document.body.appendChild(form);
    form.submit();
    
    // Remover o formulário após o envio
    setTimeout(() => {
        document.body.removeChild(form);
    }, 1000);
    
    // Configurar listener para mensagens do iframe
    const messageHandler = function(event) {
        // Verificar se a mensagem é do tipo esperado
        if (event.data && event.data.type === 'reservationComplete') {
            // Remover o listener
            window.removeEventListener('message', messageHandler);
            
            // Remover o iframe
            setTimeout(() => {
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
            }, 500);
            
            // Verificar se a operação foi bem-sucedida
            if (event.data.success) {
                // Recarregar a página para atualizar os dados
                alert(`"${itemNome}" reservado com sucesso para ${nomePessoa}!\n\nA página será recarregada.`);
                window.location.reload();
            } else {
                // Mostrar mensagem de erro
                alert('Erro ao processar a reserva: ' + (event.data.error || 'Erro desconhecido'));
                window.location.reload(); // Recarrega para re-habilitar o botão
            }
        }
    };
    
    // Adicionar o listener
    window.addEventListener('message', messageHandler);
    
    // Timeout para o caso de não receber resposta
    setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
        }
        // Recarregar a página mesmo sem confirmação
        window.location.reload();
    }, 8000);
}

function cancelarReservaItem(itemNome) {
    // Criar um iframe oculto para enviar o formulário
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.name = 'cancelFrame';
    document.body.appendChild(iframe);
    
    // Criar um formulário para enviar os dados
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = WEB_APP_URL;
    form.target = iframe.name;
    
    // Adicionar campos
    const actionField = document.createElement('input');
    actionField.type = 'hidden';
    actionField.name = 'action';
    actionField.value = 'cancel';
    form.appendChild(actionField);
    
    const itemNameField = document.createElement('input');
    itemNameField.type = 'hidden';
    itemNameField.name = 'itemName';
    itemNameField.value = itemNome;
    form.appendChild(itemNameField);
    
    const timestampField = document.createElement('input');
    timestampField.type = 'hidden';
    timestampField.name = 'timestamp';
    timestampField.value = new Date().toISOString();
    form.appendChild(timestampField);
    
    // Adicionar o formulário à página e submetê-lo
    document.body.appendChild(form);
    form.submit();
    
    // Remover o formulário após o envio
    setTimeout(() => {
        document.body.removeChild(form);
    }, 1000);
    
    // Configurar listener para mensagens do iframe
    const messageHandler = function(event) {
        // Verificar se a mensagem é do tipo esperado
        if (event.data && event.data.type === 'reservationComplete') {
            // Remover o listener
            window.removeEventListener('message', messageHandler);
            
            // Remover o iframe
            setTimeout(() => {
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
            }, 500);
            
            // Verificar se a operação foi bem-sucedida
            if (event.data.success) {
                // Recarregar a página para atualizar os dados
                alert(`Reserva de "${itemNome}" cancelada!\n\nA página será recarregada.`);
                window.location.reload();
            } else {
                // Mostrar mensagem de erro
                alert('Erro ao processar o cancelamento: ' + (event.data.error || 'Erro desconhecido'));
                 window.location.reload();
            }
        }
    };
    
    // Adicionar o listener
    window.addEventListener('message', messageHandler);
    
    // Timeout para o caso de não receber resposta
    setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
        }
        // Recarregar a página mesmo sem confirmação
        window.location.reload();
    }, 8000);
}

function obterIcone(itemNome) {
    // Padroniza o nome para a busca
    const nomePadronizado = itemNome ? String(itemNome).trim().toLowerCase() : '';

    // Mapeamento de Itens para Emojis
    const mapaEmojis = {
        // Salgados
        'torta de frango': '🥧',
        'empadão de palmito': '🥧',
        'quiche de alho poró': '🥧',
        'mini pão de queijo': '🧀',
        'mini pizza': '🍕',
        'mini esfiha de carne': '🍕',
        'enroladinho de salsicha': '🌭',
        'cachorro quente de forno': '🌭',
        'barquinhas com maionese': '⛵',
        'canapés': '🥪',
        'patê com torradas': '🍞',

        // Pratos Principais
        'lasanha à bolonhesa': '🍝',
        'fricassé de frango': '🍲',
        'salpicão de frango': '🥗',
        'arroz de forno': '🍚',
        'carne louca': '🥩',

        // Acompanhamentos
        'salada de maionese': '🥔',
        'salada tropical': '🥭',
        'farofa': '🥣',
        'arroz branco': '🍚',

        // Sobremesas
        'bolo de chocolate com morango': '🎂',
        'bolo de cenoura com chocolate': '🍰',
        'pudim de leite condensado': '🍮',
        'mousse de maracujá': '🍮',
        'torta de limão': '🍋',
        'pavê de chocolate': '🍫',
        'salada de frutas': '🍓',
        'gelatina colorida': '🌈',

        // Bebidas
        'refrigerante 2l (coca-cola)': '🥤',
        'refrigerante 2l (guaraná)': '🥤',
        'refrigerante 2l (laranja)': '🍊',
        'suco natural de laranja 2l': '🧃',
        'suco natural de abacaxi 2l': '🍍',
        'água mineral com gás 1.5l': '💧',
        'água mineral sem gás 1.5l': '💧',
        'cerveja (pack com 6)': '🍺'
    };

    // Emoji de Fallback (Ícone Padrão para itens desconhecidos)
    const emojiPadrao = '🍲';

    // Retorna o emoji mapeado ou o emoji padrão
    return mapaEmojis[nomePadronizado] || emojiPadrao;
}

// UI Functions
function mostrarLoading() {
    document.getElementById('loading-indicator').style.display = 'block';
    document.getElementById('lista').style.display = 'none';
}

function esconderLoading() {
    document.getElementById('loading-indicator').style.display = 'none';
    document.getElementById('lista').style.display = 'grid';
}

function atualizarLista() {
    const listaContainer = document.getElementById('lista');
    if (!listaContainer) return;

    listaContainer.innerHTML = '';
    
    if (itens.length === 0) {
        listaContainer.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Nenhum item encontrado na planilha. Siga as instruções no arquivo script.js para configurar.</p>';
        return;
    }

    itens.forEach((item, index) => {
        const itemElemento = document.createElement('div');
        
        // Verifica se o item está reservado
        const isReservado = reservas[item.nome];
        
        if (isReservado) {
            itemElemento.classList.add('item', 'reservado');
        } else {
            itemElemento.classList.add('item');
        }
        
        // Adiciona atributo data-item para facilitar a identificação
        itemElemento.setAttribute('data-item', item.nome);
        
        // Estrutura HTML conforme o CSS existente
        itemElemento.innerHTML = `
            <div class="item-icon">
                <span style="font-size: 1.5rem;">${item.icone}</span>
            </div>
            <h3>${item.nome}</h3>
            ${isReservado ? `
                <div class="reservado-info">
                    Reservado por: ${reservas[item.nome]}
                </div>
                <button class="cancelar-btn" onclick="cancelarReserva('${item.nome}')">
                    Cancelar Reserva
                </button>
            ` : `
                <input type="text" id="nome-${index}" placeholder="Seu nome" aria-label="Seu nome para reservar ${item.nome}">
                <button onclick="reservar('${item.nome}', ${index})">
                    Reservar
                </button>
            `}
        `;
        
        listaContainer.appendChild(itemElemento);
    });
}

function reservar(itemNome, index) {
    const nomeInput = document.getElementById(`nome-${index}`);
    const nome = nomeInput.value.trim();
    
    if (!nome) {
        alert("Digite seu nome para reservar.");
        nomeInput.focus();
        return;
    }
    
    if (nome.length < 2) {
        alert("Digite um nome válido (pelo menos 2 caracteres).");
        nomeInput.focus();
        return;
    }
    
    // Desabilitar botão durante o processamento
    const button = nomeInput.nextElementSibling;
    const originalText = button.textContent;
    button.textContent = 'Reservando...';
    button.disabled = true;
    nomeInput.disabled = true;
    
    // Fazer a reserva
    reservarItem(itemNome, nome);
}

function cancelarReserva(itemNome) {
    const nomeReservado = reservas[itemNome];
    const confirmacao = confirm(`Cancelar reserva de "${itemNome}" por ${nomeReservado}?`);
    
    if (!confirmacao) return;
    
    const button = document.querySelector(`[data-item="${itemNome}"] .cancelar-btn`);
    if (button) {
        const originalText = button.textContent;
        button.textContent = 'Cancelando...';
        button.disabled = true;
    }
    
    // Cancelar a reserva
    cancelarReservaItem(itemNome);
}

// Inicialização
async function inicializar() {
    await carregarDados();
}

// Tornar funções globais
window.reservar = reservar;
window.cancelarReserva = cancelarReserva;

// Iniciar quando a página carregar
document.addEventListener('DOMContentLoaded', inicializar);

// Suporte a Enter nos campos de texto
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.target.type === 'text') {
        const id = e.target.id;
        if (id.startsWith('nome-')) {
            const index = parseInt(id.split('-')[1]);
            const itemNome = itens[index]?.nome;
            if (itemNome) {
                reservar(itemNome, index);
            }
        }
    }
});
