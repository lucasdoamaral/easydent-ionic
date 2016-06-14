angular.module('easydent')

.constant('AUTH_EVENTS', {
	notAuthenticated: 'auth-not-authenticated',
	notAuthorized: 'auth-not-authorized'
})

.constant('SERVER', {
	url: 'http://easydent-test.underjelastic.com.br/easydent-server/rest'
})