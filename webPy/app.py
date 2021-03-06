import consul
from flask import Flask, render_template, request
import socket
import requests
import json

app = Flask(__name__)


# @app.route('/upload', methods=['POST', 'GET'])
# def upload():
#     if request.method == 'POST':
#         print(request.form['name'])
#         return render_template('index.html', name="POST you post ")
#     elif request.method == 'GET':
#         # else:
#         return render_template('index.html', name="GET you post ")


@app.route('/')
def a():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    finally:
        s.close()
    return "hello zone ！aaaa ==> " + ip


@app.route('/index')
def index():
    c = consul.Consul(host='consulserver')

    # poll a key for updates

    print("===========")
    # print(c.agent.services())
    print(c.catalog.service("service-web"))
    print(c.catalog.service("service-web-py"))
    (index, data) = c.catalog.service("service-web")
    host = str(data[0]["ServiceAddress"]) + ":" + str(data[0]["ServicePort"])
    print("==========="+host)
    r = requests.get('http://'+host)
    return r.text


if __name__ == '__main__':
    app.run(host='0.0.0.0')
#    app.run(host='0.0.0.0', debug=True)
