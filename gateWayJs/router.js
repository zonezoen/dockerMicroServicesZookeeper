const Router = require('koa-router');
const router = new Router();
// const discovery = require('./discovery').connect();
const request = require('superagent');
var thrift = require('thrift');
var UserService = require('./moudelUser/UserService');
var ttypes = require('./moudelUser/userServices_types');
var PostService = require('./moudelPost/PostService');
var PotstTypes = require('./moudelUser/userServices_types');
var zookeeper = require('node-zookeeper-client');
var cache = {};
var CONNECTION_STRING = '192.168.43.136:2181,192.168.43.136:2182,192.168.43.136:2183';
var REGISTRY_ROOT = '/services';
let cache2 = require("./zoo/local-storage")
var constants = require("./zoo/constants");


//连接zookeeper
var zk = zookeeper.createClient(CONNECTION_STRING);
zk.connect();


router.get('/service-web/', async (ctx, next) => {
    // const host = await getServiceHost('service-web');
    // const host = "";
    var serviceName = 'service-web';
    var servicePath = REGISTRY_ROOT + "/" + serviceName;
    console.log("===========================")
    console.log("===========================  " + constants.ROUTE_KEY + "    " + cache2.getItem(constants.ROUTE_KEY)[servicePath])
    let host = cache2.getItem(constants.ROUTE_KEY)[servicePath].pick()


    console.log(host)

    const fetchUrl = `http://${host}/`;
    const result = await request.get(fetchUrl);
    console.log(`getRemoteIp:${result.text}`);
    console.log("on nodejs client call registUser")

    // ctx.body = "registUser";
    ctx.body = result.text;
});

router.get('/user/regist/', async (ctx, next) => {
    // const host = await getServiceHost("user-services-py");
    // var serviceName = 'user-services-py';
    var serviceName = 'user-service-py';
    var servicePath = REGISTRY_ROOT + "/" + serviceName;
    let host = cache2.getItem(constants.ROUTE_KEY)[servicePath].pick()
    let hostArr = host.split(":");
    let ip = hostArr[0]
    let port = hostArr[1]


    const fetchUrl = `http://${host}/`;
    console.log("on nodejs client call registUser" +
        "")
    //
    var connection = thrift.createConnection(ip, port);
    connection.on("error", function (e) {
        console.log("=====")
        console.log(e);
    });
    var client = thrift.createClient(UserService, connection);
    client.registUser("zone", "123", "boy", "23", function (err, res) {
        if (err) {
            console.log(err);
            return
        }
        console.log("on nodejs client call registUser")
        console.log(res)
    })

    ctx.body = {"name": "zone"};
});

router.get('/test/', async (ctx, next) => {
    console.log("on nodejs client call registUser")
        var serviceName = 'post-services-js';
    var servicePath = REGISTRY_ROOT + "/" + serviceName;
    let host = cache2.getItem(constants.ROUTE_KEY)[servicePath].pick()
    let hostArr = host.split(":");
    let ip = hostArr[0]
    let port = hostArr[1]

    //127.0.0.1","PublicPort":32788
    // 192.168.0.107","PublicPort":32795
    var connection = thrift.createConnection(ip, port);
    var client = thrift.createClient(PostService, connection);

    connection.on("error", function (e) {
        console.log("=====")
        console.log(e);
    });

    client.addPost("title11", "这是一篇文章", "python/docker/js", function (err, res) {
        if (err) {
            console.log(err);
            return
        }
        console.log("aaa")
    })
    client.delPost("title11", function (err, res) {
        if (err) {
            console.log(err);
            return
        }
        console.log("bbb")
        console.log(res)

    })
    client.getPost("title11", function (err, res) {
        if (err) {
            console.log(err);
            return
        }
        console.log("on nodejs client call registUser")
        console.log(res)
    })

    ctx.body = "registUser";
});


async function getHostZoo(serviceName, servicePath) {
    let host2;
    if (cache[serviceName]) {
        console.log("-----------cache---------------" + cache[serviceName]);
        return cache[serviceName]
    } else {
        //获取服务路径下的地址节点
        var addressPath = servicePath + "/";
        var host;
        await zk.getChildren(servicePath, function (error, addressNodes) {
            if (error) {
                console.log(error.stack);
                return;
            }
            var size = addressNodes.length;
            if (size == 0) {
                console.log('节点不存在');
                return;
            }
            //生成地址容器

            console.log(addressNodes)
            if (size == 1) {
                console.log("当前只有一个节点")
                //若只有唯一地址，则获取该地址
                addressPath += addressNodes[0];
                console.log("节点 = > " + addressPath)
                console.log("节点 IP = > " + addressNodes[0])
                host = addressNodes[0]
                console.log("=====================" + host)

            } else {
                //若存在多个地址，则随机获取一个地址
                console.log("当前有多个节点")
                addressPath += addressNodes[parseInt(Math.random() * size)];
                host = addressNodes[parseInt(Math.random() * size)]
                console.log("=====================" + host)
            }
            console.log('addressPath:%s', addressPath);


        });

        //获取服务地址
        await zk.getData(servicePath, function (error, serviceAddress) {
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


        });
        host2 = host
    }
    console.log("======== aaa =============" + host)

    return host2

}


/**
 * 根据service name 获取 service 对应host
 */
// async function getServiceHost(name) {
//     const services = await discovery.getService({service: name});
//     // 获取随机数据
//     random = Math.floor(Math.random() * (services.length));
//     const host = services[random];
//     console.log(`service host ${services[random]}`)
//     return host;
// }

module.exports = router;