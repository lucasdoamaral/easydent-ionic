angular.module('easydent.controllers', [])

.controller('AppCtrl', function($scope, $state, $ionicPopup, AuthService, AUTH_EVENTS) {

  $scope.username = AuthService.username();

  $scope.teste = "TESTE APP CTRL";

  $scope.$on(AUTH_EVENTS.notAuthorized, function(event) {
    var alertPopup = $ionicPopup.alert({
      title: 'Não Autorizado #HTTP403',
      template: 'Você não possu permissão para visualizar essa página!'
    });
  });

  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    $state.go('login');
    var alertPopup = $ionicPopup.alert({
      title: 'Sessão Expirada #HTTP403',
      template: 'Faça o login novamente'
    });
  });

  $scope.setCurrentUsername = function(name) {
    $scope.username = name;
  };

})

.controller('SignupCtrl', function($scope, UsuarioService, $state, $ionicPopup) {

  $scope.novoUsuario = {
    "fgTipoUsuario": 4,
  };
  $scope.novoEstabelecimento = {};

  $scope.criarUsuario = function(novoUsuario, novoEstabelecimento) {
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

})

.controller('NovoAgendamentoCtrl', function($scope, Agendamentos, Dentistas, Pacientes, CalendarService) {

  var dataAgendamento = CalendarService.dataCalendario;

  var listaDentistas = [];
  var listaPacientes = [];

  var agendamento = {
    dentista: undefined,
    paciente: undefined,
    data: dataAgendamento,
    duracaoMinutos: 30,
    diaCompleto: false,
    agenda: undefined,
  };

  $scope.novoAgendamento = agendamento; 

})

.controller('AgendamentosCtrl', function($scope, Agendamentos, Dentistas, CalendarService, $state) {

  var agendamentos = {};

  var calendar = {
    mode: 'month',
    step: 15,
    eventSource: agendamentos,
    currentDate: new Date(),
  };

  CalendarService.dataCalendario = calendar.currentDate;

  $scope.novoAgendamento = function() {
    console.log("novoAgendamento called");
    $state.go('tab.novoagendamento');
  }

  $scope.changeMode = function(mode) {
    $scope.calendar.mode = mode;
  };
  $scope.currentMode = function(mode) {
    return $scope.calendar.mode == mode;
  }
  $scope.onEventSelected = function(event) {
    console.log('Event selected:' + event.startTime + '-' + event.endTime + ',' + event.title);
  };
  $scope.onViewTitleChanged = function(title) {
    $scope.viewTitle = title;
  };
  $scope.today = function() {
    $scope.calendar.currentDate = new Date();
  };
  $scope.isToday = function() {
    var today = new Date(),
      currentCalendarDate = new Date($scope.calendar.currentDate);

    today.setHours(0, 0, 0, 0);
    currentCalendarDate.setHours(0, 0, 0, 0);
    return today.getTime() === currentCalendarDate.getTime();
  };

  $scope.onTimeSelected = function(selectedTime) {
    console.log('Selected time: ' + selectedTime);
  };

  $scope.calendar = calendar;

})

.controller('PacientesCtrl', function($scope, $stateParams, Pacientes, $ionicLoading, $ionicActionSheet, $ionicPopup, $state) {

  $scope.listaCarregada = false;

  $scope.novo = function() {
    $state.go('tab.novopaciente');
  }

  $scope.loadData = function() {
    $scope.listaCarregada = false;
    $scope.pacientes = [];
    $ionicLoading.show({
      template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Aguarde'
    });
    Pacientes.todos().then(
      function(response) {
        $scope.pacientes = response.data;
        $scope.listaCarregada = true;
        $scope.$broadcast('scroll.refreshComplete');
        $ionicLoading.hide()
      },
      function(error) {
        $scope.$broadcast('scroll.refreshComplete');
        $ionicLoading.hide()
        if (error.status == 401) {
          console.log('401 ERROR');
        } else {
          $scope.pacientes = [];
          $scope.listaCarregada = true;
          console.log("Houve um erro ao carregar os dados");
          $ionicPopup.alert({
            title: 'Erro de Conexão',
            template: 'Houve um problema ao carregar os pacientes'
          });
        }
      });
  }

  $scope.refreshData = function() {
    $scope.loadData();
  }

  $scope.$on('$ionicView.enter', function(e) {
    $scope.loadData();
  });

  $scope.pacienteHold = function(paciente) {
    $scope.actionSheet = $ionicActionSheet.show({
      buttons: [{
        text: 'Ver histórico'
      }, {
        text: 'Agendar Consulta'
      }],

      destructiveText: 'Excluir',
      destructiveButtonClicked: function() {
        Pacientes.excluir(paciente.id).then(
          function() {
            console.log("Exclusão funcionou.")
            $scope.loadData();
          },
          function() {
            console.log("Exclusão falhou.")
          });
        return true;
      },

      titleText: paciente.nome,
      cancelText: 'Cancelar',
      cancel: function() {
        console.log('Botão Cancelar pressionado.');
      },
      buttonClicked: function(index) {
        console.log("Botão clicado: " + index);
        return true;
      }
    });
  }

  $scope.hasMoreDate = function() {
    return temMaisRegistros;
  }

})

.controller('LoginCtrl', function($scope, $state, $ionicPopup, AuthService, $timeout, LoginService) {

  $scope.login = {};
  $scope.hasError = false;

  var isLogging = false;

  $scope.entrar = function(data) {
    if (!isLogging) {
      clearErrorMessage();
      if (data.usuario && data.senha) {
        isLogging = true;
        AuthService.entrar(data.usuario, data.senha).then(
          function(authenticated) {
            isLogging = false;
            $state.go('tab.home', {}, {
              reload: true
            });
          },
          function(errorStatus) {
            isLogging = false;
            if (errorStatus == 401) {
              showErrorMessage("Usuário ou senha incorretos");
            } else {
              showErrorMessage("Erro ao realizar o login");
            }
          }
        );
      } else {
        showErrorMessage("Informe o nome de usuário ou e-mail e a senha");
      }
    }
  };

  function showErrorMessage(message) {
    $scope.hasError = true;
    $scope.errorMessage = message;
    $timeout(function() {
      $scope.hasError = false;
      $scope.errorMessage = undefined;
    }, 5000);
  }

  var clearErrorMessage = function() {
    if ($scope.hasError) {
      $scope.hasError = false;
    }
  };
  $scope.clearErrorMessage = clearErrorMessage;

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
    console.log("SALVAR PACIENTE")
    Pacientes.salvar($scope.paciente).then(
      function() {
        console.log("Salvo com sucesso.");
        $state.go('tab.pacientes');
      },
      function() {
        console.log("Erro ao salvar.");
      })
  }

})

.controller('DentistasCtrl', function($scope, $stateParams, Dentistas) {
  Dentistas.todos().success(function(response) {
    $scope.dentistas = response;
  })
})

.controller('ConsultasCtrl', function($scope, $stateParams, Consultas) {
  Consultas.todas().success(function(response) {
    $scope.consultas = response;
  })
})

.controller('LaboratoriosCtrl', function($scope, $stateParams, Laboratorios) {
  Laboratorios.todos().success(function(response) {
    $scope.laboratorios = response;
  })
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

.controller('HomeCtrl', function($scope, AuthService, $state) {

  $scope.sair = function() {
    AuthService.logout();
    $state.go('login');
  }

})

;
