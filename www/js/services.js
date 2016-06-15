"use strict";

angular.module('easydent.services', [])

.service('AuthService', function($q, $http, Base64, SERVER) {

  var URL_LOGIN = SERVER.url + "/login";
  var LOCAL_TOKEN_KEY = 'easydent-token';
  var username = '';
  var isAuthenticated = false;
  var role = '';
  var authToken;
  var codigoEstabelecimento = '';

  function loadUserCredentials() {
    var token = JSON.parse(window.localStorage.getItem(LOCAL_TOKEN_KEY));
    if (token) {
      useCredentials(token);
    }
  }

  function storeUserCredentials(tokenInfo) {
    window.localStorage.setItem(LOCAL_TOKEN_KEY, JSON.stringify(tokenInfo));
    useCredentials(tokenInfo);
  }

  function useCredentials(tokenInfo) {

    isAuthenticated = true;

    username = tokenInfo.nomeUsuario;
    authToken = tokenInfo.token;
    role = tokenInfo.perfilUsuario;
    codigoEstabelecimento = tokenInfo.estabelecimento;

    // Set the token as header for your requests!
    $http.defaults.headers.common['X-Auth-Token'] = authToken;
  }

  function destroyUserCredentials() {
    authToken = undefined;
    username = '';
    codigoEstabelecimento = '';
    isAuthenticated = false;
    $http.defaults.headers.common['X-Auth-Token'] = undefined;
    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
  }

  var login = function(name, pw) {
    var authorization = "Basic " + Base64.encode(name + ":" + pw);
    return $http.get(URL_LOGIN, {
      headers: {
        "Authorization": authorization
      }
    }).then(
      function(response) {
        storeUserCredentials(response.data);
      },
      function(error) {
        destroyUserCredentials();
      })
  };

  var logout = function() {
    destroyUserCredentials();
  };

  var isAuthorized = function(authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (isAuthenticated && authorizedRoles.indexOf(role) !== -1);
  };

  loadUserCredentials();

  return {
    entrar: login,
    logout: logout,
    isAuthorized: isAuthorized,
    isAuthenticated: function() {
      return isAuthenticated;
    },
    username: function() {
      return username;
    },
    role: function() {
      return role;
    }
  };
})

.factory('Base64', function() {
  /* jshint ignore:start */

  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  return {
    encode: function(input) {
      var output = "";
      var chr1, chr2, chr3 = "";
      var enc1, enc2, enc3, enc4 = "";
      var i = 0;

      do {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }

        output = output +
          keyStr.charAt(enc1) +
          keyStr.charAt(enc2) +
          keyStr.charAt(enc3) +
          keyStr.charAt(enc4);
        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";
      } while (i < input.length);

      return output;
    },

    decode: function(input) {
      var output = "";
      var chr1, chr2, chr3 = "";
      var enc1, enc2, enc3, enc4 = "";
      var i = 0;

      // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
      var base64test = /[^A-Za-z0-9\+\/\=]/g;
      if (base64test.exec(input)) {
        window.alert("There were invalid base64 characters in the input text.\n" +
          "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
          "Expect errors in decoding.");
      }
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

      do {
        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
          output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
          output = output + String.fromCharCode(chr3);
        }

        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";

      } while (i < input.length);

      return output;
    }
  };

  /* jshint ignore:end */
})

.service('Pacientes', function($http, $rootScope, $stateParams, SERVER) {

  var listar = function(sort, maxResults, offset) {
    sort = sort || 'nome';
    maxResults = maxResults || 0;
    offset = offset || 0;
    return $http.get(SERVER.url + '/pacientes?sort=' + sort + "&max-results=" + maxResults + "&offset=" + offset)
  };

  var buscar = function(id) {
    return $http.get(SERVER.url + '/pacientes/' + id)
  };

  var salvar = function(paciente) {
    return $http.post(SERVER.url + '/pacientes/', paciente)
  };

  var excluir = function(id) {
    return $http.delete(SERVER.url + '/pacientes/' + id)
  };

  return {
    todos: listar,
    buscar: buscar,
    salvar: salvar,
    excluir: excluir
  };

})

.service('Login', function($http) {
  return {

  }
})

.service('Dentistas', function($http, $rootScope, $stateParams, SERVER) {
  return {
    todos: function() {
      return $http.get(SERVER.url + '/dentistas?sort=nome')
    }
  }
})

.service('Consultas', function($http, $rootScope, $stateParams, SERVER) {
  return {
    todas: function() {
      return $http.get(SERVER.url + '/consultas')
    }
  }
})

.service('Laboratorios', function($http, $rootScope, $stateParams, SERVER) {
  return {
    todos: function() {
      return $http.get(SERVER.url + '/laboratorios')
    }
  }
})

.service('Pendencias', function($http, $rootScope, $stateParams, SERVER) {
  return {
    todas: function() {
      return $http.get(SERVER.url + '/pendencias')
    }
  }
})

.service('Agendamentos', function($http, SERVER) {
  return {
    todos: function(dataFiltro) {
      return $http.get(SERVER.url + '/consultas')
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
});
