"use strict";

angular.module('easydent.directives', [])

.filter('tel', function() {
  return function(tel) {
    if (!tel) {
      return '';
    }

    var value = tel.toString().trim().replace(/^\+/, '');
    if (value.match(/[^0-9]/)) {
      return tel;
    }

    var codigoArea, digitoInicial, primeiroTrecho, segundoTrecho;
    switch (value.length) {
      case 11:
        return "(" + value.slice(0, 2) + ") " + value.slice(2, 3) + "-" + value.slice(3, 7) + "-" + value.slice(7, 11);
      case 10:
        return "(" + value.slice(0, 2) + ") " + value.slice(2, 6) + "-" + value.slice(6, 10);
      case 9:
        return value.slice(0, 1) + "-" + value.slice(1, 5) + "-" + value.slice(5, 9);
      case 8:
        return value.slice(0, 4) + "-" + value.slice(4, 8);
      default:
        return "*" + value + "*";
    }

  };
});


;
