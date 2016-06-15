angular.module('easydent')

.constant('AUTH_EVENTS', {
	notAuthenticated: 'auth-not-authenticated',
	notAuthorized: 'auth-not-authorized'
})

.constant('SERVER', {
	// url: 'http://localhost:8080/easydent-server/rest',
	url: 'https://easydent-test.underjelastic.com.br/easydent-server/rest',
})
