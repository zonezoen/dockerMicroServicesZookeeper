var zookeeper = require('node-zookeeper-client');
var cache = {};
var CONNECTION_STRING = '127.0.0.1:2181,127.0.0.1:2182,127.0.0.1:2183';
var REGISTRY_ROOT = '/services';
//Path:/services/service-gateway-js/127.0.0.1:3000
//连接zookeeper
var zk = zookeeper.createClient(CONNECTION_STRING);
zk.connect();

//获取服务名称
var serviceName = 'web-service';

console.log('ServiceName:%s', serviceName);
if (!serviceName) {
    console.log('Service-Name request header is not exist');
    res.end();
    return;
}
//获取服务路径
var servicePath = REGISTRY_ROOT + "/" + serviceName;
console.log('ServicePath:%s', servicePath);
console.log('cache[serviceName]:' + JSON.stringify(cache));
if (cache[serviceName]) {
    //if(false){
    //TODO
    /*zk.exists(servicePath, function (event) {
        if (event.NODE_DELETED) {
            cache = {};
        }
    }, function (error, stat) {
        if (stat) {

        }
    })*/
    console.log("-----------cache---------------" + cache[serviceName]);

}
else {

    //获取服务路径下的地址节点
    zk.getChildren(servicePath, function (error, addressNodes) {
        if (error) {
            console.log(error.stack);
            res.end();
            return;
        }
        var size = addressNodes.length;
        if (size == 0) {
            console.log('address node is not exist');
            res.end();
            return;
        }
        //生成地址容器
        var addressPath = servicePath + "/";
        if (size == 1) {
            //若只有唯一地址，则获取该地址
            addressPath += addressNodes[0];
        } else {
            //若存在多个地址，则随机获取一个地址
            addressPath += addressNodes[parseInt(Math.random() * size)];
        }
        console.log('addressPath:%s', addressPath);
        //获取服务地址
        zk.getData(addressPath, function (err, serviceAddress) {
            if (error) {
                console.log(error.stack);
                res.end();
                return;
            }
            console.log('serviceAddress:%s', serviceAddress);
            if (!serviceAddress) {
                console.log('serviceAddress is not exist');
                res.end();
                return;
            }

            cache[serviceName] = serviceAddress;
            console.log("cache" + serviceName + ": " + cache[serviceName]);

            //执行反向代理
        });

    });
}
