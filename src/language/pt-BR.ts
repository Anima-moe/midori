export default {
  generic: {},
  error: {
    command: {
      coolDown: 'Você está em cooldown, tente novamente em {time}.',
      generic: 'Ocorreu um erro ao executar o comando.',
    }
  },
  commands: {
    help: {
      mention: '👋 Meu prefixo é {prefix}, tente utilizar {prefix}help .',
    },
    ping: {
      pong: 'Pong! {latency}ms',
    }
  },
}
