"use strict";

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('easydent', ['ionic', 'easydent.controllers', 'easydent.services', 'easydent.directives', 'ui.rCalendar'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  $ionicConfigProvider.backButton.text('Voltar');
  // $ionicConfigProvider.tabs.style('striped').position('bottom');
  $ionicConfigProvider.tabs.style('standard').position('bottom');
  $ionicConfigProvider.navBar.alignTitle('center');
  $ionicConfigProvider.spinner.icon('dots');
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.pacientes', {
    url: '/pacientes',
    views: {
      'tab-pacientes': {
        templateUrl: 'templates/tabs/pacientes.html',
        controller: 'PacientesCtrl'
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

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/default/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.chats', {
    url: '/chats',
    views: {
      'tab-chats': {
        templateUrl: 'templates/default/tab-chats.html',
        controller: 'ChatsCtrl'
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

  .state('tab.chat-detail', {
    url: '/chats/:chatId',
    views: {
      'tab-chats': {
        templateUrl: 'templates/default/chat-detail.html',
        controller: 'ChatDetailCtrl'
      }
    }
  })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/default/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');

})

.constant('SERVER', {
  url: 'https://easydent.jelasticlw.com.br/easydent-webservice'
});
