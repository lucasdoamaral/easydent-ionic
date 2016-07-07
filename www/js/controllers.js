"use strict";

 angular.module('easydent.controllers', [])

 .controller('TesteCtrl', function($scope){
 	$scope.variavel = "Testando"
 })

 .controller('AppCtrl', function($scope, $state, $ionicPopup, AuthService, AUTH_EVENTS) {

 	$scope.$on(AUTH_EVENTS.notAuthorized, function(event) {
 		var alertPopup = $ionicPopup.alert({
 			title: 'Acesso Não Autorizado',
 			template: 'Ops! Você não tem permissão para acessar essas informações',
 			buttons: [{
 				text: 'OK',
 				type: 'button-balanced',
 			}]
 		});
 	});

 	$scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
 		if (AuthService.isAuthenticated()) {
 			AuthService.logout();
 			$state.go('login');
 			var alertPopup = $ionicPopup.alert({
 				title: 'Sessão Expirada',
 				template: 'Faça o login novamente',
 				buttons: [{
 					text: 'OK',
 					type: 'button-balanced',
 				}]
 			});
 		}
 	});

 })

 .controller('ConfiguracoesCtrl', function ($scope, AuthService, $state) {

 	$scope.sair = function() {
 		AuthService.logout();
 		$state.go('login');
 	}

 })

 .controller('SignupCtrl', function($scope, UsuarioService, $state, $ionicPopup) {

 	$scope.novoUsuario = {
 		"fgTipoUsuario": 4,
 	};
 	$scope.novoEstabelecimento = {
 		nome: "Estabelecimento sem nome",
 	};

 	$scope.criarUsuario = function(novoUsuario, novoEstabelecimento) {

		// Validar senha e confirmação de senha
		if (novoUsuario.senha !== novoUsuario.confirmacaoSenha) {
			$ionicPopup.alert({
				title: 'Erro',
				template: 'A senha e a confirmação não conferem'
			});
			return;
		}

		novoUsuario.estabelecimento = novoEstabelecimento;
		UsuarioService.criarUsuario(novoUsuario).then(
			function() {
				$state.go('login');
			},
			function(error) {
				$ionicPopup.alert({
					title: 'Erro',
					template: error,
				});
			});
	}

	function teste () {
		console.log("Signup");
	}

	teste();

})

 .controller('NovoAgendamentoCtrl', function($scope, $state, $ionicLoading, $ionicPopup, $ionicHistory, ionicDatePicker, Agendamentos, Dentistas, Pacientes, CalendarService ) {

 	var dataAgendamento = CalendarService.dataCalendario;

 	var listaDentistas = [];
 	var listaPacientes = [];
 	var listaHorariosDisponiveis = [];

 	function createEmptyAgendamento ()  {
 		return {
 			dentista: undefined,
 			paciente: undefined,
 			data: dataAgendamento,
 			duracaoMinutos: 30,
 			diaCompleto: false,
 			agenda: undefined
 		}
 	};

 	function carregarPacientes () {
 		$ionicLoading.show({
 			template: "Loading..."
 		});
 		Pacientes.todos().then(
 			function(response) {
 				$scope.pacientes = response.data;
 				$ionicLoading.hide();
 			}, 
 			function () {
 				console.error('carregarPacientes');
 				$ionicLoading.hide();
 			});
 	}

 	function carregarDentistas () {
 		Dentistas.todos().then(
 			function(response) {
 				$scope.dentistas = response.data;
 			}, 
 			function () {
 				console.error('carregarDentistas');
 			});
 	}

 	function carregarHorariosDisponiveis (agendamento) {
 		$scope.listaHorariosDisponiveis = [];
 		if (agendamento && agendamento.dentista && agendamento.data) {
 			Dentistas.horariosDisponiveis(0, agendamento.data).then(
 				function (response){
 					$scope.listaHorariosDisponiveis = response.data;
 				}, function (error){
 					$scope.listaHorariosDisponiveis = [];
 				})	
 		}
 	}

 	$scope.carregarHorariosDisponiveis = carregarHorariosDisponiveis;

 	$scope.novoAgendamento = createEmptyAgendamento();
 	$scope.pacientesCallback = function (query, isInitializing) {

 	}

 	$scope.showDatePicker = function () {
 		ionicDatePicker.openDatePicker({
 			inputDate: $scope.novoAgendamento.data || new Date(),
 			callback: function (val) {
 				console.log("Valor selecionado: " + val + " - " + new Date(val));	
 				$scope.novoAgendamento.data = new Date(val);
 				carregarHorariosDisponiveis($scope.novoAgendamento);
 			}
 		});
 	}

 	$scope.salvar = function (novoAgendamento) {
 		console.log("Salvar agendamento");
 		Agendamentos.salvar(novoAgendamento).then(
 			function(response){
 				console.log("Success");
 				var ag = response.data;
 				var data = new Date(ag.data);
 				$ionicPopup.alert({
 					title: 'Agendamento realizado',
 					template: 'Consulta marcada para dia ' + data.toLocaleDateString() + ' as ' +data.toLocaleTimeString()+ ' para o paciente ' + ag.paciente.nome,
 				}).then(function () {
 					$ionicHistory.goBack();
 				});
 			}, function (error) {
 				console.error("Failed");
 			});
 	}

 	function carregarDados () {
 		carregarPacientes();
 		carregarDentistas();
 		carregarHorariosDisponiveis($scope.novoAgendamento);
 	}

 	carregarDados();
 	createEmptyAgendamento();

 })

 .controller('EditAgendamentoCtrl', function($scope, $state, $ionicLoading, ionicDatePicker, $ionicHistory, $stateParams, Agendamentos, Dentistas, Pacientes, CalendarService, Util) {

 	function _clone (obj) {
 		if (obj === null || typeof(obj) !== 'object' || 'isActiveClone' in obj) {
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
	    		temp[key] = _clone(obj[key]);
	    		delete obj['isActiveClone'];
	    	}
	    }

	    return temp;
	};

	var agendamentoOriginal = undefined;
	function carregarAgendamento (agendamentoId, callback) {
		$scope.agendamento = {};
		Agendamentos.buscar(agendamentoId).then(
			function(response) {
				var _agendamento = response.data;
				_agendamento.data = new Date(_agendamento.data);
				$scope.agendamento = _agendamento;
				agendamentoOriginal = _clone($scope.agendamento);
				if(callback) 
					callback();
			}, function (error) {

			});
	}

	$scope.showDatePicker = function () {
		ionicDatePicker.openDatePicker({
			inputDate: $scope.agendamento.data || new Date(),
			callback: function (val) {
				console.log("Valor selecionado: " + val + " - " + new Date(val));	
				$scope.agendamento.data = new Date(val);
				carregarHorariosDisponiveis($scope.agendamento);
			}
		});
	}


	$scope.editando = false;
	$scope.toggleEdicao = function () {
		$scope.editando = !$scope.editando;
	};

	$scope.cancelarConsulta = function (agendamento) {
		agendamento.fgSituacaoConsultaEnum = 2;
		Agendamentos.salvar(agendamento).then(
			function (response) {
				$ionicHistory.goBack();
			}, function (error) {
				console.error(error);
			});
	};
	$scope.confirmarComparecimento = function (agendamento) {
		agendamento.fgSituacaoConsultaEnum = 1;
		Agendamentos.salvar(agendamento).then(
			function (response) {
				$ionicHistory.goBack();
			}, function (error) {
				console.error(error);
			});
	};
	$scope.descartarAlteracoes = function () {
		$scope.agendamento = _clone(agendamentoOriginal);
		$scope.editando = false;
	};
	$scope.concluirEdicao = function () {
		Agendamentos.salvar($scope.agendamento).then(
			function (response) {
				$scope.agendamento = response.data;
				agendamentoOriginal = _clone($scope.agendamento);
			}, function (error) {

			});
	}

	var listaDentistas = [];
	var listaPacientes = [];
	var listaHorariosDisponiveis = [];

	function carregarPacientes (callback) {
		$ionicLoading.show({
			template: "Loading..."
		});
		Pacientes.todos().then(
			function(response) {
				$scope.pacientes = response.data;
				$ionicLoading.hide();
				if (callback)
					callback();
			}, 
			function () {
				console.error('carregarPacientes');
				$ionicLoading.hide();
			});
	}

	function carregarDentistas (callback) {
		Dentistas.todos().then(
			function(response) {
				$scope.dentistas = response.data;
				if (callback)
					callback();
			}, 
			function () {
				console.error('carregarDentistas');
			});
	}

	function carregarHorariosDisponiveis (agendamento, callback) {
		$scope.listaHorariosDisponiveis = [];
		if (agendamento) {
			Dentistas.horariosDisponiveis(0, agendamento.data).then(
				function (response){
					$scope.listaHorariosDisponiveis = response.data;
					if (callback)
						callback();
				}, function (error){
					$scope.listaHorariosDisponiveis = [];
				})	
		}
	}
	$scope.carregarHorariosDisponiveis = carregarHorariosDisponiveis;

	$scope.salvar = function (novoAgendamento) {
		console.log("Salvar agendamento");
		Agendamentos.salvar(agendamento).then(
			function(){
				console.log("Success");
				$ionicHistory.goBack();
 				//('tab.agendamentos');
 			}, function () {
 				console.error("Failed");
 			});
	};

	function carregarDados () {
		carregarPacientes(function () {
			carregarDentistas(function () {
				carregarAgendamento($stateParams.agendamentoId, function () {
					carregarHorariosDisponiveis($scope.agendamento);	
				});
			});
		});
	};

	carregarDados();

})

 .controller('AgendamentosCtrl', function($scope, $ionicPopup, $state, Agendamentos, Dentistas, CalendarService) {

 	var agendamentos = [];

 	var eventSelected = false;
 	$scope.$on('$ionicView.enter', function(e) {
 		var eventSelected = false;
 	});

 	var calendar = {
 		mode: 'month',
 		step: 15,
 		eventSource: agendamentos,
 		currentDate: new Date(),
 		queryMode: 'remote'
 	};

 	$scope.viewTitle = "Agendamentos";

 	$scope.novoAgendamento = function() {
 		CalendarService.dataCalendario = $scope.calendar.currentDate;
 		console.log("novoAgendamento called");
 		$state.go('tab.novoagendamento');//, {dataAgendamento: $scope.calendar.currentDate});
 		eventSelected = false;
 	};

 	// View
 	$scope.changeMode = function(mode) {
 		console.log('Event: changeMode');
 		$scope.calendar.mode = mode;
 	};
 	$scope.currentMode = function(mode) {
 		return $scope.calendar.mode == mode;
 	}
 	$scope.onViewTitleChanged = function(title) {
 		console.log('Event: onViewTitleChanged');
 		$scope.viewTitle = title;
 	};

	// Events
	$scope.onEventSelected = function(event) {
		console.log('Event: onEventSelected:' + event.startTime + '-' + event.endTime + ',' + event.title);
		eventSelected = true;
		// console.warn('Implementar onEventSelected');
		$state.go('tab.editaragendamento', {agendamentoId: event.id});
	};
	$scope.onTimeSelected = function(selectedTime) {
		if (!eventSelected) {
			console.log('Event: onTimeSelected: ' + selectedTime);
			$scope.calendar.currentDate = selectedTime;
			if (calendar.mode !== 'month'){
				$scope.novoAgendamento();
			}
		}
	};
	$scope.rangeChanged = function (start, end) {
		eventSelected = false;
		console.log('Event: rangeChanged: ' + start.toLocaleDateString() + ' ' + end.toLocaleDateString());
		// Ajusta para -1 dia, pois não deve trazer o último dia
		end.setDate(end.getDate()-1)
		Agendamentos.buscarNoPeriodo(start, end).then(
			function(response){
				$scope.calendar.eventSource = Agendamentos.converterAgendamentos(response.data);
			}, function(error) {
				$ionicPopup.alert({
					title: 'Erro',
					template: error
				});
			});
	};

	// Today checks
	$scope.today = function() {
		$scope.calendar.currentDate = new Date();
		eventSelected = false;

	};
	$scope.isToday = function() {
		var today = new Date(),
		currentCalendarDate = new Date($scope.calendar.currentDate);
		today.setHours(0, 0, 0, 0);
		currentCalendarDate.setHours(0, 0, 0, 0);
		return today.getTime() === currentCalendarDate.getTime();
	};


	$scope.calendar = calendar;

})

 .controller('PacientesCtrl', function($scope, $stateParams, Pacientes, $ionicActionSheet, $ionicPopup, $state) {

 	$scope.listaCarregadaSemErros = false;
 	$scope.listaCarregadaComErros = false;

 	$scope.$on('$ionicView.enter', function(e) {
 		carregarPacientes();
 	});


 	function novoPaciente () {
 		$state.go('tab.novopaciente');
 	};
 	$scope.novo = novoPaciente;

 	function carregarPacientes () {
 		$scope.listaCarregadaSemErros = false;
 		$scope.listaCarregadaComErros = false;
 		$scope.pacientes = [];
 		Pacientes.todos().then(
 			function(response) {
 				$scope.pacientes = response.data;
 				$scope.listaCarregadaSemErros = true;
 				$scope.$broadcast('scroll.refreshComplete');
 			},
 			function(error) {
 				$scope.$broadcast('scroll.refreshComplete');
 				$scope.listaCarregadaComErros = true;
 				console.error(error);
 				$scope.mensagemErro = "Não foi possível carregar os pacientes";
 			});	
 	};
 	$scope.loadData = carregarPacientes;

 	$scope.refreshData = function() {
 		carregarPacientes();
 	}

 	$scope.pacienteHold = function(paciente) {
 		$scope.actionSheet = $ionicActionSheet.show({
 			buttons: [
 			// {text: 'Ver histórico'}, 
 			// {text: 'Agendar Consulta'}
 			],
 			destructiveText: 'Excluir ' + paciente.nome,
 			destructiveButtonClicked: function() {
 				Pacientes.excluir(paciente.id).then(
 					function() {
 						console.log("Exclusão funcionou.")
 						carregarPacientes();
 					},
 					function() {
 						$ionicPopup.alert({
 							title: 'Não foi possível excluir o paciente',
 							template: 'Você não pode excluir um paciente que já possui agendamentos',
 							buttons: [{
 								text: 'OK',
 								type: 'button-balanced',
 							}]

 						});
 						console.log("Exclusão falhou.")
 					});
 				return true;
 			},

 			// titleText: paciente.nome,
 			cancelText: 'Cancelar',
 			cancel: function() {
				// console.log('Botão Cancelar pressionado.');
			},
			buttonClicked: function(index) {
				// console.log("Botão clicado: " + index);
				return true;
			}
		});
 	}

 })

 .controller('LoginCtrl', function($scope, $state, $ionicPopup, $ionicLoading, $timeout, LoginService, AuthService) {

 	$scope.login = {};
 	$scope.hasError = false;

 	// var isLogging = false;

 	$scope.entrar = function(data) {
 		
 		// if (!isLogging) {
 			clearErrorMessage();
 			if (data.usuario && data.senha) {
 				// isLogging = true;
 				$ionicLoading.show({
 					template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Realizando login'
 				});

 				AuthService.entrar(data.usuario, data.senha).then(
 					function(authenticated) {
 						// isLogging = false;
 						$state.go('tab.home', {}, {
 							reload: true
 						});
 						$ionicLoading.hide();
 					},
 					function(errorStatus) {
 						// isLogging = false;
 						$ionicLoading.hide();
 						if (errorStatus == 401) {
 							showErrorMessage("Usuário ou senha incorretos");
 						} else {
 							showErrorMessage("Erro ao realizar o login");
 						}
 					}
 					);
 			} else {
 				showErrorMessage("Informe os dados para entrar");
 			}
 		// }
 	};

 	function showErrorMessage(message) {
 		$ionicPopup.alert({
 			title:'Erro de Login', 
 			template: message, 
 			buttons: [{
 				text: 'OK',
 				type: 'button-balanced',
 			}]
 		});
 	}

 	var clearErrorMessage = function() {
 		if ($scope.hasError) {
 			$scope.hasError = false;
 		}
 	};
 	$scope.clearErrorMessage = clearErrorMessage;

 	$scope.esqueciSenha = function () {
 		$ionicPopup.alert({
 			title: 'Recuperação de Senha',
 			template: 'Entre em contato com o suporte, pelo e-mail <a href="mailto:lucasdamaral@hotmail.com">lucas@easydent.com.br</a>',
 			buttons: [{type: 'button-balanced', text: 'Ok'}]
 		});
 	}

 })

 .controller('EsqueciSenhaCtrl', function($state) {

 	return {

 	}

 })

 .controller('PacienteDetailCtrl', function($scope, $stateParams, Pacientes, $ionicLoading, $ionicHistory, $state) {

 	$scope.paciente = {};
 	if ($stateParams.pacienteId) {
 		$scope.nomePaciente = " ";
 		$ionicLoading.show({
 			template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Aguarde'
 		});
 		Pacientes.buscar($stateParams.pacienteId).success(function(response) {
 			$scope.paciente = response;
 			$scope.nomePaciente = "Editar Paciente";
 			$scope.paciente.dataNascimento = new Date(response.dataNascimento);
 			$ionicLoading.hide();
 		});
 	} else {
 		$scope.nomePaciente = "Novo Paciente";
 	}

 	$scope.salvar = function() {
 		// console.log("SALVAR PACIENTE")
 		$ionicLoading.show({
 			template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Aguarde'
 		});
 		Pacientes.salvar($scope.paciente).then(
 			function() {
 				// console.log("Salvo com sucesso.");
 				$ionicHistory.goBack();
 				$ionicLoading.hide();
 			},
 			function() {
 				// console.log("Erro ao salvar.");
 				$ionicLoading.hide();
 			})
 	}

 })

 .controller('DentistasCtrl', function($scope, $stateParams, Dentistas, $ionicActionSheet, $state) {

 	$scope.listaCarregadaSemErros = false;
 	$scope.listaCarregadaComErros = false;
 	$scope.listaDentistas = [];
 	$scope.mensagemErro = undefined;

 	$scope.$on('$ionicView.enter', function(e) {
 		carregarDentistas();
 	});

 	function carregarDentistas () {
 		$scope.listaCarregadaSemErros = false;
 		$scope.listaCarregadaComErros = false;
 		$scope.listaDentistas = [];
 		Dentistas.todos().then(
 			function(response) {
 				$scope.mensagemErro = undefined;
 				$scope.listaDentistas = response.data;
 				$scope.listaCarregadaSemErros = true;
 				$scope.$broadcast('scroll.refreshComplete');
 			}, function(error){
 				$scope.mensagemErro = "Não foi possível carregar os dentistas"
 				$scope.listaCarregadaComErros = true;
 				$scope.$broadcast('scroll.refreshComplete');
 			});

 	};
 	$scope.carregarDentistas = carregarDentistas;

 	function exibirMenu (dentista) {
 		$ionicActionSheet.show({
 			buttons: [
			// { text: "Editar Dentista" },
			],
			destructiveText: "Excluir Dentista",
			titleText: dentista.nome,
			cancelText: "Cancelar",
			cancel: function() {
				// your code goes here
			},
			buttonClicked: function(index) {
				return true;
			},
			destructiveButtonClicked:function(){
				Dentistas.excluir(dentista.id).then(
					function(){
						carregarDentistas();
						console.log('Exclusão do dentista ['+dentista.nome+']');
					}, 
					function(error){
						console.error(error);
					});
				return true;

			}
		}); 
 	};
 	$scope.exibirMenu = exibirMenu;

 	function novo () {
 		$state.go('tab.novodentista');
 	};
 	$scope.novo = novo;

 })

 .controller('DentistaCtrl', function ($scope, $stateParams, $state, $ionicLoading, $ionicHistory, ionicTimePicker, Dentistas) {
 	
 	$scope.dentista = {
 		// horarios: [
 		// createEmptyTime(1),
 		// createDefaultTime(2),
 		// createDefaultTime(3),
 		// createDefaultTime(4),
 		// createDefaultTime(5),
 		// createDefaultTime(6),
 		// createEmptyTime(7),
 		// ]
 	};

 	if ($stateParams.dentistaId) {
 		$ionicLoading.show({
 			template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Buscando dentista'
 		});
 		Dentistas.buscar($stateParams.dentistaId).then(
 			function(response) {
 				$scope.dentista = response.data;
 				$ionicLoading.hide();
 			}, 
 			function (error) {
 				console.error(error);
 				$ionicLoading.hide();
 			});
 	}

 	function salvar (dentista) {
 		$ionicLoading.show({
 			template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Salvando dentista'
 		});
 		Dentistas.salvar(dentista).then(
 			function(response){
 				$ionicLoading.hide();
 				$ionicHistory.goBack();
 			},
 			function (error){
 				$ionicLoading.hide();
 				console.error(error);
 			});
 	};

 	$scope.salvar = salvar;

 	// $scope.diaSemana = undefined;
 	// $scope.horario = undefined;

 	// $scope.exibicaoHorarios = 'Carregando horários';


 	// function getNomeDiaSemana(diaSemana) {
 	// 	switch(diaSemana) {
 	// 		case 1: return "Domingo";
 	// 		case 2: return "Segunda-feira";
 	// 		case 3: return "Terça-feira";
 	// 		case 4: return "Quarta-feira";
 	// 		case 5: return "Quinta-feira";
 	// 		case 6: return "Sexta-feira";
 	// 		case 7: return "Sábado";
 	// 	}
 	// }

 	// //
 	// function carregarHorario (diaSemana) {
 	// 	console.log('Carregando horários do dia ' + diaSemana);
 	// 	var horarios = $scope.dentista.horarios;
 	// 	for (var i = 1; i < 8; i++) {
 	// 		if (horarios[i] && horarios[i].fgDiaSemana === i) {
 	// 			$scope.horario = horarios[i];
 	// 		}
 	// 	}
 	// 	if (!$scope.horario) {
 	// 		console.log('Não há horário. Utilizado horário padrão.');
 	// 		$scope.horario = createDefaultTime(diaSemana);
 	// 	}
 	// };
 	// $scope.carregarHorario = carregarHorario;

 	// function repetirSemana (horario) {
 	// 	var horarios = $scope.dentista.horariosDisponiveis;
 	// 	for (var i = 1; i < 8; i++) {
 	// 		if (horarios[i].fgDiaSemana > 1 && horarios[i].fgDiaSemana < 7) {
 	// 			horarios[i] = horario;
 	// 		}
 	// 	}
 	// 	$scope.dentista.horariosDisponiveis = horarios;
 	// };
 	// $scope.repetirSemana = repetirSemana;

 	// function repetirTodos (horario) {
 	// 	var horarios = $scope.dentista.horariosDisponiveis;
 	// 	for (var i = 1; i < 8; i++) {
 	// 		if (horarios[i].fgDiaSemana > 1 && horarios[i].fgDiaSemana < 7) {
 	// 			horarios[i] = horario;
 	// 		}
 	// 	}
 	// 	$scope.dentista.horariosDisponiveis = horarios;
 	// };
 	// $scope.repetirTodos = repetirTodos;

 	// function limpar () {
 	// 	$scope.horario = {
 	// 		horaInicial: undefined,
 	// 		horaAlmocoInicial: undefined,
 	// 		horaAlmocoFinal: undefined,
 	// 		horaFinal: undefined
 	// 	}
 	// }; 
 	// $scope.limpar = limpar;

 	// function limparTodos () {
 	// 	for (var i = 1; i < 8; i++) {
 	// 		$scope.dentista.horariosDisponiveis[0] = {
 	// 			horaInicial: undefined,
 	// 			horaAlmocoInicial: undefined,
 	// 			horaAlmocoFinal: undefined,
 	// 			horaFinal: undefined
 	// 		}
 	// 	}
 	// };
 	// $scope.limparTodos = limparTodos;

 	// function createDefaultTime (diaSemana) {
 	// 	return {
 	// 		fgDiaSemana: diaSemana,
 	// 		horaInicial: new Date(2016, 1, 1,  7, 30, 0),
 	// 		horaAlmocoInicial: new Date(2016, 1, 1, 11, 59, 0),
 	// 		horaAlmocoFinal: new Date(2016, 1, 1, 13,  0, 0),
 	// 		horaFinal: new Date(2016, 1, 1, 18, 0, 0)
 	// 	}
 	// };
 	// function createEmptyTime (diaSemana) {
 	// 	return {
 	// 		fgDiaSemana: diaSemana,
 	// 		horaInicial: undefined,
 	// 		horaAlmocoInicial: undefined,
 	// 		horaAlmocoFinal: undefined,
 	// 		horaFinal: undefined
 	// 	}
 	// };

 	// function selectTimeHoraInicial (currentTime) {
 	// 	var _currentTime = currentTime.getHours;
 	// 	_currentTime.setHours(currentTime.getMinutes() >= 30? currentTime.getHours()-1:currentTime.getHours());
 	// 	ionicTimePicker.openTimePicker({
 	// 		// inputTime: ((currentTime.getHours() - 1) * 60 * 60) + (currentTime.getMinutes() * 60), 
 	// 		inputTime: ((_currentTime.getHours()) * 60 * 60) + (_currentTime.getMinutes() * 60), 
  //   		callback: function (val) {      //Mandatory
  //   			if (typeof (val) !== 'undefined') {
  //   				var selectedTime = new Date(val * 1000);
  //   				selectedTime.setHours(selectedTime.getUTCHours());
  //   				selectedTime.setMinutes(selectedTime.getUTCMinutes());
  //   				$scope.horario.horaInicial = selectedTime;
  //   			}else{
  //   				console.error('erro na seleção da data')
  //   			}
  //   		},

  //   	});
 	// };
 	// $scope.selectTimeHoraInicial = selectTimeHoraInicial;

 	// function selectTimeHoraAlmocoInicial (currentTime) {
 	// 	currentTime.setHours(currentTime.getMinutes() >= 30? currentTime.getHours()-1:currentTime.getHours());
 	// 	ionicTimePicker.openTimePicker({
 	// 		// inputTime: ((currentTime.getHours() - 1) * 60 * 60) + (currentTime.getMinutes() * 60), 
 	// 		inputTime: ((currentTime.getHours()) * 60 * 60) + (currentTime.getMinutes() * 60), 
  //   		callback: function (val) {      //Mandatory
  //   			if (typeof (val) !== 'undefined') {
  //   				var selectedTime = new Date(val * 1000);
  //   				selectedTime.setHours(selectedTime.getUTCHours());
  //   				selectedTime.setMinutes(selectedTime.getUTCMinutes());
  //   				$scope.horario.horaAlmocoInicial = selectedTime;
  //   			}else{
  //   				console.error('erro na seleção da data')
  //   			}
  //   		},
  //   	});
 	// };
 	// $scope.selectTimeHoraAlmocoInicial = selectTimeHoraAlmocoInicial;

 	// function selectTimeHoraAlmocoFinal (currentTime) {
 	// 	currentTime.setHours(currentTime.getMinutes() >= 30? currentTime.getHours()-1:currentTime.getHours());
 	// 	ionicTimePicker.openTimePicker({
 	// 		inputTime: ((currentTime.getHours()) * 60 * 60) + (currentTime.getMinutes() * 60), 
 	// 		// inputTime: ((currentTime.getHours() - 1) * 60 * 60) + (currentTime.getMinutes() * 60), 
  //   		callback: function (val) {      //Mandatory
  //   			if (typeof (val) !== 'undefined') {
  //   				var selectedTime = new Date(val * 1000);
  //   				selectedTime.setHours(selectedTime.getUTCHours());
  //   				selectedTime.setMinutes(selectedTime.getUTCMinutes());
  //   				$scope.horario.horaAlmocoFinal = selectedTime;
  //   			}else{
  //   				console.error('erro na seleção da data')
  //   			}
  //   		},
  //   	});
 	// };
 	// $scope.selectTimeHoraAlmocoFinal = selectTimeHoraAlmocoFinal;

 	// function selectTimeHoraFinal (currentTime) {
 	// 	currentTime.setHours(currentTime.getMinutes() >= 30? currentTime.getHours()-1:currentTime.getHours());
 	// 	ionicTimePicker.openTimePicker({
  //   		callback: function (val) {      //Mandatory
  //   			if (typeof (val) !== 'undefined') {
  //   				var selectedTime = new Date(val * 1000);
  //   				selectedTime.setHours(selectedTime.getUTCHours());
  //   				selectedTime.setMinutes(selectedTime.getUTCMinutes());
  //   				$scope.horario.horaFinal = selectedTime;
  //   			}else{
  //   				console.error('erro na seleção da data')
  //   			}
  //   		},
  //   		inputTime: ((currentTime.getHours()) * 60 * 60) + (currentTime.getMinutes() * 60), 
  //   		// inputTime: ((currentTime.getHours() - 1) * 60 * 60) + (currentTime.getMinutes() * 60), 
  //   	});
 	// };
 	// $scope.selectTimeHoraFinal = selectTimeHoraFinal;

 })

 .controller('ConsultasCtrl', function($scope, $stateParams, Consultas) {
 	$ionicLoading.show({
 		template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Buscando consultas'
 	});
 	Consultas.todas().success(function(response) {
 		$scope.consultas = response;
 		$ionicLoading.hide();
 	})
 })

 .controller('LaboratoriosCtrl', function($scope, $stateParams,  $ionicActionSheet, $state, Laboratorios) {

 	$scope.listaCarregadaSemErros = false;
 	$scope.listaCarregadaComErros = false;
 	$scope.listaLaboratorios = [];
 	$scope.mensagemErro = undefined;

 	$scope.$on('$ionicView.enter', function(e) {
 		carregarLaboratorios();
 	});

 	function carregarLaboratorios () {
 		$scope.listaCarregadaSemErros = false;
 		$scope.listaCarregadaComErros = false;
 		$scope.listaLaboratorios = [];
 		Laboratorios.todos().then(
 			function(response) {
 				$scope.mensagemErro = undefined;
 				$scope.listaLaboratorios = response.data;
 				$scope.listaCarregadaSemErros = true;
 				$scope.$broadcast('scroll.refreshComplete');
 			}, function(error){
 				$scope.mensagemErro = "Não foi possível carregar os dentistas"
 				$scope.listaCarregadaComErros = true;
 				$scope.$broadcast('scroll.refreshComplete');
 			});

 	};
 	$scope.carregarLaboratorios = carregarLaboratorios;

 	function exibirMenu (laboratorio) {
 		$ionicActionSheet.show({
 			buttons: [
			// { text: "Editar Dentista" },
			],
			destructiveText: "Excluir Laboratório",
			titleText: laboratorio.nome,
			cancelText: "Cancelar",
			cancel: function() {
				// your code goes here
			},
			buttonClicked: function(index) {
				return true;
			},
			destructiveButtonClicked:function(){
				Laboratorios.excluir(laboratorio.id).then(
					function(){
						carregarLaboratorios();
						console.log('Exclusão do laboratório ['+laboratorio.nome+']');
					}, 
					function(error){
						console.error(error);
					});
				return true;

			}
		}); 
 	};
 	$scope.exibirMenu = exibirMenu;

 	function novo () {
 		$state.go('tab.novolaboratorio');
 	};
 	$scope.novo = novo;

 })

 .controller('LaboratorioCtrl', function ($scope, $stateParams, $state, $ionicLoading, Laboratorios) {

 	$scope.tiposLaboratorio = [
 	{id: 1, nome: 'Radiologia'},
 	{id: 2, nome: 'Prótese'},
 	];

 	$scope.laboratorio = {};
 	if ($stateParams.laboratorioId) {
 		$ionicLoading.show({
 			template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Buscando laboratório'
 		});
 		Laboratorios.buscar($stateParams.laboratorioId).then(
 			function(response) {
 				$scope.laboratorio = response.data;
 				$ionicLoading.hide();
 			}, 
 			function (error) {
 				$ionicLoading.hide();
 				console.error(error);
 			});
 	}

 	function salvar (laboratorio) {
 		$ionicLoading.show({
 			template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Aguarde'
 		});
 		Laboratorios.salvar(laboratorio).then(
 			function(response){
 				$state.go('tab.laboratorios');
 				$ionicLoading.hide();
 			},
 			function (error){
 				console.error(error);
 				$ionicLoading.hide();
 			});
 	};
 	$scope.salvar = salvar;

 })

 .controller('ConsultaCtrl', function ($scope, $stateParams, $ionicLoading, Agendamentos){

 	if (!$stateParams.consultaId) {
 		console.error('Não é possível detalhar uma consulta, sem o ID de agendamento');
 	}

 	function buscarConsulta(id) {
 		$scope.consulta = undefined;
 		$ionicLoading.show({
 			template: "Loading..."
 		});
 		Agendamentos.buscar(id).then(
 			function(response){
 				$scope.consulta = response.data;
 				$ionicLoading.hide();
 			},
 			function(){
 				$ionicLoading.hide();
 			});

 	}
 	buscarConsulta($stateParams.consultaId);


 })

 .controller('PendenciasCtrl', function($scope, $stateParams, Pendencias) {
 	Pendencias.todas().success(function(response) {
 		$scope.pendencias = response;
 	})
 })

 .controller('NavCtrl', function($scope, $state) {

 	$scope.toState = function(state) {
 		$state.go(state);
 	}

 })

 .controller('HomeCtrl', function($scope, $state, $ionicPopup, $ionicHistory, Agendamentos, AuthService) {

 	$scope.$on('$ionicView.enter', function(e) {
 		carregarUltimosAgendamentos();
 		carregarProximosAgendamentos();
 		// $ionicHistory.clearHistory();
 		$scope.username = AuthService.username();
 		$scope.tokenValue = AuthService.token();
 	});

 	$scope.showUltimasConsultas = true;
 	$scope.toggleUltimasConsultas = function () {
 		$scope.showUltimasConsultas = !$scope.showUltimasConsultas;
 	};

 	$scope.showProximasConsultas = true;
 	$scope.toggleProximasConsultas = function () {
 		$scope.showProximasConsultas = !$scope.showProximasConsultas;
 	};

 	function carregarUltimosAgendamentos () {
 		$scope.carregouUltimosAgendamentos = false;
 		$scope.ultimosAgendamentos= [];
 		Agendamentos.ultimos(5).then(
 			function (response) {
 				$scope.ultimosAgendamentos = response.data;
 				$scope.carregouUltimosAgendamentos = true;
 			}, function (error) {
				// $ionicPopup.alert({
				// 	title: 'Erro',
				// 	template: 'Não foi possível carregar os últimos agendamentos :( \n Tente novamente mais tarde!'
				// })

			});
 	}

 	function carregarProximosAgendamentos() {
 		$scope.carregouAgendamentos = false;
 		$scope.proximosAgendamentos = [];
 		Agendamentos.proximos(5).then(
 			function(response) {
 				$scope.proximosAgendamentos = response.data;
 				$scope.carregouAgendamentos = true;
 			},
 			function(error) {
				// $ionicPopup.alert({
				// 	title: 'Erro',
				// 	template: 'Não foi possível carregar os próximos agendamentos :( \n Tente novamente mais tarde!'
				// })
			}
			)
 	}

 	$scope.toLocaleDate = function(e) {
 		e.dataString = new Date(e.data).toLocaleDateString();
 		e.dataFinal = new Date(e.data + (e.duracaoMinutos * 60000));
 		return e;
 	};

 	$scope.confirmarComparecimento = function (agendamento) {
 		$ionicPopup.confirm({
 			title: 'Comparecimento',
 			template: 'O paciente '+ agendamento.paciente.nome +' compareceu à consulta?',
 			buttons: [{
 				text: 'Cancelar',
 			},
 			{
 				text: 'Sim',
 				type: 'button-balanced',
 				onTap: function (e) {
 					agendamento.fgSituacaoConsultaEnum = 1;
 					Agendamentos.salvar(agendamento).then(
 						function (response) {

 						}, function (error) {

 						});
 				}
 			}]
 		});
 	};
 	$scope.confirmarCancelamento = function (agendamento) {

 	};
 	$scope.confirmarAusencia = function (agendamento) {

 	};

 	carregarProximosAgendamentos();
 	carregarUltimosAgendamentos();

 })

 ;