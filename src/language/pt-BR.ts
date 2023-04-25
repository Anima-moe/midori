export default {
  generic: {
    mention: '👋 Meu prefixo é `{prefix}`\n\nTente utilizar `{prefix}help` para ver meus comandos',
    err: {
      command: {
        coolDown: 'Você está em cooldown, tente novamente em {time}.',
        unknown: 'Ocorreu um erro ao executar o comando.',
        noPermissions: 'Você não tem permissão para executar este comando.',
        noRoles: 'Você não tem permissão para executar este comando.',
        missingArgument: 'Um ou mais argumentos estão faltando\n\nTente `{command} -h` ou `{command} --help`',
        missingPositionalArgument: 'Um ou mais argumentos estão faltando **{argument}**\n\nTente `{command} -h` ou `{command} --help',
        invalidArgument: 'Argumento inválido\n\nTente `{command} -h` ou `{command} --help`',
      },
    },
    succ: {
      command: 'Tudo certo!',
    }
  },
  command: {
    help: {
      defaultArgument: 'Exibe esta mensagem de ajuda.',
      arguments: 'Argumentos',
      permissions: '🔑 Permissões',
      aliases: '🪴 Aliases',
      examples: 'Exemplos',
      description: 'Descrição',
      cooldown: '⏳ Cooldown',
      usage: '🛡️ Uso',
      name: 'Nome',
    },
    ping: {
      reply: '🏓 Pong!\n\nPing: **{latency}ms**\nComando processado em: **{processing}ms**',
      description: 'Retorna o ping (latência) e tempo de processamento por comando do bot.'
    },
    keyword: {
      description: 'Gerencia palavras-chave para respostas automáticas.',
      longDescription: 'Adiciona, remove ou lista palavras-chave para respostas automáticas.',
      args: {
        action: 'Ação a ser realizada na palavra-chave.\n;Ações disponíveis: "add", "remove", "list"',
        keyword: 'Frase/palavra-chave a ser adicionada/removida\n;[necessário apenas para as ações "add" e "remove"]',
        response: 'Resposta a ser enviada quando a palavra-chave for acionada\n;[necessário apenas para a ação "add"]',
        locale: 'Idioma da palavra-chave\n;[deifinida como pt-BR se omitida]',
      },
      tips: {
        noArgsOnList: '💡 Dica! Você não precisa dos arguments `-k` nem `-r` para listar.',
        noResponseOnList: '💡 Dica! Você não precisa do argument `-r` para remover uma palavra chave.',
      },
      list: {
        title: '📦 Palavras-chave registradas',
      },
      remove: {
        succ: '🗑️ **{keyword}** removida com sucesso!',
      },
      generic: {
        keyword: '🔑 Palavra-chave',
        response: '🔒 Resposta',
        locale: '🌐 Idioma',
      },
      err: {
        noKeywords: '😥 Nenhuma palavra-chave registrada'
      },

    },
    response: {
      args: {
        action: 'Response to send when the keyword is detected [only required for the "add" action]',
      }
    }
  },
  permission: {
    CREATE_INSTANT_INVITE: "Criar convite instantâneo",
    KICK_MEMBERS: "Expulsar membros",
    BAN_MEMBERS: "Banir membros",
    ADMINISTRATOR: "Administrador",
    MANAGE_CHANNELS: "Gerenciar canais",
    MANAGE_GUILD: "Gerenciar servidor",
    ADD_REACTIONS: "Adicionar reações",
    VIEW_AUDIT_LOG: "Ver registro de auditoria",
    PRIORITY_SPEAKER: "Orador prioritário",
    STREAM: "Transmitir",
    VIEW_CHANNEL: "Ver canal",
    SEND_MESSAGES: "Enviar mensagens",
    SEND_TTS_MESSAGES: "Enviar mensagens de texto para fala",
    MANAGE_MESSAGES: "Gerenciar mensagens",
    EMBED_LINKS: "Inserir links",
    ATTACH_FILES: "Anexar arquivos",
    READ_MESSAGE_HISTORY: "Ler histórico de mensagens",
    MENTION_EVERYONE: "Mencionar todos",
    USE_EXTERNAL_EMOJIS: "Usar emojis externos",
    VIEW_GUILD_INSIGHTS: "Ver análise do servidor",
    CONNECT: "Conectar",
    SPEAK: "Falar",
    MUTE_MEMBERS: "Silenciar membros",
    DEAFEN_MEMBERS: "Ensurdecer membros",
    MOVE_MEMBERS: "Mover membros",
    USE_VAD: "Usar detecção de voz",
    CHANGE_NICKNAME: "Alterar apelido",
    MANAGE_NICKNAMES: "Gerenciar apelidos",
    MANAGE_ROLES: "Gerenciar cargos",
    MANAGE_WEBHOOKS: "Gerenciar webhooks",
    MANAGE_EMOJIS_AND_STICKERS: "Gerenciar emojis e stickers",
    USE_APPLICATION_COMMANDS: "Usar comandos de aplicativo",
    REQUEST_TO_SPEAK: "Pedir para falar",
    MANAGE_THREADS: "Gerenciar threads",
    USE_PUBLIC_THREADS: "Usar threads públicas",
    USE_PRIVATE_THREADS: "Usar threads privadas",
    USE_EXTERNAL_STICKERS: "Usar stickers externos",
    SEND_MESSAGES_IN_THREADS: "Enviar mensagens em threads",
    START_EMBEDDED_ACTIVITIES: "Iniciar atividades incorporadas",
    MODERATE_MEMBERS: "Moderar membros",
  }
}
