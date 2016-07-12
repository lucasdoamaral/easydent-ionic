'use strict';

angular.module('easydent.controllers', [])

	.controller('TesteCtrl', function ($scope) {
		$scope.variavel = 'Testando';
	})

	.controller('AppCtrl', function ($scope, $log, $state, $ionicPopup, AuthService, AUTH_EVENTS) {

		// $scope.$on(AUTH_EVENTS.notAuthorized, function (event) {
		// 	var alertPopup = $ionicPopup.alert({
		// 		title: 'Acesso Não Autorizado',
		// 		template: 'Ops! Você não tem permissão para acessar essas informações',
		// 		buttons: [{
		// 			text: 'OK',
		// 			type: 'button-balanced',
		// 		}]
		// 	});
		// });

		$scope.$on(AUTH_EVENTS.notAuthenticated, function (event) {
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

	.controller('ConfiguracoesCtrl', function ($scope, $log, AuthService, $state) {

		$scope.sair = function () {
			AuthService.logout();
			$state.go('login');
		};

	})

	.controller('SignupCtrl', function ($log, $scope, UsuarioService, $state, $ionicPopup, BUTTONS) {

		$scope.novoUsuario = {
			'fgTipoUsuario': 4,
		};
		$scope.novoEstabelecimento = {
			nome: 'Estabelecimento sem nome',
		};

		$scope.loginDisponivel = false;
		$scope.emailDisponivel = false;

		$scope.checkUsername = function (username) {
			UsuarioService.checkUsername(username).then(
				function (response) {
					if (response.data) {
						$scope.loginDisponivel = true;
					} else {
						$scope.loginDisponivel = false;
						$scope.novoUsuario.login = undefined;
						$ionicPopup.alert({
							template: 'Esse nome de usuário não está disponível. Por gentileza, tente outro nome de usuário',
							buttons: [BUTTONS.ok]
						});
					}
				}, function (error) {
					// $log.error(error);
				}
			);
		};

		$scope.checkEmail = function (email) {
			UsuarioService.checkEmail(email).then(
				function (response) {
					if (response.data) {
						$scope.emailDisponivel = true;
					} else {
						$scope.emailDisponivel = false;
						$scope.novoUsuario.email = undefined;
						$ionicPopup.alert({
							template: 'Esse e-mail já está cadastrado. Utilize outro e-mail, ou faça login',
							buttons: [BUTTONS.ok]
						});
					}
				}, function (error) {
					// $log.error(error);
				}
			);
		};

		$scope.criarUsuario = function (novoUsuario, novoEstabelecimento) {

			if (!$scope.loginDisponivel) {
				$ionicPopup.alert({
					title: 'Erro',
					template: 'Você deve informar um nome de usuário válido para se cadastrar'
				});
				return;
			}
			if (!$scope.emailDisponivel) {
				$ionicPopup.alert({
					title: 'Erro',
					template: 'Você deve informar um e-mail válido para se cadastrar'
				});
				return;
			}

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
				function () {
					$state.go('login');
				},
				function (error) {
					$ionicPopup.alert({
						title: 'Erro',
						template: error,
					});
				});
		};

	})

	.controller('NovoAgendamentoCtrl', function ($scope, $log, $state, $ionicLoading, $ionicPopup, $ionicHistory, ionicDatePicker, APP, TimeUtil, Agendamentos, Dentistas, Pacientes, CalendarService, BUTTONS) {

		var dataAgendamento = CalendarService.dataCalendario;

		var listaDentistas = [];
		var listaPacientes = [];
		var listaHorariosDisponiveis = [];

		$scope.diasValidos = {
			'after': 'today',
			'inclusive': true
		};

		function createEmptyAgendamento() {
			if (!dataAgendamento) {
				dataAgendamento = new Date();
			}
			TimeUtil.getDateNextTimeStep(dataAgendamento, APP.stepMinutes);
			return {
				dentista: undefined,
				paciente: undefined,
				data: dataAgendamento,
				duracaoMinutos: APP.stepMinutes,
				diaCompleto: false,
				agenda: undefined
			};
		};

		$scope.diminuirDuracao = function (a) {
			$scope.novoAgendamento.duracaoMinutos -= APP.stepMinutes;
		};

		$scope.aumentarDuracao = function () {
			$scope.novoAgendamento.duracaoMinutos += APP.stepMinutes;
		};


		function carregarPacientes() {
			$ionicLoading.show({
				template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Aguarde...'
			});
			Pacientes.todos().then(
				function (response) {
					$scope.pacientes = response.data;
					$ionicLoading.hide();
				},
				function () {
					$log.error('carregarPacientes');
					$ionicLoading.hide();
				});
		}

		function carregarDentistas() {
			Dentistas.todos().then(
				function (response) {
					$scope.dentistas = response.data;
				},
				function () {
					$log.error('carregarDentistas');
				});
		}

		function carregarHorariosDisponiveis(agendamento) {
			$scope.listaHorariosDisponiveis = [];
			if (agendamento && agendamento.dentista && agendamento.data) {
				Dentistas.horariosDisponiveis(0, agendamento.data).then(
					function (response) {
						$scope.listaHorariosDisponiveis = response.data;
					}, function (error) {
						$scope.listaHorariosDisponiveis = [];
					});
			}
		}

		$scope.carregarHorariosDisponiveis = carregarHorariosDisponiveis;

		$scope.novoAgendamento = createEmptyAgendamento();
		$scope.pacientesCallback = function (query, isInitializing) {

		};

		$scope.salvar = function (novoAgendamento) {

			if (!novoAgendamento.paciente
				|| !novoAgendamento.dentista
				|| !novoAgendamento.duracaoMinutos
				|| !novoAgendamento.procedimento) {
				$ionicPopup.alert({
					template: 'Informe todos os campos necessários para agendar uma consulta',
					buttons: [{
						text: 'Ok',
						type: 'button-balanced'
					}]
				});
				return;
			}

			$log.log('Salvar agendamento');
			$ionicLoading.show({
				template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Aguarde'
			});
			Agendamentos.salvar(novoAgendamento).then(
				function (response) {
					// $log.log('Success');
					$ionicLoading.hide();
					var ag = response.data;
					var data = new Date(ag.data);
					$ionicPopup.alert({
						title: 'Agendamento realizado',
						template: 'Consulta marcada para dia ' + data.toLocaleDateString() + ' as ' + data.toLocaleTimeString() + ' para o paciente ' + ag.paciente.nome,
						buttons: [BUTTONS.ok]
					}).then(function () {
						$ionicHistory.goBack();
					});
				}, function (error) {
					$ionicLoading.hide();
					$ionicPopup.alert({
						title: 'Erro',
						template: error.data.message,
						buttons: [{ 'text': 'Ok', 'type': 'button-balanced' }]
					});
				});
		};

		function carregarDados() {
			carregarPacientes();
			carregarDentistas();
			carregarHorariosDisponiveis($scope.novoAgendamento);
		}

		carregarDados();
		createEmptyAgendamento();

	})

	.controller('EditAgendamentoCtrl', function ($log, $scope, $state, $ionicLoading, ionicDatePicker, $ionicPopup, $ionicHistory, $stateParams, Agendamentos, Dentistas, Pacientes, CalendarService, Util, APP, BUTTONS) {

		$scope.diminuirDuracao = function () {
			$scope.agendamento.duracaoMinutos -= APP.stepMinutes;
		};

		$scope.aumentarDuracao = function () {
			$scope.agendamento.duracaoMinutos += APP.stepMinutes;
		};

		var agendamentoOriginal = undefined;

		$scope.agendamentoPassado = false;

		function carregarAgendamento(agendamentoId, callback) {
			$scope.agendamento = {};
			Agendamentos.buscar(agendamentoId).then(
				function (response) {
					var _agendamento = response.data;
					_agendamento.data = new Date(_agendamento.data);
					$scope.agendamento = _agendamento;
					agendamentoOriginal = Util.clone($scope.agendamento);

					$scope.agendamentoPassado = _agendamento.data < new Date();

					if (callback)
						callback();
				}, function (error) {

				});
		}

		$scope.editando = false;
		$scope.toggleEdicao = function () {
			$scope.editando = !$scope.editando;
		};

		$scope.cancelarConsulta = function (agendamento) {
			$ionicPopup.confirm({
				template: 'Deseja cancelar a consulta do paciente ' + agendamento.paciente.nome + ' ?',
				buttons: [
					{ text: 'Não' },
					{
						text: 'Sim',
						type: 'button-assertive',
						onTap: function () {
							agendamento.fgSituacaoConsultaEnum = 2;
							$ionicLoading.show({
								template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Aguarde...'
							});
							Agendamentos.salvar(agendamento).then(
								function (response) {
									$ionicLoading.hide();
									$ionicPopup.confirm({
										template: 'Consulta cancelada!',
										buttons: [
											{
												text: 'Ok',
												type: 'button-balanced',
												onTap: function () {
													$ionicHistory.goBack();
												}
											}]
									});
								},
								function (error) {
									$ionicLoading.hide();
								}
							);
						}
					}]
			});
		};

		$scope.pacienteFaltou = function (agendamento) {
			$ionicPopup.confirm({
				title: 'Paciente Faltou',
				template: 'O paciente ' + agendamento.paciente.nome + ' faltou na consulta?',
				buttons: [
					{ text: 'Cancelar' },
					{
						text: 'Sim, faltou',
						type: 'button-assertive',
						onTap: function (e) {
							$ionicLoading.show({
								template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Aguarde...'
							});
							agendamento.fgSituacaoConsultaEnum = 3;
							Agendamentos.salvar(agendamento).then(
								function (response) {
									$ionicLoading.hide();
									$ionicPopup.confirm({
										template: 'Ausência registrada.',
										buttons: [{
											text: 'Ok',
											type: 'button-balanced',
											onTap: function () {
												$ionicHistory.goBack();
											}
										}]
									});
								}, function (error) {
									$ionicLoading.hide();
								}
							);
						}
					}
				]
			});
		};

		$scope.confirmarComparecimento = function (agendamento) {
			$ionicPopup.confirm({
				title: 'Comparecimento',
				template: 'O paciente ' + agendamento.paciente.nome + ' compareceu à consulta?',
				buttons: [{
					text: 'Cancelar',
				},
					{
						text: 'Sim',
						type: 'button-balanced',
						onTap: function (e) {
							$ionicLoading.show({
								template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Aguarde...'
							});
							agendamento.fgSituacaoConsultaEnum = 1;
							Agendamentos.salvar(agendamento).then(
								function (response) {
									$ionicLoading.hide();
									$ionicPopup.show({
										template: 'Atendimento registrado com sucesso!',
										buttons: [BUTTONS.ok]
									}).then(function () {
										$ionicHistory.goBack();
									});
								}, function (error) {
									$ionicLoading.hide();
								});
						}
					}]
			});
		};



		$scope.descartarAlteracoes = function () {
			$scope.agendamento = Util.clone(agendamentoOriginal);
			$scope.editando = false;
		};
		$scope.concluirEdicao = function () {
			$ionicLoading.show({
				template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Aguarde...'
			});

			var agendamento = $scope.agendamento;

			if (!agendamento.paciente
				|| !agendamento.dentista
				|| !agendamento.duracaoMinutos
				|| !agendamento.procedimento) {
				$ionicPopup.alert({
					template: 'Informe todos os campos necessários para agendar uma consulta',
					buttons: [{
						text: 'Ok',
						type: 'button-balanced'
					}]
				});
				return;
			}


			Agendamentos.salvar(agendamento).then(
				function (response) {
					$scope.agendamento = response.data;
					agendamentoOriginal = Util.clone($scope.agendamento);
					$ionicHistory.goBack();
					$ionicLoading.hide();
				}, function (error) {
					$ionicLoading.hide();
					$ionicPopup.alert({
						title: 'Erro',
						template: error.data.message,
						buttons: [{ 'text': 'Ok', 'type': 'button-balanced' }]
					});
				});
		};

		var listaDentistas = [];
		var listaPacientes = [];
		var listaHorariosDisponiveis = [];

		function carregarPacientes(callback) {
			$ionicLoading.show({
				template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Aguarde...'
			});
			Pacientes.todos().then(
				function (response) {
					$scope.pacientes = response.data;
					$ionicLoading.hide();
					if (callback)
						callback();
				},
				function () {
					$log.error('carregarPacientes');
					$ionicLoading.hide();
				});
		}

		function carregarDentistas(callback) {
			Dentistas.todos().then(
				function (response) {
					$scope.dentistas = response.data;
					if (callback)
						callback();
				},
				function () {
					$log.error('carregarDentistas');
				});
		}

		function carregarHorariosDisponiveis(agendamento, callback) {
			$scope.listaHorariosDisponiveis = [];
			if (agendamento) {
				Dentistas.horariosDisponiveis(0, agendamento.data).then(
					function (response) {
						$scope.listaHorariosDisponiveis = response.data;
						if (callback)
							callback();
					}, function (error) {
						$scope.listaHorariosDisponiveis = [];
					});
			}
		}
		$scope.carregarHorariosDisponiveis = carregarHorariosDisponiveis;

		function carregarDados() {
			carregarPacientes(function () {
				carregarDentistas(function () {
					carregarAgendamento($stateParams.agendamentoId);
				});
			});
		};

		carregarDados();

	})

	.controller('AgendamentosCtrl', function ($scope, $timeout, $log, $ionicLoading, $ionicPopup, $state, Agendamentos, Dentistas, CalendarService, APP) {

		var agendamentos = [];

		var estaExibindoEvento = false;
		$scope.$on('$ionicView.enter', function (e) {
			if ($scope.start && $scope.end) {
				buscarNoPeriodo($scope.start, $scope.end);
				// $scope.$broadcast('eventSourceChanged', $scope.calendar.eventSource);
			}
		});

		var buscarNoPeriodo = function (start, end) {

			// Ajusta para -1 dia, pois não deve trazer o último dia
			// end.setDate(end.getDate() - 1);
			$ionicLoading.show({
				template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Aguarde...'
			});
			Agendamentos.buscarNoPeriodo(start, end).then(
				function (response) {
					var agendamentos = response.data;
					$ionicLoading.hide();
					var _agendamentos = Agendamentos.converterAgendamentos(agendamentos);
					$scope.calendar.eventSource = _agendamentos;
					$scope.$broadcast('eventSourceChanged', _agendamentos);

					$scope.start = start;
					$scope.end = end;

				}, function (error) {
					$ionicLoading.hide();
				});
		};

		var calendar = {
			mode: 'month',
			step: APP.stepMinutes,
			eventSource: agendamentos,
			currentDate: new Date(),
			queryMode: 'remote'
		};

		$scope.cancelarConsulta = function (agendamento) {
			$ionicPopup.confirm({
				title: 'Confirmação',
				template: 'Deseja cancelar essa consulta?'
			}).then(function (res) {
				if (res) {
					agendamento.fgSituacaoConsultaEnum = 2;
					$ionicLoading.show({
						template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Aguarde...'
					});
					Agendamentos.salvar(Agendamentos).then(
						function (response) {
							$ionicLoading.hide();
							$ionicPopup.show({ message: 'Consulta cancelada!' });
							$ionicHistory.goBack();
						},
						function (error) {
							$ionicLoading.hide();
						}
					);
				}
			});
		};

		$scope.viewTitle = 'Agendamentos';

		$scope.novoAgendamento = function (dataNovoAgendamento) {
			CalendarService.dataCalendario = dataNovoAgendamento;
			$log.log('novoAgendamento called');
			$state.go('tab.novoagendamento');//, {dataAgendamento: $scope.calendar.currentDate});
		};

		$scope.changeMode = function (mode) {
			$scope.calendar.mode = mode;
		};
		$scope.currentMode = function (mode) {
			return $scope.calendar.mode == mode;
		};
		$scope.onViewTitleChanged = function (title) {
			$scope.viewTitle = title;
		};

		// Events
		$scope.onEventSelected = function (event) {
			estaExibindoEvento = true;
			$timeout(function () {
				estaExibindoEvento = false;
			}, 2000);
			// $log.log('Event: onEventSelected:' + event.startTime + '-' + event.endTime + ',' + event.title);
			// eventSelected = true;
			$state.go('tab.editaragendamento', { agendamentoId: event.id });

		};
		$scope.onTimeSelected = function (selectedTime) {
			if (!estaExibindoEvento) {
				// $log.log('Event: onTimeSelected: ' + selectedTime);
				//  $scope.calendar.currentDate = selectedTime;
				if (calendar.mode !== 'month') {
					$scope.novoAgendamento(selectedTime);
				}
			}
		};
		$scope.rangeChanged = buscarNoPeriodo;

		// Today checks
		$scope.today = function () {
			$scope.calendar.currentDate = new Date();
		};
		$scope.isToday = function () {
			var today = new Date();
			var currentCalendarDate = new Date($scope.calendar.currentDate);
			today.setHours(0, 0, 0, 0);
			currentCalendarDate.setHours(0, 0, 0, 0);
			return today.getTime() === currentCalendarDate.getTime();
		};


		$scope.calendar = calendar;

		var _tempDateInicial = new Date();
		_tempDateInicial.setDate(1);
		var _tempDateFinal = new Date();
		_tempDateFinal.setDate(31);

		// buscarNoPeriodo(_tempDateInicial, _tempDateFinal);

	})

	.controller('AccountCtrl', function ($scope, $ionicLoading, $ionicPopup, $log, $stateParams, $ionicHistory, UsuarioService) {

		$scope.usuario = {};
		$scope.alterarSenha = false;

		function buscarUsuario() {
			$ionicLoading.show({
				template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Aguarde...'
			});
			UsuarioService.buscarUsuarioLogado().then(
				function (response) {
					$scope.usuario = response.data;
					$ionicLoading.hide();
				}, function (error) {
					$log(error.data.message);
					$ionicLoading.hide();
				}
			);
		};

		function clearPasswordFields() {
			$scope.alterarSenha = false;
			$scope.usuario.senha = undefined;
			$scope.usuario.confirmacaoSenha = undefined;
		};

		buscarUsuario();

		$scope.salvar = function (usuario) {
			$ionicLoading.show({
				template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Aguarde...'
			});
			UsuarioService.salvar(usuario).then(
				function (response) {
					$ionicHistory.goBack();
					$ionicPopup.alert({
						template: 'Usuário alterado!',
						buttons: [{
							text: 'Ok', type: 'button-balanced', onTap: function (e) {

							}
						}]
					});
					$ionicLoading.hide();
				}, function (error) {
					$ionicLoading.hide();
				});
		};

		var changePassword = function (usuario) {

			if (!usuario.senhaAtual) {
				$ionicPopup.alert({ template: 'Informe a senha atual' });
				return;
			}

			if (!usuario.senha || !usuario.confirmacaoSenha) {
				$ionicPopup.alert({ template: 'Informe a nova senha e a confirmação' });
				return;
			}

			if (usuario.senha !== usuario.confirmacaoSenha) {
				$ionicPopup.alert({ template: 'A senha e a confirmação não são iguais!' });
				return;
			}

			$ionicLoading.show({
				template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Aguarde...'
			});

			var alteracaoSenha = {
				login: usuario.login,
				senhaAtual: $scope.usuario.senhaAtual,
				novaSenha: $scope.usuario.senha
			};

			UsuarioService.alterarSenha(alteracaoSenha).then(
				function (response) {
					$scope.usuario.senhaAtual = undefined;
					$ionicLoading.hide();
					$ionicPopup.alert({
						template: 'Senha alterada com sucesso!',
						buttons: [{
							text: 'Ok',
							type: 'button-balanced',
							onTap: function () {
								clearPasswordFields();
							}
						}]
					});
				}, function (error) {
					$ionicLoading.hide();
					$ionicPopup.alert({
						title: 'Erro', template: error.data.message,
						buttons: [{
							text: 'Ok',
							type: 'button-balanced'
						}]
					});
				});
		};
		$scope.changePassword = changePassword;

		$scope.cancelPasswordChange = function () {
			$scope.alterarSenha = false;
			clearPasswordFields();
		};

		$scope.togglePasswordChange = function () {
			$scope.alterarSenha = !$scope.alterarSenha;
		};

	})

	.controller('PacientesCtrl', function ($scope, $log, $stateParams, Pacientes, $ionicActionSheet, $ionicPopup, $state) {

		$scope.listaCarregadaSemErros = false;
		$scope.listaCarregadaComErros = false;

		$scope.$on('$ionicView.enter', function (e) {
			carregarPacientes();
		});


		function novoPaciente() {
			$state.go('tab.novopaciente');
		};
		$scope.novo = novoPaciente;

		function carregarPacientes() {
			$scope.listaCarregadaSemErros = false;
			$scope.listaCarregadaComErros = false;
			$scope.pacientes = [];
			Pacientes.todos().then(
				function (response) {
					$scope.pacientes = response.data;
					$scope.listaCarregadaSemErros = true;
					$scope.$broadcast('scroll.refreshComplete');
				},
				function (error) {
					$scope.$broadcast('scroll.refreshComplete');
					$scope.listaCarregadaComErros = true;
					$log.error(error);
					$scope.mensagemErro = 'Não foi possível carregar os pacientes';
				});
		};
		$scope.loadData = carregarPacientes;

		$scope.refreshData = function () {
			carregarPacientes();
		};

		$scope.pacienteHold = function (paciente) {
			$scope.actionSheet = $ionicActionSheet.show({
				buttons: [
					// {text: 'Ver histórico'}, 
					// {text: 'Agendar Consulta'}
				],
				destructiveText: 'Excluir ' + paciente.nome,
				destructiveButtonClicked: function () {
					Pacientes.excluir(paciente.id).then(
						function () {
							// $log.log('Exclusão funcionou.');
							carregarPacientes();
							$ionicPopup.show({
								template: 'Paciente excluído!',
								buttons: [{
									text: 'Ok',
									type: 'button-balanced'
								}]
							});
						}, function (error) {
							$ionicPopup.alert({
								title: 'Erro',
								template: error.data.message,
								buttons: [{
									text: 'Ok',
									type: 'button-balanced',
								}]

							});
							// $log.log('Exclusão falhou.');
						});
					return true;
				},

				// titleText: paciente.nome,
				cancelText: 'Cancelar',
				cancel: function () {
					// $log.log('Botão Cancelar pressionado.');
				},
				buttonClicked: function (index) {
					// console.log("Botão clicado: " + index);
					return true;
				}
			});
		};

	})

	.controller('LoginCtrl', function ($scope, $state, $ionicPopup, $ionicLoading, $timeout, LoginService, AuthService) {

		$scope.$on('$ionicView.enter', function (e) {
			$scope.login = {};
		});

		$scope.hasError = false;

		// var isLogging = false;

		$scope.entrar = function (data) {

			// if (!isLogging) {
			clearErrorMessage();
			if (data.usuario && data.senha) {
				// isLogging = true;
				$ionicLoading.show({
					template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Aguarde...'
				});

				AuthService.entrar(data.usuario, data.senha).then(
					function (authenticated) {
						// isLogging = false;
						$state.go('tab.home', {}, {
							reload: true
						});
						$ionicLoading.hide();
					},
					function (errorStatus) {
						// isLogging = false;
						$ionicLoading.hide();
						if (errorStatus == 401) {
							showErrorMessage('Usuário ou senha incorretos');
						} else {
							showErrorMessage('Erro ao realizar o login');
						}
					}
				);
			} else {
				showErrorMessage('Informe os dados para entrar');
			}
			// }
		};

		function showErrorMessage(message) {
			$ionicPopup.alert({
				title: 'Erro de Login',
				template: message,
				buttons: [{
					text: 'OK',
					type: 'button-balanced',
				}]
			});
		}

		var clearErrorMessage = function () {
			if ($scope.hasError) {
				$scope.hasError = false;
			}
		};
		$scope.clearErrorMessage = clearErrorMessage;

		$scope.esqueciSenha = function () {
			$ionicPopup.alert({
				title: 'Recuperação de Senha',
				template: 'Entre em contato com o suporte, pelo e-mail <a href="mailto:lucasdamaral@hotmail.com">lucas@easydent.com.br</a>',
				buttons: [{ type: 'button-balanced', text: 'Ok' }]
			});
		};

	})

	.controller('EsqueciSenhaCtrl', function ($state) {

		return {

		};

	})

	.controller('PacienteDetailCtrl', function ($scope, $stateParams, $ionicPopup, Pacientes, $ionicLoading, $ionicHistory, $state) {

		$scope.paciente = {};
		if ($stateParams.pacienteId) {
			$scope.nomePaciente = ' ';
			$ionicLoading.show({
				template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Aguarde...'
			});
			Pacientes.buscar($stateParams.pacienteId).success(function (response) {
				$scope.paciente = response;
				$scope.nomePaciente = 'Editar Paciente';
				$scope.paciente.dataNascimento = new Date(response.dataNascimento);
				$ionicLoading.hide();
			});
		} else {
			$scope.nomePaciente = 'Novo Paciente';
		}

		$scope.salvar = function () {

			var paciente = $scope.paciente;

			if (!paciente.nome) {
				$ionicPopup.show({
					template: 'Informe todos os campos necessários para criar um paciente!',
					buttons: [{
						text: 'Ok',
						type: 'button-balanced'
					}]
				});
				return;
			}

			// $log.log("SALVAR PACIENTE")
			$ionicLoading.show({
				template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Aguarde...'
			});
			var mensagem = paciente.id ? 'Paciente alterado' : 'Paciente cadastrado';
			Pacientes.salvar($scope.paciente).then(
				function (response) {
					// $log.log("Salvo com sucesso.");
					$ionicLoading.hide();
					$ionicPopup.show({
						template: mensagem,
						buttons: [{
							text: 'Ok',
							type: 'button-balanced',
							onTap: function (e) {
								$ionicHistory.goBack();
							}
						}]
					});
				},
				function (error) {
					// $log.log("Erro ao salvar.");
					$ionicLoading.hide();
				});
		};

	})

	.controller('DentistasCtrl', function ($scope, $log, $ionicPopup, $stateParams, Dentistas, $ionicActionSheet, $state) {

		$scope.listaCarregadaSemErros = false;
		$scope.listaCarregadaComErros = false;
		$scope.listaDentistas = [];
		$scope.mensagemErro = undefined;

		$scope.$on('$ionicView.enter', function (e) {
			carregarDentistas();
		});

		function carregarDentistas() {
			$scope.listaCarregadaSemErros = false;
			$scope.listaCarregadaComErros = false;
			$scope.listaDentistas = [];
			Dentistas.todos().then(
				function (response) {
					$scope.mensagemErro = undefined;
					$scope.listaDentistas = response.data;
					$scope.listaCarregadaSemErros = true;
					$scope.$broadcast('scroll.refreshComplete');
				}, function (error) {
					$scope.mensagemErro = 'Não foi possível carregar os dentistas';
					$scope.listaCarregadaComErros = true;
					$scope.$broadcast('scroll.refreshComplete');
				});

		};
		$scope.carregarDentistas = carregarDentistas;

		function exibirMenu(dentista) {
			$ionicActionSheet.show({
				buttons: [
					// { text: "Editar Dentista" },
				],
				destructiveText: 'Excluir Dentista',
				titleText: dentista.nome,
				cancelText: 'Cancelar',
				cancel: function () {
					// your code goes here
				},
				buttonClicked: function (index) {
					return true;
				},
				destructiveButtonClicked: function () {
					Dentistas.excluir(dentista.id).then(
						function () {
							$ionicPopup.show({
								template: 'Dentista excluído!',
								buttons: [{
									text: 'Ok',
									type: 'button-balanced'
								}]
							});
							carregarDentistas();
							// $log.log('Exclusão do dentista [' + dentista.nome + ']');
						},
						function (error) {
							$ionicPopup.show({
								title: 'Erro',
								template: error.data.message,
								buttons: [{
									text: 'Ok',
									type: 'button-balanced'
								}]
							});
						});
					return true;

				}
			});
		};
		$scope.exibirMenu = exibirMenu;

		function novo() {
			$state.go('tab.novodentista');
		};
		$scope.novo = novo;

	})

	.controller('DentistaCtrl', function ($scope, $log, $ionicPopup, $stateParams, $state, $ionicLoading, $ionicHistory, ionicTimePicker, Dentistas) {

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
				template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Aguarde...'
			});
			Dentistas.buscar($stateParams.dentistaId).then(
				function (response) {
					$scope.dentista = response.data;
					$ionicLoading.hide();
				},
				function (error) {
					// $log.error(error);
					$ionicLoading.hide();
				});
		}

		function salvar(dentista) {

			if (!dentista.cro
				|| !dentista.estadoCRO
				|| !dentista.nome) {
				$ionicPopup.show({
					template: 'Informe todos os campos necessários para cadastrar o dentista',
					buttons: [{
						text: 'Ok',
						type: 'button-balanced'
					}]
				});
				return;
			}

			$ionicLoading.show({
				template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Aguarde...'
			});
			Dentistas.salvar(dentista).then(
				function (response) {
					$ionicLoading.hide();
					$ionicHistory.goBack();
				},
				function (error) {
					$ionicLoading.hide();
					// $log.error(error);
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
		// 	$log.log('Carregando horários do dia ' + diaSemana);
		// 	var horarios = $scope.dentista.horarios;
		// 	for (var i = 1; i < 8; i++) {
		// 		if (horarios[i] && horarios[i].fgDiaSemana === i) {
		// 			$scope.horario = horarios[i];
		// 		}
		// 	}
		// 	if (!$scope.horario) {
		// 		$log.log('Não há horário. Utilizado horário padrão.');
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
		//   				$log.error('erro na seleção da data')
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
		//   				$log.error('erro na seleção da data')
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
		//   				$log.error('erro na seleção da data')
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
		//   				$log.error('erro na seleção da data')
		//   			}
		//   		},
		//   		inputTime: ((currentTime.getHours()) * 60 * 60) + (currentTime.getMinutes() * 60), 
		//   		// inputTime: ((currentTime.getHours() - 1) * 60 * 60) + (currentTime.getMinutes() * 60), 
		//   	});
		// };
		// $scope.selectTimeHoraFinal = selectTimeHoraFinal;

	})

	.controller('ConsultasCtrl', function ($scope, $stateParams, Consultas) {
		$ionicLoading.show({
			template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Aguarde...'
		});
		Consultas.todas().success(function (response) {
			$scope.consultas = response;
			$ionicLoading.hide();
		});
	})

	.controller('LaboratoriosCtrl', function ($scope, $stateParams, $ionicActionSheet, $state, Laboratorios) {

		$scope.listaCarregadaSemErros = false;
		$scope.listaCarregadaComErros = false;
		$scope.listaLaboratorios = [];
		$scope.mensagemErro = undefined;

		$scope.$on('$ionicView.enter', function (e) {
			carregarLaboratorios();
		});

		function carregarLaboratorios() {
			$scope.listaCarregadaSemErros = false;
			$scope.listaCarregadaComErros = false;
			$scope.listaLaboratorios = [];
			Laboratorios.todos().then(
				function (response) {
					$scope.mensagemErro = undefined;
					$scope.listaLaboratorios = response.data;
					$scope.listaCarregadaSemErros = true;
					$scope.$broadcast('scroll.refreshComplete');
				}, function (error) {
					$scope.mensagemErro = 'Não foi possível carregar os dentistas';
					$scope.listaCarregadaComErros = true;
					$scope.$broadcast('scroll.refreshComplete');
				});

		};
		$scope.carregarLaboratorios = carregarLaboratorios;

		function exibirMenu(laboratorio) {
			$ionicActionSheet.show({
				buttons: [
					// { text: "Editar Dentista" },
				],
				destructiveText: 'Excluir Laboratório',
				titleText: laboratorio.nome,
				cancelText: 'Cancelar',
				cancel: function () {
					// your code goes here
				},
				buttonClicked: function (index) {
					return true;
				},
				destructiveButtonClicked: function () {
					Laboratorios.excluir(laboratorio.id).then(
						function () {
							carregarLaboratorios();
							// $log.log('Exclusão do laboratório [' + laboratorio.nome + ']');
						},
						function (error) {
							// $log.error(error);
						});
					return true;

				}
			});
		};
		$scope.exibirMenu = exibirMenu;

		function novo() {
			$state.go('tab.novolaboratorio');
		};
		$scope.novo = novo;

	})

	.controller('LaboratorioCtrl', function ($scope, $stateParams, $state, $ionicLoading, Laboratorios) {

		$scope.tiposLaboratorio = [
			{ id: 1, nome: 'Radiologia' },
			{ id: 2, nome: 'Prótese' },
		];

		$scope.laboratorio = {};
		if ($stateParams.laboratorioId) {
			$ionicLoading.show({
				template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Aguarde...'
			});
			Laboratorios.buscar($stateParams.laboratorioId).then(
				function (response) {
					$scope.laboratorio = response.data;
					$ionicLoading.hide();
				},
				function (error) {
					$ionicLoading.hide();
					// $log.error(error);
				});
		}

		function salvar(laboratorio) {
			$ionicLoading.show({
				template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Aguarde...'
			});
			Laboratorios.salvar(laboratorio).then(
				function (response) {
					$state.go('tab.laboratorios');
					$ionicLoading.hide();
				},
				function (error) {
					// $log.error(error);
					$ionicLoading.hide();
				});
		};
		$scope.salvar = salvar;

	})

	.controller('ConsultaCtrl', function ($scope, $stateParams, $ionicLoading, Agendamentos) {

		if (!$stateParams.consultaId) {
			$log.error('Não é possível detalhar uma consulta, sem o ID de agendamento');
		}

		function buscarConsulta(id) {
			$scope.consulta = undefined;
			$ionicLoading.show({
				template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Aguarde...'
			});
			Agendamentos.buscar(id).then(
				function (response) {
					$scope.consulta = response.data;
					$ionicLoading.hide();
				},
				function () {
					$ionicLoading.hide();
				});

		}
		buscarConsulta($stateParams.consultaId);


	})

	.controller('PendenciasCtrl', function ($scope, $stateParams, Pendencias) {
		Pendencias.todas().success(function (response) {
			$scope.pendencias = response;
		});
	})

	.controller('NavCtrl', function ($scope, $state) {

		$scope.toState = function (state) {
			$state.go(state);
		};

	})

	.controller('HomeCtrl', function ($scope, $state, $ionicPopup, $ionicHistory, Agendamentos, AuthService) {

		$scope.$on('$ionicView.enter', function (e) {
			carregarUltimosAgendamentos();
			carregarProximosAgendamentos();
			// $ionicHistory.clearHistory();
			$scope.username = AuthService.username();
			$scope.tokenValue = AuthService.token();
		});

		$scope.refreshData = function () {
			carregarUltimosAgendamentos(function () {
				carregarProximosAgendamentos(function () {
					$scope.$broadcast('scroll.refreshComplete');
				});
			});
		};

		$scope.showUltimasConsultas = true;
		$scope.toggleUltimasConsultas = function () {
			$scope.showUltimasConsultas = !$scope.showUltimasConsultas;
		};

		$scope.showProximasConsultas = true;
		$scope.toggleProximasConsultas = function () {
			$scope.showProximasConsultas = !$scope.showProximasConsultas;
		};

		function carregarUltimosAgendamentos(callback) {
			$scope.carregouUltimosAgendamentos = false;
			$scope.ultimosAgendamentos = [];
			Agendamentos.ultimos(5).then(
				function (response) {
					$scope.ultimosAgendamentos = response.data;
					$scope.carregouUltimosAgendamentos = true;
					if (callback)
						callback();
				}, function (error) {
					// $ionicPopup.alert({
					// 	title: 'Erro',
					// 	template: 'Não foi possível carregar os últimos agendamentos :( \n Tente novamente mais tarde!'
					// })

				});
		}

		function carregarProximosAgendamentos(callback) {
			$scope.carregouAgendamentos = false;
			$scope.proximosAgendamentos = [];
			Agendamentos.proximos(5).then(
				function (response) {
					$scope.proximosAgendamentos = response.data;
					$scope.carregouAgendamentos = true;
					if (callback)
						callback();
				},
				function (error) {
					// $ionicPopup.alert({
					// 	title: 'Erro',
					// 	template: 'Não foi possível carregar os próximos agendamentos :( \n Tente novamente mais tarde!'
					// })
				}
			);
		}

		$scope.toLocaleDate = function (e) {
			e.dataString = new Date(e.data).toLocaleDateString();
			e.dataFinal = new Date(e.data + (e.duracaoMinutos * 60000));
			return e;
		};

		$scope.confirmarComparecimento = function (agendamento) {
			$ionicPopup.confirm({
				title: 'Comparecimento',
				template: 'O paciente ' + agendamento.paciente.nome + ' compareceu à consulta?',
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

		$scope.confirmarAusencia = function (agendamento) {

		};

		// carregarProximosAgendamentos();
		// carregarUltimosAgendamentos();

	})

	;