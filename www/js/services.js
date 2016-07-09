'use strict';

angular.module('easydent.services', [])

.service('AuthService', function($q, $http, $window, Base64, SERVER) {

	var URL_LOGIN = SERVER.url + '/login';
	var LOCAL_TOKEN_KEY = 'easydent-token';
	var username = '';
	var isAuthenticated = false;
	var role = '';
	var authToken;
	var codigoEstabelecimento = '';

	function loadUserCredentials() {
		var token = angular.fromJson($window.localStorage.getItem(LOCAL_TOKEN_KEY));
		if (token) {
			useCredentials(token);
		}
	}

	function storeUserCredentials(tokenInfo) {
		$window.localStorage.setItem(LOCAL_TOKEN_KEY, angular.toJson(tokenInfo));
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
    	$window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    }

    var login = function(name, pw) {
    	var authorization = 'Basic ' + Base64.encode(name + ':' + pw);
    	return $q(function(resolve, reject) {
    		$http.get(URL_LOGIN, {
    			headers: {
    				'Authorization': authorization
    			}
    		}).then(
    		function(response) {
    			storeUserCredentials(response.data);
    			resolve('Login sucessful.');
    		},
    		function(error) {
    			destroyUserCredentials();
    			reject(error.status);
    		});
    	});
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
    	},
    	token: function() {
    		authToken;
    	}
    };
})

.service('LoginService', function() {

})

.service('UsuarioService', function($http, SERVER) {

	return {
		criarUsuario: function(novoUsuario) {
			return $http.post(SERVER.url + '/usuarios', novoUsuario);
		}
	};

})

.service('TimeUtil', function () {

	var getDateNextTimeStep = function (date, step) {

		var minutes = date.getMinutes();
		var diff = minutes%step;

		// Se o momento já está no step, não altera a data
		if (diff === 0) {
			return date;
		}

		if (minutes<step) {
			date.setMinutes(step);
			return date;
		}

		minutes += step-diff;

		if (minutes < 60) {
			date.setMinutes(minutes);
			return date;
		}

		date.setMinutes(0);
		date.setHours(date.getHours() + 1);
		return date;

	};

	return {

		getDateNextTimeStep: getDateNextTimeStep,
		
	};


})

.factory('Base64', function($window) {
	/* jshint ignore:start */

	var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

	return {
		encode: function(input) {
			var output = '';
			var chr1, chr2, chr3 = '';
			var enc1, enc2, enc3, enc4 = '';
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
				chr1 = chr2 = chr3 = '';
				enc1 = enc2 = enc3 = enc4 = '';
			} while (i < input.length);

			return output;
		},

		decode: function(input) {
			var output = '';
			var chr1, chr2, chr3 = '';
			var enc1, enc2, enc3, enc4 = '';
			var i = 0;

      // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
      var base64test = /[^A-Za-z0-9\+\/\=]/g;
      if (base64test.exec(input)) {
      	$window.alert('There were invalid base64 characters in the input text.\n' +
      		'Valid base64 characters are A-Z, a-z, 0-9, \'+\', \'/\',and \'=\'\n' +
      		'Expect errors in decoding.');
      }
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

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

      	chr1 = chr2 = chr3 = '';
      	enc1 = enc2 = enc3 = enc4 = '';

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
		return $http.get(SERVER.url + '/pacientes?sort=' + sort + '&max-results=' + maxResults + '&offset=' + offset);
	};

	var buscar = function(id) {
		return $http.get(SERVER.url + '/pacientes/' + id);
	};

	var salvar = function(paciente) {
		return $http.post(SERVER.url + '/pacientes/', paciente);
	};

	var excluir = function(id) {
		return $http.delete(SERVER.url + '/pacientes/' + id);
	};

	return {
		todos: listar,
		buscar: buscar,
		salvar: salvar,
		excluir: excluir
	};

})

