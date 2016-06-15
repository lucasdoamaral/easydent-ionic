
angular.module('easydent.controllers', [])

.controller('AppCtrl', function($scope, $state, $ionicPopup, AuthService, AUTH_EVENTS) {

  $scope.username = AuthService.username();

  $scope.teste = "TESTE APP CTRL";

  $scope.$on(AUTH_EVENTS.notAuthorized, function(event) {
    var alertPopup = $ionicPopup.alert({
      title: 'Unauthorized!',
      template: 'You are not allowed to access this resource.'
    });
  });

  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    $state.go('login');
    var alertPopup = $ionicPopup.alert({
      title: 'Sessão Expirada',
      template: 'Faça o login novamente'
    });
  });

  $scope.setCurrentUsername = function(name) {
    $scope.username = name;
  };

})

.controller('AgendamentosCtrl', function($scope, Agendamentos) {

  $scope.calendar = {
    mode: "month",
    agendamentos: [],
    step: 15,
    allDayLabel: "Lembrete",
    noEventsLabel: "Sem eventos",
    data: new Date()
  };

  Agendamentos.todos().success(function(response) {
    $scope.calendar.agendamentos = Agendamentos.converterAgendamentos(response);
  });

  $scope.changeMode = function(mode) {
    $scope.calendar.mode = mode;
  }

  $scope.hoje = function () {
    $scope.calendar.data = new Date();
  }

})

.controller('PacientesCtrl', function($scope, $stateParams, Pacientes, $ionicLoading, $ionicActionSheet, $ionicPopup) {

  $scope.listaCarregada = false;

  $scope.loadData = function() {
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
        }else{
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

.controller('LoginCtrl', function($scope, $state, $ionicPopup, AuthService) {

  $scope.login = {};

  $scope.entrar = function(data) {
    if (data.usuario && data.senha){
      AuthService.entrar(data.usuario, data.senha).then(
        function(authenticated) {
          $state.go('tab.home', {}, {reload: true});
        }, function(err) {
          $ionicPopup.alert({
            title: 'Login failed!',
            template: 'Please check your credentials!'
          });
        });
    }
  };
})
.controller('EsqueciSenhaCtrl', function ($state) {

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

  $scope.sair = function () {
    AuthService.logout();
    $state.go('login');
  }

})

;
