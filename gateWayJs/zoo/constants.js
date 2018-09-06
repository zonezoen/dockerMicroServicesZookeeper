"use strict";

function define(name, value) {
    Object.defineProperty(exports, name, {
        value: value,
        enumerable: true
    });
}

define('ZK_HOSTS', '192.168.43.136:2181,192.168.43.136:2182,192.168.43.136:2183');
define('SERVICE_ROOT_PATH', '/services');
define('ROUTE_KEY', 'services');
define('SERVICE_NAME', 'service_name');
define('API_NAME', 'api_name');