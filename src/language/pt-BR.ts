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
        missingPositionalArgument: 'Um ou mais argumentos estão faltando\n\nTente `{command} -h` ou `{command} --help`',
        invalidArgument: 'Argumento inválido\n\nTente `{command} -h` ou `{command} --help`',
      },
      interaction: {
        notFound: 'Esta interação não está mais disponível.\nTalvez você tenha demorado muito para responder?',
        noMessage: 'A mensagem relacionada a esta interaçào não foi encontrada ou não está mais disponível.',
      },
    },
    succ: {
      command: 'Tudo certo!',
    },
    or: 'ou',
    everyone: 'Todo mundo',
  },
  command: {
    help: {
      defaultArgument: 'Exibe esta mensagem de ajuda.',
      arguments: 'Argumentos',
      positionalArguments: 'Argumentos posicionais',
      permissions: 'Permissões necessárias',
      roles: 'Cargos permitidos',
      aliases: 'Sinônimos',
      examples: 'Exemplos',
      description: 'Descrição',
      cooldown: 'Cooldown',
      usage: 'Uso',
      name: 'Nome',
      category: 'Categoria',
      command: 'Comando',
      title: 'Ajuda',
      content:
        '```ahk\n-f --flag: ;Flag obrigatória\n-f --flag  ;Flag opcional\n\n<argumento>: ;Argumento obrigatório\n[argumento]  ;Argumento opcional\```',
      menu: {
        title: 'Ajuda',
        content: '**Dica**:\nUtilize `-h` para ver instruçòes detalhadas sobre um comando.\nex: `{prefix}ping -h` ou `{prefix}ping --help`',
        description: 'Exibe uma lista de comandos disponíveis.',
      }
    },
    ping: {
      reply: '🏓 Pong!\n\nPing: **{latency}ms**\nComando processado em: **{processing}ms**',
      description: 'Retorna o ping (latência) e tempo de processamento por comando do bot.',
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
      add: {
        succ: '🔑 **{keyword}** adicionada com sucesso!',
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
        noKeywords: '😥 Nenhuma palavra-chave registrada',
      },
    },
    response: {
      args: {
        action: 'Response to send when the keyword is detected [only required for the "add" action]',
      },
    },
    translateerror: {
      err: {
        noMessageReference: 'Não encontrei a mensagem de erro.\n\nCertifique-se de rodar este comando como resposta a uma mensagem reportando um erro.',
        referenceMessageNotError: 'A mensagem referenciada não é uma mensagem de erro.\n\nCertifique-se de rodar este comando como resposta a uma mensagem reportando um erro.',
      },
      description: 'Traduz uma mensagem de erro, extraindo os campos',
    },
    animeupdate: {
      description: 'Identifica a fonte, busca e atualiza informações de um anime no Anima.',
      usage: 'https://animeprovider.tld/anime/path ou 1',
      args: {
        anime: 'Link para o anime na source ou ID do anime no Anima.',
      },
      err: {
        invalidAnime: 'Anime inválido. Verifique se o link está correto ou se o ID é válido.',
        fail: 'Falha ao atualizar anime.',
        failToFetch: 'Falha ao obter dados do anime atualizado.'
      },
      state: {
        start: 'Atualizando anime.',
        succeeded: 'Episódios processados com sucesso: {succeeded}',
        failed: 'Episódios não processados: {failed}',
      },
      embed: {
        categories: 'Gêneros',
        episodes: 'Processados',
        failedEpisodes: 'Ignorados',
        succeededEpisodes: 'Atualizados',
      }
    },
    reportError: {
      description: 'Reporta um erro para a midori e sinaliza os desenvolvedores.',
      usage: 'dW0gZXhlbXBsbyBkZSBlcnJvIGFxdWksIHPDsyBwcmEgcG9yIG5vIHVzYWdlcw==',
      args: {
        error: 'Código de erro gerado pelas aplicações do Anima.'
      },
      err: {
        noError: 'Não consegui identificar o erro reportado',
        alreadyReported: 'Este anime já foi reportado nos últimos 10 minutos.',
        invalidAnime: 'Anime inválido. Verifique se o link está correto ou se o ID é válido.',
      },
      state: {
        start: 'Erro identificado, buscando recusos para anime:\n{anime}'
      }
    },
    clear: {
      description: 'Limpa mensagens do chat.',
      usage: '10',
      args: {
        amount: 'Quantidade de mensagens a serem apagadas.',
      },
      err: {
        invalidAmount: 'Quantidade inválida. O valor deve ser um número inteiro entre 1 e 100.',
        unknown: 'Erro desconhecido ao tentar apagar mensagens.\n\nObs: o discord não permite apagar mensagens com mais de 14 dias de existência.',
      }
    }
  },
  category: {
    generic: '📦 Genérico',
    moderation: '🛡️ Moderação',
    utility: '⚒️ Utilidade',
    fun: '🎈 Diversão',
    anima: '🚀 Anima',
    native: '📦 Core',
    undefined: '🚧 Sem categoria'
  },
  permission: {
    CREATE_INSTANT_INVITE: 'Criar convite instantâneo',
    KICK_MEMBERS: 'Expulsar membros',
    BAN_MEMBERS: 'Banir membros',
    ADMINISTRATOR: 'Administrador',
    MANAGE_CHANNELS: 'Gerenciar canais',
    MANAGE_GUILD: 'Gerenciar servidor',
    ADD_REACTIONS: 'Adicionar reações',
    VIEW_AUDIT_LOG: 'Ver registro de auditoria',
    PRIORITY_SPEAKER: 'Orador prioritário',
    STREAM: 'Transmitir',
    VIEW_CHANNEL: 'Ver canal',
    SEND_MESSAGES: 'Enviar mensagens',
    SEND_TTS_MESSAGES: 'Enviar mensagens de texto para fala',
    MANAGE_MESSAGES: 'Gerenciar mensagens',
    EMBED_LINKS: 'Inserir links',
    ATTACH_FILES: 'Anexar arquivos',
    READ_MESSAGE_HISTORY: 'Ler histórico de mensagens',
    MENTION_EVERYONE: 'Mencionar todos',
    USE_EXTERNAL_EMOJIS: 'Usar emojis externos',
    VIEW_GUILD_INSIGHTS: 'Ver análise do servidor',
    CONNECT: 'Conectar',
    SPEAK: 'Falar',
    MUTE_MEMBERS: 'Silenciar membros',
    DEAFEN_MEMBERS: 'Ensurdecer membros',
    MOVE_MEMBERS: 'Mover membros',
    USE_VAD: 'Usar detecção de voz',
    CHANGE_NICKNAME: 'Alterar apelido',
    MANAGE_NICKNAMES: 'Gerenciar apelidos',
    MANAGE_ROLES: 'Gerenciar cargos',
    MANAGE_WEBHOOKS: 'Gerenciar webhooks',
    MANAGE_EMOJIS_AND_STICKERS: 'Gerenciar emojis e stickers',
    USE_APPLICATION_COMMANDS: 'Usar comandos de aplicativo',
    REQUEST_TO_SPEAK: 'Pedir para falar',
    MANAGE_THREADS: 'Gerenciar threads',
    USE_PUBLIC_THREADS: 'Usar threads públicas',
    USE_PRIVATE_THREADS: 'Usar threads privadas',
    USE_EXTERNAL_STICKERS: 'Usar stickers externos',
    SEND_MESSAGES_IN_THREADS: 'Enviar mensagens em threads',
    START_EMBEDDED_ACTIVITIES: 'Iniciar atividades incorporadas',
    MODERATE_MEMBERS: 'Moderar membros',
  },
  pagination: {
    next: 'Próximo',
    previous: 'Voltar',
  },
}