.service('Dentistas', function($http, $rootScope, $stateParams, SERVER) {
	return {
		todos: function() {
			return $http.get(SERVER.url + '/dentistas?sort=nome');
		},
		horariosDisponiveis: function(dentistaId, data) {
			var ano = data.getYear() + 1900;
			var mes = data.getMonth() + 1;
			var dia = data.getDay();
			return $http.get(SERVER.url + '/dentistas/' + dentistaId + '/horariosdisponiveis/'+ ano + '/'+  mes +'/'+ dia);
		},
		excluir: function (id) {
			return $http.delete(SERVER.url + '/dentistas/' + id);
		},
		buscar: function (id) {
			return $http.get(SERVER.url + '/dentistas/' + id);
		},
		salvar: function (dentista) {
			return $http.post(SERVER.url + '/dentistas', dentista);
		}
	};
})

.service('Laboratorios', function($http, $rootScope, $stateParams, SERVER) {
	return {
		todos: function() {
			return $http.get(SERVER.url + '/laboratorios');
		},
		excluir: function (id) {
			return $http.delete(SERVER.url + '/laboratorios/' + id);
		},
		buscar: function (id) {
			return $http.get(SERVER.url + '/laboratorios/' + id);
		},
		salvar: function (laboratorio) {
			return $http.post(SERVER.url + '/laboratorios', laboratorio);
		}
	};
})

.service('Pendencias', function($http, $rootScope, $stateParams, SERVER) {
	return {
		todas: function() {
			return $http.get(SERVER.url + '/pendencias');
		}
	};
})

.service('CalendarService', function() {

	var dataCalendario;

	return {
		dataCalendario: dataCalendario,
	};
})

.service('Agendamentos', function($http, SERVER) {
	return {

		salvar: function (agendamento) {
			return $http.post(SERVER.url + '/consultas', agendamento);
		},

		buscar: function (id) {
			return $http.get(SERVER.url + '/consultas/' + id);
		},

		todos: function(dataFiltro) {
			return $http.get(SERVER.url + '/consultas');
		},

		proximos: function(quantidade) {
			if (!quantidade) {
				$log.error('Não foi especificada quantidade na busca das próximas consultas! ');
			}
			return $http.get(SERVER.url + '/consultas/proximas/' + quantidade + '?sort=data');
		},

		ultimos: function (quantidade) {
			if (!quantidade) {
				$log.error('Não foi especificada quantidade na busca das últimas consultas! ');
			}
			return $http.get(SERVER.url + '/consultas/ultimasnaorespondidas/' + quantidade + '?sort=data+DESC');
		},

		buscarNoPeriodo: function (inicio, fim) {
			var anoInicio = inicio.getFullYear();
			var mesInicio = inicio.getMonth() + 1;
			var diaInicio = inicio.getDate();
			var anoFim = fim.getYear() + 1900;
			var mesFim = fim.getMonth() + 1;
			var diaFim = fim.getDate();
			return $http.get(SERVER.url + '/consultas/de/'+anoInicio+'/'+mesInicio+'/'+diaInicio+'/ate/'+anoFim+'/'+mesFim+'/'+diaFim);
		},

		converterAgendamentos: function(agendamentos) {
			var agendamentosConvertidos = [];
			for (var i = 0; i < agendamentos.length; i++) {
				var agendamento = agendamentos[i];
				var convertido = {};

				convertido.id = agendamento.id;
				convertido.dentista = agendamento.dentista;
				convertido.paciente = agendamento.paciente;
				convertido.procedimento = agendamento.procedimento;

				convertido.title = agendamento.paciente.nome + ' - ' + agendamento.procedimento;
				convertido.startTime = new Date(agendamento.data);
				convertido.endTime = new Date(agendamento.data + (agendamento.duracaoMinutos * 60000));
				convertido.allDay = agendamento.diaCompleto;

				agendamentosConvertidos.push(convertido);
			}
			return agendamentosConvertidos;
		}

	};
})

.service('Util', function () {
	return {

		clone: function (obj) {
			if (obj === null || angular.isObject(obj) !== 'object' || 'isActiveClone' in obj) {
				return obj;
			}

			if (obj instanceof Date) {
	        	var temp = new obj.constructor(); //or new Date(obj);
	        } else {
	        	var temp = obj.constructor();
	        }

	        for (var key in obj) {
	        	if (Object.prototype.hasOwnProperty.call(obj, key)) {
	        		obj['isActiveClone'] = null;
	        		temp[key] = clone(obj[key]);
	        		delete obj['isActiveClone'];
	        	}
	        }

	        return temp;
	    },
	    
	};
});