"use strict";

angular.module('easydent.services', [])

.service('Pacientes', function($http, $rootScope, $stateParams) {
  return {
    todos: function(sort, maxResults, offset) {
      sort = sort || 'nome';
      maxResults = maxResults || 0;
      offset = offset || 0;
      return $http.get('http://localhost:8080/easydent-server/rest/pacientes?sort=' + sort + "&max-results=" + maxResults + "&offset=" + offset, {
        timeout: 5000
      })
    },
    buscar: function(id) {
      return $http.get('http://localhost:8080/easydent-server/rest/pacientes/' + id)
    },
    salvar: function(paciente) {
      return $http.post('http://localhost:8080/easydent-server/rest/pacientes/', paciente)
    },
    excluir: function(id) {
      return $http.delete('http://localhost:8080/easydent-server/rest/pacientes/' + id)
    }
  }
})

.service('Login', function ($http) {
  return {
    
  }
})

.service('Dentistas', function($http, $rootScope, $stateParams) {
  return {
    todos: function() {
      return $http.get('https://easydent.jelasticlw.com.br/easydent-webservice/rest/dentistas?sort=nome')
    }
  }
})

.service('Consultas', function($http, $rootScope, $stateParams) {
  return {
    todas: function() {
      return $http.get('https://easydent.jelasticlw.com.br/easydent-webservice/rest/consultas')
    }
  }
})

.service('Laboratorios', function($http, $rootScope, $stateParams) {
  return {
    todos: function() {
      return $http.get('https://easydent.jelasticlw.com.br/easydent-webservice/rest/laboratorios')
    }
  }
})

.service('Pendencias', function($http, $rootScope, $stateParams) {
  return {
    todas: function() {
      return $http.get('https://easydent.jelasticlw.com.br/easydent-webservice/rest/pendencias')
    }
  }
})

.service('Agendamentos', function($http) {
  return {
    todos: function(dataFiltro) {
      return $http.get('https://easydent.jelasticlw.com.br/easydent-webservice/rest/consultas')
    },

    converterAgendamentos: function(agendamentos) {
      var agendamentosConvertidos = [];
      for (var i = 0; i < agendamentos.length; i++) {
        var agendamento = agendamentos[i];
        var convertido = {};
        convertido.title = agendamento.dentista.nome + ' - ' + agendamento.paciente.nome + ' - ' + agendamento.procedimento;
        convertido.startTime = new Date(agendamento.data);
        convertido.endTime = new Date(agendamento.data + (agendamento.duracaoMinutos * 60000));
        convertido.allDay = agendamento.diaCompleto;
        agendamentosConvertidos.push(convertido);
      }
      return agendamentosConvertidos;
    }

  }
})

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});
