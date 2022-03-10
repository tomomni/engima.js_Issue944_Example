const WebSocket = require('ws');
const enigma = require('enigma.js')

//change here to config for your local env if different from base QS Desktop install or to test with a different app/object
const qlik = {
    host: 'localhost',
    enginePort: 9076,
    userDir: null,
    user: null,
    app: 'EnigmaJS_Issue_944_Example.qvf',
    targetObjId: 'nBP'
}

const engimaConfig = {
    host: qlik.host,
    schema: require(`enigma.js/schemas/12.936.0`),
    port: qlik.enginePort,
    secure: true,
    suspendOnClose: false,
    url: (qlik.host==='localhost' ? 'ws://' : 'wss://')  + qlik.host + ':' + qlik.enginePort + '/app/' + qlik.app,
    createSocket: url => new WebSocket(url, {
      headers: {
        'X-Qlik-User': `UserDirectory=${encodeURIComponent(qlik.userDir)}; UserId=${encodeURIComponent(qlik.user)}`
      },
  })
};

//Connect to Qlik
const session = enigma.create(engimaConfig);

//open app, get first 10 rows & first 10 cols of data for specified object & log it to console.
session.open()
    .then((global)=>{
        console.log('QIX Session Opened')

        global.openDoc({qDocName:qlik.app})
            .then((app_session) => {
                console.log('App session opened')
                
                app_session.getObject(qlik.targetObjId)
                    .then((app_obj => {
                        app_obj.getHyperCubeData({
                            "qPath":'/qHyperCubeDef',
                            "qPages":[
                                {
                                    "qLeft": 0,
                                    "qTop": 0,
                                    "qWidth": 10,
                                    "qHeight": 10
                                }
                            ]
                        })
                        .then((data) => {
                            console.log(data[0].qMatrix)
                        })
                        .then(() => {
                            session.close()
                            console.log('QIX Session Closed')
                        })
                    }))
            })
    })
