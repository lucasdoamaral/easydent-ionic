"use strict";

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('easydent', ['ionic',
  'easydent.controllers', 'easydent.services', 'easydent.directives',
  'ui.rCalendar', 'ui.mask', 'ngMessages'])

.run(function($ionicPlatform, $rootScope, AuthService) {

  // Verificações para ajustes visuais do teclado e barra de status
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  })

})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  $ionicConfigProvider.backButton.text('Voltar');
  // $ionicConfigProvider.tabs.style('striped').position('bottom');
  //$ionicConfigProvider.tabs.style('standard').position('bottom');
  //$ionicConfigProvider.navBar.alignTitle('center');
  //$ionicConfigProvider.spinner.icon('dots');
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
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
    templateUrl: 'templates/login/signup.html'
  })

  .state('esqueci-senha', {
    url: '/esqueci-senha',
    templateUrl: 'templates/esqueci-senha.html',
  })

  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

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
    },
    data: {
      requiresLogin: true
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

  .state('tab.laboratorios', {
    url: '/laboratorios',
    views: {
      'tab-laboratorios': {
        templateUrl: 'templates/tabs/laboratorios.html',
        controller: 'LaboratoriosCtrl'
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

  .state('tab.dentistas', {
    url: '/dentistas',
    views: {
      'tab-dentistas': {
        templateUrl: 'templates/tabs/dentistas.html',
        controller: 'DentistasCtrl'
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

  .state('tab.paciente-new', {
    url: '/paciente-new',
    views: {
      'tab-pacientes': {
        templateUrl: 'templates/detail/paciente.html',
        controller: 'PacienteDetailCtrl'
      }
    }
  })

  ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/home');

})

.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) {
      //response.status = response.status == -1? 401:response.status;
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
        403: AUTH_EVENTS.notAuthorized
      }[response.status], response);
      return $q.reject(response);
    }
  };
})

.config(function ($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
})

.run(function ($rootScope, $state, AuthService, AUTH_EVENTS) {
  $rootScope.$on('$stateChangeStart', function (event,next, nextParams, fromState) {

    if ('data' in next && 'authorizedRoles' in next.data) {
      var authorizedRoles = next.data.authorizedRoles;
      if (!AuthService.isAuthorized(authorizedRoles)) {
        event.preventDefault();
        $state.go($state.current, {}, {reload: true});
        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
      }
    }

    if (!AuthService.isAuthenticated()) {
      if (next.name !== 'login' && next.name !== 'signup') {
        event.preventDefault();
        $state.go('login');
      }
    }
  });
})
