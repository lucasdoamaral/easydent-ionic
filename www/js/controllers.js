"use strict";

angular.module('easydent.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

.controller('AgendamentosCtrl', function($scope, Agendamentos) {

  $scope.agendamentos = [];
  Agendamentos.todos().success(function(response) {
    $scope.agendamentos = Agendamentos.converterAgendamentos(response);
  });

})

.controller('PacientesCtrl', function($scope, $stateParams, Pacientes, $ionicLoading, $ionicActionSheet) {

  $scope.loadData = function() {
    $scope.pacientes = [];
    $ionicLoading.show({
      template: '<ion-spinner class="spinner-positive"></ion-spinner><br />Aguarde'
    });
    Pacientes.todos().success(
      function(response) {
        $scope.pacientes = response;
        $scope.$broadcast('scroll.refreshComplete');
        $ionicLoading.hide()
      })
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

.controller('PacienteDetailCtrl', function($scope, $stateParams, Pacientes, $ionicLoading, $ionicHistory, $state) {

  $scope.paciente = {};
  if ($stateParams.pacienteId) {
    $ionicLoading.show({
      template: '<ion-spinner class="spinner-balanced"></ion-spinner><br />Aguarde'
    });
    Pacientes.buscar($stateParams.pacienteId).success(function(response) {
      $scope.paciente = response;
      $scope.paciente.dataNascimento = new Date(response.dataNascimento);
      $ionicLoading.hide();
    });
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

;
