'use strict';

angular.module('easydent', ['ionic',
  'easydent.controllers', 'easydent.services', 'easydent.directives',
  'ui.rCalendar', 'ui.mask', 'ngMessages', 'ngLocale', 'angular.filter', 'ionic-datepicker', 'ionic-timepicker'
  ])

.run(function($ionicPlatform, $rootScope, $ionicPopup, AuthService, $http) {

  // Verificações para ajustes visuais do teclado e barra de status
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }

    window.addEventListener('native.keyboardshow', function() {
      document.body.classList.add('keyboard-open');
    });
    // if(window.Connection) {
    //   console.log(navigator.connection.type);
    //   if(navigator.connection.type == Connection.NONE) {
    //     $ionicPopup.confirm({
    //       title: "Internet Disconnected",
    //       content: "The internet is disconnected on your device."
    //     })
    //     .then(function(result) {
    //       if(!result) {
    //         ionic.Platform.exitApp();
    //       }
    //     });
    //   }
    // }

    // $http.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';

  });

})

.config(function (ionicDatePickerProvider, ionicTimePickerProvider) {

  var datePickerObj = {
    inputDate: new Date(),
    setLabel: 'Ok',
    todayLabel: 'Hoje',
    closeLabel: 'Fechar',
    mondayFirst: false,
    weeksList: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
    monthsList: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    templateType: 'popup',
    // from: new Date(2016, 1, 1),
    // to: new Date(2018, 8, 1),
    showTodayButton: false,
    dateFormat: 'dd MMMM yyyy',
    closeOnSelect: true
    // disableWeekdays: [6]
  };
  ionicDatePickerProvider.configDatePicker(datePickerObj);

  var timePickerObj = {
    inputTime: (((new Date()).getHours() * 60 * 60) + ((new Date()).getMinutes() * 60)),
    format: 24,
    step: 15,
    setLabel: 'Ok',
    closeLabel: 'Fechar'
  };
  ionicTimePickerProvider.configTimePicker(timePickerObj);

})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  $ionicConfigProvider.backButton.text('Voltar');
  $ionicConfigProvider.tabs.style('standard').position('bottom');
  $ionicConfigProvider.navBar.alignTitle('center');
  // $ionicConfigProvider.tabs.style('striped').position('bottom');
  // $ionicConfigProvider.spinner.icon('dots');

  // $ionicConfigProvider.scrolling.jsScrolling(false);
  // Or for only a single platform, use
  if (ionic.Platform.isAndroid()) {
    $ionicConfigProvider.scrolling.jsScrolling(false);
  }

  $stateProvider

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login/login.html',
    controller: 'LoginCtrl'
  })

  .state('welcome', {
    url: '/welcome',
    templateUrl: 'templates/welcome.html'
  })

  .state('signup', {
    url: '/signup',
    templateUrl: 'templates/login/signup.html',
    controller: 'SignupCtrl'
  })

  .state('esqueci-senha', {
    url: '/esqueci-senha',
    templateUrl: 'templates/esqueci-senha.html'
  })

  .state('tab', {
    url: '/tab',
    params: { reload: false },
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  .state('tab.home', {
    url: '/home',
    views: {
      'tab-home': {
        templateUrl: 'templates/tabs/home.html',
        controller: 'HomeCtrl'
      }
    }
  })

  .state('tab.pacientes', {
    url: '/pacientes',
    views: {
      'tab-pacientes': {
        templateUrl: 'templates/tabs/pacientes.html',
        controller: 'PacientesCtrl'
      }
    }
  })

  .state('tab.dentistas', {
    url: '/dentistas',
    views: {
      'tab-configuracoes': {
       templateUrl: 'templates/tabs/dentistas.html',
       controller: 'DentistasCtrl'
     }
   }
 })

  .state('tab.laboratorios', {
    url: '/laboratorios',
    views: {
      'tab-configuracoes': {
        templateUrl: 'templates/tabs/laboratorios.html',
        controller: 'LaboratoriosCtrl'
      }
    }
  })

  .state('tab.novodentista', {
    url: '/dentistas/novo',

    views: {
      'tab-configuracoes': {
       templateUrl: 'templates/detail/dentista.html',
       controller: 'DentistaCtrl'
     }
   }
 })

  .state('tab.editardentista', {
    url: '/dentistas/edit/:dentistaId',
    // parent: 'tab.dentistas',
    views: {
      'tab-configuracoes': {
       templateUrl: 'templates/detail/dentista.html',
       controller: 'DentistaCtrl'
     }
   }
 })

  .state('tab.novolaboratorio', {
    url: '/laboratorios/novo',
    views: {
      'tab-configuracoes': {
       templateUrl: 'templates/detail/laboratorio.html',
       controller: 'LaboratorioCtrl'
     }
   }
 })

  .state('tab.editarlaboratorio', {
    url: '/laboratorios/edit/:laboratorioId',
    views: {
      'tab-configuracoes': {
       templateUrl: 'templates/detail/laboratorio.html',
       controller: 'LaboratorioCtrl'
     }
   }
 })

  .state('tab.novopaciente', {
    url: '/paciente-new',
    views: {
      'tab-pacientes': {
        templateUrl: 'templates/detail/paciente.html',
        controller: 'PacienteDetailCtrl'
      }
    }
  })

  .state('tab.paciente-detail', {
    url: '/pacientes/:pacienteId',
    views: {
      'tab-pacientes': {
        templateUrl: 'templates/detail/paciente.html',
        controller: 'PacienteDetailCtrl'
      }
    }
  })

  .state('tab.agendamentos', {
    url: '/agendamentos',
    views: {
      'tab-agendamentos': {
        templateUrl: 'templates/tabs/agendamentos.html',
        controller: 'AgendamentosCtrl'
      }
    }
  })

  .state('tab.configuracoes', {
    url: '/configuracoes',
    views: {
      'tab-configuracoes': {
        templateUrl: 'templates/tabs/configuracoes.html',
        controller: 'ConfiguracoesCtrl'
      }
    }
  })

  .state('tab.novoagendamento', {
    url: '/novo-agendamento',
    views: {
      'tab-agendamentos': {
        templateUrl: 'templates/novo-agendamento.html',
        controller: 'NovoAgendamentoCtrl'
      }
    }
  })

  .state('tab.editaragendamento', {
    url: '/editar-agendamento/:agendamentoId',
    views: {
      'tab-agendamentos': {
        templateUrl: 'templates/detail/edit-agendamento.html',
        controller: 'EditAgendamentoCtrl'
      }
    }
  })

  .state('tab.pendencias', {
    url: '/pendencias',
    views: {
      'tab-pendencias': {
        templateUrl: 'templates/tabs/pendencias.html',
        controller: 'PendenciasCtrl'
      }
    }
  })

  .state('tab.atenderConsulta', {
    url: 'consulta/:consultaId',
    views: {
      'tab-home': {
        templateUrl: 'templates/detail/consulta.html',
        controller: 'ConsultaCtrl'
      }
    }
  })

  ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/home');

})

.factory('AuthInterceptor', function($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError(response) {
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
        403: AUTH_EVENTS.notAuthorized
      }[response.status], response);
      return $q.reject(response);
    }
  };
})

.config(function($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
  // $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
})

.run(function ($rootScope, $state, AuthService, AUTH_EVENTS) {
  $rootScope.$on('$stateChangeStart', function (event, next, nextParams, fromState) {

    if ('data' in next && 'authorizedRoles' in next.data) {
      var authorizedRoles = next.data.authorizedRoles;
      if (!AuthService.isAuthorized(authorizedRoles)) {
        event.preventDefault();
        // $state.go($state.current, {}, {reload: true});
        $state.go('login', {}, { reload: true });
        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
      }
    }else {
      console.warn('Permission not defined for state [' + next.name + ']');
    }

    if (!AuthService.isAuthenticated()) {
      if (next.name !== 'login' && next.name !== 'signup') {
        event.preventDefault();
        $state.go('login');
      }
    }
  });
})

;
