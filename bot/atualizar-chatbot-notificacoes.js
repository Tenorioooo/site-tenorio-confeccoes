const fs = require('fs');
const path = require('path');

const CAMINHO_CONFIG_NOTIFICACOES = path.join(__dirname, 'configNotificacoes.json');
if (!fs.existsSync(CAMINHO_CONFIG_NOTIFICACOES)) {
  fs.writeFileSync(
    CAMINHO_CONFIG_NOTIFICACOES,
    JSON.stringify(
      {
        adminPhone: '',
        notificarAtendimentoHumano: true,
        notificarNovoOrcamento: true,
        notificarPushWeb: true,
        siteApiUrl: 'https://www.tenorioconfeccoes.shop/api/notifications/send'
      },
      null,
      2
    ),
    'utf-8'
  );
  console.log('✅ configNotificacoes.json criado com sucesso!');
}
